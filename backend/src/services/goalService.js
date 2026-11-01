const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const TransactionService = require('./transactionService');
const { AppError, NotFoundError, ValidationError, ConflictError } = require('../errors/AppError');

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

    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        const goal = await Goal.findOne({ _id: goalId, ownerId }).session(session);
        if (!goal) throw new NotFoundError('Goal vault not found');

        let targetAccId = accountId;
        if (!targetAccId) {
          const defaultAcc = await Account.findOne({ ownerId, isDefault: true }).session(session)
            || await Account.findOne({ ownerId }).session(session);
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

        // Atomic update on Goal
        goal.savedPaise += amountPaise;
        goal.updateStatus();
        await goal.save({ session });

        result = { goal, transaction: tx };
      });
      return result;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Delete a goal
   */
  static async deleteGoal(ownerId, goalId) {
    const goal = await Goal.findOneAndDelete({ _id: goalId, ownerId });
    if (!goal) throw new NotFoundError('Goal vault not found');
    return { success: true, message: 'Goal removed successfully' };
  }
}

module.exports = GoalService;

