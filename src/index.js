require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const excelRoutes = require('./routes/excelRoutes');
const savingRoutes = require('./routes/savingRoutes');
const depositRoutes = require('./routes/depositRoutes');
const recurringBillRoutes = require('./routes/recurringBillRoutes');
const bankAccountRoutes = require('./routes/bankAccountRoutes');
const viewRoutes = require('./routes/viewRoutes');

// Initialize app
const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Connect to database
connectDB();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'https://code.jquery.com',
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com'
      ],
      styleSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com'
      ],
      fontSrc: [
        '\'self\'',
        'https://cdnjs.cloudflare.com'
      ],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: ['\'self\'']
    }
  }
})); // Security headers
app.use(cors(config.cors)); // CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded

// Serve static files
app.use(express.static('public'));

// Logging
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FinTrack API Documentation'
}));

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Web UI Routes - Must come before API routes
app.use('/', viewRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/recurring-bills', recurringBillRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FinTrack API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Welcome route - Now removed as root is handled by viewRoutes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   FinTrack - Smart Financial Companion Platform           ║
║   Người bạn đồng hành tài chính thông minh                ║
║                                                           ║
║   Server running on port ${PORT}                          ║
║   Environment: ${config.server.env}                       ║
║   WebApp: http://localhost:${PORT}                        ║
║   API Documentation: http://localhost:${PORT}/api-docs    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
