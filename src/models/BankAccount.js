const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
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
    accountHolder: {
      type: String,
      required: true,
      trim: true
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true
    },
    branch: {
      type: String,
      trim: true
    },
    identifier: {
      type: String,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
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
bankAccountSchema.index({ userId: 1, isActive: 1 });
bankAccountSchema.index({ userId: 1, bank: 1 });

module.exports = mongoose.model('BankAccount', bankAccountSchema);
