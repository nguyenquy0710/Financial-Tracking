// js/rentals.js

let rentals = [];
let token = sdkAuth.getAuthToken();

// Redirect to login if not authenticated
if (!sdkAuth.isAuthenticated()) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

// Load rentals on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadRentals();
});

const loadRentals = async () => {
  const container = document.getElementById('rentals-list');
  container.innerHTML = '<p class="loading">Đang tải...</p>';

  try {
    const response = await sdkAuth.callApiWithAuth('/rentals');

    if (response.success && response.data) {
      rentals = response.data;

      if (rentals.length === 0) {
        container.innerHTML = '<p class="loading">Chưa có dữ liệu. Vui lòng import từ Excel hoặc thêm mới.</p>';
        return;
      }

      // Calculate totals
      let totalRent = 0, totalElectricity = 0, totalWater = 0, totalServices = 0;

      rentals.forEach(rental => {
        totalRent += rental.rentAmount || 0;
        totalElectricity += rental.electricity?.amount || 0;
        totalWater += rental.water?.amount || 0;
        totalServices += (rental.internet || 0) + (rental.parking || 0) + (rental.garbage || 0);
      });

      document.getElementById('total-rent').textContent = AppSDK.Utility.formatCurrency(totalRent);
      document.getElementById('total-electricity').textContent = AppSDK.Utility.formatCurrency(totalElectricity);
      document.getElementById('total-water').textContent = AppSDK.Utility.formatCurrency(totalWater);
      document.getElementById('total-services').textContent = AppSDK.Utility.formatCurrency(totalServices);

      // Display rentals
      container.innerHTML = `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Phòng</th>
                                    <th>Tháng</th>
                                    <th>Tiền nhà</th>
                                    <th>Điện</th>
                                    <th>Nước</th>
                                    <th>Internet</th>
                                    <th>Tổng</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rentals.map(rental => `
                                    <tr>
                                        <td><strong>${rental.propertyName}</strong></td>
                                        <td>${new Date(rental.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</td>
                                        <td>${AppSDK.Utility.formatCurrency(rental.rentAmount)}</td>
                                        <td>${AppSDK.Utility.formatCurrency(rental.electricity?.amount || 0)}</td>
                                        <td>${AppSDK.Utility.formatCurrency(rental.water?.amount || 0)}</td>
                                        <td>${AppSDK.Utility.formatCurrency(rental.internet || 0)}</td>
                                        <td><strong>${AppSDK.Utility.formatCurrency(rental.total)}</strong></td>
                                        <td>
                                            <span class="badge ${rental.isPaid ? 'badge-success' : 'badge-warning'}">
                                                ${rental.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm" onclick="editRental('${rental._id}')">✏️</button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteRental('${rental._id}')">🗑️</button>
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
    console.error('Failed to load rentals:', error);
    container.innerHTML = '<p class="loading">Lỗi: Không thể tải dữ liệu. Hãy import dữ liệu từ Excel.</p>';
  }
};

// Show add rental modal
const showAddModal = () => {
  document.getElementById('modalTitle').textContent = 'Thêm thuê phòng';
  document.getElementById('rentalForm').reset();
  document.getElementById('rentalId').value = '';
  document.getElementById('paymentDateGroup').style.display = 'none';

  // Set default month to current month
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('monthStart').value = monthStr;

  document.getElementById('rentalModal').style.display = 'block';
};

const closeRentalModal = () => {
  document.getElementById('rentalModal').style.display = 'none';
};

const editRental = (id) => {
  const rental = rentals.find(r => r._id === id);
  if (!rental) return;

  document.getElementById('modalTitle').textContent = 'Chỉnh sửa thuê phòng';
  document.getElementById('rentalId').value = rental._id;
  document.getElementById('propertyName').value = rental.propertyName;
  document.getElementById('address').value = rental.address || '';

  // Format month for input type="month"
  const monthDate = new Date(rental.month);
  const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('month').value = monthStr;

  document.getElementById('rentAmount').value = rental.rentAmount || 0;

  // Electricity
  document.getElementById('electricityStart').value = rental.electricity?.startReading || 0;
  document.getElementById('electricityEnd').value = rental.electricity?.endReading || 0;
  document.getElementById('electricityRate').value = rental.electricity?.rate || 0;

  // Water
  document.getElementById('waterStart').value = rental.water?.startReading || 0;
  document.getElementById('waterEnd').value = rental.water?.endReading || 0;
  document.getElementById('waterRate').value = rental.water?.rate || 0;

  // Services
  document.getElementById('internet').value = rental.internet || 0;
  document.getElementById('parking').value = rental.parking || 0;
  document.getElementById('garbage').value = rental.garbage || 0;
  document.getElementById('bonus').value = rental.bonus || 0;

  document.getElementById('notes').value = rental.notes || '';
  document.getElementById('isPaid').checked = rental.isPaid || false;

  if (rental.paymentDate) {
    document.getElementById('paymentDate').value = rental.paymentDate.split('T')[0];
    document.getElementById('paymentDateGroup').style.display = 'block';
  } else {
    document.getElementById('paymentDateGroup').style.display = 'none';
  }

  document.getElementById('rentalModal').style.display = 'block';
};

const deleteRental = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa bản ghi thuê phòng này?')) return;

  try {
    const response = await fetch(`/api/rentals/${id}`, {
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
      loadRentals();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Lỗi: ' + (data.message || 'Không thể xóa')
      });
    }
  } catch (error) {
    console.error('Error deleting rental:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
};

// Toggle payment date field based on isPaid checkbox
document.addEventListener('DOMContentLoaded', () => {
  const isPaidCheckbox = document.getElementById('isPaid');
  const paymentDateGroup = document.getElementById('paymentDateGroup');

  if (isPaidCheckbox) {
    isPaidCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        paymentDateGroup.style.display = 'block';
        if (!document.getElementById('paymentDate').value) {
          document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
        }
      } else {
        paymentDateGroup.style.display = 'none';
      }
    });
  }
});

document.getElementById('rentalForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const rentalId = document.getElementById('rentalId').value;

  // Calculate electricity
  const elecStart = parseFloat(document.getElementById('electricityStart').value) || 0;
  const elecEnd = parseFloat(document.getElementById('electricityEnd').value) || 0;
  const elecRate = parseFloat(document.getElementById('electricityRate').value) || 0;
  const elecConsumption = Math.max(0, elecEnd - elecStart);
  const elecAmount = elecConsumption * elecRate;

  // Calculate water
  const waterStart = parseFloat(document.getElementById('waterStart').value) || 0;
  const waterEnd = parseFloat(document.getElementById('waterEnd').value) || 0;
  const waterRate = parseFloat(document.getElementById('waterRate').value) || 0;
  const waterConsumption = Math.max(0, waterEnd - waterStart);
  const waterAmount = waterConsumption * waterRate;

  const rentAmount = parseFloat(document.getElementById('rentAmount').value) || 0;
  const internet = parseFloat(document.getElementById('internet').value) || 0;
  const parking = parseFloat(document.getElementById('parking').value) || 0;
  const garbage = parseFloat(document.getElementById('garbage').value) || 0;
  const bonus = parseFloat(document.getElementById('bonus').value) || 0;

  // Calculate total
  const total = rentAmount + elecAmount + waterAmount + internet + parking + garbage + bonus;

  const rentalData = {
    propertyName: document.getElementById('propertyName').value,
    address: document.getElementById('address').value,
    month: new Date(document.getElementById('month').value + '-01'),
    rentAmount: rentAmount,
    electricity: {
      startReading: elecStart,
      endReading: elecEnd,
      consumption: elecConsumption,
      rate: elecRate,
      amount: elecAmount
    },
    water: {
      startReading: waterStart,
      endReading: waterEnd,
      consumption: waterConsumption,
      rate: waterRate,
      amount: waterAmount
    },
    internet: internet,
    parking: parking,
    garbage: garbage,
    bonus: bonus,
    total: total,
    notes: document.getElementById('notes').value,
    isPaid: document.getElementById('isPaid').checked,
    paymentDate: document.getElementById('isPaid').checked ? document.getElementById('paymentDate').value : undefined
  };

  try {
    const url = rentalId ? `/api/rentals/${rentalId}` : '/api/rentals';
    const method = rentalId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rentalData)
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: rentalId ? 'Cập nhật thành công!' : 'Thêm thuê phòng thành công!'
      });
      closeRentalModal();
      loadRentals();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Lỗi: ' + (data.message || 'Không thể lưu')
      });
    }
  } catch (error) {
    console.error('Error saving rental:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
});
