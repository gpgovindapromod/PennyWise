const express = require('express');
const router = express.Router();
const { 
  register, 
  sendRegisterOtp,
  verifyRegisterOtp,
  forgotPassword,
  resetPassword,
  login, 
  getMe, 
  updateProfile, 
  clearUserData,
  changePassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public authentication & OTP routes
router.post('/register', register);
router.post('/register-otp', sendRegisterOtp);
router.post('/verify-register', verifyRegisterOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/reset-data', protect, clearUserData);

module.exports = router;
