const mongoose = require('mongoose');

const archivedTransactionSchema = new mongoose.Schema({
  originalTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
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
    required: true
  },
  amountPaise: {
    type: Number,
    required: true
  },
  categoryId: String,
  categoryLabel: String,
  subcategory: String,
  date: Date,
  note: String,
  paymentMethod: String,
  academicFeeId: mongoose.Schema.Types.ObjectId,
  transferId: mongoose.Schema.Types.ObjectId,
  idempotencyKey: String,
  deletedAt: {
    type: Date,
    required: true
  },
  archivedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  retentionPolicyDays: {
    type: Number,
    default: 90
  }
});

archivedTransactionSchema.index({ ownerId: 1, archivedAt: -1 });

module.exports = mongoose.model('ArchivedTransaction', archivedTransactionSchema);

