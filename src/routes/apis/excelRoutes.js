const express = require('express');
const router = express.Router();
const { uploadExcel, importExcel, exportExcel } = require('../../controllers/excelController');
const auth = require('../../middleware/auth');

router.use(auth);

router.post('/import', uploadExcel, importExcel);
router.get('/export', exportExcel);

module.exports = router;
