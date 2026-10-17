const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AcademicFee = require('../models/AcademicFee');
const MonthlyBudget = require('../models/MonthlyBudget');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pennywise_student_secret_key_2026_jwt_token', {
    expiresIn: '30d'
  });
};

// Generate random 6-digit numeric OTP
const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Initiate registration by sending OTP to email
// @route   POST /api/auth/register-otp
const sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Hash the password for temporary storage
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6 digit code & hash it for secure database storage
    const otpCode = generate6DigitOtp();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any old pending registration OTP for this email
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'registration' });

    // Store in Otp collection
    await Otp.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'registration',
      tempUserData: {
        name: name.trim(),
        passwordHash,
        college: (college && college.trim()) || 'Engineering College'
      },
      expiresAt
    });

    // Send email via Resend
    const emailResult = await sendOtpEmail(normalizedEmail, otpCode, 'registration');

    res.status(200).json({
      success: true,
      message: emailResult.deliveredToInbox
        ? `A 6-digit verification code was sent to ${normalizedEmail}`
        : `Verification code generated! (Dev mode: ${otpCode})`,
      provider: emailResult.provider,
      devOtp: !emailResult.deliveredToInbox ? otpCode : undefined,
      warning: emailResult.warning
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify registration OTP and create user
// @route   POST /api/auth/verify-register
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and the 6-digit verification code' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'registration',
      expiresAt: { $gt: new Date() }
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Verification code is invalid or has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.otpHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect 6-digit verification code' });
    }

    // Check if user was registered in the meantime
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      await Otp.deleteMany({ email: normalizedEmail, purpose: 'registration' });
      return res.status(400).json({ success: false, message: 'Account already created. Please log in.' });
    }

    // Create verified User (setting password hash directly)
    const user = new User({
      name: record.tempUserData.name,
      email: normalizedEmail,
      college: record.tempUserData.college || 'Engineering College'
    });
    // Set raw hashed password directly to bypass pre-save double-hashing
    user.password = record.tempUserData.passwordHash;
    await user.save();

    // Create default Cash account
    await Account.create({
      ownerId: user._id,
      name: 'Cash in Hand',
      type: 'cash',
      balancePaise: 0,
      isDefault: true
    });

    // Clean up OTP record
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'registration' });

    res.status(201).json({
      success: true,
      message: 'Account verified and created successfully!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        currency: user.currency,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initiate Password Reset by sending OTP to email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No account found with ${normalizedEmail}. Please check the email or create a new account.`
      });
    }

    const otpCode = generate6DigitOtp();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'password-reset' });

    await Otp.create({
      email: normalizedEmail,
      otpHash,
      purpose: 'password-reset',
      expiresAt
    });

    const emailResult = await sendOtpEmail(normalizedEmail, otpCode, 'password-reset');

    res.status(200).json({
      success: true,
      message: emailResult.deliveredToInbox
        ? `A 6-digit password reset code was sent to ${normalizedEmail}`
        : `Reset code generated! (Dev mode: ${otpCode})`,
      provider: emailResult.provider,
      devOtp: !emailResult.deliveredToInbox ? otpCode : undefined,
      warning: emailResult.warning
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, verification code, and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'password-reset',
      expiresAt: { $gt: new Date() }
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Verification code is invalid or has expired. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.otpHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect verification code' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // Clean up OTP record
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'password-reset' });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        currency: user.currency,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Legacy direct register (fallback for existing automated tests)
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      college: college || 'Engineering College'
    });

    await Account.create({
      ownerId: user._id,
      name: 'Cash in Hand',
      type: 'cash',
      balancePaise: 0,
      isDefault: true
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        currency: user.currency,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const accounts = await Account.find({ ownerId: req.user._id });
    res.json({
      success: true,
      data: {
        user,
        accounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear all user transactions & reset finances to zero
// @route   POST /api/auth/reset-data
const clearUserData = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    await Transaction.deleteMany({ ownerId });
    await AcademicFee.deleteMany({ ownerId });
    await MonthlyBudget.deleteMany({ ownerId });
    await Account.updateMany({ ownerId }, { $set: { balancePaise: 0 } });

    res.json({
      success: true,
      message: 'All transactions, budgets, and fees have been cleared. Balances reset to ₹0.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, college } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name && typeof name === 'string') user.name = name.trim();
    if (college && typeof college === 'string') user.college = college.trim();
    if (typeof req.body.avatar === 'string') user.avatar = req.body.avatar;

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        avatar: user.avatar,
        currency: user.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  register, 
  sendRegisterOtp,
  verifyRegisterOtp,
  forgotPassword,
  resetPassword,
  login, 
  getMe, 
  updateProfile, 
  clearUserData 
};
