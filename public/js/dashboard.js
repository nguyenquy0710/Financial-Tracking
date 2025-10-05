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
});

// Load user information
const loadUserInfo = async () => {
  try {
    const data = await apiCall('/auth/me');
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
    const salaryData = await apiCall(`/salaries?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
    let totalIncome = 0;
    if (salaryData.success && salaryData.data) {
      totalIncome = salaryData.data.reduce((sum, s) => sum + (s.totalIncome || 0), 0);
    }
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);

    // Load expenses
    const expenseData = await apiCall(`/expenses?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
    let totalExpense = 0;
    if (expenseData.success && expenseData.data) {
      totalExpense = expenseData.data.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
    }
    document.getElementById('total-expense').textContent = formatCurrency(totalExpense);

    // Load rentals
    const rentalData = await apiCall(`/rentals?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`);
    let totalRent = 0;
    if (rentalData.success && rentalData.data) {
      totalRent = rentalData.data.reduce((sum, r) => sum + (r.total || 0), 0);
    }
    document.getElementById('total-rent').textContent = formatCurrency(totalRent);

    // Calculate savings (income - expenses - rent)
    const savings = totalIncome - totalExpense - totalRent;
    document.getElementById('total-savings').textContent = formatCurrency(savings);

    // Load recent activities
    await loadRecentActivities();
  } catch (error) {
    console.error('Failed to load summary data:', error);
  }
};

// Load recent activities
const loadRecentActivities = async () => {
  const activitiesList = document.getElementById('activities-list');
  activitiesList.innerHTML = '<p class="loading">Đang tải...</p>';

  try {
    // This is a simplified version - you can expand this to show combined activities
    const expenses = await apiCall('/expenses?perPage=5');

    if (expenses.success && expenses.data && expenses.data.length > 0) {
      activitiesList.innerHTML = expenses.data.map(expense => `
                <div class="activity-item">
                    <strong>${expense.itemName}</strong>
                    <p>${expense.category} - ${formatCurrency(expense.totalAmount)}</p>
                    <small>${new Date(expense.month).toLocaleDateString('vi-VN')}</small>
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
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Load and render charts
const loadCharts = async () => {
  try {
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

// Load expense chart by category
const loadExpenseChart = async (startDate, endDate) => {
  try {
    const expenseData = await apiCall(`/expenses?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
    
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
      document.getElementById('expense-chart-container').innerHTML = '<p class="chart-placeholder" style="display: flex; align-items: center; justify-content: center; height: 300px; color: #95a5a6;">Chưa có dữ liệu chi tiêu</p>';
      return;
    }

    // Create chart
    renderExpenseChart(labels, data);
  } catch (error) {
    console.error('Failed to load expense chart:', error);
    document.getElementById('expense-chart-container').innerHTML = '<p class="chart-placeholder" style="display: flex; align-items: center; justify-content: center; height: 300px; color: #95a5a6;">Không thể tải biểu đồ chi tiêu</p>';
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
            label: function(context) {
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
        apiCall(`/salaries?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
        apiCall(`/expenses?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
        apiCall(`/rentals?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`)
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
      document.getElementById('income-expense-chart-container').innerHTML = '<p class="chart-placeholder" style="display: flex; align-items: center; justify-content: center; height: 300px; color: #95a5a6;">Chưa có dữ liệu thu chi</p>';
      return;
    }

    // Create chart
    renderIncomeExpenseChart(months, incomes, expenses);
  } catch (error) {
    console.error('Failed to load income vs expense chart:', error);
    document.getElementById('income-expense-chart-container').innerHTML = '<p class="chart-placeholder" style="display: flex; align-items: center; justify-content: center; height: 300px; color: #95a5a6;">Không thể tải biểu đồ thu chi</p>';
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
            callback: function(value) {
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
            label: function(context) {
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
