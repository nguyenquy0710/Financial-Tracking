// =============================================
// AppExternal SDK - Module cho các ứng dụng bên ngoài
// =============================================
class AppExternal {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.onError = (err) => { }; // callback khi có lỗi
  }

  // Hàm hủy và dọn dẹp
  destroy() {
    this.onStatusChange = null;
    this.onError = (err) => { }; // callback khi có lỗi
  }

}

// =============================================
// Metadata (thông tin) của SDK
// =============================================
AppExternal.VERSION = '1.0.0';
AppExternal.AUTHOR = 'Nguyen Quy';
AppExternal.LICENSE = 'MIT';
AppExternal.API_BASE_URL = AppSDK.apiBaseURL
  ?? `${window.location.origin ?? "http://localhost:3000"}/api`; // Thay đổi URL base của API nếu cần

// =============================================
// Các module bên ngoài có thể thêm vào đây
// =============================================
AppExternal['VietQR'] = {
  getBanks: async () => {
    try {
      const response = await fetch(`${AppExternal.API_BASE_URL}/externals/vietqr/banks`);
      const data = await response.json();
      return data?.data || [];
    } catch (error) {
      console.error("❌ AppExternal: Failed to get banks:", error);
      return [];
    }
  },
};

// =============================================
// Xuất module cho Node.js / Electron
// hoặc gán vào window cho browser
// =============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppExternal; // Cho Node.js / Electron
} else {
  window.AppExternal = AppExternal; // Cho browser
}
