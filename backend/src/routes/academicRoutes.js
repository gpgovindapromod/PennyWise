const express = require('express');
const router = express.Router();
const {
  getAcademicSummary,
  createFeeObligation,
  recordFeePayment,
  updateFeeObligation,
  deleteFeeObligation
} = require('../controllers/academicController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getAcademicSummary);
router.post('/fees', createFeeObligation);
router.put('/fees/:id', updateFeeObligation);
router.delete('/fees/:id', deleteFeeObligation);
router.post('/fees/:id/payments', recordFeePayment);

module.exports = router;