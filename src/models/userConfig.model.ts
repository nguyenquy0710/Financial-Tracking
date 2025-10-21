import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ConfigStatus } from '@/config/enums';

// 2. Define interfaces for nested objects
export interface IMisaConfig extends Document {
  username?: string;
  password?: string;
  isConfigured: boolean;
  isDefault: boolean;
  isActive: boolean;
  lastValidated?: Date;
  validationStatus?: ConfigStatus;
  errorMessage?: string;
}

export interface IExcelConfig {
  filePath?: string;
  templateType?: string;
  isConfigured: boolean;
  isActive: boolean;
  lastImported?: Date;
  importSettings?: {
    autoImport: boolean;
    skipFirstRow: boolean;
    dateFormat: string;
  };
}

export interface IApiConfig {
  endpoint?: string;
  apiKey?: string;
  secret?: string;
  isConfigured: boolean;
  isActive: boolean;
  lastSynced?: Date;
  syncFrequency?: string;
}

// 3. Define the UserConfig document interface
export interface IUserConfigModel extends Document {
  userId: Types.ObjectId;
  misa: IMisaConfig[];
  excel?: IExcelConfig;
  api?: IApiConfig;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  activeMisaConfig: IMisaConfig | null;
  hasConfiguredMisa: boolean;
  hasAnyActiveConfig: boolean;

  // Instance methods
  compareMisaPassword(candidatePassword: string, misaIndex?: number): Promise<boolean>;
  getSafeConfig(): any;
  addMisaConfig(config: Omit<IMisaConfig, 'isConfigured' | 'isDefault' | 'isActive'>): Promise<IMisaConfig>;
  setActiveMisaConfig(index: number): Promise<void>;
  validateMisaConfig(index: number, isValid: boolean, errorMessage?: string): Promise<void>;
}

// 4. Define the schema
const userConfigSchema = new Schema<IUserConfigModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    misa: [{
      username: {
        type: String,
        trim: true,
        maxlength: [100, 'MISA username cannot exceed 100 characters']
      },
      password: {
        type: String,
        trim: true,
        select: false, // Don't include password in queries by default
        validate: {
          validator: function (password: string) {
            if (!password) return true;
            return password.length >= 4;
          },
          message: 'MISA password must be at least 4 characters long'
        }
      },
      isConfigured: {
        type: Boolean,
        default: false
      },
      isDefault: {
        type: Boolean,
        default: false
      },
      isActive: {
        type: Boolean,
        default: true
      },
      lastValidated: {
        type: Date
      },
      validationStatus: {
        type: String,
        enum: {
          values: Object.values(ConfigStatus),
          message: 'Validation status must be active, inactive, or pending'
        },
        default: ConfigStatus.PENDING
      },
      errorMessage: {
        type: String,
        maxlength: [500, 'Error message cannot exceed 500 characters']
      }
    }],
    excel: {
      filePath: {
        type: String,
        trim: true
      },
      templateType: {
        type: String,
        trim: true,
        maxlength: [50, 'Template type cannot exceed 50 characters']
      },
      isConfigured: {
        type: Boolean,
        default: false
      },
      isActive: {
        type: Boolean,
        default: false
      },
      lastImported: {
        type: Date
      },
      importSettings: {
        autoImport: {
          type: Boolean,
          default: false
        },
        skipFirstRow: {
          type: Boolean,
          default: true
        },
        dateFormat: {
          type: String,
          default: 'DD/MM/YYYY'
        }
      }
    },
    api: {
      endpoint: {
        type: String,
        trim: true,
        validate: {
          validator: function (url: string) {
            if (!url) return true;
            return /^https?:\/\/.+\..+/.test(url);
          },
          message: 'API endpoint must be a valid URL'
        }
      },
      apiKey: {
        type: String,
        trim: true,
        select: false // Don't include API key in queries by default
      },
      secret: {
        type: String,
        trim: true,
        select: false // Don't include secret in queries by default
      },
      isConfigured: {
        type: Boolean,
        default: false
      },
      isActive: {
        type: Boolean,
        default: false
      },
      lastSynced: {
        type: Date
      },
      syncFrequency: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
        default: 'daily'
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

        // Ensure sensitive fields are never sent in JSON response
        if (ret.misa) {
          ret.misa.forEach((misaConfig: any) => {
            delete misaConfig.password;
          });
        }
        if (ret.api) {
          delete ret.api.apiKey;
          delete ret.api.secret;
        }

        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        // Ensure sensitive fields are never sent in object
        if (ret.misa) {
          ret.misa.forEach((misaConfig: any) => {
            delete misaConfig.password;
          });
        }
        if (ret.api) {
          delete ret.api.apiKey;
          delete ret.api.secret;
        }
        return ret;
      }
    }
  }
);

// 5. Virtual for active MISA configuration
userConfigSchema.virtual('activeMisaConfig').get(function (this: IUserConfigModel) {
  const activeConfig = this.misa.find(config => config.isActive && config.isConfigured);
  return activeConfig || null;
});

// 6. Virtual for checking if any MISA is configured
userConfigSchema.virtual('hasConfiguredMisa').get(function (this: IUserConfigModel) {
  return this.misa.some(config => config.isConfigured);
});

// 7. Virtual for checking if any configuration is active
userConfigSchema.virtual('hasAnyActiveConfig').get(function (this: IUserConfigModel) {
  return this.hasConfiguredMisa ||
    (this.excel?.isActive && this.excel?.isConfigured) ||
    (this.api?.isActive && this.api?.isConfigured);
});

// 8. Indexes for efficient queries
userConfigSchema.index({ userId: 1 });
userConfigSchema.index({ 'misa.isActive': 1 });
userConfigSchema.index({ 'misa.isConfigured': 1 });
userConfigSchema.index({ 'misa.lastValidated': 1 });

// 9. Pre-save middleware for validation and processing
userConfigSchema.pre('save', async function (next) {
  const userConfig = this as IUserConfigModel;

  // Ensure only one MISA configuration is active at a time
  if (userConfig.isModified('misa')) {
    const activeConfigs = userConfig.misa.filter(config => config.isActive);
    if (activeConfigs.length > 1) {
      // Deactivate all except the first one
      for (let i = 1; i < activeConfigs.length; i++) {
        activeConfigs[i].isActive = false;
      }
    }

    // Ensure only one MISA configuration is default
    const defaultConfigs = userConfig.misa.filter(config => config.isDefault);
    if (defaultConfigs.length > 1) {
      for (let i = 1; i < defaultConfigs.length; i++) {
        defaultConfigs[i].isDefault = false;
      }
    }

    // Hash MISA passwords if modified
    for (const misaConfig of userConfig.misa) {
      if (misaConfig.isModified && misaConfig.isModified('password') && misaConfig.password) {
        try {
          const salt = await bcrypt.genSalt(10);
          misaConfig.password = await bcrypt.hash(misaConfig.password, salt);
        } catch (error) {
          return next(error as Error);
        }
      }
    }
  }

  // Hash API secret if modified
  if (userConfig.api && userConfig.isModified('api.secret') && userConfig.api.secret) {
    try {
      const salt = await bcrypt.genSalt(10);
      userConfig.api.secret = await bcrypt.hash(userConfig.api.secret, salt);
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

// 10. Static methods
userConfigSchema.statics.findByUserId = function (userId: Types.ObjectId | string) {
  return this.findOne({ userId })
    .select('+misa.password +api.apiKey +api.secret'); // Include sensitive fields when explicitly requested
};

userConfigSchema.statics.findActiveMisaConfigs = function () {
  return this.find({
    'misa.isActive': true,
    'misa.isConfigured': true
  });
};

userConfigSchema.statics.findByMisaUsername = function (username: string) {
  return this.find({
    'misa.username': username,
    'misa.isActive': true
  });
};

userConfigSchema.statics.getConfigStats = function () {
  return this.aggregate([
    {
      $project: {
        hasMisa: { $gt: [{ $size: '$misa' }, 0] },
        hasExcel: { $and: ['$excel.isConfigured', '$excel.isActive'] },
        hasApi: { $and: ['$api.isConfigured', '$api.isActive'] },
        activeMisaCount: {
          $size: {
            $filter: {
              input: '$misa',
              as: 'config',
              cond: { $and: ['$$config.isActive', '$$config.isConfigured'] }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        totalConfigs: { $sum: 1 },
        usersWithMisa: { $sum: { $cond: ['$hasMisa', 1, 0] } },
        usersWithExcel: { $sum: { $cond: ['$hasExcel', 1, 0] } },
        usersWithApi: { $sum: { $cond: ['$hasApi', 1, 0] } },
        totalActiveMisa: { $sum: '$activeMisaCount' }
      }
    }
  ]);
};

// 11. Instance methods
userConfigSchema.methods.compareMisaPassword = async function (
  candidatePassword: string,
  misaIndex: number = 0
): Promise<boolean> {
  const misaConfig = this.misa[misaIndex];
  if (!misaConfig || !misaConfig.password) {
    return false;
  }

  return bcrypt.compare(candidatePassword, misaConfig.password);
};

userConfigSchema.methods.getSafeConfig = function () {
  const safeConfig = this.toObject();

  // Remove sensitive data
  if (safeConfig.misa) {
    safeConfig.misa.forEach((misaConfig: any) => {
      delete misaConfig.password;
    });
  }

  if (safeConfig.api) {
    delete safeConfig.api.apiKey;
    delete safeConfig.api.secret;
  }

  return safeConfig;
};

userConfigSchema.methods.addMisaConfig = async function (
  config: Omit<IMisaConfig, 'isConfigured' | 'isDefault' | 'isActive'>
): Promise<IMisaConfig> {
  const newConfig: IMisaConfig = {
    ...config,
    isConfigured: !!config.username && !!config.password,
    isDefault: this.misa.length === 0, // First config becomes default
    isActive: true
  };

  // Deactivate other MISA configs if this one is being set as active
  if (newConfig.isActive) {
    this.misa.forEach((existingConfig: IMisaConfig) => {
      existingConfig.isActive = false;
    });
  }

  this.misa.push(newConfig);
  await this.save();

  return newConfig;
};

userConfigSchema.methods.setActiveMisaConfig = async function (index: number): Promise<void> {
  if (index < 0 || index >= this.misa.length) {
    throw new Error('Invalid MISA configuration index');
  }

  // Deactivate all other MISA configs
  this.misa.forEach((config: IMisaConfig, i: number) => {
    config.isActive = i === index;
  });

  await this.save();
};

userConfigSchema.methods.validateMisaConfig = async function (
  index: number,
  isValid: boolean,
  errorMessage?: string
): Promise<void> {
  if (index < 0 || index >= this.misa.length) {
    throw new Error('Invalid MISA configuration index');
  }

  const misaConfig = this.misa[index];
  misaConfig.lastValidated = new Date();
  misaConfig.validationStatus = isValid ? ConfigStatus.ACTIVE : ConfigStatus.INACTIVE;
  misaConfig.errorMessage = errorMessage;
  misaConfig.isConfigured = isValid;

  await this.save();
};

userConfigSchema.methods.updateExcelConfig = async function (
  updates: Partial<IExcelConfig>
): Promise<IExcelConfig> {
  if (!this.excel) {
    this.excel = {
      isConfigured: false,
      isActive: false,
      importSettings: {
        autoImport: false,
        skipFirstRow: true,
        dateFormat: 'DD/MM/YYYY'
      }
    };
  }

  Object.assign(this.excel, updates);

  // Auto-set isConfigured if required fields are present
  if (updates.filePath && updates.templateType) {
    this.excel.isConfigured = true;
  }

  await this.save();
  return this.excel;
};

userConfigSchema.methods.updateApiConfig = async function (
  updates: Partial<IApiConfig>
): Promise<IApiConfig> {
  if (!this.api) {
    this.api = {
      isConfigured: false,
      isActive: false,
      syncFrequency: 'daily'
    };
  }

  Object.assign(this.api, updates);

  // Auto-set isConfigured if required fields are present
  if (updates.endpoint && updates.apiKey) {
    this.api.isConfigured = true;
  }

  await this.save();
  return this.api;
};

userConfigSchema.methods.getConfigSummary = function (): {
  totalMisaConfigs: number;
  activeMisaConfigs: number;
  hasExcel: boolean;
  hasApi: boolean;
  overallStatus: 'configured' | 'partial' | 'none';
} {
  const totalMisaConfigs = this.misa.length;
  const activeMisaConfigs = this.misa.filter((config: any) => config.isActive && config.isConfigured).length;
  const hasExcel = !!(this.excel?.isConfigured && this.excel?.isActive);
  const hasApi = !!(this.api?.isConfigured && this.api?.isActive);

  let overallStatus: 'configured' | 'partial' | 'none' = 'none';
  if (activeMisaConfigs > 0 || hasExcel || hasApi) {
    overallStatus = 'partial';
    if (activeMisaConfigs > 0 && (hasExcel || hasApi)) {
      overallStatus = 'configured';
    }
  }

  return {
    totalMisaConfigs,
    activeMisaConfigs,
    hasExcel,
    hasApi,
    overallStatus
  };
};

// 12. Define static methods interface
export interface IUserConfigModelStatic extends Model<IUserConfigModel> {
  findByUserId(userId: Types.ObjectId | string): Promise<IUserConfigModel | null>;
  findActiveMisaConfigs(): Promise<IUserConfigModel[]>;
  findByMisaUsername(username: string): Promise<IUserConfigModel[]>;
  getConfigStats(): Promise<any[]>;
}

// 13. Export the model
const UserConfig: IUserConfigModelStatic =
  mongoose.models.UserConfig as IUserConfigModelStatic ||
  mongoose.model<IUserConfigModel, IUserConfigModelStatic>('UserConfig', userConfigSchema);

export default UserConfig;
