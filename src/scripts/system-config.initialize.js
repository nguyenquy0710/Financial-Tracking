const UserConfig = require('../models/UserConfig');

// Default user configurations to be initialized
const defaultUserConfigs = {
  currency: 'USD',
};

module.exports = {
  /** Default user configurations for the system */
  defaultUserConfigs: defaultUserConfigs,

  /**
   * Initialize default user configurations
   */
  initializeDefaultUserConfigs: async function initializeDefaultUserConfigs() {
    try {
      // Check if default configurations already exist
      const existingConfigs = await UserConfig.countDocuments({ isDefault: true });
      if (existingConfigs > 0) {
        console.log('✓ Default user configurations already initialized');
        return;
      }

      // Create default configurations
      const configsToInsert = Object.entries(defaultUserConfigs).map(([key, value]) => ({
        key,
        value,
        isDefault: true,
        userId: null,
      }));
      await UserConfig.insertMany(configsToInsert);
      console.log('✓ Default user configurations initialized successfully');
    } catch (error) {
      console.error('✗ Error initializing default user configurations:', error);
    }
  },

};
