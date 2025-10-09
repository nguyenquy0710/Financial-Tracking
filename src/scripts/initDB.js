require('dotenv').config();
const connectDB = require('../config/database');

/**
 * Initialize the database with default structures and data.
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Connect to database
    await connectDB();

    // Initialize default categories
    console.log("🚀 QuyNH: initializeDatabase -> initializeDefaultCategories");
    await (await require('./category.initialize')).initializeDefaultCategories()
      .catch(err => {
        console.error('✗ Error initializing default categories:', err);
      });

    // Initialize default system configurations
    console.log("🚀 QuyNH: initializeDatabase -> initializeDefaultSystemConfigs");
    await (await require('./system-config.initialize')).initializeDefaultSystemConfigs()
      .catch(err => {
        console.error('✗ Error initializing default system configurations:', err);
      });

    // Initialize default user configurations
    // console.log("🚀 QuyNH: initializeDatabase -> initializeDefaultUserConfigs");
    // await (await require('./user-config.initialize')).initializeDefaultUserConfigs().catch(err => {
    //   console.error('✗ Error initializing default user configurations:', err);
    // });

    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

/**
 * Initialize default data for user QuyNH if --data flag is provided in command line arguments.
 */
async function initializeDefaultDataUserQuyNH() {
  try {
    // Initialize default data for user QuyNH
    console.log("🚀 QuyNH: initializeDatabase -> initializeDefaultDataUserQuyNH");
    await (await require('./data.quynh.initialize')).initializeDefaultDataUserQuyNH()
      .catch(err => {
        console.error('✗ Error initializing default data for user QuyNH:', err);
      });
  } catch (error) {
    console.error('✗ Error initializing default data for user QuyNH:', error);
    throw error;
  }
}

// ============================================================================
// Run initialization
initializeDatabase().then(async () => {
  console.log("✅ Cấu trúc DB đã được tạo.");

  // =============================================================================
  // Nếu có tham số --data, khởi tạo dữ liệu mẫu
  // Lấy tham số dòng lệnh
  const args = process.argv.slice(2);

  try {
    if (args.includes('--data')) {
      console.log("✅ Phát hiện tham số --data, đang chạy với dữ liệu mẫu...");

      await initializeDefaultDataUserQuyNH().catch(err => {
        console.error('❌ Lỗi khi khởi tạo dữ liệu mẫu:', err);
        process.exit(1);
      });

      console.log("✅ Khởi tạo dữ liệu mẫu hoàn tất.");
      process.exit(0);
    } else {
      console.log("ℹ️ Không có tham số --data, chỉ tạo cấu trúc DB...");
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Lỗi khi xử lý tham số dòng lệnh:', error);
    process.exit(1);
  }

}).catch(err => {
  console.error('❌ Lỗi khi tạo cấu trúc DB:', err);
  process.exit(1);
});
