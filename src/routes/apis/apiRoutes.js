const express = require('express');
const router = express.Router();

// Import custom middleware
// const authHandler = require('./../../middleware/auth');

// Import routes
const authRoutes = require('./authRoutes');
const transactionRoutes = require('./transactionRoutes');
const categoryRoutes = require('./categoryRoutes');
const budgetRoutes = require('./budgetRoutes');
const goalRoutes = require('./goalRoutes');
const rentalRoutes = require('./rentalRoutes');
const salaryRoutes = require('./salaryRoutes');
const expenseRoutes = require('./expenseRoutes');
const excelRoutes = require('./excelRoutes');
const savingRoutes = require('./savingRoutes');
const depositRoutes = require('./depositRoutes');
const recurringBillRoutes = require('./recurringBillRoutes');
const bankAccountRoutes = require('./bankAccountRoutes');
const externalRoutes = require('./externalRoutes');
const misaRoutes = require('./misaRoutes');
const userConfigRoutes = require('./userConfigRoutes');

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
