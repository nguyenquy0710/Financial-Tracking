const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const { 
      type, 
      categoryId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = { userId: req.userId };

    // Add filters
    if (type) query.type = type;
    if (categoryId) query.categoryId = categoryId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const transactions = await Transaction.find(query)
      .populate('categoryId', 'name nameVi icon color')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('categoryId', 'name nameVi icon color');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const transactionData = {
      ...req.body,
      userId: req.userId
    };

    const transaction = await Transaction.create(transactionData);
    
    // Update budget if expense
    if (transaction.type === 'expense') {
      await updateBudgetSpent(req.userId, transaction.categoryId, transaction.amount);
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('categoryId', 'name nameVi icon color');

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction: populatedTransaction }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // If amount or category changed, update budget
    if (transaction.type === 'expense' && 
        (req.body.amount !== undefined || req.body.categoryId !== undefined)) {
      // Subtract old amount
      await updateBudgetSpent(req.userId, transaction.categoryId, -transaction.amount);
      // Add new amount
      const newAmount = req.body.amount || transaction.amount;
      const newCategory = req.body.categoryId || transaction.categoryId;
      await updateBudgetSpent(req.userId, newCategory, newAmount);
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name nameVi icon color');

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Update budget if expense
    if (transaction.type === 'expense') {
      await updateBudgetSpent(req.userId, transaction.categoryId, -transaction.amount);
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats/summary
// @access  Private
exports.getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { userId: req.userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Total income and expense
    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Category breakdown
    const categoryStats = await Transaction.aggregate([
      { $match: { ...query, type: 'expense' } },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryId: '$_id',
          categoryName: '$category.name',
          categoryNameVi: '$category.nameVi',
          icon: '$category.icon',
          color: '$category.color',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    const income = stats.find(s => s._id === 'income')?.total || 0;
    const expense = stats.find(s => s._id === 'expense')?.total || 0;
    const balance = income - expense;

    res.json({
      success: true,
      data: {
        summary: {
          income,
          expense,
          balance,
          transactionCount: stats.reduce((acc, s) => acc + s.count, 0)
        },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update budget spent amount
async function updateBudgetSpent(userId, categoryId, amount) {
  const now = new Date();
  
  const budgets = await Budget.find({
    userId,
    categoryId,
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: { $gte: now } },
      { endDate: null }
    ]
  });

  for (const budget of budgets) {
    budget.spent = Math.max(0, budget.spent + amount);
    await budget.save();
  }
}

module.exports = exports;
