# FinTrack AI Coding Guidelines

## Project Overview

FinTrack is a bilingual (Vietnamese/English) personal finance management platform implementing the "6 Jars Method" for budgeting. It serves both as a RESTful API and a server-side rendered web application using Express.js + EJS, with **ongoing TypeScript migration**.

## Architecture Patterns

### Hybrid JS/TS Codebase (Migration in Progress)

- **Current State**: JavaScript controllers/routes + TypeScript models/config/middleware
- **Models**: All in TypeScript with abstract base classes (`src/abstracts/absBase.model.ts`)
- **Config/Enums**: TypeScript with enum validation (`src/config/enums.ts`)
- **Build Process**: TypeScript compilation + file copying to `dist/` directory

### Dual Interface Architecture

- **Route Registration Order**: Web UI routes BEFORE API routes in `src/index.js`
- **API Routes** (`/api/*`): RESTful endpoints via `src/routes/apis/`
- **Admin Routes** (`/admin/*`): Separate admin API endpoints via `src/routes/admin/view.route.js`
- **Web UI Routes**: Server-side rendered EJS via `src/routes/view.route.js`
- **Route Constants**: Centralized in `src/constants/route_prefix.constant.ts`

### Critical Directory Structure

```
./
├── src/
    ├── abstracts/            # Base classes for models (IAbsBaseModel)
        ├── absBase.domain.ts       # Abstract base domain logic (pending migration)
        ├── absBase.model.ts        # Abstract base model with common fields/methods
        ├── absBase.repository.ts   # Abstract base repository (pending migration)
    ├── config/               # TypeScript config with enum validation
    ├── constants/            # Route prefixes and other constants
    ├── controllers/          # Business logic (JS) with consistent error patterns
    ├── domains/              # Business logic (TS) - pending migration
    ├── middleware/           # TypeScript middleware with custom router export
    ├── models/               # TypeScript models with abstract inheritance
    ├── plugins/              # Mongoose plugins (TS) - pending migration
    ├── repositories/         # Data access layer (TS) - pending migration
    ├── routes/               # Mixed structure: view.route.js + apis/ subfolder
        ├── admin/            # Business logic (TS) - pending migration
        ├── apis/             # API route handlers (JS)
        ├── view.route.js     # Web UI route handlers (JS)
    └── utils/                # Mixed JS/TS utilities
├── public/                  # Static assets (CSS, JS, images)
    ├── css/                 # Stylesheets
    ├── js/                  # Client-side JavaScript
├── views/                   # EJS templates for server-side rendering
    ├── admin/               # Admin panel views
    ├── partials/            # Reusable EJS partials
```

## Development Conventions

### TypeScript Model Pattern

- Extend `IAbsBaseModel` from `src/abstracts/absBase.model.ts`
- Use `createBaseSchema()` helper for consistent schema structure
- Built-in soft delete (`isDeleted`) and audit fields (`createdBy`/`updatedBy`)
- Custom `toObjectCustom()` method for API responses

### Authentication Architecture

- **Dual Auth Handlers**: `apiAuthHandler` (JSON) vs `webAuthHandler` (redirects)
- **Middleware Path**: `src/middleware/authHandler.js` (JS) + index.ts router
- **JWT Flow**: Bearer token → decoded.userId → attach `req.user` and `req.userId`
- **Error Responses**: Different behavior for API vs web routes

### Controller Error Pattern

```javascript
// Always use this pattern - never throw directly
try {
  // business logic
  res.status(200).json({ success: true, message: '...', data: result });
} catch (error) {
  next(error); // Centralized errorHandler.js processes this
}
```

### Build & Development Workflow

```bash
npm run dev          # ts-node with tsconfig-paths for development
npm run build        # TypeScript compile → dist/ + file copying
npm start            # Run compiled JS from dist/
npm run init:db      # Initialize with default data (requires build first)
```

## Critical Integration Points

### Excel Processing

- **Library**: `xlsx` for import/export in `src/utils/excelParser.js`
- **Pattern**: Sheet-specific parsers (`parseRentalSheet`, etc.)
- **Routes**: Dedicated Excel endpoints in `src/routes/apis/excel.route.js`

### MISA Money Keeper Integration

- **External API**: MISA auth + business endpoints in `src/config/config.ts`
- **Controllers**: MISA-specific logic for transaction import
- **Authentication**: Separate MISA auth flow + token management

### Security Features

- **Cloudflare Turnstile**: CAPTCHA verification in auth flows (skipped in tests)
- **TOTP**: 2FA implementation with encrypted storage in `src/models/totp.model.ts`
- **Rate Limiting**: Custom middleware patterns

## TypeScript Migration Guidelines

### File Naming Conventions

- **Constants**: `.constant.ts` (completed)
- **Controllers**: Mixed `.controller.js` and `.controller.ts` (pending migration)
- **Domains**: `.domain.ts` (new pattern for business logic - pending)
- **Middleware**: `.middleware.ts` (new pattern - pending)
- **Models**: `.model.ts` (completed)
- **Plugins**: `.plugin.ts` (new pattern - pending)
- **Repositories**: `.repository.ts` (new pattern - pending)
- **Routes**: Mixed `.js` and `.route.ts` (pending migration)
- **Utils**: `.util.ts` (pending migration)

### Import Patterns

```typescript
// Use path aliases defined in tsconfig.json
import { default: User } from '@/models/user.model';
import config from '@/config/config';
```

## Testing Strategy

- **Framework**: Jest + Supertest with 70% coverage thresholds
- **Database**: Separate test DB via `MONGODB_URI_TEST`
- **Pattern**: Clean database in `afterEach`, not `beforeEach`
- **Environment**: Turnstile verification disabled in test mode

## Financial Domain Logic

### 6 Jars Budget Method (Core Feature)

- **Vietnamese Implementation**: Gửi Mẹ (family) + traditional percentages
- **Models**: Separate models for each financial category (Salary, Expense, Saving, etc.)
- **Tracking**: Monthly aggregation with detailed breakdown

### Multi-Currency & Localization

- **Primary**: Vietnamese (`vi`) with VND currency
- **Storage**: Enum validation in TypeScript models
- **UI**: EJS templates with language-specific rendering

## Common Pitfalls to Avoid

1. **Route Order**: Web routes MUST be registered before API routes
2. **Auth Context**: Different error handling for `/api/*` vs web routes
3. **Build Dependencies**: Run `npm run build` before database initialization
4. **TypeScript Paths**: Use `@/` aliases consistently in new code
5. **Error Handling**: Always use `next(error)` in controllers, never direct throws
