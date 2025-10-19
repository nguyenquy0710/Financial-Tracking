class AppAuthSDK extends AppSDK {

  constructor(baseURL = AppSDK.BASE_URL || window.location.origin) {
    super(baseURL);

    // Optional: initialize default handlers
    this.onStatusChange = () => { };
    this.onError = () => { };
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem(window.AppSDK.Enums.KeyStorage.AUTH_TOKEN || 'authToken');
  }

  // Set auth token to localStorage
  setAuthToken(token) {
    localStorage.setItem(window.AppSDK.Enums.KeyStorage.AUTH_TOKEN || 'authToken', token);
    this.onStatusChange && this.onStatusChange({ online: true });
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem(window.AppSDK.Enums.KeyStorage.AUTH_TOKEN || 'authToken');
    this.onStatusChange && this.onStatusChange({ online: false });
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken();
    return !!token; // Trả về true nếu token tồn tại
  }

  // Logout function
  logout() {
    this.removeAuthToken();

    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    this.onStatusChange && this.onStatusChange({ online: false });

    window.location.href = '/login?logout=true&redirect=' + encodeURIComponent(window.location.pathname);
  }

  // API call with authentication
  async callApiWithAuth(endpoint,
    method = 'GET',
    data = null,
    options = {
      method: 'GET',
      headers: {},
    }
  ) {
    const token = this.getAuthToken();

    const config = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Thêm token vào header nếu có
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${AppSDK.API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          this.logout();
          return;
        }
        throw new Error(data.message || 'API call failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

}

// =============================================
// Xuất module cho Node.js / Electron
// hoặc gán vào window cho browser
// =============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppAuthSDK; // Cho Node.js / Electron
} else {
  window.AppAuthSDK = AppAuthSDK; // Cho browser
}

// =============================================
// Khởi tạo SDK với cấu hình authToken
// Nếu chạy trên browser đã import <script src="main-apps.js"></script>
// =============================================
const sdkAuth = new AppAuthSDK(baseURL = AppSDK.BASE_URL || window.location.origin);

// Lắng nghe sự kiện thay đổi
sdkAuth.onStatusChange = (status) => {
  console.log("✅ API Status:", status);
};

sdkAuth.onError = (err) => {
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
// Check authentication on page load for protected pages
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;
  const publicPages = ['/', '/login', '/register', '/changelog'];

  if (!publicPages.includes(currentPage) && !sdkAuth.isAuthenticated()) {
    window.location.href = '/login?redirectUrl=' + encodeURIComponent(currentPage);
  }
});

// Attach logout function to logout button if exists
const logoutButtons = document.getElementsByClassName("btn-logout");
Array.from(logoutButtons).forEach(button => {
  button.addEventListener("click", sdkAuth.logout.bind(sdkAuth));
});
