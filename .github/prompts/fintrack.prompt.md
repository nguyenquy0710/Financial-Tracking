---
mode: fintrack
---

# FinTrack Application - Development & Integration Overview

## Executive Summary

**FinTrack** (Financial Tracking) is a bilingual (Vietnamese/English) personal finance management platform implementing the "6 Jars Method" for budgeting. It serves as both a RESTful API and a server-side rendered web application, designed to be a "Smart Financial Companion" helping users achieve financial freedom through intelligent tracking, analysis, and planning.

**Tech Stack**: Node.js (≥18), Express.js, TypeScript (migrating from JavaScript), MongoDB, Mongoose, EJS, JWT Authentication

**Key Features**: Income/expense tracking, 6 Jars budgeting (Vietnamese adaptation), MISA Money Keeper integration, Excel import/export, rental management, salary tracking, 2FA security

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Features & Domain Logic](#core-features--domain-logic)
4. [TypeScript Migration](#typescript-migration)
5. [Authentication & Security](#authentication--security)
6. [API & Route Architecture](#api--route-architecture)
7. [Database Models](#database-models)
8. [Build & Development Workflow](#build--development-workflow)
9. [Testing Strategy](#testing-strategy)
10. [Integration Points](#integration-points)
11. [Common Patterns & Conventions](#common-patterns--conventions)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
├──────────────────────┬──────────────────────────────────────┤
│   Web UI (EJS)       │         API Clients                  │
│   Server-side        │   (Mobile, External Services)        │
│   Rendered HTML      │   JSON REST API                      │
└──────────────────────┴──────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Express.js Server                       │
├─────────────────────────────────────────────────────────────┤
│  Middleware: Auth, Validation, Error Handling, Logging      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────┬──────────────────────────────────────┐
│  Route Layer         │                                       │
├──────────────────────┤  Web Routes (/) → EJS Views          │
│  Priority Order:     │  Admin Routes (/admin) → Admin UI    │
│  1. Web Routes       │  API Routes (/api) → JSON Response   │
│  2. Admin Routes     │                                       │
│  3. API Routes       │  ⚠️ Order is CRITICAL!               │
└──────────────────────┴──────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Controller Layer (JS)                    │
│  Business Logic, Request/Response Handling                  │
│  Error Pattern: try-catch with next(error)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────┬──────────────────────────────────────┐
│  Domain Layer (TS)   │    Repository Layer (TS)             │
│  Business Rules      │    Data Access Abstraction           │
│  6 Jars Logic        │    MongoDB Queries                   │
│  Calculations        │    CRUD Operations                   │
│  (Pending Migration) │    (Pending Migration)               │
└──────────────────────┴──────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Model Layer (TypeScript)                  │
│  Mongoose Schemas with IAbsBaseModel Base                   │
│  Validation, Virtuals, Static Methods, Indexes              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  Collections: users, expenses, salaries, rentals, etc.     │
└─────────────────────────────────────────────────────────────┘
```

### Hybrid JavaScript/TypeScript Architecture

**Current State** (Active Migration):

- ✅ **TypeScript**: Models, Config, Enums, Constants, Middleware abstracts
- 🔄 **In Progress**: Domains, Repositories, Plugins
- ⏳ **Pending**: Controllers, Routes (APIs, Web, Admin), Utils

**Migration Philosophy**:

- Surgical, incremental migration
- Models first (completed) → Controllers → Routes → Utils
- Maintain backward compatibility
- Don't break working features

---

## Project Structure

```
Financial-Tracking/
├── .github/                      # GitHub configuration
│   ├── chatmodes/               # AI chat mode configurations
│   ├── instructions/            # Code instruction files
│   ├── prompts/                 # This file and others
│   ├── workflows/               # CI/CD pipelines
│   └── copilot-instructions.md  # Global AI guidelines
│
├── src/                         # Source code
│   ├── abstracts/               # Base classes & interfaces (TS)
│   │   ├── absBase.model.ts          # IAbsBaseModel + createBaseSchema
│   │   ├── absBase.domain.ts         # Domain base (pending)
│   │   └── absBase.repository.ts     # Repository base (pending)
│   │
│   ├── config/                  # Configuration (TS)
│   │   ├── config.ts                 # Main config (env vars)
│   │   ├── enums.ts                  # All enums (ExpenseSource, etc.)
│   │   ├── database.js               # MongoDB connection (JS)
│   │   └── swagger.js                # API documentation (JS)
│   │
│   ├── constants/               # Application constants (TS)
│   │   └── route_prefix.constant.ts  # Route path constants
│   │
│   ├── controllers/             # Business logic (JS → TS)
│   │   ├── auth.controller.js        # Authentication
│   │   ├── expense.controller.js     # Expense management
│   │   ├── salary.controller.js      # Salary tracking
│   │   ├── rental.controller.js      # Rental management
│   │   ├── misa.controller.js        # MISA integration
│   │   ├── excel.controller.js       # Excel import/export
│   │   └── ... (other controllers)
│   │
│   ├── domains/                 # Business logic layer (TS - new)
│   │   └── *.domain.ts               # Domain services (pending)
│   │
│   ├── middleware/              # Request middleware (Mixed)
│   │   ├── index.ts                  # Middleware router (TS)
│   │   ├── authHandler.js            # JWT auth handlers (JS)
│   │   ├── errorHandler.js           # Centralized error handling (JS)
│   │   ├── validator.js              # Input validation (JS)
│   │   └── logger.middleware.ts      # Request logging (TS)
│   │
│   ├── models/                  # Database models (TS ✅)
│   │   ├── user.model.ts
│   │   ├── expense.model.ts          # 6 Jars expense tracking
│   │   ├── salary.model.ts           # Salary management
│   │   ├── rental.model.ts           # Rental management
│   │   ├── saving.model.ts
│   │   ├── deposit.model.ts
│   │   ├── goal.model.ts
│   │   ├── transaction.model.ts
│   │   ├── category.model.ts
│   │   ├── budget.model.ts
│   │   ├── recurringBill.model.ts
│   │   ├── bankAccount.model.ts
│   │   ├── totp.model.ts             # 2FA TOTP
│   │   ├── systemConfig.model.ts
│   │   └── userConfig.model.ts
│   │
│   ├── plugins/                 # Mongoose plugins (TS - pending)
│   │   ├── softDelete.plugin.ts      # Soft delete functionality
│   │   └── auditFields.plugin.ts     # Created/updated tracking
│   │
│   ├── repositories/            # Data access layer (TS - new)
│   │   └── *.repository.ts           # DB operations (pending)
│   │
│   ├── routes/                  # Route handlers (Mixed)
│   │   ├── apis/                     # API routes (JS)
│   │   │   ├── api.route.js              # Main API router
│   │   │   ├── auth.route.js             # Auth endpoints
│   │   │   ├── expense.route.js
│   │   │   ├── salary.route.js
│   │   │   ├── rental.route.js
│   │   │   ├── misa.route.js             # MISA integration
│   │   │   ├── excel.route.js            # Excel endpoints
│   │   │   └── ... (other API routes)
│   │   ├── admin/                    # Admin routes (JS)
│   │   │   └── view.route.js             # Admin panel routes
│   │   ├── view.route.js             # Web UI routes (JS)
│   │   ├── rental.route.ts           # Rental routes (TS - migrated)
│   │   └── totp.route.ts             # TOTP routes (TS - migrated)
│   │
│   ├── scripts/                 # Utility scripts
│   │   └── initDB.js                 # Database initialization
│   │
│   ├── utils/                   # Utility functions (Mixed)
│   │   ├── logger.js                 # Winston logger (JS)
│   │   ├── excelParser.js            # Excel processing (JS)
│   │   └── ... (other utilities)
│   │
│   └── index.js                 # Application entry point (JS)
│
├── public/                      # Static assets
│   ├── css/                          # Stylesheets
│   ├── js/                           # Client-side JavaScript
│   └── images/                       # Images, icons
│
├── views/                       # EJS templates
│   ├── partials/                     # Reusable components
│   ├── admin/                        # Admin panel views
│   ├── auth/                         # Login, register
│   ├── dashboard/                    # Main dashboard
│   └── ... (other views)
│
├── tests/                       # Test files
│   ├── auth.test.js
│   ├── expense.test.js
│   ├── salary.test.js
│   └── ... (other tests)
│
├── dist/                        # Compiled output (build)
├── logs/                        # Application logs
├── coverage/                    # Test coverage reports
├── node_modules/                # Dependencies
│
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Environment template
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Test configuration
├── .eslintrc.json               # Linting rules
├── .prettierrc.json             # Code formatting
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Docker Compose
├── gulpfile.js                  # Build tasks
└── README.md                    # Project documentation
```

---

## Core Features & Domain Logic

### 1. The 6 Jars Budgeting Method (Vietnamese Adaptation)

**Core Concept**: Divide income into 6 "jars" (categories) for balanced financial management.

#### Vietnamese Implementation

```typescript
interface IAllocation {
  motherGift: number; // Gửi Mẹ - Tiền gửi gia đình (Custom amount)
  nec: number; // 55% - Necessities (Chi phí thiết yếu)
  ffa: number; // 10% - Financial Freedom Account (Tự do tài chính)
  educ: number; // 10% - Education (Giáo dục)
  play: number; // 10% - Play/Entertainment (Giải trí)
  give: number; // 7% - Charity/Giving (Từ thiện)
  lts: number; // 8% - Long-Term Savings (Tiết kiệm dài hạn)
}
```

**Cultural Adaptation**: "Gửi Mẹ" (Mother Gift) is a Vietnamese tradition where working adults contribute to their parents/family. This is treated as a priority allocation before the standard 6 jars percentages.

**Calculation Flow**:

1. Receive monthly salary: 10,000,000 VND
2. Deduct "Gửi Mẹ": 1,000,000 VND → Remaining: 9,000,000 VND
3. Apply 6 Jars:
   - NEC (55%): 4,950,000 VND
   - FFA (10%): 900,000 VND
   - EDUC (10%): 900,000 VND
   - PLAY (10%): 900,000 VND
   - GIVE (7%): 630,000 VND
   - LTS (8%): 720,000 VND

**Implementation** (in `expense.model.ts`):

```typescript
static calculateSixJarsAllocation(salary: number) {
  return {
    motherGift: 0, // Set by user
    nec: Math.round(salary * 0.55 * 100) / 100,
    ffa: Math.round(salary * 0.10 * 100) / 100,
    educ: Math.round(salary * 0.10 * 100) / 100,
    play: Math.round(salary * 0.10 * 100) / 100,
    give: Math.round(salary * 0.07 * 100) / 100,
    lts: Math.round(salary * 0.08 * 100) / 100
  };
}
```

### 2. Financial Tracking Features

#### Income Management

- **Salary Tracking**: Company salary (basic, KPI, projects, OT, bonus)
- **Freelance Income**: Side projects, gigs
- **Other Income**: Investments, gifts, etc.
- **Model**: `salary.model.ts`

#### Expense Management

- **Manual Entry**: Add expenses with category and amount
- **6 Jars Allocation**: Automatic or manual allocation to jars
- **Monthly Aggregation**: View spending by month
- **Category Analysis**: Track by category (food, transport, etc.)
- **Model**: `expense.model.ts`

#### Savings & Investments

- **Savings Goals**: Set and track savings targets
- **Deposits**: Fixed deposits, savings accounts
- **Investments**: Track investment performance (FFA jar)
- **Models**: `saving.model.ts`, `deposit.model.ts`, `goal.model.ts`

#### Budget Management

- **Monthly Budgets**: Set limits per category
- **Budget vs Actual**: Compare planned vs actual spending
- **Alerts**: Notifications when approaching limits
- **Model**: `budget.model.ts`

#### Recurring Bills

- **Auto-tracking**: Rent, utilities, subscriptions
- **Reminder System**: Payment due dates
- **Model**: `recurringBill.model.ts`

### 3. Rental Management (NEW Feature)

Track monthly rental expenses including:

- Base rent
- Electricity charges
- Water charges
- Internet/WiFi
- Parking fees
- Other utilities

**Model**: `rental.model.ts`
**Excel Support**: Import/Export rental data

### 4. Transaction History

Centralized transaction log for all financial activities:

- Income transactions
- Expense transactions
- Transfer between accounts
- Investment transactions

**Model**: `transaction.model.ts`

---

## TypeScript Migration

### Migration Status Dashboard

| Layer        | Status  | Files | Notes                                |
| ------------ | ------- | ----- | ------------------------------------ |
| Models       | ✅ 100% | 15/15 | All models use IAbsBaseModel         |
| Config       | ✅ 100% | 3/3   | config.ts, enums.ts complete         |
| Constants    | ✅ 100% | 1/1   | route_prefix.constant.ts             |
| Middleware   | 🔄 50%  | 2/5   | index.ts, logger.middleware.ts done  |
| Controllers  | ⏳ 0%   | 0/17  | Pending migration                    |
| Routes       | 🔄 10%  | 2/20  | rental.route.ts, totp.route.ts done  |
| Utils        | ⏳ 0%   | 0/10  | Pending migration                    |
| Domains      | 🆕 N/A  | -     | New architecture layer               |
| Repositories | 🆕 N/A  | -     | New architecture layer               |
| Plugins      | 🔄 50%  | 1/2   | softDelete done, auditFields pending |

### Migration Principles

1. **Models First**: ✅ Completed - Foundation for type safety
2. **Config & Constants**: ✅ Completed - Central configuration
3. **Middleware**: 🔄 In Progress - Request/response handling
4. **Controllers**: Next - Business logic layer
5. **Routes**: After Controllers - API endpoints
6. **Utils**: Final - Helper functions

### Base Abstractions

#### IAbsBaseModel (Foundation)

All models extend this interface:

```typescript
export default interface IAbsBaseModel extends Document {
  createdAt?: Date; // Automatic timestamp
  updatedAt?: Date; // Automatic timestamp
  createdBy?: Types.ObjectId; // Audit field (optional)
  updatedBy?: Types.ObjectId; // Audit field (optional)
  isDeleted?: boolean; // Soft delete flag
}
```

#### createBaseSchema() Helper

Consistent schema creation:

```typescript
export function createBaseSchema<T extends Document = IAbsBaseModel>(
  definition: Record<string, any>,
  options: BaseSchemaOptions = {}
): Schema<T>;
```

**Features**:

- Automatic `timestamps: true`
- Optional soft delete (`isDeleted` + plugin)
- Optional audit fields (`createdBy`/`updatedBy` + plugin)
- Custom `toObjectCustom()` method for API responses
- Removes `_id`, `__v`, `isDeleted` from API output

### Path Aliases

**Configured in `tsconfig.json`**:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Usage**:

```typescript
// ✅ CORRECT
import { default as User } from '@/models/user.model';
import config from '@/config/config';

// ❌ INCORRECT
import User from '../../models/user.model';
```

---

## Authentication & Security

### Authentication Flow

```
Client Request
      ↓
[Authorization: Bearer <JWT_TOKEN>]
      ↓
authHandler Middleware
      ↓
Verify JWT Token
      ↓
Extract userId from decoded token
      ↓
Attach req.user and req.userId
      ↓
Controller Access
```

### Dual Auth Handlers

#### 1. apiAuthHandler (for API routes)

**Location**: `src/middleware/authHandler.js`

**Behavior**:

- Expects `Authorization: Bearer <token>` header
- Returns JSON error responses
- Status codes: 401 (Unauthorized), 403 (Forbidden)

**Usage**:

```javascript
router.get('/api/expenses', apiAuthHandler, getExpenses);
```

#### 2. webAuthHandler (for Web UI routes)

**Location**: `src/middleware/authHandler.js`

**Behavior**:

- Expects JWT in cookie or header
- Redirects to `/login` on auth failure
- Sets flash messages for user feedback

**Usage**:

```javascript
router.get('/app/dashboard', webAuthHandler, renderDashboard);
```

### JWT Token Structure

```typescript
{
  userId: string,          // MongoDB ObjectId as string
  email: string,
  role: string,           // 'user', 'admin'
  iat: number,            // Issued at timestamp
  exp: number             // Expiration timestamp
}
```

### Two-Factor Authentication (TOTP)

**Model**: `totp.model.ts`

**Features**:

- Time-based One-Time Password (RFC 6238)
- QR code generation for authenticator apps
- Encrypted secret storage
- Backup codes generation
- Account recovery flow

**Library**: `otplib` + `qrcode`

### Security Features

#### 1. Cloudflare Turnstile (CAPTCHA)

**Implementation**: Auth flows (register, login)
**Behavior**: Disabled in test environment
**Verification**: Server-side token verification

#### 2. Password Security

**Library**: `bcryptjs`
**Rounds**: 10 (configurable in `config.ts`)
**Pattern**: Never store plain-text passwords

#### 3. Helmet.js (Currently Commented)

**Purpose**: Security headers (CSP, XSS protection)
**Status**: Commented out in `src/index.js` (conflicts with inline scripts)
**TODO**: Implement with proper CSP nonce support

#### 4. Rate Limiting

**Status**: Planned feature
**Scope**: Login attempts, API calls

---

## API & Route Architecture

### Route Registration Order (CRITICAL!)

**In `src/index.js`**:

```javascript
// ⚠️ ORDER MATTERS - Web routes MUST come first!

// 1. Web UI Routes
app.use(ROUTE_PREFIX.BASE, viewRoutes); // /

// 2. Admin Routes
app.use(ADMIN_ROUTE_PREFIX.BASE, viewAdminRoutes); // /admin

// 3. API Routes
app.use(API_ROUTE_PREFIX.BASE, apiRoutes); // /api
```

**Why?** Web routes may have catch-all patterns that conflict with API routes if registered later.

### Route Constants

**File**: `src/constants/route_prefix.constant.ts`

```typescript
export const ROUTE_PREFIX = {
  BASE: '/',
  AUTH: '/auth',
  DASHBOARD: '/app/dashboard'
  // ...
};

export const API_ROUTE_PREFIX = {
  BASE: '/api',
  AUTH: '/api/auth',
  EXPENSES: '/api/expenses'
  // ...
};

export const ADMIN_ROUTE_PREFIX = {
  BASE: '/admin',
  DASHBOARD: '/admin/dashboard'
  // ...
};
```

### API Response Pattern

**Success Response**:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10  // Optional for lists
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Controller Error Pattern

**ALWAYS use this pattern**:

```javascript
exports.someController = async (req, res, next) => {
  try {
    // Business logic
    const result = await Model.find(query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error); // Let errorHandler.js process this
  }
};
```

**Never throw directly** - always use `next(error)`!

---

## Database Models

### Model List & Purposes

| Model                    | Purpose            | Key Features                  |
| ------------------------ | ------------------ | ----------------------------- |
| `user.model.ts`          | User accounts      | Auth, profile, preferences    |
| `expense.model.ts`       | Expense tracking   | 6 Jars allocation, categories |
| `salary.model.ts`        | Income tracking    | Company + freelance income    |
| `rental.model.ts`        | Rental expenses    | Utilities, monthly tracking   |
| `saving.model.ts`        | Savings goals      | Target amounts, progress      |
| `deposit.model.ts`       | Fixed deposits     | Interest, maturity tracking   |
| `goal.model.ts`          | Financial goals    | Target dates, milestones      |
| `transaction.model.ts`   | Transaction log    | All financial activities      |
| `category.model.ts`      | Expense categories | Income/expense types          |
| `budget.model.ts`        | Budget planning    | Monthly limits, tracking      |
| `recurringBill.model.ts` | Recurring bills    | Auto-tracking, reminders      |
| `bankAccount.model.ts`   | Bank accounts      | Account details, balance      |
| `totp.model.ts`          | 2FA TOTP           | Secret storage, verification  |
| `systemConfig.model.ts`  | System settings    | App configuration             |
| `userConfig.model.ts`    | User preferences   | Language, currency, etc.      |

### Common Model Patterns

#### Soft Delete

**Automatically added** by `createBaseSchema()` when `softDelete: true`:

```typescript
// In model
expense.isDeleted = true;
await expense.save();

// Query non-deleted only
Expense.find({ userId, isDeleted: false });
```

#### Audit Fields

**Automatically added** by `createBaseSchema()` when `auditFields: true`:

```typescript
expense.createdBy = req.user._id;
expense.updatedBy = req.user._id;
```

#### Virtual Fields

```typescript
// Define virtual
expenseSchema.virtual('monthFormatted').get(function () {
  return this.month.toISOString().substring(0, 7); // YYYY-MM
});

// Use in code
const formatted = expense.monthFormatted; // "2024-10"
```

#### Static Methods

```typescript
// Define static
expenseSchema.statics.findByMonth = function (userId, month) {
  return this.find({ userId, month }).sort({ createdAt: -1 });
};

// Use in code
const expenses = await Expense.findByMonth(userId, new Date('2024-10-01'));
```

#### Instance Methods

```typescript
// Define instance method
expenseSchema.methods.applySixJarSystem = function () {
  this.allocation = calculateAllocation(this.previousMonthSalary);
  return this.save();
};

// Use in code
await expense.applySixJarSystem();
```

#### Indexes

```typescript
// Compound index for efficient queries
expenseSchema.index({ userId: 1, month: -1 });
expenseSchema.index({ userId: 1, category: 1 });
```

### MongoDB Connection

**File**: `src/config/database.js`

```javascript
const connectDB = async () => {
  const uri =
    process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};
```

**Separate test database** to avoid contaminating production data.

---

## Build & Development Workflow

### NPM Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
                        # Uses: ts-node + tsconfig-paths

# Building
npm run clean           # Remove dist/ and .tsbuildinfo
npm run build           # Full build:
                        #   1. TypeScript compilation (tsc)
                        #   2. Path alias resolution (tsc-alias)
                        #   3. Build icons (gulp)
                        #   4. Copy public/ and views/
                        #   5. Copy package files

# Running
npm start               # Run compiled code from dist/
                        # node dist/src/index.js

# Database
npm run init:db         # Initialize database with default data
                        # ⚠️ Requires npm run build first!

# Testing
npm test                # Run Jest tests with coverage
npm run test:watch      # Jest in watch mode

# Linting
npm run lint            # ESLint check (JS files only)
npm run lint:fix        # ESLint auto-fix

# Formatting
npm run format          # Prettier format
```

### Build Process Details

1. **Clean**: Remove old build artifacts
2. **TypeScript Compilation**: `tsc --build`
   - Compiles `.ts` → `.js`
   - Generates `.d.ts` declaration files
   - Output to `dist/`
3. **Path Alias Resolution**: `tsc-alias`
   - Converts `@/` imports to relative paths
4. **Icon Building**: `gulp build:icons`
   - Generate icon sprites
5. **File Copying**: `copyfiles`
   - Copy `public/` → `dist/public/`
   - Copy `views/` → `dist/views/`
   - Copy `package.json`, `.env.example`

### Development Server

**Command**: `npm run dev`

**Behavior**:

- Uses `ts-node` for TypeScript execution without compilation
- Uses `tsconfig-paths/register` for `@/` alias support
- Watches `src/` for changes (`.js`, `.ts`, `.json`)
- Restarts automatically on file changes (via `nodemon`)
- Ignores `src/scripts/` directory

**Hot Reload**: Changes reflected immediately without manual restart.

### Environment Variables

**File**: `.env` (gitignored, copy from `.env.example`)

**Key Variables**:

```env
# Server
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/fintrack
MONGODB_URI_TEST=mongodb://localhost:27017/fintrack_test

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=your-turnstile-secret

# MISA Integration
MISA_BASE_URL=https://api.misa.com.vn
MISA_AUTH_URL=https://auth.misa.com.vn

# Logging
LOG_LEVEL=info
```

---

## Testing Strategy

### Test Framework

**Libraries**:

- Jest: Test runner, assertions, mocking
- Supertest: HTTP assertion library
- MongoDB Memory Server: In-memory database (optional)

**Configuration**: `jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Test Structure

**Location**: `tests/`

**Files**:

- `auth.test.js` - Authentication flows
- `expense.test.js` - Expense management
- `salary.test.js` - Salary tracking
- `transaction.test.js` - Transaction operations
- `misa.test.js` - MISA integration
- `systemConfig.test.js` - System configuration

### Test Patterns

#### Setup & Teardown

```javascript
describe('Expense API', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });

    // Get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    authToken = res.body.token;
  });

  afterEach(async () => {
    // ⚠️ Clean AFTER each test, not before!
    await Expense.deleteMany({});
  });

  afterAll(async () => {
    // Cleanup test user
    await User.deleteMany({});
    await mongoose.connection.close();
  });
});
```

#### Test Case Example

```javascript
it('should create expense with 6 jars allocation', async () => {
  const response = await request(app)
    .post('/api/expenses')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      month: new Date('2024-10-01'),
      category: 'Salary',
      itemName: 'Monthly Salary',
      previousMonthSalary: 10000000,
      source: 'Manual'
    });

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toHaveProperty('allocation');
  expect(response.body.data.allocation.nec).toBe(5500000); // 55%
});
```

#### Mocking External Services

```javascript
jest.mock('axios');

it('should fetch data from MISA', async () => {
  axios.get.mockResolvedValue({
    data: { transactions: [] }
  });

  const response = await request(app)
    .get('/api/misa/transactions')
    .set('Authorization', `Bearer ${authToken}`);

  expect(response.status).toBe(200);
  expect(axios.get).toHaveBeenCalled();
});
```

### Test Environment

**Separate Database**: `MONGODB_URI_TEST`

**Cloudflare Turnstile**: Verification skipped when `NODE_ENV=test`

**Test Command**:

```bash
NODE_ENV=test npm test
```

---

## Integration Points

### 1. MISA Money Keeper Integration

**Purpose**: Sync transactions from MISA Money Keeper app

**Files**:

- Controller: `src/controllers/misa.controller.js`
- Routes: `src/routes/apis/misa.route.js`
- Tests: `tests/misa.test.js`

**API Endpoints**:

- `POST /api/misa/auth` - Authenticate with MISA
- `GET /api/misa/transactions` - Fetch transactions
- `POST /api/misa/import` - Import transactions to FinTrack

**Authentication Flow**:

1. User provides MISA credentials
2. FinTrack exchanges for MISA access token
3. Token stored encrypted in user config
4. Used for subsequent API calls

**Data Mapping**:

```javascript
{
  misaTransaction: {
    id: "MISA_TX_123",
    amount: 50000,
    category: "Food",
    date: "2024-10-15"
  },
  fintrackExpense: {
    userId: user._id,
    month: new Date("2024-10-01"),
    category: "Food",
    itemName: "Lunch",
    totalAmount: 50000,
    source: "MISA"
  }
}
```

### 2. Excel Import/Export

**Purpose**: Bulk data import/export via Excel files

**Library**: `xlsx`

**Files**:

- Controller: `src/controllers/excel.controller.js`
- Routes: `src/routes/apis/excel.route.js`
- Parser: `src/utils/excelParser.js`

**Supported Sheets**:

- Rental expenses
- Salary data
- Expense transactions
- Budget planning

**Import Flow**:

1. User uploads Excel file (.xlsx, .xls)
2. Server parses sheets using `xlsx`
3. Validates data against model schemas
4. Bulk inserts to MongoDB
5. Returns import summary (success/fail counts)

**Export Flow**:

1. User requests export (date range, filters)
2. Server queries data from MongoDB
3. Formats data for Excel (headers, formatting)
4. Generates Excel file using `xlsx`
5. Returns file download

**Example Parser**:

```javascript
function parseRentalSheet(worksheet) {
  const data = [];
  const range = XLSX.utils.decode_range(worksheet['!ref']);

  for (let row = 1; row <= range.e.r; row++) {
    data.push({
      month: getCellValue(worksheet, row, 0),
      baseRent: getCellValue(worksheet, row, 1),
      electricity: getCellValue(worksheet, row, 2),
      water: getCellValue(worksheet, row, 3)
      // ...
    });
  }

  return data;
}
```

### 3. VietQR Integration

**Purpose**: Generate QR codes for Vietnamese bank transfers

**Library**: `vietqr`

**Use Cases**:

- Receive payments
- Rental payment reminders
- Peer-to-peer transfers

**Example**:

```javascript
const vietQR = require('vietqr');

const qrCode = vietQR.generate({
  bank: 'VCB',
  accountNumber: '1234567890',
  accountName: 'NGUYEN VAN A',
  amount: 1000000,
  message: 'Tien thue nha thang 10'
});
```

---

## Common Patterns & Conventions

### 1. Error Handling

**Centralized Error Handler**: `src/middleware/errorHandler.js`

```javascript
// Controller
try {
  // Logic
} catch (error) {
  next(error); // ⚠️ Always use next(error)!
}

// Error Handler Middleware
module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
```

### 2. Validation

**Library**: `express-validator`

**Pattern**:

```javascript
// Route
router.post(
  '/expenses',
  [
    body('month').isISO8601().withMessage('Invalid date'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
    body('category').notEmpty().withMessage('Category is required')
  ],
  validate, // Middleware to check validation results
  createExpense
);

// Validator Middleware (src/middleware/validator.js)
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

### 3. Pagination

**Pattern**:

```javascript
exports.getExpenses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Expense.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### 4. Logging

**Library**: `winston` with daily rotate files

**Configuration**: `src/utils/logger.js`

**Usage**:

```javascript
const { logger } = require('@/utils/logger');

logger.info('User logged in', { userId: user.id });
logger.error('Database error', { error: err.message });
logger.warn('High expense detected', { amount: expense.totalAmount });
```

**Log Files**:

- `logs/access.log` - HTTP access logs (Morgan)
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs
- Rotates daily, keeps 14 days

### 5. API Documentation

**Library**: `swagger-jsdoc` + `swagger-ui-express`

**Configuration**: `src/config/swagger.js`

**Access**: `http://localhost:3000/api-docs`

**JSDoc Example**:

```javascript
/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Success
 */
```

---

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. "Cannot find module '@/models/...'"

**Cause**: Path aliases not resolving

**Solution**:

```bash
# Development
npm run dev  # Uses tsconfig-paths/register

# Production
npm run build  # tsc-alias resolves aliases
npm start
```

#### 2. "Route not found" - API endpoint returns 404

**Check**:

1. Route registration order in `src/index.js`
   - Web routes before API routes?
2. Route prefix in constants
3. Middleware chain includes router

#### 3. "Unauthorized" - Auth always fails

**Check**:

1. Using correct auth handler?
   - `apiAuthHandler` for API
   - `webAuthHandler` for Web UI
2. JWT token in request?
   - Header: `Authorization: Bearer <token>`
3. JWT_SECRET in `.env`?

#### 4. "Build fails" - TypeScript compilation errors

**Check**:

1. Path aliases configured in `tsconfig.json`?
2. Missing type definitions?
   ```bash
   npm install --save-dev @types/express @types/node
   ```
3. Import statements using `@/` prefix?

#### 5. "Tests fail" - Database connection errors

**Check**:

1. `MONGODB_URI_TEST` in `.env`?
2. MongoDB running?
3. Test database cleanup in `afterEach`?

#### 6. "Cannot read property 'id' of undefined" (req.user)

**Cause**: Missing auth middleware

**Solution**:

```javascript
// Add auth middleware before controller
router.get('/expenses', apiAuthHandler, getExpenses);
//                      ^^^^^^^^^^^^^^^^
```

#### 7. "Database initialization fails"

**Check**:

1. Did you build first?
   ```bash
   npm run build
   npm run init:db
   ```
2. MongoDB connection URI correct?
3. Permissions to create collections?

#### 8. "MISA integration not working"

**Check**:

1. `MISA_BASE_URL` and `MISA_AUTH_URL` in `.env`?
2. MISA credentials valid?
3. Network access to MISA API?
4. Test mode in `tests/misa.test.js` using mocks?

#### 9. "Excel import fails"

**Check**:

1. File format (.xlsx, .xls)?
2. Sheet names match expected (e.g., "Rental", "Salary")?
3. Column headers match parser expectations?
4. Data validation (dates, numbers, required fields)?

#### 10. "6 Jars allocation incorrect"

**Check**:

1. `previousMonthSalary` set correctly?
2. Percentages: NEC 55%, FFA 10%, EDUC 10%, PLAY 10%, GIVE 7%, LTS 8%
3. `motherGift` set manually (not auto-calculated)
4. Rounding to 2 decimals: `Math.round(amount * 100) / 100`

---

## Additional Resources

### Documentation Files

- `.github/copilot-instructions.md` - AI coding guidelines
- `.github/instructions/fintrack.instructions.md` - TypeScript development instructions
- `.github/chatmodes/fintrack.chatmode.md` - AI chat mode configuration
- `README.md` - Project overview and setup
- `CONTRIBUTING.md` - Contribution guidelines

### External Documentation

- **Node.js**: https://nodejs.org/docs/
- **Express.js**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **MongoDB**: https://docs.mongodb.com/
- **Mongoose**: https://mongoosejs.com/docs/
- **Jest**: https://jestjs.io/docs/getting-started
- **EJS**: https://ejs.co/#docs

### Community & Support

- **GitHub Issues**: Report bugs, request features
- **Discussions**: Ask questions, share ideas
- **Pull Requests**: Contribute code, docs, tests

---

## Conclusion

FinTrack is a sophisticated personal finance platform with a unique Vietnamese cultural adaptation of the 6 Jars budgeting method. The ongoing TypeScript migration aims to improve code quality, maintainability, and developer experience while preserving the robust feature set and dual API/Web UI architecture.

**Key Takeaways**:

1. **Dual Interface**: API (JSON) + Web UI (EJS) - different auth handlers
2. **6 Jars Method**: Core budgeting feature with "Gửi Mẹ" cultural adaptation
3. **TypeScript Migration**: Models complete, controllers/routes pending
4. **Error Handling**: Always use `next(error)` pattern
5. **Route Order**: Web → Admin → API (critical!)
6. **Base Abstractions**: All models extend `IAbsBaseModel`
7. **Path Aliases**: Use `@/` for imports
8. **Testing**: 70% coverage threshold, separate test DB
9. **Integrations**: MISA Money Keeper, Excel, VietQR
10. **Build**: TypeScript → JavaScript with path resolution

For detailed instructions on specific topics, refer to the linked documentation files throughout this guide.
