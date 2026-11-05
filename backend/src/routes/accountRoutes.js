const express = require('express');
const router = express.Router();
const {
  getAccounts,
  createAccount,
  updateAccount,
  deactivateAccount,
  activateAccount,
  transferBetweenAccounts,
  getAccountReconciliation
} = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/reconciliation', getAccountReconciliation);
router.post('/transfer', transferBetweenAccounts);

router.route('/')
  .get(getAccounts)
  .post(createAccount);

router.route('/:id')
  .put(updateAccount);

router.patch('/:id/deactivate', deactivateAccount);
router.patch('/:id/activate', activateAccount);

module.exports = router;

