// src/config/config.ts

export const config = {
  // Application Settings
  app: {
    name: process.env.APP_NAME || 'FinTrack',
    version: process.env.APP_VERSION || '1.0.0',
    description:
      process.env.APP_DESCRIPTION ||
      'FinTrack (Financial Tracking) – Người bạn đồng hành tài chính thông minh - Smart Financial Companion Platform',
    baseURL: process.env.APP_BASE_URL || 'https://fintrack.quyit.id.vn'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fintrack-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // TOTP Encryption Key
  totp: {
    aesAlgorithm: 'aes-256-cbc',
    encryptionKey: process.env.TOTP_ENCRYPTION_KEY || '9f7c1b0d6f2e7c41c6d7c962ff3c9a1bcd3c32f14f6e8e3b5a8e1a4b6d12e9f1',
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fintrack'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg']
  },

  // Pagination Configuration
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  },

  // Budget Alert Configuration
  budget: {
    alertThresholds: [50, 80, 90, 100], // Alert at 50%, 80%, 90%, and 100%
    checkInterval: 3600000 // Check every hour (in milliseconds)
  },

  // External API Configurations
  externalAPIs: {
    vietQR: {
      clientID: process.env.VIETQR_CLIENT_ID || 'your-client-id',
      apiKey: process.env.VIETQR_API_KEY || 'your-api-key',
      baseURL: 'https://api.vietqr.io/v2'
    },
    misa: {
      baseURL: process.env.MISA_BASE_URL || 'https://moneykeeperapp.misa.vn/g1/api',
      authURL:
        process.env.MISA_AUTH_URL ||
        'https://moneykeeperapp.misa.vn/g1/api/auth/api/v1/auths/loginforweb',
      businessURL:
        process.env.MISA_BUSINESS_URL || 'https://moneykeeperapp.misa.vn/g1/api/business/api/v1'
    }
  },

  // Cloudflare Turnstile Configuration
  turnstile: {
    siteKey: process.env.TURNSTILE_SITE_KEY || '0x4AAAAAAAhLdSdj0baO9odL',
    secretKey: process.env.TURNSTILE_SECRET_KEY || '',
    verifyURL: 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
  }
};

// Export the configuration object
export default config;
