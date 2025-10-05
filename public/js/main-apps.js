// main-apps.js
class AppSDK {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.intervalId = null;
    this.onStatusChange = null; // callback khi trạng thái thay đổi
    this.onError = null; // callback khi có lỗi
  }

  // Hàm hủy và dọn dẹp
  destroy() {
    this.stopAutoCheck();
    this.onStatusChange = null;
    this.onError = null;
  }

  // Hàm hiển thị SweetAlert2 (https://sweetalert2.github.io/#examples)
  sweetAlert({ icon = "info", title = "Thông báo", text = "", draggable = false } = {}) {
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
        }
      });
    } else {
      console.warn("⚠️ SweetAlert2 (Swal) chưa được nạp. Hãy import script: https://cdn.jsdelivr.net/npm/sweetalert2@11");
      alert(`${title}\n${text}`); // fallback
    }
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
          icon: "error",
          title: "API Offline",
          text: "Máy chủ API hiện không phản hồi!"
        });

        return result;
      }
    } catch (error) {
      console.error("❌ AppSDK: Failed to check API health:", error);
      if (this.onError) this.onError(error);

      this.sweetAlert({
        icon: "warning",
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

// Xuất module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppSDK; // Cho Node.js / Electron
} else {
  window.AppSDK = AppSDK; // Cho browser
}

// =============================================
// Khởi tạo SDK
// Nếu chạy trên browser đã import <script src="main-apps.js"></script>
// =============================================
const sdk = new AppSDK("http://localhost:3000");

// Gọi thủ công
// sdk.sweetAlert({
//   icon: "success",
//   title: "Hoàn tất",
//   draggable: true,
//   text: "API đã phản hồi thành công!"
// });

// Lắng nghe sự kiện thay đổi
sdk.onStatusChange = (status) => {
  console.log("✅ API Status:", status);

  // Ví dụ cập nhật UI
  // document.getElementById('api-status').textContent = status.online ? '🟢 Online' : '🔴 Offline';
  // document.getElementById('uptime').textContent = status.uptime || '--';
};

sdk.onError = (err) => {
  console.error("⚠️ API Error:", err);
};

// Bắt đầu auto-check mỗi 30s
// sdk.startAutoCheck(30000);
