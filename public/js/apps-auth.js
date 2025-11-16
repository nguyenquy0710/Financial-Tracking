// =============================================
// AppAuthSDK - SDK quản lý xác thực người dùng
// =============================================
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
    {
      headers = {},
      params = {},
      query = {},
      ...selfOptions
    } = {}
  ) {
    const token = this.getAuthToken();
    // const { headers, params, query, ...selfOptions } = options || {};

    // ===== 1️⃣ Thay param trong endpoint (vd: /users/:id => /users/123)
    let url = `${AppSDK.API_BASE_URL}${endpoint}`;

    // Thay các tham số trong URL nếu có params được cung cấp
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, encodeURIComponent(value));
      });
    }

    // ===== 2️⃣ Gắn query string (vd: ?page=1&limit=10)
    if (query && typeof query === 'object' && Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query).toString();
      url += (url.includes('?') ? '&' : '?') + queryString;
    }

    // ===== 3️⃣ Chuẩn bị config
    const config = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...selfOptions
    };

    // ===== 4️⃣ Thêm token vào header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // ===== 5️⃣ Thêm body nếu cần
    if (data && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      config.body = JSON.stringify(data);
    }

    // console.log("🚀 QuyNH: AppAuthSDK -> config", config)

    // ===== 6️⃣ Gọi API
    try {
      const response = await fetch(url, config);
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          // Unauthorized - redirect to login
          this.logout();
          return;
        }
        throw new Error(responseData.message || 'API call failed');
      }

      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      if (this.onError) this.onError(error);
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

// Lắng nghe sự kiện thay đổi trạng thái API
sdkAuth.onStatusChange = (status) => {
  console.log("✅ API Status:", status);
};

// Lắng nghe sự kiện lỗi API toàn cục
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
    window.location.href = '/login?redirect=' + encodeURIComponent(currentPage);
  }
});

// Attach logout function to logout button if exists
const logoutButtons = document.getElementsByClassName("btn-logout");
Array.from(logoutButtons).forEach(button => {
  button.addEventListener("click", sdkAuth.logout.bind(sdkAuth));
});
