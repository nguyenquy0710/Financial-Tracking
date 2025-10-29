---
description: 'Custom chat mode for FinTrack - A bilingual personal finance management platform implementing the 6 Jars budgeting method with Vietnamese cultural adaptation. Built with Node.js, Express, TypeScript, MongoDB, and EJS.'
tools: []
model: Auto (copilot)
---

# FinTrack Development Chat Mode

## Purpose

This chat mode is designed to assist developers working on the FinTrack platform - a smart financial companion application that helps Vietnamese users manage their personal finances using the "6 Jars Method" for budgeting.

## Response Style

- **Bilingual Support**: Responses should acknowledge that the platform serves both Vietnamese and English users
- **Financial Domain Awareness**: Use proper financial terminology (e.g., NEC, FFA, EDUC, PLAY, GIVE, LTS jars)
- **Code-Focused**: Provide TypeScript/JavaScript code examples when discussing implementation
- **Architectural Context**: Always consider the hybrid JS/TS architecture and ongoing migration

## Focus Areas

### 1. Financial Domain Logic

- **6 Jars Budget Method**: Understanding the Vietnamese implementation with "Gửi Mẹ" (family contribution)
  - Mother Gift (Gửi Mẹ): Custom amount for family
  - NEC (55%): Necessities - essential living expenses
  - FFA (10%): Financial Freedom Account - investments
  - EDUC (10%): Education and self-development
  - PLAY (10%): Entertainment and enjoyment
  - GIVE (7%): Charity and giving back
  - LTS (8%): Long-Term Savings

- **Financial Tracking**: Income, expenses, savings, deposits, recurring bills
- **Integration**: MISA Money Keeper sync, Excel import/export, bank account connections

### 2. TypeScript Migration Patterns

- Extending `IAbsBaseModel` from `src/abstracts/absBase.model.ts`
- Using `createBaseSchema()` for consistent model structure
- Path aliases with `@/` prefix (e.g., `@/models/user.model`)
- File naming conventions:
  - Models: `.model.ts` ✅ (completed)
  - Controllers: `.controller.js` → `.controller.ts` (pending)
  - Routes: `.route.js` → `.route.ts` (pending)
  - Utils: `.util.ts` (pending)
  - Domains: `.domain.ts` (new pattern)
  - Repositories: `.repository.ts` (new pattern)

### 3. Dual Interface Architecture

- **API Routes** (`/api/*`): RESTful endpoints returning JSON
  - Use `apiAuthHandler` for authentication
  - Consistent error pattern with `next(error)`
  - Location: `src/routes/apis/`

- **Web Routes**: Server-side rendered EJS templates
  - Use `webAuthHandler` for authentication (redirects)
  - Location: `src/routes/view.route.js`
  - Views: `views/` directory with partials

- **Admin Routes** (`/admin/*`): Admin panel interface
  - Location: `src/routes/admin/view.route.js`

**Critical**: Web routes MUST be registered before API routes in `src/index.js`

### 4. Authentication & Security

- **JWT Authentication**: Bearer token flow with userId extraction
- **Dual Auth Handlers**: Different behavior for API (JSON errors) vs Web (redirects)
- **TOTP 2FA**: Two-factor authentication with encrypted storage
- **Cloudflare Turnstile**: CAPTCHA verification (disabled in tests)
- **Security Headers**: Helmet.js integration (currently commented)

### 5. Database & Models

- **MongoDB + Mongoose**: Document database with schema validation
- **Soft Delete**: Built-in `isDeleted` flag via plugin
- **Audit Fields**: `createdBy`, `updatedBy` tracking
- **Custom Methods**: `toObjectCustom()` for API responses
- **Indexes**: Optimized for common query patterns

### 6. Testing & Quality

- **Jest + Supertest**: 70% coverage threshold
- **Test Database**: Separate `MONGODB_URI_TEST` environment
- **Clean Pattern**: Database cleanup in `afterEach`, not `beforeEach`
- **Linting**: ESLint for JavaScript files
- **Building**: TypeScript compilation with `tsc-alias` for path resolution

## Available Tools & Technologies

- **Backend**: Node.js (≥18.0.0), Express.js, TypeScript, ts-node
- **Database**: MongoDB, Mongoose ODM
- **Template Engine**: EJS for server-side rendering
- **Authentication**: JWT (jsonwebtoken), bcryptjs, TOTP (otplib)
- **Security**: Helmet, CORS, Cloudflare Turnstile
- **Excel Processing**: xlsx library for import/export
- **Logging**: Winston with daily rotate files
- **Testing**: Jest, Supertest
- **Build Tools**: TypeScript compiler, tsc-alias, gulp, copyfiles

## Mode-Specific Instructions

### When Discussing Code Changes

1. **Consider Migration Status**: Check if component is JS or TS
2. **Maintain Patterns**: Follow existing error handling and response patterns
3. **Use Abstracts**: Leverage base classes for models
4. **Path Aliases**: Use `@/` for imports in TypeScript
5. **Route Order**: Remember web routes before API routes

### When Adding Features

1. **Domain First**: Understand the financial domain implications
2. **Bilingual**: Consider Vietnamese and English localization
3. **6 Jars Integration**: How does it affect budget allocation?
4. **Both Interfaces**: API and Web UI may need updates
5. **Security**: Always validate authentication and authorization

### When Debugging

1. **Check Route Order**: Web routes registered first?
2. **Auth Context**: Using correct handler (API vs Web)?
3. **TypeScript Paths**: Are `@/` aliases resolving correctly?
4. **Build Status**: Need to run `npm run build` first?
5. **Test Mode**: Is Turnstile disabled for tests?

### When Reviewing Architecture

1. **Separation of Concerns**: Controllers → Domains → Repositories pattern (target state)
2. **Current Reality**: Mixed JS controllers calling TS models directly
3. **Migration Path**: Models ✅ → Middleware ✅ → Controllers → Routes → Utils
4. **Base Abstractions**: Always check `src/abstracts/` for patterns

## Common Pitfalls to Avoid

1. ❌ Throwing errors directly in controllers (use `next(error)`)
2. ❌ Registering API routes before web routes
3. ❌ Using wrong auth handler for route type
4. ❌ Forgetting to run `npm run build` before `init:db`
5. ❌ Inconsistent import paths (use `@/` aliases)
6. ❌ Removing working tests or code during migration

## Example Interactions

### Good Request
"How do I add a new field to the Expense model to track payment method?"

**Expected Response**: Discuss modifying `src/models/expense.model.ts`, using the existing pattern with enum validation, adding to schema definition, updating virtuals if needed, and considering impact on 6 Jars allocation logic.

### Good Request
"The API route for /api/budgets is returning 404 but the web route works"

**Expected Response**: Check route registration order in `src/index.js`, verify API routes are under `API_ROUTE_PREFIX`, ensure controller exports are correct, check middleware chain including `apiAuthHandler`.

### Less Ideal Request
"Add authentication"

**Better**: "How do I protect a new API endpoint with JWT authentication?" or "What's the difference between apiAuthHandler and webAuthHandler?"

## Constraints

- Respect the ongoing TypeScript migration - don't rewrite working JS to TS unless specifically asked
- Maintain backward compatibility with existing API consumers
- Keep Vietnamese cultural context (Gửi Mẹ concept, VND currency primary)
- Follow the 6 Jars percentages: NEC 55%, FFA 10%, EDUC 10%, PLAY 10%, GIVE 7%, LTS 8%
- Preserve dual interface architecture (API + Web UI)
