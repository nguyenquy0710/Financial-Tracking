import mongoose, { Document, Schema, Model, Types } from 'mongoose';

import { SystemConfigName } from '@/config/enums';
import IAbsBaseModel, { createBaseSchema } from '@/abstracts/absBase.model';

// 1. Define enum for common configuration names

// 2. Define interface for configuration value types
export type ConfigValue = string | number | boolean | object | null;

// 3. Define the SystemConfig document interface
export interface ISystemConfigModel extends IAbsBaseModel {
  configName: string;
  configValue: string;
  isActive: boolean;
  // createdAt?: Date;
  // updatedAt?: Date;

  // Virtual fields
  parsedValue: ConfigValue;
  valueType: 'string' | 'number' | 'boolean' | 'object' | 'null';
}

// 4. Define the schema
const systemConfigSchema = createBaseSchema<ISystemConfigModel>(
  {
    configName: {
      type: String,
      required: [true, 'Config name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Config name cannot exceed 100 characters'],
      validate: {
        validator: function (name: string) {
          return /^[A-Z0-9_]+$/.test(name);
        },
        message: 'Config name can only contain uppercase letters, numbers and underscores'
      }
    },
    configValue: {
      type: String,
      trim: true,
      maxlength: [5000, 'Config value cannot exceed 5000 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    softDelete: true,
    auditFields: false,
    schemaOptions: {
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
    },
  }
);

// 5. Virtual for parsed config value
systemConfigSchema.virtual('parsedValue').get(function (this: ISystemConfigModel) {
  if (!this.configValue || this.configValue.trim() === '') {
    return null;
  }

  try {
    // Try to parse as JSON first
    return JSON.parse(this.configValue);
  } catch {
    // If not JSON, check for boolean
    const lowerValue = this.configValue.toLowerCase();
    if (lowerValue === 'true') return true;
    if (lowerValue === 'false') return false;

    // Check for number
    if (!isNaN(Number(this.configValue)) && this.configValue.trim() !== '') {
      return Number(this.configValue);
    }

    // Return as string
    return this.configValue;
  }
});

// 6. Virtual for value type
systemConfigSchema.virtual('valueType').get(function (this: ISystemConfigModel) {
  const value = this.parsedValue;

  if (value === null) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'object') return 'object';
  return 'string';
});

// 7. Indexes for efficient queries
systemConfigSchema.index({ configName: 1 });
systemConfigSchema.index({ isActive: 1 });
systemConfigSchema.index({ configName: 1, isActive: 1 });

// 8. Pre-save middleware for validation and processing
systemConfigSchema.pre('save', function (next) {
  const config = this as ISystemConfigModel;

  // Update the updatedAt field
  config.updatedAt = new Date();

  // Validate config name format
  if (!/^[A-Z0-9_]+$/.test(config.configName)) {
    return next(new Error('Config name can only contain uppercase letters, numbers and underscores'));
  }

  next();
});

// 9. Pre-validate middleware for specific config names
systemConfigSchema.pre('validate', function (next) {
  const config = this as ISystemConfigModel;

  // Validate specific config values based on name
  switch (config.configName) {
    case SystemConfigName.APP_VERSION:
      if (config.configValue && !/^\d+\.\d+\.\d+$/.test(config.configValue)) {
        return next(new Error('APP_VERSION must be in semantic version format (x.y.z)'));
      }
      break;

    case SystemConfigName.TAX_RATE:
    case SystemConfigName.INTEREST_RATE:
      const numValue = parseFloat(config.configValue);
      if (config.configValue && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
        return next(new Error(`${config.configName} must be a number between 0 and 100`));
      }
      break;

    case SystemConfigName.MAX_FILE_UPLOAD_SIZE:
      const sizeValue = parseFloat(config.configValue);
      if (config.configValue && (isNaN(sizeValue) || sizeValue <= 0)) {
        return next(new Error('MAX_FILE_UPLOAD_SIZE must be a positive number'));
      }
      break;
  }

  next();
});

// 10. Static methods
systemConfigSchema.statics.getConfig = async function <T = ConfigValue>(
  configName: string,
  defaultValue?: T
): Promise<T> {
  const config: any = await (this as any).findOne({
    configName,
    isActive: true
  });

  if (!config) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Configuration '${configName}' not found`);
  }

  return config.parsedValue as T;
};

systemConfigSchema.statics.setConfig = async function (
  configName: string,
  configValue: ConfigValue
): Promise<ISystemConfigModel> {
  const stringValue = typeof configValue === 'object'
    ? JSON.stringify(configValue)
    : String(configValue);

  return this.findOneAndUpdate(
    { configName },
    {
      configValue: stringValue,
      isActive: true,
      updatedAt: new Date()
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );
};

systemConfigSchema.statics.getMultipleConfigs = async function (
  configNames: string[]
): Promise<Record<string, ConfigValue>> {
  const configs = await this.find({
    configName: { $in: configNames },
    isActive: true
  });

  const result: Record<string, ConfigValue> = {};

  configs.forEach((config: any) => {
    result[config.configName] = config.parsedValue;
  });

  // Fill missing configs with null
  configNames.forEach(name => {
    if (!(name in result)) {
      result[name] = null;
    }
  });

  return result;
};

systemConfigSchema.statics.getAllActiveConfigs = function () {
  return this.find({ isActive: true }).sort({ configName: 1 });
};

systemConfigSchema.statics.deactivateConfig = function (configName: string) {
  return this.findOneAndUpdate(
    { configName },
    {
      isActive: false,
      updatedAt: new Date()
    },
    { new: true }
  );
};

systemConfigSchema.statics.initializeDefaultConfigs = async function () {
  const defaultConfigs: Array<{ configName: string; configValue: string }> = [
    { configName: SystemConfigName.APP_VERSION, configValue: '1.0.0' },
    { configName: SystemConfigName.MAINTENANCE_MODE, configValue: 'false' },
    { configName: SystemConfigName.CURRENCY, configValue: 'VND' },
    { configName: SystemConfigName.DATE_FORMAT, configValue: 'DD/MM/YYYY' },
    { configName: SystemConfigName.TIMEZONE, configValue: 'Asia/Ho_Chi_Minh' },
    { configName: SystemConfigName.DEFAULT_LANGUAGE, configValue: 'vi' },
    { configName: SystemConfigName.TAX_RATE, configValue: '10' },
    { configName: SystemConfigName.INTEREST_RATE, configValue: '6.5' },
    { configName: SystemConfigName.BUDGET_ALERT_THRESHOLD, configValue: '80' },
    { configName: SystemConfigName.MAX_FILE_UPLOAD_SIZE, configValue: '10485760' }, // 10MB
    { configName: SystemConfigName.SESSION_TIMEOUT, configValue: '3600' }, // 1 hour
    { configName: SystemConfigName.AUTO_BACKUP_ENABLED, configValue: 'true' }
  ];

  for (const config of defaultConfigs) {
    await this.findOneAndUpdate(
      { configName: config.configName },
      {
        configValue: config.configValue,
        isActive: true
      },
      { upsert: true }
    );
  }

  return this.countDocuments({ isActive: true });
};

// 11. Instance methods
systemConfigSchema.methods.getValue = function <T = ConfigValue>(): T {
  return this.parsedValue as T;
};

systemConfigSchema.methods.setValue = function (value: ConfigValue) {
  this.configValue = typeof value === 'object'
    ? JSON.stringify(value)
    : String(value);
  return this.save();
};

systemConfigSchema.methods.isBoolean = function (): boolean {
  return this.valueType === 'boolean';
};

systemConfigSchema.methods.isNumber = function (): boolean {
  return this.valueType === 'number';
};

systemConfigSchema.methods.isObject = function (): boolean {
  return this.valueType === 'object';
};

systemConfigSchema.methods.isString = function (): boolean {
  return this.valueType === 'string';
};

systemConfigSchema.methods.getDescription = function (): string {
  const descriptions: Record<string, string> = {
    [SystemConfigName.APP_VERSION]: 'Current application version',
    [SystemConfigName.MAINTENANCE_MODE]: 'Whether the system is in maintenance mode',
    [SystemConfigName.CURRENCY]: 'Default currency for the application',
    [SystemConfigName.DATE_FORMAT]: 'Default date format display',
    [SystemConfigName.TIMEZONE]: 'System timezone',
    [SystemConfigName.BACKUP_SCHEDULE]: 'Automatic backup schedule',
    [SystemConfigName.EMAIL_NOTIFICATIONS]: 'Enable email notifications',
    [SystemConfigName.MAX_FILE_UPLOAD_SIZE]: 'Maximum file upload size in bytes',
    [SystemConfigName.SESSION_TIMEOUT]: 'User session timeout in seconds',
    [SystemConfigName.DEFAULT_LANGUAGE]: 'Default application language',
    [SystemConfigName.TAX_RATE]: 'Default tax rate percentage',
    [SystemConfigName.INTEREST_RATE]: 'Default interest rate percentage',
    [SystemConfigName.EXCHANGE_RATES]: 'Currency exchange rates',
    [SystemConfigName.BUDGET_ALERT_THRESHOLD]: 'Budget alert threshold percentage',
    [SystemConfigName.AUTO_BACKUP_ENABLED]: 'Enable automatic backups'
  };

  return descriptions[this.configName] || 'System configuration';
};

// 12. Define static methods interface
export interface ISystemConfigModelStatic extends Model<ISystemConfigModel> {
  getConfig<T = ConfigValue>(configName: string, defaultValue?: T): Promise<T>;
  setConfig(configName: string, configValue: ConfigValue): Promise<ISystemConfigModel>;
  getMultipleConfigs(configNames: string[]): Promise<Record<string, ConfigValue>>;
  getAllActiveConfigs(): Promise<ISystemConfigModel[]>;
  deactivateConfig(configName: string): Promise<ISystemConfigModel | null>;
  initializeDefaultConfigs(): Promise<number>;
}

// =============================================================================
// 13. Export the model
export const SystemConfig: ISystemConfigModelStatic =
  mongoose.models.SystemConfig as ISystemConfigModelStatic ||
  mongoose.model<ISystemConfigModel, ISystemConfigModelStatic>('SystemConfig', systemConfigSchema);

export default SystemConfig;
