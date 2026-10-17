const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otpHash: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'password-reset'],
    required: true
  },
  // Temporary storage of registration details if OTP is for signup verification
  tempUserData: {
    name: String,
    passwordHash: String,
    college: String
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '10m' } // MongoDB TTL index to auto-delete expired OTPs after 10 mins
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Otp', otpSchema);
