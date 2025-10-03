# FinTrack Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js >= 18.0.0
- MongoDB >= 4.4
- npm >= 9.0.0

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/nguyenquy0710/Financial-Tracking.git
cd Financial-Tracking
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 4. Start MongoDB

#### Option A: Using Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option B: Local MongoDB
Make sure MongoDB is running on your system:
```bash
# On Ubuntu/Debian
sudo systemctl start mongodb

# On macOS (using Homebrew)
brew services start mongodb-community
```

### 5. Initialize Database (Optional)
Initialize default categories:
```bash
npm run init:db
```

### 6. Start the Application

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start at `http://localhost:3000`

## Testing the API

### 1. Check API Health
```bash
curl http://localhost:3000/health
```

### 2. Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "language": "vi",
    "currency": "VND"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response. You'll need it for authenticated requests.

### 4. Get Current User
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Get Categories
```bash
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Create a Transaction
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "amount": 50000,
    "categoryId": "CATEGORY_ID_HERE",
    "description": "Lunch at restaurant",
    "date": "2024-01-15",
    "paymentMethod": "cash"
  }'
```

### 7. Get Transaction Statistics
```bash
curl http://localhost:3000/api/transactions/stats/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Access the Web Interface

Open your browser and navigate to:
```
http://localhost:3000
```

You'll see the FinTrack landing page with:
- Feature showcase
- API documentation
- API health status

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier
- `npm run init:db` - Initialize database with default categories

## Common Issues

### MongoDB Connection Error
**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:** Make sure MongoDB is running. Check with:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB if not running
docker start mongodb
# or
sudo systemctl start mongodb
```

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:** Either kill the process using port 3000 or change the port in `.env`:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 PID

# Or change PORT in .env
PORT=3001
```

### JWT Token Errors
**Error:** `JsonWebTokenError: invalid token`

**Solution:** Make sure you're including the correct token in the Authorization header:
```
Authorization: Bearer YOUR_ACTUAL_TOKEN
```

## Project Structure

```
Financial-Tracking/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   ├── utils/           # Helper functions
│   └── index.js         # Application entry point
├── public/              # Static files (HTML, CSS, JS)
├── tests/               # Test files
├── docs/                # Documentation
└── package.json         # Dependencies and scripts
```

## Next Steps

1. Read the full [API Documentation](API.md)
2. Check the [README](../README.md) for more features
3. Read [Contributing Guidelines](../CONTRIBUTING.md) to contribute
4. Explore the code and customize for your needs

## Support

If you encounter any issues:
1. Check the [Common Issues](#common-issues) section
2. Search existing [GitHub Issues](https://github.com/nguyenquy0710/Financial-Tracking/issues)
3. Create a new issue with detailed information

Happy tracking! 💰
