
const { misaDomain } = require("@/domains/misa.domain");

// @desc    Login to MISA Money Keeper
// @route   POST /api/misa/login
// @access  Private
exports.loginForWeb = async (req, res, next) => {
  try {
    const { UserName, Password } = req.body;
    const result = await misaDomain.login(UserName, Password);
    if (!result.ok) return res.status(result.status).json({ success: false, message: 'Login failed', data: result.data });
    res.status(200).json({ success: true, message: 'Login successful', data: result.data });
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
    const result = await misaDomain.getUsers(misaToken);
    if (!result.ok) return res.status(result.status).json({ success: false, message: 'Failed', data: result.data });
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get MISA wallet accounts
// @route   POST /api/misa/wallets/accounts
// @access  Private
exports.getWalletAccounts = async (req, res, next) => {
  try {
    const { misaToken, ...rest } = req.body;
    const result = await misaDomain.getWalletAccounts(misaToken, rest);
    if (!result.ok) return res.status(result.status).json({ success: false, data: result.data });
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get MISA wallet account summary
// @route   POST /api/misa/wallets/summary
// @access  Private
exports.getWalletAccountSummary = async (req, res, next) => {
  try {
    const { misaToken, ...rest } = req.body;
    const result = await misaDomain.getWalletSummary(misaToken, rest);
    if (!result.ok) return res.status(result.status).json({ success: false, data: result.data });
    res.status(200).json({ success: true, data: result.data });
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
    const result = await misaDomain.getTransactionAddresses(misaToken);
    if (!result.ok) return res.status(result.status).json({ success: false, data: result.data });
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    next(error);
  }
};

// @desc    Search MISA transactions (income/expense)
// @route   POST /api/misa/transactions/search
// @access  Private
exports.searchTransactions = async (req, res, next) => {
  try {
    const { misaToken, ...body } = req.body;
    const result = await misaDomain.searchTransactions(misaToken, body);
    if (!result.ok) return res.status(result.status).json({ success: false, data: result.data });
    res.status(200).json({ success: true, data: result.data });
  } catch (error) {
    next(error);
  }
};

// @desc    Import MISA income transactions to Salary records
// @route   POST /api/misa/transactions/import/income
// @access  Private
exports.importIncomeTransactions = async (req, res, next) => {
  try {
    const { misaToken, transactions } = req.body;
    const userId = req.userId;
    const result = await misaDomain.importIncomeTransactions(userId, misaToken, transactions);

    res.status(200).json({
      success: true,
      message: `Imported ${result.imported.length}, skipped ${result.skipped.length}, errors ${result.errors.length}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import MISA expense transactions to Expense records
// @route   POST /api/misa/transactions/import/expense
// @access  Private
exports.importExpenseTransactions = async (req, res, next) => {
  try {
    const { misaToken, transactions } = req.body;
    const userId = req.userId;
    const result = await misaDomain.importExpenseTransactions(userId, misaToken, transactions);

    res.status(200).json({
      success: true,
      message: `Imported ${result.imported.length}, skipped ${result.skipped.length}, errors ${result.errors.length}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
