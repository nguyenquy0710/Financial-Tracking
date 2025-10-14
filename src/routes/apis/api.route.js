const express = require('express');
const router = express.Router();

// Import custom middleware
// const authHandler = require('./../../middleware/auth');

// Import routes
const authRoutes = require('./auth.route');
const transactionRoutes = require('./transaction.route');
const categoryRoutes = require('./category.route');
const budgetRoutes = require('./budget.route');
const goalRoutes = require('./goal.route');
const rentalRoutes = require('./rental.route');
const salaryRoutes = require('./salary.route');
const expenseRoutes = require('./expense.route');
const excelRoutes = require('./excel.route');
const savingRoutes = require('./saving.route');
const depositRoutes = require('./deposit.route');
const recurringBillRoutes = require('./recurringBill.route');
const bankAccountRoutes = require('./bankAccount.route');
const externalRoutes = require('./external.route');
const misaRoutes = require('./misa.route');
const userConfigRoutes = require('./userConfig.route');

// API Routes
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/externals', externalRoutes);
router.use('/misa', misaRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/rentals', rentalRoutes);
router.use('/salaries', salaryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/excel', excelRoutes);
router.use('/savings', savingRoutes);
router.use('/deposits', depositRoutes);
router.use('/recurring-bills', recurringBillRoutes);
router.use('/bank-accounts', bankAccountRoutes);
router.use('/system-config', userConfigRoutes);

module.exports = router;
