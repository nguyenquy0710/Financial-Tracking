const express = require('express');
const router = express.Router();
const {
  getSalaries,
  getSalary,
  createSalary,
  updateSalary,
  deleteSalary,
  getSalaryStats
} = require('../../controllers/salary.controller');
const { apiAuthHandler } = require('../../middleware/authHandler');

/**
 * @swagger
 * tags:
 *  name: Salaries
 *  description: API for managing salaries
 */

// All routes require authentication
router.use(apiAuthHandler);

router.route('/').get(getSalaries).post(createSalary);

router.route('/stats/summary').get(getSalaryStats);

router.route('/:id').get(getSalary).put(updateSalary).delete(deleteSalary);

module.exports = router;
