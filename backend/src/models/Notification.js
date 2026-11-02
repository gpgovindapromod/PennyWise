const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['budget', 'fee', 'goal', 'security', 'system'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  link: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

