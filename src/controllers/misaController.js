const config = require('../config/config');
const Salary = require('../models/Salary');
const Expense = require('../models/Expense');

const misaDomain = require('../domains/misa/misaDomain');

/**
 * Helper function to make HTTP requests to MISA API
 */
const makeMisaRequest = async (url, method = 'GET', headers = {}, body = null) => {
  const options = {
    method,
    headers: {
      accept: 'application/json, text/plain, */*',
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
    return misaDomain.loginForWeb(req, res, next);
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
      authorization: `Bearer ${misaToken}`
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
    const {
      misaToken,
      searchText = '',
      walletType = null,
      inActive = null,
      excludeReport = null,
      skip = 0,
      take = 10
    } = req.body;

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

    const result = await makeMisaRequest(
      url,
      'POST',
      {
        authorization: `Bearer ${misaToken}`
      },
      requestBody
    );

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
    const {
      misaToken,
      searchText = '',
      walletType = null,
      inActive = null,
      excludeReport = null
    } = req.body;

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

    const result = await makeMisaRequest(
      url,
      'POST',
      {
        authorization: `Bearer ${misaToken}`
      },
      requestBody
    );

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
      authorization: `Bearer ${misaToken}`
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

// @desc    Search MISA transactions (income/expense)
// @route   POST /api/misa/transactions/search
// @access  Private
exports.searchTransactions = async (req, res, next) => {
  try {
    const {
      misaToken,
      fromDate,
      toDate,
      transactionType = null, // 0 = expense, 1 = income, null = all
      searchText = '',
      walletAccountIds = null,
      categoryIds = null,
      skip = 0,
      take = 20
    } = req.body;

    if (!misaToken) {
      return res.status(400).json({
        success: false,
        message: 'MISA token is required'
      });
    }

    const url = `${config.externalAPIs.misa.businessURL}/transactions`;
    const requestBody = {
      fromDate,
      toDate,
      transactionType,
      searchText,
      walletAccountIds,
      categoryIds,
      skip,
      take
    };

    const result = await makeMisaRequest(
      url,
      'POST',
      {
        authorization: `Bearer ${misaToken}`
      },
      requestBody
    );

    if (!result.ok) {
      return res.status(result.status).json({
        success: false,
        message: 'Failed to search transactions',
        data: result.data
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: result.data
    });
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

    if (!misaToken) {
      return res.status(400).json({
        success: false,
        message: 'MISA token is required'
      });
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transactions array is required'
      });
    }

    const userId = req.userId;
    const importedRecords = [];
    const errors = [];
    const skipped = [];

    for (const transaction of transactions) {
      try {
        // Convert MISA transaction to Salary record
        const transactionDate = new Date(transaction.transactionDate || transaction.date);
        const amount = transaction.amount || transaction.totalAmount || 0;

        // Use the first day of the month for grouping
        const month = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1);

        // Check if salary record already exists for this month
        let salaryRecord = await Salary.findOne({ userId, month });

        if (salaryRecord) {
          // Check for duplicate by comparing amount and date (prevent double import)
          const isDuplicate =
            (salaryRecord.notes && salaryRecord.notes.includes(`MISA-${transaction.id}`)) ||
            (salaryRecord.receiveDate &&
              Math.abs(new Date(salaryRecord.receiveDate).getTime() - transactionDate.getTime()) <
                86400000 &&
              salaryRecord.freelance.other === amount);

          if (isDuplicate) {
            skipped.push({
              transactionId: transaction.id || transaction._id,
              reason: 'Duplicate transaction detected',
              amount,
              month
            });
            continue;
          }

          // Update freelance income
          salaryRecord.freelance.other += amount;
          salaryRecord.freelance.total =
            salaryRecord.freelance.dakiatech + salaryRecord.freelance.other;
          salaryRecord.totalIncome = salaryRecord.totalCompanySalary + salaryRecord.freelance.total;

          // Add note to track imported transaction
          const importNote = `\nImported from MISA - Transaction ID: ${transaction.id || 'N/A'} - Date: ${transactionDate.toISOString().split('T')[0]}`;
          salaryRecord.notes = salaryRecord.notes ? salaryRecord.notes + importNote : importNote;
        } else {
          // Create new salary record
          salaryRecord = new Salary({
            userId,
            month,
            freelance: {
              dakiatech: 0,
              other: amount,
              total: amount
            },
            totalIncome: amount,
            receiveDate: transactionDate,
            notes: `Imported from MISA - Transaction ID: ${transaction.id || 'N/A'} - ${transaction.note || ''}`
          });
        }

        await salaryRecord.save();
        importedRecords.push({
          transactionId: transaction.id || transaction._id,
          salaryId: salaryRecord._id,
          amount,
          month
        });
      } catch (error) {
        errors.push({
          transaction: transaction.id || transaction._id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Imported ${importedRecords.length} income transactions${skipped.length > 0 ? `, skipped ${skipped.length} duplicates` : ''}`,
      data: {
        imported: importedRecords,
        skipped: skipped.length > 0 ? skipped : undefined,
        errors: errors.length > 0 ? errors : undefined
      }
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

    if (!misaToken) {
      return res.status(400).json({
        success: false,
        message: 'MISA token is required'
      });
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Transactions array is required'
      });
    }

    const userId = req.userId;
    const importedRecords = [];
    const errors = [];
    const skipped = [];

    for (const transaction of transactions) {
      try {
        // Convert MISA transaction to Expense record
        const transactionDate = new Date(transaction.transactionDate || transaction.date);
        const amount = transaction.amount || transaction.totalAmount || 0;
        const category = transaction.category?.name || transaction.categoryName || 'Other';
        const itemName = transaction.note || transaction.description || 'MISA imported expense';
        const transactionId = transaction.id || transaction._id || 'N/A';

        // Use the first day of the month for grouping
        const month = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1);

        // Check for duplicate transaction
        const existingExpense = await Expense.findOne({
          userId,
          source: 'MISA',
          notes: { $regex: `Transaction ID: ${transactionId}` }
        });

        if (existingExpense) {
          skipped.push({
            transactionId,
            reason: 'Duplicate transaction detected',
            amount,
            category
          });
          continue;
        }

        // Create expense record with default allocation
        const expenseRecord = new Expense({
          userId,
          month,
          category,
          itemName,
          quantity: 1,
          unitPrice: amount,
          totalAmount: amount,
          allocation: {
            nec: amount, // Default to NEC (Nhu cầu thiết yếu)
            motherGift: 0,
            ffa: 0,
            educ: 0,
            play: 0,
            give: 0,
            lts: 0
          },
          source: 'MISA',
          notes: `Imported from MISA Money Keeper - Transaction ID: ${transactionId} - Date: ${transactionDate.toISOString().split('T')[0]}`
        });

        await expenseRecord.save();
        importedRecords.push({
          transactionId,
          expenseId: expenseRecord._id,
          amount,
          month,
          category
        });
      } catch (error) {
        errors.push({
          transaction: transaction.id || transaction._id,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Imported ${importedRecords.length} expense transactions${skipped.length > 0 ? `, skipped ${skipped.length} duplicates` : ''}`,
      data: {
        imported: importedRecords,
        skipped: skipped.length > 0 ? skipped : undefined,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    next(error);
  }
};
