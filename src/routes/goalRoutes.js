const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');
const { goalValidation } = require('../middleware/validator');

router.use(auth);

router.get('/', goalController.getGoals);
router.get('/summary', goalController.getGoalsSummary);
router.get('/:id', goalController.getGoal);
router.post('/', goalValidation.create, goalController.createGoal);
router.put('/:id', goalValidation.update, goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.post('/:id/contribute', goalController.addContribution);

module.exports = router;
