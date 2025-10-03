module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fintrack-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
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

  // Default Categories (will be created on first run)
  defaultCategories: {
    expense: [
      {
        name: 'Food & Dining',
        nameVi: 'Ăn uống',
        icon: '🍽️',
        keywords: ['food', 'restaurant', 'cafe', 'ăn', 'quán']
      },
      {
        name: 'Transportation',
        nameVi: 'Di chuyển',
        icon: '🚗',
        keywords: ['taxi', 'bus', 'fuel', 'xe', 'xăng']
      },
      {
        name: 'Shopping',
        nameVi: 'Mua sắm',
        icon: '🛍️',
        keywords: ['shopping', 'clothes', 'mua', 'quần áo']
      },
      {
        name: 'Entertainment',
        nameVi: 'Giải trí',
        icon: '🎬',
        keywords: ['movie', 'game', 'phim', 'game']
      },
      {
        name: 'Healthcare',
        nameVi: 'Sức khỏe',
        icon: '🏥',
        keywords: ['doctor', 'medicine', 'bác sĩ', 'thuốc']
      },
      {
        name: 'Education',
        nameVi: 'Giáo dục',
        icon: '📚',
        keywords: ['school', 'course', 'book', 'học', 'sách']
      },
      {
        name: 'Utilities',
        nameVi: 'Tiện ích',
        icon: '💡',
        keywords: ['electric', 'water', 'internet', 'điện', 'nước']
      },
      {
        name: 'Housing',
        nameVi: 'Nhà ở',
        icon: '🏠',
        keywords: ['rent', 'mortgage', 'thuê nhà', 'nhà']
      },
      { name: 'Other', nameVi: 'Khác', icon: '💰', keywords: ['other', 'misc', 'khác'] }
    ],
    income: [
      { name: 'Salary', nameVi: 'Lương', icon: '💼', keywords: ['salary', 'wage', 'lương'] },
      {
        name: 'Business',
        nameVi: 'Kinh doanh',
        icon: '📈',
        keywords: ['business', 'profit', 'kinh doanh']
      },
      {
        name: 'Investment',
        nameVi: 'Đầu tư',
        icon: '💹',
        keywords: ['investment', 'dividend', 'đầu tư']
      },
      { name: 'Gift', nameVi: 'Quà tặng', icon: '🎁', keywords: ['gift', 'bonus', 'quà'] },
      { name: 'Other Income', nameVi: 'Thu nhập khác', icon: '💰', keywords: ['other', 'khác'] }
    ]
  }
};
