const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const recurringBillController = require('../../controllers/recurringBillController');

// All routes require authentication
router.use(auth);

// Get upcoming bills
router.get('/upcoming', recurringBillController.getUpcomingBills);

// Get overdue bills
router.get('/overdue', recurringBillController.getOverdueBills);

// Get recurring bills statistics
router.get('/stats/summary', recurringBillController.getRecurringBillsStats);

// Mark bill as paid
router.post('/:id/pay', recurringBillController.markBillAsPaid);

// CRUD operations
router.get('/', recurringBillController.getAllRecurringBills);
router.get('/:id', recurringBillController.getRecurringBillById);
router.post('/', recurringBillController.createRecurringBill);
router.put('/:id', recurringBillController.updateRecurringBill);
router.delete('/:id', recurringBillController.deleteRecurringBill);

module.exports = router;
