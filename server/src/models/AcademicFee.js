const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  amountPaise: {
    type: Number,
    required: true
  },
  paidDate: {
    type: Date,
    default: Date.now
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  receiptNumber: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  }
});

const academicFeeSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Fee title/description is required'],
    trim: true
  },
  feeType: {
    type: String,
    enum: ['tuition', 'semester', 'examination', 'lab', 'admission', 'library', 'hostel', 'other'],
    default: 'semester'
  },
  academicYear: {
    type: String, // e.g. 2026-2027 or S5
    default: '2026-2027',
    trim: true
  },
  semester: {
    type: String,
    default: 'Semester 5',
    trim: true
  },
  totalAmountPaise: {
    type: Number,
    required: [true, 'Total fee obligation amount is required'],
    min: [1, 'Amount must be greater than zero']
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  installments: [installmentSchema],
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

academicFeeSchema.methods.updateStatus = function() {
  const totalPaid = this.installments.reduce((sum, item) => sum + item.amountPaise, 0);
  if (totalPaid >= this.totalAmountPaise) {
    this.status = 'paid';
  } else if (totalPaid > 0) {
    this.status = 'partially_paid';
  } else {
    this.status = 'unpaid';
  }
};

module.exports = mongoose.model('AcademicFee', academicFeeSchema);
