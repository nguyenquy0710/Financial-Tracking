const mongoose = require('mongoose');

const vietQrBankSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: false
    },
    name: {
      type: String,
      required: false,
      trim: true
    },
    code: {
      type: String,
      required: false,
      trim: true,
      uppercase: true
    },
    bin: {
      type: String,
      required: false,
      trim: true
    },
    shortName: {
      type: String,
      required: false,
      trim: true
    },
    logo: {
      type: String,
      required: false,
      lowercase: true,
      trim: true
    },
    transferSupported: {
      type: Number,
      required: false
    },
    lookupSupported: {
      type: Number,
      required: false
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('VietQrBank', vietQrBankSchema);
