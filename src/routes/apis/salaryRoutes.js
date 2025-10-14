const express = require('express');
const router = express.Router();
const {
  getSalaries,
  getSalary,
  createSalary,
  updateSalary,
  deleteSalary,
  getSalaryStats
} = require('../../controllers/salaryController');
const authHandler = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *  name: Salaries
 *  description: API for managing salaries
 */

// All routes require authentication
router.use(authHandler);

router.route('/').get(getSalaries).post(createSalary);

router.route('/stats/summary').get(getSalaryStats);

router.route('/:id').get(getSalary).put(updateSalary).delete(deleteSalary);

module.exports = router;
