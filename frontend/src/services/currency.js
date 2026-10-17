export const formatRupees = (paise) => {
  if (paise === null || paise === undefined) return '₹0.00';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
};

export const rupeesToPaise = (rupeesString) => {
  const num = parseFloat(rupeesString);
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};