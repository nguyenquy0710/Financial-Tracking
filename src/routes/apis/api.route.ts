import express, { Request, Response, NextFunction } from 'express';

import { API_ROUTE_PREFIX } from '@/constants/route_prefix.constant';

// Create a router for API routes
const apiRoutes = express.Router();

// Import custom middleware
// const authHandler = require('./../../middleware/auth');

// Import routes
const authRoutes = require('./auth.route');
const transactionRoutes = require('./transaction.route');
const categoryRoutes = require('./category.route');
const budgetRoutes = require('./budget.route');
const goalRoutes = require('./goal.route');
const rentalRoutes = require('./rental.route');
const rentalPropertyRoutes = require('./rental-property.route');
const salaryRoutes = require('./salary.route');
const expenseRoutes = require('./expense.route');
const savingRoutes = require('./saving.route');
const depositRoutes = require('./deposit.route');
const recurringBillRoutes = require('./recurringBill.route');
const bankAccountRoutes = require('./bankAccount.route');
const externalRoutes = require('./external.route');
const misaRoutes = require('./misa.route');
const userConfigRoutes = require('./userConfig.route');
const totpRoutes = require('./totp.route');

// API Routes
apiRoutes.use(API_ROUTE_PREFIX.AUTH.BASE, authRoutes);
apiRoutes.use(API_ROUTE_PREFIX.TRANSACTIONS.BASE, transactionRoutes);
apiRoutes.use(API_ROUTE_PREFIX.CATEGORIES.BASE, categoryRoutes);
apiRoutes.use('/externals', externalRoutes);
apiRoutes.use('/misa', misaRoutes);
apiRoutes.use('/budgets', budgetRoutes);
apiRoutes.use('/goals', goalRoutes);
apiRoutes.use('/rentals', rentalRoutes);
apiRoutes.use('/rental-properties', rentalPropertyRoutes);
apiRoutes.use('/salaries', salaryRoutes);
apiRoutes.use('/expenses', expenseRoutes);
apiRoutes.use('/savings', savingRoutes);
apiRoutes.use('/deposits', depositRoutes);
apiRoutes.use('/recurring-bills', recurringBillRoutes);
apiRoutes.use('/bank-accounts', bankAccountRoutes);
apiRoutes.use('/system-config', userConfigRoutes);
apiRoutes.use('/totp', totpRoutes);

export default apiRoutes;
