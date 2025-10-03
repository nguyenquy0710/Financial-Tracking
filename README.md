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

## 📚 API Documentation

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

## 🏗️ Cấu trúc dự án / Project Structure

```
Financial-Tracking/
├── src/
│   ├── config/           # Cấu hình ứng dụng
│   │   ├── config.js
│   │   └── database.js
│   ├── controllers/      # Business logic
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── categoryController.js
│   │   ├── budgetController.js
│   │   └── goalController.js
│   ├── middleware/       # Middleware functions
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── models/          # Database models
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Category.js
│   │   ├── Budget.js
│   │   └── Goal.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── budgetRoutes.js
│   │   └── goalRoutes.js
│   ├── utils/           # Utility functions
│   │   └── helpers.js
│   └── index.js         # Application entry point
├── tests/               # Test files
├── docs/                # Documentation
├── public/              # Static files
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