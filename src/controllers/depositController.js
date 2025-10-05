const Deposit = require('../models/Deposit');

// @desc    Get all deposits
// @route   GET /api/deposits
// @access  Private
exports.getAllDeposits = async (req, res, next) => {
  try {
    const { bank, status, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (bank) {
      query.bank = bank;
    }

    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const deposits = await Deposit.find(query)
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Deposit.countDocuments(query);

    res.status(200).json({
      success: true,
      data: deposits,
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

// @desc    Get deposit by ID
// @route   GET /api/deposits/:id
// @access  Private
exports.getDepositById = async (req, res, next) => {
  try {
    const deposit = await Deposit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deposit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new deposit
// @route   POST /api/deposits
// @access  Private
exports.createDeposit = async (req, res, next) => {
  try {
    const depositData = {
      ...req.body,
      userId: req.user._id
    };

    // Calculate total amount if not provided
    if (!depositData.totalAmount && depositData.principalAmount) {
      const interestAmount = depositData.interestAmount || 0;
      depositData.totalAmount = depositData.principalAmount + interestAmount;
    }

    const deposit = await Deposit.create(depositData);

    res.status(201).json({
      success: true,
      data: deposit,
      message: 'Deposit created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update deposit
// @route   PUT /api/deposits/:id
// @access  Private
exports.updateDeposit = async (req, res, next) => {
  try {
    let deposit = await Deposit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    // Recalculate total amount if principal or interest changes
    if (req.body.principalAmount || req.body.interestAmount) {
      const principalAmount = req.body.principalAmount || deposit.principalAmount;
      const interestAmount = req.body.interestAmount || deposit.interestAmount;
      req.body.totalAmount = principalAmount + interestAmount;
    }

    deposit = await Deposit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: deposit,
      message: 'Deposit updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete deposit
// @route   DELETE /api/deposits/:id
// @access  Private
exports.deleteDeposit = async (req, res, next) => {
  try {
    const deposit = await Deposit.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: 'Deposit not found'
      });
    }

    await Deposit.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Deposit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get deposits statistics
// @route   GET /api/deposits/stats/summary
// @access  Private
exports.getDepositsStats = async (req, res, next) => {
  try {
    const stats = await Deposit.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          totalPrincipal: { $sum: '$principalAmount' },
          totalInterest: { $sum: '$interestAmount' },
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const byBank = await Deposit.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$bank',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalStats = await Deposit.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalPrincipal: { $sum: '$principalAmount' },
          totalInterest: { $sum: '$interestAmount' },
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
          avgInterestRate: { $avg: '$interestRate' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        byBank,
        total: totalStats[0] || { 
          totalPrincipal: 0, 
          totalInterest: 0, 
          totalAmount: 0, 
          count: 0,
          avgInterestRate: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming maturity deposits
// @route   GET /api/deposits/upcoming
// @access  Private
exports.getUpcomingMaturityDeposits = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + parseInt(days));

    const deposits = await Deposit.find({
      userId: req.user._id,
      status: 'active',
      maturityDate: {
        $gte: today,
        $lte: futureDate
      }
    }).sort({ maturityDate: 1 });

    res.status(200).json({
      success: true,
      data: deposits,
      count: deposits.length
    });
  } catch (error) {
    next(error);
  }
};
