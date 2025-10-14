const express = require('express');
const router = express.Router();
const authHandler = require('../../middleware/auth');
const bankAccountController = require('../../controllers/bankAccountController');

/**
 * @swagger
 * tags:
 *  name: BankAccounts
 *  description: Bank Account management and retrieval
 *  version: 1.0.0
 */

// All routes require authentication
router.use(authHandler);

/**
 * @swagger
 * /api/bank-accounts/default:
 *   get:
 *     summary: Get the default bank account for the authenticated user
 *    tags: [BankAccounts]
 *   security:
 *    - bearerAuth: []
 *  responses:
 *    200:
 *    description: Default bank account retrieved successfully
 *   content:
 *    application/json:
 *    schema:
 *    type: object
 *   properties:
 *  success:
 *  type: boolean
 *  example: true
 *  data:
 * $ref: '#/components/schemas/BankAccount'
 *  404:
 *  description: No default bank account set
 *  content:
 *  application/json:
 *  schema:
 *  $ref: '#/components/schemas/Error'
 */
router.get('/default', bankAccountController.getDefaultBankAccount);

router.put('/:id/set-default', bankAccountController.setDefaultBankAccount);

router.get('/', bankAccountController.getAllBankAccounts);

router.get('/:id', bankAccountController.getBankAccountById);

router.post('/', bankAccountController.createBankAccount);

router.put('/:id', bankAccountController.updateBankAccount);

router.delete('/:id', bankAccountController.deleteBankAccount);

module.exports = router;
