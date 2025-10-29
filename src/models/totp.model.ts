import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { decrypt, encrypt } from '@/utils/encrypt.util';
import IAbsBaseModel, { createBaseSchema } from '@/abstracts/absBase.model';

// 1. Define the TOTP document interface
export interface ITotpModel extends IAbsBaseModel {
  userId: mongoose.Types.ObjectId;
  serviceName: string;
  accountName: string;
  secret: string; // Decrypted secret (not stored in DB)
  encryptedSecret: string;
  issuer?: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
  otpType: 'TOTP' | 'HOTP';
  counter?: number;
  // createdAt?: Date;
  // updatedAt?: Date;

  // Instance methods
  getDecryptedSecret(): string;
  setSecret(secret: string): void;
}

// 2. Define the schema
const TotpSchema = createBaseSchema<ITotpModel>(
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
    },
    otpType: {
      type: String,
      enum: ['TOTP', 'HOTP'],
      default: 'TOTP'
    },
    counter: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    softDelete: true,
    auditFields: true,
    schemaOptions: {
      toJSON: {
        transform: function (doc: any, ret: any) {
          // Don't expose encrypted secret in JSON
          const { encryptedSecret, ...rest } = ret;
          return rest;
        }
      }
    },
  }
);

// Instance method to get object including decrypted secret and other fields
TotpSchema.methods.toObjectWithSecrets = function (): ITotpModel & Required<{
  _id: unknown;
}> & {
  __v: number;
} {
  const obj = this.toObject({ virtuals: true });

  // Chuyển _id → id
  obj.id = obj._id?.toString?.();
  delete obj._id;

  // Xóa các field mặc định
  delete obj.__v;
  delete obj.isDeleted;
  delete obj.createdBy;
  delete obj.updatedBy;

  return {
    ...obj,
    secret: this.getDecryptedSecret(),
    algorithm: this.algorithm,
    digits: this.digits,
    period: this.period,
    otpType: this.otpType,
    counter: this.counter
  };
}

// Instance method to get decrypted secret
TotpSchema.methods.getDecryptedSecret = function (): string {
  console.log("🚀 QuyNH: this.encryptedSecret", this.encryptedSecret);
  return decrypt(this.encryptedSecret);
};

// Instance method to set and encrypt secret
TotpSchema.methods.setSecret = function (secret: string): void {
  this.encryptedSecret = encrypt(secret);
};

// =============================================================================
// Middleware and Hooks
// =============================================================================
// Pre-save hook to validate secret format
TotpSchema.pre('save', function (next) {
  if (this.isModified('encryptedSecret') && !this.encryptedSecret.includes(':')) {
    // If encryptedSecret doesn't contain ':', it means it's not encrypted yet
    // This should not happen if setSecret is used correctly
    return next(new Error('Secret must be encrypted before saving'));
  }
  next();
});

// =============================================================================
// 3. Create and export the model
const Totp: Model<ITotpModel> = mongoose.model<ITotpModel>('Totp', TotpSchema);

export default Totp;
