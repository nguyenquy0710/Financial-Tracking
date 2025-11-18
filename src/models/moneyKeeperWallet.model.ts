import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { createBaseSchema } from '@/abstracts/absBase.model';

// Interface for Money Keeper Wallet
export interface IMoneyKeeperWalletModel extends Document {
  userId: Types.ObjectId;
  walletId: string; // Money Keeper wallet ID
  walletName: string;
  inActive: boolean;
  walletType: number; // 1: Account, 2: Credit, 3: Investment
  excludeReport: boolean;
  bankId?: string;
  bankLogo?: string;
  bankName?: string;
  currencyCode: string;
  currentAmount: number;
  convertCurrentAmount: number;
  lastSynced?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted?: boolean;
}

// Create schema using the base schema helper
const moneyKeeperWalletSchema = createBaseSchema<IMoneyKeeperWalletModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    walletId: {
      type: String,
      required: [true, 'Wallet ID is required'],
      trim: true,
      index: true
    },
    walletName: {
      type: String,
      required: [true, 'Wallet name is required'],
      trim: true,
      maxlength: [200, 'Wallet name cannot exceed 200 characters']
    },
    inActive: {
      type: Boolean,
      default: false
    },
    walletType: {
      type: Number,
      required: [true, 'Wallet type is required'],
      enum: {
        values: [1, 2, 3],
        message: 'Wallet type must be 1 (Account), 2 (Credit), or 3 (Investment)'
      }
    },
    excludeReport: {
      type: Boolean,
      default: false
    },
    bankId: {
      type: String,
      trim: true
    },
    bankLogo: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: [200, 'Bank name cannot exceed 200 characters']
    },
    currencyCode: {
      type: String,
      required: [true, 'Currency code is required'],
      trim: true,
      default: 'VND',
      maxlength: [10, 'Currency code cannot exceed 10 characters']
    },
    currentAmount: {
      type: Number,
      required: [true, 'Current amount is required'],
      default: 0
    },
    convertCurrentAmount: {
      type: Number,
      default: 0
    },
    lastSynced: {
      type: Date,
      default: Date.now
    }
  },
  {
    softDelete: true,
    auditFields: true,
    schemaOptions: {
      // collection: 'moneykeeper_wallets'
    }
  }
);

// Compound index for userId and walletId to ensure uniqueness
moneyKeeperWalletSchema.index({ userId: 1, walletId: 1 }, { unique: true });

// Index for querying active wallets
moneyKeeperWalletSchema.index({ userId: 1, inActive: 1 });

// Static methods interface
export interface IMoneyKeeperWalletModelStatic extends Model<IMoneyKeeperWalletModel> {
  findByUserId(userId: Types.ObjectId | string): Promise<IMoneyKeeperWalletModel[]>;
  findByWalletId(userId: Types.ObjectId | string, walletId: string): Promise<IMoneyKeeperWalletModel | null>;
  syncWallet(userId: Types.ObjectId | string, walletData: any): Promise<IMoneyKeeperWalletModel>;
  getWalletSummary(userId: Types.ObjectId | string): Promise<any>;
}

// Static method: Find all wallets for a user
moneyKeeperWalletSchema.statics.findByUserId = function (userId: Types.ObjectId | string) {
  return this.find({ userId, isDeleted: false }).sort({ walletName: 1 });
};

// Static method: Find a specific wallet by walletId
moneyKeeperWalletSchema.statics.findByWalletId = function (
  userId: Types.ObjectId | string,
  walletId: string
) {
  return this.findOne({ userId, walletId, isDeleted: false });
};

// Static method: Sync a wallet (upsert)
moneyKeeperWalletSchema.statics.syncWallet = async function (
  userId: Types.ObjectId | string,
  walletData: any
) {
  const existingWallet = await this.findOne({ userId, walletId: walletData.walletId });

  if (existingWallet) {
    // Update existing wallet
    existingWallet.walletName = walletData.walletName;
    existingWallet.inActive = walletData.inActive;
    existingWallet.walletType = walletData.walletType;
    existingWallet.excludeReport = walletData.excludeReport;
    existingWallet.bankId = walletData.bankId;
    existingWallet.bankLogo = walletData.bankLogo;
    existingWallet.bankName = walletData.bankName;
    existingWallet.currencyCode = walletData.currencyCode;
    existingWallet.currentAmount = walletData.currentAmount;
    existingWallet.convertCurrentAmount = walletData.convertCurrentAmount;
    existingWallet.lastSynced = new Date();

    return existingWallet.save();
  } else {
    // Create new wallet
    const newWallet = new this({
      userId,
      walletId: walletData.walletId,
      walletName: walletData.walletName,
      inActive: walletData.inActive,
      walletType: walletData.walletType,
      excludeReport: walletData.excludeReport,
      bankId: walletData.bankId,
      bankLogo: walletData.bankLogo,
      bankName: walletData.bankName,
      currencyCode: walletData.currencyCode,
      currentAmount: walletData.currentAmount,
      convertCurrentAmount: walletData.convertCurrentAmount,
      lastSynced: new Date(),
      createdBy: userId
    });

    return newWallet.save();
  }
};

// Static method: Get wallet summary
moneyKeeperWalletSchema.statics.getWalletSummary = async function (userId: Types.ObjectId | string) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$walletType',
        count: { $sum: 1 },
        totalAmount: { $sum: '$currentAmount' }
      }
    },
    {
      $project: {
        walletType: '$_id',
        count: 1,
        totalAmount: 1,
        _id: 0
      }
    }
  ]);
};

// Export the model
const MoneyKeeperWallet: IMoneyKeeperWalletModelStatic =
  mongoose.models.MoneyKeeperWallet as IMoneyKeeperWalletModelStatic ||
  mongoose.model<IMoneyKeeperWalletModel, IMoneyKeeperWalletModelStatic>(
    'MoneyKeeperWallet',
    moneyKeeperWalletSchema
  );

export default MoneyKeeperWallet;
