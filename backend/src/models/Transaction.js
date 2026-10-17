const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer', 'refund'],
    required: true
  },
  amountPaise: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be greater than zero']
  },
  categoryId: {
    type: String,
    required: true,
    enum: [
      'food-drinks',
      'academic',
      'travel',
      'shopping',
      'bills-utilities',
      'health',
      'entertainment',
      'personal-care',
      'allowance',
      'scholarship',
      'freelance',
      'other'
    ]
  },
  categoryLabel: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'cash', 'card'],
    default: 'upi'
  },
  // Optional linkage to fee obligation for academic installments
  academicFeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicFee',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ ownerId: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
