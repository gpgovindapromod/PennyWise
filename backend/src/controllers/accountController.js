const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { ValidationError, NotFoundError, ConflictError } = require('../errors/AppError');
const { withTransactionSession } = require('../utils/mongoSession');

// @desc Get all accounts for current user with real-time balance
// @route GET /api/accounts
const getAccounts = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { includeInactive } = req.query;

    const query = { ownerId };
    if (includeInactive !== 'true') {
      query.isActive = { $ne: false };
    }

    const accounts = await Account.find(query).sort({ isDefault: -1, createdAt: 1 });

    const totalBalancePaise = accounts
      .filter(a => a.isActive !== false)
      .reduce((sum, a) => sum + (a.balancePaise || 0), 0);

    res.json({
      success: true,
      data: {
        accounts,
        totalBalancePaise,
        count: accounts.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new account / wallet
// @route POST /api/accounts
const createAccount = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { name, type, openingBalancePaise = 0, isDefault = false } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Account name is required' });
    }

    const validTypes = ['cash', 'bank', 'savings', 'wallet', 'credit', 'loan', 'other'];
    const accountType = type ? type.toLowerCase().trim() : 'cash';
    if (!validTypes.includes(accountType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid account type. Allowed: ${validTypes.join(', ')}`
      });
    }

    const initialPaise = Number.isInteger(openingBalancePaise) ? openingBalancePaise : 0;
    if (initialPaise < 0) {
      return res.status(400).json({ success: false, message: 'Initial balance cannot be negative' });
    }

    const result = await withTransactionSession(async (session) => {
      const sessionOpt = session ? { session } : {};

      // If set as default, remove default from all other user accounts
      if (isDefault) {
        await Account.updateMany({ ownerId }, { $set: { isDefault: false } }, sessionOpt);
      } else {
        // If this is the user's first account, make it default automatically
        const existingCount = await Account.countDocuments({ ownerId }, sessionOpt);
        if (existingCount === 0) {
          req.body.isDefault = true;
        }
      }

      const [newAccount] = await Account.create([{
        ownerId,
        name: name.trim(),
        type: accountType,
        balancePaise: initialPaise,
        openingBalancePaise: initialPaise,
        isDefault: Boolean(isDefault || (await Account.countDocuments({ ownerId }, sessionOpt)) === 0),
        isActive: true
      }], sessionOpt);

      return newAccount;
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update account name, type, or default status
// @route PUT /api/accounts/:id
const updateAccount = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;
    const { name, type, isDefault } = req.body;

    const account = await Account.findOne({ _id: id, ownerId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found or access denied' });
    }

    const validTypes = ['cash', 'bank', 'savings', 'wallet', 'credit', 'loan', 'other'];

    await withTransactionSession(async (session) => {
      const sessionOpt = session ? { session } : {};

      if (name && name.trim()) {
        account.name = name.trim();
      }

      if (type) {
        const cleanType = type.toLowerCase().trim();
        if (validTypes.includes(cleanType)) {
          account.type = cleanType;
        }
      }

      if (isDefault === true) {
        await Account.updateMany({ ownerId }, { $set: { isDefault: false } }, sessionOpt);
        account.isDefault = true;
      }

      await account.save(sessionOpt);
    });

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: account
    });
  } catch (error) {
    next(error);
  }
};

// @desc Safe Deactivation of account (prevents deleting accounts with active transactions or non-zero balance)
// @route PATCH /api/accounts/:id/deactivate
const deactivateAccount = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;

    const account = await Account.findOne({ _id: id, ownerId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found or access denied' });
    }

    if (account.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate default account. Please set another account as default first.'
      });
    }

    if (account.balancePaise !== 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot deactivate account with non-zero balance (₹${(account.balancePaise / 100).toFixed(2)}). Please transfer remaining balance to another account first.`
      });
    }

    // Check if account has active transactions
    const hasTransactions = await Transaction.exists({
      ownerId,
      accountId: id,
      isDeleted: { $ne: true }
    });

    account.isActive = false;
    await account.save();

    res.json({
      success: true,
      message: 'Account deactivated safely. Historical ledger records remain preserved.',
      data: account
    });
  } catch (error) {
    next(error);
  }
};

// @desc Reactivate an inactive account
// @route PATCH /api/accounts/:id/activate
const activateAccount = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { id } = req.params;

    const account = await Account.findOne({ _id: id, ownerId });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found or access denied' });
    }

    account.isActive = true;
    await account.save();

    res.json({
      success: true,
      message: 'Account reactivated successfully',
      data: account
    });
  } catch (error) {
    next(error);
  }
};

// @desc Transfer funds between two user-owned accounts
// @route POST /api/accounts/transfer
const transferBetweenAccounts = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const { fromAccountId, toAccountId, amountPaise, note, idempotencyKey } = req.body;

    if (!fromAccountId || !toAccountId) {
      return res.status(400).json({ success: false, message: 'Source and destination accounts are required' });
    }

    if (fromAccountId.toString() === toAccountId.toString()) {
      return res.status(400).json({ success: false, message: 'Source and destination accounts cannot be identical' });
    }

    const parsedAmount = parseInt(amountPaise, 10);
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Transfer amount must be a positive integer in paise' });
    }

    const mongoose = require('mongoose');
    const TransactionService = require('../services/transactionService');

    const result = await withTransactionSession(async (session) => {
      const sessionOpt = session ? { session } : {};

      // 1. Verify and lock source account
      const fromAcc = await Account.findOne({ _id: fromAccountId, ownerId, isActive: { $ne: false } }, null, sessionOpt);
      if (!fromAcc) {
        throw new NotFoundError('Source account not found, deactivated, or access denied');
      }

      // Overdraft prevention
      const isCreditType = ['credit', 'loan'].includes(fromAcc.type);
      if (!isCreditType && fromAcc.balancePaise < parsedAmount) {
        throw new ValidationError(`Insufficient balance in ${fromAcc.name}. Available: ₹${(fromAcc.balancePaise / 100).toFixed(2)}`);
      }

      // 2. Verify destination account
      const toAcc = await Account.findOne({ _id: toAccountId, ownerId, isActive: { $ne: false } }, null, sessionOpt);
      if (!toAcc) {
        throw new NotFoundError('Destination account not found, deactivated, or access denied');
      }

      const transferId = new mongoose.Types.ObjectId();
      const transferMemo = note ? note.trim() : `Transfer: ${fromAcc.name} → ${toAcc.name}`;

      // Leg 1: transfer_out on Source Account
      const outKey = idempotencyKey ? `${idempotencyKey}-out` : undefined;
      const { transaction: outTx } = await TransactionService.createTransaction(
        {
          ownerId,
          accountId: fromAcc._id,
          type: 'transfer_out',
          amountPaise: parsedAmount,
          categoryId: 'transfer',
          categoryLabel: 'Account Transfer',
          subcategory: `To ${toAcc.name}`,
          note: transferMemo,
          transferId
        },
        { idempotencyKey: outKey, session }
      );

      // Leg 2: transfer_in on Destination Account
      const inKey = idempotencyKey ? `${idempotencyKey}-in` : undefined;
      const { transaction: inTx } = await TransactionService.createTransaction(
        {
          ownerId,
          accountId: toAcc._id,
          type: 'transfer_in',
          amountPaise: parsedAmount,
          categoryId: 'transfer',
          categoryLabel: 'Account Transfer',
          subcategory: `From ${fromAcc.name}`,
          note: transferMemo,
          transferId
        },
        { idempotencyKey: inKey, session }
      );

      const updatedFrom = await Account.findById(fromAcc._id, null, sessionOpt);
      const updatedTo = await Account.findById(toAcc._id, null, sessionOpt);

      return {
        transferId,
        fromAccount: updatedFrom,
        toAccount: updatedTo,
        outboundTransaction: outTx,
        inboundTransaction: inTx,
        transferredPaise: parsedAmount
      };
    });

    res.status(201).json({
      success: true,
      message: 'Transfer executed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const { generateFinancialReconciliationReport } = require('../utils/reconciliationEngine');

// @desc Run diagnostic read-only financial reconciliation
// @route GET /api/accounts/reconciliation
const getAccountReconciliation = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const report = await generateFinancialReconciliationReport(ownerId);
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAccounts,
  createAccount,
  updateAccount,
  deactivateAccount,
  activateAccount,
  transferBetweenAccounts,
  getAccountReconciliation
};

