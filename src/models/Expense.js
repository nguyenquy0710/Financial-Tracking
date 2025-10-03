const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  unitPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  previousMonthSalary: {
    type: Number,
    default: 0
  },
  // 6 jars allocation
  allocation: {
    motherGift: { type: Number, default: 0 }, // Gửi Mẹ
    nec: { type: Number, default: 0 }, // NEC (55%) - Nhu cầu thiết yếu
    ffa: { type: Number, default: 0 }, // FFA (10%) - Tự do tài chính
    educ: { type: Number, default: 0 }, // EDUC (10%) - Giáo dục Đào tạo
    play: { type: Number, default: 0 }, // PLAY (10%) - Hưởng thụ
    give: { type: Number, default: 0 }, // GIVE (7%) - Cho đi
    lts: { type: Number, default: 0 } // LTS (10%) - Tiết kiệm
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
expenseSchema.index({ userId: 1, month: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
