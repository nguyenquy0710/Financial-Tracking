import { GoalPriority, GoalStatus, ReminderFrequency } from '@/config/enums';
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 2. Define interfaces for nested objects
export interface IReminder {
  enabled: boolean;
  frequency: ReminderFrequency;
  lastReminderDate?: Date;
}

export interface IMilestone {
  _id?: Types.ObjectId;
  amount: number;
  date: Date;
  achieved: boolean;
  achievedDate?: Date;
}

// 3. Define the Goal document interface
export interface IGoalModel extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  startDate: Date;
  icon: string;
  color: string;
  priority: GoalPriority;
  status: GoalStatus;
  reminder: IReminder;
  milestones: IMilestone[];
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  percentageCompleted: number;
  remainingAmount: number;
  daysRemaining: number;
  isOverdue: boolean; // Kiểm tra mục tiêu quá hạn
  monthlyContribution: number; // Tính số tiền cần đóng góp hàng tháng
}

// 4. Define the schema
const goalSchema = new Schema<IGoalModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0.01, 'Target amount must be greater than 0'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required'],
      validate: {
        validator: function (date: Date) {
          return date > new Date();
        },
        message: 'Target date must be in the future'
      }
    },
    startDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (this: IGoalModel, date: Date) {
          return date < this.targetDate;
        },
        message: 'Start date must be before target date'
      }
    },
    icon: {
      type: String,
      default: '🎯',
      maxlength: [10, 'Icon cannot exceed 10 characters']
    },
    color: {
      type: String,
      default: '#27ae60',
      validate: {
        validator: function (color: string) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
        },
        message: 'Color must be a valid hex color code'
      }
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(GoalPriority),
        message: 'Priority must be low, medium, or high'
      },
      default: GoalPriority.MEDIUM
    },
    status: {
      type: String,
      enum: {
        values: Object.values(GoalStatus),
        message: 'Status must be active, completed, paused, or cancelled'
      },
      default: GoalStatus.ACTIVE
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: {
          values: Object.values(ReminderFrequency),
          message: 'Frequency must be daily, weekly, or monthly'
        },
        default: ReminderFrequency.WEEKLY
      },
      lastReminderDate: {
        type: Date
      }
    },
    milestones: [{
      amount: {
        type: Number,
        required: [true, 'Milestone amount is required'],
        min: [0, 'Milestone amount cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      date: {
        type: Date,
        required: [true, 'Milestone date is required']
      },
      achieved: {
        type: Boolean,
        default: false
      },
      achievedDate: {
        type: Date
      }
    }]
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

// 5. Virtual for percentage completed
goalSchema.virtual('percentageCompleted').get(function (this: IGoalModel) {
  return this.targetAmount > 0 ? (this.currentAmount / this.targetAmount) * 100 : 0;
});

// 6. Virtual for remaining amount
goalSchema.virtual('remainingAmount').get(function (this: IGoalModel) {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// 7. Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function (this: IGoalModel) {
  const now = new Date();
  const target = new Date(this.targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// 8. Virtual for checking if goal is overdue
goalSchema.virtual('isOverdue').get(function (this: IGoalModel) {
  return this.daysRemaining <= 0 && this.status === GoalStatus.ACTIVE;
});

// 9. Virtual for monthly contribution needed
goalSchema.virtual('monthlyContribution').get(function (this: IGoalModel) {
  const now = new Date();
  const target = new Date(this.targetDate);
  const monthsRemaining = (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());

  if (monthsRemaining <= 0) {
    return this.remainingAmount;
  }

  return Math.max(0, this.remainingAmount / monthsRemaining);
});

// 10. Indexes for faster queries
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });
goalSchema.index({ userId: 1, priority: 1 });
goalSchema.index({ targetDate: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

// 11. Pre-save middleware for calculations and validation
goalSchema.pre('save', function (next) {
  const goal = this as IGoalModel;

  // Auto-update status based on current amount
  if (goal.currentAmount >= goal.targetAmount && goal.status === GoalStatus.ACTIVE) {
    goal.status = GoalStatus.COMPLETED;
  }

  // Validate current amount doesn't exceed target amount
  if (goal.currentAmount > goal.targetAmount) {
    goal.currentAmount = goal.targetAmount;
  }

  // Update milestone achievements
  if (goal.milestones && goal.milestones.length > 0) {
    goal.milestones.forEach(milestone => {
      if (!milestone.achieved && goal.currentAmount >= milestone.amount) {
        milestone.achieved = true;
        milestone.achievedDate = new Date();
      }
    });
  }

  next();
});

// 12. Static methods
// Tìm mục tiêu đang hoạt động
goalSchema.statics.findActiveByUserId = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    status: GoalStatus.ACTIVE
  }).sort({ priority: -1, targetDate: 1 });
};

// Tìm mục tiêu đã hoàn thành
goalSchema.statics.findCompletedByUserId = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    status: GoalStatus.COMPLETED
  }).sort({ targetDate: -1 });
};

// Tìm mục tiêu quá hạn
goalSchema.statics.findOverdue = function (userId: Types.ObjectId | string) {
  return this.find({
    userId,
    status: GoalStatus.ACTIVE,
    targetDate: { $lt: new Date() }
  });
};

// Tìm mục tiêu theo mức độ ưu tiên
goalSchema.statics.findByPriority = function (userId: Types.ObjectId | string, priority: GoalPriority) {
  return this.find({
    userId,
    priority,
    status: GoalStatus.ACTIVE
  }).sort({ targetDate: 1 });
};

// Tổng hợp tiến độ tất cả mục tiêu
goalSchema.statics.getProgressSummary = function (userId: Types.ObjectId | string) {
  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        status: GoalStatus.ACTIVE
      }
    },
    {
      $group: {
        _id: null,
        totalGoals: { $sum: 1 },
        totalTargetAmount: { $sum: '$targetAmount' },
        totalCurrentAmount: { $sum: '$currentAmount' },
        averageProgress: { $avg: '$percentageCompleted' }
      }
    }
  ]);
};

// 13. Instance methods
// Thêm đóng góp vào mục tiêu
goalSchema.methods.addContribution = function (amount: number) {
  this.currentAmount = Math.min(this.targetAmount, this.currentAmount + amount);
  return this.save();
};

// Đánh dấu hoàn thành mục tiêu
goalSchema.methods.completeGoal = function () {
  this.status = GoalStatus.COMPLETED;
  this.currentAmount = this.targetAmount;
  return this.save();
};

// Thêm mốc quan trọng
goalSchema.methods.addMilestone = function (amount: number, date: Date) {
  const milestone: IMilestone = {
    amount,
    date,
    achieved: false
  };

  this.milestones.push(milestone);
  // Sort milestones by amount
  this.milestones.sort((a: IMilestone, b: IMilestone) => a.amount - b.amount);

  return this.save();
};

// Lấy mốc quan trọng tiếp theo
goalSchema.methods.getNextMilestone = function (): IMilestone | null {
  const unachieved = this.milestones.filter((m: IMilestone) => !m.achieved);
  return unachieved.length > 0 ? unachieved[0] : null;
};

// Tính toán tiến độ chi tiết
goalSchema.methods.calculateProgress = function (): {
  percentage: number;
  remaining: number;
  monthlyNeeded: number;
  onTrack: boolean;
} {
  const percentage = this.percentageCompleted;
  const remaining = this.remainingAmount;
  const monthlyNeeded = this.monthlyContribution;

  // Check if on track (at least 80% of expected progress)
  const elapsed = Date.now() - this.startDate.getTime();
  const total = this.targetDate.getTime() - this.startDate.getTime();
  const expectedProgress = (elapsed / total) * 100;

  const onTrack = percentage >= expectedProgress * 0.8;

  return {
    percentage,
    remaining,
    monthlyNeeded,
    onTrack
  };
};

// Gửi nhắc nhở (logic)
goalSchema.methods.sendReminder = function (): { shouldRemind: boolean; message: string } {
  if (!this.reminder.enabled || this.status !== GoalStatus.ACTIVE) {
    return { shouldRemind: false, message: '' };
  }

  const now = new Date();
  let shouldRemind = false;

  // Check if it's time for a reminder based on frequency
  if (!this.reminder.lastReminderDate) {
    shouldRemind = true;
  } else {
    const lastReminder = new Date(this.reminder.lastReminderDate);
    const diffDays = Math.floor((now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24));

    switch (this.reminder.frequency) {
      case ReminderFrequency.DAILY:
        shouldRemind = diffDays >= 1;
        break;
      case ReminderFrequency.WEEKLY:
        shouldRemind = diffDays >= 7;
        break;
      case ReminderFrequency.MONTHLY:
        shouldRemind = diffDays >= 30;
        break;
    }
  }

  if (shouldRemind) {
    this.reminder.lastReminderDate = now;
    this.save();

    const progress = this.calculateProgress();
    const message = `Goal Reminder: ${this.name}\n` +
      `Progress: ${progress.percentage.toFixed(1)}% (${this.currentAmount.toLocaleString()} of ${this.targetAmount.toLocaleString()})\n` +
      `Remaining: ${this.remainingAmount.toLocaleString()}\n` +
      `Monthly needed: ${progress.monthlyNeeded.toLocaleString()}\n` +
      `Deadline: ${this.targetDate.toLocaleDateString()} (${this.daysRemaining} days left)`;

    return { shouldRemind: true, message };
  }

  return { shouldRemind: false, message: '' };
};

// 14. Define static methods interface
export interface IGoalModelStatic extends Model<IGoalModel> {
  findActiveByUserId(userId: Types.ObjectId | string): Promise<IGoalModel[]>;
  findCompletedByUserId(userId: Types.ObjectId | string): Promise<IGoalModel[]>;
  findOverdue(userId: Types.ObjectId | string): Promise<IGoalModel[]>;
  findByPriority(userId: Types.ObjectId | string, priority: GoalPriority): Promise<IGoalModel[]>;
  getProgressSummary(userId: Types.ObjectId | string): Promise<any[]>;
}

// 15. Export the model
const Goal: IGoalModelStatic =
  mongoose.models.Goal as IGoalModelStatic ||
  mongoose.model<IGoalModel, IGoalModelStatic>('Goal', goalSchema);

export default Goal;
