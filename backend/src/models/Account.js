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
    enum: ['cash', 'bank', 'savings', 'wallet', 'other'],
    default: 'cash'
  },
  balancePaise: {
    type: Number,
    required: true,
    default: 0
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Account', accountSchema);
