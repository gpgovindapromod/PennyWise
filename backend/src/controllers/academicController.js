const AcademicFee = require('../models/AcademicFee');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

const getAcademicSummary = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const now = new Date();
    const currentYear = now.getFullYear();

    const startOfAcademicYear = new Date(currentYear, 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const academicTxs = await Transaction.find({
      ownerId,
      categoryId: 'academic'
    }).sort({ date: -1 });

    let spendingThisMonthPaise = 0;
    let spendingThisYearPaise = 0;
    const subcategoryTotals = {};

    const feeSubcategories = ['college fees', 'tuition fees', 'semester fees', 'exam fees', 'examination fees', 'hostel fees', 'admission fees'];

    academicTxs.forEach(tx => {
      const isFee = Boolean(
        tx.academicFeeId || 
        feeSubcategories.includes(tx.subcategory?.toLowerCase().trim())
      );

      // We isolate institutional exam & semester fees from study costs
      if (!isFee) {
        const txDate = new Date(tx.date);
        const isThisMonth = txDate >= startOfMonth;
        const isThisYear = txDate >= startOfAcademicYear;

        if (tx.type === 'expense') {
          if (isThisMonth) spendingThisMonthPaise += tx.amountPaise;
          if (isThisYear) spendingThisYearPaise += tx.amountPaise;
          subcategoryTotals[tx.subcategory] = (subcategoryTotals[tx.subcategory] || 0) + tx.amountPaise;
        } else if (tx.type === 'refund') {
          if (isThisMonth) spendingThisMonthPaise -= tx.amountPaise;
          if (isThisYear) spendingThisYearPaise -= tx.amountPaise;
          subcategoryTotals[tx.subcategory] = (subcategoryTotals[tx.subcategory] || 0) - tx.amountPaise;
        }
      }
    });

    const feeObligations = await AcademicFee.find({ ownerId }).sort({ dueDate: 1 });

    const totalObligationsPaise = feeObligations.reduce((sum, f) => sum + f.totalAmountPaise, 0);
    const totalFeePaidPaise = feeObligations.reduce((sum, f) => {
      return sum + f.installments.reduce((iSum, i) => iSum + i.amountPaise, 0);
    }, 0);
    const totalPendingFeesPaise = Math.max(0, totalObligationsPaise - totalFeePaidPaise);

    res.json({
      success: true,
      data: {
        spendingThisMonthPaise: Math.max(0, spendingThisMonthPaise),
        spendingThisYearPaise: Math.max(0, spendingThisYearPaise),
        subcategoryTotals,
        fees: {
          totalObligationsPaise,
          totalFeePaidPaise,
          totalPendingFeesPaise,
          items: feeObligations
        },
        recentAcademicTransactions: academicTxs.slice(0, 8)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createFeeObligation = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { title, feeType, academicYear, semester, totalAmountPaise, dueDate, notes } = req.body;

    const parsedAmount = parseInt(totalAmountPaise, 10);
    if (!title || !parsedAmount || parsedAmount <= 0 || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, valid amount in paise and due date are required' });
    }

    const fee = await AcademicFee.create({
      ownerId,
      title: title.trim(),
      feeType: feeType || 'semester',
      academicYear: academicYear || '2026-2027',
      semester: semester || 'Semester 5',
      totalAmountPaise: parsedAmount,
      dueDate: new Date(dueDate),
      notes: notes ? notes.trim() : '',
      installments: [],
      status: 'unpaid'
    });

    res.status(201).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

const recordFeePayment = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;
    const { amountPaise, paidDate, receiptNumber, note, accountId } = req.body;

    const fee = await AcademicFee.findOne({ _id: id, ownerId });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee obligation not found or unauthorized' });
    }

    const parsedAmount = parseInt(amountPaise, 10);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount in paise is required' });
    }

    let targetAccount = await Account.findOne({ ownerId, isDefault: true }) || await Account.findOne({ ownerId });
    if (accountId) {
      const specifiedAccount = await Account.findOne({ _id: accountId, ownerId });
      if (specifiedAccount) targetAccount = specifiedAccount;
    }

    if (!targetAccount) {
      targetAccount = await Account.create({
        ownerId,
        name: 'Cash in Hand',
        type: 'cash',
        balancePaise: 0,
        isDefault: true
      });
    }

    const pDate = paidDate ? new Date(paidDate) : new Date();

    const transaction = await Transaction.create({
      ownerId,
      accountId: targetAccount._id,
      type: 'expense',
      amountPaise: parsedAmount,
      categoryId: 'academic',
      categoryLabel: 'Academic Expenses',
      subcategory: fee.feeType === 'tuition' ? 'College fees' : (fee.title || 'College fees'),
      date: pDate,
      note: note ? 'Fee payment: ' + fee.title + '. ' + note.trim() : 'Fee payment: ' + fee.title,
      academicFeeId: fee._id
    });

    targetAccount.balancePaise -= transaction.amountPaise;
    await targetAccount.save();

    fee.installments.push({
      amountPaise: transaction.amountPaise,
      paidDate: transaction.date,
      transactionId: transaction._id,
      receiptNumber: receiptNumber ? receiptNumber.trim() : '',
      note: note ? note.trim() : ''
    });

    fee.updateStatus();
    await fee.save();

    res.status(201).json({
      success: true,
      data: {
        fee,
        transaction
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateFeeObligation = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;
    const { title, feeType, academicYear, semester, totalAmountPaise, dueDate, notes } = req.body;

    const fee = await AcademicFee.findOne({ _id: id, ownerId });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee obligation not found or unauthorized' });
    }

    if (title) fee.title = title.trim();
    if (feeType) fee.feeType = feeType;
    if (academicYear) fee.academicYear = academicYear;
    if (semester) fee.semester = semester;
    if (dueDate) fee.dueDate = new Date(dueDate);
    if (notes !== undefined) fee.notes = notes ? notes.trim() : '';

    if (totalAmountPaise) {
      const parsedTotal = parseInt(totalAmountPaise, 10);
      if (parsedTotal > 0) {
        fee.totalAmountPaise = parsedTotal;
      }
    }

    fee.updateStatus();
    await fee.save();

    res.json({
      success: true,
      data: { fee }
    });
  } catch (error) {
    next(error);
  }
};

const deleteFeeObligation = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;

    const fee = await AcademicFee.findOne({ _id: id, ownerId });
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee obligation not found or unauthorized' });
    }

    // Also remove any linkage on child transactions or clean up
    await Transaction.updateMany({ academicFeeId: fee._id }, { $set: { academicFeeId: null } });
    await fee.deleteOne();

    res.json({
      success: true,
      message: 'Fee obligation removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAcademicSummary,
  createFeeObligation,
  recordFeePayment,
  updateFeeObligation,
  deleteFeeObligation
};