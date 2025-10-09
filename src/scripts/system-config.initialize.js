const SystemConfig = require('../models/SystemConfig');

// Default system configurations to be initialized
const defaultSystemConfigs = {
  currency: 'USD',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24',
  decimalSeparator: '.',
  thousandSeparator: ',',
  defaultAccountType: 'checking',
  defaultBudgetPeriod: 'monthly',
  notificationsEnabled: 'true',
  backupFrequency: 'weekly',
  theme: 'light',
  autoLogoutTime: '15', // in minutes
  dataRetentionPeriod: '365', // in days
};

module.exports = {
  /** Default system configurations for the system */
  defaultSystemConfigs: defaultSystemConfigs,

  /**
   * Initialize default system configurations
   */
  initializeDefaultSystemConfigs: async function initializeDefaultSystemConfigs() {
    try {
      // Check if default configurations already exist
      const existingConfigs = await SystemConfig.countDocuments({ isDefault: true });
      if (existingConfigs > 0) {
        console.log('✓ Default system configurations already initialized');
        return;
      }

      // Create default configurations
      const configsToInsert = Object.entries(defaultSystemConfigs)
        .map(([key, value]) => ({
          configName: key,
          configValue: value,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      // Insert all configurations
      await SystemConfig.insertMany([...configsToInsert]);

      console.log('✓ Default system configurations initialized successfully');
    } catch (error) {
      console.error('✗ Error initializing default system configurations:', error);
    }
  },

};
