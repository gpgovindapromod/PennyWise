/**
 * Centralized Academic Fee Classification Utility
 * 
 * Accurately identifies institutional academic fee obligations (e.g. tuition,
 * semester dues, university exam dues) and cleanly separates them from routine
 * study expenses (books, stationery, printing) and non-academic living costs.
 */

// Normalized exact matches for known institutional fee subcategories
const EXACT_FEE_SUBCATEGORIES = new Set([
  'college fees',
  'college fee',
  'tuition fees',
  'tuition fee',
  'semester fees',
  'semester fee',
  'exam fees',
  'exam fee',
  'examination fees',
  'examination fee',
  'hostel fees',
  'hostel fee',
  'admission fees',
  'admission fee',
  'institutional fees',
  'institutional fee',
  'university fees',
  'university fee'
]);

// Non-fee academic/study subcategories that should NEVER be treated as institutional fee obligations
const STUDY_COST_REGEX = /\b(stationery|stationary|book|books|textbook|textbooks|notebook|notebooks|record|records|print|printing|photocopy|xerox|pen|pens|calculator|lab supply|lab supplies|component|components|workshop|certification|project material|project materials)\b/i;

// Institutional fee indicators within the subcategory
const INSTITUTIONAL_FEE_REGEX = /\b(fee|fees|exam|examination|tuition|semester|dues)\b/i;

/**
 * Determines whether a transaction represents an institutional academic fee payment.
 * 
 * Priority order:
 * 1. Structured link: `academicFeeId` presence guarantees it is a fee installment.
 * 2. Category check: Transaction MUST belong to the 'academic' category.
 *    Non-academic transactions (groceries, transport, bills) are NEVER classified as academic fees,
 *    regardless of user notes.
 * 3. Exact subcategory match from standard taxonomy.
 * 4. Exclusion guard: Prevents study supplies/stationery from being misclassified.
 * 5. Pattern match on normalized subcategory (e.g., 'KTU Exam', 'Semester 5 Exam Dues').
 * 
 * @param {Object} tx - The transaction document or object
 * @returns {boolean} - True if the transaction is an institutional fee, false otherwise
 */
function isAcademicFee(tx) {
  if (!tx) return false;

  // 1. Structured identification: explicit linkage to an AcademicFee obligation
  if (tx.academicFeeId) {
    return true;
  }

  // 2. Strict category barrier: only transactions in 'academic' category can be academic fees
  const categoryId = (tx.categoryId || '').toLowerCase().trim();
  if (categoryId !== 'academic') {
    return false;
  }

  // 3. Normalize subcategory
  const subcategory = (tx.subcategory || '').toLowerCase().trim();
  if (!subcategory) {
    return false;
  }

  // 4. Exact standard subcategory match
  if (EXACT_FEE_SUBCATEGORIES.has(subcategory)) {
    return true;
  }

  // 5. Explicitly exclude everyday study expenses, books, stationery, printing
  if (STUDY_COST_REGEX.test(subcategory)) {
    return false;
  }

  // 6. Institutional fee keyword pattern matching on subcategory (e.g., 'KTU Exam', 'Semester 5 Exam Dues')
  if (INSTITUTIONAL_FEE_REGEX.test(subcategory)) {
    return true;
  }

  return false;
}

module.exports = {
  isAcademicFee,
  EXACT_FEE_SUBCATEGORIES
};

