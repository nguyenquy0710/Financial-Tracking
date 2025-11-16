import mongoose, { Document, Schema, Model, Types } from 'mongoose';

import { BudgetPeriod } from '@/config/enums';

// 2. Define the Budget document interface
export interface IBudgetModel extends Document {
  userId: Types.ObjectId;
  name: string;
  categoryId: Types.ObjectId;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  alertThreshold: number;
  isActive: boolean;
  spent: number;
  lastAlertDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  percentageSpent: number;
  remaining: number;
}

// 3. Define the schema
const budgetSchema = new Schema<IBudgetModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    name: {
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
      maxlength: [100, 'Budget name cannot exceed 100 characters']
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required']
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100 // Store with 2 decimal precision
    },
    period: {
      type: String,
      required: [true, 'Budget period is required'],
      enum: {
        values: Object.values(BudgetPeriod),
        message: 'Period must be daily, weekly, monthly, or yearly'
      },
      default: BudgetPeriod.MONTHLY
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: function (date: Date) {
          return date <= new Date();
        },
        message: 'Start date cannot be in the future'
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IBudgetModel, date: Date) {
          return !date || date > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: [0, 'Alert threshold cannot be negative'],
      max: [100, 'Alert threshold cannot exceed 100%']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    lastAlertDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// 4. Virtual for percentage spent
budgetSchema.virtual('percentageSpent').get(function (this: IBudgetModel) {
  return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
});

// 5. Virtual for remaining amount
budgetSchema.virtual('remaining').get(function (this: IBudgetModel) {
  return Math.max(0, this.amount - this.spent);
});

// 6. Virtual for isOverBudget
budgetSchema.virtual('isOverBudget').get(function (this: IBudgetModel) {
  return this.spent > this.amount;
});

// 7. Virtual for shouldAlert
budgetSchema.virtual('shouldAlert').get(function (this: IBudgetModel) {
  return this.percentageSpent >= this.alertThreshold &&
    this.isActive &&
    !(this as any).isOverBudget; // Avoid alert if already over budget
});

// 8. Indexes for faster queries
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, period: 1 });
budgetSchema.index({ userId: 1, categoryId: 1 });
budgetSchema.index({ userId: 1, startDate: -1 });
budgetSchema.index({ userId: 1, endDate: 1 });

// 9. Pre-save middleware for validation
budgetSchema.pre('save', function (next) {
  const budget: any = this as IBudgetModel;

  // Update spent to not exceed amount
  if (budget.spent > budget.amount) {
    budget.spent = budget.amount;
  }

  // Update lastAlertDate if threshold is reached
  if (budget.shouldAlert && !budget.lastAlertDate) {
    budget.lastAlertDate = new Date();
  }

  next();
});

// 10. Static methods
budgetSchema.statics.findActiveByUserId = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    isActive: true,
    $or: [
      { endDate: { $exists: false } },
      { endDate: { $gte: new Date() } }
    ]
  }).populate('categoryId').sort({ startDate: -1 });
};

budgetSchema.statics.findOverBudget = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    isActive: true,
    $expr: { $gt: ['$spent', '$amount'] }
  }).populate('categoryId');
};

budgetSchema.statics.findByPeriod = function (userId: Types.ObjectId | string, period: BudgetPeriod) {
  return this.find({
    userId,
    period,
    isActive: true
  }).populate('categoryId');
};

budgetSchema.statics.resetSpentAmounts = function (userId: Types.ObjectId | string) {
  return this.updateMany(
    { userId, isActive: true },
    {
      spent: 0,
      lastAlertDate: null
    }
  );
};

// 11. Instance methods
budgetSchema.methods.addExpense = function (amount: number) {
  this.spent += amount;
  return this.save();
};

budgetSchema.methods.updateSpent = async function (newSpent: number) {
  this.spent = Math.max(0, newSpent);
  return this.save();
};

budgetSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

budgetSchema.methods.checkAndAlert = function (): { shouldAlert: boolean; message: string } {
  const percentage = this.percentageSpent;

  if (this.isOverBudget) {
    return {
      shouldAlert: true,
      message: `Budget "${this.name}" is over budget! Spent: ${this.spent.toFixed(2)} of ${this.amount.toFixed(2)}`
    };
  }

  if (this.shouldAlert) {
    return {
      shouldAlert: true,
      message: `Budget "${this.name}" has reached ${percentage.toFixed(1)}% of limit (${this.alertThreshold}% threshold)`
    };
  }

  return {
    shouldAlert: false,
    message: ''
  };
};

// 12. Define static methods interface
export interface IBudgetModelStatic extends Model<IBudgetModel> {
  findActiveByUserId(userId: Types.ObjectId | string): Promise<IBudgetModel[]>;
  findOverBudget(userId: Types.ObjectId | string): Promise<IBudgetModel[]>;
  findByPeriod(userId: Types.ObjectId | string, period: BudgetPeriod): Promise<IBudgetModel[]>;
  resetSpentAmounts(userId: Types.ObjectId | string): Promise<any>;
}

// 13. Export the model
const Budget: IBudgetModelStatic =
  mongoose.models.Budget as IBudgetModelStatic ||
  mongoose.model<IBudgetModel, IBudgetModelStatic>('Budget', budgetSchema);

export default Budget;
