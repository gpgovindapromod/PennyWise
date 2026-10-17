/**
 * Converts integer paise into user-facing INR string
 * e.g., 5025 paise -> "₹50.25"
 */
export const formatRupees = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
};

/**
 * Converts a rupee input value into integer paise to prevent floating point imprecision
 * e.g., "50.25" -> 5025
 */
export const rupeesToPaise = (rupees) => {
  if (!rupees) return 0;
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
};

/**
 * Clean ISO date formatting for academic logs & transactions
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
