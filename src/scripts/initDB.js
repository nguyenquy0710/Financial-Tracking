require('dotenv').config();
const connectDB = require('../config/database');
const { initializeDefaultCategories } = require('./category.initialize');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Connect to database
    await connectDB();

    // Initialize default categories
    await initializeDefaultCategories();

    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
