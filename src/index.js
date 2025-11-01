require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');

// Import configuration and utilities
const { default: config } = require('./config/config');
const { default: connectDB } = require('./config/database');
const swaggerSpec = require('./config/swagger');
const { morganAccessStream } = require('./utils/logger');

// Import custom middleware
const errorHandler = require('./middleware/errorHandler');
const { default: customMiddleware } = require('./middleware');

// Import routes modules
const { ROUTE_PREFIX, API_ROUTE_PREFIX } = require('./constants/route_prefix.constant');
const { X_REQUEST_ID, X_DEVICE_ID } = require('./constants/app_key_config.constant');
const { default: viewRoutes } = require('./routes/view.route');

// Initialize app
const app = express();

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('trust proxy', true); // Trust proxy headers (if behind a proxy)

// ================ Database Connection ================ //
// Connect to database
connectDB();

// ================ Middleware Setup ================ //
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
        'https://cdnjs.cloudflare.com',
        'https://challenges.cloudflare.com' // Cloudflare Turnstile
      ],
      styleSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com'
      ],
      fontSrc: [
        '\'self\'',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net'
      ],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      connectSrc: [
        '\'self\'',
        'https://challenges.cloudflare.com' // Cloudflare Turnstile API
      ],
      frameSrc: [
        '\'self\'',
        'https://challenges.cloudflare.com' // Cloudflare Turnstile iframe
      ],
      frameAncestors: ['\'self\'']
    }
  }
})); // Security headers
app.use(cors(config.cors)); // CORS
app.use(
  compression({
    threshold: 1024, // chỉ nén response >1KB
    level: 6, // mức nén gzip (1–9, 9 là mạnh nhất)
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    }
  })
); // Compress responses
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded
app.use(cookieParser()); // Parse cookies
app.use(customMiddleware()); // <-- middleware ở đây

// ================ Static Files ================ //
// Serve static files from 'public' directory
app.use(express.static('public'));

// ================ Logging ================ //
// ⚙️ Kích hoạt Morgan với luồng ghi log xoay
morgan.token('deviceId', (req) => req.headers?.[X_DEVICE_ID] || '-');
morgan.token('requestId', (req) => req.headers?.[X_REQUEST_ID] || req.requestId || '-');

if (config.server.env === 'development') {
  // In log ra console + ghi vào file access.log
  app.use(morgan('dev', { stream: morganAccessStream }));
} else {
  // Chỉ ghi log vào file access.log
  app.use(morgan('combined', { stream: morganAccessStream }));
}

// ================ Web App Routes ================ //
app.use(ROUTE_PREFIX.BASE, viewRoutes); // Main web app routes (removed welcome route)

// ================ Swagger Documentation ================ //
app.use(
  API_ROUTE_PREFIX.SWAGGER,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FinTrack API Documentation'
  })
);

// Swagger JSON
app.get(API_ROUTE_PREFIX.SWAGGER_JSON, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ================ Additional Routes ================ //
// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: `Server is healthy - ${config.server.env} mode`,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Welcome route - Now removed as root is handled by viewRoutes

// ================ Error Handling ================ //
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// ================ Start Server ================ //
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

  // Log Turnstile keys for verification
  console.log("🚀 QuyNH: config.turnstile.siteKey:", config.turnstile.siteKey);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
