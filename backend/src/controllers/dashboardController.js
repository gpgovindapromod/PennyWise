const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const MonthlyBudget = require('../models/MonthlyBudget');
const AcademicFee = require('../models/AcademicFee');

const getDashboardSummary = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { month } = req.query;
    const now = new Date();
    const currentMonthKey = month || (now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'));
    const [yearStr, monthStr] = currentMonthKey.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;
    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    const accounts = await Account.find({ ownerId });
    const currentBalancePaise = accounts.reduce((acc, a) => acc + (a.balancePaise || 0), 0);

    const dateFilter = { $gte: startOfMonth, $lte: endOfMonth };
    const monthlyTransactions = await Transaction.find({ ownerId, date: dateFilter });

    let incomeThisMonthPaise = 0;
    let expensesThisMonthPaise = 0;
    let academicStudyExpensesThisMonthPaise = 0; // Study supplies, books, printing
    let academicFeesPaidThisMonthPaise = 0; // Isolated institutional semester & exam fees

    // Fee items to cleanly isolate from routine lifestyle & study expenses
    const feeSubcategories = ['college fees', 'tuition fees', 'semester fees', 'exam fees', 'examination fees', 'hostel fees', 'admission fees'];

    monthlyTransactions.forEach((tx) => {
      const isFee = Boolean(
        tx.academicFeeId || 
        (tx.categoryId === 'academic' && feeSubcategories.includes(tx.subcategory?.toLowerCase().trim()))
      );

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

    let budget = await MonthlyBudget.findOne({ ownerId, monthKey: currentMonthKey });
    if (!budget) {
      budget = { limitPaise: 0, monthKey: currentMonthKey };
    }
    const goalLimitPaise = budget.limitPaise;
    const remainingLimitPaise = goalLimitPaise - expensesThisMonthPaise;
    const percentUsed = goalLimitPaise > 0 ? (expensesThisMonthPaise / goalLimitPaise) * 100 : 0;

    const recentTransactions = await Transaction.find({ ownerId })
      .sort({ date: -1, createdAt: -1 })
      .limit(6);

    const categoryTotals = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const isFee = Boolean(
          t.academicFeeId || 
          (t.categoryId === 'academic' && feeSubcategories.includes(t.subcategory?.toLowerCase().trim()))
        );
        if (!isFee) {
          categoryTotals[t.categoryLabel] = (categoryTotals[t.categoryLabel] || 0) + t.amountPaise;
        }
      });

    const academicFees = await AcademicFee.find({ ownerId });
    const totalObligationsPaise = academicFees.reduce((sum, f) => sum + f.totalAmountPaise, 0);
    const totalFeePaidPaise = academicFees.reduce((sum, f) => {
      const paid = f.installments.reduce((iSum, inst) => iSum + inst.amountPaise, 0);
      return sum + paid;
    }, 0);
    const totalPendingFeesPaise = Math.max(0, totalObligationsPaise - totalFeePaidPaise);

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
        feeOverview: {
          totalObligationsPaise,
          totalFeePaidPaise,
          totalPendingFeesPaise
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };