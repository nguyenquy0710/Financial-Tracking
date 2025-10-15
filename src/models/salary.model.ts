import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 1. Define enums for company and growth types
export enum Company {
  VIHAT = 'VIHAT',
  DAKIATECH = 'DAKIATECH',
  OTHER = 'OTHER'
}

export enum GrowthType {
  BASIC_SALARY = 'basicSalary',
  FREELANCE = 'freelance',
  TOTAL_INCOME = 'totalIncome'
}

// 2. Define interfaces for nested objects
export interface IFreelanceIncome {
  dakiatech: number;
  other: number;
  total: number;
}

export interface IGrowth {
  basicSalary: number;
  freelance: number;
  totalIncome: number;
}

// 3. Define the Salary document interface
export interface ISalaryModel extends Document {
  userId: Types.ObjectId;
  month: Date;
  company: string;
  baseSalary: number;
  kpi: number;
  leader: number;
  project: number;
  overtime: number;
  bonus13thMonth: number;
  totalCompanySalary: number;
  freelance: IFreelanceIncome;
  totalIncome: number;
  receiveDate?: Date;
  notes?: string;
  growth: IGrowth;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  monthFormatted: string;
  totalBonus: number;
  totalRegularSalary: number;
  growthPercentage: IGrowth;
}

// 4. Define the schema
const salarySchema = new Schema<ISalaryModel>(
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
    company: {
      type: String,
      trim: true,
      default: Company.VIHAT,
      maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    baseSalary: {
      type: Number,
      default: 0,
      min: [0, 'Base salary cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    kpi: {
      type: Number,
      default: 0,
      min: [0, 'KPI bonus cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    leader: {
      type: Number,
      default: 0,
      min: [0, 'Leader bonus cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    project: {
      type: Number,
      default: 0,
      min: [0, 'Project bonus cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    overtime: {
      type: Number,
      default: 0,
      min: [0, 'Overtime pay cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    bonus13thMonth: {
      type: Number,
      default: 0,
      min: [0, '13th month bonus cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    totalCompanySalary: {
      type: Number,
      default: 0,
      min: [0, 'Total company salary cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    freelance: {
      dakiatech: {
        type: Number,
        default: 0,
        min: [0, 'Dakiatech income cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      other: {
        type: Number,
        default: 0,
        min: [0, 'Other freelance income cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      },
      total: {
        type: Number,
        default: 0,
        min: [0, 'Total freelance income cannot be negative'],
        set: (v: number) => Math.round(v * 100) / 100
      }
    },
    totalIncome: {
      type: Number,
      default: 0,
      min: [0, 'Total income cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100
    },
    receiveDate: {
      type: Date,
      validate: {
        validator: function (date: Date) {
          return !date || date <= new Date();
        },
        message: 'Receive date cannot be in the future'
      }
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    growth: {
      basicSalary: {
        type: Number,
        default: 0,
        set: (v: number) => Math.round(v * 100) / 100
      },
      freelance: {
        type: Number,
        default: 0,
        set: (v: number) => Math.round(v * 100) / 100
      },
      totalIncome: {
        type: Number,
        default: 0,
        set: (v: number) => Math.round(v * 100) / 100
      }
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

// 5. Virtual for formatted month (YYYY-MM)
salarySchema.virtual('monthFormatted').get(function (this: ISalaryModel) {
  return this.month.toISOString().substring(0, 7);
});

// 6. Virtual for total bonus
salarySchema.virtual('totalBonus').get(function (this: ISalaryModel) {
  return this.kpi + this.leader + this.project + this.overtime + this.bonus13thMonth;
});

// 7. Virtual for total regular salary (base + bonuses)
salarySchema.virtual('totalRegularSalary').get(function (this: ISalaryModel) {
  return this.baseSalary + this.totalBonus;
});

// 8. Virtual for growth percentage
salarySchema.virtual('growthPercentage').get(function (this: ISalaryModel) {
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    basicSalary: calculatePercentage(this.growth.basicSalary, 0),
    freelance: calculatePercentage(this.growth.freelance, 0),
    totalIncome: calculatePercentage(this.growth.totalIncome, 0)
  };
});

// 9. Indexes for efficient queries
salarySchema.index({ userId: 1, month: -1 });
salarySchema.index({ userId: 1, company: 1 });
salarySchema.index({ userId: 1, createdAt: -1 });
salarySchema.index({ month: 1, company: 1 });
salarySchema.index({ userId: 1, totalIncome: -1 });

// 10. Pre-save middleware for calculations
salarySchema.pre('save', function (next) {
  const salary = this as ISalaryModel;

  // Calculate freelance total
  salary.freelance.total = salary.freelance.dakiatech + salary.freelance.other;

  // Calculate total company salary
  salary.totalCompanySalary = salary.baseSalary + salary.kpi + salary.leader +
    salary.project + salary.overtime + salary.bonus13thMonth;

  // Calculate total income
  salary.totalIncome = salary.totalCompanySalary + salary.freelance.total;

  next();
});

// 11. Static methods
salarySchema.statics.findByUserIdAndMonth = function (userId: Types.ObjectId | string, month: Date) {
  const startDate = new Date(month);
  const endDate = new Date(month);
  endDate.setMonth(endDate.getMonth() + 1);

  return this.findOne({
    userId,
    month: {
      $gte: startDate,
      $lt: endDate
    }
  });
};

salarySchema.statics.findByUserIdAndDateRange = function (
  userId: Types.ObjectId | string,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    userId,
    month: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ month: 1 });
};

salarySchema.statics.getSalarySummary = function (userId: Types.ObjectId | string, year: number) {
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
        _id: null,
        totalBaseSalary: { $sum: '$baseSalary' },
        totalKPI: { $sum: '$kpi' },
        totalLeader: { $sum: '$leader' },
        totalProject: { $sum: '$project' },
        totalOvertime: { $sum: '$overtime' },
        totalBonus13thMonth: { $sum: '$bonus13thMonth' },
        totalCompanySalary: { $sum: '$totalCompanySalary' },
        totalFreelance: { $sum: '$freelance.total' },
        totalIncome: { $sum: '$totalIncome' },
        averageMonthlyIncome: { $avg: '$totalIncome' },
        recordCount: { $sum: 1 }
      }
    }
  ]);
};

salarySchema.statics.getMonthlyTrend = function (userId: Types.ObjectId | string, months: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  return this.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId.toString()),
        month: { $gte: startDate }
      }
    },
    {
      $project: {
        month: 1,
        totalCompanySalary: 1,
        freelanceTotal: '$freelance.total',
        totalIncome: 1,
        baseSalary: 1
      }
    },
    {
      $sort: { month: 1 }
    }
  ]);
};

salarySchema.statics.calculateGrowth = async function (userId: Types.ObjectId | string, currentMonth: Date) {
  const currentSalary = await this.findOne({
    userId,
    month: currentMonth
  });

  if (!currentSalary) {
    return null;
  }

  const previousMonth = new Date(currentMonth);
  previousMonth.setMonth(previousMonth.getMonth() - 1);

  const previousSalary = await this.findOne({
    userId,
    month: previousMonth
  });

  const growth: IGrowth = {
    basicSalary: 0,
    freelance: 0,
    totalIncome: 0
  };

  if (previousSalary) {
    growth.basicSalary = currentSalary.baseSalary - previousSalary.baseSalary;
    growth.freelance = currentSalary.freelance.total - previousSalary.freelance.total;
    growth.totalIncome = currentSalary.totalIncome - previousSalary.totalIncome;
  }

  // Update the current salary with growth data
  currentSalary.growth = growth;
  await currentSalary.save();

  return currentSalary;
};

// 12. Instance methods
salarySchema.methods.updateFreelanceIncome = function (dakiatech?: number, other?: number) {
  if (dakiatech !== undefined) {
    this.freelance.dakiatech = dakiatech;
  }
  if (other !== undefined) {
    this.freelance.other = other;
  }
  this.freelance.total = this.freelance.dakiatech + this.freelance.other;
  return this.save();
};

salarySchema.methods.addBonus = function (type: 'kpi' | 'leader' | 'project' | 'overtime' | 'bonus13thMonth', amount: number) {
  this[type] += amount;
  return this.save();
};

salarySchema.methods.getIncomeBreakdown = function (): Array<{ category: string; amount: number; percentage: number }> {
  const breakdown = [];
  const total = this.totalIncome;

  if (this.baseSalary > 0) {
    breakdown.push({
      category: 'Base Salary',
      amount: this.baseSalary,
      percentage: (this.baseSalary / total) * 100
    });
  }

  if (this.kpi > 0) {
    breakdown.push({
      category: 'KPI Bonus',
      amount: this.kpi,
      percentage: (this.kpi / total) * 100
    });
  }

  if (this.leader > 0) {
    breakdown.push({
      category: 'Leader Bonus',
      amount: this.leader,
      percentage: (this.leader / total) * 100
    });
  }

  if (this.project > 0) {
    breakdown.push({
      category: 'Project Bonus',
      amount: this.project,
      percentage: (this.project / total) * 100
    });
  }

  if (this.overtime > 0) {
    breakdown.push({
      category: 'Overtime',
      amount: this.overtime,
      percentage: (this.overtime / total) * 100
    });
  }

  if (this.bonus13thMonth > 0) {
    breakdown.push({
      category: '13th Month Bonus',
      amount: this.bonus13thMonth,
      percentage: (this.bonus13thMonth / total) * 100
    });
  }

  if (this.freelance.dakiatech > 0) {
    breakdown.push({
      category: 'Freelance - Dakiatech',
      amount: this.freelance.dakiatech,
      percentage: (this.freelance.dakiatech / total) * 100
    });
  }

  if (this.freelance.other > 0) {
    breakdown.push({
      category: 'Freelance - Other',
      amount: this.freelance.other,
      percentage: (this.freelance.other / total) * 100
    });
  }

  return breakdown.sort((a, b) => b.amount - a.amount);
};

salarySchema.methods.markAsReceived = function (receiveDate?: Date) {
  this.receiveDate = receiveDate || new Date();
  return this.save();
};

// 13. Define static methods interface
export interface ISalaryModelStatic extends Model<ISalaryModel> {
  findByUserIdAndMonth(userId: Types.ObjectId | string, month: Date): Promise<ISalaryModel | null>;
  findByUserIdAndDateRange(userId: Types.ObjectId | string, startDate: Date, endDate: Date): Promise<ISalaryModel[]>;
  getSalarySummary(userId: Types.ObjectId | string, year: number): Promise<any[]>;
  getMonthlyTrend(userId: Types.ObjectId | string, months?: number): Promise<any[]>;
  calculateGrowth(userId: Types.ObjectId | string, currentMonth: Date): Promise<ISalaryModel | null>;
}

// 14. Export the model
const Salary: ISalaryModelStatic =
  mongoose.models.Salary as ISalaryModelStatic ||
  mongoose.model<ISalaryModel, ISalaryModelStatic>('Salary', salarySchema);

export default Salary;
