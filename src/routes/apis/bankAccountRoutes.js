const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bankAccountController = require('../../controllers/bankAccountController');

// All routes require authentication
router.use(auth);

// Get default bank account
router.get('/default', bankAccountController.getDefaultBankAccount);

// Set bank account as default
router.put('/:id/set-default', bankAccountController.setDefaultBankAccount);

// CRUD operations
router.get('/', bankAccountController.getAllBankAccounts);
router.get('/:id', bankAccountController.getBankAccountById);
router.post('/', bankAccountController.createBankAccount);
router.put('/:id', bankAccountController.updateBankAccount);
router.delete('/:id', bankAccountController.deleteBankAccount);

module.exports = router;
