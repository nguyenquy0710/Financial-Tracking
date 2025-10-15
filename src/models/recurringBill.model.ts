import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 1. Define enums for bill type and frequency
export enum BillType {
  RENT = 'rent',
  ELECTRICITY = 'electricity',
  WATER = 'water',
  INTERNET = 'internet',
  PARKING = 'parking',
  GARBAGE = 'garbage',
  OTHER = 'other'
}

export enum BillFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

// 2. Define the RecurringBill document interface
export interface IRecurringBillModel extends Document {
  userId: Types.ObjectId;
  name: string;
  type: BillType;
  amount: number;
  frequency: BillFrequency;
  dueDay?: number;
  nextDueDate: Date;
  lastPaidDate?: Date;
  lastPaidAmount: number;
  categoryId?: Types.ObjectId;
  autoDebit: boolean;
  bankAccountId?: Types.ObjectId;
  reminderDays: number;
  isActive: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  isOverdue: boolean; // Kiểm tra hóa đơn quá hạn
  daysUntilDue: number; // Số ngày đến hạn thanh toán
  shouldRemind: boolean; // Kiểm tra có nên gửi nhắc nhở
  nextDueDateFormatted: string; // Định dạng ngày đến hạn tiếp theo
}

// 3. Define the schema
const recurringBillSchema = new Schema<IRecurringBillModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    name: {
      type: String,
      required: [true, 'Bill name is required'],
      trim: true,
      maxlength: [100, 'Bill name cannot exceed 100 characters']
    },
    type: {
      type: String,
      required: [true, 'Bill type is required'],
      enum: {
        values: Object.values(BillType),
        message: 'Bill type must be rent, electricity, water, internet, parking, garbage, or other'
      },
      default: BillType.OTHER
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: {
        values: Object.values(BillFrequency),
        message: 'Frequency must be daily, weekly, monthly, quarterly, or yearly'
      },
      default: BillFrequency.MONTHLY
    },
    dueDay: {
      type: Number,
      min: [1, 'Due day must be between 1 and 31'],
      max: [31, 'Due day must be between 1 and 31'],
      validate: {
        validator: function (this: IRecurringBillModel, day: number) {
          // Only validate dueDay for monthly, quarterly, and yearly frequencies
          if (!day) return true;
          return [BillFrequency.MONTHLY, BillFrequency.QUARTERLY, BillFrequency.YEARLY].includes(this.frequency);
        },
        message: 'Due day is only applicable for monthly, quarterly, and yearly bills'
      }
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Next due date is required'],
      validate: {
        validator: function (date: Date) {
          return date > new Date();
        },
        message: 'Next due date must be in the future'
      }
    },
    lastPaidDate: {
      type: Date
    },
    lastPaidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Last paid amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category'
    },
    autoDebit: {
      type: Boolean,
      default: false
    },
    bankAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'BankAccount',
      validate: {
        validator: function (this: IRecurringBillModel, accountId: Types.ObjectId) {
          // Bank account is only required if autoDebit is enabled
          if (this.autoDebit && !accountId) {
            return false;
          }
          return true;
        },
        message: 'Bank account is required when auto debit is enabled'
      }
    },
    reminderDays: {
      type: Number,
      default: 3,
      min: [0, 'Reminder days cannot be negative'],
      max: [30, 'Reminder days cannot exceed 30']
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

// 4. Virtual for checking if bill is overdue
recurringBillSchema.virtual('isOverdue').get(function (this: IRecurringBillModel) {
  return new Date() > this.nextDueDate && this.isActive;
});

// 5. Virtual for days until due
recurringBillSchema.virtual('daysUntilDue').get(function (this: IRecurringBillModel) {
  const now = new Date();
  const due = new Date(this.nextDueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// 6. Virtual for checking if reminder should be sent
recurringBillSchema.virtual('shouldRemind').get(function (this: IRecurringBillModel) {
  return this.daysUntilDue <= this.reminderDays && this.daysUntilDue >= 0 && this.isActive;
});

// 7. Virtual for formatted next due date
recurringBillSchema.virtual('nextDueDateFormatted').get(function (this: IRecurringBillModel) {
  return this.nextDueDate.toLocaleDateString();
});

// 8. Indexes for efficient queries
recurringBillSchema.index({ userId: 1, isActive: 1 });
recurringBillSchema.index({ userId: 1, nextDueDate: 1 });
recurringBillSchema.index({ userId: 1, type: 1 });
recurringBillSchema.index({ nextDueDate: 1, isActive: 1 });
recurringBillSchema.index({ userId: 1, frequency: 1 });

// 9. Pre-save middleware for validation and calculations
recurringBillSchema.pre('save', function (next) {
  const bill = this as IRecurringBillModel;

  // Set due day based on next due date for monthly/quarterly/yearly bills
  if (!bill.dueDay && [BillFrequency.MONTHLY, BillFrequency.QUARTERLY, BillFrequency.YEARLY].includes(bill.frequency)) {
    bill.dueDay = bill.nextDueDate.getDate();
  }

  // Validate bank account when auto debit is enabled
  if (bill.autoDebit && !bill.bankAccountId) {
    return next(new Error('Bank account is required when auto debit is enabled'));
  }

  next();
});

// 10. Static methods
// Tìm hóa đơn đang hoạt động của người dùng
recurringBillSchema.statics.findActiveByUserId = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    isActive: true
  }).populate('categoryId').populate('bankAccountId').sort({ nextDueDate: 1 });
};

// Tìm hóa đơn quá hạn
recurringBillSchema.statics.findOverdue = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    isActive: true,
    nextDueDate: { $lt: new Date() }
  }).populate('categoryId').populate('bankAccountId');
};

// Tìm hóa đơn sắp đến hạn
recurringBillSchema.statics.findUpcoming = function (userId: Types.ObjectId | string, days: number = 7) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  return this.find({
    userId,
    isActive: true,
    nextDueDate: {
      $lte: targetDate,
      $gte: new Date()
    }
  }).populate('categoryId').populate('bankAccountId').sort({ nextDueDate: 1 });
};

// Tìm theo loại hóa đơn
recurringBillSchema.statics.findByType = function (userId: Types.ObjectId | string, type: BillType) {
  return this.find({
    userId,
    type,
    isActive: true
  }).populate('categoryId').sort({ nextDueDate: 1 });
};

// Tính tổng hóa đơn hàng tháng
recurringBillSchema.statics.calculateMonthlyTotal = function (userId: Types.ObjectId | string) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalMonthlyAmount: { $sum: '$amount' },
        billCount: { $sum: 1 }
      }
    }
  ]);
};

// Xử lý thanh toán tự động
recurringBillSchema.statics.processAutoDebits = async function (userId: Types.ObjectId | string) {
  const today = new Date();
  const bills = await this.find({
    userId,
    isActive: true,
    autoDebit: true,
    nextDueDate: { $lte: today },
    bankAccountId: { $exists: true, $ne: null }
  }).populate('bankAccountId');

  const processedBills = [];

  for (const bill of bills) {
    try {
      // Here you would integrate with your payment processing system
      // For now, we'll just mark as paid and update dates
      bill.lastPaidDate = new Date();
      bill.lastPaidAmount = bill.amount;
      bill.nextDueDate = calculateNextDueDate(bill.nextDueDate, bill.frequency);
      await bill.save();

      processedBills.push(bill);
    } catch (error) {
      console.error(`Failed to process auto debit for bill ${bill.name}:`, error);
    }
  }

  return processedBills;
};

// 11. Instance methods
// Đánh dấu đã thanh toán
recurringBillSchema.methods.markAsPaid = function (paidAmount?: number, paidDate?: Date) {
  this.lastPaidDate = paidDate || new Date();
  this.lastPaidAmount = paidAmount || this.amount;
  this.nextDueDate = calculateNextDueDate(this.nextDueDate, this.frequency);
  return this.save();
};

// Bỏ qua thanh toán lần này
recurringBillSchema.methods.skipPayment = function () {
  this.nextDueDate = calculateNextDueDate(this.nextDueDate, this.frequency);
  return this.save();
};

// Cập nhật ngày đến hạn tiếp theo
recurringBillSchema.methods.updateNextDueDate = function () {
  this.nextDueDate = calculateNextDueDate(new Date(), this.frequency, this.dueDay);
  return this.save();
};

// Lấy thông tin nhắc nhở
recurringBillSchema.methods.getReminderInfo = function (): {
  shouldRemind: boolean;
  message: string;
  urgency: 'low' | 'medium' | 'high';
} {
  if (!this.shouldRemind) {
    return {
      shouldRemind: false,
      message: '',
      urgency: 'low'
    };
  }

  let urgency: 'low' | 'medium' | 'high' = 'low';
  let message = '';

  if (this.daysUntilDue === 0) {
    urgency = 'high';
    message = `URGENT: "${this.name}" bill is due TODAY! Amount: ${this.amount.toLocaleString()}`;
  } else if (this.daysUntilDue <= 1) {
    urgency = 'high';
    message = `URGENT: "${this.name}" bill is due in ${this.daysUntilDue} day! Amount: ${this.amount.toLocaleString()}`;
  } else if (this.daysUntilDue <= 3) {
    urgency = 'medium';
    message = `REMINDER: "${this.name}" bill is due in ${this.daysUntilDue} days. Amount: ${this.amount.toLocaleString()}`;
  } else {
    urgency = 'low';
    message = `Upcoming: "${this.name}" bill due in ${this.daysUntilDue} days. Amount: ${this.amount.toLocaleString()}`;
  }

  return { shouldRemind: true, message, urgency };
};

// Vô hiệu hóa hóa đơn
recurringBillSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

// Kích hoạt lại hóa đơn
recurringBillSchema.methods.activate = function () {
  this.isActive = true;
  // Update next due date if it's in the past
  if (this.nextDueDate < new Date()) {
    this.nextDueDate = calculateNextDueDate(new Date(), this.frequency, this.dueDay);
  }
  return this.save();
};

// 12. Helper function to calculate next due date
function calculateNextDueDate(currentDate: Date, frequency: BillFrequency, dueDay?: number): Date {
  const nextDate = new Date(currentDate);

  switch (frequency) {
    case BillFrequency.DAILY:
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case BillFrequency.WEEKLY:
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case BillFrequency.MONTHLY:
      nextDate.setMonth(nextDate.getMonth() + 1);
      if (dueDay) {
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(dueDay, lastDayOfMonth));
      }
      break;
    case BillFrequency.QUARTERLY:
      nextDate.setMonth(nextDate.getMonth() + 3);
      if (dueDay) {
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(dueDay, lastDayOfMonth));
      }
      break;
    case BillFrequency.YEARLY:
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      if (dueDay) {
        const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
        nextDate.setDate(Math.min(dueDay, lastDayOfMonth));
      }
      break;
  }

  return nextDate;
}

// 13. Define static methods interface
export interface IRecurringBillModelStatic extends Model<IRecurringBillModel> {
  findActiveByUserId(userId: Types.ObjectId | string): Promise<IRecurringBillModel[]>;
  findOverdue(userId: Types.ObjectId | string): Promise<IRecurringBillModel[]>;
  findUpcoming(userId: Types.ObjectId | string, days?: number): Promise<IRecurringBillModel[]>;
  findByType(userId: Types.ObjectId | string, type: BillType): Promise<IRecurringBillModel[]>;
  calculateMonthlyTotal(userId: Types.ObjectId | string): Promise<any[]>;
  processAutoDebits(userId: Types.ObjectId | string): Promise<IRecurringBillModel[]>;
}

// 14. Export the model
const RecurringBill: IRecurringBillModelStatic =
  mongoose.models.RecurringBill as IRecurringBillModelStatic ||
  mongoose.model<IRecurringBillModel, IRecurringBillModelStatic>('RecurringBill', recurringBillSchema);

export default RecurringBill;
