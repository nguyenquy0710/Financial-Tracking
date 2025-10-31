import Salary from '@/models/salary.model';
import configApp from '../config/config';

import { ImportResult, MisaLoginResponse, MisaResponse, MisaTransaction } from './misa.response.models';
import Expense from '@/models/expense.model';

const MISA_CONFIG = configApp.externalAPIs.misa;

/**
 * Helper function to make HTTP requests to MISA API endpoints
 * Uses Fetch API to perform requests with given method, headers, and body (if any)
 * Parses JSON response and returns structured MisaResponse object
 * @param {string} url - The API endpoint URL
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {Record<string, string>} headers - Request headers
 * @param {any} body - Request body for POST/PUT requests
 * @returns {Promise<MisaResponse<T>>} - Parsed response from MISA API
 * @throws {Error} - Throws error if fetch fails or response is not JSON
 * @example
 * const response = await makeMisaRequest('/api/endpoint', 'POST', { Authorization: 'Bearer token' }, { key: 'value' });
 * if (response.ok) {
 *   console.log('Data:', response.data);
 * } else {
 *   console.error('Error:', response.message);
 * }
 */
async function makeMisaRequest<T>(
  url: string,
  method: string = 'GET',
  headers: Record<string, string> = {},
  body: any = null
): Promise<MisaResponse<T>> {
  const options: RequestInit = {
    method,
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data: any = await response.json();

  const result: MisaResponse<T> = {
    status: response.status,
    ok: response.ok,
    data,
  };
  return result;
}

/**
 * MisaDomain class to interact with MISA APIs and handle business logic
 * Methods include login, fetching user info, transactions, and importing data to DB
 * Uses Mongoose models Salary and Expense for DB operations
 * Handles duplicate checks and error logging during import
 * Maintains state for auth token and user/business info
 * Designed for extensibility to add more MISA API interactions as needed
 * @export
 * @class MisaDomain
 * @example
 * const misaDomain = new MisaDomain();
 * await misaDomain.loginForWeb('username', 'password');
 * const users = await misaDomain.getUsers(misaDomain.token);
 * const transactions = await misaDomain.searchTransactions(misaDomain.token, { ... });
 * await misaDomain.importIncomeTransactions(userId, misaDomain.token, transactions);
 * await misaDomain.importExpenseTransactions(userId, misaDomain.token, transactions);
 * // etc.
 * @see {@link https://moneykeeperapp.misa.vn/developer/docs/api|MISA API Documentation}
 * @see {@link https://mongoosejs.com/docs/models.html|Mongoose Models Documentation}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API|Fetch API Documentation}
 * @see {@link https://nodejs.org/api/globals.html#fetch|Node.js Fetch Documentation}
 * @see {@link https://www.typescriptlang.org/docs/|TypeScript Documentation}
 */
export default class MisaDomain {
  baseURL: string;
  authURL: string;
  businessURL: string;
  token: string | null;
  userInfo: any | null;
  businessInfo: any | null;

  private username: string | null = null;
  private password: string | null = null;

  constructor() {
    this.baseURL = MISA_CONFIG.baseURL ?? 'https://moneykeeperapp.misa.vn/g1/api';
    this.authURL = MISA_CONFIG.authURL ?? `${this.baseURL}/auth/api/v1/auths/loginforweb`;
    this.businessURL = MISA_CONFIG.businessURL ?? `${this.baseURL}/business/api/v1`;

    this.token = null;
    this.userInfo = null;
    this.businessInfo = null;
  }

  async getToken(): Promise<string> {
    if (this.token) return this.token;

    if (!this.username || !this.password) {
      throw new Error('Not authenticated and no credentials stored.');
    }

    const loginResponse = await this.loginForWeb(this.username, this.password);

    if (loginResponse.ok && loginResponse.data.accessToken) {
      return this.token!;
    }

    throw new Error('Re-login failed. Please check credentials.');
  }

  async loginForWeb(username: string, password: string): Promise<MisaResponse<MisaLoginResponse>> {

    // Store credentials for future re-login if needed
    this.username = username;
    this.password = password;

    const url = this.authURL;
    const body = { userName: username, password };

    const response: MisaResponse<MisaLoginResponse> = await makeMisaRequest(url, 'POST', {}, body);

    if (response.ok && response.data.accessToken) {
      this.token = response.data.accessToken;

      return response;
    }

    response.message = 'Login failed. Please check your credentials.';
    return response;
  }

  private async callWithAuth<T>(url: string, method: string = 'GET', body: any = null): Promise<MisaResponse<T>> {
    let token = await this.getToken();
    let response = await makeMisaRequest<T>(url, method, {
      authorization: `Bearer ${token}`
    }, body);

    // Retry once if token is invalid
    if (response.status === 401 && this.username && this.password) {
      await this.loginForWeb(this.username, this.password);
      token = this.token!;
      response = await makeMisaRequest<T>(url, method, {
        authorization: `Bearer ${token}`
      }, body);
    }

    return response;
  }

  async getUsers(): Promise<MisaResponse> {
    const url = `${this.businessURL}/users/true`;
    return await this.callWithAuth(url);
  }

  async getWalletAccounts(misaToken: string, body: any): Promise<MisaResponse> {
    const url = `${this.businessURL}/wallets/accounts`;
    return await makeMisaRequest(url, 'POST', {
      authorization: `Bearer ${misaToken}`,
    }, body);
  }

  async getWalletSummary(misaToken: string, body: any): Promise<MisaResponse> {
    const url = `${this.businessURL}/wallets/account/summary`;
    return await makeMisaRequest(url, 'POST', {
      authorization: `Bearer ${misaToken}`,
    }, body);
  }

  async getTransactionAddresses(misaToken: string): Promise<MisaResponse> {
    const url = `${this.businessURL}/transactions/addresses`;
    return await makeMisaRequest(url, 'GET', {
      authorization: `Bearer ${misaToken}`,
    });
  }

  async searchTransactions(misaToken: string, body: any): Promise<MisaResponse> {
    const url = `${this.businessURL}/transactions`;
    return await makeMisaRequest(url, 'POST', {
      authorization: `Bearer ${misaToken}`,
    }, body);
  }

  async importIncomeTransactions(
    userId: string,
    misaToken: string,
    transactions: MisaTransaction[]
  ): Promise<ImportResult> {
    const imported: any[] = [];
    const skipped: any[] = [];
    const errors: any[] = [];

    for (const transaction of transactions) {
      try {
        const transactionDate = new Date(transaction.transactionDate || transaction.date || '');
        const amount = transaction.amount || transaction.totalAmount || 0;
        const transactionId = transaction.id || transaction._id || 'N/A';
        const month = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1);

        let salaryRecord: any = await Salary.findOne({ userId, month });

        const isDuplicate = salaryRecord &&
          ((salaryRecord.notes || '').includes(`MISA-${transactionId}`) ||
            (salaryRecord.receiveDate &&
              Math.abs(new Date(salaryRecord.receiveDate).getTime() - transactionDate.getTime()) < 86400000 &&
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
              total: amount,
            },
            totalIncome: amount,
            receiveDate: transactionDate,
            notes: `Imported from MISA - Transaction ID: ${transactionId}`,
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
      } catch (err: any) {
        errors.push({ transactionId: transaction.id, error: err.message });
      }
    }

    return { imported, skipped, errors };
  }

  async importExpenseTransactions(
    userId: string,
    misaToken: string,
    transactions: MisaTransaction[]
  ): Promise<ImportResult> {
    const imported: any[] = [];
    const skipped: any[] = [];
    const errors: any[] = [];

    for (const transaction of transactions) {
      try {
        const transactionDate = new Date(transaction.transactionDate || transaction.date || '');
        const amount = transaction.amount || transaction.totalAmount || 0;
        const category = transaction.category?.name || transaction.categoryName || 'Other';
        const itemName = transaction.note || transaction.description || 'MISA imported expense';
        const transactionId = transaction.id || transaction._id || 'N/A';
        const month = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1);

        const duplicate = await Expense.findOne({
          userId,
          source: 'MISA',
          notes: { $regex: `Transaction ID: ${transactionId}` },
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
          notes: `Imported from MISA - Transaction ID: ${transactionId} - Date: ${transactionDate.toISOString().split('T')[0]}`,
        });

        await expenseRecord.save();
        imported.push({ transactionId, amount, expenseId: expenseRecord._id });
      } catch (err: any) {
        errors.push({ transactionId: transaction.id, error: err.message });
      }
    }

    return { imported, skipped, errors };
  }
}

// ================= Exporting Instance =================
export const misaDomain: MisaDomain = new MisaDomain();
