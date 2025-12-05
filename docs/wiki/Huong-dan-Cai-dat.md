# Hướng dẫn cài đặt FinTrack 🚀

Hướng dẫn này sẽ giúp bạn cài đặt FinTrack trên máy tính của mình.

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt:

- **Node.js** phiên bản 18.0.0 trở lên ([Tải về](https://nodejs.org/))
- **MongoDB** phiên bản 4.4 trở lên ([Tải về](https://www.mongodb.com/try/download/community))
- **npm** phiên bản 9.0.0 trở lên (đi kèm với Node.js)
- **Git** (để clone repository)

### Kiểm tra phiên bản

Mở Terminal (hoặc Command Prompt trên Windows) và chạy các lệnh sau:

```bash
node --version    # Phải >= v18.0.0
npm --version     # Phải >= 9.0.0
git --version     # Bất kỳ phiên bản nào
```

## 📥 Bước 1: Clone Repository

Tải mã nguồn về máy tính:

```bash
git clone https://github.com/nguyenquy0710/Financial-Tracking.git
cd Financial-Tracking
```

## 📦 Bước 2: Cài đặt Dependencies

Cài đặt các thư viện cần thiết:

```bash
npm install
```

Quá trình này có thể mất vài phút. Hãy kiên nhẫn đợi cho đến khi hoàn tất.

## ⚙️ Bước 3: Cấu hình môi trường

### 3.1. Tạo file cấu hình

Sao chép file mẫu cấu hình:

```bash
cp .env.example .env
```

### 3.2. Chỉnh sửa file .env

Mở file `.env` bằng trình soạn thảo văn bản và điều chỉnh các thông số:

```env
# Cổng server
PORT=3000

# Môi trường (development hoặc production)
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/fintrack
MONGODB_URI_TEST=mongodb://localhost:27017/fintrack_test

# JWT Secret (Đổi thành chuỗi ngẫu nhiên trong production)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# Cloudflare Turnstile (tùy chọn)
CLOUDFLARE_TURNSTILE_SECRET_KEY=your-turnstile-secret-key
CLOUDFLARE_TURNSTILE_SITE_KEY=your-turnstile-site-key

# MISA Money Keeper Integration (tùy chọn)
MISA_BASE_URL=https://app.misacdn.com
MISA_AUTH_URL=https://actapp.misa.vn
```

### 3.3. Các cấu hình quan trọng

#### MongoDB URI

- **Mặc định**: `mongodb://localhost:27017/fintrack`
- Nếu MongoDB của bạn chạy trên cổng khác hoặc có authentication, hãy điều chỉnh URI tương ứng
- Ví dụ với authentication: `mongodb://username:password@localhost:27017/fintrack`

#### JWT Secret

- Đây là khóa bí mật để mã hóa JWT token
- **Quan trọng**: Thay đổi giá trị mặc định trong môi trường production
- Có thể tạo chuỗi ngẫu nhiên bằng: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 🗄️ Bước 4: Khởi động MongoDB

### Cách 1: Sử dụng Docker (Khuyến nghị)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Cách 2: Cài đặt MongoDB trực tiếp

- **Windows**: Tải và cài đặt từ [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Xem hướng dẫn tại [MongoDB Installation](https://www.mongodb.com/docs/manual/installation/)

Sau khi cài đặt, khởi động MongoDB:

```bash
# macOS/Linux
sudo systemctl start mongod

# Windows
# MongoDB sẽ tự động chạy như một Windows Service
```

### Kiểm tra MongoDB

Kiểm tra xem MongoDB đã chạy chưa:

```bash
# Kết nối đến MongoDB shell
mongosh

# Hoặc kiểm tra port
netstat -an | grep 27017
```

## 🏗️ Bước 5: Build dự án

Biên dịch TypeScript và chuẩn bị các file cần thiết:

```bash
npm run build
```

## 🎲 Bước 6: Khởi tạo Database (Tùy chọn)

Nếu bạn muốn có dữ liệu mẫu để thử nghiệm:

```bash
npm run init:db
```

Lệnh này sẽ tạo:
- Tài khoản admin mặc định
- Các danh mục thu chi chuẩn
- Dữ liệu mẫu (nếu có)

### Thông tin đăng nhập mặc định

Sau khi khởi tạo, bạn có thể đăng nhập với:
- **Email**: admin@fintrack.com (hoặc xem trong console output)
- **Mật khẩu**: Được hiển thị trong console sau khi chạy lệnh init

## ▶️ Bước 7: Chạy ứng dụng

### Chế độ Development (Phát triển)

```bash
npm run dev
```

Ứng dụng sẽ chạy với hot-reload, tự động khởi động lại khi bạn thay đổi code.

### Chế độ Production (Triển khai)

```bash
npm start
```

## 🌐 Bước 8: Truy cập ứng dụng

Mở trình duyệt và truy cập:

- **Web UI**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Login Page**: http://localhost:3000/login

## ✅ Xác nhận cài đặt thành công

Bạn sẽ thấy thông báo trong terminal:

```
🚀 Server is running on port 3000
✅ MongoDB connected successfully
🌐 Access the application at: http://localhost:3000
📚 API Documentation: http://localhost:3000/api-docs
```

Nếu bạn thấy các thông báo này, chúc mừng! Bạn đã cài đặt thành công FinTrack.

## 🔧 Khắc phục sự cố

### Lỗi: MongoDB connection failed

**Nguyên nhân**: MongoDB chưa được khởi động hoặc URI không đúng

**Giải pháp**:
1. Kiểm tra MongoDB đã chạy: `mongosh` hoặc `mongo`
2. Kiểm tra URI trong file `.env`
3. Kiểm tra firewall không chặn port 27017

### Lỗi: Port 3000 already in use

**Nguyên nhân**: Có ứng dụng khác đang sử dụng port 3000

**Giải pháp**:
1. Thay đổi `PORT` trong file `.env` thành số khác (ví dụ: 3001)
2. Hoặc tắt ứng dụng đang sử dụng port 3000:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### Lỗi: npm install fails

**Nguyên nhân**: Vấn đề với npm hoặc network

**Giải pháp**:
1. Xóa `node_modules` và thử lại:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Thử dùng npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```
3. Kiểm tra kết nối internet

### Lỗi: Build fails

**Nguyên nhân**: TypeScript compilation error

**Giải pháp**:
1. Kiểm tra Node.js version >= 18.0.0
2. Xóa thư mục `dist` và build lại:
   ```bash
   npm run clean
   npm run build
   ```

## 📚 Các bước tiếp theo

Sau khi cài đặt thành công, bạn có thể:

1. **[Đăng ký tài khoản](Dang-ky-va-Dang-nhap)** - Tạo tài khoản người dùng
2. **[Bắt đầu nhanh](Bat-dau-Nhanh)** - Tìm hiểu các tính năng cơ bản
3. **[Cấu hình cá nhân](Cai-dat-Ca-nhan)** - Tùy chỉnh ứng dụng theo ý bạn

## 🆘 Cần trợ giúp?

Nếu bạn gặp vấn đề trong quá trình cài đặt:

- Xem thêm tại **[Khắc phục sự cố](Khac-phuc-Su-co)**
- Mở issue tại [GitHub Issues](https://github.com/nguyenquy0710/Financial-Tracking/issues)
- Tham gia thảo luận tại [GitHub Discussions](https://github.com/nguyenquy0710/Financial-Tracking/discussions)

---

[⬅️ Quay lại trang chủ](Home) | [➡️ Đăng ký và Đăng nhập](Dang-ky-va-Dang-nhap)
