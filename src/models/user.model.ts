import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Currency, Language } from '@/config/enums';

// 2. Define the User document interface
export interface IUserModel extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  currency: Currency;
  language: Language;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  displayName: string;
  initials: string;
  isProfileComplete: boolean;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toJSON(): any;
}

// 3. Define the schema
const userSchema = new Schema<IUserModel>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
      validate: {
        validator: function (username: string) {
          return /^[a-zA-Z0-9_]+$/.test(username);
        },
        message: 'Username can only contain letters, numbers and underscores'
      }
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
      validate: {
        validator: function (email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid email address'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Don't include password in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      validate: {
        validator: function (name: string) {
          return name.trim().length > 0;
        },
        message: 'Name cannot be empty'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (phone: string) {
          if (!phone) return true;
          return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
        },
        message: 'Please provide a valid phone number'
      }
    },
    currency: {
      type: String,
      default: Currency.VND,
      enum: {
        values: Object.values(Currency),
        message: 'Currency must be VND, USD, or EUR'
      }
    },
    language: {
      type: String,
      default: Language.VIETNAMESE,
      enum: {
        values: Object.values(Language),
        message: 'Language must be vi or en'
      }
    },
    avatar: {
      type: String,
      validate: {
        validator: function (url: string) {
          if (!url) return true;
          return /^https?:\/\/.+\..+/.test(url) || url.startsWith('/uploads/');
        },
        message: 'Avatar must be a valid URL or file path'
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
        delete ret.password; // Ensure password is never sent in JSON response
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret: any) {
        delete ret.password; // Ensure password is never sent in object
        return ret;
      }
    }
  }
);

// 4. Virtual for display name (could be username or name)
userSchema.virtual('displayName').get(function (this: IUserModel) {
  return this.name || this.username;
});

// 5. Virtual for user initials (for avatars)
userSchema.virtual('initials').get(function (this: IUserModel) {
  const names = this.name.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
});

// 6. Virtual for checking if profile is complete
userSchema.virtual('isProfileComplete').get(function (this: IUserModel) {
  return !!(this.name && this.email && this.phone);
});

// 7. Indexes for efficient queries
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ username: 'text', name: 'text', email: 'text' });

// 8. Pre-save middleware for validation and processing
userSchema.pre('save', async function (next) {
  const user = this as IUserModel;

  // Update the updatedAt field
  user.updatedAt = new Date();

  // Auto-generate username from email if not provided
  if (!user.username && user.email) {
    user.username = user.email.split('@')[0].toLowerCase();
  }

  // Ensure username is unique (handle duplicates by adding random numbers)
  if (user.isModified('username')) {
    const existingUser = await mongoose.models.User.findOne({
      username: user.username,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      const randomSuffix = Math.floor(Math.random() * 1000);
      user.username = `${user.username}${randomSuffix}`;
    }
  }

  // Hash password if modified
  if (user.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

// 9. Pre-validate middleware for additional validation
userSchema.pre('validate', function (next) {
  const user = this as IUserModel;

  // Prevent changing username after creation
  if (user.isModified('username') && !user.isNew) {
    return next(new Error('Username cannot be changed after registration'));
  }

  // Prevent changing email after creation
  if (user.isModified('email') && !user.isNew) {
    return next(new Error('Email cannot be changed after registration'));
  }

  next();
});

// 10. Static methods
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

userSchema.statics.findByUsername = function (username: string) {
  return this.findOne({ username }).select('+password');
};

userSchema.statics.isEmailTaken = async function (email: string, excludeUserId?: Types.ObjectId | string) {
  const query: any = { email: email.toLowerCase() };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const user = await this.findOne(query);
  return !!user;
};

userSchema.statics.isUsernameTaken = async function (username: string, excludeUserId?: Types.ObjectId | string) {
  const query: any = { username };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const user = await this.findOne(query);
  return !!user;
};

userSchema.statics.getUserStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        usersWithPhone: {
          $sum: { $cond: [{ $ifNull: ['$phone', false] }, 1, 0] }
        },
        usersWithAvatar: {
          $sum: { $cond: [{ $ifNull: ['$avatar', false] }, 1, 0] }
        },
        byCurrency: {
          $push: {
            currency: '$currency',
            count: 1
          }
        },
        byLanguage: {
          $push: {
            language: '$language',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        totalUsers: 1,
        usersWithPhone: 1,
        usersWithAvatar: 1,
        currencyDistribution: {
          $arrayToObject: {
            $map: {
              input: '$byCurrency',
              as: 'item',
              in: {
                k: '$$item.currency',
                v: '$$item.count'
              }
            }
          }
        },
        languageDistribution: {
          $arrayToObject: {
            $map: {
              input: '$byLanguage',
              as: 'item',
              in: {
                k: '$$item.language',
                v: '$$item.count'
              }
            }
          }
        }
      }
    }
  ]);
};

// 11. Instance methods
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateProfile = async function (updateData: Partial<IUserModel>) {
  const allowedFields = ['name', 'phone', 'currency', 'language', 'avatar'];
  const updates: Partial<IUserModel> = {};

  allowedFields.forEach(field => {
    if (updateData[field as keyof IUserModel] !== undefined) {
      updates[field as keyof IUserModel] = updateData[field as keyof IUserModel];
    }
  });

  Object.assign(this, updates);
  return this.save();
};

userSchema.methods.changePassword = async function (currentPassword: string, newPassword: string) {
  const isMatch = await this.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  this.password = newPassword;
  return this.save();
};

userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    name: this.name,
    phone: this.phone,
    currency: this.currency,
    language: this.language,
    avatar: this.avatar,
    displayName: this.displayName,
    initials: this.initials,
    isProfileComplete: this.isProfileComplete,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

userSchema.methods.toJSON = function () {
  return this.getPublicProfile();
};

// 12. Define static methods interface
export interface IUserModelStatic extends Model<IUserModel> {
  findByEmail(email: string): Promise<IUserModel | null>;
  findByUsername(username: string): Promise<IUserModel | null>;
  isEmailTaken(email: string, excludeUserId?: Types.ObjectId | string): Promise<boolean>;
  isUsernameTaken(username: string, excludeUserId?: Types.ObjectId | string): Promise<boolean>;
  getUserStats(): Promise<any[]>;
}

// 13. Export the model
const User: IUserModelStatic =
  mongoose.models.User as IUserModelStatic ||
  mongoose.model<IUserModel, IUserModelStatic>('User', userSchema);

export default User;
