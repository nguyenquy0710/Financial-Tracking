const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const systemConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    misa: {
      username: {
        type: String,
        trim: true
      },
      password: {
        type: String
      },
      isConfigured: {
        type: Boolean,
        default: false
      },
      lastValidated: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
systemConfigSchema.index({ userId: 1 });

// Hash MISA password before saving
systemConfigSchema.pre('save', async function (next) {
  if (this.isModified('misa.password') && this.misa.password) {
    this.misa.password = await bcrypt.hash(this.misa.password, 10);
  }
  next();
});

// Method to compare MISA password
systemConfigSchema.methods.compareMisaPassword = async function (candidatePassword) {
  if (!this.misa.password) return false;
  return await bcrypt.compare(candidatePassword, this.misa.password);
};

// Method to get decrypted config (for display purposes)
systemConfigSchema.methods.getSafeConfig = function () {
  return {
    _id: this._id,
    userId: this.userId,
    misa: {
      username: this.misa.username,
      isConfigured: this.misa.isConfigured,
      lastValidated: this.misa.lastValidated,
      // Never return the password
      password: this.misa.password ? '********' : null
    },
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
