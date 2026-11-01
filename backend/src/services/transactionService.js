const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const AcademicFee = require('../models/AcademicFee');
const { AppError, NotFoundError, ValidationError, ConflictError } = require('../errors/AppError');

// Directional outflow classification
const OUTFLOW = new Set(['expense', 'transfer_out', 'transfer']);
const isOutflow = (type) => OUTFLOW.has(type);

/**
 * Helper to obtain or verify an active MongoDB Session.
 * Safely executes transactions on replica sets, with gated fallback for non-production standalone.
 */
async function withTransactionSession(work) {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (err) {
    const isStandaloneErr = err.message && (
      err.message.includes('replica set') ||
      err.message.includes('Transaction numbers are only allowed on a replica set member')
    );

    if (isStandaloneErr) {
      if (process.env.NODE_ENV === 'production') throw err;
      return await work(null);
    }
    throw err;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

class TransactionService {
  /**
   * Internal runner to create a transaction inside a designated session
   */
  static async _create(data, { idempotencyKey, session: externalSession } = {}) {
    const {
      ownerId,
      accountId,
      type,
      amountPaise,
      categoryId,
      categoryLabel,
      subcategory,
      date = new Date(),
      note = '',
      paymentMethod = 'upi',
      academicFeeId = null,
      transferId = null
    } = data;

    // Reject non-integer paise or non-positive amounts
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      throw new ValidationError('Transaction amount must be a positive integer in paise');
    }

    const execute = async (session) => {
      const sessionOpt = session ? { session } : {};

      // 1. Idempotency Check: lookup keyed transaction including soft-deleted to avoid E11000 collision
      if (idempotencyKey) {
        const existingTx = await Transaction.findOne(
          { ownerId, idempotencyKey },
          null,
          sessionOpt
        );

        if (existingTx) {
          return { transaction: existingTx, idempotentReplay: true };
        }
      }

      // 2. Fetch Account & verify ownership
      const account = await Account.findOne({ _id: accountId, ownerId }, null, sessionOpt);
      if (!account) {
        throw new NotFoundError('Target account not found or access denied');
      }

      // 3. Balance Adjustment with atomic check
      // Uses isOutflow to differentiate debits vs credits
      const isDeduction = isOutflow(type);
      const isCreditType = ['credit', 'loan'].includes(account.type || account.accountType);

      if (isDeduction) {
        const query = { _id: accountId, ownerId };
        if (!isCreditType) {
          query.balancePaise = { $gte: amountPaise };
        }

        const updateResult = await Account.updateOne(
          query,
          { $inc: { balancePaise: -amountPaise } },
          sessionOpt
        );

        if (updateResult.matchedCount === 0) {
          throw new AppError('Insufficient balance to execute this disbursement', 422);
        }
      } else {
        // Income, refund, or transfer_in leg
        await Account.updateOne(
          { _id: accountId, ownerId },
          { $inc: { balancePaise: amountPaise } },
          sessionOpt
        );
      }

      // 4. Create Transaction record in the same atomic session
      // Omit idempotencyKey when absent so null is never stored into sparse unique index
      const docToInsert = {
        ownerId,
        accountId,
        type,
        amountPaise,
        categoryId,
        categoryLabel,
        subcategory,
        date,
        note,
        paymentMethod,
        academicFeeId,
        transferId,
        isDeleted: false,
        ...(idempotencyKey && { idempotencyKey })
      };

      const [newTransaction] = await Transaction.create([docToInsert], sessionOpt);

      return { transaction: newTransaction, idempotentReplay: false };
    };

    if (externalSession !== undefined) {
      return await execute(externalSession);
    }
    return await withTransactionSession(execute);
  }

  /**
   * Public interface with duplicate key catch for idempotency
   */
  static async createTransaction(data, opts = {}) {
    try {
      return await TransactionService._create(data, opts);
    } catch (err) {
      if (err.code === 11000 && opts.idempotencyKey && opts.session === undefined) {
        const tx = await Transaction.findOne({ ownerId: data.ownerId, idempotencyKey: opts.idempotencyKey });
        if (tx) return { transaction: tx, idempotentReplay: true };
      }
      throw err;
    }
  }

  /**
   * Soft-delete a transaction and atomically reverse its account balance impact.
   * Atomically flips flag with findOneAndUpdate and guards against fee-linked deletes.
   */
  static async softDeleteTransaction(transactionId, ownerId) {
    return await withTransactionSession(async (session) => {
      const sessionOpt = session ? { session } : {};

      // 1. Atomic flip guard: ensures transaction is active and not fee-linked
      const tx = await Transaction.findOneAndUpdate(
        { _id: transactionId, ownerId, isDeleted: { $ne: true }, academicFeeId: null },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { ...sessionOpt, new: false }
      );

      if (!tx) {
        throw new NotFoundError('Transaction not found, already deleted, or linked to an educational fee obligation');
      }

      // 2. Reverse balance on Account atomically
      const reverseDelta = isOutflow(tx.type) ? tx.amountPaise : -tx.amountPaise;

      const account = await Account.findOne({ _id: tx.accountId, ownerId }, null, sessionOpt);
      if (!account) {
        throw new NotFoundError('Associated account not found');
      }

      const query = { _id: tx.accountId, ownerId };
      const isCreditType = ['credit', 'loan'].includes(account.type || account.accountType);

      if (reverseDelta < 0 && !isCreditType) {
        query.balancePaise = { $gte: Math.abs(reverseDelta) };
      }

      const updateRes = await Account.updateOne(query, { $inc: { balancePaise: reverseDelta } }, sessionOpt);
      if (updateRes.matchedCount === 0 && reverseDelta < 0) {
        throw new AppError('Cannot delete income transaction: insufficient account balance to reverse', 422);
      }

      return { success: true, reversedPaise: reverseDelta, transactionId: tx._id };
    });
  }

  /**
   * Update an existing transaction and atomically apply the balance difference.
   */
  static async updateTransaction(transactionId, ownerId, updates) {
    return await withTransactionSession(async (session) => {
      const sessionOpt = session ? { session } : {};

      const tx = await Transaction.findOne({ _id: transactionId, ownerId, isDeleted: { $ne: true } }, null, sessionOpt);
      if (!tx) {
        throw new NotFoundError('Transaction not found or already deleted');
      }

      if (tx.academicFeeId && updates.amountPaise !== undefined) {
        throw new ConflictError('Edit fee payments from the fee schedule, not the ledger');
      }

      const account = await Account.findOne({ _id: tx.accountId, ownerId }, null, sessionOpt);
      if (!account) {
        throw new NotFoundError('Account not found');
      }

      const newAmountPaise = updates.amountPaise !== undefined ? updates.amountPaise : tx.amountPaise;
      if (!Number.isInteger(newAmountPaise) || newAmountPaise <= 0) {
        throw new ValidationError('Amount must be a positive integer in paise');
      }

      if (newAmountPaise !== tx.amountPaise) {
        const isExpense = isOutflow(tx.type);
        const accountAdjustment = isExpense 
          ? (tx.amountPaise - newAmountPaise) 
          : (newAmountPaise - tx.amountPaise);

        const query = { _id: tx.accountId, ownerId };
        const isCreditType = ['credit', 'loan'].includes(account.type || account.accountType);

        if (accountAdjustment < 0 && !isCreditType) {
          query.balancePaise = { $gte: Math.abs(accountAdjustment) };
        }
        const res = await Account.updateOne(query, { $inc: { balancePaise: accountAdjustment } }, sessionOpt);
        if (res.matchedCount === 0 && accountAdjustment < 0) {
          throw new AppError('Insufficient balance to increase disbursement amount', 422);
        }
        tx.amountPaise = newAmountPaise;
      }

      // Metadata updates
      if (updates.note !== undefined) tx.note = updates.note;
      if (updates.subcategory !== undefined) tx.subcategory = updates.subcategory;
      if (updates.categoryLabel !== undefined) tx.categoryLabel = updates.categoryLabel;
      if (updates.date !== undefined) tx.date = updates.date;
      if (updates.paymentMethod !== undefined) tx.paymentMethod = updates.paymentMethod;

      await tx.save(sessionOpt);
      return tx;
    });
  }

  /**
   * Process Academic Fee Installment Payment spanning 3 documents:
   * AcademicFee -> Transaction -> Account in one atomic session.
   */
  static async recordAcademicFeePayment({ ownerId, feeId, amountPaise, accountId, paymentMethod = 'upi', note = '' }) {
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      throw new ValidationError('Payment amount must be a positive integer in paise');
    }

    return await withTransactionSession(async (session) => {
      const sessionOpt = session ? { session } : {};

      // 1. Fetch fee obligation
      const fee = await AcademicFee.findOne({ _id: feeId, ownerId }, null, sessionOpt);
      if (!fee) {
        throw new NotFoundError('Academic fee obligation not found');
      }

      if (fee.status === 'paid') {
        throw new ConflictError('Academic fee obligation is already fully settled');
      }

      // Overpayment guard
      const paid = fee.installments.reduce((s, i) => s + i.amountPaise, 0);
      const remainingFeePaise = fee.totalAmountPaise - paid;
      if (amountPaise > remainingFeePaise) {
        throw new ValidationError('Payment exceeds remaining fee');
      }

      // Verify account
      let targetAccountId = accountId;
      if (!targetAccountId) {
        const defaultAcc = await Account.findOne({ ownerId, isDefault: true }, null, sessionOpt) 
          || await Account.findOne({ ownerId }, null, sessionOpt);
        if (!defaultAcc) throw new NotFoundError('No payment account configured for user');
        targetAccountId = defaultAcc._id;
      }

      // 2. Create the associated expense transaction (passes session explicitly)
      const { transaction: tx } = await TransactionService.createTransaction(
        {
          ownerId,
          accountId: targetAccountId,
          type: 'expense',
          amountPaise,
          categoryId: 'academic',
          categoryLabel: 'Academic Fee',
          subcategory: fee.title,
          note: note || `Installment payment for ${fee.title}`,
          paymentMethod,
          academicFeeId: fee._id
        },
        { session }
      );

      // 3. Append installment record and update fee obligation status
      fee.installments.push({
        amountPaise,
        paidDate: new Date(),
        transactionId: tx._id,
        note: note || ''
      });
      fee.updateStatus();
      await fee.save(sessionOpt);

      return { fee, transaction: tx };
    });
  }

  /**
   * Calculate live server-side burn rate from Transaction collection for a given monthKey.
   * Uses IST month boundaries (UTC+05:30) and validates YYYY-MM format.
   */
  static async calculateServerBurnRate(ownerId, monthKey) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) {
      throw new ValidationError('Bad monthKey format. Expected YYYY-MM');
    }

    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-indexed

    const IST = 330 * 60 * 1000;
    const startOfMonth = new Date(Date.UTC(year, month, 1) - IST);
    const endOfMonth = new Date(Date.UTC(year, month + 1, 1) - IST);

    const result = await Transaction.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(ownerId),
          isDeleted: { $ne: true },
          date: { $gte: startOfMonth, $lt: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          totalPaise: { $sum: '$amountPaise' }
        }
      }
    ]);

    let spentPaise = 0;
    let incomePaise = 0;

    result.forEach((group) => {
      if (isOutflow(group._id)) spentPaise += group.totalPaise;
      if (group._id === 'income' || group._id === 'transfer_in') incomePaise += group.totalPaise;
    });

    return {
      monthKey,
      spentPaise,
      incomePaise,
      netOutflowPaise: Math.max(0, spentPaise - incomePaise)
    };
  }
}

module.exports = TransactionService;
