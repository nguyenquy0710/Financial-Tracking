const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const { transactionValidation } = require('../middleware/validator');

router.use(auth);

router.get('/', transactionController.getTransactions);
router.get('/stats/summary', transactionController.getStats);
router.get('/:id', transactionValidation.delete, transactionController.getTransaction);
router.post('/', transactionValidation.create, transactionController.createTransaction);
router.put('/:id', transactionValidation.update, transactionController.updateTransaction);
router.delete('/:id', transactionValidation.delete, transactionController.deleteTransaction);

module.exports = router;
