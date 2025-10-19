import mongoose, { Document, Schema, Model } from 'mongoose';
import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

// Helper functions for encryption/decryption
function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = parts.join(':');
  const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 1. Define the TOTP document interface
export interface ITotpModel extends Document {
  userId: mongoose.Types.ObjectId;
  serviceName: string;
  accountName: string;
  encryptedSecret: string;
  issuer?: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Instance methods
  getDecryptedSecret(): string;
  setSecret(secret: string): void;
}

// 2. Define the schema
const TotpSchema = new Schema<ITotpModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters']
    },
    encryptedSecret: {
      type: String,
      required: [true, 'Secret key is required']
    },
    issuer: {
      type: String,
      trim: true,
      maxlength: [100, 'Issuer cannot exceed 100 characters']
    },
    algorithm: {
      type: String,
      enum: ['SHA1', 'SHA256', 'SHA512'],
      default: 'SHA1'
    },
    digits: {
      type: Number,
      default: 6,
      min: 6,
      max: 8
    },
    period: {
      type: Number,
      default: 30,
      min: 15,
      max: 60
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Don't expose encrypted secret in JSON
        const { encryptedSecret, ...rest } = ret;
        return rest;
      }
    }
  }
);

// Instance method to get decrypted secret
TotpSchema.methods.getDecryptedSecret = function (): string {
  return decrypt(this.encryptedSecret);
};

// Instance method to set and encrypt secret
TotpSchema.methods.setSecret = function (secret: string): void {
  this.encryptedSecret = encrypt(secret);
};

// Pre-save hook to validate secret format
TotpSchema.pre('save', function (next) {
  if (this.isModified('encryptedSecret') && !this.encryptedSecret.includes(':')) {
    // If encryptedSecret doesn't contain ':', it means it's not encrypted yet
    // This should not happen if setSecret is used correctly
    return next(new Error('Secret must be encrypted before saving'));
  }
  next();
});

// 3. Create and export the model
const Totp: Model<ITotpModel> = mongoose.model<ITotpModel>('Totp', TotpSchema);

export default Totp;
