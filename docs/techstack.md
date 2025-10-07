# FinTrack Technology Stack

## Tổng quan / Overview

FinTrack được xây dựng với stack công nghệ hiện đại, tập trung vào hiệu suất, bảo mật và khả năng mở rộng. Dự án sử dụng kiến trúc "Dual Interface" với RESTful API và Server-Side Rendering.

FinTrack is built with a modern technology stack, focusing on performance, security, and scalability. The project uses a "Dual Interface" architecture with RESTful API and Server-Side Rendering.

---

## 🎯 Kiến trúc / Architecture

### Dual Interface Architecture
- **RESTful API** (`/api/*`): Endpoints cho truy cập programmatic
- **Web UI** (Server-Side Rendered): Giao diện web sử dụng EJS templates
- **Static Assets**: CSS/JS riêng biệt cho từng feature

### Design Patterns
- **MVC Pattern**: Model-View-Controller separation
- **Middleware Chain**: Express middleware for authentication, validation, error handling
- **Repository Pattern**: Mongoose models for data access
- **JWT Authentication**: Stateless authentication with bearer tokens

---

## 🔧 Backend Technologies

### Core Framework
- **Node.js** >= 18.0.0 - JavaScript runtime
- **Express.js** ^4.18.2 - Web application framework
  - Fast, minimalist web framework
  - Extensive middleware ecosystem
  - RESTful API support

### Database
- **MongoDB** >= 4.4 - NoSQL database
  - Document-oriented storage
  - Flexible schema design
  - High performance for read/write operations
- **Mongoose** ^8.0.3 - MongoDB ODM (Object Data Modeling)
  - Schema validation
  - Pre/post hooks for business logic
  - Query building and population

### Authentication & Security
- **jsonwebtoken** ^9.0.2 - JWT token generation and verification
- **bcryptjs** ^2.4.3 - Password hashing with salt
- **helmet** ^7.1.0 - Security headers middleware
  - XSS protection
  - Content Security Policy
  - HTTPS enforcement
- **cors** ^2.8.5 - Cross-Origin Resource Sharing
- **express-validator** ^7.0.1 - Request validation middleware

### File Processing
- **multer** ^2.0.2 - File upload handling
- **xlsx** ^0.18.5 - Excel file import/export
  - Read/write .xlsx files
  - Data transformation
  - Support for financial data formats

### Utilities & Middleware
- **dotenv** ^16.3.1 - Environment variable management
- **morgan** ^1.10.0 - HTTP request logger
- **compression** ^1.7.4 - Response compression (gzip)
- **rotating-file-stream** ^3.2.7 - Log rotation

### API Documentation
- **swagger-jsdoc** ^6.2.8 - JSDoc to Swagger/OpenAPI spec generator
- **swagger-ui-express** ^5.0.1 - Interactive API documentation UI
  - Accessible at `/api-docs`
  - JSON spec at `/api-docs.json`

### External Integrations
- **vietqr** ^1.1.9 - Vietnamese banking QR code integration
  - VietQR payment support
  - Bank account verification

---

## 🎨 Frontend Technologies

### Template Engine
- **EJS** ^3.1.10 - Embedded JavaScript templates
  - Server-side rendering
  - Partials for reusable components
  - Layout inheritance

### CSS Framework & UI
- **Bootstrap** 5.3.8 (via CDN) - Responsive CSS framework
  - Grid system
  - Pre-built components
  - Responsive utilities
- **Bootstrap Icons** (via CDN) - Icon library
- **Custom CSS** - Feature-specific stylesheets
  - `style.css` - Global styles
  - `login.css` - Authentication pages
  - `dashboard.css` - Dashboard styles
  - `expenses.css` - Expense tracking
  - And more...

### JavaScript Libraries
- **Vanilla JavaScript** - No heavy frontend framework
- **jQuery** (via CDN) - DOM manipulation and AJAX
- **Chart.js** 4.4.1 (via CDN) - Data visualization
  - Doughnut charts for expense categories
  - Bar charts for income vs expenses
  - Responsive and interactive

### Frontend Structure
```
public/
├── css/              # Stylesheets
│   ├── style.css
│   ├── login.css
│   ├── dashboard.css
│   ├── expenses.css
│   └── ...
└── js/               # Client-side JavaScript
    ├── main.js       # Core utilities
    ├── auth.js       # Authentication helpers
    ├── login.js      # Login page logic
    ├── register.js   # Registration logic
    ├── dashboard.js  # Dashboard with charts
    ├── expenses.js   # Expense management
    ├── excel.js      # Excel import/export
    └── ...
```

---

## 🧪 Testing & Quality Assurance

### Testing Framework
- **Jest** ^29.7.0 - JavaScript testing framework
  - Unit tests
  - Integration tests
  - Coverage reporting
- **Supertest** ^6.3.3 - HTTP assertion library
  - API endpoint testing
  - Request/response validation

### Code Quality
- **ESLint** ^8.56.0 - JavaScript linter
  - Code style enforcement
  - Error detection
  - ES2021 syntax support
- **Prettier** ^3.1.1 - Code formatter
  - Consistent formatting
  - Auto-formatting on save

### Testing Configuration
```javascript
// jest.config.js
- Test Environment: Node.js
- Coverage Threshold: 70% (all metrics)
- Test Pattern: **/*.test.js, **/*.spec.js
- Coverage Directory: coverage/
```

### Quality Metrics
- **Code Coverage**: ≥70% (branches, functions, lines, statements)
- **ESLint Rules**: Based on `eslint:recommended`
- **Ignored Patterns**: `public/*` (frontend code)

---

## 🛠️ Development Tools

### Development Dependencies
- **nodemon** ^3.0.2 - Auto-restart on file changes
  - Watch mode for development
  - Fast feedback loop

### Version Control
- **Git** - Source code management
- **GitHub** - Repository hosting and collaboration

### Scripts
```json
{
  "start": "node src/index.js",           // Production mode
  "dev": "nodemon src/index.js",          // Development with hot reload
  "test": "jest --coverage",              // Run tests with coverage
  "test:watch": "jest --watch",           // Watch mode for tests
  "lint": "eslint src/**/*.js",           // Check code style
  "lint:fix": "eslint src/**/*.js --fix", // Auto-fix linting issues
  "format": "prettier --write src/**/*.js", // Format code
  "init:db": "node src/scripts/initDB.js" // Initialize database
}
```

---

## 🐳 DevOps & Deployment

### Containerization
- **Docker** - Container platform
  - Multi-stage builds
  - Non-root user for security
  - Health checks included
  - Base image: `node:22.12.0-alpine`

### Container Orchestration
- **Docker Compose** v3.8 - Multi-container deployment
  - MongoDB service
  - FinTrack API service
  - Networking configuration
  - Volume management

### Docker Configuration
```yaml
Services:
- mongodb: MongoDB 7 with health checks
- api: FinTrack application with Express.js
Networks: fintrack-network (bridge)
Volumes: mongodb_data (persistent storage)
```

### Deployment Features
- **Health Checks**: Built-in health endpoints
- **Auto-restart**: `unless-stopped` restart policy
- **Service Dependencies**: API waits for MongoDB
- **Port Mapping**: 3000 (API), 27017 (MongoDB)

---

## 📦 Project Structure

```
Financial-Tracking/
├── src/                    # Source code
│   ├── config/            # Configuration files
│   │   ├── config.js      # App configuration
│   │   ├── database.js    # MongoDB connection
│   │   └── swagger.js     # API documentation config
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── salaryController.js
│   │   └── ...
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Salary.js
│   │   └── ...
│   ├── routes/            # API & view routes
│   │   ├── authRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── viewRoutes.js
│   │   └── ...
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js        # JWT authentication
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── utils/             # Utilities
│   │   ├── excelParser.js
│   │   └── helpers.js
│   ├── scripts/           # Utility scripts
│   │   └── initDB.js
│   └── index.js           # Application entry point
├── views/                 # EJS templates
│   ├── partials/          # Reusable components
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── sidebar.ejs
│   ├── dashboard.ejs
│   ├── expenses.ejs
│   ├── login.ejs
│   └── ...
├── public/                # Static assets
│   ├── css/              # Stylesheets
│   └── js/               # Client-side scripts
├── tests/                # Test files
├── docs/                 # Documentation
├── examples/             # Example files
├── .env.example          # Environment template
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Multi-container setup
├── jest.config.js        # Jest configuration
├── .eslintrc.json        # ESLint rules
├── .prettierrc.json      # Prettier config
└── package.json          # Dependencies & scripts
```

---

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Stateless authentication
- **Bearer Token**: Authorization header
- **Token Expiry**: 7 days default
- **Password Hashing**: bcrypt with salt rounds (12)

### Security Headers (via Helmet)
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### Input Validation
- Request body validation with express-validator
- Schema validation with Mongoose
- XSS protection

### Data Protection
- Password fields excluded from queries by default
- MongoDB connection string in environment variables
- Sensitive data in `.env` file (not committed)

---

## 🌍 Internationalization (i18n)

### Supported Languages
- **Vietnamese (vi)**: Primary language
- **English (en)**: Secondary language

### Implementation
- User language preference stored in database
- UI text supports both languages
- Vietnamese financial terminology used throughout
- Currency: VND (Vietnamese Dong) as default

---

## 📊 Performance Optimizations

### Backend
- **Compression**: gzip compression for responses >1KB
- **Connection Pooling**: MongoDB connection reuse
- **Pagination**: Limit/skip for large datasets
- **Indexes**: Database indexes on frequently queried fields

### Frontend
- **CDN**: External libraries loaded from CDN
- **Lazy Loading**: Charts loaded on demand
- **Minimal Dependencies**: Vanilla JS where possible
- **Responsive Design**: Mobile-first approach

### Caching
- Static assets served with appropriate cache headers
- Database query result caching (planned)

---

## 🔄 API Design

### RESTful Endpoints
```
/api/auth/*           - Authentication
/api/transactions/*   - Financial transactions
/api/expenses/*       - Expense management
/api/salaries/*       - Salary tracking
/api/rentals/*        - Rental management
/api/budgets/*        - Budget planning
/api/goals/*          - Financial goals
/api/savings/*        - Savings accounts
/api/deposits/*       - Deposit management
/api/recurring-bills/* - Recurring bills
/api/bank-accounts/*  - Bank account integration
/api/excel/*          - Excel import/export
```

### Response Format
```json
{
  "success": true|false,
  "message": "Description",
  "data": { ... }
}
```

### Authentication Flow
- Login/Register: POST `/api/auth/login`, `/api/auth/register`
- Protected Routes: `Authorization: Bearer <token>`
- Token Verification: Middleware in `src/middleware/auth.js`

---

## 📱 Browser & Environment Support

### Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Node.js
- **Minimum**: Node.js 18.0.0
- **Recommended**: Node.js 18.x or 20.x LTS
- **Package Manager**: npm 9.0.0 or higher

### MongoDB
- **Minimum**: MongoDB 4.4
- **Recommended**: MongoDB 5.x or 7.x
- **Driver**: Mongoose 8.0.3

---

## 🚀 Getting Started

### Prerequisites
```bash
- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm >= 9.0.0
- Docker (optional, for containerized deployment)
```

### Installation
```bash
# Clone repository
git clone https://github.com/nguyenquy0710/Financial-Tracking.git
cd Financial-Tracking

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Initialize database
npm run init:db

# Start development server
npm run dev
```

### Production Deployment
```bash
# Using Docker Compose
docker-compose up -d

# Or manual deployment
npm start
```

---

## 📚 Documentation

### Available Docs
- **API Documentation**: [Swagger UI](http://localhost:3000/api-docs)
- **Quick Start**: [docs/QUICKSTART.md](./QUICKSTART.md)
- **Authentication Flow**: [docs/AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)
- **Dashboard Implementation**: [docs/DASHBOARD_IMPLEMENTATION.md](./DASHBOARD_IMPLEMENTATION.md)
- **Excel Import Guide**: [docs/EXCEL_IMPORT_GUIDE.md](./EXCEL_IMPORT_GUIDE.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎯 Key Features Implementation

### 6 Jars Budget Method
Phương pháp quản lý tài chính với 7 "lọ" (jars):
- **Gửi Mẹ**: Tiền gửi gia đình
- **NEC (55%)**: Nhu cầu thiết yếu
- **FFA (10%)**: Tự do tài chính
- **EDUC (10%)**: Giáo dục
- **PLAY (10%)**: Giải trí
- **GIVE (7%)**: Từ thiện
- **LTS (10%)**: Tiết kiệm dài hạn

### Financial Tracking
- Income tracking (salary, freelance)
- Expense categorization
- Rental management (room/house)
- Bill management
- Savings goals
- Budget planning

### Data Visualization
- Chart.js for interactive charts
- Expense breakdown by category
- Income vs expense comparison
- 6-month trend analysis
- Quick statistics dashboard

---

## 🔧 Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development|production

# Database
MONGODB_URI=mongodb://localhost:27017/fintrack

# Authentication
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# External APIs
VIETQR_CLIENT_ID=your-vietqr-client-id
VIETQR_API_KEY=your-vietqr-api-key
```

---

## 🤝 Contributing

### Code Style
- ESLint configuration: `.eslintrc.json`
- Prettier configuration: `.prettierrc.json`
- Auto-format on commit (recommended)

### Testing Requirements
- Write tests for new features
- Maintain ≥70% code coverage
- Run `npm test` before committing
- Integration tests with Supertest

### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 👥 Authors & Contributors

- **Nguyễn Hữu Quý** - Initial work and maintainer
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for contributor guidelines

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/nguyenquy0710/Financial-Tracking/issues)
- **Email**: support@fintrack.com
- **Documentation**: [Project Wiki](https://github.com/nguyenquy0710/Financial-Tracking/wiki)

---

**Made with ❤️ in Vietnam**

*Last Updated: January 2025*
