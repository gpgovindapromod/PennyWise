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
    min: [0, 'Package price cannot be negative'],
    default: 0
  },
  packagePriceAdultPaise: {
    type: Number,
    min: [0, 'Adult package price cannot be negative'],
    default: 0
  },
  packagePriceChildPaise: {
    type: Number,
    min: [0, 'Child package price cannot be negative'],
    default: 0
  },
  capacity: {
    type: Number,
    default: 30,
    min: [1, 'Capacity must be at least 1']
  },
  maxCapacity: {
    type: Number,
    default: 30,
    min: [1, 'Capacity must be at least 1']
  },
  adultCount: {
    type: Number,
    default: 0,
    min: 0
  },
  childCount: {
    type: Number,
    default: 0,
    min: 0
  },
  directIncomePaise: {
    type: Number,
    default: 0,
    min: 0
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
