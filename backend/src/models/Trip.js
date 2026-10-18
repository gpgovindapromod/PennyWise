const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Trip name is required'],
    trim: true,
    maxlength: 120
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  route: {
    type: String,
    trim: true,
    default: ''
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required'],
    index: true
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required']
  },
  packageDescription: {
    type: String,
    trim: true,
    default: ''
  },
  packagePricePaise: {
    type: Number,
    required: [true, 'Package price per passenger is required'],
    min: [0, 'Package price cannot be negative']
  },
  maxCapacity: {
    type: Number,
    default: 30,
    min: [1, 'Capacity must be at least 1']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
    index: true
  },
  cancellationReason: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
