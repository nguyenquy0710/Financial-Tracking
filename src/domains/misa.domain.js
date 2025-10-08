const config = require('../config/config');
const Salary = require('../models/Salary');
const Expense = require('../models/Expense');

const MISA_CONFIG = config.externalAPIs.misa;

/**
 * Helper function to make HTTP requests to MISA APIs
 * @param {*} url
 * @param {*} method
 * @param {*} headers
 * @param {*} body
 * @returns {Promise<{status: number, ok: boolean, data: any}>} Response object
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

/**
 * MisaDomain class to handle MISA API interactions and data processing
 * @class MisaDomain
 * @property {string} baseURL - Base URL for MISA API
 * @property {string} authURL - Authentication URL for MISA API
 * @property {string} businessURL - Business URL for MISA API
 * @property {string|null} token - Authentication token
 * @property {object|null} userInfo - User information
 * @property {object|null} businessInfo - Business information
 *
 * @method loginForWeb - Login to MISA API
 * @method getUsers - Get MISA user information
 * @method getWalletAccounts - Get MISA wallet accounts
 * @method getWalletSummary - Get MISA wallet account summary
 * @method getTransactionAddresses - Get MISA transaction addresses
 * @method searchTransactions - Search MISA transactions (income/expense)
 * @method importIncomeTransactions - Import MISA income transactions to Salary records
 * @method importExpenseTransactions - Import MISA expense transactions to Expense records
 *
 * @returns {MisaDomain} Instance of MisaDomain class
 * ================== Example Usage =================
 * @example
 * const misaDomain = new MisaDomain();
 * await misaDomain.loginForWeb('username', 'password');
 * const users = await misaDomain.getUsers(misaDomain.token);
 * const accounts = await misaDomain.getWalletAccounts(misaDomain.token, { /* params *\/ });
 * const summary = await misaDomain.getWalletSummary(misaDomain.token, { /* params *\/ });
 * const addresses = await misaDomain.getTransactionAddresses(misaDomain.token);
 * const transactions = await misaDomain.searchTransactions(misaDomain.token, { /* params *\/ });
 * const importResult = await misaDomain.importIncomeTransactions(userId, misaDomain.token, transactions);
 * const expenseImportResult = await misaDomain.importExpenseTransactions(userId, misaDomain.token, transactions);
 */
class MisaDomain {

  constructor() {
    // ================ Configurations =================
    this.baseURL = MISA_CONFIG.baseURL ?? `https://moneykeeperapp.misa.vn/g1/api`;
    this.authURL = MISA_CONFIG.authURL ?? `${this.baseURL}/auth/api/v1/auths/loginforweb`;
    this.businessURL = MISA_CONFIG.businessURL ?? `${this.baseURL}/business/api/v1`;

    // ================ Models =================
    this.token = null; // To store the authentication token
    this.userInfo = null; // To store user information
    this.businessInfo = null; // To store business information
  }

  async getToken() {
    if (!this.token) {
      throw new Error('Not authenticated. Please login first.');
    }

    return this.token;
  }

  /**
   * Login to MISA API for web access
   * @param {*} username
   * @param {*} password
   * @returns {Promise<{success: boolean, token?: string, user?: object, message?: string}>} Response object
   */
  async loginForWeb(username, password) {
    const url = this.authURL ?? MISA_CONFIG.authURL;
    const body = { userName: username, password: password };

    const response = await makeMisaRequest(url, 'POST', {}, body);

    if (response.ok && response.data?.token) {
      this.token = response.data.token;
      this.userInfo = response.data.user || null;
      return {
        success: true,
        token: this.token,
        user: this.userInfo
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Login failed'
      };
    }
  }

  async getUsers(misaToken) {
    const url = `${this.businessURL}/users/true`;
    return await makeMisaRequest(url, 'GET', {
      authorization: `Bearer ${misaToken}`
    });
  }

  async getWalletAccounts(misaToken, body) {
    const url = `${this.businessURL}/wallets/accounts`;
    return await makeMisaRequest(url, 'POST', {
      authorization: `Bearer ${misaToken}`
    }, body);
  }

  async getWalletSummary(misaToken, body) {
    const url = `${this.businessURL}/wallets/account/summary`;
    return await makeMisaRequest(url, 'POST', {
      authorization: `Bearer ${misaToken}`
    }, body);
  }

  async getTransactionAddresses(misaToken) {
    const url = `${this.businessURL}/transactions/addresses`;
    return await makeMisaRequest(url, 'GET', {
      authorization: `Bearer ${misaToken}`
    });
  }

  /**
   * Search MISA transactions (income/expense)
   * @param {*} misaToken MISA authentication token
   * @param {*} body Request body with search parameters
   * @returns {Promise<{status: number, ok: boolean, data: any}>} Response object
   */
  async searchTransactions(misaToken, body) {
    const url = `${this.businessURL}/transactions`;
    return await makeMisaRequest(url, 'POST', {
      authorization: `Bearer ${misaToken}`
    }, body);
  }

  /**
   * Import income transactions from MISA to Salary records in the database
   * @param {*} userId User ID in the local system
   * @param {*} misaToken MISA authentication token
   * @param {*} transactions Array of income transactions from MISA API
   * @returns {Promise<{imported: Array, skipped: Array, errors: Array}>} Result of import operation
   */
  async importIncomeTransactions(userId, misaToken, transactions) {
    const imported = [], skipped = [], errors = [];

    for (const transaction of transactions) {
      try {
        const transactionDate = new Date(transaction.transactionDate || transaction.date);
        const amount = transaction.amount || transaction.totalAmount || 0;
        const month = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1);

        let salaryRecord = await Salary.findOne({ userId, month });

        const transactionId = transaction.id || transaction._id || 'N/A';

        const isDuplicate = salaryRecord &&
          ((salaryRecord.notes || '').includes(`MISA-${transactionId}`) ||
            (salaryRecord.receiveDate &&
              Math.abs(new Date(salaryRecord.receiveDate) - transactionDate) < 86400000 &&
              salaryRecord.freelance.other === amount));

        if (isDuplicate) {
          skipped.push({ transactionId, reason: 'Duplicate', amount });
          continue;
        }

        if (!salaryRecord) {
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
            notes: `Imported from MISA - Transaction ID: ${transactionId}`
          });
        } else {
          salaryRecord.freelance.other += amount;
          salaryRecord.freelance.total = salaryRecord.freelance.dakiatech + salaryRecord.freelance.other;
          salaryRecord.totalIncome = salaryRecord.totalCompanySalary + salaryRecord.freelance.total;
          salaryRecord.notes = (salaryRecord.notes || '') +
            `\nImported from MISA - Transaction ID: ${transactionId} - Date: ${transactionDate.toISOString().split('T')[0]}`;
        }

        await salaryRecord.save();
        imported.push({ transactionId, amount, salaryId: salaryRecord._id });
      } catch (err) {
        errors.push({ transactionId: transaction.id, error: err.message });
      }
    }

    return { imported, skipped, errors };
  }

  /**
   * Import expense transactions from MISA to Expense records in the database
   * @param {*} userId User ID in the local system
   * @param {*} misaToken MISA authentication token
   * @param {*} transactions Array of expense transactions from MISA API
   * @returns {Promise<{imported: Array, skipped: Array, errors: Array}>} Result of import operation
   */
  async importExpenseTransactions(userId, misaToken, transactions) {
    const imported = [], skipped = [], errors = [];

    for (const transaction of transactions) {
      try {
        const transactionDate = new Date(transaction.transactionDate || transaction.date);
        const amount = transaction.amount || transaction.totalAmount || 0;
        const category = transaction.category?.name || transaction.categoryName || 'Other';
        const itemName = transaction.note || transaction.description || 'MISA imported expense';
        const transactionId = transaction.id || transaction._id || 'N/A';
        const month = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1);

        const duplicate = await Expense.findOne({
          userId,
          source: 'MISA',
          notes: { $regex: `Transaction ID: ${transactionId}` }
        });

        if (duplicate) {
          skipped.push({ transactionId, reason: 'Duplicate', amount });
          continue;
        }

        const expenseRecord = new Expense({
          userId,
          month,
          category,
          itemName,
          quantity: 1,
          unitPrice: amount,
          totalAmount: amount,
          allocation: { nec: amount, motherGift: 0, ffa: 0, educ: 0, play: 0, give: 0, lts: 0 },
          source: 'MISA',
          notes: `Imported from MISA - Transaction ID: ${transactionId} - Date: ${transactionDate.toISOString().split('T')[0]}`
        });

        await expenseRecord.save();
        imported.push({ transactionId, amount, expenseId: expenseRecord._id });
      } catch (err) {
        errors.push({ transactionId: transaction.id, error: err.message });
      }
    }

    return { imported, skipped, errors };
  }

}

// ================= Singleton Instance =================
// Singleton instance
MisaDomain.Instance = new MisaDomain();

// ================= Export =================
// Export the class and the singleton instance
module.exports = {
  MisaDomain: MisaDomain,
  misaDomain: MisaDomain.Instance,
};
