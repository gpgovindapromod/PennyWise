const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const TransactionService = require('./transactionService');
const { AppError, NotFoundError, ValidationError, ConflictError } = require('../errors/AppError');
const { withTransactionSession } = require('../utils/mongoSession');

class GoalService {
  /**
   * Fetch all goals for a user
   */
  static async getGoals(ownerId) {
    return await Goal.find({ ownerId }).sort({ createdAt: -1 });
  }

  /**
   * Create a new savings goal
   */
  static async createGoal(ownerId, data) {
    const { name, targetPaise, deadline, priority } = data;
    if (!name || !name.trim()) throw new ValidationError('Goal name is required');
    if (!Number.isInteger(targetPaise) || targetPaise <= 0) {
      throw new ValidationError('Target must be a positive integer in paise');
    }

    const goal = await Goal.create({
      ownerId,
      name: name.trim(),
      targetPaise,
      savedPaise: 0,
      deadline: deadline ? new Date(deadline) : null,
      priority: priority || 'CUSTOM GOAL'
    });

    return goal;
  }

  /**
   * Deposit into a goal using two-leg transfer model (Account -> Goal)
   * Leg 1: transfer_out on Account
   * Leg 2: atomic increment on Goal.savedPaise
   */
  static async depositToGoal(ownerId, goalId, amountPaise, accountId) {
    if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
      throw new ValidationError('Deposit amount must be a positive integer in paise');
    }

    return await withTransactionSession(async (session) => {
      const sessionOpt = session ? { session } : {};

      const goal = await Goal.findOne({ _id: goalId, ownerId }, null, sessionOpt);
      if (!goal) throw new NotFoundError('Goal vault not found');

      let targetAccId = accountId;
      if (!targetAccId) {
        const defaultAcc = await Account.findOne({ ownerId, isDefault: true }, null, sessionOpt)
          || await Account.findOne({ ownerId }, null, sessionOpt);
        if (!defaultAcc) throw new NotFoundError('No payment account found');
        targetAccId = defaultAcc._id;
      }

      const transferId = new mongoose.Types.ObjectId();

      // Create transfer_out transaction leg on Account
      const { transaction: tx } = await TransactionService.createTransaction(
        {
          ownerId,
          accountId: targetAccId,
          type: 'transfer_out',
          amountPaise,
          categoryId: 'vault',
          categoryLabel: 'Savings Vault',
          subcategory: goal.name,
          note: `Contribution to ${goal.name}`,
          transferId
        },
        { session }
      );

      // Atomic update on Goal using findOneAndUpdate to verify existence and avoid overwriting race
      const updatedGoal = await Goal.findOneAndUpdate(
        { _id: goalId, ownerId },
        { $inc: { savedPaise: amountPaise } },
        { ...sessionOpt, new: true }
      );
      if (!updatedGoal) {
        // Goal was deleted concurrently by another request
        // Rollback the transfer_out transaction on the account to conserve money
        await TransactionService.softDeleteTransaction(tx._id, ownerId);
        throw new NotFoundError('Goal vault was deleted concurrently');
      }

      updatedGoal.updateStatus();
      await updatedGoal.save(sessionOpt);

      return { goal: updatedGoal, transaction: tx };
    });
  }

  /**
   * Delete a goal and atomically return any saved funds back to the default account.
   * Completely wrapped in withTransactionSession with idempotency protection.
   */
  static async deleteGoal(ownerId, goalId) {
    return await withTransactionSession(async (session) => {
      const sessionOpt = session ? { session } : {};

      // Atomically find and mark goal as closing/deleting or remove it directly
      // In standalone fallback without multi-doc sessions, findOneAndDelete atomically locks and returns the document
      const goal = await Goal.findOneAndDelete({ _id: goalId, ownerId }, sessionOpt);
      if (!goal) throw new NotFoundError('Goal vault not found or already deleted');

      // If goal had accumulated savings, return them back to the user's account atomically
      if (goal.savedPaise > 0) {
        const defaultAcc = await Account.findOne({ ownerId, isDefault: true }, null, sessionOpt)
          || await Account.findOne({ ownerId }, null, sessionOpt);

        if (!defaultAcc) {
          throw new NotFoundError('No target account found to refund saved goal funds');
        }

        const refundKey = `goal-refund-${goalId}-${goal.savedPaise}`;

        await TransactionService.createTransaction(
          {
            ownerId,
            accountId: defaultAcc._id,
            type: 'transfer_in',
            amountPaise: goal.savedPaise,
            categoryId: 'vault',
            categoryLabel: 'Savings Vault',
            subcategory: `Refund: ${goal.name}`,
            note: `Refund of saved balance upon closing ${goal.name}`
          },
          { 
            idempotencyKey: refundKey,
            session 
          }
        );
      }

      return { 
        success: true, 
        message: goal.savedPaise > 0 
          ? `Goal removed and ₹${(goal.savedPaise / 100).toLocaleString('en-IN')} refunded to your account`
          : 'Goal removed successfully' 
      };
    });
  }
}

module.exports = GoalService;

