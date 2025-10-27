---
applyTo: '**/*.ts'
---

# FinTrack TypeScript Development Instructions

## Overview

This document provides comprehensive guidelines and best practices for developing TypeScript components within the FinTrack codebase. FinTrack is undergoing an active migration from JavaScript to TypeScript, with models and config already completed. These instructions ensure consistency and maintainability throughout the migration process.

## Project Context

**FinTrack** is a bilingual (Vietnamese/English) personal finance management platform implementing the "6 Jars Method" for budgeting. It serves both as a RESTful API and a server-side rendered web application using Express.js + EJS.

### Migration Status

- ✅ **Completed**: Models, Config, Enums, Constants, Middleware abstracts
- 🔄 **In Progress**: Domains, Repositories, Plugins
- ⏳ **Pending**: Controllers, Routes, Utils

## TypeScript Development Guidelines

### 1. Project Structure

```
src/
├── abstracts/            # Base classes and interfaces (TS)
│   ├── absBase.model.ts        # IAbsBaseModel interface + createBaseSchema
│   ├── absBase.domain.ts       # Abstract domain logic (pending)
│   └── absBase.repository.ts   # Abstract repository (pending)
├── config/               # Configuration files (TS) ✅
│   ├── config.ts              # Main config with environment validation
│   ├── enums.ts               # All enum definitions
│   ├── database.js            # MongoDB connection (pending migration)
│   └── swagger.js             # API documentation (pending migration)
├── constants/            # Application constants (TS) ✅
│   └── route_prefix.constant.ts
├── controllers/          # Business logic (JS → TS)
│   ├── *.controller.js        # Current JavaScript controllers
│   └── *.controller.ts        # Target TypeScript controllers
├── domains/              # Business logic layer (TS) - new pattern
│   └── *.domain.ts            # Domain services with business rules
├── middleware/           # Request/response middleware (Mixed)
│   ├── index.ts               # Main middleware router ✅
│   ├── authHandler.js         # Auth middleware (pending)
│   ├── errorHandler.js        # Error handler (pending)
│   └── validator.js           # Input validation (pending)
├── models/               # Database models (TS) ✅
│   └── *.model.ts             # Mongoose schemas with TypeScript
├── plugins/              # Mongoose plugins (TS) - pending
│   └── *.plugin.ts            # Reusable schema plugins
├── repositories/         # Data access layer (TS) - new pattern
│   └── *.repository.ts        # Database operations abstraction
├── routes/               # Route handlers (Mixed)
│   ├── apis/                  # API routes (JS → TS)
│   ├── admin/                 # Admin routes (JS → TS)
│   └── view.route.js          # Web UI routes (pending)
└── utils/                # Utility functions (Mixed)
    └── *.util.ts              # Helper functions and utilities
```

### 2. File Naming Conventions

Follow these strict naming patterns:

- **Models**: `*.model.ts` (e.g., `user.model.ts`, `expense.model.ts`)
- **Domains**: `*.domain.ts` (e.g., `user.domain.ts`, `expense.domain.ts`)
- **Repositories**: `*.repository.ts` (e.g., `user.repository.ts`)
- **Controllers**: `*.controller.ts` (e.g., `auth.controller.ts`)
- **Routes**: `*.route.ts` (e.g., `auth.route.ts`)
- **Middleware**: `*.middleware.ts` (e.g., `auth.middleware.ts`)
- **Utils**: `*.util.ts` (e.g., `dateFormatter.util.ts`)
- **Plugins**: `*.plugin.ts` (e.g., `softDelete.plugin.ts`)
- **Constants**: `*.constant.ts` (e.g., `route_prefix.constant.ts`)
- **Config**: No suffix, just `.ts` (e.g., `config.ts`, `enums.ts`)

### 3. TypeScript Model Pattern

All models MUST extend `IAbsBaseModel` and use `createBaseSchema()`.

#### Base Interface (`IAbsBaseModel`)

```typescript
import IAbsBaseModel from '@/abstracts/absBase.model';
import { Document, Types } from 'mongoose';

export interface IYourModel extends Document {
  // Your fields
  name: string;
  amount: number;
  userId: Types.ObjectId;
  
  // Base fields (inherited from IAbsBaseModel)
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted?: boolean;
}
```

#### Using createBaseSchema()

```typescript
import { createBaseSchema } from '@/abstracts/absBase.model';

const yourSchema = createBaseSchema<IYourModel>(
  {
    // Your field definitions
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
      set: (v: number) => Math.round(v * 100) / 100 // Round to 2 decimals
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    }
  },
  {
    // Options
    softDelete: true,        // Adds isDeleted field + plugin (default: true)
    auditFields: true,       // Adds createdBy/updatedBy + plugin (default: false)
    schemaOptions: {         // Additional Mongoose schema options
      collection: 'your_collection_name'
    },
    customToObject: (obj) => {
      // Custom transformation for API responses
      delete obj.sensitiveField;
      return obj;
    }
  }
);

// Add custom methods, statics, virtuals
yourSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Export model
const YourModel: IYourModelStatic = 
  mongoose.models.YourModel as IYourModelStatic ||
  mongoose.model<IYourModel, IYourModelStatic>('YourModel', yourSchema);

export default YourModel;
```

### 4. Import Patterns

**ALWAYS** use path aliases defined in `tsconfig.json`:

```typescript
// ✅ CORRECT - Use path aliases
import { default as User } from '@/models/user.model';
import config from '@/config/config';
import { ExpenseSource } from '@/config/enums';
import { API_ROUTE_PREFIX } from '@/constants/route_prefix.constant';

// ❌ INCORRECT - Avoid relative paths
import User from '../../../models/user.model';
import config from '../../config/config';
```

**Note**: For JavaScript files that haven't been migrated yet, you may need to destructure default exports:

```typescript
// When importing from JS files
const { default: SomeController } = require('@/controllers/some.controller');
```

### 5. Enum Usage

Use enums from `@/config/enums.ts` for type safety:

```typescript
import { 
  ExpenseSource, 
  CategoryType, 
  BudgetPeriod,
  DepositStatus,
  AccountType 
} from '@/config/enums';

// In schema definition
source: {
  type: String,
  enum: {
    values: Object.values(ExpenseSource),
    message: 'Source must be Manual, MISA, Excel, or API'
  },
  default: ExpenseSource.MANUAL,
  trim: true
}

// In code
if (expense.source === ExpenseSource.MISA) {
  // Handle MISA-specific logic
}
```

### 6. Type Definitions

#### Model Type Definitions

```typescript
// Document interface
export interface IYourModel extends Document {
  field1: string;
  field2: number;
  
  // Virtuals
  computedField: string;
}

// Static methods interface
export interface IYourModelStatic extends Model<IYourModel> {
  findByUserId(userId: Types.ObjectId): Promise<IYourModel[]>;
  customStaticMethod(): Promise<any>;
}

// Instance methods (define in interface)
yourSchema.methods.customInstanceMethod = function() {
  return this.field1.toUpperCase();
};
```

#### Controller Type Definitions

```typescript
import { Request, Response, NextFunction } from 'express';

// Extend Request to include authenticated user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  userId?: string;
}

export const getExpenses = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Implementation
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // ALWAYS use next(error), never throw
  }
};
```

### 7. Error Handling Pattern

**CRITICAL**: Always use the centralized error handler with `next(error)`:

```typescript
// ✅ CORRECT
export const someController = async (req, res, next) => {
  try {
    // Business logic
    const result = await SomeModel.find(query);
    
    res.status(200).json({
      success: true,
      message: 'Success message',
      data: result
    });
  } catch (error) {
    next(error); // Let errorHandler.js process this
  }
};

// ❌ INCORRECT - Never throw directly
export const badController = async (req, res) => {
  const result = await SomeModel.find(query); // Could throw!
  throw new Error('This bypasses error handler'); // Wrong!
};
```

### 8. MongoDB ObjectId Handling

```typescript
import { Types } from 'mongoose';

// Converting strings to ObjectId
const userId = new Types.ObjectId(userIdString);

// In aggregation pipelines
$match: {
  userId: new Types.ObjectId(req.user.id.toString())
}

// Type checking
if (Types.ObjectId.isValid(someId)) {
  // Valid ObjectId
}
```

### 9. Async/Await Best Practices

```typescript
// ✅ CORRECT - Always await database operations
const user = await User.findById(userId);
const expenses = await Expense.find({ userId }).sort({ createdAt: -1 });

// ✅ CORRECT - Parallel operations when independent
const [user, expenses, savings] = await Promise.all([
  User.findById(userId),
  Expense.find({ userId }),
  Saving.find({ userId })
]);

// ❌ INCORRECT - Missing await
const user = User.findById(userId); // Returns Promise, not document!
```

### 10. Domain Layer Pattern (New Architecture)

When creating new domain services:

```typescript
// src/domains/expense.domain.ts
import { default as Expense, IExpenseModel } from '@/models/expense.model';
import { Types } from 'mongoose';

export class ExpenseDomain {
  /**
   * Calculate 6 Jars allocation based on salary
   */
  static calculateSixJarsAllocation(salary: number) {
    return {
      motherGift: 0, // Custom amount
      nec: Math.round(salary * 0.55 * 100) / 100,
      ffa: Math.round(salary * 0.10 * 100) / 100,
      educ: Math.round(salary * 0.10 * 100) / 100,
      play: Math.round(salary * 0.10 * 100) / 100,
      give: Math.round(salary * 0.07 * 100) / 100,
      lts: Math.round(salary * 0.08 * 100) / 100
    };
  }

  /**
   * Get monthly expense summary
   */
  static async getMonthlySummary(userId: Types.ObjectId, month: Date) {
    const expenses = await Expense.findByMonth(userId, month);
    // Business logic here
    return summary;
  }
}

export default ExpenseDomain;
```

### 11. Repository Pattern (New Architecture)

When creating new repositories:

```typescript
// src/repositories/expense.repository.ts
import { default as Expense, IExpenseModel } from '@/models/expense.model';
import { Types } from 'mongoose';

export class ExpenseRepository {
  /**
   * Find expenses by user and date range
   */
  static async findByDateRange(
    userId: Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<IExpenseModel[]> {
    return Expense.find({
      userId,
      month: { $gte: startDate, $lte: endDate }
    }).sort({ month: -1, createdAt: -1 });
  }

  /**
   * Create expense with validation
   */
  static async create(data: Partial<IExpenseModel>): Promise<IExpenseModel> {
    const expense = new Expense(data);
    await expense.validate();
    return expense.save();
  }
}

export default ExpenseRepository;
```

### 12. Testing TypeScript Code

```typescript
// tests/expense.test.ts (when migrating tests)
import request from 'supertest';
import app from '@/index';
import { default as Expense } from '@/models/expense.model';

describe('Expense API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Setup
  });

  afterEach(async () => {
    // Clean database AFTER each test
    await Expense.deleteMany({});
  });

  it('should create expense with 6 jars allocation', async () => {
    const response = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        month: new Date('2024-01-01'),
        category: 'Salary',
        itemName: 'Monthly Salary',
        previousMonthSalary: 10000000
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.allocation).toBeDefined();
  });
});
```

### 13. Build and Development

```bash
# Development with hot reload
npm run dev          # ts-node with tsconfig-paths

# Build TypeScript to JavaScript
npm run build        # tsc + tsc-alias + file copying

# Run compiled code
npm start            # node dist/src/index.js

# Database initialization (requires build first)
npm run init:db      # Initialize with default data

# Testing
npm test             # Jest with coverage
npm run test:watch   # Jest in watch mode

# Linting (currently JS only)
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
```

### 14. Common TypeScript Patterns in FinTrack

#### 6 Jars Allocation Interface

```typescript
export interface IAllocation {
  motherGift: number;  // Gửi Mẹ - for family
  nec: number;         // 55% - Necessities
  ffa: number;         // 10% - Financial Freedom Account
  educ: number;        // 10% - Education
  play: number;        // 10% - Entertainment
  give: number;        // 7% - Charity
  lts: number;         // 8% - Long-Term Savings
}
```

#### Financial Calculation Utilities

```typescript
// Round to 2 decimal places
const roundMoney = (amount: number): number => 
  Math.round(amount * 100) / 100;

// Format VND currency
const formatVND = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
```

#### Date Handling

```typescript
// Get first day of month
const getFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Format month (YYYY-MM)
const formatMonth = (date: Date): string => {
  return date.toISOString().substring(0, 7);
};
```

## Common Pitfalls to Avoid

1. ❌ **Not using path aliases**: Use `@/` not relative paths `../../`
2. ❌ **Throwing in controllers**: Use `next(error)` always
3. ❌ **Missing await**: All database operations need `await`
4. ❌ **Not extending IAbsBaseModel**: All models must use base interface
5. ❌ **Inconsistent naming**: Follow `.model.ts`, `.domain.ts` patterns
6. ❌ **Wrong enum values**: Import from `@/config/enums.ts`
7. ❌ **Missing validation**: Use Mongoose validators and custom validation
8. ❌ **Ignoring soft delete**: Use built-in soft delete, don't implement manually
9. ❌ **Direct Model calls in controllers**: Should go through Domain/Repository (target architecture)
10. ❌ **Forgetting type exports**: Export interfaces and types for reuse

## Migration Checklist

When migrating a component from JS to TS:

- [ ] Rename file with appropriate suffix (`.model.ts`, `.controller.ts`, etc.)
- [ ] Add proper TypeScript interfaces and types
- [ ] Update imports to use `@/` path aliases
- [ ] Replace `require()` with `import` statements
- [ ] Add type annotations to function parameters and return types
- [ ] Use enums from `@/config/enums.ts` instead of string literals
- [ ] Ensure error handling uses `next(error)` pattern
- [ ] Update tests if they exist
- [ ] Verify `npm run build` succeeds
- [ ] Run existing tests with `npm test`
- [ ] Update documentation if needed

## Resources

- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **Mongoose TypeScript**: https://mongoosejs.com/docs/typescript.html
- **Express TypeScript**: https://expressjs.com/en/advanced/typescript.html
- **Path Aliases**: See `tsconfig.json` for configured aliases

## Questions?

For architecture decisions or patterns not covered here, refer to:
- `.github/copilot-instructions.md` - Overall project guidelines
- `.github/prompts/fintrack.prompt.md` - Complete architecture overview
- `.github/chatmodes/fintrack.chatmode.md` - AI assistant configuration
