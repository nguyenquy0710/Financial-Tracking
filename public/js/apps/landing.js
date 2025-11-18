class AppLandingPage extends AppSDK {

  constructor(baseURL = AppSDK.BASE_URL || window.location.origin) {
    super(baseURL);
  }

}

// =============================================
// Xuất module cho Node.js / Electron
// hoặc gán vào window cho browser
// =============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppLandingPage; // Cho Node.js / Electron
} else {
  window.AppLandingPage = AppLandingPage; // Cho browser
}

// =============================================
// Khởi tạo SDK với cấu hình authToken
// Nếu chạy trên browser đã import <script src="js/apps/landing.js"></script>
// =============================================
const sdkLanding = new AppLandingPage(baseURL = AppSDK.BASE_URL || window.location.origin);

// Lắng nghe sự kiện thay đổi trạng thái API
sdkLanding.onStatusChange = (status) => {
  console.log("✅ API Status:", status);
};

// Lắng nghe sự kiện lỗi API toàn cục
sdkLanding.onError = (err) => {
  console.error("⚠️ API Error:", err);
  if (err) {
    AppSDK.Alert.show({
      icon: AppSDK.Enums.AlertIcon.ERROR,
      title: "Lỗi kết nối",
      text: "Không thể kết nối tới API!"
    });
  }
};

// =============================================
// Tự động kiểm tra xác thực khi tải trang
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Kiểm tra trạng thái API khi tải trang
  // sdkLanding.checkAPIHealth();

  // Bắt đầu auto-check mỗi 30s
  // sdkLanding.startAutoCheck(30000);
});
