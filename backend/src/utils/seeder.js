const mongoose = require('mongoose');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const MonthlyBudget = require('../models/MonthlyBudget');
const AcademicFee = require('../models/AcademicFee');

const seedDemoData = async (userId) => {
  // Check if transactions exist
  const count = await Transaction.countDocuments({ ownerId: userId });
  if (count > 0) return;

  let account = await Account.findOne({ ownerId: userId, isDefault: true });
  if (!account) {
    account = await Account.create({
      ownerId: userId,
      name: 'Cash in Hand',
      type: 'cash',
      balancePaise: 1245000, // ₹12,450.00
      isDefault: true
    });
  } else {
    account.balancePaise = 1245000;
    await account.save();
  }

  const now = new Date();
  const currentMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

  // Set monthly goal of ₹6,000
  await MonthlyBudget.findOneAndUpdate(
    { ownerId: userId, monthKey: currentMonthKey },
    { limitPaise: 600000, categoryLimits: [] },
    { upsert: true }
  );

  // Seed Academic Fee obligation: Semester Fee ₹25,000 due next month
  const feeDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  const fee = await AcademicFee.create({
    ownerId: userId,
    title: 'Semester 5 Tuition & Examination Fee',
    feeType: 'semester',
    academicYear: '2026-2027',
    semester: 'Semester 5',
    totalAmountPaise: 2500000, // ₹25,000
    dueDate: feeDueDate,
    notes: 'Pay before semester examination hall ticket issue',
    installments: [],
    status: 'unpaid'
  });

  // Sample transactions
  const sampleTxs = [
    {
      ownerId: userId,
      accountId: account._id,
      type: 'income',
      amountPaise: 800000, // ₹8,000
      categoryId: 'allowance',
      categoryLabel: 'Allowance / Pocket Money',
      subcategory: 'Monthly allowance from home',
      date: new Date(now.getFullYear(), now.getMonth(), 2),
      note: 'October monthly allowance'
    },
    {
      ownerId: userId,
      accountId: account._id,
      type: 'expense',
      amountPaise: 3000, // ₹30
      categoryId: 'food-drinks',
      categoryLabel: 'Food & Drinks',
      subcategory: 'Tea with snacks',
      date: new Date(),
      note: 'Tea and banana roast at college canteen'
    },
    {
      ownerId: userId,
      accountId: account._id,
      type: 'expense',
      amountPaise: 2000, // ₹20
      categoryId: 'academic',
      categoryLabel: 'Academic Expenses',
      subcategory: 'Photocopy & printing',
      date: new Date(),
      note: 'Assignment photocopy'
    },
    {
      ownerId: userId,
      accountId: account._id,
      type: 'expense',
      amountPaise: 18000, // ₹180
      categoryId: 'food-drinks',
      categoryLabel: 'Food & Drinks',
      subcategory: 'Biriyani',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      note: 'Hostel group dinner'
    },
    {
      ownerId: userId,
      accountId: account._id,
      type: 'expense',
      amountPaise: 45000, // ₹450
      categoryId: 'academic',
      categoryLabel: 'Academic Expenses',
      subcategory: 'Textbooks',
      date: new Date(now.getFullYear(), now.getMonth(), 6),
      note: 'Database System Concepts textbook'
    },
    {
      ownerId: userId,
      accountId: account._id,
      type: 'expense',
      amountPaise: 15000, // ₹150
      categoryId: 'travel',
      categoryLabel: 'Travel & Transport',
      subcategory: 'Bus ticket/pass',
      date: new Date(now.getFullYear(), now.getMonth(), 7),
      note: 'KSRTC bus pass renewal'
    }
  ];

  await Transaction.insertMany(sampleTxs);
  console.log('Demo student data seeded successfully for user ' + userId);
};

module.exports = { seedDemoData };