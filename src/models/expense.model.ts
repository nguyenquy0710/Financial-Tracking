import { ExpenseSource } from '@/config/enums';
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 2. Define interface for allocation
export interface IAllocation {
  motherGift: number;
  nec: number;
  ffa: number;
  educ: number;
  play: number;
  give: number;
  lts: number;
}

// 3. Define the Expense document interface
export interface IExpenseModel extends Document {
  userId: Types.ObjectId;
  month: Date;
  category: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  previousMonthSalary: number;
  allocation: IAllocation;
  source: ExpenseSource;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  allocationTotal: number; // Tổng số tiền phân bổ
  allocationPercentage: IAllocation; // Tỷ lệ phần trăm phân bổ
  isSalaryRecord: boolean; // Có phải là bản ghi lương không
  monthFormatted: string; // Định dạng tháng (YYYY-MM)
}

// 4. Define the schema
const expenseSchema = new Schema<IExpenseModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    month: {
      type: Date,
      required: [true, 'Month is required'],
      validate: {
        validator: function (date: Date) {
          // Ensure it's the first day of the month
          return date.getDate() === 1;
        },
        message: 'Month must be the first day of the month'
      }
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters']
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [200, 'Item name cannot exceed 200 characters']
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be negative']
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: [0, 'Unit price cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    previousMonthSalary: {
      type: Number,
      default: 0,
      min: [0, 'Salary cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    allocation: {
      motherGift: {
        type: Number,
        default: 0,
        min: [0, 'Mother gift allocation cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      nec: {
        type: Number,
        default: 0,
        min: [0, 'NEC allocation cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      ffa: {
        type: Number,
        default: 0,
        min: [0, 'FFA allocation cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      educ: {
        type: Number,
        default: 0,
        min: [0, 'EDUC allocation cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      play: {
        type: Number,
        default: 0,
        min: [0, 'PLAY allocation cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      give: {
        type: Number,
        default: 0,
        min: [0, 'GIVE allocation cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      lts: {
        type: Number,
        default: 0,
        min: [0, 'LTS allocation cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      }
    },
    source: {
      type: String,
      enum: {
        values: Object.values(ExpenseSource),
        message: 'Source must be Manual, MISA, Excel, or API'
      },
      default: ExpenseSource.MANUAL,
      trim: true
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

// 5. Virtual for allocation total
expenseSchema.virtual('allocationTotal').get(function (this: IExpenseModel) {
  const allocation = this.allocation;
  return allocation.motherGift + allocation.nec + allocation.ffa +
    allocation.educ + allocation.play + allocation.give + allocation.lts;
});

// 6. Virtual for allocation percentage
expenseSchema.virtual('allocationPercentage').get(function (this: IExpenseModel) {
  const total = this.allocationTotal || 1; // Avoid division by zero
  const allocation = this.allocation;

  return {
    motherGift: (allocation.motherGift / total) * 100,
    nec: (allocation.nec / total) * 100,
    ffa: (allocation.ffa / total) * 100,
    educ: (allocation.educ / total) * 100,
    play: (allocation.play / total) * 100,
    give: (allocation.give / total) * 100,
    lts: (allocation.lts / total) * 100
  };
});

// 7. Virtual for checking if this is a salary record
expenseSchema.virtual('isSalaryRecord').get(function (this: IExpenseModel) {
  return this.previousMonthSalary > 0;
});

// 8. Virtual for formatted month (YYYY-MM)
expenseSchema.virtual('monthFormatted').get(function (this: IExpenseModel) {
  return this.month.toISOString().substring(0, 7);
});

// 9. Indexes for efficient queries
expenseSchema.index({ userId: 1, month: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, source: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });
expenseSchema.index({ month: 1, category: 1 });

// 10. Pre-save middleware for calculations
expenseSchema.pre('save', function (next) {
  const expense = this as IExpenseModel;

  // Calculate total amount if not set
  if (expense.totalAmount === 0 && expense.quantity > 0 && expense.unitPrice > 0) {
    expense.totalAmount = expense.quantity * expense.unitPrice;
  }

  // Auto-calculate allocation based on 6-jar system if this is a salary record
  if (expense.isSalaryRecord && expense.allocationTotal === 0) {
    const salary = expense.previousMonthSalary;
    expense.allocation = {
      motherGift: 0, // Custom amount
      nec: Math.round(salary * 0.55 * 100) / 100,
      ffa: Math.round(salary * 0.10 * 100) / 100,
      educ: Math.round(salary * 0.10 * 100) / 100,
      play: Math.round(salary * 0.10 * 100) / 100,
      give: Math.round(salary * 0.07 * 100) / 100,
      lts: Math.round(salary * 0.08 * 100) / 100 // 55+10+10+10+7+8 = 100%
    };
  }

  // Validate allocation total matches total amount for non-salary records
  if (!expense.isSalaryRecord && expense.allocationTotal > 0 &&
    Math.abs(expense.allocationTotal - expense.totalAmount) > 0.01) {
    return next(new Error('Allocation total must match the total amount'));
  }

  next();
});

// 11. Static methods
// Tìm chi tiêu theo tháng
expenseSchema.statics.findByMonth = function (userId: Types.ObjectId | string, month: Date) {
  const startDate = new Date(month);
  const endDate = new Date(month);
  endDate.setMonth(endDate.getMonth() + 1);

  return this.find({
    userId,
    month: {
      $gte: startDate,
      $lt: endDate
    }
  }).sort({ category: 1, createdAt: 1 });
};

// Tìm các bản ghi lương
expenseSchema.statics.findSalaryRecords = function (userId: Types.ObjectId | string, startMonth?: Date, endMonth?: Date) {
  const query: any = {
    userId,
    previousMonthSalary: { $gt: 0 }
  };

  if (startMonth && endMonth) {
    query.month = {
      $gte: startMonth,
      $lte: endMonth
    };
  }

  return this.find(query).sort({ month: -1 });
};

// Tổng hợp chi tiêu theo danh mục
expenseSchema.statics.getMonthlySummary = function (userId: Types.ObjectId | string, month: Date) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        month: month
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$totalAmount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

// Tổng hợp phân bổ theo tháng
expenseSchema.statics.getAllocationSummary = function (userId: Types.ObjectId | string, month: Date) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        month: month
      }
    },
    {
      $group: {
        _id: null,
        totalMotherGift: { $sum: '$allocation.motherGift' },
        totalNEC: { $sum: '$allocation.nec' },
        totalFFA: { $sum: '$allocation.ffa' },
        totalEDUC: { $sum: '$allocation.educ' },
        totalPLAY: { $sum: '$allocation.play' },
        totalGIVE: { $sum: '$allocation.give' },
        totalLTS: { $sum: '$allocation.lts' },
        totalExpenses: { $sum: '$totalAmount' },
        recordCount: { $sum: 1 }
      }
    }
  ]);
};

// Tìm chi tiêu theo danh mục
expenseSchema.statics.findByCategory = function (userId: Types.ObjectId | string, category: string, months?: number) {
  const query: any = { userId, category };

  if (months) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    query.month = { $gte: startDate };
  }

  return this.find(query).sort({ month: -1, createdAt: -1 });
};

// 12. Instance methods
// Cập nhật phân bổ
expenseSchema.methods.updateAllocation = function (newAllocation: Partial<IAllocation>) {
  this.allocation = { ...this.allocation, ...newAllocation };
  return this.save();
};

// Áp dụng hệ thống 6 jars
expenseSchema.methods.applySixJarSystem = function () {
  if (!this.isSalaryRecord) {
    throw new Error('Six-jar system can only be applied to salary records');
  }

  const salary = this.previousMonthSalary;
  this.allocation = {
    motherGift: this.allocation.motherGift, // Keep existing mother gift
    nec: Math.round(salary * 0.55 * 100) / 100,
    ffa: Math.round(salary * 0.10 * 100) / 100,
    educ: Math.round(salary * 0.10 * 100) / 100,
    play: Math.round(salary * 0.10 * 100) / 100,
    give: Math.round(salary * 0.07 * 100) / 100,
    lts: Math.round(salary * 0.08 * 100) / 100
  };

  return this.save();
};

// Lấy chi tiết phân bổ các jars
expenseSchema.methods.getJarBreakdown = function (): { jar: string; amount: number; percentage: number }[] {
  const total = this.allocationTotal || this.totalAmount;
  const allocation = this.allocation;

  return [
    { jar: 'Mother Gift', amount: allocation.motherGift, percentage: (allocation.motherGift / total) * 100 },
    { jar: 'NEC (Necessities)', amount: allocation.nec, percentage: (allocation.nec / total) * 100 },
    { jar: 'FFA (Financial Freedom)', amount: allocation.ffa, percentage: (allocation.ffa / total) * 100 },
    { jar: 'EDUC (Education)', amount: allocation.educ, percentage: (allocation.educ / total) * 100 },
    { jar: 'PLAY (Entertainment)', amount: allocation.play, percentage: (allocation.play / total) * 100 },
    { jar: 'GIVE (Charity)', amount: allocation.give, percentage: (allocation.give / total) * 100 },
    { jar: 'LTS (Long-Term Savings)', amount: allocation.lts, percentage: (allocation.lts / total) * 100 }
  ];
};

// 13. Define static methods interface
export interface IExpenseModelStatic extends Model<IExpenseModel> {
  findByMonth(userId: Types.ObjectId | string, month: Date): Promise<IExpenseModel[]>;
  findSalaryRecords(userId: Types.ObjectId | string, startMonth?: Date, endMonth?: Date): Promise<IExpenseModel[]>;
  getMonthlySummary(userId: Types.ObjectId | string, month: Date): Promise<any[]>;
  getAllocationSummary(userId: Types.ObjectId | string, month: Date): Promise<any[]>;
  findByCategory(userId: Types.ObjectId | string, category: string, months?: number): Promise<IExpenseModel[]>;
}

// 14. Export the model
const Expense: IExpenseModelStatic =
  mongoose.models.Expense as IExpenseModelStatic ||
  mongoose.model<IExpenseModel, IExpenseModelStatic>('Expense', expenseSchema);

export default Expense;
