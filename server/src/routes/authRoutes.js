const express = require('express');
const router = express.Router();
const { register, login, getMe, clearUserData } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/reset-data', protect, clearUserData);

module.exports = router;

