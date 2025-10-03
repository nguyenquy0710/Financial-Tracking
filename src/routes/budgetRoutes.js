const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');
const { budgetValidation } = require('../middleware/validator');

router.use(auth);

router.get('/', budgetController.getBudgets);
router.get('/alerts', budgetController.getBudgetAlerts);
router.get('/:id', budgetController.getBudget);
router.post('/', budgetValidation.create, budgetController.createBudget);
router.put('/:id', budgetValidation.update, budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
