// js/salaries.js

let rentals = [];
let token = localStorage.getItem('authToken');

if (!token) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSalaries();
});

const loadSalaries = async () => {
  const container = document.getElementById('salaries-list');
  container.innerHTML = '<p class="loading">Đang tải...</p>';

  try {
    const response = await apiCall('/salaries');

    if (response.success && response.data) {
      if (response.data.length === 0) {
        container.innerHTML = '<p class="loading">Chưa có dữ liệu. Vui lòng import từ Excel.</p>';
        return;
      }

      // Calculate stats
      const totalIncome = response.data.reduce((sum, s) => sum + (s.totalIncome || 0), 0);
      const avgCompanySalary = response.data.reduce((sum, s) => sum + (s.totalCompanySalary || 0), 0) / response.data.length;
      const avgFreelance = response.data.reduce((sum, s) => sum + (s.freelance?.total || 0), 0) / response.data.length;

      document.getElementById('total-income').textContent = AppSDK.Utility.formatCurrency(totalIncome);
      document.getElementById('company-salary').textContent = AppSDK.Utility.formatCurrency(avgCompanySalary);
      document.getElementById('freelance-income').textContent = AppSDK.Utility.formatCurrency(avgFreelance);

      // Calculate growth
      if (response.data.length >= 2) {
        const latest = response.data[0].totalIncome || 0;
        const previous = response.data[1].totalIncome || 0;
        const growth = previous > 0 ? ((latest - previous) / previous * 100).toFixed(1) : 0;
        document.getElementById('growth-rate').textContent = `${growth}%`;
      }

      // Display table
      container.innerHTML = `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Tháng</th>
                                    <th>Công ty</th>
                                    <th>Lương cơ bản</th>
                                    <th>KPI</th>
                                    <th>Dự án</th>
                                    <th>Freelance</th>
                                    <th>Tổng thu nhập</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${response.data.map(salary => `
                                    <tr>
                                        <td>${new Date(salary.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</td>
                                        <td><strong>${salary.company || 'N/A'}</strong></td>
                                        <td>${formatCurrency(salary.baseSalary || 0)}</td>
                                        <td>${formatCurrency(salary.kpi || 0)}</td>
                                        <td>${formatCurrency(salary.project || 0)}</td>
                                        <td>${formatCurrency(salary.freelance?.total || 0)}</td>
                                        <td><strong>${formatCurrency(salary.totalIncome || 0)}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
    } else {
      container.innerHTML = '<p class="loading">Không thể tải dữ liệu</p>';
    }
  } catch (error) {
    console.error('Failed to load salaries:', error);
    container.innerHTML = '<p class="loading">Lỗi: Không thể tải dữ liệu. Hãy import dữ liệu từ Excel.</p>';
  }
};

const showAddModal = () => {
  document.getElementById('modalTitle').textContent = 'Thêm lương';
  document.getElementById('salaryForm').reset();
  document.getElementById('salaryId').value = '';
  document.getElementById('paymentDateGroup').style.display = 'none';

  // Set default month to current month
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('month').value = monthStr;

  document.getElementById('salaryModal').style.display = 'block';
};
