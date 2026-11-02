const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const MonthlyBudget = require('../models/MonthlyBudget');
const AcademicFee = require('../models/AcademicFee');
const Goal = require('../models/Goal');
const { getISTMonthRange, getISTDayOfMonth } = require('../utils/dateUtils');
const { isAcademicFee } = require('../utils/feeClassifier');

const getDashboardSummary = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { month } = req.query;
    const { startOfMonth, startOfNextMonth, monthKey: currentMonthKey, year, month: monthNum } = getISTMonthRange(month);

    const dateFilter = { $gte: startOfMonth, $lt: startOfNextMonth };

    const [accounts, monthlyTransactions, budgetDoc, recentTransactions, academicFees, primaryGoal, ledgerDeltas] = await Promise.all([
      Account.find({ ownerId }).lean(),
      Transaction.find({ ownerId, date: dateFilter, isDeleted: { $ne: true } }).lean(),
      MonthlyBudget.findOne({ ownerId, monthKey: currentMonthKey }).lean(),
      Transaction.find({ ownerId, isDeleted: { $ne: true } }).sort({ date: -1, createdAt: -1 }).limit(6).lean(),
      AcademicFee.find({ ownerId }).lean(),
      Goal.findOne({ ownerId, status: 'active' }).sort({ createdAt: -1 }).lean(),
      Transaction.aggregate([
        {
          $match: {
            ownerId,
            isDeleted: { $ne: true }
          }
        },
        {
          $group: {
            _id: { accountId: '$accountId', type: '$type' },
            totalPaise: { $sum: '$amountPaise' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Build read-only Account Balance Reconciliation Diagnostic
    const accountNetDeltas = {};
    ledgerDeltas.forEach((d) => {
      const accIdStr = d._id.accountId ? d._id.accountId.toString() : null;
      if (!accIdStr) return;
      if (!accountNetDeltas[accIdStr]) accountNetDeltas[accIdStr] = 0;

      const t = d._id.type;
      const amt = d.totalPaise || 0;
      // Exact transaction service impact rules:
      // Inflows increase balance: 'income', 'transfer_in', 'refund'
      // Outflows decrease balance: 'expense', 'transfer_out', 'transfer'
      if (t === 'income' || t === 'transfer_in' || t === 'refund') {
        accountNetDeltas[accIdStr] += amt;
      } else if (t === 'expense' || t === 'transfer_out' || t === 'transfer') {
        accountNetDeltas[accIdStr] -= amt;
      }
    });

    const reconciliation = accounts.map((acc) => {
      const accIdStr = acc._id.toString();
      const calculatedLedgerDelta = accountNetDeltas[accIdStr] || 0;
      const storedBalancePaise = acc.balancePaise || 0;

      // If openingBalancePaise is undefined or null, we cannot establish a verified historical baseline
      const hasBaseline = typeof acc.openingBalancePaise === 'number' && !isNaN(acc.openingBalancePaise);

      if (!hasBaseline) {
        return {
          accountId: acc._id,
          accountName: acc.name,
          accountType: acc.type,
          openingBalancePaise: null,
          storedBalancePaise,
          calculatedLedgerDeltaPaise: calculatedLedgerDelta,
          calculatedLedgerBalancePaise: null,
          differencePaise: null,
          status: 'baseline_unavailable',
          note: 'Historical opening balance was not recorded upon account creation; ledger baseline cannot be reliably established.'
        };
      }

      const openingBalancePaise = acc.openingBalancePaise;
      const expectedBalancePaise = openingBalancePaise + calculatedLedgerDelta;
      const differencePaise = storedBalancePaise - expectedBalancePaise;
      const status = differencePaise === 0 ? 'matched' : 'mismatch';

      return {
        accountId: acc._id,
        accountName: acc.name,
        accountType: acc.type,
        openingBalancePaise,
        storedBalancePaise,
        calculatedLedgerDeltaPaise: calculatedLedgerDelta,
        calculatedLedgerBalancePaise: expectedBalancePaise,
        differencePaise,
        status,
        note: status === 'matched' 
          ? 'Stored balance perfectly matches opening balance plus ledger deltas.'
          : `Discrepancy of ${differencePaise > 0 ? '+' : ''}${differencePaise} paise detected between stored balance and verified ledger.`
      };
    });

    const isLedgerReconciled = reconciliation.every(r => r.status === 'matched');

    const currentBalancePaise = accounts.reduce((acc, a) => acc + (a.balancePaise || 0), 0);
    const budget = budgetDoc || { limitPaise: 0, monthKey: currentMonthKey };

    let incomeThisMonthPaise = 0;
    let expensesThisMonthPaise = 0;
    let academicStudyExpensesThisMonthPaise = 0; // Study supplies, books, printing
    let academicFeesPaidThisMonthPaise = 0; // Isolated institutional semester & exam fees

    monthlyTransactions.forEach((tx) => {
      const isFee = isAcademicFee(tx);

      if (tx.type === 'income') {
        incomeThisMonthPaise += tx.amountPaise;
      } else if (tx.type === 'expense') {
        if (isFee) {
          // Isolated: Do NOT add to general lifestyle & operational expenses
          academicFeesPaidThisMonthPaise += tx.amountPaise;
        } else {
          expensesThisMonthPaise += tx.amountPaise;
          if (tx.categoryId === 'academic') {
            academicStudyExpensesThisMonthPaise += tx.amountPaise;
          }
        }
      } else if (tx.type === 'refund') {
        if (isFee) {
          academicFeesPaidThisMonthPaise -= tx.amountPaise;
        } else {
          expensesThisMonthPaise -= tx.amountPaise;
          if (tx.categoryId === 'academic') {
            academicStudyExpensesThisMonthPaise -= tx.amountPaise;
          }
        }
      }
    });
    if (expensesThisMonthPaise < 0) expensesThisMonthPaise = 0;
    if (academicFeesPaidThisMonthPaise < 0) academicFeesPaidThisMonthPaise = 0;

    const goalLimitPaise = budget.limitPaise;
    const remainingLimitPaise = goalLimitPaise - expensesThisMonthPaise;
    const percentUsed = goalLimitPaise > 0 ? (expensesThisMonthPaise / goalLimitPaise) * 100 : 0;

    const categoryTotals = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const isFee = isAcademicFee(t);
        if (!isFee) {
          categoryTotals[t.categoryLabel] = (categoryTotals[t.categoryLabel] || 0) + t.amountPaise;
        }
      });


    const totalObligationsPaise = academicFees.reduce((sum, f) => sum + f.totalAmountPaise, 0);
    const totalFeePaidPaise = academicFees.reduce((sum, f) => {
      const paid = f.installments.reduce((iSum, inst) => iSum + inst.amountPaise, 0);
      return sum + paid;
    }, 0);
    const totalPendingFeesPaise = Math.max(0, totalObligationsPaise - totalFeePaidPaise);

    // Build daily expense points for current month's velocity curve
    // Number of days in the month
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const dailyExpenses = new Array(daysInMonth).fill(0);
    monthlyTransactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date) {
        const d = getISTDayOfMonth(tx.date);
        if (d >= 1 && d <= daysInMonth) {
          dailyExpenses[d - 1] += (tx.amountPaise || 0);
        }
      }
    });

    res.json({
      success: true,
      data: {
        monthKey: currentMonthKey,
        currentBalancePaise,
        incomeThisMonthPaise,
        expensesThisMonthPaise, // General monthly expenses (cleanly isolated, excludes institutional fees)
        academicExpensesThisMonthPaise: academicStudyExpensesThisMonthPaise, // Books, stationary, printouts
        academicFeesPaidThisMonthPaise, // Semester & Exam fees paid this month
        budget: {
          limitPaise: goalLimitPaise,
          spentPaise: expensesThisMonthPaise,
          remainingPaise: remainingLimitPaise,
          percentUsed: Math.min(Math.round(percentUsed * 10) / 10, 999),
          isExceeded: expensesThisMonthPaise > goalLimitPaise,
          isWarning: percentUsed >= 80 && expensesThisMonthPaise <= goalLimitPaise
        },
        categoryTotals,
        recentTransactions,
        dailyExpenses,
        feeOverview: {
          totalObligationsPaise,
          totalFeePaidPaise,
          totalPendingFeesPaise
        },
        primaryGoal: primaryGoal || null,
        reconciliation: {
          isReconciled: isLedgerReconciled,
          accounts: reconciliation
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };