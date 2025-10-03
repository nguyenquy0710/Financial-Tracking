const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bank: {
    type: String,
    required: true,
    trim: true
  },
  accountType: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'matured'],
    default: 'active'
  },
  accountName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  fundType: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date
  },
  maturityDate: {
    type: Date
  },
  termMonths: {
    type: Number,
    default: 0
  },
  interestRate: {
    type: Number,
    default: 0
  },
  principalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  interestAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
depositSchema.index({ userId: 1, status: 1 });
depositSchema.index({ userId: 1, bank: 1 });
depositSchema.index({ userId: 1, maturityDate: 1 });

module.exports = mongoose.model('Deposit', depositSchema);
