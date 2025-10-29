// js/rental-detail.js

let property = null;
let monthlyRecords = [];
let statistics = {};
let token = sdkAuth.getAuthToken();

// Redirect to login if not authenticated
if (!sdkAuth.isAuthenticated()) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

// Load property details on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (!PROPERTY_ID) {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Không tìm thấy mã phòng!'
    });
    window.location.href = '/rentals';
    return;
  }
  await loadPropertyDetails();
});

const loadPropertyDetails = async () => {
  try {
    const response = await sdkAuth.callApiWithAuth(`/rental-properties/${PROPERTY_ID}/details`);

    if (response.success && response.data) {
      property = response.data.property;
      monthlyRecords = response.data.monthlyRecords || [];
      statistics = response.data.statistics || {};

      // Display property info
      displayPropertyInfo();
      
      // Display statistics
      displayStatistics();
      
      // Display monthly records
      displayMonthlyRecords();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Không thể tải thông tin phòng!'
      });
      window.location.href = '/rentals';
    }
  } catch (error) {
    console.error('Failed to load property details:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Lỗi: Không thể tải dữ liệu.'
    });
  }
};

const displayPropertyInfo = () => {
  const container = document.getElementById('property-info');
  
  container.innerHTML = `
    <table class="table table-bordered table-hover">
      <tbody>
        <tr>
          <th width="30%">Mã phòng</th>
          <td>${property.roomCode}</td>
        </tr>
        <tr>
          <th>Tên phòng</th>
          <td>${property.propertyName}</td>
        </tr>
        <tr>
          <th>Địa chỉ</th>
          <td>${property.address || 'N/A'}</td>
        </tr>
        <tr>
          <th>Ngày bắt đầu</th>
          <td>${new Date(property.startDate).toLocaleDateString('vi-VN')}</td>
        </tr>
        ${property.endDate ? `
        <tr>
          <th>Ngày kết thúc</th>
          <td>${new Date(property.endDate).toLocaleDateString('vi-VN')}</td>
        </tr>
        ` : ''}
        <tr>
          <th>Trạng thái</th>
          <td>
            <span class="badge ${property.isActive ? 'badge-success' : 'badge-secondary'}">
              ${property.isActive ? 'Đang thuê' : 'Đã trả phòng'}
            </span>
          </td>
        </tr>
        <tr>
          <th>Tiền nhà</th>
          <td>${AppSDK.Utility.formatCurrency(property.rentAmount)}/tháng</td>
        </tr>
        <tr>
          <th>Chỉ số điện ban đầu</th>
          <td>${property.initialElectricityReading} kWh (${AppSDK.Utility.formatCurrency(property.electricityRate)}/kWh)</td>
        </tr>
        <tr>
          <th>Chỉ số nước ban đầu</th>
          <td>${property.initialWaterReading} m³ (${AppSDK.Utility.formatCurrency(property.waterRate)}/m³)</td>
        </tr>
        ${property.internetFee ? `
        <tr>
          <th>Phí internet</th>
          <td>${AppSDK.Utility.formatCurrency(property.internetFee)}/tháng</td>
        </tr>
        ` : ''}
        ${property.parkingFee ? `
        <tr>
          <th>Phí gửi xe</th>
          <td>${AppSDK.Utility.formatCurrency(property.parkingFee)}/tháng</td>
        </tr>
        ` : ''}
        ${property.garbageFee ? `
        <tr>
          <th>Phí rác</th>
          <td>${AppSDK.Utility.formatCurrency(property.garbageFee)}/tháng</td>
        </tr>
        ` : ''}
        ${property.notes ? `
        <tr>
          <th>Ghi chú</th>
          <td>${property.notes}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>
  `;
};

const displayStatistics = () => {
  document.getElementById('stat-total').textContent = AppSDK.Utility.formatCurrency(statistics.grandTotal || 0);
  document.getElementById('stat-months').textContent = `${statistics.totalMonths || 0} tháng`;
  document.getElementById('stat-electricity').textContent = AppSDK.Utility.formatCurrency(statistics.totalElectricity || 0);
  document.getElementById('stat-water').textContent = AppSDK.Utility.formatCurrency(statistics.totalWater || 0);
  document.getElementById('stat-avg').textContent = AppSDK.Utility.formatCurrency(statistics.avgMonthlyRent || 0);
};

const displayMonthlyRecords = () => {
  const container = document.getElementById('monthly-records');

  if (monthlyRecords.length === 0) {
    container.innerHTML = '<p class="loading">Chưa có dữ liệu thanh toán theo tháng. Vui lòng thêm mới.</p>';
    return;
  }

  container.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Tháng</th>
          <th>Tiền nhà</th>
          <th>Điện</th>
          <th>Nước</th>
          <th>Dịch vụ</th>
          <th>Tổng</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyRecords.map(record => `
          <tr>
            <td><strong>${new Date(record.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</strong></td>
            <td>${AppSDK.Utility.formatCurrency(record.rentAmount)}</td>
            <td>${AppSDK.Utility.formatCurrency(record.electricity?.amount || 0)}<br/>
                <small>(${record.electricity?.startReading || 0} → ${record.electricity?.endReading || 0} kWh)</small>
            </td>
            <td>${AppSDK.Utility.formatCurrency(record.water?.amount || 0)}<br/>
                <small>(${record.water?.startReading || 0} → ${record.water?.endReading || 0} m³)</small>
            </td>
            <td>${AppSDK.Utility.formatCurrency((record.internet || 0) + (record.parking || 0) + (record.garbage || 0))}</td>
            <td><strong>${AppSDK.Utility.formatCurrency(record.total)}</strong></td>
            <td>
              <span class="badge ${record.isPaid ? 'badge-success' : 'badge-warning'}">
                ${record.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </td>
            <td>
              <button class="btn btn-sm" onclick="editMonthlyRecord('${record._id}')" title="Chỉnh sửa">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="deleteMonthlyRecord('${record._id}')" title="Xóa">🗑️</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

const showAddMonthlyRecordModal = () => {
  document.getElementById('monthlyRecordModalTitle').textContent = 'Thêm dữ liệu tháng';
  document.getElementById('monthlyRecordForm').reset();
  document.getElementById('recordId').value = '';
  document.getElementById('propertyId').value = PROPERTY_ID;
  document.getElementById('paymentDateGroup').style.display = 'none';

  // Pre-fill with property defaults
  document.getElementById('rentAmount').value = property.rentAmount;
  document.getElementById('electricityRate').value = property.electricityRate;
  document.getElementById('waterRate').value = property.waterRate;
  document.getElementById('internet').value = property.internetFee || 0;
  document.getElementById('parking').value = property.parkingFee || 0;
  document.getElementById('garbage').value = property.garbageFee || 0;

  // Set start readings from the last record or property initial readings
  if (monthlyRecords.length > 0) {
    const lastRecord = monthlyRecords[0]; // Already sorted by month descending
    document.getElementById('electricityStart').value = lastRecord.electricity?.endReading || property.initialElectricityReading;
    document.getElementById('waterStart').value = lastRecord.water?.endReading || property.initialWaterReading;
  } else {
    document.getElementById('electricityStart').value = property.initialElectricityReading;
    document.getElementById('waterStart').value = property.initialWaterReading;
  }

  // Set default month to current month
  const now = new Date();
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('month').value = monthStr;

  document.getElementById('monthlyRecordModal').style.display = 'block';
};

const closeMonthlyRecordModal = () => {
  document.getElementById('monthlyRecordModal').style.display = 'none';
};

const editMonthlyRecord = (id) => {
  const record = monthlyRecords.find(r => r._id === id);
  if (!record) return;

  document.getElementById('monthlyRecordModalTitle').textContent = 'Chỉnh sửa dữ liệu tháng';
  document.getElementById('recordId').value = record._id;
  document.getElementById('propertyId').value = PROPERTY_ID;

  // Format month for input type="month"
  const monthDate = new Date(record.month);
  const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('month').value = monthStr;

  document.getElementById('rentAmount').value = record.rentAmount || 0;

  // Electricity
  document.getElementById('electricityStart').value = record.electricity?.startReading || 0;
  document.getElementById('electricityEnd').value = record.electricity?.endReading || 0;
  document.getElementById('electricityRate').value = record.electricity?.rate || 0;

  // Water
  document.getElementById('waterStart').value = record.water?.startReading || 0;
  document.getElementById('waterEnd').value = record.water?.endReading || 0;
  document.getElementById('waterRate').value = record.water?.rate || 0;

  // Services
  document.getElementById('internet').value = record.internet || 0;
  document.getElementById('parking').value = record.parking || 0;
  document.getElementById('garbage').value = record.garbage || 0;
  document.getElementById('bonus').value = record.bonus || 0;

  document.getElementById('notes').value = record.notes || '';
  document.getElementById('isPaid').checked = record.isPaid || false;

  if (record.paymentDate) {
    document.getElementById('paymentDate').value = record.paymentDate.split('T')[0];
    document.getElementById('paymentDateGroup').style.display = 'block';
  } else {
    document.getElementById('paymentDateGroup').style.display = 'none';
  }

  document.getElementById('monthlyRecordModal').style.display = 'block';
};

const deleteMonthlyRecord = async (id) => {
  const result = await Swal.fire({
    title: 'Xác nhận xóa',
    text: 'Bạn có chắc chắn muốn xóa bản ghi tháng này?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy'
  });

  if (!result.isConfirmed) return;

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
      loadPropertyDetails();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Lỗi: ' + (data.message || 'Không thể xóa')
      });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
};

// Toggle payment date field
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

// Handle monthly record form submission
document.getElementById('monthlyRecordForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const recordId = document.getElementById('recordId').value;

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

  const recordData = {
    propertyId: PROPERTY_ID,
    propertyName: property.propertyName,
    address: property.address,
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
    const url = recordId ? `/api/rentals/${recordId}` : '/api/rentals';
    const method = recordId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recordData)
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: recordId ? 'Cập nhật thành công!' : 'Thêm dữ liệu tháng thành công!'
      });
      closeMonthlyRecordModal();
      loadPropertyDetails();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Lỗi: ' + (data.message || 'Không thể lưu')
      });
    }
  } catch (error) {
    console.error('Error saving record:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
});
