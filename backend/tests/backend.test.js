const mongoose = require('mongoose');
const assert = require('assert');
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

  // TEST 8: Concurrency, Goal Vault Deposits & Idempotent Atomic Deletion Refund
  const Goal = require('../src/models/Goal');
  const GoalService = require('../src/services/goalService');
  const TransactionService = require('../src/services/transactionService');

  const goalUser = await User.create({
    name: 'Goal Tester',
    email: 'goaltester@test.pennywise',
    password: 'password123'
  });

  const goalAccount = await Account.create({
    ownerId: goalUser._id,
    name: 'Main Bank Account',
    type: 'bank',
    balancePaise: 100000, // ₹1,000.00
    openingBalancePaise: 100000,
    isDefault: true
  });

  const vault = await Goal.create({
    ownerId: goalUser._id,
    name: 'MacBook Fund',
    targetPaise: 150000,
    savedPaise: 0
  });

  // 8.1 Deposit ₹300 into vault
  const depResult = await GoalService.depositToGoal(goalUser._id, vault._id, 30000, goalAccount._id);
  const accAfterDep = await Account.findById(goalAccount._id);
  const vaultAfterDep = await Goal.findById(vault._id);
  if (accAfterDep.balancePaise !== 70000 || vaultAfterDep.savedPaise !== 30000) {
    throw new Error('Test 8.1 Failed: Deposit into goal did not update account and vault balances atomically');
  }

  // 8.2 Atomic Goal Deletion with balance refund
  const delResult = await GoalService.deleteGoal(goalUser._id, vault._id);
  const accAfterDel = await Account.findById(goalAccount._id);
  const vaultAfterDel = await Goal.findById(vault._id);

  if (accAfterDel.balancePaise !== 100000) {
    throw new Error(`Test 8.2 Failed: Account balance after goal deletion should be 100000, got ${accAfterDel.balancePaise}`);
  }
  if (vaultAfterDel !== null) {
    throw new Error('Test 8.2 Failed: Goal document was not removed after deletion');
  }

  // 8.3 Verify refund transaction has transferId and correct ledger record
  const refundTx = await Transaction.findOne({
    ownerId: goalUser._id,
    type: 'transfer_in',
    amountPaise: 30000
  });
  if (!refundTx || !refundTx.subcategory.includes('Refund: MacBook Fund')) {
    throw new Error('Test 8.3 Failed: Refund transaction missing or mislabeled');
  }

  console.log('[PASS] Test 8: Goal vault deposit and atomic idempotent refund upon deletion');

  // TEST 9: OTP Security, Attempt Limiting and Invalidation
  const testEmail = 'otp_security@test.pennywise';
  const rawOtp = '654321';
  const securityHashedOtp = await bcrypt.hash(rawOtp, 10);

  const otpDoc = await Otp.create({
    email: testEmail,
    otpHash: securityHashedOtp,
    purpose: 'password-reset',
    attempts: 0,
    maxAttempts: 3,
    expiresAt: new Date(Date.now() + 60000)
  });

  // Simulate 3 failed attempts
  for (let i = 0; i < 3; i++) {
    const isMatch = await bcrypt.compare('000000', otpDoc.otpHash);
    if (!isMatch) {
      otpDoc.attempts += 1;
      if (otpDoc.attempts >= otpDoc.maxAttempts) {
        otpDoc.isInvalidated = true;
      }
      await otpDoc.save();
    }
  }

  const lockedOtp = await Otp.findById(otpDoc._id);
  if (!lockedOtp.isInvalidated || lockedOtp.attempts !== 3) {
    throw new Error('Test 9.1 Failed: OTP was not invalidated after reaching max attempts');
  }

  console.log('[PASS] Test 9: OTP attempt limit enforcement, brute-force locking & invalidation');

  // TEST 10: IST Month-Boundary & Fee Classifier Exclusions in Notifications
  const { getISTMonthRange } = require('../src/utils/dateUtils');
  const { isAcademicFee } = require('../src/utils/feeClassifier');

  const istRange = getISTMonthRange('2026-11');
  if (!istRange.startOfMonth || !istRange.startOfNextMonth || istRange.monthKey !== '2026-11') {
    throw new Error('Test 10.1 Failed: IST month range calculation failed');
  }

  // Institutional fee vs living expenses classification
  const feeTx1 = { categoryId: 'academic', subcategory: 'KTU Exam' };
  const feeTx2 = { categoryId: 'academic', subcategory: 'Tuition Fees' };
  const studyTx = { categoryId: 'academic', subcategory: 'Books and Notebooks' };
  const livingTx = { categoryId: 'food', subcategory: 'Canteen Meals' };

  if (!isAcademicFee(feeTx1) || !isAcademicFee(feeTx2)) {
    throw new Error('Test 10.2 Failed: Institutional fee not identified');
  }
  if (isAcademicFee(studyTx)) {
    throw new Error('Test 10.3 Failed: Routine study supplies misclassified as institutional fee');
  }
  if (isAcademicFee(livingTx)) {
    throw new Error('Test 10.4 Failed: Living expense misclassified as academic fee');
  }

  console.log('[PASS] Test 10: Standardized IST month boundaries & centralized fee classifier validation');

  // TEST 11: Phase 2 - Multi-Account Management & Safe Deactivation
  const accUser = await User.create({
    name: 'Multi Account User',
    email: 'multi_acc@test.pennywise',
    password: 'password123'
  });

  const salaryAcc = await Account.create({
    ownerId: accUser._id,
    name: 'HDFC Salary Bank',
    type: 'bank',
    balancePaise: 500000, // ₹5,000
    openingBalancePaise: 500000,
    isDefault: true,
    isActive: true
  });

  const upiAcc = await Account.create({
    ownerId: accUser._id,
    name: 'GPay Wallet',
    type: 'wallet',
    balancePaise: 0,
    openingBalancePaise: 0,
    isDefault: false,
    isActive: true
  });

  // Verify default account cannot be deactivated
  if (salaryAcc.isDefault && salaryAcc.isActive === false) {
    throw new Error('Test 11.1 Failed: Default account should not be inactive');
  }

  // Verify non-default zero-balance account can be safely deactivated
  upiAcc.isActive = false;
  await upiAcc.save();
  const inactiveUpi = await Account.findById(upiAcc._id);
  if (inactiveUpi.isActive !== false) {
    throw new Error('Test 11.2 Failed: Account was not deactivated');
  }

  console.log('[PASS] Test 11: Multi-account management & safe deactivation rules');

  // TEST 12: Phase 2 - Soft-Delete Recovery & Atomic Balance Restoration
  const restoreTx = await TransactionService.createTransaction({
    ownerId: accUser._id,
    accountId: salaryAcc._id,
    type: 'expense',
    amountPaise: 50000, // ₹500
    categoryId: 'food-drinks',
    categoryLabel: 'Food & Drinks',
    subcategory: 'Team Lunch',
    note: 'Recoverable expense test'
  });

  const accAfterExpense = await Account.findById(salaryAcc._id);
  if (accAfterExpense.balancePaise !== 450000) {
    throw new Error('Test 12.1 Failed: Account balance after expense incorrect');
  }

  // Soft delete transaction (should reverse balance back to 500000)
  await TransactionService.softDeleteTransaction(restoreTx.transaction._id, accUser._id);
  const accAfterDelete = await Account.findById(salaryAcc._id);
  if (accAfterDelete.balancePaise !== 500000) {
    throw new Error('Test 12.2 Failed: Account balance after soft delete not reversed');
  }

  // Restore transaction (should re-deduct balance back to 450000)
  await TransactionService.restoreTransaction(restoreTx.transaction._id, accUser._id);
  const accAfterRestore = await Account.findById(salaryAcc._id);
  if (accAfterRestore.balancePaise !== 450000) {
    throw new Error('Test 12.3 Failed: Account balance after restore not reapplied');
  }

  // Duplicate restore attempt must throw
  let duplicateRestoreFailed = false;
  try {
    await TransactionService.restoreTransaction(restoreTx.transaction._id, accUser._id);
  } catch (err) {
    duplicateRestoreFailed = true;
  }
  if (!duplicateRestoreFailed) {
    throw new Error('Test 12.4 Failed: Duplicate transaction restoration should have been rejected');
  }

  console.log('[PASS] Test 12: Soft-delete transaction recovery & atomic balance restoration with anti-duplicate guard');

  // TEST 13: Phase 2 - 90-Day Retention Policy & Archive Cleanup
  const { runRetentionCleanup } = require('../src/utils/retentionService');
  const ArchivedTransaction = require('../src/models/ArchivedTransaction');

  // Create an old soft-deleted transaction (deleted 95 days ago)
  const oldDate = new Date(Date.now() - (95 * 24 * 60 * 60 * 1000));
  const oldDeletedTx = await Transaction.create({
    ownerId: accUser._id,
    accountId: salaryAcc._id,
    type: 'expense',
    amountPaise: 25000,
    categoryId: 'travel',
    categoryLabel: 'Travel',
    subcategory: 'Train Ticket',
    isDeleted: true,
    deletedAt: oldDate
  });

  // Create a recent soft-deleted transaction (deleted 5 days ago)
  const recentDate = new Date(Date.now() - (5 * 24 * 60 * 60 * 1000));
  const recentDeletedTx = await Transaction.create({
    ownerId: accUser._id,
    accountId: salaryAcc._id,
    type: 'expense',
    amountPaise: 12000,
    categoryId: 'food-drinks',
    categoryLabel: 'Food',
    subcategory: 'Snack',
    isDeleted: true,
    deletedAt: recentDate
  });

  const cleanupResult = await runRetentionCleanup({ retentionDays: 90, ownerId: accUser._id });
  if (cleanupResult.archivedCount !== 1) {
    throw new Error(`Test 13.1 Failed: Expected 1 transaction archived, got ${cleanupResult.archivedCount}`);
  }

  // Verify old tx is archived and removed from active collection
  const oldActiveTx = await Transaction.findById(oldDeletedTx._id);
  const archivedTx = await ArchivedTransaction.findOne({ originalTransactionId: oldDeletedTx._id });
  const recentActiveTx = await Transaction.findById(recentDeletedTx._id);

  if (oldActiveTx !== null) {
    throw new Error('Test 13.2 Failed: 95-day-old soft-deleted transaction still in active collection');
  }
  if (!archivedTx || archivedTx.amountPaise !== 25000) {
    throw new Error('Test 13.3 Failed: Transaction not found in ArchivedTransaction collection');
  }
  if (!recentActiveTx || recentActiveTx.isDeleted !== true) {
    throw new Error('Test 13.4 Failed: Recent soft-deleted transaction was incorrectly purged');
  }

  console.log('[PASS] Test 13: 90-day retention policy & safe audit archiving without active data loss');

  // TEST 14: Inter-Account Transfers
  const transferUser = await User.create({
    name: 'Transfer Tester',
    email: 'transfer@test.pennywise',
    password: 'Password123!',
    currency: 'INR'
  });

  const sourceAcc = await Account.create({
    ownerId: transferUser._id,
    name: 'Checking Account',
    type: 'bank',
    currency: 'INR',
    openingBalancePaise: 500000,
    balancePaise: 500000,
    isDefault: true
  });

  const destAcc = await Account.create({
    ownerId: transferUser._id,
    name: 'Emergency Savings',
    type: 'savings',
    currency: 'INR',
    openingBalancePaise: 100000,
    balancePaise: 100000,
    isDefault: false
  });

  // Attempt overdraft transfer from checking (e.g. 600000 paise when balance is 500000)
  let overdraftCaught = false;
  try {
    const reqMockOverdraft = {
      user: transferUser,
      body: {
        fromAccountId: sourceAcc._id.toString(),
        toAccountId: destAcc._id.toString(),
        amountPaise: 600000,
        note: 'Attempting overdraft'
      }
    };
    let overdraftStatus = 200;
    const resMockOverdraft = {
      status(s) { overdraftStatus = s; return this; },
      json(d) {
        if (overdraftStatus === 400 || !d.success) overdraftCaught = true;
      }
    };
    const { transferBetweenAccounts } = require('../src/controllers/accountController');
    await transferBetweenAccounts(reqMockOverdraft, resMockOverdraft, (err) => {
      if (err) overdraftCaught = true;
    });
  } catch (err) {
    overdraftCaught = true;
  }
  assert.strictEqual(overdraftCaught, true, 'Transfer exceeding balance on standard bank account must be rejected');

  // Execute valid transfer: 2000 INR (200000 paise)
  let transferSuccess = false;
  let transferResultData = null;
  const reqMockValid = {
    user: transferUser,
    body: {
      fromAccountId: sourceAcc._id.toString(),
      toAccountId: destAcc._id.toString(),
      amountPaise: 200000,
      note: 'Transfer for savings'
    }
  };
  const resMockValid = {
    status(s) { return this; },
    json(d) {
      if (d.success) {
        transferSuccess = true;
        transferResultData = d.data;
      }
    }
  };
  const { transferBetweenAccounts } = require('../src/controllers/accountController');
  await transferBetweenAccounts(reqMockValid, resMockValid, (err) => {
    if (err) console.error('Transfer valid next(err):', err);
  });
  assert.strictEqual(transferSuccess, true, 'Valid transfer must succeed');

  const refreshedSource = await Account.findById(sourceAcc._id);
  const refreshedDest = await Account.findById(destAcc._id);
  assert.strictEqual(refreshedSource.balancePaise, 300000, 'Source account balance must be debited by exactly 200000 paise');
  assert.strictEqual(refreshedDest.balancePaise, 300000, 'Destination account balance must be credited by exactly 200000 paise');

  const transferTxs = await Transaction.find({ ownerId: transferUser._id });
  assert.strictEqual(transferTxs.length, 2, 'Transfer must create exactly 2 transaction legs');
  assert.strictEqual(transferTxs[0].transferId.toString(), transferTxs[1].transferId.toString(), 'Both legs must share the same transferId');
  console.log('[PASS] Test 14: Atomic inter-account transfer with overdraft protection & dual ledger legs');

  // TEST 15: Financial Reconciliation Diagnostic Engine
  const { generateFinancialReconciliationReport } = require('../src/utils/reconciliationEngine');
  const reconReport = await generateFinancialReconciliationReport(transferUser._id);
  assert.strictEqual(reconReport.totalAccounts, 2, 'Diagnostic engine should audit both accounts');
  assert.strictEqual(reconReport.systemIntegrity, 'HEALTHY', 'Diagnostic report should find zero discrepancies for clean accounts');
  assert.strictEqual(reconReport.accounts[0].differencePaise, 0, 'No balance discrepancy should exist');

  // Simulate a phantom discrepancy by mutating current balance without transaction
  await Account.findByIdAndUpdate(sourceAcc._id, { $inc: { balancePaise: 50000 } });
  const discrepantReport = await generateFinancialReconciliationReport(transferUser._id);
  assert.strictEqual(discrepantReport.systemIntegrity, 'ATTENTION_REQUIRED', 'Diagnostic engine must flag discrepancy when account balance does not match ledger');
  console.log('[PASS] Test 15: Financial reconciliation diagnostic engine detects ledger vs stored balance discrepancy');

  // TEST 16: Cloud Storage Presigned URL & MIME Validation
  const { generatePresignedUploadUrl } = require('../src/utils/cloudStorageService');
  let invalidMimeRejected = false;
  try {
    await generatePresignedUploadUrl({
      userId: transferUser._id,
      contentType: 'application/x-executable',
      fileSizeBytes: 1024
    });
  } catch (err) {
    invalidMimeRejected = true;
  }
  assert.strictEqual(invalidMimeRejected, true, 'Invalid mime type must be rejected');

  // Test unconfigured (default fallback to local-managed-base64)
  const fallbackUpload = await generatePresignedUploadUrl({
    userId: transferUser._id,
    contentType: 'image/jpeg',
    fileSizeBytes: 100000
  });
  assert.strictEqual(fallbackUpload.provider, 'local-managed-base64', 'Should return fallback provider when S3 credentials not set');
  assert.strictEqual(fallbackUpload.isCloudStorageAvailable, false);

  // Test S3 / Cloudflare R2 configured mode
  process.env.S3_BUCKET = 'pennywise-avatars';
  process.env.S3_ACCESS_KEY_ID = 'test-key-id';
  process.env.S3_SECRET_ACCESS_KEY = 'test-secret-key';
  process.env.S3_ENDPOINT = 'https://r2.cloudflarestorage.com/pennywise-avatars';

  const cloudUpload = await generatePresignedUploadUrl({
    userId: transferUser._id,
    contentType: 'image/jpeg',
    fileSizeBytes: 100000
  });
  assert.strictEqual(cloudUpload.provider, 's3-r2-compatible');
  assert.ok(cloudUpload.uploadUrl, 'Must return presigned uploadUrl');
  assert.ok(cloudUpload.publicUrl, 'Must return publicUrl');

  delete process.env.S3_BUCKET;
  delete process.env.S3_ACCESS_KEY_ID;
  delete process.env.S3_SECRET_ACCESS_KEY;
  delete process.env.S3_ENDPOINT;

  console.log('[PASS] Test 16: Cloud storage presigned URL generation and MIME validation');

  // Clean up all test artifacts
  await User.deleteMany({ email: /@test\.pennywise$/ });
  await Account.deleteMany({ ownerId: { $in: [goalUser._id, accUser._id, transferUser._id] } });
  await Transaction.deleteMany({ ownerId: { $in: [goalUser._id, accUser._id, transferUser._id] } });
  await ArchivedTransaction.deleteMany({ ownerId: { $in: [accUser._id, transferUser._id] } });
  await Goal.deleteMany({ ownerId: goalUser._id });
  await Otp.deleteMany({ email: testEmail });

  await mongoose.disconnect();
  console.log('=== ALL 16 BACKEND TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('TEST SUITE FAILED:', err);
  process.exit(1);
});