const express = require('express');
const router = express.Router();
const {
  getSalaries,
  getSalary,
  createSalary,
  updateSalary,
  deleteSalary,
  getSalaryStats
} = require('../controllers/salaryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSalaries)
  .post(createSalary);

router.route('/stats/summary')
  .get(getSalaryStats);

router.route('/:id')
  .get(getSalary)
  .put(updateSalary)
  .delete(deleteSalary);

module.exports = router;
