const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  bookingDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  seatsBooked: {
    type: Number,
    default: 1,
    min: 1
  },
  packagePricePaise: {
    type: Number,
    required: true,
    min: 0
  },
  totalPricePaise: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
