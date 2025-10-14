const Category = require('../schemas/Category.schema');

// Default categories to be initialized
const defaultCategories = {
  expense: [
    {
      name: 'Food & Dining',
      nameVi: 'Ăn uống',
      icon: '🍽️',
      keywords: ['food', 'restaurant', 'cafe', 'ăn', 'quán']
    },
    {
      name: 'Transportation',
      nameVi: 'Di chuyển',
      icon: '🚗',
      keywords: ['taxi', 'bus', 'fuel', 'xe', 'xăng']
    },
    {
      name: 'Shopping',
      nameVi: 'Mua sắm',
      icon: '🛍️',
      keywords: ['shopping', 'clothes', 'mua', 'quần áo']
    },
    {
      name: 'Entertainment',
      nameVi: 'Giải trí',
      icon: '🎬',
      keywords: ['movie', 'game', 'phim', 'game']
    },
    {
      name: 'Healthcare',
      nameVi: 'Sức khỏe',
      icon: '🏥',
      keywords: ['doctor', 'medicine', 'bác sĩ', 'thuốc']
    },
    {
      name: 'Education',
      nameVi: 'Giáo dục',
      icon: '📚',
      keywords: ['school', 'course', 'book', 'học', 'sách']
    },
    {
      name: 'Utilities',
      nameVi: 'Tiện ích',
      icon: '💡',
      keywords: ['electric', 'water', 'internet', 'điện', 'nước']
    },
    {
      name: 'Housing',
      nameVi: 'Nhà ở',
      icon: '🏠',
      keywords: ['rent', 'mortgage', 'thuê nhà', 'nhà']
    },
    { name: 'Other', nameVi: 'Khác', icon: '💰', keywords: ['other', 'misc', 'khác'] }
  ],
  income: [
    { name: 'Salary', nameVi: 'Lương', icon: '💼', keywords: ['salary', 'wage', 'lương'] },
    {
      name: 'Business',
      nameVi: 'Kinh doanh',
      icon: '📈',
      keywords: ['business', 'profit', 'kinh doanh']
    },
    {
      name: 'Investment',
      nameVi: 'Đầu tư',
      icon: '💹',
      keywords: ['investment', 'dividend', 'đầu tư']
    },
    { name: 'Gift', nameVi: 'Quà tặng', icon: '🎁', keywords: ['gift', 'bonus', 'quà'] },
    { name: 'Other Income', nameVi: 'Thu nhập khác', icon: '💰', keywords: ['other', 'khác'] }
  ]
};

module.exports = {

  /** Default categories for the system */
  defaultCategories: defaultCategories,

  /**
   * Initialize default categories for the system
   */
  initializeDefaultCategories: async function initializeDefaultCategories() {
    try {
      // Check if default categories already exist
      const existingCategories = await Category.countDocuments({ isDefault: true });

      if (existingCategories > 0) {
        console.log('✓ Default categories already initialized');
        return;
      }

      // Create expense categories
      const expenseCategories = defaultCategories.expense.map(cat => ({
        ...cat,
        type: 'expense',
        isDefault: true,
        userId: null
      }));

      // Create income categories
      const incomeCategories = defaultCategories.income.map(cat => ({
        ...cat,
        type: 'income',
        isDefault: true,
        userId: null
      }));

      // Insert all categories
      await Category.insertMany([...expenseCategories, ...incomeCategories]);

      console.log('✓ Default categories initialized successfully');
    } catch (error) {
      console.error('✗ Error initializing default categories:', error);
    }
  },

};
