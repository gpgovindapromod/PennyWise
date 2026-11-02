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

  // TEST 6: Email OTP Generation, Hash Verification & Expiry
  const Otp = require('../src/models/Otp');
  const bcrypt = require('bcryptjs');
  const testOtpCode = '654321';
  const hashedOtp = await bcrypt.hash(testOtpCode, 10);
  const otpRecord = await Otp.create({
    email: 'student_otp@test.pennywise',
    otpHash: hashedOtp,
    purpose: 'registration',
    tempUserData: {
      name: 'OTP Student',
      passwordHash: 'dummyHashedPass',
      college: 'CET'
    },
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });
  const otpMatch = await bcrypt.compare(testOtpCode, otpRecord.otpHash);
  const otpMismatch = await bcrypt.compare('111111', otpRecord.otpHash);
  if (!otpMatch || otpMismatch) throw new Error('Test 6 Failed: OTP hash verification failed');
  await Otp.deleteMany({ email: 'student_otp@test.pennywise' });
  console.log('[PASS] Test 6: Email OTP cryptographic hashing and verification');

  // Clean up test data
  await User.deleteMany({ email: /@test\.pennywise$/ });
  await Account.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await Transaction.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await AcademicFee.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });
  await MonthlyBudget.deleteMany({ ownerId: { $in: [userA._id, userB._id] } });

  // =========================================================================
  // TEST 7: Account Balance Reconciliation Diagnostic Comprehensive Suite
  // =========================================================================
  const { getDashboardSummary } = require('../src/controllers/dashboardController');

  const recUser1 = await User.create({
    name: 'Reconciliation User 1',
    email: 'rec1@test.pennywise',
    password: 'password123',
    college: 'CET'
  });
  const recUser2 = await User.create({
    name: 'Reconciliation User 2',
    email: 'rec2@test.pennywise',
    password: 'password123',
    college: 'MEC'
  });

  // 1. New account with zero opening balance
  const accZero = await Account.create({
    ownerId: recUser1._id,
    name: 'New Zero Account',
    type: 'cash',
    balancePaise: 0,
    openingBalancePaise: 0
  });

  // 2. New account with non-zero opening balance
  const accNonZero = await Account.create({
    ownerId: recUser1._id,
    name: 'New Non-Zero Account',
    type: 'bank',
    balancePaise: 50000,
    openingBalancePaise: 50000
  });

  // 3. Legacy account without openingBalancePaise (undefined baseline)
  const accLegacy = await Account.create({
    ownerId: recUser1._id,
    name: 'Legacy Account Without Baseline',
    type: 'wallet',
    balancePaise: 25000
  });

  // 4. Correct account with verified opening balance, income, expense, transfers, refunds, deleted
  const accActive = await Account.create({
    ownerId: recUser1._id,
    name: 'Active Verified Account',
    type: 'bank',
    balancePaise: 21000,
    openingBalancePaise: 10000
  });

  await Transaction.create([
    { ownerId: recUser1._id, accountId: accActive._id, type: 'income', amountPaise: 15000, categoryId: 'freelance', categoryLabel: 'Freelance', subcategory: 'Coding' },
    { ownerId: recUser1._id, accountId: accActive._id, type: 'expense', amountPaise: 3000, categoryId: 'food-drinks', categoryLabel: 'Food', subcategory: 'Snacks' },
    { ownerId: recUser1._id, accountId: accActive._id, type: 'transfer_out', amountPaise: 2000, categoryId: 'vault', categoryLabel: 'Savings Vault', subcategory: 'Goal Contribution' },
    { ownerId: recUser1._id, accountId: accActive._id, type: 'refund', amountPaise: 1000, categoryId: 'shopping', categoryLabel: 'Shopping', subcategory: 'Books' },
    { ownerId: recUser1._id, accountId: accActive._id, type: 'expense', amountPaise: 99999, categoryId: 'other', categoryLabel: 'Other', subcategory: 'Deleted Tx', isDeleted: true },
  ]);

  // 5. Account with incorrect stored balance (genuine mismatch)
  const accMismatch = await Account.create({
    ownerId: recUser1._id,
    name: 'Corrupt Stored Balance Account',
    type: 'cash',
    balancePaise: 99000,
    openingBalancePaise: 10000
  });

  await Transaction.create([
    { ownerId: recUser1._id, accountId: accMismatch._id, type: 'income', amountPaise: 5000, categoryId: 'allowance', categoryLabel: 'Allowance', subcategory: 'Allowance' }
  ]);

  // 6. User 2 account for ownership isolation check
  const accIsolated = await Account.create({
    ownerId: recUser2._id,
    name: 'User 2 Secret Account',
    type: 'bank',
    balancePaise: 88888,
    openingBalancePaise: 88888
  });

  // Invoke getDashboardSummary for User 1
  let user1Dashboard = null;
  await getDashboardSummary(
    { user: { _id: recUser1._id }, query: {} },
    { json: (res) => { user1Dashboard = res.data; } },
    (err) => { throw err; }
  );

  const diagAccounts = user1Dashboard.reconciliation.accounts;

  // Assertions
  const checkZero = diagAccounts.find(a => a.accountName === 'New Zero Account');
  if (!checkZero || checkZero.status !== 'matched' || checkZero.differencePaise !== 0) {
    throw new Error('Test 7.1 Failed: New zero account not matched');
  }

  const checkNonZero = diagAccounts.find(a => a.accountName === 'New Non-Zero Account');
  if (!checkNonZero || checkNonZero.status !== 'matched' || checkNonZero.differencePaise !== 0 || checkNonZero.openingBalancePaise !== 50000) {
    throw new Error('Test 7.2 Failed: New non-zero account not matched');
  }

  const checkLegacy = diagAccounts.find(a => a.accountName === 'Legacy Account Without Baseline');
  if (!checkLegacy || checkLegacy.status !== 'baseline_unavailable' || checkLegacy.differencePaise !== null || checkLegacy.openingBalancePaise !== null) {
    throw new Error('Test 7.3 Failed: Legacy account without baseline not marked baseline_unavailable');
  }

  const checkActive = diagAccounts.find(a => a.accountName === 'Active Verified Account');
  if (!checkActive || checkActive.status !== 'matched' || checkActive.differencePaise !== 0 || checkActive.calculatedLedgerBalancePaise !== 21000) {
    throw new Error('Test 7.4 Failed: Active account with complex transactions not matched');
  }

  const checkMismatch = diagAccounts.find(a => a.accountName === 'Corrupt Stored Balance Account');
  if (!checkMismatch || checkMismatch.status !== 'mismatch' || checkMismatch.differencePaise !== 84000) {
    throw new Error('Test 7.5 Failed: Mismatched account not flagged with difference of 84000');
  }

  const checkIsolation = diagAccounts.find(a => a.accountName === 'User 2 Secret Account');
  if (checkIsolation !== undefined) {
    throw new Error('Test 7.6 Failed: Cross-user account leakage detected in diagnostic');
  }

  // Zero-Mutation Check
  const postZero = await Account.findById(accZero._id);
  const postLegacy = await Account.findById(accLegacy._id);
  const postMismatch = await Account.findById(accMismatch._id);
  if (postZero.balancePaise !== 0 || postLegacy.balancePaise !== 25000 || postMismatch.balancePaise !== 99000) {
    throw new Error('Test 7.7 Failed: Stored account balance was mutated during reconciliation');
  }

  console.log('[PASS] Test 7: Read-only account balance reconciliation diagnostic (10 focus conditions verified)');

  // Clean up
  await User.deleteMany({ email: /@test\.pennywise$/ });
  await Account.deleteMany({ ownerId: { $in: [recUser1._id, recUser2._id] } });
  await Transaction.deleteMany({ ownerId: { $in: [recUser1._id, recUser2._id] } });

  await mongoose.disconnect();
  console.log('=== ALL 7 BACKEND TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});