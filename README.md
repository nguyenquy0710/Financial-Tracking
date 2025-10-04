# FinTrack - Smart Financial Companion Platform

**FinTrack (Financial Tracking)** – Người bạn đồng hành tài chính thông minh

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## 🌐 Tầm nhìn / Vision

Xây dựng một nền tảng "người bạn đồng hành tài chính thông minh", không chỉ ghi chép thu chi mà còn hỗ trợ lập kế hoạch, phân tích và gợi ý để giúp người dùng quản lý tiền bạc hiệu quả hơn, hướng tới tự do tài chính.

Building a "Smart Financial Companion Platform" that not only tracks income and expenses but also supports planning, analysis, and suggestions to help users manage their finances more effectively, aiming for financial freedom.

## ⚙️ Tính năng cốt lõi / Core Features

### 📝 Ghi chép thu chi / Transaction Recording

- ✅ Nhập thủ công hoặc quét hóa đơn / Manual entry or receipt scanning
- ✅ Đồng bộ giao dịch từ ví điện tử, ngân hàng (nếu tích hợp API) / Sync transactions from e-wallets and banks (with API integration)
- ✅ Phân loại tự động theo danh mục / Auto-categorization by category (food, transportation, entertainment, etc.)

### 🏠 Quản lý thuê phòng / Rental Management (NEW)

- ✅ Theo dõi tiền thuê nhà hàng tháng / Track monthly rent
- ✅ Quản lý tiền điện, nước, internet, gửi xe / Manage electricity, water, internet, parking fees
- ✅ Tính toán tự động tổng chi phí / Auto-calculate total costs
- ✅ Import/Export từ Excel / Import/Export from Excel

### 💵 Quản lý lương / Salary Management (NEW)

- ✅ Theo dõi lương từ công ty / Track company salary (basic, KPI, projects, OT, bonus)
- ✅ Quản lý thu nhập freelance / Manage freelance income
- ✅ Tính toán tổng thu nhập / Calculate total income
- ✅ Phân tích tăng trưởng / Growth analysis

### 💳 Quản lý chi tiêu theo phương pháp 6 lọ / 6 Jars Method (NEW)

- ✅ **Gửi Mẹ**: Tiền gửi cho gia đình / Money for family
- ✅ **NEC (55%)**: Nhu cầu thiết yếu / Necessities
- ✅ **FFA (10%)**: Tự do tài chính / Financial Freedom Account
- ✅ **EDUC (10%)**: Giáo dục Đào tạo / Education
- ✅ **PLAY (10%)**: Giải trí Hưởng thụ / Play
- ✅ **GIVE (7%)**: Từ thiện Cho đi / Give
- ✅ **LTS (10%)**: Tiết kiệm dài hạn / Long Term Savings

### 📁 Excel Import/Export (NEW)

- ✅ Import dữ liệu từ file Excel / Import data from Excel
- ✅ Export toàn bộ dữ liệu ra Excel / Export all data to Excel
- ✅ Hỗ trợ định dạng chuẩn / Support standard format

### 📊 Phân tích & báo cáo / Analysis & Reports

- ✅ Biểu đồ chi tiêu hàng tuần/tháng/năm / Weekly/monthly/yearly spending charts
- ✅ Cảnh báo khi chi tiêu vượt hạn mức / Alerts when spending exceeds limits
- ✅ So sánh xu hướng chi tiêu giữa các tháng / Compare spending trends between months

### 💰 Ngân sách & mục tiêu tài chính / Budgets & Financial Goals

- ✅ Đặt hạn mức chi cho từng hạng mục / Set spending limits for each category
- ✅ Lập kế hoạch tiết kiệm / Create savings plans (e.g., save 50 million in 1 year)
- ✅ Nhắc nhở tiến độ mục tiêu / Goal progress reminders

### 🤖 Trí tuệ nhân tạo hỗ trợ / AI Support

- ✅ Gợi ý cắt giảm chi phí không cần thiết / Suggest cutting unnecessary expenses
- ✅ Đề xuất cách phân bổ ngân sách cá nhân / Recommend personal budget allocation (50/30/20 or custom)
- ✅ Phân tích thói quen tiêu dùng để đưa ra lời khuyên / Analyze spending habits for advice

### 🔒 Bảo mật & cá nhân hóa / Security & Personalization

- ✅ Mã hóa dữ liệu, đăng nhập sinh trắc học / Data encryption, biometric login
- ✅ Hỗ trợ đa ngôn ngữ (Tiếng Việt, English) / Multi-language support
- ✅ Tùy biến giao diện / Customizable interface
- ✅ Đám mây lưu trữ + đồng bộ nhiều thiết bị / Cloud storage + multi-device sync

## 🚀 Bắt đầu / Getting Started

### Yêu cầu / Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** >= 4.4
- **npm** >= 9.0.0

### Cài đặt / Installation

1. **Clone repository**

```bash
git clone https://github.com/nguyenquy0710/Financial-Tracking.git
cd Financial-Tracking
```

2. **Cài đặt dependencies / Install dependencies**

```bash
npm install
```

3. **Cấu hình môi trường / Configure environment**

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn / Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

4. **Khởi động MongoDB**

```bash
# Sử dụng Docker / Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Hoặc cài đặt MongoDB locally / Or install MongoDB locally
# https://www.mongodb.com/docs/manual/installation/
```

5. **Chạy ứng dụng / Start the application**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại / Server will run at: `http://localhost:3000`

### Architecture Overview

**FinTrack** sử dụng kiến trúc MVC (Model-View-Controller) với Express.js và EJS template engine:

- **API Routes** (`/api/*`): RESTful API endpoints for programmatic access
- **Web UI Routes** (`/`, `/login`, `/dashboard`, etc.): Server-side rendered pages using EJS templates
- **Static Assets**: CSS, JavaScript, and images served from the `public` directory
- **Template Engine**: EJS for dynamic server-side HTML rendering

This architecture allows the application to serve both as a traditional web application and as an API backend for other clients.

## 📚 API Documentation

### Swagger UI (Interactive Documentation)

FinTrack cung cấp tài liệu API đầy đủ và tương tác thông qua Swagger UI:

**🔗 Truy cập Swagger UI:** `http://localhost:3000/api-docs`

Swagger UI cho phép bạn:

- 📖 Xem tất cả các API endpoints có sẵn
- 🧪 Test API trực tiếp từ trình duyệt
- 🔐 Authenticate với JWT token
- 📝 Xem chi tiết request/response schemas
- 💡 Xem ví dụ về request body và responses

**Để sử dụng Swagger UI:**

1. Mở `http://localhost:3000/api-docs` trong trình duyệt
2. Click vào nút **"Authorize"** ở góc trên bên phải
3. Nhập JWT token (lấy từ endpoint login) với format: `Bearer <your-token>`
4. Bây giờ bạn có thể test các protected endpoints

**API JSON Specification:** `http://localhost:3000/api-docs.json`

### API Endpoints Overview

### Authentication Endpoints

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyen Van A",
  "phone": "0123456789",
  "language": "vi",
  "currency": "VND"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Transaction Endpoints

#### Get All Transactions

```http
GET /api/transactions?type=expense&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
Authorization: Bearer {token}
```

#### Create Transaction

```http
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "expense",
  "amount": 50000,
  "categoryId": "category_id",
  "description": "Ăn trưa",
  "date": "2024-01-15",
  "paymentMethod": "cash"
}
```

#### Get Transaction Statistics

```http
GET /api/transactions/stats/summary?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### Category Endpoints

#### Get All Categories

```http
GET /api/categories?type=expense
Authorization: Bearer {token}
```

#### Create Custom Category

```http
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Custom Category",
  "nameVi": "Danh mục tùy chỉnh",
  "type": "expense",
  "icon": "🎯",
  "color": "#3498db",
  "keywords": ["custom", "special"]
}
```

### Budget Endpoints

#### Get All Budgets

```http
GET /api/budgets?period=monthly&isActive=true
Authorization: Bearer {token}
```

#### Create Budget

```http
POST /api/budgets
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Food Budget",
  "categoryId": "category_id",
  "amount": 5000000,
  "period": "monthly",
  "startDate": "2024-01-01",
  "alertThreshold": 80
}
```

#### Get Budget Alerts

```http
GET /api/budgets/alerts
Authorization: Bearer {token}
```

### Goal Endpoints

#### Get All Goals

```http
GET /api/goals?status=active
Authorization: Bearer {token}
```

#### Create Goal

```http
POST /api/goals
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Emergency Fund",
  "description": "Save for emergencies",
  "targetAmount": 50000000,
  "targetDate": "2024-12-31",
  "priority": "high"
}
```

#### Add Contribution to Goal

```http
POST /api/goals/:id/contribute
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1000000
}
```

### Rental Endpoints (NEW)

#### Get All Rentals

```http
GET /api/rentals?startDate=2024-01-01&endDate=2024-12-31&propertyName=P3L1
Authorization: Bearer {token}
```

#### Create Rental

```http
POST /api/rentals
Authorization: Bearer {token}
Content-Type: application/json

{
  "propertyName": "P3L1-600",
  "address": "Số 1 Hẻm 600, Đường Quang Trung",
  "month": "2024-01-01",
  "rentAmount": 3670000,
  "electricity": {
    "startReading": 311298,
    "endReading": 316190,
    "consumption": 4892,
    "rate": 4000,
    "amount": 19568000
  },
  "water": {
    "startReading": 0,
    "endReading": 0,
    "consumption": 0,
    "rate": 50000,
    "amount": 0
  },
  "internet": 0,
  "parking": 5510000,
  "garbage": 920000,
  "total": 29668000
}
```

### Salary Endpoints (NEW)

#### Get All Salaries

```http
GET /api/salaries?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

#### Create Salary

```http
POST /api/salaries
Authorization: Bearer {token}
Content-Type: application/json

{
  "month": "2024-01-01",
  "company": "VIHAT",
  "baseSalary": 7370000,
  "kpi": 5920927,
  "project": 7290124,
  "overtime": 0,
  "freelance": {
    "dakiatech": 6600000,
    "other": 13500000,
    "total": 20100000
  },
  "totalIncome": 40681051
}
```

### Expense Endpoints (NEW)

#### Get All Expenses

```http
GET /api/expenses?startDate=2024-01-01&category=Ăn uống
Authorization: Bearer {token}
```

#### Get Expense Statistics (with 6 Jars)

```http
GET /api/expenses/stats/summary
Authorization: Bearer {token}
```

### Excel Import/Export Endpoints (NEW)

#### Import from Excel

```http
POST /api/excel/import
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [Excel file]
```

#### Export to Excel

```http
GET /api/excel/export?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### Savings Endpoints (NEW)

#### Get All Savings

```http
GET /api/savings?type=mother&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

#### Create Saving

```http
POST /api/savings
Authorization: Bearer {token}
Content-Type: application/json

{
  "month": "2024-01-01",
  "type": "mother",
  "depositDate": "2024-01-15",
  "amount": 5000000,
  "accountNumber": "123456789",
  "recipient": "Nguyen Thi A",
  "notes": "Gửi tiền mẹ tháng 1"
}
```

#### Get Savings Statistics

```http
GET /api/savings/stats/summary
Authorization: Bearer {token}
```

### Deposits Endpoints (NEW)

#### Get All Deposits

```http
GET /api/deposits?bank=Vietcombank&status=active
Authorization: Bearer {token}
```

#### Create Deposit

```http
POST /api/deposits
Authorization: Bearer {token}
Content-Type: application/json

{
  "bank": "Vietcombank",
  "accountNumber": "1234567890",
  "accountName": "Nguyen Van A",
  "principalAmount": 100000000,
  "interestRate": 6.5,
  "termMonths": 12,
  "startDate": "2024-01-01",
  "maturityDate": "2025-01-01",
  "status": "active"
}
```

#### Get Upcoming Maturity Deposits

```http
GET /api/deposits/upcoming?days=30
Authorization: Bearer {token}
```

#### Get Deposits Statistics

```http
GET /api/deposits/stats/summary
Authorization: Bearer {token}
```

### Recurring Bills Endpoints (NEW)

#### Get All Recurring Bills

```http
GET /api/recurring-bills?type=electricity&isActive=true
Authorization: Bearer {token}
```

#### Create Recurring Bill

```http
POST /api/recurring-bills
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Tiền điện",
  "type": "electricity",
  "amount": 500000,
  "frequency": "monthly",
  "dueDay": 15,
  "nextDueDate": "2024-02-15",
  "reminderDays": 3,
  "autoDebit": false,
  "isActive": true
}
```

#### Mark Bill as Paid

```http
POST /api/recurring-bills/:id/pay
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 520000,
  "paidDate": "2024-01-15"
}
```

#### Get Upcoming Bills

```http
GET /api/recurring-bills/upcoming?days=7
Authorization: Bearer {token}
```

#### Get Overdue Bills

```http
GET /api/recurring-bills/overdue
Authorization: Bearer {token}
```

### Bank Account Endpoints (NEW)

#### Get All Bank Accounts

```http
GET /api/bank-accounts?isActive=true
Authorization: Bearer {token}
```

#### Create Bank Account

```http
POST /api/bank-accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "bank": "Vietcombank",
  "accountHolder": "Nguyen Van A",
  "accountNumber": "1234567890",
  "branch": "Chi nhánh Hà Nội",
  "identifier": "TK-VCB-01",
  "isDefault": true,
  "isActive": true
}
```

#### Set Bank Account as Default

```http
PUT /api/bank-accounts/:id/set-default
Authorization: Bearer {token}
```

#### Get Default Bank Account

```http
GET /api/bank-accounts/default
Authorization: Bearer {token}
```

## 🏗️ Cấu trúc dự án / Project Structure

```
Financial-Tracking/
├── src/
│   ├── config/           # Cấu hình ứng dụng
│   │   ├── config.js
│   │   ├── database.js
│   │   └── swagger.js          # NEW - Swagger configuration
│   ├── controllers/      # Business logic
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── categoryController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   ├── rentalController.js      # NEW
│   │   ├── salaryController.js      # NEW
│   │   ├── expenseController.js     # NEW
│   │   ├── excelController.js       # NEW
│   │   ├── savingController.js      # NEW
│   │   ├── depositController.js     # NEW
│   │   ├── recurringBillController.js  # NEW
│   │   └── bankAccountController.js    # NEW
│   ├── middleware/       # Middleware functions
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Category.js
│   │   ├── Budget.js
│   │   ├── Goal.js
│   │   ├── Rental.js                # NEW
│   │   ├── Salary.js                # NEW
│   │   ├── Expense.js               # NEW
│   │   ├── Deposit.js               # NEW
│   │   ├── Saving.js                # NEW
│   │   ├── RecurringBill.js         # NEW
│   │   └── BankAccount.js           # NEW
│   ├── routes/          # API & View routes
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── rentalRoutes.js          # NEW
│   │   ├── salaryRoutes.js          # NEW
│   │   ├── expenseRoutes.js         # NEW
│   │   ├── excelRoutes.js           # NEW
│   │   ├── savingRoutes.js          # NEW
│   │   ├── depositRoutes.js         # NEW
│   │   ├── recurringBillRoutes.js   # NEW
│   │   ├── bankAccountRoutes.js     # NEW
│   │   └── viewRoutes.js            # NEW - Web UI routes
│   ├── utils/           # Utility functions
│   │   ├── helpers.js
│   │   └── excelParser.js           # NEW
│   └── index.js         # Application entry point
├── views/               # EJS templates (NEW)
│   ├── partials/
│   │   ├── header.ejs
│   │   ├── footer.ejs
│   │   └── sidebar.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── rentals.ejs
│   ├── salaries.ejs
│   ├── expenses.ejs
│   ├── excel.ejs
│   ├── savings.ejs
│   ├── deposits.ejs
│   ├── recurring-bills.ejs
│   └── settings.ejs
├── tests/               # Test files
├── docs/                # Documentation
├── public/              # Static assets (CSS, JS, images)
│   ├── css/
│   │   ├── style.css
│   │   ├── login.css
│   │   └── dashboard.css            # NEW
│   └── js/
│       ├── main.js
│       ├── auth.js                  # NEW
│       ├── login.js                 # NEW
│       ├── register.js              # NEW
│       ├── dashboard.js             # NEW
│       └── excel.js                 # NEW
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── LICENSE
└── README.md
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🛠️ Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with hot reload
npm test           # Run tests
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 📈 Hướng phát triển mở rộng / Future Development

### Phiên bản Premium / Premium Version

- 🔮 Tích hợp AI cố vấn tài chính cá nhân / Personal AI financial advisor integration
- 📈 Dự báo chi tiêu và thu nhập / Expense and income forecasting
- 📊 Báo cáo chi tiết hơn / More detailed reports

### Cộng đồng / Community

- 👥 Chia sẻ mẹo tiết kiệm / Share saving tips
- 💡 Kế hoạch đầu tư nhỏ / Small investment plans
- 🏆 Bảng xếp hạng tiết kiệm / Savings leaderboard

### Tích hợp Fintech / Fintech Integration

- 🏦 Kết nối ví điện tử (MoMo, ZaloPay, VNPay) / E-wallet integration
- 💳 Kết nối ngân hàng / Bank integration
- ₿ Crypto wallet support

### Gamification

- 🎮 Thưởng huy hiệu khi đạt mục tiêu tiết kiệm / Achievement badges for savings goals
- ⭐ Điểm thưởng và cấp độ / Points and levels
- 🎯 Thử thách tiết kiệm / Savings challenges

## 🤝 Đóng góp / Contributing

Chúng tôi hoan nghênh mọi đóng góp! Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết.

We welcome all contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📝 License

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Tác giả / Author

**Nguyễn Hữu Quý**

- GitHub: [@nguyenquy0710](https://github.com/nguyenquy0710)

## 🙏 Lời cảm ơn / Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- All contributors and supporters

## 📞 Liên hệ / Contact

Nếu bạn có bất kỳ câu hỏi nào, vui lòng mở một issue hoặc liên hệ qua email.

If you have any questions, please open an issue or contact via email.

---

Made with ❤️ in Vietnam
