const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Commission title or source is required'],
    trim: true,
    maxlength: 120
  },
  category: {
    type: String,
    required: [true, 'Commission category is required'],
    trim: true,
    index: true
  },
  amountEarnedPaise: {
    type: Number,
    required: [true, 'Earned commission amount is required'],
    min: [0, 'Earned amount cannot be negative']
  },
  amountReceivedPaise: {
    type: Number,
    default: 0,
    min: [0, 'Received amount cannot be negative']
  },
  dateEarned: {
    type: Date,
    default: Date.now,
    index: true
  },
  dateReceived: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'cash', 'bank_transfer', 'card', 'cheque', 'other'],
    default: 'bank_transfer'
  },
  transactionReference: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'partially_received', 'received', 'cancelled'],
    default: 'pending',
    index: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Commission', commissionSchema);
