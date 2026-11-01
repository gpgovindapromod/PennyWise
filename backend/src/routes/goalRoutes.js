const express = require('express');
const router = express.Router();
const { getGoals, createGoal, depositToGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.post('/:id/deposit', depositToGoal);
router.delete('/:id', deleteGoal);

module.exports = router;

