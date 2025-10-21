import { PaymentMethod, RecurringFrequency, TransactionType } from '@/config/enums';
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 2. Define interfaces for nested objects
export interface IRecurringPattern {
  frequency?: RecurringFrequency;
  endDate?: Date;
}

export interface ITransactionTag {
  _id?: Types.ObjectId;
  tag: string;
}

// 3. Define the Transaction document interface
export interface ITransactionModel extends Document {
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  categoryId: Types.ObjectId;
  description?: string;
  date: Date;
  paymentMethod: PaymentMethod;
  location?: string;
  receiptImage?: string;
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: IRecurringPattern;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  isIncome: boolean;
  isExpense: boolean;
  dateFormatted: string;
  monthYear: string;
  weekNumber: number;
  hasReceipt: boolean;
  nextRecurringDate?: Date;
}

// 4. Define the schema
const transactionSchema = new Schema<ITransactionModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: Object.values(TransactionType),
        message: 'Transaction type must be income or expense'
      },
      default: TransactionType.EXPENSE
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      validate: {
        validator: function (date: Date) {
          return date <= new Date();
        },
        message: 'Transaction date cannot be in the future'
      }
    },
    paymentMethod: {
      type: String,
      enum: {
        values: Object.values(PaymentMethod),
        message: 'Payment method must be cash, card, bank_transfer, e_wallet, or other'
      },
      default: PaymentMethod.CASH
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    receiptImage: {
      type: String,
      validate: {
        validator: function (url: string) {
          if (!url) return true;
          return /^https?:\/\/.+\..+/.test(url);
        },
        message: 'Receipt image must be a valid URL'
      }
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: {
          values: Object.values(RecurringFrequency),
          message: 'Frequency must be daily, weekly, monthly, or yearly'
        }
      },
      endDate: {
        type: Date,
        validate: {
          validator: function (this: ITransactionModel, date: Date) {
            if (!date || !this.recurringPattern?.frequency) return true;
            return date > this.date;
          },
          message: 'Recurring end date must be after transaction date'
        }
      }
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

// 5. Virtual for checking if transaction is income
transactionSchema.virtual('isIncome').get(function (this: ITransactionModel) {
  return this.type === TransactionType.INCOME;
});

// 6. Virtual for checking if transaction is expense
transactionSchema.virtual('isExpense').get(function (this: ITransactionModel) {
  return this.type === TransactionType.EXPENSE;
});

// 7. Virtual for formatted date
transactionSchema.virtual('dateFormatted').get(function (this: ITransactionModel) {
  return this.date.toLocaleDateString();
});

// 8. Virtual for month-year string (YYYY-MM)
transactionSchema.virtual('monthYear').get(function (this: ITransactionModel) {
  return this.date.toISOString().substring(0, 7);
});

// 9. Virtual for week number
transactionSchema.virtual('weekNumber').get(function (this: ITransactionModel) {
  const date = new Date(this.date);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
});

// 10. Virtual for checking if receipt exists
transactionSchema.virtual('hasReceipt').get(function (this: ITransactionModel) {
  return !!this.receiptImage;
});

// 11. Virtual for next recurring date
transactionSchema.virtual('nextRecurringDate').get(function (this: ITransactionModel) {
  if (!this.isRecurring || !this.recurringPattern?.frequency) {
    return undefined;
  }

  const lastDate = new Date(this.date);
  const now = new Date();

  while (lastDate <= now) {
    switch (this.recurringPattern.frequency) {
      case RecurringFrequency.DAILY:
        lastDate.setDate(lastDate.getDate() + 1);
        break;
      case RecurringFrequency.WEEKLY:
        lastDate.setDate(lastDate.getDate() + 7);
        break;
      case RecurringFrequency.MONTHLY:
        lastDate.setMonth(lastDate.getMonth() + 1);
        break;
      case RecurringFrequency.YEARLY:
        lastDate.setFullYear(lastDate.getFullYear() + 1);
        break;
    }

    // Check if we've passed the end date
    if (this.recurringPattern.endDate && lastDate > this.recurringPattern.endDate) {
      return undefined;
    }
  }

  return lastDate;
});

// 12. Indexes for efficient queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, paymentMethod: 1 });
transactionSchema.index({ userId: 1, tags: 1 });
transactionSchema.index({ userId: 1, isRecurring: 1 });
transactionSchema.index({ date: 1, type: 1 });
transactionSchema.index({ userId: 1, amount: -1 });
transactionSchema.index({ userId: 1, createdAt: -1 });

// 13. Text index for search
transactionSchema.index({
  description: 'text',
  location: 'text',
  notes: 'text',
  tags: 'text'
});

// 14. Pre-save middleware for validation and processing
transactionSchema.pre('save', function (next) {
  const transaction = this as ITransactionModel;

  // Remove duplicate tags and convert to lowercase
  if (transaction.tags && transaction.tags.length > 0) {
    const uniqueTags = [...new Set(transaction.tags.map(tag => tag.trim().toLowerCase()))];
    transaction.tags = uniqueTags;
  }

  // Validate recurring pattern
  if (transaction.isRecurring && !transaction.recurringPattern?.frequency) {
    return next(new Error('Recurring frequency is required for recurring transactions'));
  }

  // Auto-generate description if not provided
  if (!transaction.description) {
    transaction.description = `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction`;
  }

  next();
});

// 15. Static methods
transactionSchema.statics.findByUserIdAndDateRange = function (
  userId: Types.ObjectId | string,
  startDate: Date,
  endDate: Date,
  type?: TransactionType
) {
  const query: any = {
    userId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (type) {
    query.type = type;
  }

  return this.find(query)
    .populate('categoryId')
    .sort({ date: -1, createdAt: -1 });
};

transactionSchema.statics.findByCategory = function (
  userId: Types.ObjectId | string,
  categoryId: Types.ObjectId | string,
  months?: number
) {
  const query: any = { userId, categoryId };

  if (months) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    query.date = { $gte: startDate };
  }

  return this.find(query)
    .populate('categoryId')
    .sort({ date: -1 });
};

transactionSchema.statics.getMonthlySummary = function (userId: Types.ObjectId | string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

transactionSchema.statics.getCategoryBreakdown = function (
  userId: Types.ObjectId | string,
  startDate: Date,
  endDate: Date,
  type: TransactionType
) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        date: { $gte: startDate, $lte: endDate },
        type: type
      }
    },
    {
      $group: {
        _id: '$categoryId',
        totalAmount: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

transactionSchema.statics.findRecurringTransactions = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    isRecurring: true
  })
    .populate('categoryId')
    .sort({ date: -1 });
};

transactionSchema.statics.searchTransactions = function (
  userId: Types.ObjectId | string,
  searchTerm: string,
  limit: number = 50
) {
  return this.find({
    userId,
    $text: { $search: searchTerm }
  }, {
    score: { $meta: 'textScore' }
  })
    .populate('categoryId')
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

transactionSchema.statics.getSpendingTrend = function (
  userId: Types.ObjectId | string,
  months: number = 6
) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        type: TransactionType.EXPENSE,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalSpending: { $sum: '$amount' },
        transactionCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

// 16. Instance methods
transactionSchema.methods.addTag = function (tag: string) {
  const normalizedTag = tag.trim().toLowerCase();
  if (!this.tags.includes(normalizedTag)) {
    this.tags.push(normalizedTag);
  }
  return this.save();
};

transactionSchema.methods.removeTag = function (tag: string) {
  const normalizedTag = tag.trim().toLowerCase();
  this.tags = this.tags.filter((t: string) => t !== normalizedTag);
  return this.save();
};

transactionSchema.methods.setRecurring = function (frequency: RecurringFrequency, endDate?: Date) {
  this.isRecurring = true;
  this.recurringPattern = {
    frequency,
    endDate
  };
  return this.save();
};

transactionSchema.methods.createNextRecurringTransaction = async function (): Promise<ITransactionModel | null> {
  if (!this.isRecurring || !this.nextRecurringDate) {
    return null;
  }

  const nextDate = this.nextRecurringDate;

  // Check if next transaction already exists
  const existing = await this.model('Transaction').findOne({
    userId: this.userId,
    description: this.description,
    amount: this.amount,
    date: nextDate
  });

  if (existing) {
    return null;
  }

  // Create new transaction
  const nextTransactionData = this.toObject();
  delete nextTransactionData._id;
  delete nextTransactionData.createdAt;
  delete nextTransactionData.updatedAt;

  nextTransactionData.date = nextDate;
  nextTransactionData.isRecurring = false; // Don't make the new one recurring by default

  return this.model('Transaction').create(nextTransactionData);
};

transactionSchema.methods.getTransactionSummary = function (): {
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  paymentMethod: string;
  hasReceipt: boolean;
  tagCount: number;
} {
  return {
    type: this.type,
    amount: this.amount,
    date: this.dateFormatted,
    category: this.categoryId?.toString() || '',
    paymentMethod: this.paymentMethod,
    hasReceipt: this.hasReceipt,
    tagCount: this.tags.length
  };
};

// 17. Define static methods interface
export interface ITransactionModelStatic extends Model<ITransactionModel> {
  findByUserIdAndDateRange(
    userId: Types.ObjectId | string,
    startDate: Date,
    endDate: Date,
    type?: TransactionType
  ): Promise<ITransactionModel[]>;

  findByCategory(
    userId: Types.ObjectId | string,
    categoryId: Types.ObjectId | string,
    months?: number
  ): Promise<ITransactionModel[]>;

  getMonthlySummary(
    userId: Types.ObjectId | string,
    year: number,
    month: number
  ): Promise<any[]>;

  getCategoryBreakdown(
    userId: Types.ObjectId | string,
    startDate: Date,
    endDate: Date,
    type: TransactionType
  ): Promise<any[]>;

  findRecurringTransactions(userId: Types.ObjectId | string): Promise<ITransactionModel[]>;

  searchTransactions(
    userId: Types.ObjectId | string,
    searchTerm: string,
    limit?: number
  ): Promise<ITransactionModel[]>;

  getSpendingTrend(
    userId: Types.ObjectId | string,
    months?: number
  ): Promise<any[]>;
}

// 18. Export the model
const Transaction: ITransactionModelStatic =
  mongoose.models.Transaction as ITransactionModelStatic ||
  mongoose.model<ITransactionModel, ITransactionModelStatic>('Transaction', transactionSchema);

export default Transaction;
