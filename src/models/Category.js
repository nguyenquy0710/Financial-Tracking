const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameVi: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  icon: {
    type: String,
    default: '💰'
  },
  color: {
    type: String,
    default: '#3498db'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // null for system categories
  },
  description: {
    type: String
  },
  keywords: [{
    type: String
  }], // For auto-categorization
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ keywords: 1 });

module.exports = mongoose.model('Category', categorySchema);
