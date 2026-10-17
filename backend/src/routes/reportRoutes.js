const express = require('express');
const router = express.Router();
const { getReportSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/summary', protect, getReportSummary);

module.exports = router;