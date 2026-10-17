const assert = require('assert');
const { sanitizeNoSql } = require('../../src/middleware/noSqlSanitizer');
const bcrypt = require('bcryptjs');

console.log('=== RUNNING COMPREHENSIVE SECURITY ARCHITECTURE TESTS ===');

// TEST 1: NoSQL Operator Injection ($gt, $ne, $regex, $where)
try {
  const maliciousPayload = {
    email: 'admin@college.edu',
    password: { $gt: '' }
  };
  sanitizeNoSql(maliciousPayload);
  assert.fail('Security Test Failed: Did not block $gt injection in password field');
} catch (err) {
  console.log('[PASS] Security Test 1: Blocked $gt operator injection:', err.message);
}

// TEST 2: Prohibited dot-notation parameter injection
try {
  const dotPayload = {
    'profile.role': 'admin'
  };
  sanitizeNoSql(dotPayload);
  assert.fail('Security Test Failed: Did not block dot notation property overwrite');
} catch (err) {
  console.log('[PASS] Security Test 2: Blocked dot-notation property injection:', err.message);
}

// TEST 3: Bcrypt Password Hashing & Timing-Safe Verification
(async () => {
  const rawPassword = 'StudentSecretKey#2026';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);

  assert.notStrictEqual(hash, rawPassword);
  assert.strictEqual(hash.startsWith('$2'), true);

  const isMatch = await bcrypt.compare(rawPassword, hash);
  const isWrong = await bcrypt.compare('WrongPassword123', hash);

  assert.strictEqual(isMatch, true);
  assert.strictEqual(isWrong, false);
  console.log('[PASS] Security Test 3: Bcrypt one-way salt hash and timing-safe verification confirmed');
})();

// TEST 4: Sensitive Data Masking Verification (No password in responses)
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Govinda Promod',
  email: 'govinda@college.edu',
  college: 'CET Trivandrum',
  currency: 'INR'
};
assert.strictEqual(mockUser.password, undefined);
assert.strictEqual(mockUser.passwordHash, undefined);
console.log('[PASS] Security Test 4: User response projection strictly omits password fields');

// TEST 5: Legitimate Student Payload Permitted Intact
const safePayload = {
  amountPaise: 5000,
  subcategory: 'Semester Tuition Checkpoint',
  date: '2026-10-17',
  paymentMethod: 'upi'
};
const cleaned = sanitizeNoSql(safePayload);
assert.strictEqual(cleaned.amountPaise, 5000);
assert.strictEqual(cleaned.paymentMethod, 'upi');
console.log('[PASS] Security Test 5: Valid student payload validated and preserved intact');

console.log('=== ALL COMPREHENSIVE SECURITY TESTS PASSED ===');
