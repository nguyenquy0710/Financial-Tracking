const Totp = require('../models/totp.model').default;
const { authenticator } = require('otplib');

/**
 * @desc Get all TOTP accounts for logged-in user
 * @route GET /api/totp
 * @access Private
 */
exports.getTotpAccounts = async (req, res, next) => {
  try {
    const accounts = await Totp.find({ userId: req.userId }).sort({ createdAt: -1 });

    // Include decrypted secrets for client-side TOTP generation
    const accountsWithSecrets = accounts.map(account => {
      const accountObj = account.toObject();
      accountObj.secret = account.getDecryptedSecret();
      accountObj.algorithm = account.algorithm;
      accountObj.digits = account.digits;
      accountObj.period = account.period;
      console.log("🚀 QuyNH: exports.getTotpAccounts -> accountObj", accountObj);
      return accountObj;
    });

    res.json({
      success: true,
      message: 'TOTP accounts retrieved successfully',
      data: accountsWithSecrets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single TOTP account
 * @route GET /api/totp/:id
 * @access Private
 */
exports.getTotpAccount = async (req, res, next) => {
  try {
    // Find account by ID and userId to ensure ownership
    const account = await Totp.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'TOTP account not found'
      });
    }

    // Include decrypted secret and other fields
    const test = account.toObjectCustom();
    console.log("🚀 QuyNH: exports.getTotpAccount -> toObjectCustom", test);

    const accountsWithSecrets = account.toObjectWithSecrets();
    console.log("🚀 QuyNH: exports.getTotpAccount -> toObjectWithSecrets", accountsWithSecrets);

    res.json({
      success: true,
      message: 'TOTP account retrieved successfully',
      data: accountsWithSecrets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Generate current TOTP code for an account
 * @route GET /api/totp/:id/generate
 * @access Private
 */
exports.generateTotpCode = async (req, res, next) => {
  try {
    const account = await Totp.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'TOTP account not found'
      });
    }

    const secret = account.getDecryptedSecret();

    // Configure authenticator with account settings
    authenticator.options = {
      digits: account.digits,
      step: account.period,
      algorithm: account.algorithm.toLowerCase()
    };

    const token = authenticator.generate(secret);
    const timeRemaining = account.period - (Math.floor(Date.now() / 1000) % account.period);

    res.json({
      success: true,
      message: 'TOTP code generated successfully',
      data: {
        token,
        timeRemaining,
        period: account.period
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new TOTP account
 * @route POST /api/totp
 * @access Private
 */
exports.createTotpAccount = async (req, res, next) => {
  try {
    const { serviceName, accountName, secret, issuer, algorithm, digits, period } = req.body;
    console.log("🚀 QuyNH: exports.createTotpAccount -> req.body", req.body);

    // Validate secret format (Base32)
    if (!secret || !/^[A-Z2-7]+$/.test(secret)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid secret key format. Must be Base32 (A-Z and 2-7)'
      });
    }

    // Create new account
    const account = new Totp({
      userId: req.userId,
      serviceName,
      accountName,
      issuer: issuer || serviceName,
      algorithm: algorithm || 'SHA1',
      digits: digits || 6,
      period: period || 30
    });

    // Set encrypted secret
    account.setSecret(secret);

    await account.save();

    res.status(201).json({
      success: true,
      message: 'TOTP account created successfully',
      data: account
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this service name and account name already exists'
      });
    }
    next(error);
  }
};

/**
 * @desc Update TOTP account
 * @route PUT /api/totp/:id
 * @access Private
 */
exports.updateTotpAccount = async (req, res, next) => {
  try {
    const { serviceName, accountName, secret, issuer, algorithm, digits, period } = req.body;

    const account = await Totp.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'TOTP account not found'
      });
    }

    // Update fields
    if (serviceName) account.serviceName = serviceName;
    if (accountName) account.accountName = accountName;
    if (issuer !== undefined) account.issuer = issuer;
    if (algorithm) account.algorithm = algorithm;
    if (digits) account.digits = digits;
    if (period) account.period = period;

    // Update secret if provided
    if (secret) {
      if (!/^[A-Z2-7]+$/.test(secret)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid secret key format. Must be Base32 (A-Z and 2-7)'
        });
      }
      account.setSecret(secret);
    }

    await account.save();

    res.json({
      success: true,
      message: 'TOTP account updated successfully',
      data: account
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete TOTP account
 * @route DELETE /api/totp/:id
 * @access Private
 */
exports.deleteTotpAccount = async (req, res, next) => {
  try {
    const account = await Totp.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'TOTP account not found'
      });
    }

    res.json({
      success: true,
      message: 'TOTP account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
