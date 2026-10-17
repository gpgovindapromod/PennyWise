const mongoose = require('mongoose');

const monthlyBudgetSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  monthKey: {
    type: String, // 'YYYY-MM' e.g. '2026-10'
    required: true,
    trim: true
  },
  limitPaise: {
    type: Number,
    required: true,
    default: 600000 // default 6000 INR
  },
  categoryLimits: [{
    categoryId: String,
    limitPaise: Number
  }],
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

monthlyBudgetSchema.index({ ownerId: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyBudget', monthlyBudgetSchema);
