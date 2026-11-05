const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  restoreTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.post('/:id/restore', restoreTransaction);

router.route('/:id')
  .patch(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;