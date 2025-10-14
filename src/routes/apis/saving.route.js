const express = require('express');
const router = express.Router();
const authHandler = require('../../middleware/auth');
const savingController = require('../../controllers/saving.controller');

/**
 * @swagger
 * tags:
 *  name: Savings
 *  description: API for managing savings
 */

// All routes require authentication
router.use(authHandler);

// Get savings statistics
router.get('/stats/summary', savingController.getSavingsStats);

// CRUD operations
router.get('/', savingController.getAllSavings);
router.get('/:id', savingController.getSavingById);
router.post('/', savingController.createSaving);
router.put('/:id', savingController.updateSaving);
router.delete('/:id', savingController.deleteSaving);

module.exports = router;
