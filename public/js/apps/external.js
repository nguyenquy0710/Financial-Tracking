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

  /**
   * Hàm gắn sự kiện định dạng tiền tệ cho 1 input
   * @param {*} inputElement - phần tử input HTML
   * @param {*} options - các tùy chọn định dạng
   */
  static applyCurrencyFormat(inputElement, options = {}) {
    const defaultOptions = {
      locale: 'vi-VN',
      // currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };
    const config = { ...defaultOptions, ...options };

    // Helper: làm sạch và chuyển chuỗi thành số
    const parseNumber = (str) => Number(str.replace(/[^\d.-]/g, ''));

    // Khi blur: format lại hiển thị và lưu giá trị gốc vào data-input
    inputElement.addEventListener('blur', (e) => {
      const rawValue = parseNumber(e.target.value);
      if (isNaN(rawValue) || e.target.value === '') return;

      // Lưu giá trị gốc (số) vào data attribute
      e.target.dataset.input = rawValue;

      // Hiển thị dạng tiền tệ
      e.target.value = rawValue.toLocaleString(config.locale, {
        // style: 'currency',
        // currency: config.currency,
        minimumFractionDigits: config.minimumFractionDigits,
        maximumFractionDigits: config.maximumFractionDigits,
        ...config,
      });
    });

    // Khi focus: gỡ định dạng, hiển thị lại số gốc
    inputElement.addEventListener('focus', (e) => {
      const rawValue = e.target.dataset.input
        ? e.target.dataset.input
        : parseNumber(e.target.value);
      e.target.value = rawValue || '';
    });

    // Khi gõ: cập nhật giá trị gốc liên tục
    inputElement.addEventListener('input', (e) => {
      const rawValue = parseNumber(e.target.value);
      e.target.dataset.input = isNaN(rawValue) ? '' : rawValue;
    });
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
