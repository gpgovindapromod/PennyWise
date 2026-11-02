const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const AcademicFee = require('../models/AcademicFee');
const TransactionService = require('../services/transactionService');

const getTransactions = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const {
      search,
      category,
      type,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const query = { ownerId, isDeleted: { $ne: true } };

    if (category && category !== 'all') {
      query.categoryId = category;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    if (search) {
      query.$or = [
        { subcategory: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
        { categoryLabel: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    const sortField = sortBy === 'amount' ? 'amountPaise' : 'date';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    sortOptions.createdAt = -1;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('accountId', 'name type')
      .lean();

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalCount,
          page: pageNum,
          pages: Math.ceil(totalCount / limitNum) || 1,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const createTransaction = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const {
      accountId,
      type = 'expense',
      amountPaise,
      categoryId,
      categoryLabel,
      subcategory,
      date,
      note,
      paymentMethod = 'upi',
      academicFeeId
    } = req.body;

    const idempotencyKey = req.headers['idempotency-key'] || req.body.idempotencyKey;
    const parsedAmount = parseInt(amountPaise, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount in paise greater than zero' });
    }

    if (!categoryId || !subcategory) {
      return res.status(400).json({ success: false, message: 'Category and specific item are required' });
    }

    let targetAccountId = accountId;
    if (!targetAccountId) {
      let defaultAcc = await Account.findOne({ ownerId, isDefault: true }) || await Account.findOne({ ownerId });
      if (!defaultAcc) {
        defaultAcc = await Account.create({
          ownerId,
          name: 'Cash in Hand',
          type: 'cash',
          balancePaise: 0,
          isDefault: true
        });
      }
      targetAccountId = defaultAcc._id;
    }

    const txDate = date ? new Date(date) : new Date();

    // If linked to an academic fee installment, route through atomic recordAcademicFeePayment to enforce overpayment checks & balance guards
    if (academicFeeId) {
      const result = await TransactionService.recordAcademicFeePayment({
        ownerId,
        feeId: academicFeeId,
        amountPaise: parsedAmount,
        accountId: targetAccountId,
        paymentMethod,
        note: note ? note.trim() : ''
      });

      return res.status(201).json({
        success: true,
        data: result.transaction,
        fee: result.fee
      });
    }

    const { transaction } = await TransactionService.createTransaction(
      {
        ownerId,
        accountId: targetAccountId,
        type,
        amountPaise: parsedAmount,
        categoryId,
        categoryLabel: categoryLabel || categoryId,
        subcategory: subcategory.trim(),
        date: txDate,
        note: note ? note.trim() : '',
        paymentMethod,
        academicFeeId: null
      },
      { idempotencyKey }
    );

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;
    const { amountPaise, categoryId, categoryLabel, subcategory, date, note, paymentMethod } = req.body;

    const updates = {};
    if (amountPaise !== undefined) {
      const parsed = parseInt(amountPaise, 10);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
      }
      updates.amountPaise = parsed;
    }
    if (categoryId) updates.categoryId = categoryId;
    if (categoryLabel) updates.categoryLabel = categoryLabel;
    if (subcategory) updates.subcategory = subcategory.trim();
    if (date) updates.date = new Date(date);
    if (note !== undefined) updates.note = note.trim();
    if (paymentMethod) updates.paymentMethod = paymentMethod;

    const transaction = await TransactionService.updateTransaction(id, ownerId, updates);

    // Sync academic fee installment if linked
    if (transaction.academicFeeId) {
      const fee = await AcademicFee.findOne({ _id: transaction.academicFeeId, ownerId });
      if (fee) {
        const inst = fee.installments.find(i => i.transactionId && i.transactionId.toString() === transaction._id.toString());
        if (inst) {
          inst.amountPaise = transaction.amountPaise;
          inst.paidDate = transaction.date;
          inst.note = transaction.note;
          fee.updateStatus();
          await fee.save();
        }
      }
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;

    const result = await TransactionService.softDeleteTransaction(id, ownerId);

    // Reconcile academic fee if linked
    const tx = await Transaction.findById(id);
    if (tx?.academicFeeId) {
      const fee = await AcademicFee.findOne({ _id: tx.academicFeeId, ownerId });
      if (fee) {
        fee.installments = fee.installments.filter(
          inst => !inst.transactionId || inst.transactionId.toString() !== id
        );
        fee.updateStatus();
        await fee.save();
      }
    }

    res.json({
      success: true,
      message: 'Transaction soft-deleted and account balance reversed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
