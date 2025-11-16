const { default: Salary } = require("@/models/salary.model");

/**
 * @desc    Get all salaries for a user
 * @route   GET /api/salaries
 * @access  Private
 */
exports.getSalaries = async (req, res, next) => {
  try {
    const { startDate, endDate, company } = req.query;
    const query = { userId: req.user.id };

    if (startDate || endDate) {
      query.month = {};
      if (startDate) query.month.$gte = new Date(startDate);
      if (endDate) query.month.$lte = new Date(endDate);
    }

    if (company) {
      query.company = new RegExp(company, 'i');
    }

    const salaries = await Salary.find(query).sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single salary
 * @route   GET /api/salaries/:id
 * @access  Private
 */
exports.getSalary = async (req, res, next) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary not found'
      });
    }

    // Check ownership
    if (salary.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this salary'
      });
    }

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create salary
 * @route   POST /api/salaries
 * @access  Private
 */
exports.createSalary = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const salary = await Salary.create(req.body);

    res.status(201).json({
      success: true,
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update salary
 * @route   PUT /api/salaries/:id
 * @access  Private
 */
exports.updateSalary = async (req, res, next) => {
  try {
    let salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary not found'
      });
    }

    // Check ownership
    if (salary.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this salary'
      });
    }

    salary = await Salary.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete salary
 * @route   DELETE /api/salaries/:id
 * @access  Private
 */
exports.deleteSalary = async (req, res, next) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary not found'
      });
    }

    // Check ownership
    if (salary.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this salary'
      });
    }

    await salary.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get salary statistics
 * @route   GET /api/salaries/stats/summary
 * @access  Private
 */
exports.getSalaryStats = async (req, res, next) => {
  try {
    const stats = await Salary.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$totalIncome' },
          avgIncome: { $avg: '$totalIncome' },
          totalFreelance: { $sum: '$freelance.total' },
          avgFreelance: { $avg: '$freelance.total' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    next(error);
  }
};
