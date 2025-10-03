const mongoose = require('mongoose');

const savingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    month: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['mother', 'fund'],
      required: true
    },
    depositDate: {
      type: Date,
      required: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    recipient: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
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
savingSchema.index({ userId: 1, month: -1 });
savingSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Saving', savingSchema);
