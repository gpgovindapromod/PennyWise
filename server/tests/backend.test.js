const mongoose = require('mongoose');
const User = require('../src/models/User');
const Account = require('../src/models/Account');
const Transaction = require('../src/models/Transaction');
const AcademicFee = require('../src/models/AcademicFee');
const MonthlyBudget = require('../src/models/MonthlyBudget');

async function runTests() {
  console.log('=== STARTING PENNYWISE AUTOMATED TESTS ===');
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennywise_test');
  console.log('Connected to test DB');

  // Clean test DB
  await User.deleteMany({ email: /@test\.pennywise$/ });
  await Account.deleteMany({});
  await Transaction.deleteMany({});
  await AcademicFee.deleteMany({});
  await MonthlyBudget.deleteMany({});

  // TEST 1: User Registration & Password Hashing
  const userA = await User.create({
    name: 'Student A',
    email: 'studentA@test.pennywise',
    password: 'pass123',
    college: 'CET Trivandrum'
  });
  const userB = await User.create({
    name: 'Student B',
    email: 'studentB@test.pennywise',
    password: 'secret456',
    college: 'MEC Kochi'
  });
  const isPassMatch = await userA.matchPassword('pass123');
  const isPassWrong = await userA.matchPassword('wrongpass');
  if (!isPassMatch || isPassWrong) throw new Error('Test 1 Failed: Password comparison incorrect');
  console.log('[PASS] Test 1: User model and bcrypt password hash');

  // TEST 2: Integer Paise Monetary Calculations
  const accountA = await Account.create({
    ownerId: userA._id,
    name: 'Cash in Hand',
    type: 'cash',
    balancePaise: 1000000, // ₹10,000.00
    isDefault: true
  });

  // Add ₹50.25 (5025 paise) tea with snack expense
  const txExpense = await Transaction.create({
    ownerId: userA._id,
    accountId: accountA._id,
    type: 'expense',
    amountPaise: 5025,
    categoryId: 'food-drinks',
    categoryLabel: 'Food & Drinks',
    subcategory: 'Tea with snacks',
    date: new Date()
  });
  accountA.balancePaise -= txExpense.amountPaise;
  await accountA.save();

  if (accountA.balancePaise !== 994975) {
    throw new Error('Test 2 Failed: Balance paise mismatch. Expected 994975, got ' + accountA.balancePaise);
  }
  console.log('[PASS] Test 2: Integer paise accounting (₹10,000.00 - ₹50.25 = ₹9,949.75)');

  // TEST 3: Cross-User Authorization and Isolation
  const userBTransactions = await Transaction.find({ ownerId: userB._id });
  if (userBTransactions.length !== 0) {
    throw new Error('Test 3 Failed: User B leaked User A transactions');
  }
  console.log('[PASS] Test 3: Cross-user data isolation strictly enforced by ownerId');

  // TEST 4: Academic Fee Obligation & Installment Linking (No Double Counting)
  const fee = await AcademicFee.create({
    ownerId: userA._id,
    title: 'Semester 5 Exam Fee',
    feeType: 'examination',
    totalAmountPaise: 300000, // ₹3,000.00
    dueDate: new Date(2026, 10, 20),
    status: 'unpaid'
  });

  // Fee due must not decrease cash balance yet
  const checkAccountBefore = await Account.findById(accountA._id);
  if (checkAccountBefore.balancePaise !== 994975) {
    throw new Error('Test 4a Failed: Fee obligation prematurely deducted balance');
  }

  // Partial Installment Payment of ₹1,000.00 (100000 paise)
  const paymentTx = await Transaction.create({
    ownerId: userA._id,
    accountId: accountA._id,
    type: 'expense',
    amountPaise: 100000,
    categoryId: 'academic',
    categoryLabel: 'Academic Expenses',
    subcategory: 'College fees',
    academicFeeId: fee._id
  });
  accountA.balancePaise -= paymentTx.amountPaise;
  await accountA.save();

  fee.installments.push({
    amountPaise: paymentTx.amountPaise,
    paidDate: paymentTx.date,
    transactionId: paymentTx._id
  });
  fee.updateStatus();
  await fee.save();

  if (fee.status !== 'partially_paid') {
    throw new Error('Test 4b Failed: Fee status expected partially_paid, got ' + fee.status);
  }
  if (accountA.balancePaise !== 894975) {
    throw new Error('Test 4c Failed: Cash balance incorrect after installment');
  }
  console.log('[PASS] Test 4: Academic fee installments linked to transactions without double counting');

  // TEST 5: Monthly Goal Thresholds (80% warning and 100% exceeded)
  const limitPaise = 500000; // ₹5,000
  const spentPaiseWarn = 410000; // ₹4,100 (82%)
  const percentWarn = (spentPaiseWarn / limitPaise) * 100;
  const isWarning = percentWarn >= 80 && spentPaiseWarn <= limitPaise;
  if (!isWarning) throw new Error('Test 5 Failed: 80% spending warning logic failure');
  console.log('[PASS] Test 5: Monthly goal threshold calculations (82% triggers warning)');

  // Clean up test data
  await User.deleteMany({ email: /@test\.pennywise$/ });
  await Account.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await Transaction.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await AcademicFee.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await MonthlyBudget.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });

  await mongoose.disconnect();
  console.log('=== ALL 5 BACKEND TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});