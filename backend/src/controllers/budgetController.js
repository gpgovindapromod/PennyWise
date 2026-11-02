const MonthlyBudget = require('../models/MonthlyBudget');
const Transaction = require('../models/Transaction');
const { getISTMonthRange } = require('../utils/dateUtils');
const { isAcademicFee } = require('../utils/feeClassifier');

const getBudget = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { month } = req.params;

    const { startOfMonth, startOfNextMonth, monthKey: currentMonthKey } = getISTMonthRange(month);

    let budget = await MonthlyBudget.findOne({ ownerId, monthKey: currentMonthKey });
    if (!budget) {
      budget = {
        monthKey: currentMonthKey,
        limitPaise: 0,
        categoryLimits: []
      };
    }

    const monthlyTransactions = await Transaction.find({
      ownerId,
      date: { $gte: startOfMonth, $lt: startOfNextMonth },
      type: { $in: ['expense', 'refund'] },
      isDeleted: { $ne: true }
    });

    let spentPaise = 0;
    const categorySpentMap = {};

    monthlyTransactions.forEach(tx => {
      const isFee = isAcademicFee(tx);

      // Institutional semester/exam fees must not exhaust or breach monthly operational budget
      if (isFee) return;

      const factor = tx.type === 'refund' ? -1 : 1;
      spentPaise += (tx.amountPaise * factor);
      categorySpentMap[tx.categoryId] = (categorySpentMap[tx.categoryId] || 0) + (tx.amountPaise * factor);
    });

    if (spentPaise < 0) spentPaise = 0;

    res.json({
      success: true,
      data: {
        budget,
        spentPaise,
        remainingPaise: budget.limitPaise - spentPaise,
        percentUsed: budget.limitPaise > 0 ? Math.min(Math.round((spentPaise / budget.limitPaise) * 1000) / 10, 999) : 0,
        categorySpentMap
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { month } = req.params;
    const { limitPaise, categoryLimits, notes } = req.body;

    const parsedLimit = parseInt(limitPaise, 10);
    if (isNaN(parsedLimit) || parsedLimit < 0) {
      return res.status(400).json({ success: false, message: 'Valid budget limit in paise is required' });
    }

    const budget = await MonthlyBudget.findOneAndUpdate(
      { ownerId, monthKey: month },
      {
        limitPaise: parsedLimit,
        categoryLimits: categoryLimits || [],
        notes: notes || ''
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudget, updateBudget };