const { misaDomain } = require("@/domains/misa.domain");
const { default: UserConfig } = require('@/models/userConfig.model');
const { default: MoneyKeeperWallet } = require('@/models/moneyKeeperWallet.model');
const { ConfigStatus } = require("@/config/enums");

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

    // Attempt to login
    const loginResult = await misaDomain.loginForWeb(username, password);
    console.log("🚀 QuyNH: exports.validateAndFetchWallets -> loginResult", loginResult);

    if (!loginResult.ok || !loginResult.data.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin đăng nhập Money Keeper không hợp lệ. Vui lòng kiểm tra lại username và password.',
        validationFailed: true
      });
    }

    const token = loginResult.data.accessToken;

    // Fetch wallets list
    const walletsResult = await misaDomain.getWalletAccounts(token, {
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
    const loginResult = await misaDomain.loginForWeb(username, password);

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
    await userConfig.upsertMisaConfig({
      username: username,
      password: password,
      accessToken: loginResult.data.accessToken,
      refreshToken: loginResult.data.refreshToken,
      userMisaId: loginResult.data.userMisaId,
      userMoneyKeeperId: loginResult.data.userMoneyKeeperId,
      sessionMoneyKeeperId: loginResult.data.sessionMoneyKeeperId,

      isDefault: true,
      isActive: true,
      lastValidated: new Date(),
      validationStatus: ConfigStatus.ACTIVE,
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

/**
 * @desc    Sync wallets from Money Keeper
 * @route   POST /api/money-keeper/sync/wallets
 * @access  Private
 */
exports.syncWallets = async (req, res, next) => {
  try {
    // Get user's Money Keeper configuration
    const userConfig = await UserConfig.findOne({ userId: req.userId });

    if (!userConfig || !userConfig.misa || userConfig.misa.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cấu hình Money Keeper trước khi đồng bộ'
      });
    }

    // Get active MISA config
    const activeMisaConfig = userConfig.misa.find(config => config.isActive && config.isConfigured);

    if (!activeMisaConfig) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy cấu hình Money Keeper hoạt động'
      });
    }

    // Login to get token
    const loginResult = await misaDomain.loginForWeb(
      activeMisaConfig.username,
      req.body.password || '' // Password from request body
    );

    if (!loginResult.ok || !loginResult.data.accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Không thể đăng nhập Money Keeper. Vui lòng kiểm tra lại mật khẩu.'
      });
    }

    const token = loginResult.data.accessToken;

    // Fetch wallets from Money Keeper
    const walletsResult = await misaDomain.getWalletAccounts(token, {
      searchText: '',
      walletType: null,
      inActive: null,
      excludeReport: null,
      skip: 0,
      take: 100
    });

    if (!walletsResult.ok || !walletsResult.data) {
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy danh sách ví từ Money Keeper'
      });
    }

    const wallets = walletsResult.data;
    const syncResults = {
      total: wallets.length,
      synced: 0,
      updated: 0,
      created: 0,
      errors: []
    };

    // Sync each wallet
    for (const wallet of wallets) {
      try {
        const existingWallet = await MoneyKeeperWallet.findOne({
          userId: req.userId,
          walletId: wallet.walletId
        });

        await MoneyKeeperWallet.syncWallet(req.userId, wallet);

        if (existingWallet) {
          syncResults.updated++;
        } else {
          syncResults.created++;
        }
        syncResults.synced++;
      } catch (error) {
        syncResults.errors.push({
          walletId: wallet.walletId,
          walletName: wallet.walletName,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Đã đồng bộ ${syncResults.synced}/${syncResults.total} ví`,
      data: syncResults
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get synced wallets from database
 * @route   GET /api/money-keeper/wallets
 * @access  Private
 */
exports.getWallets = async (req, res, next) => {
  try {
    const wallets = await MoneyKeeperWallet.findByUserId(req.userId);

    res.status(200).json({
      success: true,
      count: wallets.length,
      data: wallets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get wallet summary
 * @route   GET /api/money-keeper/wallets/summary
 * @access  Private
 */
exports.getWalletSummary = async (req, res, next) => {
  try {
    const summary = await MoneyKeeperWallet.getWalletSummary(req.userId);

    // Calculate total
    const total = summary.reduce((acc, item) => acc + item.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        byType: summary,
        total,
        count: summary.reduce((acc, item) => acc + item.count, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};
