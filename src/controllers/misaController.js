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

// @desc    Login to MISA Money Keeper
// @route   POST /api/misa/login
// @access  Private
exports.loginForWeb = async (req, res, next) => {
  try {
    const { UserName, Password } = req.body;

    if (!UserName || !Password) {
      return res.status(400).json({
        success: false,
        message: 'UserName and Password are required'
      });
    }

    const url = config.externalAPIs.misa.authURL;
    const result = await makeMisaRequest(url, 'POST', {}, { UserName, Password });

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: 'MISA login failed',
        data: result.data
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get MISA user information
// @route   GET /api/misa/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const { misaToken } = req.body;

    if (!misaToken) {
      return res.status(400).json({
        success: false,
        message: 'MISA token is required'
      });
    }

    const url = `${config.externalAPIs.misa.businessURL}/users/true`;
    const result = await makeMisaRequest(url, 'GET', {
      'authorization': `Bearer ${misaToken}`
    });

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: 'Failed to get user information',
        data: result.data
      });
    }

    res.status(200).json({
      success: true,
      message: 'User information retrieved successfully',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get MISA wallet accounts
// @route   POST /api/misa/wallets/accounts
// @access  Private
exports.getWalletAccounts = async (req, res, next) => {
  try {
    const { misaToken, searchText = '', walletType = null, inActive = null, excludeReport = null, skip = 0, take = 10 } = req.body;

    if (!misaToken) {
      return res.status(400).json({
        success: false,
        message: 'MISA token is required'
      });
    }

    const url = `${config.externalAPIs.misa.businessURL}/wallets/accounts`;
    const requestBody = {
      searchText,
      walletType,
      inActive,
      excludeReport,
      skip,
      take
    };

    const result = await makeMisaRequest(url, 'POST', {
      'authorization': `Bearer ${misaToken}`
    }, requestBody);

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: 'Failed to get wallet accounts',
        data: result.data
      });
    }

    res.status(200).json({
      success: true,
      message: 'Wallet accounts retrieved successfully',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get MISA wallet account summary
// @route   POST /api/misa/wallets/summary
// @access  Private
exports.getWalletAccountSummary = async (req, res, next) => {
  try {
    const { misaToken, searchText = '', walletType = null, inActive = null, excludeReport = null } = req.body;

    if (!misaToken) {
      return res.status(400).json({
        success: false,
        message: 'MISA token is required'
      });
    }

    const url = `${config.externalAPIs.misa.businessURL}/wallets/account/summary`;
    const requestBody = {
      searchText,
      walletType,
      inActive,
      excludeReport
    };

    const result = await makeMisaRequest(url, 'POST', {
      'authorization': `Bearer ${misaToken}`
    }, requestBody);

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: 'Failed to get wallet account summary',
        data: result.data
      });
    }

    res.status(200).json({
      success: true,
      message: 'Wallet account summary retrieved successfully',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get MISA transaction addresses
// @route   GET /api/misa/transactions/addresses
// @access  Private
exports.getTransactionAddresses = async (req, res, next) => {
  try {
    const { misaToken } = req.body;

    if (!misaToken) {
      return res.status(400).json({
        success: false,
        message: 'MISA token is required'
      });
    }

    const url = `${config.externalAPIs.misa.businessURL}/transactions/addresses`;
    const result = await makeMisaRequest(url, 'GET', {
      'authorization': `Bearer ${misaToken}`
    });

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: 'Failed to get transaction addresses',
        data: result.data
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction addresses retrieved successfully',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};
