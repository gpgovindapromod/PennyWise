const express = require('express');
const router = express.Router();
const { CATEGORIES } = require('../utils/categories');

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: CATEGORIES
  });
});

module.exports = router;
