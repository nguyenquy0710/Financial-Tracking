// Dashboard JavaScript
let selectedFile = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Load user info
    await loadUserInfo();
    
    // Load summary data
    await loadSummaryData();
    
    // Setup file upload
    setupFileUpload();
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
