const express = require('express');
const router = express.Router();
const {
  uploadExcel,
  importExcel,
  exportExcel
} = require('../controllers/excelController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/import', uploadExcel, importExcel);
router.get('/export', exportExcel);

module.exports = router;
