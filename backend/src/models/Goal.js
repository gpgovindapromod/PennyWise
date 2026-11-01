const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true
  },
  targetPaise: {
    type: Number,
    required: [true, 'Target amount in paise is required'],
    min: [100, 'Target amount must be at least ₹1']
  },
  savedPaise: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['HIGH PRIORITY', 'MEDIUM PRIORITY', 'LOW PRIORITY', 'CUSTOM GOAL'],
    default: 'HIGH PRIORITY'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

goalSchema.methods.updateStatus = function() {
  if (this.savedPaise >= this.targetPaise) {
    this.status = 'completed';
  } else {
    this.status = 'active';
  }
};

module.exports = mongoose.model('Goal', goalSchema);

