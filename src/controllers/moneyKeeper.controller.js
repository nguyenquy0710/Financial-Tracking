const { misaDomain } = require('@/domains/misa.domain');
const { default: UserConfig } = require('@/models/userConfig.model');

/**
 * @desc    Validate Money Keeper credentials and fetch wallets
 * @route   POST /api/money-keeper/validate
 * @access  Private
 */
exports.validateAndFetchWallets = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username và Password là bắt buộc'
      });
    }

    // Create a new instance to avoid storing credentials in the global instance
    const tempMisaDomain = new (require('@/domains/misa.domain').default)();
    
    // Attempt to login
    const loginResult = await tempMisaDomain.loginForWeb(username, password);

    if (!loginResult.ok || !loginResult.data.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập Money Keeper không hợp lệ. Vui lòng kiểm tra lại username và password.',
        validationFailed: true
      });
    }

    const token = loginResult.data.accessToken;

    // Fetch wallets list
    const walletsResult = await tempMisaDomain.getWalletAccounts(token, {
      searchText: '',
      walletType: null,
      inActive: null,
      excludeReport: null,
      skip: 0,
      take: 100 // Get all wallets
    });

    if (!walletsResult.ok) {
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách ví. Vui lòng thử lại.',
        data: walletsResult.data
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xác thực thành công',
      data: {
        validated: true,
        wallets: walletsResult.data
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save Money Keeper configuration for user
 * @route   POST /api/money-keeper/config
 * @access  Private
 */
exports.saveConfig = async (req, res, next) => {
  try {
    const { username, password, selectedWallets } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username và Password là bắt buộc'
      });
    }

    // Validate credentials first
    const tempMisaDomain = new (require('@/domains/misa.domain').default)();
    const loginResult = await tempMisaDomain.loginForWeb(username, password);

    if (!loginResult.ok || !loginResult.data.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập Money Keeper không hợp lệ.',
        validationFailed: true
      });
    }

    // Find or create user config
    let userConfig = await UserConfig.findOne({ userId: req.userId });

    if (!userConfig) {
      userConfig = new UserConfig({
        userId: req.userId,
        misa: []
      });
    }

    // Add or update MISA config
    await userConfig.addMisaConfig({
      username,
      password,
      lastValidated: new Date(),
      validationStatus: 'active',
      errorMessage: undefined
    });

    res.status(200).json({
      success: true,
      message: 'Cấu hình Money Keeper đã được lưu thành công',
      data: {
        configured: true,
        username,
        selectedWallets: selectedWallets || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Money Keeper configuration for current user
 * @route   GET /api/money-keeper/config
 * @access  Private
 */
exports.getConfig = async (req, res, next) => {
  try {
    const userConfig = await UserConfig.findOne({ userId: req.userId });

    if (!userConfig || !userConfig.misa || userConfig.misa.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          configured: false,
          username: null
        }
      });
    }

    // Get the active MISA config
    const activeMisaConfig = userConfig.misa.find(config => config.isActive && config.isConfigured);

    if (!activeMisaConfig) {
      return res.status(200).json({
        success: true,
        data: {
          configured: false,
          username: null
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        configured: true,
        username: activeMisaConfig.username,
        lastValidated: activeMisaConfig.lastValidated,
        validationStatus: activeMisaConfig.validationStatus
      }
    });
  } catch (error) {
    next(error);
  }
};
