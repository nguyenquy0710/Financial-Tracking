# Đăng ký và Đăng nhập 🔐

Hướng dẫn tạo tài khoản và đăng nhập vào FinTrack.

## 📝 Đăng ký tài khoản mới

### Bước 1: Truy cập trang đăng ký

Mở trình duyệt và truy cập: http://localhost:3000/register

### Bước 2: Điền thông tin

Điền đầy đủ các thông tin sau:

- **Họ và tên** (bắt buộc): Tên hiển thị của bạn
- **Email** (bắt buộc): Địa chỉ email hợp lệ, sẽ dùng để đăng nhập
- **Số điện thoại**: Số điện thoại liên hệ (tùy chọn)
- **Mật khẩu** (bắt buộc): 
  - Tối thiểu 8 ký tự
  - Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
- **Xác nhận mật khẩu** (bắt buộc): Nhập lại mật khẩu để xác nhận

### Bước 3: Chọn ngôn ngữ và tiền tệ

- **Ngôn ngữ**: 
  - Tiếng Việt (vi)
  - English (en)
- **Tiền tệ**:
  - VND (Đồng Việt Nam)
  - USD (Dollar Mỹ)
  - EUR (Euro)

### Bước 4: Hoàn tất đăng ký

1. Đọc và đồng ý với điều khoản sử dụng
2. Click nút "Đăng ký" / "Register"
3. Hệ thống sẽ tự động đăng nhập và chuyển bạn đến Dashboard

## 🔑 Đăng nhập

### Đăng nhập thông thường

1. Truy cập: http://localhost:3000/login
2. Nhập email và mật khẩu
3. Click "Đăng nhập" / "Login"

### Tính năng "Ghi nhớ đăng nhập"

- Tích vào ô "Ghi nhớ tôi" / "Remember me" để không phải đăng nhập lại trong 7 ngày
- Token sẽ được lưu an toàn trong trình duyệt

## 🔐 Xác thực 2 yếu tố (2FA/TOTP)

Để bảo mật cao hơn, bạn nên kích hoạt xác thực 2 yếu tố.

### Kích hoạt 2FA

1. Đăng nhập vào tài khoản
2. Vào **Cài đặt** > **Bảo mật**
3. Click "Kích hoạt xác thực 2 yếu tố"
4. Quét mã QR bằng ứng dụng Authenticator:
   - Google Authenticator
   - Microsoft Authenticator
   - Authy
5. Nhập mã 6 số từ ứng dụng để xác nhận
6. Lưu các mã backup để phòng trường hợp mất điện thoại

### Đăng nhập với 2FA

1. Nhập email và mật khẩu như bình thường
2. Hệ thống sẽ yêu cầu mã TOTP
3. Mở ứng dụng Authenticator
4. Nhập mã 6 số hiển thị
5. Click "Xác nhận"

**Lưu ý**: Mã TOTP thay đổi mỗi 30 giây

Xem chi tiết tại: **[Xác thực 2 yếu tố (TOTP)](Xac-thuc-2-yeu-to)**

## 🔓 Quên mật khẩu

### Khôi phục mật khẩu

1. Click "Quên mật khẩu?" trên trang đăng nhập
2. Nhập email đã đăng ký
3. Click "Gửi link khôi phục"
4. Kiểm tra email và click vào link khôi phục
5. Nhập mật khẩu mới
6. Xác nhận và đăng nhập lại

**Lưu ý**: Link khôi phục có hiệu lực trong 1 giờ

## 🚪 Đăng xuất

Để đăng xuất khỏi tài khoản:

1. Click vào tên người dùng ở góc trên bên phải
2. Chọn "Đăng xuất" / "Logout"
3. Hoặc truy cập: http://localhost:3000/logout

## ⚠️ Lưu ý bảo mật

### Mật khẩu mạnh

✅ **Nên**:
- Sử dụng ít nhất 12 ký tự
- Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
- Sử dụng mật khẩu khác nhau cho mỗi dịch vụ
- Dùng trình quản lý mật khẩu (LastPass, 1Password, Bitwarden)

❌ **Không nên**:
- Dùng thông tin cá nhân dễ đoán (tên, ngày sinh, số điện thoại)
- Dùng mật khẩu quá đơn giản (123456, password, qwerty)
- Chia sẻ mật khẩu với người khác
- Lưu mật khẩu trong file text hoặc ghi chú không mã hóa

### Bảo vệ tài khoản

- Kích hoạt xác thực 2 yếu tố (2FA)
- Không đăng nhập trên máy tính công cộng
- Luôn đăng xuất sau khi sử dụng
- Kiểm tra các phiên đăng nhập trong Cài đặt
- Thay đổi mật khẩu định kỳ (3-6 tháng)

## 🔍 Kiểm tra phiên đăng nhập

Xem các thiết bị đang đăng nhập vào tài khoản của bạn:

1. Vào **Cài đặt** > **Bảo mật**
2. Xem danh sách "Phiên đăng nhập hoạt động"
3. Hiển thị:
   - Thiết bị
   - Trình duyệt
   - Địa chỉ IP
   - Thời gian đăng nhập
4. Có thể đăng xuất khỏi các phiên cụ thể

## 🆘 Gặp vấn đề?

### Không nhận được email khôi phục mật khẩu

1. Kiểm tra thư mục Spam/Junk
2. Đợi 5-10 phút (có thể bị delay)
3. Thử gửi lại
4. Liên hệ admin nếu vẫn không nhận được

### Không thể đăng nhập

**Kiểm tra**:
- Email có đúng không? (kiểm tra chính tả, khoảng trắng)
- Caps Lock có bật không?
- Mật khẩu có đúng không?

**Thử**:
- Xóa cache và cookies của trình duyệt
- Thử trình duyệt khác
- Khôi phục mật khẩu

### Mất thiết bị 2FA

Nếu mất điện thoại có ứng dụng Authenticator:

1. Sử dụng mã backup đã lưu khi kích hoạt 2FA
2. Hoặc liên hệ admin với thông tin xác thực để tắt 2FA

**Quan trọng**: Luôn lưu mã backup ở nơi an toàn!

## 📱 Đăng nhập trên nhiều thiết bị

Bạn có thể đăng nhập FinTrack trên nhiều thiết bị:

- Máy tính desktop
- Laptop
- Tablet
- Smartphone (qua trình duyệt)

Dữ liệu sẽ được đồng bộ tự động giữa các thiết bị.

## 🔐 Tính năng bảo mật

### JWT Token

- Mỗi phiên đăng nhập được cấp một JWT token
- Token có thời hạn (mặc định 7 ngày)
- Token được mã hóa an toàn
- Tự động làm mới khi còn hiệu lực

### Mã hóa mật khẩu

- Mật khẩu được hash bằng bcrypt
- Không ai có thể xem mật khẩu gốc (kể cả admin)
- Salt rounds cao để chống brute force

### HTTPS/TLS

Trong môi trường production:
- Tất cả kết nối sử dụng HTTPS
- Certificate SSL/TLS được cập nhật tự động
- Bảo vệ dữ liệu trong quá trình truyền tải

## 📚 Các bước tiếp theo

Sau khi đăng nhập thành công:

1. **[Giao diện tổng quan](Giao-dien-Tong-quan)** - Làm quen với Dashboard
2. **[Bắt đầu nhanh](Bat-dau-Nhanh)** - Các bước đầu tiên
3. **[Cài đặt cá nhân](Cai-dat-Ca-nhan)** - Tùy chỉnh tài khoản

---

[⬅️ Hướng dẫn cài đặt](Huong-dan-Cai-dat) | [➡️ Bắt đầu nhanh](Bat-dau-Nhanh)
