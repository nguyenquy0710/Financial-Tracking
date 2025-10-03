const { body, param, query, validationResult } = require('express-validator');

// Validate request and return errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    validate
  ],
  
  login: [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ]
};

// Transaction validation rules
const transactionValidation = {
  create: [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    validate
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid transaction ID'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    validate
  ],
  
  delete: [
    param('id').isMongoId().withMessage('Invalid transaction ID'),
    validate
  ]
};

// Category validation rules
const categoryValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    validate
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid category ID'),
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
    validate
  ]
};

// Budget validation rules
const budgetValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Budget name is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('categoryId').isMongoId().withMessage('Invalid category ID'),
    body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    validate
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid budget ID'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    validate
  ]
};

// Goal validation rules
const goalValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Goal name is required'),
    body('targetAmount').isFloat({ min: 0 }).withMessage('Target amount must be a positive number'),
    body('targetDate').isISO8601().withMessage('Invalid target date'),
    validate
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid goal ID'),
    body('targetAmount').optional().isFloat({ min: 0 }).withMessage('Target amount must be a positive number'),
    validate
  ]
};

module.exports = {
  validate,
  userValidation,
  transactionValidation,
  categoryValidation,
  budgetValidation,
  goalValidation
};
