// js/savings.js

let savings = [];
let token = localStorage.getItem(AppSDK.Enums.KeyStorage.AUTH_TOKEN ?? 'authToken');

if (!token) {
  window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
}

async function loadSavings() {
  try {
    const typeFilter = document.getElementById('typeFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;

    let url = '/api/savings?limit=100';
    if (typeFilter) url += `&type=${typeFilter}`;
    if (monthFilter) {
      const startDate = new Date(monthFilter + '-01').toISOString();
      const endMonth = new Date(monthFilter);
      endMonth.setMonth(endMonth.getMonth() + 1);
      const endDate = new Date(endMonth).toISOString();
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      savings = data.data;
      displaySavings(savings);
    }
  } catch (error) {
    console.error('Error loading savings:', error);
  }
}

function displaySavings(savingsData) {
  const container = document.getElementById('savingsList');

  if (savingsData.length === 0) {
    container.innerHTML = '<p>Chưa có dữ liệu tiết kiệm.</p>';
    return;
  }

  const table = `
                <table>
                    <thead>
                        <tr>
                            <th>Tháng</th>
                            <th>Loại</th>
                            <th>Ngày gửi</th>
                            <th>Số tiền</th>
                            <th>Người nhận</th>
                            <th>Ghi chú</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${savingsData.map(saving => `
                            <tr>
                                <td>${new Date(saving.month).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' })}</td>
                                <td>${saving.type === 'mother' ? 'Gửi Mẹ' : 'Gửi Quỹ'}</td>
                                <td>${new Date(saving.depositDate).toLocaleDateString('vi-VN')}</td>
                                <td>${saving.amount.toLocaleString('vi-VN')} VNĐ</td>
                                <td>${saving.recipient || 'N/A'}</td>
                                <td>${saving.notes || ''}</td>
                                <td>
                                    <button class="btn btn-sm" onclick="editSaving('${saving._id}')">✏️</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteSaving('${saving._id}')">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

  container.innerHTML = table;
}

async function loadStats() {
  try {
    const response = await fetch('/api/savings/stats/summary', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      const byType = data.data.byType;
      const motherData = byType.find(item => item._id === 'mother');
      const fundData = byType.find(item => item._id === 'fund');

      document.getElementById('totalMother').textContent =
        (motherData?.totalAmount || 0).toLocaleString('vi-VN') + ' VNĐ';
      document.getElementById('totalFund').textContent =
        (fundData?.totalAmount || 0).toLocaleString('vi-VN') + ' VNĐ';
      document.getElementById('totalSavings').textContent =
        (data.data.total.total || 0).toLocaleString('vi-VN') + ' VNĐ';
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function filterSavings() {
  loadSavings();
}

function showAddSavingForm() {
  document.getElementById('modalTitle').textContent = 'Thêm Tiết Kiệm';
  document.getElementById('savingForm').reset();
  document.getElementById('savingId').value = '';
  document.getElementById('savingModal').style.display = 'block';
}

function closeSavingModal() {
  document.getElementById('savingModal').style.display = 'none';
}

async function editSaving(id) {
  const saving = savings.find(s => s._id === id);
  if (!saving) return;

  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Tiết Kiệm';
  document.getElementById('savingId').value = saving._id;
  document.getElementById('month').value = saving.month.split('T')[0].substring(0, 7);
  document.getElementById('type').value = saving.type;
  document.getElementById('depositDate').value = saving.depositDate.split('T')[0];
  document.getElementById('amount').value = saving.amount;
  document.getElementById('accountNumber').value = saving.accountNumber || '';
  document.getElementById('recipient').value = saving.recipient || '';
  document.getElementById('notes').value = saving.notes || '';
  document.getElementById('savingModal').style.display = 'block';
}

async function deleteSaving(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa khoản tiết kiệm này?')) return;

  try {
    const response = await fetch(`/api/savings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: 'Xóa thành công!'
      });
      loadSavings();
      loadStats();
    }
  } catch (error) {
    console.error('Error deleting saving:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
}

document.getElementById('savingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const savingId = document.getElementById('savingId').value;
  const savingData = {
    month: document.getElementById('month').value + '-01',
    type: document.getElementById('type').value,
    depositDate: document.getElementById('depositDate').value,
    amount: parseFloat(document.getElementById('amount').value),
    accountNumber: document.getElementById('accountNumber').value,
    recipient: document.getElementById('recipient').value,
    notes: document.getElementById('notes').value
  };

  try {
    const url = savingId ? `/api/savings/${savingId}` : '/api/savings';
    const method = savingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(savingData)
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: savingId ? 'Cập nhật thành công!' : 'Thêm thành công!',
        text: savingId ? 'Cập nhật thành công!' : 'Thêm tiết kiệm thành công!'
      });

      closeSavingModal();
      loadSavings();
      loadStats();
    }
  } catch (error) {
    console.error('Error saving:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
});

// Initial load
loadSavings();
loadStats();
