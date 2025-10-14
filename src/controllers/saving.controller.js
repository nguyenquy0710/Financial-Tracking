const Saving = require('../schemas/Saving.schema');

// @desc    Get all savings
// @route   GET /api/savings
// @access  Private
exports.getAllSavings = async (req, res, next) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.month = {};
      if (startDate) query.month.$gte = new Date(startDate);
      if (endDate) query.month.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const savings = await Saving.find(query).sort({ month: -1 }).skip(skip).limit(parseInt(limit));

    const total = await Saving.countDocuments(query);

    res.status(200).json({
      success: true,
      data: savings,
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

// @desc    Get saving by ID
// @route   GET /api/savings/:id
// @access  Private
exports.getSavingById = async (req, res, next) => {
  try {
    const saving = await Saving.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!saving) {
      return res.status(404).json({
        success: false,
        message: 'Saving not found'
      });
    }

    res.status(200).json({
      success: true,
      data: saving
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new saving
// @route   POST /api/savings
// @access  Private
exports.createSaving = async (req, res, next) => {
  try {
    const savingData = {
      ...req.body,
      userId: req.user._id
    };

    const saving = await Saving.create(savingData);

    res.status(201).json({
      success: true,
      data: saving,
      message: 'Saving created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update saving
// @route   PUT /api/savings/:id
// @access  Private
exports.updateSaving = async (req, res, next) => {
  try {
    let saving = await Saving.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!saving) {
      return res.status(404).json({
        success: false,
        message: 'Saving not found'
      });
    }

    saving = await Saving.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: saving,
      message: 'Saving updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete saving
// @route   DELETE /api/savings/:id
// @access  Private
exports.deleteSaving = async (req, res, next) => {
  try {
    const saving = await Saving.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!saving) {
      return res.status(404).json({
        success: false,
        message: 'Saving not found'
      });
    }

    await Saving.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Saving deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get savings statistics
// @route   GET /api/savings/stats/summary
// @access  Private
exports.getSavingsStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = { userId: req.user._id };

    if (startDate || endDate) {
      matchStage.month = {};
      if (startDate) matchStage.month.$gte = new Date(startDate);
      if (endDate) matchStage.month.$lte = new Date(endDate);
    }

    const stats = await Saving.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const totalSavings = await Saving.aggregate([
      { $match: matchStage },
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
        total: totalSavings[0] || { total: 0, count: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};
