// js/recurring-bills.js

let bills = [];
let token = localStorage.getItem(AppSDK.Enums.KeyStorage.AUTH_TOKEN ?? 'authToken');

if (!token) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

async function loadBills() {
  try {
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    let url = '/api/recurring-bills?limit=100';
    if (typeFilter) url += `&type=${typeFilter}`;
    if (statusFilter) url += `&isActive=${statusFilter}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      bills = data.data;
      displayBills(bills);
    }
  } catch (error) {
    console.error('Error loading bills:', error);
  }
}

function displayBills(billsData) {
  const container = document.getElementById('billsList');

  if (billsData.length === 0) {
    container.innerHTML = '<p>Chưa có hóa đơn nào.</p>';
    return;
  }

  const table = `
                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Loại</th>
                            <th>Số tiền</th>
                            <th>Tần suất</th>
                            <th>Ngày đến hạn</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${billsData.map(bill => `
                            <tr>
                                <td>${bill.name}</td>
                                <td>${getTypeLabel(bill.type)}</td>
                                <td>${bill.amount.toLocaleString('vi-VN')} VNĐ</td>
                                <td>${getFrequencyLabel(bill.frequency)}</td>
                                <td>${new Date(bill.nextDueDate).toLocaleDateString('vi-VN')}</td>
                                <td><span class="badge ${bill.isActive ? 'badge-success' : 'badge-secondary'}">${bill.isActive ? 'Hoạt động' : 'Dừng'}</span></td>
                                <td>
                                    <button class="btn btn-sm" onclick="markAsPaid('${bill._id}')">✓ Đã thanh toán</button>
                                    <button class="btn btn-sm" onclick="editBill('${bill._id}')">✏️</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteBill('${bill._id}')">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

  container.innerHTML = table;
}

async function loadUpcomingBills() {
  try {
    const response = await fetch('/api/recurring-bills/upcoming?days=7', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.success) {
      displayUpcomingBills(data.data);
    }
  } catch (error) {
    console.error('Error loading upcoming bills:', error);
  }
}

function displayUpcomingBills(billsData) {
  const container = document.getElementById('upcomingBills');

  if (billsData.length === 0) {
    container.innerHTML = '<p>Không có hóa đơn nào sắp đến hạn.</p>';
    return;
  }

  const list = billsData.map(bill => `
                <div class="alert alert-warning">
                    <strong>${bill.name}</strong> - ${bill.amount.toLocaleString('vi-VN')} VNĐ
                    <br>Đến hạn: ${new Date(bill.nextDueDate).toLocaleDateString('vi-VN')}
                    <button class="btn btn-sm" onclick="markAsPaid('${bill._id}')">✓ Đã thanh toán</button>
                </div>
            `).join('');

  container.innerHTML = list;
}

async function loadStats() {
  try {
    const [statsRes, upcomingRes, overdueRes] = await Promise.all([
      fetch('/api/recurring-bills/stats/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('/api/recurring-bills/upcoming?days=7', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('/api/recurring-bills/overdue', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const statsData = await statsRes.json();
    const upcomingData = await upcomingRes.json();
    const overdueData = await overdueRes.json();

    if (statsData.success) {
      document.getElementById('totalMonthly').textContent =
        (statsData.data.monthlyTotal.total || 0).toLocaleString('vi-VN') + ' VNĐ';
    }

    if (upcomingData.success) {
      document.getElementById('upcomingCount').textContent = upcomingData.count || 0;
    }

    if (overdueData.success) {
      document.getElementById('overdueCount').textContent = overdueData.count || 0;
    }

    const activeResponse = await fetch('/api/recurring-bills?isActive=true&limit=1000', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const activeData = await activeResponse.json();
    if (activeData.success) {
      document.getElementById('activeCount').textContent = activeData.data.length;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function getTypeLabel(type) {
  const labels = {
    'rent': 'Tiền nhà',
    'electricity': 'Điện',
    'water': 'Nước',
    'internet': 'Internet',
    'parking': 'Gửi xe',
    'garbage': 'Rác',
    'other': 'Khác'
  };
  return labels[type] || type;
}

function getFrequencyLabel(frequency) {
  const labels = {
    'daily': 'Hàng ngày',
    'weekly': 'Hàng tuần',
    'monthly': 'Hàng tháng',
    'quarterly': 'Hàng quý',
    'yearly': 'Hàng năm'
  };
  return labels[frequency] || frequency;
}

function filterBills() {
  loadBills();
}

function showAddBillForm() {
  document.getElementById('modalTitle').textContent = 'Thêm Hóa Đơn Định Kỳ';
  document.getElementById('billForm').reset();
  document.getElementById('billId').value = '';
  document.getElementById('billModal').style.display = 'block';
}

function closeBillModal() {
  document.getElementById('billModal').style.display = 'none';
}

async function editBill(id) {
  const bill = bills.find(b => b._id === id);
  if (!bill) return;

  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Hóa Đơn';
  document.getElementById('billId').value = bill._id;
  document.getElementById('name').value = bill.name;
  document.getElementById('type').value = bill.type;
  document.getElementById('amount').value = bill.amount;
  document.getElementById('frequency').value = bill.frequency;
  document.getElementById('dueDay').value = bill.dueDay || '';
  document.getElementById('nextDueDate').value = bill.nextDueDate.split('T')[0];
  document.getElementById('reminderDays').value = bill.reminderDays;
  document.getElementById('autoDebit').checked = bill.autoDebit;
  document.getElementById('notes').value = bill.notes || '';
  document.getElementById('billModal').style.display = 'block';
}

async function deleteBill(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;

  try {
    const response = await fetch(`/api/recurring-bills/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: 'Xóa hóa đơn thành công!'
      });
      loadBills();
      loadStats();
    }
  } catch (error) {
    console.error('Error deleting bill:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra khi xóa hóa đơn!'
    });
  }
}

async function markAsPaid(id) {
  const amount = prompt('Nhập số tiền đã thanh toán:');
  if (!amount) return;

  try {
    const response = await fetch(`/api/recurring-bills/${id}/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        paidDate: new Date().toISOString()
      })
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: 'Đánh dấu đã thanh toán thành công!'
      });
      loadBills();
      loadUpcomingBills();
      loadStats();
    }
  } catch (error) {
    console.error('Error marking as paid:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra khi đánh dấu là đã thanh toán!'
    });
  }
}

document.getElementById('billForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const billId = document.getElementById('billId').value;
  const billData = {
    name: document.getElementById('name').value,
    type: document.getElementById('type').value,
    amount: parseFloat(document.getElementById('amount').value),
    frequency: document.getElementById('frequency').value,
    dueDay: parseInt(document.getElementById('dueDay').value) || undefined,
    nextDueDate: document.getElementById('nextDueDate').value,
    reminderDays: parseInt(document.getElementById('reminderDays').value),
    autoDebit: document.getElementById('autoDebit').checked,
    notes: document.getElementById('notes').value
  };

  try {
    const url = billId ? `/api/recurring-bills/${billId}` : '/api/recurring-bills';
    const method = billId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(billData)
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: billId ? 'Cập nhật thành công!' : 'Thêm hóa đơn thành công!'
      });
      closeBillModal();
      loadBills();
      loadStats();
    }
  } catch (error) {
    console.error('Error saving bill:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra khi lưu hóa đơn!'
    });
  }
});

// Initial load
loadBills();
loadUpcomingBills();
loadStats();
