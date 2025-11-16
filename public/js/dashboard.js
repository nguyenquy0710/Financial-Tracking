// Dashboard JavaScript
let selectedFile = null;
let expenseChart = null;
let incomeExpenseChart = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  // Load user info
  await loadUserInfo();

  // Load summary data
  await loadSummaryData();

  // Load charts
  await loadCharts();

  // Setup refresh button
  const refreshBtn = document.getElementById('refresh-charts');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Đang tải...';

      try {
        await loadSummaryData();
        await loadCharts();
      } catch (error) {
        console.error('Failed to refresh data:', error);
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Làm mới';
      }
    });
  }
});

// Load user information
const loadUserInfo = async () => {
  try {
    const data = await sdkAuth.callApiWithAuth('/auth/me');
    if (data.success && data.data) {
      document.getElementById('user-name').textContent = data.data.name || 'User';
    }
  } catch (error) {
    console.error('Failed to load user info:', error);
  }
};

// Load summary data
const loadSummaryData = async () => {
  try {
    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Load salaries
    const salaryData = await sdkAuth.callApiWithAuth(`/salaries?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
    let totalIncome = 0;
    if (salaryData.success && salaryData.data) {
      totalIncome = salaryData.data.reduce((sum, s) => sum + (s.totalIncome || 0), 0);
    }
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);

    // Load expenses
    const expenseData = await sdkAuth.callApiWithAuth(`/expenses?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
    let totalExpense = 0;
    let transactionCount = 0;
    const categoryTotals = {};

    if (expenseData.success && expenseData.data) {
      transactionCount = expenseData.data.length;
      expenseData.data.forEach(expense => {
        totalExpense += expense.totalAmount || 0;
        const category = expense.category || 'Khác';
        categoryTotals[category] = (categoryTotals[category] || 0) + expense.totalAmount;
      });
    }
    document.getElementById('total-expense').textContent = formatCurrency(totalExpense);

    // Load rentals
    const rentalData = await sdkAuth.callApiWithAuth(`/rentals?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
    let totalRent = 0;
    if (rentalData.success && rentalData.data) {
      totalRent = rentalData.data.reduce((sum, r) => sum + (r.total || 0), 0);
      transactionCount += rentalData.data.length;
    }
    document.getElementById('total-rent').textContent = formatCurrency(totalRent);

    // Calculate savings (income - expenses - rent)
    const savings = totalIncome - totalExpense - totalRent;
    document.getElementById('total-savings').textContent = formatCurrency(savings);

    // Update quick stats
    updateQuickStats(transactionCount, totalExpense, totalRent, categoryTotals, now);

    // Load recent activities
    await loadRecentActivities();
  } catch (error) {
    console.error('Failed to load summary data:', error);
  }
};

// Update quick stats
const updateQuickStats = (transactionCount, totalExpense, totalRent, categoryTotals, currentDate) => {
  // Transaction count
  document.getElementById('transaction-count').textContent = transactionCount;

  // Average daily expense
  const daysInMonth = currentDate.getDate(); // Days passed in current month
  const totalSpent = totalExpense + totalRent;
  const avgDailyExpense = daysInMonth > 0 ? totalSpent / daysInMonth : 0;
  document.getElementById('avg-daily-expense').textContent = formatCurrency(avgDailyExpense);

  // Top category
  let topCategory = 'Chưa có';
  let maxAmount = 0;

  for (const [category, amount] of Object.entries(categoryTotals)) {
    if (amount > maxAmount) {
      maxAmount = amount;
      topCategory = category;
    }
  }

  document.getElementById('top-category').textContent = topCategory;
};

// Load recent activities
const loadRecentActivities = async () => {
  const activitiesList = document.getElementById('activities-list');
  activitiesList.innerHTML = '<p class="loading">Đang tải...</p>';

  try {
    // Load different types of activities
    const [expenses, salaries, rentals] = await Promise.all([
      sdkAuth.callApiWithAuth('/expenses?perPage=3'),
      sdkAuth.callApiWithAuth('/salaries?perPage=2'),
      sdkAuth.callApiWithAuth('/rentals?perPage=2')
    ]);

    const activities = [];

    // Add expenses
    if (expenses.success && expenses.data) {
      expenses.data.forEach(expense => {
        activities.push({
          type: 'expense',
          icon: '💸',
          title: expense.itemName,
          description: `${expense.category} - ${formatCurrency(expense.totalAmount)}`,
          date: new Date(expense.month),
          color: '#e74c3c'
        });
      });
    }

    // Add salaries
    if (salaries.success && salaries.data) {
      salaries.data.forEach(salary => {
        activities.push({
          type: 'income',
          icon: '💰',
          title: 'Thu nhập',
          description: formatCurrency(salary.totalIncome),
          date: new Date(salary.month),
          color: '#27ae60'
        });
      });
    }

    // Add rentals
    if (rentals.success && rentals.data) {
      rentals.data.forEach(rental => {
        activities.push({
          type: 'rent',
          icon: '🏠',
          title: 'Tiền thuê nhà',
          description: formatCurrency(rental.total),
          date: new Date(rental.month),
          color: '#3498db'
        });
      });
    }

    // Sort by date (most recent first)
    activities.sort((a, b) => b.date - a.date);

    // Limit to 10 most recent
    const recentActivities = activities.slice(0, 10);

    if (recentActivities.length > 0) {
      activitiesList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item" style="border-left-color: ${activity.color};">
          <div class="activity-icon">${activity.icon}</div>
          <div class="activity-content">
            <strong>${activity.title}</strong>
            <p>${activity.description}</p>
            <small>${activity.date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</small>
          </div>
        </div>
      `).join('');
    } else {
      activitiesList.innerHTML = '<p class="loading">Chưa có hoạt động nào</p>';
    }
  } catch (error) {
    console.error('Failed to load activities:', error);
    activitiesList.innerHTML = '<p class="loading">Không thể tải hoạt động</p>';
  }
};

// Format currency
const formatCurrency = (amount) => {
  return AppSDK.Utility.formatCurrency(amount);
  // return new Intl.NumberFormat('vi-VN', {
  //   style: 'currency',
  //   currency: 'VND'
  // }).format(amount);
};

// Load and render charts
const loadCharts = async () => {
  try {
    // Show loading state
    showChartLoading('expense-chart-container');
    showChartLoading('income-expense-chart-container');

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Load data for charts
    await Promise.all([
      loadExpenseChart(startOfMonth, endOfMonth),
      loadIncomeExpenseChart(startOfMonth, endOfMonth)
    ]);
  } catch (error) {
    console.error('Failed to load charts:', error);
  }
};

// Show loading state for charts
const showChartLoading = (containerId) => {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="chart-loading"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div></div>';
  }
};

// Show empty state for charts
const showChartEmpty = (containerId, message) => {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<p class="chart-placeholder" style="display: flex; align-items: center; justify-content: center; height: 300px; color: #95a5a6;">${message}</p>`;
  }
};

// Restore canvas for chart
const restoreChartCanvas = (containerId, canvasId) => {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<canvas id="${canvasId}"></canvas>`;
  }
};

// Load expense chart by category
const loadExpenseChart = async (startDate, endDate) => {
  try {
    const expenseData = await sdkAuth.callApiWithAuth(`/expenses?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);

    // Group expenses by category
    const categoryData = {};
    if (expenseData.success && expenseData.data) {
      expenseData.data.forEach(expense => {
        const category = expense.category || 'Khác';
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        categoryData[category] += expense.totalAmount || 0;
      });
    }

    // Prepare chart data
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    // If no data, show message
    if (labels.length === 0) {
      showChartEmpty('expense-chart-container', 'Chưa có dữ liệu chi tiêu');
      return;
    }

    // Restore canvas and create chart
    restoreChartCanvas('expense-chart-container', 'expense-chart');
    renderExpenseChart(labels, data);
  } catch (error) {
    console.error('Failed to load expense chart:', error);
    showChartEmpty('expense-chart-container', 'Không thể tải biểu đồ chi tiêu');
  }
};

// Render expense chart
const renderExpenseChart = (labels, data) => {
  const ctx = document.getElementById('expense-chart');
  if (!ctx) return;

  // Destroy existing chart if exists
  if (expenseChart) {
    expenseChart.destroy();
  }

  // Color palette for categories
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
  ];

  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Chi tiêu',
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 10,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
};

// Load income vs expense chart
const loadIncomeExpenseChart = async (startDate, endDate) => {
  try {
    // Get data for the last 6 months
    const months = [];
    const incomes = [];
    const expenses = [];
    const rents = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      // Get month label
      months.push(monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }));

      // Load data for this month
      const [salaryData, expenseData, rentalData] = await Promise.all([
        sdkAuth.callApiWithAuth(`/salaries?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
        sdkAuth.callApiWithAuth(`/expenses?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
        sdkAuth.callApiWithAuth(`/rentals?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`)
      ]);

      // Calculate totals
      let totalIncome = 0;
      if (salaryData.success && salaryData.data) {
        totalIncome = salaryData.data.reduce((sum, s) => sum + (s.totalIncome || 0), 0);
      }
      incomes.push(totalIncome);

      let totalExpense = 0;
      if (expenseData.success && expenseData.data) {
        totalExpense = expenseData.data.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
      }

      let totalRent = 0;
      if (rentalData.success && rentalData.data) {
        totalRent = rentalData.data.reduce((sum, r) => sum + (r.total || 0), 0);
      }

      expenses.push(totalExpense + totalRent);
      rents.push(totalRent);
    }

    // If no data, show message
    if (incomes.every(v => v === 0) && expenses.every(v => v === 0)) {
      showChartEmpty('income-expense-chart-container', 'Chưa có dữ liệu thu chi');
      return;
    }

    // Restore canvas and create chart
    restoreChartCanvas('income-expense-chart-container', 'income-expense-chart');
    renderIncomeExpenseChart(months, incomes, expenses);
  } catch (error) {
    console.error('Failed to load income vs expense chart:', error);
    showChartEmpty('income-expense-chart-container', 'Không thể tải biểu đồ thu chi');
  }
};

// Render income vs expense chart
const renderIncomeExpenseChart = (labels, incomes, expenses) => {
  const ctx = document.getElementById('income-expense-chart');
  if (!ctx) return;

  // Destroy existing chart if exists
  if (incomeExpenseChart) {
    incomeExpenseChart.destroy();
  }

  incomeExpenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Thu nhập',
          data: incomes,
          backgroundColor: '#27ae60',
          borderColor: '#229954',
          borderWidth: 1
        },
        {
          label: 'Chi tiêu',
          data: expenses,
          backgroundColor: '#e74c3c',
          borderColor: '#c0392b',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return new Intl.NumberFormat('vi-VN', {
                notation: 'compact',
                compactDisplay: 'short'
              }).format(value);
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: ${formatCurrency(value)}`;
            }
          }
        }
      }
    }
  });
};
