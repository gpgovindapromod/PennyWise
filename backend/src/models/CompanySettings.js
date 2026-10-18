const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    trim: true,
    default: 'PennyWise Tours & Travels'
  },
  contactEmail: {
    type: String,
    trim: true,
    default: ''
  },
  contactPhone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  currency: {
    type: String,
    default: 'INR'
  },
  receiptPrefix: {
    type: String,
    trim: true,
    default: 'PWT'
  },
  customExpenseCategories: [{
    type: String,
    trim: true
  }],
  customCommissionCategories: [{
    type: String,
    trim: true
  }],
  customOtherIncomeCategories: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
