const { default: Category } = require("@/models/category.model");

/**
 * Auto-categorize transaction based on keywords
 */
async function autoCategorizeTransaction(description, type = 'expense') {
  try {
    if (!description) return null;

    const searchText = description.toLowerCase();

    // Find categories with matching keywords
    const categories = await Category.find({
      type,
      keywords: { $exists: true, $ne: [] }
    });

    for (const category of categories) {
      if (category.keywords && category.keywords.length > 0) {
        const hasMatch = category.keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );

        if (hasMatch) {
          return category._id;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error in auto-categorization:', error);
    return null;
  }
}

/**
 * Format currency based on locale
 */
function formatCurrency(amount, currency = 'VND', locale = 'vi-VN') {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return formatter.format(amount);
}

/**
 * Calculate date range for different periods
 */
function getDateRange(period, date = new Date()) {
  const startDate = new Date(date);
  const endDate = new Date(date);

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'week': {
      const dayOfWeek = startDate.getDay();
      const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    }

    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Generate AI-based spending insights
 */
function generateSpendingInsights(transactions, budgets) {
  const insights = [];

  // Calculate total spending
  const totalSpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Find top spending category
  const categorySpending = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      const catId = t.categoryId.toString();
      categorySpending[catId] = (categorySpending[catId] || 0) + t.amount;
    }
  });

  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];

  if (topCategory) {
    const percentage = ((topCategory[1] / totalSpending) * 100).toFixed(1);
    insights.push({
      type: 'spending_pattern',
      message: `${percentage}% of your spending goes to this category`,
      categoryId: topCategory[0]
    });
  }

  // Check budget adherence
  budgets.forEach(budget => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage > 90) {
      insights.push({
        type: 'budget_alert',
        message: `You've used ${percentage.toFixed(1)}% of your budget`,
        budgetId: budget._id,
        severity: 'high'
      });
    }
  });

  return insights;
}

module.exports = {
  autoCategorizeTransaction,
  formatCurrency,
  getDateRange,
  calculatePercentageChange,
  generateSpendingInsights
};
