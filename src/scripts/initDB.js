require('dotenv').config();
const connectDB = require('../config/database');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Connect to database
    await connectDB();

    // Initialize default categories
    console.log("🚀 QuyNH: initializeDatabase -> initializeDefaultCategories");
    await (await require('./category.initialize')).initializeDefaultCategories().catch(err => {
      console.error('✗ Error initializing default categories:', err);
    });

    // Initialize default system configurations
    console.log("🚀 QuyNH: initializeDatabase -> initializeDefaultSystemConfigs");
    await (await require('./system-config.initialize')).initializeDefaultSystemConfigs().catch(err => {
      console.error('✗ Error initializing default system configurations:', err);
    });

    // Initialize default user configurations
    // console.log("🚀 QuyNH: initializeDatabase -> initializeDefaultUserConfigs");
    // await (await require('./user-config.initialize')).initializeDefaultUserConfigs().catch(err => {
    //   console.error('✗ Error initializing default user configurations:', err);
    // });

    // Initialize default data for user QuyNH
    console.log("🚀 QuyNH: initializeDatabase -> initializeDefaultDataUserQuyNH");
    await (await require('./data.quynh.initialize')).initializeDefaultDataUserQuyNH().catch(err => {
      console.error('✗ Error initializing default data for user QuyNH:', err);
    });

    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
