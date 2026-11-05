const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AcademicFee = require('../models/AcademicFee');
const MonthlyBudget = require('../models/MonthlyBudget');
const Otp = require('../models/Otp');
const { sendOtpEmail, sendWelcomeEmail } = require('../utils/emailService');
const config = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
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

    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid input format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: String(normalizedEmail) });
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

    const isProduction = config.isProduction;

    res.status(200).json({
      success: true,
      message: emailResult.deliveredToInbox
        ? `A 6-digit verification code was sent to ${normalizedEmail}`
        : (isProduction ? 'A 6-digit verification code was sent.' : `Verification code generated! (Dev mode: ${otpCode})`),
      provider: isProduction ? undefined : emailResult.provider,
      devOtp: (!emailResult.deliveredToInbox && !isProduction) ? otpCode : undefined,
      warning: isProduction ? undefined : emailResult.warning
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify registration OTP and create user
// @route   POST /api/auth/verify-register
const verifyRegisterOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and the 6-digit verification code' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const record = await Otp.findOne({
      email: normalizedEmail,
      purpose: 'registration',
      expiresAt: { $gt: new Date() },
      isInvalidated: { $ne: true }
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Verification code is invalid, locked, or has expired. Please request a new one.' });
    }

    // Check maximum attempts
    if (record.attempts >= (record.maxAttempts || 5)) {
      record.isInvalidated = true;
      await record.save();
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. This code has been invalidated for security. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.otpHash);
    if (!isMatch) {
      record.attempts = (record.attempts || 0) + 1;
      if (record.attempts >= (record.maxAttempts || 5)) {
        record.isInvalidated = true;
      }
      await record.save();
      const remainingAttempts = Math.max(0, (record.maxAttempts || 5) - record.attempts);
      return res.status(400).json({ 
        success: false, 
        message: remainingAttempts > 0 
          ? `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`
          : 'Too many incorrect attempts. Code has been invalidated.'
      });
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
      openingBalancePaise: 0,
      isDefault: true
    });

    // Clean up OTP record
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'registration' });

    // Send asynchronous welcome email via pure Node.js Nodemailer
    sendWelcomeEmail(normalizedEmail, user.name).catch((err) => {
      console.error('[Welcome Email Background Error]:', err.message);
    });

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
    next(error);
  }
};

// @desc    Initiate Password Reset by sending OTP to email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email' });
    }

    if (typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: String(normalizedEmail) });

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
    const isProduction = config.isProduction;

    res.status(200).json({
      success: true,
      message: emailResult.deliveredToInbox
        ? `A 6-digit password reset code was sent to ${normalizedEmail}`
        : (isProduction ? 'A 6-digit password reset code was sent.' : `Reset code generated! (Dev mode: ${otpCode})`),
      provider: isProduction ? undefined : emailResult.provider,
      devOtp: (!emailResult.deliveredToInbox && !isProduction) ? otpCode : undefined,
      warning: isProduction ? undefined : emailResult.warning
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
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
      expiresAt: { $gt: new Date() },
      isInvalidated: { $ne: true }
    });

    if (!record) {
      return res.status(400).json({ success: false, message: 'Verification code is invalid, locked, or has expired. Please request a new code.' });
    }

    // Check maximum attempts
    if (record.attempts >= (record.maxAttempts || 5)) {
      record.isInvalidated = true;
      await record.save();
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. This code has been invalidated for security. Please request a new code.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), record.otpHash);
    if (!isMatch) {
      record.attempts = (record.attempts || 0) + 1;
      if (record.attempts >= (record.maxAttempts || 5)) {
        record.isInvalidated = true;
      }
      await record.save();
      const remainingAttempts = Math.max(0, (record.maxAttempts || 5) - record.attempts);
      return res.status(400).json({ 
        success: false, 
        message: remainingAttempts > 0 
          ? `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`
          : 'Too many incorrect attempts. Code has been invalidated.'
      });
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
    next(error);
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

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid credentials format' });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Use exact string query against normalized email, defensive against object query injection
    const user = await User.findOne({ email: String(cleanEmail) }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student',
        companyName: user.companyName || 'PennyWise Tours & Travels',
        mustChangePassword: Boolean(user.mustChangePassword),
        status: user.status || 'active',
        college: user.college,
        avatar: user.avatar || '',
        currency: user.currency,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Legacy direct register (fallback for existing automated tests)
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid input format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: String(normalizedEmail) });
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
      openingBalancePaise: 0,
      isDefault: true
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        avatar: user.avatar || '',
        currency: user.currency,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
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
    next(error);
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
    if (typeof college === 'string') user.college = college.trim();
    if (typeof req.body.avatar === 'string') {
      const avatarStr = req.body.avatar.trim();
      // Validate avatar: either empty string, or safe HTTP(S) URL, or valid base64 data URI under 2MB
      if (avatarStr === '' || /^https?:\/\//i.test(avatarStr)) {
        user.avatar = avatarStr;
      } else if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(avatarStr)) {
        // Enforce max 2MB payload size (~2.8MB base64 characters)
        if (avatarStr.length > 2.8 * 1024 * 1024) {
          return res.status(400).json({ success: false, message: 'Avatar image must be smaller than 2MB' });
        }

        // Verify magic bytes of the base64 payload to ensure real image data
        try {
          const rawBase64 = avatarStr.split(',')[1];
          const buffer = Buffer.from(rawBase64.slice(0, 32), 'base64');
          const isJpg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
          const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
          const isWebp = buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP';
          
          if (!isJpg && !isPng && !isWebp) {
            return res.status(400).json({ success: false, message: 'Avatar file contents do not match genuine image signatures (JPG, PNG, WebP only)' });
          }
        } catch (e) {
          return res.status(400).json({ success: false, message: 'Invalid image data' });
        }

        user.avatar = avatarStr;
      } else {
        return res.status(400).json({ success: false, message: 'Invalid avatar image format' });
      }
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'student',
        companyName: user.companyName,
        college: user.college,
        avatar: user.avatar,
        currency: user.currency
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password after initial login or from settings
// @route   PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password if user is not in forced initial change
    if (currentPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully! Your account is fully secured.'
    });
  } catch (error) {
    next(error);
  }
};

const getProfileUploadUrl = async (req, res, next) => {
  try {
    const { contentType, fileSizeBytes } = req.body;
    const { generatePresignedUploadUrl } = require('../utils/cloudStorageService');
    const uploadData = await generatePresignedUploadUrl({
      userId: req.user._id,
      contentType,
      fileSizeBytes
    });

    res.json({
      success: true,
      data: uploadData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
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
  clearUserData,
  changePassword,
  getProfileUploadUrl
};
