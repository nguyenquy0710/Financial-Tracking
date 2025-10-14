const Budget = require('../schemas/Budget.schema');
const Transaction = require('../schemas/Transaction.schema');

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const { period, isActive } = req.query;

    const query = { userId: req.userId };

    if (period) query.period = period;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const budgets = await Budget.find(query)
      .populate('categoryId', 'name nameVi icon color')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      data: { budgets }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('categoryId', 'name nameVi icon color');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res, next) => {
  try {
    const budgetData = {
      ...req.body,
      userId: req.userId,
      spent: 0
    };

    // Calculate initial spent amount if budget starts in the past
    const startDate = new Date(budgetData.startDate);
    if (startDate < new Date()) {
      const spent = await calculateSpentAmount(
        req.userId,
        budgetData.categoryId,
        startDate,
        budgetData.endDate || new Date()
      );
      budgetData.spent = spent;
    }

    const budget = await Budget.create(budgetData);

    const populatedBudget = await Budget.findById(budget._id).populate(
      'categoryId',
      'name nameVi icon color'
    );

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: { budget: populatedBudget }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('categoryId', 'name nameVi icon color');

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: { budget }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await budget.deleteOne();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget alerts
// @route   GET /api/budgets/alerts
// @access  Private
exports.getBudgetAlerts = async (req, res, next) => {
  try {
    const now = new Date();

    const budgets = await Budget.find({
      userId: req.userId,
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $gte: now } }, { endDate: null }]
    }).populate('categoryId', 'name nameVi icon color');

    const alerts = budgets
      .filter(budget => {
        const percentage = (budget.spent / budget.amount) * 100;
        return percentage >= budget.alertThreshold;
      })
      .map(budget => ({
        budget,
        percentage: (budget.spent / budget.amount) * 100,
        message: budget.spent >= budget.amount ? 'Budget exceeded' : 'Budget threshold reached'
      }));

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate spent amount
async function calculateSpentAmount(userId, categoryId, startDate, endDate) {
  const result = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        categoryId: categoryId,
        type: 'expense',
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
}

module.exports = exports;
