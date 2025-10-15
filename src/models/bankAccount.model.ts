import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 1. Define the BankAccount document interface
export interface IBankAccountModel extends Document {
  userId: Types.ObjectId;
  bank: string;
  accountHolder: string;
  accountNumber: string;
  branch?: string;
  identifier?: string;
  isDefault: boolean;
  isActive: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Define the schema
const bankAccountSchema = new Schema<IBankAccountModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    bank: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters']
    },
    accountHolder: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
      maxlength: [100, 'Account holder name cannot exceed 100 characters']
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
      validate: {
        validator: function (value: string) {
          // Basic validation for account number (adjust as needed)
          return /^[0-9A-Za-z\-]+$/.test(value);
        },
        message: 'Account number contains invalid characters'
      }
    },
    branch: {
      type: String,
      trim: true,
      maxlength: [100, 'Branch name cannot exceed 100 characters']
    },
    identifier: {
      type: String,
      trim: true,
      maxlength: [50, 'Identifier cannot exceed 50 characters']
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
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// 3. Add indexes
bankAccountSchema.index({ userId: 1, isActive: 1 });
bankAccountSchema.index({ userId: 1, bank: 1 });
bankAccountSchema.index({ userId: 1, isDefault: 1 });

// 4. Pre-save middleware to ensure only one default account per user
bankAccountSchema.pre('save', async function (next) {
  const bankAccount = this as IBankAccountModel;

  if (bankAccount.isDefault && bankAccount.isModified('isDefault')) {
    try {
      // Reset other default accounts for this user
      await mongoose.model('BankAccount').updateMany(
        {
          userId: bankAccount.userId,
          _id: { $ne: bankAccount._id },
          isDefault: true
        },
        { isDefault: false }
      );
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// 5. Static methods
bankAccountSchema.statics.findByUserId = function (userId: Types.ObjectId | string) {
  return this.find({ userId, isActive: true }).sort({ isDefault: -1, bank: 1 });
};

bankAccountSchema.statics.findDefaultAccount = function (userId: Types.ObjectId | string) {
  return this.findOne({ userId, isDefault: true, isActive: true });
};

bankAccountSchema.statics.deactivateAllUserAccounts = function (userId: Types.ObjectId | string) {
  return this.updateMany({ userId }, { isActive: false });
};

// 6. Instance methods
bankAccountSchema.methods.setAsDefault = async function () {
  this.isDefault = true;
  return this.save();
};

bankAccountSchema.methods.deactivate = async function () {
  this.isActive = false;
  // If this was the default account, set another active account as default
  if (this.isDefault) {
    const anotherAccount = await mongoose.model('BankAccount').findOne({
      userId: this.userId,
      _id: { $ne: this._id },
      isActive: true
    });

    if (anotherAccount) {
      await anotherAccount.setAsDefault();
    }
  }
  return this.save();
};

// 7. Define static methods interface
export interface IBankAccountModelStatic extends Model<IBankAccountModel> {
  findByUserId(userId: Types.ObjectId | string): Promise<IBankAccountModel[]>;
  findDefaultAccount(userId: Types.ObjectId | string): Promise<IBankAccountModel | null>;
  deactivateAllUserAccounts(userId: Types.ObjectId | string): Promise<any>;
}

// 8. Export the model
const BankAccount: IBankAccountModelStatic =
  mongoose.models.BankAccount as IBankAccountModelStatic ||
  mongoose.model<IBankAccountModel, IBankAccountModelStatic>('BankAccount', bankAccountSchema);

export default BankAccount;
