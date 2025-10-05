# FinTrack AI Coding Guidelines

## Project Overview

FinTrack is a bilingual (Vietnamese/English) personal finance management platform implementing the "6 Jars Method" for budgeting. It serves both as a RESTful API and a server-side rendered web application using Express.js + EJS.

## Architecture Patterns

### Dual Interface Architecture

- **API Routes** (`/api/*`): RESTful endpoints for programmatic access
- **Web UI Routes** (`/`, `/dashboard`, etc.): Server-side rendered EJS templates
- **Route Priority**: Web UI routes are registered BEFORE API routes in `src/index.js`
- **Static Assets**: Served from `public/` directory with separate CSS/JS for each feature

### Core Directory Structure

```
src/
├── controllers/     # Business logic with consistent error handling
├── models/         # Mongoose schemas with pre-save hooks
├── routes/         # Separate files for API vs view routes
├── middleware/     # auth.js, errorHandler.js, validator.js
├── config/         # Environment-based configuration
└── utils/          # Shared utilities (excelParser, helpers)
```

## Development Conventions

### Controller Pattern

- All controllers use `async/await` with `next(error)` for error handling
- Standard response format: `{ success, message, data }`
- JWT authentication via `req.user` and `req.userId` from auth middleware
- Use `@desc`, `@route`, `@access` JSDoc comments for Swagger documentation

### Model Patterns

- All models include `userId` reference for multi-tenancy
- Use Mongoose `pre('save')` hooks for password hashing and data transformation
- Enum validation for constrained fields (currency, language, categories)
- Automatic `timestamps: true` for createdAt/updatedAt

### Authentication Flow

- JWT tokens via `Authorization: Bearer <token>` header
- Middleware in `src/middleware/auth.js` handles both API and web routes
- Different redirect behavior: API returns JSON, web routes redirect to `/login`
- User object attached to `req.user` (password excluded)

### Error Handling

- Centralized error handler in `src/middleware/errorHandler.js`
- Use `next(error)` in controllers, never throw directly
- Consistent error response format across API endpoints

## Key Features Implementation

### 6 Jars Budget Method

Financial allocations tracked via:

- **NEC (55%)**: Necessities
- **FFA (10%)**: Financial Freedom Account
- **EDUC (10%)**: Education
- **PLAY (10%)**: Entertainment
- **GIVE (7%)**: Charity
- **LTS (10%)**: Long Term Savings

### Excel Integration

- Import/export functionality in `src/utils/excelParser.js`
- Uses `xlsx` library for file processing
- Dedicated routes in `src/routes/excelRoutes.js`

### Bilingual Support

- Vietnamese as primary language (`vi`), English secondary (`en`)
- User model stores language preference
- UI text should support both languages

## Development Workflow

### Commands

```bash
npm run dev          # Development with nodemon
npm run test         # Jest with coverage
npm run init:db      # Initialize database with sample data
npm run lint         # ESLint for src/ only (excludes public/)
```

### Testing

- Test files in `tests/` directory using Jest + Supertest
- Separate test database via `MONGODB_URI_TEST`
- Coverage thresholds: 70% for all metrics
- Clean database between tests in `afterEach`

### Docker Setup

- Multi-stage build optimized for production
- Non-root user for security
- Health checks included
- Works with `docker-compose.yml` for local development

## Configuration Management

Environment variables managed via `src/config/config.js`:

- JWT settings (secret, expiration)
- Database URI (MongoDB)
- CORS configuration
- File upload limits
- Pagination defaults

## API Documentation

- Swagger UI available at `/api-docs`
- JSON spec at `/api-docs.json`
- Use JSDoc comments in controllers for automatic generation
- Include authentication examples in Swagger

## Common Patterns to Follow

### Database Queries

- Always filter by `userId` for user-specific data
- Use populate for related documents
- Implement pagination with `limit` and `skip`

### Date Handling

- Store dates as Date objects in MongoDB
- Month-based filtering for financial data
- Use ISO date strings in API responses

### File Organization

- One route file per feature area
- Controllers mirror route structure
- Models use singular naming (User, not Users)
- Middleware files serve specific purposes (auth, validation, error handling)

## Project-Specific Notes

- Vietnamese financial terminology used throughout
- VND as default currency with multi-currency support
- Rental management for room/house expenses tracking
- Salary tracking with multiple income sources (company, freelance)
- Bank account integration preparation (VietQR library included)
