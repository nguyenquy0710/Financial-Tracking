const express = require('express');
const router = express.Router();
const authHandler = require('../../middleware/auth');
const bankAccountController = require('../../controllers/bankAccount.controller');

/**
 * @swagger
 * tags:
 *  name: BankAccounts
 *  description: Bank Account management and retrieval
 *  version: 1.0.0
 */

// All routes require authentication
router.use(authHandler);

// Get default bank account
router.get('/default', bankAccountController.getDefaultBankAccount);

router.put('/:id/set-default', bankAccountController.setDefaultBankAccount);

router.get('/', bankAccountController.getAllBankAccounts);

router.get('/:id', bankAccountController.getBankAccountById);

router.post('/', bankAccountController.createBankAccount);

router.put('/:id', bankAccountController.updateBankAccount);

router.delete('/:id', bankAccountController.deleteBankAccount);

module.exports = router;
