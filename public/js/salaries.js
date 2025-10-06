// js/salaries.js

let salaries = [];
let token = localStorage.getItem('authToken');

if (!token) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSalaries();
  setupFormListeners();
});

const loadSalaries = async () => {
  const container = document.getElementById('salaries-list');
  container.innerHTML = '<p class="loading">Đang tải...</p>';

  try {
    const response = await apiCall('/salaries');

    if (response.success && response.data) {
      salaries = response.data;

      if (salaries.length === 0) {
        container.innerHTML = '<p class="loading">Chưa có dữ liệu. Vui lòng import từ Excel hoặc thêm mới.</p>';
        return;
      }

      // Calculate stats
      const totalIncome = salaries.reduce((sum, s) => sum + (s.totalIncome || 0), 0);
      const avgCompanySalary = salaries.reduce((sum, s) => sum + (s.totalCompanySalary || 0), 0) / salaries.length;
      const avgFreelance = salaries.reduce((sum, s) => sum + (s.freelance?.total || 0), 0) / salaries.length;

      document.getElementById('total-income').textContent = AppSDK.Utility.formatCurrency(totalIncome);
      document.getElementById('company-salary').textContent = AppSDK.Utility.formatCurrency(avgCompanySalary);
      document.getElementById('freelance-income').textContent = AppSDK.Utility.formatCurrency(avgFreelance);

      // Calculate growth
      if (salaries.length >= 2) {
        const latest = salaries[0].totalIncome || 0;
        const previous = salaries[1].totalIncome || 0;
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
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${salaries.map(salary => `
                                    <tr>
                                        <td>${new Date(salary.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</td>
                                        <td><strong>${salary.company || 'N/A'}</strong></td>
                                        <td>${formatCurrency(salary.baseSalary || 0)}</td>
                                        <td>${formatCurrency(salary.kpi || 0)}</td>
                                        <td>${formatCurrency(salary.project || 0)}</td>
                                        <td>${formatCurrency(salary.freelance?.total || 0)}</td>
                                        <td><strong>${formatCurrency(salary.totalIncome || 0)}</strong></td>
                                        <td>
                                            <button class="btn btn-sm" onclick="editSalary('${salary._id}')">✏️</button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteSalary('${salary._id}')">🗑️</button>
                                        </td>
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

  // Set default month to current month
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('month').value = monthStr;

  // Reset totals
  updateTotalDisplay();

  document.getElementById('salaryModal').style.display = 'block';
};

const closeSalaryModal = () => {
  document.getElementById('salaryModal').style.display = 'none';
};

const editSalary = (id) => {
  const salary = salaries.find(s => s._id === id);
  if (!salary) return;

  document.getElementById('modalTitle').textContent = 'Chỉnh sửa lương';
  document.getElementById('salaryId').value = salary._id;

  // Format month for input type="month"
  const monthDate = new Date(salary.month);
  const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('month').value = monthStr;

  document.getElementById('company').value = salary.company || 'VIHAT';
  document.getElementById('baseSalary').value = salary.baseSalary || 0;
  document.getElementById('kpi').value = salary.kpi || 0;
  document.getElementById('leader').value = salary.leader || 0;
  document.getElementById('project').value = salary.project || 0;
  document.getElementById('overtime').value = salary.overtime || 0;
  document.getElementById('bonus13thMonth').value = salary.bonus13thMonth || 0;

  document.getElementById('freelanceDakiatech').value = salary.freelance?.dakiatech || 0;
  document.getElementById('freelanceOther').value = salary.freelance?.other || 0;

  if (salary.receiveDate) {
    document.getElementById('receiveDate').value = salary.receiveDate.split('T')[0];
  }

  document.getElementById('notes').value = salary.notes || '';

  // Update totals display
  updateTotalDisplay();

  document.getElementById('salaryModal').style.display = 'block';
};

const deleteSalary = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa bản ghi lương này?')) return;

  try {
    const response = await fetch(`/api/salaries/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: 'Xóa bản ghi thành công!'
      });
      loadSalaries();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Lỗi: ' + (data.message || 'Không thể xóa')
      });
    }
  } catch (error) {
    console.error('Error deleting salary:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const updateTotalDisplay = () => {
  const baseSalary = parseFloat(document.getElementById('baseSalary').value) || 0;
  const kpi = parseFloat(document.getElementById('kpi').value) || 0;
  const leader = parseFloat(document.getElementById('leader').value) || 0;
  const project = parseFloat(document.getElementById('project').value) || 0;
  const overtime = parseFloat(document.getElementById('overtime').value) || 0;
  const bonus13thMonth = parseFloat(document.getElementById('bonus13thMonth').value) || 0;

  const freelanceDakiatech = parseFloat(document.getElementById('freelanceDakiatech').value) || 0;
  const freelanceOther = parseFloat(document.getElementById('freelanceOther').value) || 0;

  const totalCompanySalary = baseSalary + kpi + leader + project + overtime + bonus13thMonth;
  const totalFreelance = freelanceDakiatech + freelanceOther;
  const totalIncome = totalCompanySalary + totalFreelance;

  document.getElementById('displayTotalCompany').textContent = formatCurrency(totalCompanySalary);
  document.getElementById('displayTotalFreelance').textContent = formatCurrency(totalFreelance);
  document.getElementById('displayTotalIncome').textContent = formatCurrency(totalIncome);
};

const setupFormListeners = () => {
  // Add input listeners to update totals
  const numericFields = ['baseSalary', 'kpi', 'leader', 'project', 'overtime', 'bonus13thMonth', 'freelanceDakiatech', 'freelanceOther'];
  numericFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', updateTotalDisplay);
    }
  });

  // Handle form submission
  document.getElementById('salaryForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const salaryId = document.getElementById('salaryId').value;

    // Collect form data
    const baseSalary = parseFloat(document.getElementById('baseSalary').value) || 0;
    const kpi = parseFloat(document.getElementById('kpi').value) || 0;
    const leader = parseFloat(document.getElementById('leader').value) || 0;
    const project = parseFloat(document.getElementById('project').value) || 0;
    const overtime = parseFloat(document.getElementById('overtime').value) || 0;
    const bonus13thMonth = parseFloat(document.getElementById('bonus13thMonth').value) || 0;

    const freelanceDakiatech = parseFloat(document.getElementById('freelanceDakiatech').value) || 0;
    const freelanceOther = parseFloat(document.getElementById('freelanceOther').value) || 0;

    const totalCompanySalary = baseSalary + kpi + leader + project + overtime + bonus13thMonth;
    const totalFreelance = freelanceDakiatech + freelanceOther;
    const totalIncome = totalCompanySalary + totalFreelance;

    const salaryData = {
      month: new Date(document.getElementById('month').value + '-01'),
      company: document.getElementById('company').value,
      baseSalary: baseSalary,
      kpi: kpi,
      leader: leader,
      project: project,
      overtime: overtime,
      bonus13thMonth: bonus13thMonth,
      totalCompanySalary: totalCompanySalary,
      freelance: {
        dakiatech: freelanceDakiatech,
        other: freelanceOther,
        total: totalFreelance
      },
      totalIncome: totalIncome,
      receiveDate: document.getElementById('receiveDate').value || undefined,
      notes: document.getElementById('notes').value
    };

    try {
      const url = salaryId ? `/api/salaries/${salaryId}` : '/api/salaries';
      const method = salaryId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(salaryData)
      });

      const data = await response.json();
      if (data.success) {
        AppSDK.Alert.show({
          icon: AppSDK.Enums.AlertIcon.SUCCESS,
          title: "Thành công",
          text: salaryId ? 'Cập nhật thành công!' : 'Thêm lương thành công!'
        });
        closeSalaryModal();
        loadSalaries();
      } else {
        AppSDK.Alert.show({
          icon: AppSDK.Enums.AlertIcon.ERROR,
          title: "Lỗi",
          text: 'Lỗi: ' + (data.message || 'Không thể lưu')
        });
      }
    } catch (error) {
      console.error('Error saving salary:', error);
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Có lỗi xảy ra!'
      });
    }
  });
};

// MISA Import Functions
let misaToken = null;
let selectedMisaTransaction = null;

const showMisaImportModal = () => {
  document.getElementById('misaImportModal').style.display = 'block';
  
  // Reset to login section
  document.getElementById('misaLoginSection').classList.add('active');
  document.getElementById('misaSearchSection').classList.remove('active');
  
  // Set default month to current month for search
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('misaSearchMonth').value = monthStr;
  
  // Clear previous data
  misaToken = null;
  selectedMisaTransaction = null;
  document.getElementById('misaTransactionList').innerHTML = '';
};

const closeMisaImportModal = () => {
  document.getElementById('misaImportModal').style.display = 'none';
};

const loginToMisa = async () => {
  const username = document.getElementById('misaUsername').value;
  const password = document.getElementById('misaPassword').value;

  if (!username || !password) {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.WARNING,
      title: "Cảnh báo",
      text: 'Vui lòng nhập đầy đủ thông tin đăng nhập!'
    });
    return;
  }

  try {
    const response = await fetch('/api/misa/login', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        UserName: username,
        Password: password
      })
    });

    const data = await response.json();
    
    if (data.success && data.data && data.data.token) {
      misaToken = data.data.token;
      
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: 'Đăng nhập MISA thành công!'
      });

      // Switch to search section
      document.getElementById('misaLoginSection').classList.remove('active');
      document.getElementById('misaSearchSection').classList.add('active');
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Đăng nhập MISA thất bại: ' + (data.message || 'Vui lòng kiểm tra lại thông tin')
      });
    }
  } catch (error) {
    console.error('Error logging into MISA:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra khi đăng nhập MISA!'
    });
  }
};

const searchMisaTransactions = async () => {
  if (!misaToken) {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.WARNING,
      title: "Cảnh báo",
      text: 'Vui lòng đăng nhập MISA trước!'
    });
    return;
  }

  const monthValue = document.getElementById('misaSearchMonth').value;
  if (!monthValue) {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.WARNING,
      title: "Cảnh báo",
      text: 'Vui lòng chọn tháng tìm kiếm!'
    });
    return;
  }

  // Parse month and create date range
  const [year, month] = monthValue.split('-');
  const fromDate = new Date(year, month - 1, 1);
  const toDate = new Date(year, month, 0); // Last day of month

  try {
    const response = await fetch('/api/misa/transactions/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        misaToken: misaToken,
        fromDate: fromDate.toISOString().split('T')[0],
        toDate: toDate.toISOString().split('T')[0],
        transactionType: 1, // 1 = income only
        skip: 0,
        take: 100
      })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      displayMisaTransactions(data.data);
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Không thể tìm kiếm giao dịch: ' + (data.message || 'Lỗi không xác định')
      });
    }
  } catch (error) {
    console.error('Error searching MISA transactions:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra khi tìm kiếm giao dịch!'
    });
  }
};

const displayMisaTransactions = (data) => {
  const container = document.getElementById('misaTransactionList');
  
  // Handle different response structures
  const transactions = data.data || data.items || data.transactions || [];
  
  if (!transactions || transactions.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #888;">Không tìm thấy giao dịch thu nhập nào trong tháng này.</p>';
    return;
  }

  container.innerHTML = transactions.map((txn, index) => {
    const date = new Date(txn.transactionDate || txn.date);
    const amount = txn.amount || txn.totalAmount || 0;
    const note = txn.note || txn.description || txn.content || 'Không có ghi chú';
    
    return `
      <div class="transaction-item" data-index="${index}" onclick="selectMisaTransaction(${index})">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${date.toLocaleDateString('vi-VN')}</strong>
            <p style="margin: 5px 0 0 0; color: #666;">${note}</p>
          </div>
          <div style="text-align: right;">
            <strong style="color: #27ae60; font-size: 1.1em;">${formatCurrency(amount)}</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Store transactions for later use
  window.misaTransactionsData = transactions;
};

const selectMisaTransaction = (index) => {
  // Remove previous selection
  document.querySelectorAll('.transaction-item').forEach(item => {
    item.classList.remove('selected');
  });

  // Add selection to clicked item
  const selectedItem = document.querySelector(`.transaction-item[data-index="${index}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
    selectedMisaTransaction = window.misaTransactionsData[index];
  }
};

const importSelectedMisaTransaction = () => {
  if (!selectedMisaTransaction) {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.WARNING,
      title: "Cảnh báo",
      text: 'Vui lòng chọn một giao dịch để import!'
    });
    return;
  }

  // Populate the salary form with selected transaction data
  const amount = selectedMisaTransaction.amount || selectedMisaTransaction.totalAmount || 0;
  const note = selectedMisaTransaction.note || selectedMisaTransaction.description || selectedMisaTransaction.content || '';
  const date = new Date(selectedMisaTransaction.transactionDate || selectedMisaTransaction.date);

  // Set month from transaction date
  const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('month').value = monthStr;

  // Add amount to freelance.other field
  const currentOther = parseFloat(document.getElementById('freelanceOther').value) || 0;
  document.getElementById('freelanceOther').value = currentOther + amount;

  // Update notes
  const currentNotes = document.getElementById('notes').value;
  const newNote = `MISA Import: ${note} (${date.toLocaleDateString('vi-VN')})`;
  document.getElementById('notes').value = currentNotes ? `${currentNotes}\n${newNote}` : newNote;

  // Update totals display
  updateTotalDisplay();

  // Close MISA modal
  closeMisaImportModal();

  AppSDK.Alert.show({
    icon: AppSDK.Enums.AlertIcon.SUCCESS,
    title: "Thành công",
    text: 'Đã import dữ liệu thu nhập từ MISA vào form!'
  });
};
