const express = require('express');
const router = express.Router();
const {
  getAcademicSummary,
  createFeeObligation,
  recordFeePayment
} = require('../controllers/academicController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getAcademicSummary);
router.post('/fees', createFeeObligation);
router.post('/fees/:id/payments', recordFeePayment);

module.exports = router;