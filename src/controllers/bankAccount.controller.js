
const { default: BankAccount } = require("@/models/bankAccount.model");

// @desc    Get all bank accounts
// @route   GET /api/bank-accounts

// @access  Private
exports.getAllBankAccounts = async (req, res, next) => {
  try {
    const { bank, isActive, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (bank) {
      query.bank = bank;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const accounts = await BankAccount.find(query)
      .sort({ isDefault: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BankAccount.countDocuments(query);

    res.status(200).json({
      success: true,
      data: accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bank account by ID
// @route   GET /api/bank-accounts/:id
// @access  Private
exports.getBankAccountById = async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new bank account
// @route   POST /api/bank-accounts
// @access  Private
exports.createBankAccount = async (req, res, next) => {
  try {
    const accountData = {
      ...req.body,
      userId: req.user._id
    };

    // If this is set as default, unset other defaults
    if (accountData.isDefault) {
      await BankAccount.updateMany({ userId: req.user._id, isDefault: true }, { isDefault: false });
    }

    const account = await BankAccount.create(accountData);

    res.status(201).json({
      success: true,
      data: account,
      message: 'Bank account created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bank account
// @route   PUT /api/bank-accounts/:id
// @access  Private
exports.updateBankAccount = async (req, res, next) => {
  try {
    let account = await BankAccount.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // If setting this as default, unset other defaults
    if (req.body.isDefault === true) {
      await BankAccount.updateMany(
        { userId: req.user._id, isDefault: true, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    account = await BankAccount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: account,
      message: 'Bank account updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bank account
// @route   DELETE /api/bank-accounts/:id
// @access  Private
exports.deleteBankAccount = async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    await BankAccount.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set bank account as default
// @route   PUT /api/bank-accounts/:id/set-default
// @access  Private
exports.setDefaultBankAccount = async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Unset all other defaults
    await BankAccount.updateMany({ userId: req.user._id, isDefault: true }, { isDefault: false });

    // Set this as default
    account.isDefault = true;
    await account.save();

    res.status(200).json({
      success: true,
      data: account,
      message: 'Default bank account set successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get default bank account
// @route   GET /api/bank-accounts/default
// @access  Private
exports.getDefaultBankAccount = async (req, res, next) => {
  try {
    const account = await BankAccount.findOne({
      userId: req.user._id,
      isDefault: true,
      isActive: true
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'No default bank account found'
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    next(error);
  }
};
