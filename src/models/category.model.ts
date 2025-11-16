import { CategoryType } from '@/config/enums';
import mongoose, { Document, Schema, Model, Types } from 'mongoose';

// 2. Define interface for keyword
export interface IKeyword {
  _id?: Types.ObjectId;
  keyword: string;
}

// 3. Define the Category document interface
export interface ICategoryModel extends Document {
  name: string;
  nameVi?: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  userId?: Types.ObjectId | null;
  description?: string;
  keywords: string[];
  createdAt?: Date;
  updatedAt?: Date;

  // Virtual fields
  isSystemCategory: boolean;
  isUserCategory: boolean;
}

// 4. Define the schema
const categorySchema = new Schema<ICategoryModel>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    nameVi: {
      type: String,
      trim: true,
      maxlength: [50, 'Vietnamese name cannot exceed 50 characters']
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: {
        values: Object.values(CategoryType),
        message: 'Category type must be either income or expense'
      },
      default: CategoryType.EXPENSE
    },
    icon: {
      type: String,
      default: '💰',
      maxlength: [10, 'Icon cannot exceed 10 characters']
    },
    color: {
      type: String,
      default: '#3498db',
      validate: {
        validator: function (color: string) {
          // Basic hex color validation
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
        },
        message: 'Color must be a valid hex color code'
      }
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      validate: {
        validator: function (this: ICategoryModel, userId: Types.ObjectId | null) {
          // System categories (isDefault: true) must have userId = null
          if (this.isDefault && userId !== null) {
            return false;
          }
          // User categories can have userId or be null for custom user categories that aren't system defaults
          return true;
        },
        message: 'System default categories must not have a user ID'
      }
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [30, 'Keyword cannot exceed 30 characters']
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

// 5. Virtual for checking if category is system category
categorySchema.virtual('isSystemCategory').get(function (this: ICategoryModel) {
  return this.isDefault && !this.userId;
});

// 6. Virtual for checking if category is user category
categorySchema.virtual('isUserCategory').get(function (this: ICategoryModel) {
  return !this.isDefault && !!this.userId;
});

// 7. Indexes for faster queries
categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ keywords: 1 });
categorySchema.index({ userId: 1, isDefault: 1 });
categorySchema.index({ name: 'text', nameVi: 'text', keywords: 'text' });
categorySchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { userId: { $ne: null } } });

// 8. Pre-save middleware for validation and auto-processing
categorySchema.pre('save', function (next) {
  const category = this as ICategoryModel;

  // Ensure system categories have no user ID
  if (category.isDefault) {
    category.userId = undefined;
  }

  // Remove duplicate keywords and trim
  if (category.keywords && category.keywords.length > 0) {
    const uniqueKeywords = [...new Set(category.keywords.map(k => k.trim().toLowerCase()))];
    category.keywords = uniqueKeywords;
  }

  next();
});

// 9. Static methods
categorySchema.statics.findSystemCategories = function (type?: CategoryType) {
  const query: any = { isDefault: true, userId: null };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ name: 1 });
};

categorySchema.statics.findUserCategories = function (userId: Types.ObjectId | string, type?: CategoryType) {
  const query: any = {
    $or: [
      { userId: null, isDefault: false }, // User's custom categories
      { userId: userId } // User's personal categories
    ]
  };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ isDefault: -1, name: 1 });
};

categorySchema.statics.findByKeyword = function (keyword: string, userId?: Types.ObjectId | string) {
  const query: any = {
    keywords: { $regex: new RegExp(keyword, 'i') }
  };

  if (userId) {
    query.$or = [
      { userId: userId },
      { userId: null }
    ];
  }

  return this.find(query);
};

categorySchema.statics.createUserCategory = function (categoryData: Partial<ICategoryModel>, userId: Types.ObjectId | string) {
  return this.create({
    ...categoryData,
    userId: userId,
    isDefault: false
  });
};

categorySchema.statics.autoCategorize = function (transactionName: string, userId?: Types.ObjectId | string) {
  const query: any = {
    keywords: { $in: [transactionName.toLowerCase()] }
  };

  if (userId) {
    query.$or = [
      { userId: userId },
      { userId: null }
    ];
  }

  return this.findOne(query);
};

// 10. Instance methods
categorySchema.methods.addKeyword = function (keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!this.keywords.includes(normalizedKeyword)) {
    this.keywords.push(normalizedKeyword);
  }
  return this.save();
};

categorySchema.methods.removeKeyword = function (keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  this.keywords = this.keywords.filter((k: string) => k !== normalizedKeyword);
  return this.save();
};

categorySchema.methods.updateKeywords = function (newKeywords: string[]) {
  const normalizedKeywords = [...new Set(newKeywords.map(k => k.trim().toLowerCase()))];
  this.keywords = normalizedKeywords;
  return this.save();
};

categorySchema.methods.cloneForUser = function (userId: Types.ObjectId | string) {
  const categoryData = this.toObject();
  delete categoryData._id;
  delete categoryData.isDefault;
  categoryData.userId = userId;
  categoryData.name = `${categoryData.name} (Copy)`;

  return this.model('Category').create(categoryData);
};

// 11. Define static methods interface
export interface ICategoryModelStatic extends Model<ICategoryModel> {
  findSystemCategories(type?: CategoryType): Promise<ICategoryModel[]>;
  findUserCategories(userId: Types.ObjectId | string, type?: CategoryType): Promise<ICategoryModel[]>;
  findByKeyword(keyword: string, userId?: Types.ObjectId | string): Promise<ICategoryModel[]>;
  createUserCategory(categoryData: Partial<ICategoryModel>, userId: Types.ObjectId | string): Promise<ICategoryModel>;
  autoCategorize(transactionName: string, userId?: Types.ObjectId | string): Promise<ICategoryModel | null>;
}

// 12. Export the model
const Category: ICategoryModelStatic =
  mongoose.models.Category as ICategoryModelStatic ||
  mongoose.model<ICategoryModel, ICategoryModelStatic>('Category', categorySchema);

export default Category;
