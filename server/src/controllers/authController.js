const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const AcademicFee = require('../models/AcademicFee');
const MonthlyBudget = require('../models/MonthlyBudget');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pennywise_student_secret_key_2026_jwt_token', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      college: college || 'Engineering College'
    });

    // Create default Cash account with initial 0 balance
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

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
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

module.exports = { register, login, getMe, clearUserData };
