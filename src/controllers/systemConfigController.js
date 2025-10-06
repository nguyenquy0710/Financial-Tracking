const SystemConfig = require('../models/SystemConfig');
const config = require('../config/config');

/**
 * Helper function to make HTTP requests to MISA API
 */
const makeMisaRequest = async (url, method = 'GET', headers = {}, body = null) => {
  const options = {
    method,
    headers: {
      'accept': 'application/json, text/plain, */*',
      'content-type': 'application/json',
      ...headers
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  return {
    status: response.status,
    ok: response.ok,
    data
  };
};

// @desc    Get system configuration for current user
// @route   GET /api/system-config
// @access  Private
exports.getSystemConfig = async (req, res, next) => {
  try {
    let systemConfig = await SystemConfig.findOne({ userId: req.user._id });

    if (!systemConfig) {
      // Return empty config if not exists
      return res.status(200).json({
        success: true,
        data: {
          misa: {
            username: null,
            isConfigured: false,
            lastValidated: null
          }
        }
      });
    }

    res.status(200).json({
      success: true,
      data: systemConfig.getSafeConfig()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Update MISA configuration
// @route   POST /api/system-config/misa
// @access  Private
exports.saveMisaConfig = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username và Password là bắt buộc'
      });
    }

    // Validate credentials by attempting to login
    const url = config.externalAPIs.misa.authURL;
    const result = await makeMisaRequest(url, 'POST', {}, {
      UserName: username,
      Password: password
    });

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin đăng nhập MISA không hợp lệ. Vui lòng kiểm tra lại username và password.',
        validationFailed: true
      });
    }

    // Find or create system config for user
    let systemConfig = await SystemConfig.findOne({ userId: req.user._id });

    if (systemConfig) {
      // Update existing config
      systemConfig.misa.username = username;
      systemConfig.misa.password = password;
      systemConfig.misa.isConfigured = true;
      systemConfig.misa.lastValidated = new Date();
    } else {
      // Create new config
      systemConfig = new SystemConfig({
        userId: req.user._id,
        misa: {
          username,
          password,
          isConfigured: true,
          lastValidated: new Date()
        }
      });
    }

    await systemConfig.save();

    res.status(200).json({
      success: true,
      message: 'Cấu hình MISA đã được lưu thành công',
      data: systemConfig.getSafeConfig()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test MISA credentials
// @route   POST /api/system-config/misa/test
// @access  Private
exports.testMisaConfig = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username và Password là bắt buộc'
      });
    }

    // Test credentials by attempting to login
    const url = config.externalAPIs.misa.authURL;
    const result = await makeMisaRequest(url, 'POST', {}, {
      UserName: username,
      Password: password
    });

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin đăng nhập MISA không hợp lệ',
        valid: false
      });
    }

    res.status(200).json({
      success: true,
      message: 'Thông tin đăng nhập MISA hợp lệ',
      valid: true,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete MISA configuration
// @route   DELETE /api/system-config/misa
// @access  Private
exports.deleteMisaConfig = async (req, res, next) => {
  try {
    const systemConfig = await SystemConfig.findOne({ userId: req.user._id });

    if (!systemConfig) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cấu hình MISA'
      });
    }

    // Clear MISA config
    systemConfig.misa = {
      username: null,
      password: null,
      isConfigured: false,
      lastValidated: null
    };

    await systemConfig.save();

    res.status(200).json({
      success: true,
      message: 'Đã xóa cấu hình MISA',
      data: systemConfig.getSafeConfig()
    });
  } catch (error) {
    next(error);
  }
};
