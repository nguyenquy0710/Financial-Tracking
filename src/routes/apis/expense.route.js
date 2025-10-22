const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../../controllers/expense.controller');
const { apiAuthHandler } = require('../../middleware/authHandler');

/**
 * @swagger
 * tags:
 *  name: Expenses
 *  description: API for managing expenses
 */

// All routes require authentication
router.use(apiAuthHandler);

router.route('/').get(getExpenses).post(createExpense);

router.route('/stats/summary').get(getExpenseStats);

router.route('/:id').get(getExpense).put(updateExpense).delete(deleteExpense);

module.exports = router;
