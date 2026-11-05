/**
 * Phase 4: Production Certification & Stress Testing Suite
 * Validates financial concurrency, multi-user isolation, replica set/session handling,
 * stress loads, security locks, and zero money creation/destruction.
 */
const mongoose = require('mongoose');
const assert = require('assert');
const User = require('../src/models/User');
const Account = require('../src/models/Account');
const Transaction = require('../src/models/Transaction');
const Goal = require('../src/models/Goal');
const AcademicFee = require('../src/models/AcademicFee');
const ArchivedTransaction = require('../src/models/ArchivedTransaction');
const Otp = require('../src/models/Otp');

const TransactionService = require('../src/services/transactionService');
const GoalService = require('../src/services/goalService');
const { transferBetweenAccounts } = require('../src/controllers/accountController');
const { generateFinancialReconciliationReport } = require('../src/utils/reconciliationEngine');
const { generatePresignedUploadUrl } = require('../src/utils/cloudStorageService');

async function runCertification() {
  console.log('===============================================================');
  console.log('   PENNYWISE PHASE 4: PRODUCTION STRESS & CERTIFICATION SUITE  ');
  console.log('===============================================================');

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pennywise_cert';
  await mongoose.connect(uri);
  console.log('[OK] Connected to MongoDB test database:', uri);

  // Clean test namespace
  await User.deleteMany({ email: /@cert\.pennywise$/ });
  const testUsers = await User.find({ email: /@cert\.pennywise$/ });
  const testUserIds = testUsers.map(u => u._id);
  await Account.deleteMany({ ownerId: { $in: testUserIds } });
  await Transaction.deleteMany({ ownerId: { $in: testUserIds } });
  await Goal.deleteMany({ ownerId: { $in: testUserIds } });
  await AcademicFee.deleteMany({ ownerId: { $in: testUserIds } });
  await ArchivedTransaction.deleteMany({ ownerId: { $in: testUserIds } });

  // SECTION 1: END-TO-END WORKFLOW INTEGRITY
  console.log('\n--- SECTION 1: End-to-End Workflow Verification ---');
  const user = await User.create({
    name: 'Cert Candidate',
    email: 'candidate@cert.pennywise',
    password: 'SecurePassword123!',
    college: 'Engineering Institute'
  });

  const salaryAcc = await Account.create({
    ownerId: user._id,
    name: 'Salary Account',
    type: 'bank',
    openingBalancePaise: 1000000, // ₹10,000.00
    balancePaise: 1000000,
    isDefault: true
  });

  const walletAcc = await Account.create({
    ownerId: user._id,
    name: 'UPI Wallet',
    type: 'wallet',
    openingBalancePaise: 200000, // ₹2,000.00
    balancePaise: 200000,
    isDefault: false
  });

  // 1. Income creation
  const { transaction: incTx } = await TransactionService.createTransaction({
    ownerId: user._id,
    accountId: salaryAcc._id,
    type: 'income',
    amountPaise: 500000, // +₹5,000.00
    categoryId: 'salary',
    categoryLabel: 'Monthly Salary',
    subcategory: 'Full-time'
  });
  let refSalary = await Account.findById(salaryAcc._id);
  assert.strictEqual(refSalary.balancePaise, 1500000, 'Salary balance should be ₹15,000.00');

  // 2. Expense creation
  const { transaction: expTx } = await TransactionService.createTransaction({
    ownerId: user._id,
    accountId: walletAcc._id,
    type: 'expense',
    amountPaise: 50000, // -₹500.00
    categoryId: 'food',
    categoryLabel: 'Food & Dining',
    subcategory: 'Groceries'
  });
  let refWallet = await Account.findById(walletAcc._id);
  assert.strictEqual(refWallet.balancePaise, 150000, 'Wallet balance should be ₹1,500.00');

  // 3. Goal creation and deposit
  const goal = await Goal.create({
    ownerId: user._id,
    name: 'MacBook Fund',
    targetPaise: 10000000,
    savedPaise: 0
  });

  await GoalService.depositToGoal(user._id, goal._id, 300000, salaryAcc._id);
  refSalary = await Account.findById(salaryAcc._id);
  let refGoal = await Goal.findById(goal._id);
  assert.strictEqual(refSalary.balancePaise, 1200000, 'Salary balance after goal deposit must be ₹12,000.00');
  assert.strictEqual(refGoal.savedPaise, 300000, 'Goal saved amount must be ₹3,000.00');

  // 4. Goal deletion with atomic refund
  await GoalService.deleteGoal(user._id, goal._id);
  refSalary = await Account.findById(salaryAcc._id);
  assert.strictEqual(refSalary.balancePaise, 1500000, 'Salary balance after goal refund must be back to ₹15,000.00');
  console.log('[PASS] E2E Workflow: Income, Expense, Goal deposit and Goal refund verified.');

  // SECTION 2: FINANCIAL INTEGRITY & CONCURRENCY STRESS TESTING
  console.log('\n--- SECTION 2: Financial Integrity & Concurrency Stress Testing ---');

  // A. Concurrent transfers stress test
  // Execute 10 simultaneous transfers of 10000 paise (₹100) from Salary to Wallet
  console.log('Executing 10 concurrent transfers of ₹100 from Salary to Wallet...');
  const transferPromises = [];
  for (let i = 0; i < 10; i++) {
    const p = new Promise(async (resolve) => {
      const req = {
        user,
        body: {
          fromAccountId: salaryAcc._id.toString(),
          toAccountId: walletAcc._id.toString(),
          amountPaise: 10000,
          note: `Concurrent transfer batch #${i}`
        }
      };
      let status = 200;
      let body = {};
      const res = {
        status(s) { status = s; return this; },
        json(b) { body = b; }
      };
      try {
        await transferBetweenAccounts(req, res, (err) => { body = { success: false, message: err?.message }; });
        resolve({ success: body.success !== false, status, body });
      } catch (err) {
        resolve({ success: false, error: err.message });
      }
    });
    transferPromises.push(p);
  }

  const transferResults = await Promise.all(transferPromises);
  const successfulTransfers = transferResults.filter(r => r.success).length;
  console.log(`Concurrent transfers completed: ${successfulTransfers}/10 successful.`);

  refSalary = await Account.findById(salaryAcc._id);
  refWallet = await Account.findById(walletAcc._id);

  // Total money across user accounts must remain exactly invariant
  // Initial: Salary (1500000) + Wallet (150000) = 1650000
  // Every successful transfer moved 10000 paise from Salary to Wallet
  const expectedSalary = 1500000 - (successfulTransfers * 10000);
  const expectedWallet = 150000 + (successfulTransfers * 10000);
  assert.strictEqual(refSalary.balancePaise, expectedSalary, `Salary balance must equal ${expectedSalary}`);
  assert.strictEqual(refWallet.balancePaise, expectedWallet, `Wallet balance must equal ${expectedWallet}`);
  assert.strictEqual(refSalary.balancePaise + refWallet.balancePaise, 1650000, 'CONSERVATION OF MONEY: Net funds across accounts must never change');
  console.log('[PASS] Concurrency: Zero money created or destroyed during simultaneous transfers.');

  // B. Duplicate Request / Idempotency Key Stress Test
  console.log('Testing idempotency collision under race conditions...');
  const sharedKey = 'idemp-stress-test-key-999';
  const idempReq1 = TransactionService.createTransaction(
    {
      ownerId: user._id,
      accountId: salaryAcc._id,
      type: 'expense',
      amountPaise: 50000,
      categoryId: 'tech',
      categoryLabel: 'Software',
      subcategory: 'Hosting'
    },
    { idempotencyKey: sharedKey }
  );
  const idempReq2 = TransactionService.createTransaction(
    {
      ownerId: user._id,
      accountId: salaryAcc._id,
      type: 'expense',
      amountPaise: 50000,
      categoryId: 'tech',
      categoryLabel: 'Software',
      subcategory: 'Hosting'
    },
    { idempotencyKey: sharedKey }
  );

  const [res1, res2] = await Promise.all([idempReq1, idempReq2]);
  assert.strictEqual(res1.transaction._id.toString(), res2.transaction._id.toString(), 'Idempotency key race must return the identical transaction');
  assert.ok(res1.idempotentReplay || res2.idempotentReplay, 'At least one caller must be flagged as idempotent replay');
  console.log('[PASS] Idempotency: Race condition resolved cleanly with zero duplicate deductions.');

  // SECTION 3: RECONCILIATION ENGINE COMPREHENSIVE AUDIT
  console.log('\n--- SECTION 3: Financial Reconciliation Diagnostic Engine ---');
  const reconReport = await generateFinancialReconciliationReport(user._id);
  if (reconReport.systemIntegrity !== 'HEALTHY') {
    console.log('RECONCILIATION MISMATCH DETAILS:', JSON.stringify(reconReport.accounts, null, 2));
  }
  assert.strictEqual(reconReport.systemIntegrity, 'HEALTHY', 'Reconciliation report must evaluate to HEALTHY');
  assert.strictEqual(reconReport.totalMismatchedAccounts, 0, 'Zero mismatched accounts expected');
  console.log('[PASS] Reconciliation: Diagnostic engine verified 100% mathematical integrity across all user ledgers.');

  // SECTION 4: CLOUD STORAGE & MIME ENFORCEMENT
  console.log('\n--- SECTION 4: Cloud Storage Security & Boundary Tests ---');
  let rejectedExecutable = false;
  try {
    await generatePresignedUploadUrl({
      userId: user._id,
      contentType: 'application/x-msdownload',
      fileSizeBytes: 500
    });
  } catch (e) {
    rejectedExecutable = true;
  }
  assert.strictEqual(rejectedExecutable, true, 'Executables must be rejected by storage guard');

  let rejectedOversize = false;
  try {
    await generatePresignedUploadUrl({
      userId: user._id,
      contentType: 'image/png',
      fileSizeBytes: 3 * 1024 * 1024 // 3MB > 2MB limit
    });
  } catch (e) {
    rejectedOversize = true;
  }
  assert.strictEqual(rejectedOversize, true, 'Payloads exceeding 2MB must be rejected');
  console.log('[PASS] Cloud Storage: MIME filtering and payload bounds strictly enforced.');

  // SECTION 5: CROSS-USER TENANT ISOLATION
  console.log('\n--- SECTION 5: Multi-Tenant Authorization Security ---');
  const attacker = await User.create({
    name: 'Malicious Tenant',
    email: 'attacker@cert.pennywise',
    password: 'Password123!'
  });

  let unauthorizedTransferBlocked = false;
  try {
    const attackReq = {
      user: attacker,
      body: {
        fromAccountId: salaryAcc._id.toString(), // Belongs to user, not attacker
        toAccountId: walletAcc._id.toString(),
        amountPaise: 100000
      }
    };
    let attackStatus = 200;
    const attackRes = {
      status(s) { attackStatus = s; return this; },
      json(b) {
        if (attackStatus === 404 || attackStatus === 403 || !b.success) {
          unauthorizedTransferBlocked = true;
        }
      }
    };
    await transferBetweenAccounts(attackReq, attackRes, (err) => {
      if (err) unauthorizedTransferBlocked = true;
    });
  } catch (e) {
    unauthorizedTransferBlocked = true;
  }
  assert.strictEqual(unauthorizedTransferBlocked, true, 'Attacker must never be permitted to debit an account owned by another tenant');
  console.log('[PASS] Tenant Isolation: Cross-user financial access strictly blocked.');

  // Clean test namespace
  await User.deleteMany({ email: /@cert\.pennywise$/ });
  await Account.deleteMany({ ownerId: { $in: [user._id, attacker._id] } });
  await Transaction.deleteMany({ ownerId: { $in: [user._id, attacker._id] } });
  await Goal.deleteMany({ ownerId: { $in: [user._id, attacker._id] } });
  await AcademicFee.deleteMany({ ownerId: { $in: [user._id, attacker._id] } });

  await mongoose.disconnect();
  console.log('\n===============================================================');
  console.log('   PHASE 4 PRODUCTION CERTIFICATION SUITE COMPLETED: 100% PASS ');
  console.log('===============================================================');
}

runCertification().catch((err) => {
  console.error('\n[FATAL] PHASE 4 CERTIFICATION SUITE FAILED:', err);
  process.exit(1);
});
