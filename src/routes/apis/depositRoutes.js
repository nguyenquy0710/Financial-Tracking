const express = require('express');
const router = express.Router();
const authHandler = require('../../middleware/auth');
const depositController = require('../../controllers/depositController');

/**
 * @swagger
 * tags:
 *  name: Deposits
 *  description: API endpoints for managing deposits
 */

// All routes require authentication
router.use(authHandler);

// Get upcoming maturity deposits
router.get('/upcoming', depositController.getUpcomingMaturityDeposits);

// Get deposits statistics
router.get('/stats/summary', depositController.getDepositsStats);

// CRUD operations
router.get('/', depositController.getAllDeposits);
router.get('/:id', depositController.getDepositById);
router.post('/', depositController.createDeposit);
router.put('/:id', depositController.updateDeposit);
router.delete('/:id', depositController.deleteDeposit);

module.exports = router;
