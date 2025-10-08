const RecurringBill = require('../models/RecurringBill');

// @desc    Get all recurring bills
// @route   GET /api/recurring-bills
// @access  Private
exports.getAllRecurringBills = async (req, res, next) => {
  try {
    const { type, isActive, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (type) {
      query.type = type;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const bills = await RecurringBill.find(query)
      .populate('categoryId', 'name nameVi icon color')
      .populate('bankAccountId', 'bank accountNumber')
      .sort({ nextDueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RecurringBill.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bills,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recurring bill by ID
// @route   GET /api/recurring-bills/:id
// @access  Private
exports.getRecurringBillById = async (req, res, next) => {
  try {
    const bill = await RecurringBill.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('categoryId', 'name nameVi icon color')
      .populate('bankAccountId', 'bank accountNumber');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Recurring bill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new recurring bill
// @route   POST /api/recurring-bills
// @access  Private
exports.createRecurringBill = async (req, res, next) => {
  try {
    const billData = {
      ...req.body,
      userId: req.user._id
    };

    const bill = await RecurringBill.create(billData);

    res.status(201).json({
      success: true,
      data: bill,
      message: 'Recurring bill created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recurring bill
// @route   PUT /api/recurring-bills/:id
// @access  Private
exports.updateRecurringBill = async (req, res, next) => {
  try {
    let bill = await RecurringBill.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Recurring bill not found'
      });
    }

    bill = await RecurringBill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('categoryId', 'name nameVi icon color')
      .populate('bankAccountId', 'bank accountNumber');

    res.status(200).json({
      success: true,
      data: bill,
      message: 'Recurring bill updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recurring bill
// @route   DELETE /api/recurring-bills/:id
// @access  Private
exports.deleteRecurringBill = async (req, res, next) => {
  try {
    const bill = await RecurringBill.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Recurring bill not found'
      });
    }

    await RecurringBill.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Recurring bill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark bill as paid
// @route   POST /api/recurring-bills/:id/pay
// @access  Private
exports.markBillAsPaid = async (req, res, next) => {
  try {
    const { amount, paidDate } = req.body;

    let bill = await RecurringBill.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Recurring bill not found'
      });
    }

    // Calculate next due date based on frequency
    const lastPaid = paidDate ? new Date(paidDate) : new Date();
    let nextDue = new Date(lastPaid);

    switch (bill.frequency) {
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'quarterly':
        nextDue.setMonth(nextDue.getMonth() + 3);
        break;
      case 'yearly':
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
    }

    bill.lastPaidDate = lastPaid;
    bill.lastPaidAmount = amount || bill.amount;
    bill.nextDueDate = nextDue;

    await bill.save();

    res.status(200).json({
      success: true,
      data: bill,
      message: 'Bill marked as paid successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming bills
// @route   GET /api/recurring-bills/upcoming
// @access  Private
exports.getUpcomingBills = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const bills = await RecurringBill.find({
      userId: req.user._id,
      isActive: true,
      nextDueDate: {
        $gte: today,
        $lte: futureDate
      }
    })
      .populate('categoryId', 'name nameVi icon color')
      .sort({ nextDueDate: 1 });

    res.status(200).json({
      success: true,
      data: bills,
      count: bills.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overdue bills
// @route   GET /api/recurring-bills/overdue
// @access  Private
exports.getOverdueBills = async (req, res, next) => {
  try {
    const today = new Date();

    const bills = await RecurringBill.find({
      userId: req.user._id,
      isActive: true,
      nextDueDate: {
        $lt: today
      }
    })
      .populate('categoryId', 'name nameVi icon color')
      .sort({ nextDueDate: 1 });

    res.status(200).json({
      success: true,
      data: bills,
      count: bills.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recurring bills statistics
// @route   GET /api/recurring-bills/stats/summary
// @access  Private
exports.getRecurringBillsStats = async (req, res, next) => {
  try {
    const stats = await RecurringBill.aggregate([
      { $match: { userId: req.user._id, isActive: true } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const monthlyTotal = await RecurringBill.aggregate([
      { $match: { userId: req.user._id, isActive: true, frequency: 'monthly' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType: stats,
        monthlyTotal: monthlyTotal[0] || { total: 0, count: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};
