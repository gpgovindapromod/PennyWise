const Transaction = require('../models/Transaction');

const getReportSummary = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { startDate, endDate } = req.query;
    const now = new Date();

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      const monthKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');

      const txs = await Transaction.find({
        ownerId,
        date: { $gte: start, $lte: end }
      });

      let incomePaise = 0;
      let expensePaise = 0;
      let institutionalFeePaise = 0;

      const feeSubcategories = ['college fees', 'tuition fees', 'semester fees', 'exam fees', 'examination fees', 'hostel fees', 'admission fees'];

      txs.forEach(t => {
        const isFee = Boolean(
          t.academicFeeId || 
          (t.categoryId === 'academic' && feeSubcategories.includes(t.subcategory?.toLowerCase().trim()))
        );

        if (t.type === 'income') {
          incomePaise += t.amountPaise;
        } else if (t.type === 'expense') {
          if (isFee) {
            institutionalFeePaise += t.amountPaise;
          } else {
            expensePaise += t.amountPaise;
          }
        } else if (t.type === 'refund') {
          if (isFee) {
            institutionalFeePaise -= t.amountPaise;
          } else {
            expensePaise -= t.amountPaise;
          }
        }
      });

      monthlyTrend.push({
        monthKey,
        label: monthLabel,
        income: Math.round(incomePaise / 100),
        expense: Math.max(0, Math.round(expensePaise / 100)),
        fees: Math.max(0, Math.round(institutionalFeePaise / 100))
      });
    }

    // Dynamic Filter for Breakdown queries
    const feeSubcategories = ['college fees', 'tuition fees', 'semester fees', 'exam fees', 'examination fees', 'hostel fees', 'admission fees'];

    const expenseQuery = {
      ownerId,
      type: 'expense'
    };

    if (startDate || endDate) {
      expenseQuery.date = {};
      if (startDate) expenseQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        expenseQuery.date.$lte = eDate;
      }
    }

    const allExpenses = await Transaction.find(expenseQuery);

    const categoryMap = {};
    const foodSubcategoryMap = {};
    const academicSubcategoryMap = {};
    let totalExamAndSemesterFeesPaise = 0;

    allExpenses.forEach(t => {
      const isFee = Boolean(
        t.academicFeeId || 
        (t.categoryId === 'academic' && feeSubcategories.includes(t.subcategory?.toLowerCase().trim()))
      );

      if (isFee) {
        totalExamAndSemesterFeesPaise += t.amountPaise;
      } else {
        categoryMap[t.categoryLabel] = (categoryMap[t.categoryLabel] || 0) + t.amountPaise;

        if (t.categoryId === 'food-drinks') {
          foodSubcategoryMap[t.subcategory] = (foodSubcategoryMap[t.subcategory] || 0) + t.amountPaise;
        }
        if (t.categoryId === 'academic') {
          academicSubcategoryMap[t.subcategory] = (academicSubcategoryMap[t.subcategory] || 0) + t.amountPaise;
        }
      }
    });

    const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
      name: cat,
      amountRupees: Math.round(categoryMap[cat] / 100)
    })).sort((a, b) => b.amountRupees - a.amountRupees);

    const foodBreakdown = Object.keys(foodSubcategoryMap).map(item => ({
      name: item,
      amountRupees: Math.round(foodSubcategoryMap[item] / 100)
    })).sort((a, b) => b.amountRupees - a.amountRupees);

    const academicBreakdown = Object.keys(academicSubcategoryMap).map(item => ({
      name: item,
      amountRupees: Math.round(academicSubcategoryMap[item] / 100)
    })).sort((a, b) => b.amountRupees - a.amountRupees);

    res.json({
      success: true,
      data: {
        monthlyTrend,
        categoryBreakdown,
        foodBreakdown,
        academicBreakdown, // Contains only books, notes, supplies, xerox
        institutionalFeesRupees: Math.round(totalExamAndSemesterFeesPaise / 100)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReportSummary };