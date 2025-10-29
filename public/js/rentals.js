// js/rentals.js

let properties = [];
let token = sdkAuth.getAuthToken();

// Redirect to login if not authenticated
if (!sdkAuth.isAuthenticated()) {
  window.location.href = `/login?redirectUrl=${encodeURIComponent(window.location.pathname)}`;
}

// Load properties on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadProperties();
});

const loadProperties = async () => {
  const container = document.getElementById('properties-list');
  container.innerHTML = '<p class="loading">Đang tải...</p>';

  try {
    const response = await sdkAuth.callApiWithAuth('/rental-properties');

    if (response.success && response.data) {
      properties = response.data;

      if (properties.length === 0) {
        container.innerHTML = '<p class="loading">Chưa có phòng thuê. Vui lòng thêm phòng mới.</p>';
        // Reset summary cards
        document.getElementById('total-rent').textContent = '0 VND';
        document.getElementById('total-electricity').textContent = '0 VND';
        document.getElementById('total-water').textContent = '0 VND';
        document.getElementById('total-services').textContent = '0 VND';
        return;
      }

      // Calculate totals for active properties
      let totalRent = 0, totalElectricity = 0, totalWater = 0, totalServices = 0;

      properties.forEach(property => {
        if (property.isActive) {
          totalRent += property.rentAmount || 0;
          totalServices += (property.internetFee || 0) + (property.parkingFee || 0) + (property.garbageFee || 0);
        }
      });

      document.getElementById('total-rent').textContent = AppSDK.Utility.formatCurrency(totalRent);
      document.getElementById('total-electricity').textContent = '---';
      document.getElementById('total-water').textContent = '---';
      document.getElementById('total-services').textContent = AppSDK.Utility.formatCurrency(totalServices);

      // Display properties
      container.innerHTML = `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Mã phòng</th>
                                    <th>Tên phòng</th>
                                    <th>Địa chỉ</th>
                                    <th>Tiền nhà</th>
                                    <th>Ngày bắt đầu</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${properties.map(property => `
                                    <tr>
                                        <td><strong>${property.roomCode}</strong></td>
                                        <td>${property.propertyName}</td>
                                        <td>${property.address || 'N/A'}</td>
                                        <td>${AppSDK.Utility.formatCurrency(property.rentAmount)}</td>
                                        <td>${new Date(property.startDate).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span class="badge ${property.isActive ? 'badge-success' : 'badge-secondary'}">
                                                ${property.isActive ? 'Đang thuê' : 'Đã trả phòng'}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-info" onclick="viewPropertyDetails('${property._id}')" title="Xem chi tiết">👁️</button>
                                            <button class="btn btn-sm" onclick="editProperty('${property._id}')" title="Chỉnh sửa">✏️</button>
                                            ${property.isActive ? 
                                              `<button class="btn btn-sm btn-warning" onclick="deactivateProperty('${property._id}')" title="Trả phòng">🔒</button>` : 
                                              ''}
                                            <button class="btn btn-sm btn-danger" onclick="deleteProperty('${property._id}')" title="Xóa">🗑️</button>
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
    console.error('Failed to load rental properties:', error);
    container.innerHTML = '<p class="loading">Lỗi: Không thể tải dữ liệu.</p>';
  }
};

// View property details
const viewPropertyDetails = (propertyId) => {
  window.location.href = `/rentals/${propertyId}/detail`;
};

// Show add property modal
const showAddPropertyModal = () => {
  document.getElementById('propertyModalTitle').textContent = 'Thêm phòng thuê';
  document.getElementById('propertyForm').reset();
  document.getElementById('propertyId').value = '';

  // Set default start date to today
  document.getElementById('startDate').value = new Date().toISOString().split('T')[0];

  document.getElementById('propertyModal').style.display = 'block';
};

const closePropertyModal = () => {
  document.getElementById('propertyModal').style.display = 'none';
};

const editProperty = async (id) => {
  const property = properties.find(p => p._id === id);
  if (!property) return;

  document.getElementById('propertyModalTitle').textContent = 'Chỉnh sửa phòng thuê';
  document.getElementById('propertyId').value = property._id;
  document.getElementById('roomCode').value = property.roomCode;
  document.getElementById('propertyName').value = property.propertyName;
  document.getElementById('address').value = property.address || '';
  document.getElementById('startDate').value = property.startDate ? property.startDate.split('T')[0] : '';
  document.getElementById('rentAmount').value = property.rentAmount || 0;
  
  document.getElementById('initialElectricityReading').value = property.initialElectricityReading || 0;
  document.getElementById('electricityRate').value = property.electricityRate || 0;
  document.getElementById('initialWaterReading').value = property.initialWaterReading || 0;
  document.getElementById('waterRate').value = property.waterRate || 0;
  
  document.getElementById('internetFee').value = property.internetFee || 0;
  document.getElementById('parkingFee').value = property.parkingFee || 0;
  document.getElementById('garbageFee').value = property.garbageFee || 0;
  document.getElementById('notes').value = property.notes || '';

  document.getElementById('propertyModal').style.display = 'block';
};

const deleteProperty = async (id) => {
  const result = await Swal.fire({
    title: 'Xác nhận xóa',
    text: 'Bạn có chắc chắn muốn xóa phòng thuê này? Tất cả dữ liệu liên quan sẽ bị mất.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`/api/rental-properties/${id}`, {
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
        text: 'Xóa phòng thuê thành công!'
      });
      loadProperties();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Lỗi: ' + (data.message || 'Không thể xóa')
      });
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
};

const deactivateProperty = async (id) => {
  const result = await Swal.fire({
    title: 'Xác nhận trả phòng',
    text: 'Bạn có chắc chắn đã trả phòng này?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`/api/rental-properties/${id}/deactivate`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endDate: new Date().toISOString() })
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: 'Đã cập nhật trạng thái phòng!'
      });
      loadProperties();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Lỗi: ' + (data.message || 'Không thể cập nhật')
      });
    }
  } catch (error) {
    console.error('Error deactivating property:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
};

// Handle property form submission
document.getElementById('propertyForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const propertyId = document.getElementById('propertyId').value;

  const propertyData = {
    roomCode: document.getElementById('roomCode').value,
    propertyName: document.getElementById('propertyName').value,
    address: document.getElementById('address').value,
    startDate: new Date(document.getElementById('startDate').value),
    rentAmount: parseFloat(document.getElementById('rentAmount').value) || 0,
    initialElectricityReading: parseFloat(document.getElementById('initialElectricityReading').value) || 0,
    electricityRate: parseFloat(document.getElementById('electricityRate').value) || 0,
    initialWaterReading: parseFloat(document.getElementById('initialWaterReading').value) || 0,
    waterRate: parseFloat(document.getElementById('waterRate').value) || 0,
    internetFee: parseFloat(document.getElementById('internetFee').value) || 0,
    parkingFee: parseFloat(document.getElementById('parkingFee').value) || 0,
    garbageFee: parseFloat(document.getElementById('garbageFee').value) || 0,
    notes: document.getElementById('notes').value
  };

  try {
    const url = propertyId ? `/api/rental-properties/${propertyId}` : '/api/rental-properties';
    const method = propertyId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propertyData)
    });

    const data = await response.json();
    if (data.success) {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.SUCCESS,
        title: "Thành công",
        text: propertyId ? 'Cập nhật phòng thuê thành công!' : 'Thêm phòng thuê thành công!'
      });
      closePropertyModal();
      loadProperties();
    } else {
      AppSDK.Alert.show({
        icon: AppSDK.Enums.AlertIcon.ERROR,
        title: "Lỗi",
        text: 'Lỗi: ' + (data.message || 'Không thể lưu')
      });
    }
  } catch (error) {
    console.error('Error saving property:', error);
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi",
      text: 'Có lỗi xảy ra!'
    });
  }
});
