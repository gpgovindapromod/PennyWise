const mongoose = require('mongoose');

const passengerPaymentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    index: true
  },
  passengerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passenger',
    required: true,
    index: true
  },
  amountPaise: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Amount must be greater than zero']
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
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
  type: {
    type: String,
    enum: ['payment', 'refund'],
    default: 'payment'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('PassengerPayment', passengerPaymentSchema);
