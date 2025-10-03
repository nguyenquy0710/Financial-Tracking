const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    propertyName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    month: {
      type: Date,
      required: true
    },
    rentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    electricity: {
      startReading: { type: Number, default: 0 },
      endReading: { type: Number, default: 0 },
      consumption: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    water: {
      startReading: { type: Number, default: 0 },
      endReading: { type: Number, default: 0 },
      consumption: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    internet: {
      type: Number,
      default: 0
    },
    parking: {
      type: Number,
      default: 0
    },
    garbage: {
      type: Number,
      default: 0
    },
    bonus: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    notes: {
      type: String
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paymentDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
rentalSchema.index({ userId: 1, month: -1 });
rentalSchema.index({ userId: 1, propertyName: 1 });

module.exports = mongoose.model('Rental', rentalSchema);
