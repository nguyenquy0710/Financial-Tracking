const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
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
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    period: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'monthly'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    alertThreshold: {
      type: Number,
      default: 80, // Alert when 80% of budget is used
      min: 0,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    },
    lastAlertDate: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Virtual for percentage spent
budgetSchema.virtual('percentageSpent').get(function () {
  return (this.spent / this.amount) * 100;
});

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.amount - this.spent);
});

// Index for faster queries
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, period: 1 });

// Ensure virtuals are included in JSON
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);
