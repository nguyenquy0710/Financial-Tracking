const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Date,
    required: true
  },
  company: {
    type: String,
    trim: true,
    default: 'VIHAT'
  },
  baseSalary: {
    type: Number,
    default: 0,
    min: 0
  },
  kpi: {
    type: Number,
    default: 0
  },
  leader: {
    type: Number,
    default: 0
  },
  project: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  bonus13thMonth: {
    type: Number,
    default: 0
  },
  totalCompanySalary: {
    type: Number,
    default: 0
  },
  freelance: {
    dakiatech: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  totalIncome: {
    type: Number,
    default: 0
  },
  receiveDate: {
    type: Date
  },
  notes: {
    type: String
  },
  growth: {
    basicSalary: { type: Number, default: 0 },
    freelance: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for efficient queries
salarySchema.index({ userId: 1, month: -1 });
salarySchema.index({ userId: 1, company: 1 });

module.exports = mongoose.model('Salary', salarySchema);
