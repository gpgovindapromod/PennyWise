const mongoose = require('mongoose');

const otherIncomeSchema = new mongoose.Schema({
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
    required: [true, 'Income title is required'],
    trim: true,
    maxlength: 120
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  amountEarnedPaise: {
    type: Number,
    required: [true, 'Amount earned is required'],
    min: [0, 'Amount cannot be negative']
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
    default: 'upi'
  },
  transactionReference: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'partially_received', 'received', 'cancelled'],
    default: 'received',
    index: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('OtherIncome', otherIncomeSchema);
