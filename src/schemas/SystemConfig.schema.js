const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema(
  {
    configName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    configValue: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
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

// Index for efficient queries
systemConfigSchema.index({ configName: 1 });

// Hash system config value before saving
systemConfigSchema.pre('save', async function (next) {
  // Update the updatedAt field to the current date
  this.updatedAt = Date.now();

  // if (this.isModified('configValue') && this.configValue) {
  //   this.configValue = await bcrypt.hash(this.configValue, 10);
  // }
  next();
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
