const express = require('express');
const router = express.Router();
const { uploadExcel, importExcel, exportExcel } = require('../../controllers/excel.controller');
const authHandler = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *  name: Excel Import/Export
 *  description: API for importing and exporting data via Excel files
 */

// All routes require authentication
router.use(authHandler);

// Excel import/export routes
router.post('/import', uploadExcel, importExcel);
router.get('/export', exportExcel);

module.exports = router;
