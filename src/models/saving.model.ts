import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 1. Define enums for saving type and common values
export enum SavingType {
  MOTHER = 'mother',
  FUND = 'fund'
}

export enum FundType {
  EMERGENCY = 'emergency',
  INVESTMENT = 'investment',
  RETIREMENT = 'retirement',
  EDUCATION = 'education',
  TRAVEL = 'travel',
  OTHER = 'other'
}

// 2. Define the Saving document interface
export interface ISavingModel extends Document {
  userId: Types.ObjectId;
  month: Date;
  type: SavingType;
  depositDate: Date;
  accountNumber?: string;
  recipient?: string;
  amount: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  monthFormatted: string;
  isMotherSaving: boolean;
  isFundSaving: boolean;
  fundType?: FundType;
}

// 3. Define the schema
const savingSchema = new Schema<ISavingModel>(
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
    type: {
      type: String,
      required: [true, 'Saving type is required'],
      enum: {
        values: Object.values(SavingType),
        message: 'Saving type must be mother or fund'
      }
    },
    depositDate: {
      type: Date,
      required: [true, 'Deposit date is required'],
      validate: {
        validator: function (date: Date) {
          return date <= new Date();
        },
        message: 'Deposit date cannot be in the future'
      }
    },
    accountNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Account number cannot exceed 50 characters'],
      validate: {
        validator: function (value: string) {
          return !value || /^[0-9A-Za-z\-]+$/.test(value);
        },
        message: 'Account number contains invalid characters'
      }
    },
    recipient: {
      type: String,
      trim: true,
      maxlength: [100, 'Recipient name cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
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

// 4. Virtual for formatted month (YYYY-MM)
savingSchema.virtual('monthFormatted').get(function (this: ISavingModel) {
  return this.month.toISOString().substring(0, 7);
});

// 5. Virtual for checking if it's mother saving
savingSchema.virtual('isMotherSaving').get(function (this: ISavingModel) {
  return this.type === SavingType.MOTHER;
});

// 6. Virtual for checking if it's fund saving
savingSchema.virtual('isFundSaving').get(function (this: ISavingModel) {
  return this.type === SavingType.FUND;
});

// 7. Virtual for fund type (extracted from notes or based on pattern)
savingSchema.virtual('fundType').get(function (this: ISavingModel) {
  if (this.type !== SavingType.FUND) {
    return undefined;
  }

  if (!this.notes) {
    return FundType.OTHER;
  }

  const note = this.notes.toLowerCase();

  if (note.includes('emergency') || note.includes('khẩn cấp')) {
    return FundType.EMERGENCY;
  } else if (note.includes('investment') || note.includes('đầu tư')) {
    return FundType.INVESTMENT;
  } else if (note.includes('retirement') || note.includes('hưu trí')) {
    return FundType.RETIREMENT;
  } else if (note.includes('education') || note.includes('giáo dục')) {
    return FundType.EDUCATION;
  } else if (note.includes('travel') || note.includes('du lịch')) {
    return FundType.TRAVEL;
  } else {
    return FundType.OTHER;
  }
});

// 8. Indexes for efficient queries
savingSchema.index({ userId: 1, month: -1 });
savingSchema.index({ userId: 1, type: 1 });
savingSchema.index({ userId: 1, depositDate: -1 });
savingSchema.index({ type: 1, month: 1 });
savingSchema.index({ userId: 1, createdAt: -1 });

// 9. Pre-save middleware for validation and auto-processing
savingSchema.pre('save', function (next) {
  const saving = this as ISavingModel;

  // Auto-set recipient for mother savings
  if (saving.type === SavingType.MOTHER && !saving.recipient) {
    saving.recipient = 'Mother';
  }

  // Validate that mother savings have a recipient
  if (saving.type === SavingType.MOTHER && !saving.recipient) {
    return next(new Error('Recipient is required for mother savings'));
  }

  next();
});

// 10. Static methods
savingSchema.statics.findByUserIdAndMonth = function (userId: Types.ObjectId | string, month: Date) {
  const startDate = new Date(month);
  const endDate = new Date(month);
  endDate.setMonth(endDate.getMonth() + 1);

  return this.find({
    userId,
    month: {
      $gte: startDate,
      $lt: endDate
    }
  }).sort({ depositDate: -1 });
};

savingSchema.statics.findByType = function (userId: Types.ObjectId | string, type: SavingType, months?: number) {
  const query: any = { userId, type };

  if (months) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    query.month = { $gte: startDate };
  }

  return this.find(query).sort({ month: -1, depositDate: -1 });
};

savingSchema.statics.getMonthlySummary = function (userId: Types.ObjectId | string, month: Date) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        month: month
      }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

savingSchema.statics.getYearlySavings = function (userId: Types.ObjectId | string, year: number) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        month: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          month: { $month: '$month' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.month': 1 }
    }
  ]);
};

savingSchema.statics.getTotalSavings = function (userId: Types.ObjectId | string, startDate?: Date, endDate?: Date) {
  const match: any = { userId: new Types.ObjectId(userId.toString()) };

  if (startDate && endDate) {
    match.month = {
      $gte: startDate,
      $lte: endDate
    };
  }

  return this.aggregate([
    {
      $match: match
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

savingSchema.statics.findMotherSavings = function (userId: Types.ObjectId | string, months?: number) {
  const query: any = {
    userId,
    type: SavingType.MOTHER
  };

  if (months) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    query.month = { $gte: startDate };
  }

  return this.find(query).sort({ month: -1, depositDate: -1 });
};

// 11. Instance methods
savingSchema.methods.updateAmount = function (newAmount: number) {
  this.amount = newAmount;
  return this.save();
};

savingSchema.methods.changeType = function (newType: SavingType, newRecipient?: string) {
  this.type = newType;

  if (newRecipient) {
    this.recipient = newRecipient;
  } else if (newType === SavingType.MOTHER && !this.recipient) {
    this.recipient = 'Mother';
  }

  return this.save();
};

savingSchema.methods.getSavingInfo = function (): {
  type: SavingType;
  category: string;
  description: string;
  isRecurring: boolean;
} {
  const isMother = this.type === SavingType.MOTHER;
  const fundType = this.fundType;

  let category = '';
  let description = '';

  if (isMother) {
    category = 'Family Support';
    description = `Savings for ${this.recipient || 'mother'}`;
  } else {
    switch (fundType) {
      case FundType.EMERGENCY:
        category = 'Emergency Fund';
        description = 'Savings for unexpected expenses';
        break;
      case FundType.INVESTMENT:
        category = 'Investment Fund';
        description = 'Savings for investment opportunities';
        break;
      case FundType.RETIREMENT:
        category = 'Retirement Fund';
        description = 'Long-term savings for retirement';
        break;
      case FundType.EDUCATION:
        category = 'Education Fund';
        description = 'Savings for education purposes';
        break;
      case FundType.TRAVEL:
        category = 'Travel Fund';
        description = 'Savings for travel and vacations';
        break;
      default:
        category = 'General Savings';
        description = 'General purpose savings';
    }
  }

  // Check if this looks like a recurring saving (same amount around the same time each month)
  const isRecurring = this.amount > 0; // Basic check, could be enhanced with more logic

  return {
    type: this.type,
    category,
    description,
    isRecurring
  };
};

savingSchema.methods.isSimilarTo = function (otherSaving: ISavingModel): boolean {
  // Check if two savings are similar (for detecting patterns)
  return (
    this.type === otherSaving.type &&
    this.recipient === otherSaving.recipient &&
    Math.abs(this.amount - otherSaving.amount) / this.amount < 0.1 // Within 10% amount difference
  );
};

// 12. Define static methods interface
export interface ISavingModelStatic extends Model<ISavingModel> {
  findByUserIdAndMonth(userId: Types.ObjectId | string, month: Date): Promise<ISavingModel[]>;
  findByType(userId: Types.ObjectId | string, type: SavingType, months?: number): Promise<ISavingModel[]>;
  getMonthlySummary(userId: Types.ObjectId | string, month: Date): Promise<any[]>;
  getYearlySavings(userId: Types.ObjectId | string, year: number): Promise<any[]>;
  getTotalSavings(userId: Types.ObjectId | string, startDate?: Date, endDate?: Date): Promise<any[]>;
  findMotherSavings(userId: Types.ObjectId | string, months?: number): Promise<ISavingModel[]>;
}

// 13. Export the model
const Saving: ISavingModelStatic =
  mongoose.models.Saving as ISavingModelStatic ||
  mongoose.model<ISavingModel, ISavingModelStatic>('Saving', savingSchema);

export default Saving;
