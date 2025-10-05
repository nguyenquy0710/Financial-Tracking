// apps-main.js
class AppSDK {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.intervalId = null;
    this.onStatusChange = null; // callback khi trạng thái thay đổi
    this.onError = (err) => { }; // callback khi có lỗi
  }

  // Hàm hủy và dọn dẹp
  destroy() {
    this.stopAutoCheck();
    this.onStatusChange = null;
    this.onError = (err) => { }; // callback khi có lỗi
  }

  // Hàm kiểm tra API health
  async checkAPIHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      const data = await response.json();
      console.log("🚀 AppSDK: checkAPIHealth ->", data);

      if (data.success) {
        const uptimeSeconds = Math.floor(data.uptime);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);

        const result = {
          online: true,
          uptime: `${hours}h ${minutes}m`,
          raw: data
        };

        if (this.onStatusChange) this.onStatusChange(result);
        return result;
      } else {
        const result = { online: false, error: "API returned fail", raw: data };
        if (this.onStatusChange) this.onStatusChange(result);

        // Gọi SweetAlert2
        this.sweetAlert({
          icon: AppSDK.Enums.AlertIcon.ERROR,
          title: "API Offline",
          text: "Máy chủ API hiện không phản hồi!"
        });

        return result;
      }
    } catch (error) {
      console.error("❌ AppSDK: Failed to check API health:", error);
      if (this.onError) this.onError(error);

      this.sweetAlert({
        icon: AppSDK.Enums.AlertIcon.WARNING,
        title: "Kết nối thất bại",
        text: "Không thể kết nối tới API. Vui lòng kiểm tra lại!"
      });

      return { online: false, error };
    }
  }

  // Bắt đầu auto-check
  startAutoCheck(intervalMs = 30000) {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.checkAPIHealth(), intervalMs);
    this.checkAPIHealth(); // chạy ngay lần đầu
  }

  // Dừng auto-check
  stopAutoCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// =============================================
// Metadata (thông tin) của SDK
// =============================================
AppSDK.VERSION = "1.0.0";
AppSDK.AUTHOR = "Nguyen Quy";
AppSDK.LICENSE = "MIT";
AppSDK.BASE_URL = window.location.origin ?? "http://localhost:3000"; // Thay đổi URL base của API nếu cần
AppSDK.API_BASE_URL = AppSDK.BASE_URL + "/api"; // URL base cho API

// =============================================
// Các enum (hằng số) dùng trong SDK
// =============================================
AppSDK['Enums'] = Object.freeze({
  AlertIcon: Object.freeze({
    SUCCESS: "success",
    ERROR: "error",
    INFO: "info",
    WARNING: "warning"
  }),
  Status: Object.freeze({
    ONLINE: "online",
    OFFLINE: "offline"
  }),
  KeyStorage: Object.freeze({
    AUTH_TOKEN: "authToken",
    USER_NAME: "userName",
    USER_EMAIL: "userEmail"
  }),
});

AppSDK.Alert = {
  // Hàm hiển thị SweetAlert2 (https://sweetalert2.github.io/#examples)
  show: ({ icon = AppSDK.Enums.AlertIcon.INFO, title = "Thông báo", text = "", draggable = false, options = {} } = {}) => {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon, title, text, draggable,
        allowOutsideClick: () => !Swal.isLoading(),
        showClass: {
          popup: `
            animate__animated
            animate__fadeInUp
            animate__faster
          `
        },
        hideClass: {
          popup: `
            animate__animated
            animate__fadeOutDown
            animate__faster
          `
        },
        ...options
      });
    } else {
      console.warn("⚠️ SweetAlert2 (Swal) chưa được nạp. Hãy import script: https://cdn.jsdelivr.net/npm/sweetalert2@11");
      alert(`${title}\n${text}`); // fallback
    }
  },

  success: (text = "Thành công", title = "Thông báo", draggable = false, options = {}) => {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.SUCCESS,
      title, text, draggable, options
    });
  },

  error: (text = "Đã xảy ra lỗi", title = "Thông báo", draggable = false, options = {}) => {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title, text, draggable, options
    });
  },

  info: (text = "Thông tin", title = "Thông báo", draggable = false, options = {}) => {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.INFO,
      title, text, draggable, options
    });
  },

  warning: (text = "Cảnh báo", title = "Thông báo", draggable = false, options = {}) => {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.WARNING,
      title, text, draggable, options
    });
  }

}

// =============================================
// Xuất module cho Node.js / Electron
// hoặc gán vào window cho browser
// =============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppSDK; // Cho Node.js / Electron
} else {
  window.AppSDK = AppSDK; // Cho browser
}

// =============================================
// Khởi tạo SDK với cấu hình authToken
// Nếu chạy trên browser đã import <script src="main-apps.js"></script>
// =============================================
const sdk = new AppSDK(baseURL = AppSDK.BASE_URL);

// Gọi thủ công
// AppSDK.Alert.show({
//   icon: AppSDK.Enums.AlertIcon.SUCCESS,
//   title: "Hoàn tất",
//   draggable: true,
//   text: "API đã phản hồi thành công!"
// });

// Lắng nghe sự kiện thay đổi
sdk.onStatusChange = (status) => {
  console.log("✅ API Status:", status);
  if (status.status === AppSDK.Enums.Status.OFFLINE) {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Mất kết nối",
      text: "API không hoạt động!"
    });
  }

  // Ví dụ cập nhật UI
  // document.getElementById('api-status').textContent = status.online ? '🟢 Online' : '🔴 Offline';
  // document.getElementById('uptime').textContent = status.uptime || '--';
};

sdk.onError = (err) => {
  console.error("⚠️ API Error:", err);
  if (err) {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi kết nối",
      text: "Không thể kết nối tới API!"
    });
  }
};

// Bắt đầu auto-check mỗi 30s
// sdk.startAutoCheck(30000);
