const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const AcademicFee = require('../models/AcademicFee');

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

    const query = { ownerId };

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
      .populate('accountId', 'name type');

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

    const parsedAmount = parseInt(amountPaise, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount in paise greater than zero' });
    }

    if (!categoryId || !subcategory) {
      return res.status(400).json({ success: false, message: 'Category and specific item are required' });
    }

    let targetAccount;
    if (accountId) {
      targetAccount = await Account.findOne({ _id: accountId, ownerId });
    } else {
      targetAccount = await Account.findOne({ ownerId, isDefault: true }) || await Account.findOne({ ownerId });
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

    const txDate = date ? new Date(date) : new Date();
    if (isNaN(txDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date provided' });
    }

    const validPaymentMethods = ['upi', 'cash', 'card'];
    const chosenPaymentMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'upi';

    const transaction = await Transaction.create({
      ownerId,
      accountId: targetAccount._id,
      type,
      amountPaise: parsedAmount,
      categoryId,
      categoryLabel: categoryLabel || categoryId,
      subcategory: subcategory.trim(),
      date: txDate,
      note: note ? note.trim() : '',
      paymentMethod: chosenPaymentMethod,
      academicFeeId: academicFeeId || null
    });

    if (transaction.type === 'income' || transaction.type === 'refund') {
      targetAccount.balancePaise += transaction.amountPaise;
    } else if (transaction.type === 'expense') {
      targetAccount.balancePaise -= transaction.amountPaise;
    }
    await targetAccount.save();

    if (academicFeeId) {
      const fee = await AcademicFee.findOne({ _id: academicFeeId, ownerId });
      if (fee) {
        fee.installments.push({
          amountPaise: transaction.amountPaise,
          paidDate: transaction.date,
          transactionId: transaction._id,
          note: transaction.note
        });
        fee.updateStatus();
        await fee.save();
      }
    }

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
    const { amountPaise, categoryId, categoryLabel, subcategory, date, note } = req.body;

    const transaction = await Transaction.findOne({ _id: id, ownerId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
    }

    const account = await Account.findOne({ _id: transaction.accountId, ownerId });
    if (account) {
      if (transaction.type === 'income' || transaction.type === 'refund') {
        account.balancePaise -= transaction.amountPaise;
      } else if (transaction.type === 'expense') {
        account.balancePaise += transaction.amountPaise;
      }
    }

    if (amountPaise !== undefined) {
      const parsed = parseInt(amountPaise, 10);
      if (isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
      }
      transaction.amountPaise = parsed;
    }
    if (categoryId) transaction.categoryId = categoryId;
    if (categoryLabel) transaction.categoryLabel = categoryLabel;
    if (subcategory) transaction.subcategory = subcategory.trim();
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) transaction.date = parsedDate;
    }
    if (note !== undefined) transaction.note = note.trim();

    await transaction.save();

    if (account) {
      if (transaction.type === 'income' || transaction.type === 'refund') {
        account.balancePaise += transaction.amountPaise;
      } else if (transaction.type === 'expense') {
        account.balancePaise -= transaction.amountPaise;
      }
      await account.save();
    }

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

    const transaction = await Transaction.findOne({ _id: id, ownerId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found or unauthorized' });
    }

    const account = await Account.findOne({ _id: transaction.accountId, ownerId });
    if (account) {
      if (transaction.type === 'income' || transaction.type === 'refund') {
        account.balancePaise -= transaction.amountPaise;
      } else if (transaction.type === 'expense') {
        account.balancePaise += transaction.amountPaise;
      }
      await account.save();
    }

    if (transaction.academicFeeId) {
      const fee = await AcademicFee.findOne({ _id: transaction.academicFeeId, ownerId });
      if (fee) {
        fee.installments = fee.installments.filter(
          inst => !inst.transactionId || inst.transactionId.toString() !== id
        );
        fee.updateStatus();
        await fee.save();
      }
    }

    await Transaction.deleteOne({ _id: id, ownerId });

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
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