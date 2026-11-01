const GoalService = require('../services/goalService');

const getGoals = async (req, res, next) => {
  try {
    const goals = await GoalService.getGoals(req.user._id);
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

const createGoal = async (req, res, next) => {
  try {
    const { name, targetPaise, deadline, priority } = req.body;
    const goal = await GoalService.createGoal(req.user._id, {
      name,
      targetPaise: parseInt(targetPaise, 10),
      deadline,
      priority
    });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

const depositToGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amountPaise, accountId } = req.body;
    const result = await GoalService.depositToGoal(
      req.user._id,
      id,
      parseInt(amountPaise, 10),
      accountId
    );
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await GoalService.deleteGoal(req.user._id, id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  createGoal,
  depositToGoal,
  deleteGoal
};

