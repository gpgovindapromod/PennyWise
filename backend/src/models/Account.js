const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'Cash in Hand'
  },
  type: {
    type: String,
    enum: ['cash', 'bank', 'savings', 'wallet', 'credit', 'loan', 'other'],
    default: 'cash'
  },
  balancePaise: {
    type: Number,
    required: true,
    default: 0
  },
  openingBalancePaise: {
    type: Number,
    required: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', accountSchema);
