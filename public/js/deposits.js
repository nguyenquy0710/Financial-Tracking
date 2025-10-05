// js/deposits.js

let deposits = [];
let vietQrBanks = [];
let token = localStorage.getItem(AppSDK.Enums.KeyStorage.AUTH_TOKEN ?? 'authToken');

if (!token) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

async function loadDeposits() {
  try {
    const bankFilter = document.getElementById('bankFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    let url = '/api/deposits?limit=100';
    if (bankFilter) url += `&bank=${encodeURIComponent(bankFilter)}`;
    if (statusFilter) url += `&status=${statusFilter}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      deposits = data.data;
      displayDeposits(deposits);
    }
  } catch (error) {
    console.error('Error loading deposits:', error);
  }
}

function displayDeposits(depositsData) {
  const container = document.getElementById('depositsList');

  if (depositsData.length === 0) {
    container.innerHTML = '<p>Chưa có sổ tiết kiệm nào.</p>';
    return;
  }

  const table = `
                <table>
                    <thead>
                        <tr>
                            <th>Ngân hàng</th>
                            <th>Số TK</th>
                            <th>Số tiền gốc</th>
                            <th>Lãi suất</th>
                            <th>Kỳ hạn</th>
                            <th>Ngày đáo hạn</th>
                            <th>Lãi dự kiến</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${depositsData.map(deposit => `
                            <tr>
                                <td>${deposit.bank}</td>
                                <td>${deposit.accountNumber}</td>
                                <td>${deposit.principalAmount.toLocaleString('vi-VN')} VNĐ</td>
                                <td>${deposit.interestRate}%</td>
                                <td>${deposit.termMonths || 0} tháng</td>
                                <td>${deposit.maturityDate ? new Date(deposit.maturityDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                <td>${deposit.interestAmount.toLocaleString('vi-VN')} VNĐ</td>
                                <td><span class="badge ${getStatusClass(deposit.status)}">${getStatusLabel(deposit.status)}</span></td>
                                <td>
                                    <button class="btn btn-sm" onclick="editDeposit('${deposit._id}')">✏️</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteDeposit('${deposit._id}')">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

  container.innerHTML = table;
}

async function loadUpcomingDeposits() {
  try {
    const response = await fetch('/api/deposits/upcoming?days=30', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      displayUpcomingDeposits(data.data);
    }
  } catch (error) {
    console.error('Error loading upcoming deposits:', error);
  }
}

function displayUpcomingDeposits(depositsData) {
  const container = document.getElementById('upcomingDeposits');

  if (depositsData.length === 0) {
    container.innerHTML = '<p>Không có sổ nào sắp đáo hạn.</p>';
    return;
  }

  const list = depositsData.map(deposit => `
                <div class="alert alert-info">
                    <strong>${deposit.bank}</strong> - ${deposit.accountNumber}
                    <br>Gốc: ${deposit.principalAmount.toLocaleString('vi-VN')} VNĐ | Lãi: ${deposit.interestAmount.toLocaleString('vi-VN')} VNĐ
                    <br>Đáo hạn: ${new Date(deposit.maturityDate).toLocaleDateString('vi-VN')}
                </div>
            `).join('');

  container.innerHTML = list;
}

async function loadStats() {
  try {
    const response = await fetch('/api/deposits/stats/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success && data.data.total) {
      document.getElementById('totalPrincipal').textContent =
        (data.data.total.totalPrincipal || 0).toLocaleString('vi-VN') + ' VNĐ';
      document.getElementById('totalInterest').textContent =
        (data.data.total.totalInterest || 0).toLocaleString('vi-VN') + ' VNĐ';
      document.getElementById('totalAmount').textContent =
        (data.data.total.totalAmount || 0).toLocaleString('vi-VN') + ' VNĐ';
      document.getElementById('avgRate').textContent =
        (data.data.total.avgInterestRate || 0).toFixed(2) + '%';
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function getStatusLabel(status) {
  const labels = {
    'active': 'Hoạt động',
    'matured': 'Đã đến hạn',
    'closed': 'Đã đóng'
  };
  return labels[status] || status;
}

function getStatusClass(status) {
  const classes = {
    'active': 'badge-success',
    'matured': 'badge-warning',
    'closed': 'badge-secondary'
  };
  return classes[status] || 'badge-secondary';
}

function filterDeposits() {
  loadDeposits();
}

async function loadVietQrBanks() {
  try {
    vietQrBanks = await AppExternal.VietQR.getBanks();
    console.log('✅ Loaded VietQR banks:', vietQrBanks.length);
  } catch (error) {
    console.error('Error loading VietQR banks:', error);
    vietQrBanks = [];
  }
}

function populateBankDropdown() {
  const bankSelect = document.getElementById('bank');
  if (!bankSelect) return;

  // Clear existing options except the first one
  bankSelect.innerHTML = '<option value="">-- Chọn ngân hàng --</option>';

  // Add banks from VietQR
  vietQrBanks.forEach(bank => {
    const option = document.createElement('option');
    option.value = bank.shortName || bank.name;
    option.textContent = `${bank.shortName || bank.code} - ${bank.name}`;
    option.dataset.bankCode = bank.code;
    option.dataset.bankBin = bank.bin;
    option.dataset.bankLogo = bank.logo;
    bankSelect.appendChild(option);
  });
}

function showAddDepositForm() {
  document.getElementById('modalTitle').textContent = 'Thêm Sổ Tiết Kiệm';
  document.getElementById('depositForm').reset();
  document.getElementById('depositId').value = '';
  document.getElementById('status').value = 'active';
  populateBankDropdown();
  document.getElementById('depositModal').style.display = 'block';
}

function closeDepositModal() {
  document.getElementById('depositModal').style.display = 'none';
}

async function editDeposit(id) {
  const deposit = deposits.find(d => d._id === id);
  if (!deposit) return;

  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Sổ Tiết Kiệm';
  document.getElementById('depositId').value = deposit._id;
  populateBankDropdown();
  document.getElementById('bank').value = deposit.bank;
  document.getElementById('accountType').value = deposit.accountType || '';
  document.getElementById('accountNumber').value = deposit.accountNumber;
  document.getElementById('accountName').value = deposit.accountName || '';
  document.getElementById('fundType').value = deposit.fundType || '';
  document.getElementById('principalAmount').value = deposit.principalAmount;
  document.getElementById('interestRate').value = deposit.interestRate;
  document.getElementById('termMonths').value = deposit.termMonths || '';
  document.getElementById('startDate').value = deposit.startDate ? deposit.startDate.split('T')[0] : '';
  document.getElementById('maturityDate').value = deposit.maturityDate ? deposit.maturityDate.split('T')[0] : '';
  document.getElementById('interestAmount').value = deposit.interestAmount || '';
  document.getElementById('status').value = deposit.status;
  document.getElementById('notes').value = deposit.notes || '';
  document.getElementById('depositModal').style.display = 'block';
}

async function deleteDeposit(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa sổ tiết kiệm này?')) return;

  try {
    const response = await fetch(`/api/deposits/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: 'Xóa sổ tiết kiệm thành công!',
      });
      loadDeposits();
      loadStats();
    }
  } catch (error) {
    console.error('Error deleting deposit:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra khi xóa sổ tiết kiệm!',
    });
  }
}

document.getElementById('depositForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const depositId = document.getElementById('depositId').value;
  const depositData = {
    bank: document.getElementById('bank').value,
    accountType: document.getElementById('accountType').value,
    accountNumber: document.getElementById('accountNumber').value,
    accountName: document.getElementById('accountName').value,
    fundType: document.getElementById('fundType').value,
    principalAmount: parseFloat(document.getElementById('principalAmount').value),
    interestRate: parseFloat(document.getElementById('interestRate').value),
    termMonths: parseInt(document.getElementById('termMonths').value) || 0,
    startDate: document.getElementById('startDate').value || undefined,
    maturityDate: document.getElementById('maturityDate').value || undefined,
    interestAmount: parseFloat(document.getElementById('interestAmount').value) || 0,
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value
  };

  try {
    const url = depositId ? `/api/deposits/${depositId}` : '/api/deposits';
    const method = depositId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(depositData)
    });

    const data = await response.json();
    if (data.success) {
      alert(depositId ? 'Cập nhật thành công!' : 'Thêm sổ tiết kiệm thành công!');
      closeDepositModal();
      loadDeposits();
      loadUpcomingDeposits();
      loadStats();
    }
  } catch (error) {
    console.error('Error saving deposit:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra khi lưu sổ tiết kiệm!',
    });
  }
});

// Initial load
loadDeposits();
loadUpcomingDeposits();
loadStats();
loadVietQrBanks();
