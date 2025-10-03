# FinTrack Authentication Flow

## Tổng quan / Overview

Tài liệu này mô tả chi tiết luồng xác thực (authentication flow) trong ứng dụng FinTrack, bao gồm đăng ký, đăng nhập và xử lý kết quả sau khi gọi API để chuyển đến các bước tiếp theo của ứng dụng.

This document describes in detail the authentication flow in the FinTrack application, including registration, login, and handling results after API calls to proceed to the next steps of the application.

## Kiến trúc / Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │  HTTP   │   Express   │  Auth   │   MongoDB   │
│  (Browser)  │ ◄─────► │   Server    │ ◄─────► │  Database   │
│   jQuery    │         │   Node.js   │         │  Mongoose   │
└─────────────┘         └─────────────┘         └─────────────┘
```

## 1. Luồng Đăng Ký / Registration Flow

### Frontend: `/public/js/register.js`

#### Bước 1: Người dùng điền form
```javascript
- Họ và tên (name)
- Email
- Mật khẩu (password) 
- Xác nhận mật khẩu (confirm password)
- Đồng ý điều khoản (terms acceptance)
```

#### Bước 2: Validation phía client
```javascript
validateEmail(email)     // Kiểm tra định dạng email
password.length >= 6     // Mật khẩu tối thiểu 6 ký tự
password === confirmPassword  // Xác nhận mật khẩu khớp
terms === true           // Chấp nhận điều khoản
```

#### Bước 3: Gọi API
```javascript
$.ajax({
    url: '/api/auth/register',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ 
        name,
        email, 
        password,
        language: 'vi',
        currency: 'VND'
    })
})
```

#### Bước 4: Xử lý kết quả thành công
```javascript
if (response.success) {
    // Lưu token xác thực
    localStorage.setItem('authToken', response.data.token);
    
    // Lưu thông tin người dùng
    localStorage.setItem('userName', response.data.user.name);
    localStorage.setItem('userEmail', response.data.user.email);
    
    // Hiển thị thông báo thành công
    showAlert('Đăng ký thành công! Đang chuyển hướng...', 'success');
    
    // Chuyển hướng đến dashboard
    window.location.href = '/dashboard.html';
}
```

#### Bước 5: Xử lý lỗi
```javascript
catch (error) {
    // Xử lý các loại lỗi khác nhau
    if (error.responseJSON) {
        errorMessage = error.responseJSON.message;
    }
    
    // Hiển thị thông báo lỗi
    showAlert(errorMessage, 'danger');
    
    // Hiệu ứng shake cho form
    $('.card').addClass('shake');
}
```

### Backend: `/src/controllers/authController.js` - register()

#### Bước 1: Kiểm tra user đã tồn tại
```javascript
const existingUser = await User.findOne({ email });
if (existingUser) {
    return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
    });
}
```

#### Bước 2: Tạo user mới
```javascript
const user = await User.create({
    email,
    password,  // Tự động hash bởi pre-save hook
    name,
    phone,
    language,
    currency
});
```

#### Bước 3: Tạo JWT token
```javascript
const generateToken = userId => {
    return jwt.sign(
        { userId }, 
        config.jwt.secret, 
        { expiresIn: config.jwt.expiresIn }  // 7 days
    );
};
```

#### Bước 4: Trả về response
```javascript
res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
        user,
        token
    }
});
```

## 2. Luồng Đăng Nhập / Login Flow

### Frontend: `/public/js/login.js`

#### Bước 1: Validation
```javascript
validateEmail(email)     // Kiểm tra email hợp lệ
password.length >= 6     // Kiểm tra độ dài mật khẩu
```

#### Bước 2: Gọi API
```javascript
$.ajax({
    url: '/api/auth/login',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email, password })
})
```

#### Bước 3: Xử lý thành công
```javascript
if (response.success) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('userName', response.data.user.name);
    localStorage.setItem('userEmail', response.data.user.email);
    
    showAlert('Đăng nhập thành công!', 'success');
    window.location.href = '/dashboard.html';
}
```

### Backend: `/src/controllers/authController.js` - login()

#### Bước 1: Tìm user
```javascript
const user = await User.findOne({ email }).select('+password');
if (!user) {
    return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
    });
}
```

#### Bước 2: Xác thực mật khẩu
```javascript
const isPasswordValid = await user.comparePassword(password);
if (!isPasswordValid) {
    return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
    });
}
```

#### Bước 3: Tạo token và trả về
```javascript
const token = generateToken(user._id);
user.password = undefined;  // Xóa password khỏi response

res.json({
    success: true,
    message: 'Login successful',
    data: { user, token }
});
```

## 3. Các Bước Tiếp Theo / Next Steps

### Dashboard Loading: `/public/js/dashboard.js`

#### Bước 1: Kiểm tra authentication
```javascript
// Từ auth.js - DOMContentLoaded
const currentPage = window.location.pathname;
const publicPages = ['/', '/index.html', '/login.html', '/register.html'];

if (!publicPages.includes(currentPage) && !isAuthenticated()) {
    window.location.href = '/login.html';
}
```

#### Bước 2: Load thông tin user
```javascript
const loadUserInfo = async () => {
    const data = await apiCall('/auth/me');
    if (data.success && data.data) {
        document.getElementById('user-name').textContent = data.data.name;
    }
};
```

#### Bước 3: Load dữ liệu tài chính
```javascript
// Load thu nhập
const salaryData = await apiCall('/salaries?startDate=...&endDate=...');

// Load chi tiêu
const expenseData = await apiCall('/expenses?startDate=...&endDate=...');

// Load tiền thuê
const rentalData = await apiCall('/rentals?startDate=...&endDate=...');

// Tính toán tiết kiệm
const savings = totalIncome - totalExpense - totalRent;
```

### API Call Helper: `/public/js/auth.js`

```javascript
const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        },
        ...options
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
        logout();  // Tự động đăng xuất nếu token hết hạn
        return;
    }
    
    return await response.json();
};
```

## 4. Bảo mật / Security

### JWT Authentication: `/src/middleware/auth.js`

```javascript
const auth = async (req, res, next) => {
    // Lấy token từ header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Xác thực token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Tìm user
    const user = await User.findById(decoded.userId).select('-password');
    
    // Thêm user vào request
    req.user = user;
    req.userId = user._id;
    
    next();
};
```

### Password Hashing: `/src/models/User.js`

```javascript
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
```

## 5. Xử lý Lỗi / Error Handling

### Các loại lỗi được xử lý:

#### Registration Errors
- ✅ Email đã tồn tại → "Email này đã được đăng ký..."
- ✅ Validation thất bại → Hiển thị lỗi cụ thể cho từng field
- ✅ Network error → "Đăng ký thất bại. Vui lòng thử lại."

#### Login Errors
- ✅ Thông tin không hợp lệ → "Email hoặc mật khẩu không đúng"
- ✅ User không tồn tại → "Email hoặc mật khẩu không đúng"
- ✅ Network error → "Đăng nhập thất bại. Vui lòng thử lại."

#### Dashboard Errors
- ✅ Không có token → Chuyển hướng đến /login.html
- ✅ Token không hợp lệ → Đăng xuất + Chuyển hướng
- ✅ Token hết hạn → Đăng xuất + Chuyển hướng
- ✅ 401 response → Đăng xuất + Chuyển hướng

## 6. Testing

### Unit Tests: `/tests/auth.test.js`

```javascript
describe('POST /api/auth/register', () => {
    it('should register a new user');
    it('should not register user with existing email');
    it('should validate required fields');
});

describe('POST /api/auth/login', () => {
    it('should login with correct credentials');
    it('should not login with incorrect password');
    it('should not login with non-existent email');
});

describe('GET /api/auth/me', () => {
    it('should get current user with valid token');
    it('should not get user without token');
    it('should not get user with invalid token');
});
```

## 7. API Endpoints

### Public Routes
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập

### Protected Routes (Require Authentication)
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật profile
- `PUT /api/auth/change-password` - Đổi mật khẩu

## 8. Flow Diagram

```
┌─────────────┐                                     ┌─────────────┐
│   Client    │                                     │   Server    │
└──────┬──────┘                                     └──────┬──────┘
       │                                                   │
       │  1. POST /api/auth/register                      │
       │     { name, email, password }                    │
       ├──────────────────────────────────────────────────►
       │                                                   │
       │                      2. Check existing user      │
       │                      3. Hash password            │
       │                      4. Create user              │
       │                      5. Generate JWT token       │
       │                                                   │
       │  6. Response { success, data: { user, token } }  │
       ◄──────────────────────────────────────────────────┤
       │                                                   │
       │  7. Store token & user info in localStorage      │
       │  8. Redirect to /dashboard.html                  │
       │                                                   │
       │  9. GET /api/auth/me                             │
       │     Authorization: Bearer <token>                │
       ├──────────────────────────────────────────────────►
       │                                                   │
       │                      10. Verify JWT token        │
       │                      11. Find user               │
       │                                                   │
       │  12. Response { success, data: { user } }        │
       ◄──────────────────────────────────────────────────┤
       │                                                   │
       │  13. Load financial data with authenticated      │
       │      API calls (salaries, expenses, rentals)     │
       ├──────────────────────────────────────────────────►
       │                                                   │
       │  14. Display dashboard                           │
       │                                                   │
```

## 9. Kết luận / Conclusion

✅ **Hoàn thiện** - Authentication flow đã được triển khai đầy đủ và hoạt động ổn định.

- Đăng ký và đăng nhập đều gọi API và xử lý kết quả đúng cách
- Token được lưu trữ an toàn trong localStorage
- Sau khi xác thực thành công, người dùng được chuyển hướng đến dashboard
- Dashboard tự động load dữ liệu tài chính sử dụng authenticated API calls
- Tất cả các trường hợp lỗi đều được xử lý với thông báo thân thiện

✅ **Complete** - The authentication flow is fully implemented and works reliably.

- Registration and login both call APIs and handle results correctly
- Tokens are stored securely in localStorage
- After successful authentication, users are redirected to the dashboard
- Dashboard automatically loads financial data using authenticated API calls
- All error cases are handled with user-friendly messages

## 10. Tài liệu tham khảo / References

- [JWT.io](https://jwt.io/) - JSON Web Token documentation
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing
- [Express.js](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
