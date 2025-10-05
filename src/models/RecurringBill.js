const mongoose = require('mongoose');

const recurringBillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['rent', 'electricity', 'water', 'internet', 'parking', 'garbage', 'other'],
      default: 'other'
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    frequency: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    dueDay: {
      type: Number,
      min: 1,
      max: 31
    },
    nextDueDate: {
      type: Date,
      required: true
    },
    lastPaidDate: {
      type: Date
    },
    lastPaidAmount: {
      type: Number,
      default: 0
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    autoDebit: {
      type: Boolean,
      default: false
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount'
    },
    reminderDays: {
      type: Number,
      default: 3,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
recurringBillSchema.index({ userId: 1, isActive: 1 });
recurringBillSchema.index({ userId: 1, nextDueDate: 1 });
recurringBillSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('RecurringBill', recurringBillSchema);
