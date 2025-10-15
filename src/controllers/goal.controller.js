
const { default: Goal } = require("@/models/goal.model");

// @desc    Get all goals
// @route   GET /api/goals


// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const { status, priority } = req.query;

    const query = { userId: req.userId };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const goals = await Goal.find(query).sort({ targetDate: 1 });

    res.json({
      success: true,
      data: { goals }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
exports.getGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    res.json({
      success: true,
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res, next) => {
  try {
    const goalData = {
      ...req.body,
      userId: req.userId,
      currentAmount: req.body.currentAmount || 0
    };

    const goal = await Goal.create(goalData);

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    let goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Check if goal is completed
    if (req.body.currentAmount && req.body.currentAmount >= goal.targetAmount) {
      req.body.status = 'completed';
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contribution to goal
// @route   POST /api/goals/:id/contribute
// @access  Private
exports.addContribution = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    let goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    goal.currentAmount += amount;

    // Check if goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    // Update milestones
    if (goal.milestones && goal.milestones.length > 0) {
      goal.milestones.forEach(milestone => {
        if (!milestone.achieved && goal.currentAmount >= milestone.amount) {
          milestone.achieved = true;
          milestone.achievedDate = new Date();
        }
      });
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Contribution added successfully',
      data: { goal }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get goal progress summary
// @route   GET /api/goals/summary
// @access  Private
exports.getGoalsSummary = async (req, res, next) => {
  try {
    const goals = await Goal.find({ userId: req.userId });

    const summary = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      cancelled: goals.filter(g => g.status === 'cancelled').length,
      totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0),
      totalCurrent: goals.reduce((sum, g) => sum + g.currentAmount, 0),
      totalRemaining: goals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0)
    };

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
