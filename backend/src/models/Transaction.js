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
    enum: ['income', 'expense', 'transfer', 'transfer_out', 'transfer_in', 'refund'],
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
    trim: true,
    lowercase: true
  },
  categoryLabel: {
    type: String,
    required: true,
    trim: true
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
  // Transfer correlation ID for two-leg account/vault transfers
  transferId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true
  },
  // Idempotency key supplied by client to prevent duplicate submissions
  idempotencyKey: {
    type: String,
    sparse: true,
    index: true
  },
  // Soft delete flag to preserve ledger audit trail & balance reconciliations
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ ownerId: 1, date: -1 });
transactionSchema.index(
  { ownerId: 1, idempotencyKey: 1 },
  { 
    unique: true, 
    partialFilterExpression: { idempotencyKey: { $type: 'string' } } 
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
