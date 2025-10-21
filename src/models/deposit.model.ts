import { DepositStatus } from '@/config/enums';
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 2. Define the Deposit document interface
export interface IDepositModel extends Document {
  userId: Types.ObjectId;
  bank: string;
  accountType?: string;
  status: DepositStatus;
  accountName?: string;
  accountNumber: string;
  fundType?: string;
  startDate?: Date;
  maturityDate?: Date;
  termMonths: number;
  interestRate: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  daysToMaturity: number; // Số ngày đến khi đáo hạn
  isMatured: boolean; // Kiểm tra đã đáo hạn chưa
  isActive: boolean; // Kiểm tra còn hoạt động không
  projectedInterest: number; // Lãi dự kiến tính đến hiện tại
}

// 3. Define the schema
const depositSchema = new Schema<IDepositModel>(
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
    accountType: {
      type: String,
      trim: true,
      maxlength: [50, 'Account type cannot exceed 50 characters']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(DepositStatus),
        message: 'Status must be active, closed, or matured'
      },
      default: DepositStatus.ACTIVE
    },
    accountName: {
      type: String,
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters']
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
      validate: {
        validator: function (value: string) {
          return /^[0-9A-Za-z\-]+$/.test(value);
        },
        message: 'Account number contains invalid characters'
      }
    },
    fundType: {
      type: String,
      trim: true,
      maxlength: [50, 'Fund type cannot exceed 50 characters']
    },
    startDate: {
      type: Date,
      validate: {
        validator: function (this: IDepositModel, date: Date) {
          return !date || date <= new Date();
        },
        message: 'Start date cannot be in the future'
      }
    },
    maturityDate: {
      type: Date,
      validate: {
        validator: function (this: IDepositModel, date: Date) {
          return !date || !this.startDate || date > this.startDate;
        },
        message: 'Maturity date must be after start date'
      }
    },
    termMonths: {
      type: Number,
      default: 0,
      min: [0, 'Term months cannot be negative']
    },
    interestRate: {
      type: Number,
      default: 0,
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%'],
      set: (v: number) => Math.round(v * 100) / 100 // 2 decimal places
    },
    principalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Principal amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    interestAmount: {
      type: Number,
      default: 0,
      min: [0, 'Interest amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// 4. Virtual for days to maturity
depositSchema.virtual('daysToMaturity').get(function (this: IDepositModel) {
  if (!this.maturityDate || this.status !== DepositStatus.ACTIVE) {
    return 0;
  }
  const today = new Date();
  const timeDiff = this.maturityDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// 5. Virtual for checking if deposit is matured
depositSchema.virtual('isMatured').get(function (this: IDepositModel) {
  if (!this.maturityDate) return false;
  return new Date() >= this.maturityDate && this.status === DepositStatus.ACTIVE;
});

// 6. Virtual for checking if deposit is active
depositSchema.virtual('isActive').get(function (this: IDepositModel) {
  return this.status === DepositStatus.ACTIVE;
});

// 7. Virtual for projected interest (calculated based on time passed)
depositSchema.virtual('projectedInterest').get(function (this: IDepositModel) {
  if (!this.startDate || this.principalAmount <= 0 || this.interestRate <= 0) {
    return 0;
  }

  const now = new Date();
  const start = this.startDate;

  // Calculate days passed
  const daysPassed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const yearsPassed = daysPassed / 365;

  // Calculate projected interest
  const projected = this.principalAmount * (this.interestRate / 100) * yearsPassed;
  return Math.round(projected * 100) / 100;
});

// 8. Indexes for efficient queries
depositSchema.index({ userId: 1, status: 1 });
depositSchema.index({ userId: 1, bank: 1 });
depositSchema.index({ userId: 1, maturityDate: 1 });
depositSchema.index({ userId: 1, startDate: -1 });
depositSchema.index({ maturityDate: 1 }, {
  partialFilterExpression: { status: DepositStatus.ACTIVE }
});

// 9. Pre-save middleware for calculations and status updates
depositSchema.pre('save', function (next) {
  const deposit = this as IDepositModel;

  // Calculate total amount
  deposit.totalAmount = deposit.principalAmount + deposit.interestAmount;

  // Auto-update status based on maturity date
  if (deposit.maturityDate && new Date() >= deposit.maturityDate && deposit.status === DepositStatus.ACTIVE) {
    deposit.status = DepositStatus.MATURED;
  }

  // Calculate term months if start and maturity dates are provided
  if (deposit.startDate && deposit.maturityDate && deposit.termMonths === 0) {
    const months = (deposit.maturityDate.getTime() - deposit.startDate.getTime()) / (1000 * 3600 * 24 * 30.44);
    deposit.termMonths = Math.round(months);
  }

  // Calculate maturity date if start date and term months are provided
  if (deposit.startDate && deposit.termMonths > 0 && !deposit.maturityDate) {
    const maturityDate = new Date(deposit.startDate);
    maturityDate.setMonth(maturityDate.getMonth() + deposit.termMonths);
    deposit.maturityDate = maturityDate;
  }

  next();
});

// 10. Static methods
// Tìm các khoản tiền gửi đang hoạt động
depositSchema.statics.findActiveByUserId = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    status: DepositStatus.ACTIVE
  }).sort({ maturityDate: 1 });
};

// Tìm các khoản đã đáo hạn
depositSchema.statics.findMaturedByUserId = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    status: DepositStatus.MATURED
  }).sort({ maturityDate: -1 });
};

// Tìm theo ngân hàng
depositSchema.statics.findByBank = function (userId: Types.ObjectId | string, bank: string) {
  return this.find({
    userId,
    bank: new RegExp(bank, 'i')
  }).sort({ startDate: -1 });
};

// Tìm các khoản sắp đáo hạn trong khoảng thời gian nhất định (mặc định 30 ngày)
depositSchema.statics.findUpcomingMaturities = function (userId: Types.ObjectId | string, days: number = 30) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  return this.find({
    userId,
    status: DepositStatus.ACTIVE,
    maturityDate: {
      $lte: targetDate,
      $gte: new Date()
    }
  }).sort({ maturityDate: 1 });
};

// Tính tổng số tiền gửi (aggregation)
depositSchema.statics.calculateTotalDeposits = function (userId: Types.ObjectId | string) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        status: DepositStatus.ACTIVE
      }
    },
    {
      $group: {
        _id: null,
        totalPrincipal: { $sum: '$principalAmount' },
        totalInterest: { $sum: '$interestAmount' },
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);
};

// 11. Instance methods
// Thêm lãi vào khoản tiền gửi
depositSchema.methods.addInterest = function (interest: number) {
  this.interestAmount += interest;
  this.totalAmount = this.principalAmount + this.interestAmount;
  return this.save();
};

// Đóng tài khoản tiền gửi
depositSchema.methods.closeDeposit = function (finalAmount?: number) {
  this.status = DepositStatus.CLOSED;
  if (finalAmount !== undefined) {
    this.totalAmount = finalAmount;
    this.interestAmount = finalAmount - this.principalAmount;
  }
  return this.save();
};

// Tái tục khoản tiền gửi
depositSchema.methods.renewDeposit = function (newTermMonths: number, newInterestRate?: number) {
  if (this.status !== DepositStatus.MATURED) {
    throw new Error('Can only renew matured deposits');
  }

  this.status = DepositStatus.ACTIVE;
  this.startDate = new Date();
  this.termMonths = newTermMonths;
  this.maturityDate = new Date();
  this.maturityDate.setMonth(this.maturityDate.getMonth() + newTermMonths);

  if (newInterestRate !== undefined) {
    this.interestRate = newInterestRate;
  }

  // Reset interest for new term
  this.interestAmount = 0;
  this.totalAmount = this.principalAmount;

  return this.save();
};

// Lấy thông tin trạng thái chi tiết
depositSchema.methods.getStatusInfo = function (): {
  status: DepositStatus;
  message: string;
  actionRequired: boolean
} {
  const now = new Date();

  if (this.status === DepositStatus.CLOSED) {
    return {
      status: this.status,
      message: 'Deposit account is closed',
      actionRequired: false
    };
  }

  if (this.status === DepositStatus.MATURED) {
    return {
      status: this.status,
      message: 'Deposit has matured and is ready for withdrawal or renewal',
      actionRequired: true
    };
  }

  if (this.maturityDate && now >= this.maturityDate) {
    return {
      status: DepositStatus.MATURED,
      message: 'Deposit has matured',
      actionRequired: true
    };
  }

  if (this.daysToMaturity <= 7) {
    return {
      status: this.status,
      message: `Deposit matures in ${this.daysToMaturity} days`,
      actionRequired: true
    };
  }

  return {
    status: this.status,
    message: 'Deposit is active and earning interest',
    actionRequired: false
  };
};

// 12. Define static methods interface
export interface IDepositModelStatic extends Model<IDepositModel> {
  findActiveByUserId(userId: Types.ObjectId | string): Promise<IDepositModel[]>;
  findMaturedByUserId(userId: Types.ObjectId | string): Promise<IDepositModel[]>;
  findByBank(userId: Types.ObjectId | string, bank: string): Promise<IDepositModel[]>;
  findUpcomingMaturities(userId: Types.ObjectId | string, days?: number): Promise<IDepositModel[]>;
  calculateTotalDeposits(userId: Types.ObjectId | string): Promise<any[]>;
}

// 13. Export the model
const Deposit: IDepositModelStatic =
  mongoose.models.Deposit as IDepositModelStatic ||
  mongoose.model<IDepositModel, IDepositModelStatic>('Deposit', depositSchema);

export default Deposit;
