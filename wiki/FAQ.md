# Câu hỏi thường gặp (FAQ) ❓

Tổng hợp các câu hỏi thường gặp khi sử dụng FinTrack.

## 🚀 Bắt đầu

### FinTrack là gì?

FinTrack (Financial Tracking) là nền tảng quản lý tài chính cá nhân thông minh, giúp bạn ghi chép thu chi, lập ngân sách, theo dõi mục tiêu tài chính và áp dụng phương pháp 6 Lọ.

### FinTrack có miễn phí không?

Có! FinTrack là phần mềm mã nguồn mở, hoàn toàn miễn phí. Bạn có thể tự cài đặt và sử dụng.

### FinTrack có phiên bản mobile không?

Hiện tại FinTrack là web app, có thể truy cập qua trình duyệt trên điện thoại. Phiên bản mobile app native đang trong kế hoạch phát triển.

### Tôi có cần kiến thức kỹ thuật để cài đặt không?

Có một chút. Bạn cần biết:
- Cài đặt Node.js
- Chạy lệnh trong Terminal
- Cấu hình file .env

Xem chi tiết tại: **[Hướng dẫn cài đặt](Huong-dan-Cai-dat)**

### Có dịch vụ cloud/hosting không?

Hiện tại chưa có dịch vụ cloud chính thức. Bạn cần tự cài đặt trên máy hoặc server của mình. Xem **[Deployment](Cai-dat-Moi-truong-Phat-trien)** để biết cách deploy.

## 💾 Dữ liệu & Bảo mật

### Dữ liệu của tôi được lưu ở đâu?

Dữ liệu được lưu trong MongoDB database trên máy/server của bạn. Bạn hoàn toàn kiểm soát dữ liệu của mình.

### Dữ liệu có được mã hóa không?

Có:
- Mật khẩu được hash bằng bcrypt
- JWT token được mã hóa
- TOTP secret được mã hóa
- Kết nối có thể dùng HTTPS/TLS

### Làm sao để backup dữ liệu?

Có 3 cách:
1. **Export Excel**: Vào Báo cáo > Export > Chọn khoảng thời gian
2. **MongoDB backup**: Dùng `mongodump` để backup database
3. **Sao chép toàn bộ**: Copy thư mục MongoDB data

Khuyến nghị: Backup hàng tháng!

### Nếu mất dữ liệu thì sao?

Nếu có backup:
- Restore từ MongoDB backup
- Hoặc import lại từ file Excel

Nếu không có backup: Rất tiếc không thể khôi phục.

**Lời khuyên**: LUÔN LUÔN backup định kỳ!

### Tôi có thể chuyển dữ liệu sang máy khác không?

Có. Có 2 cách:
1. **Export/Import Excel**: Export từ máy cũ, import vào máy mới
2. **Chuyển database**: Backup MongoDB từ máy cũ, restore vào máy mới

### FinTrack có theo dõi/thu thập dữ liệu của tôi không?

Không! FinTrack chạy hoàn toàn trên máy/server của bạn. Không có dữ liệu nào được gửi về server của chúng tôi.

## 💰 Tài chính & Giao dịch

### Tôi nên thêm giao dịch như thế nào?

**Tốt nhất**: Thêm ngay sau khi phát sinh (trong vòng 1 giờ)
**Chấp nhận được**: Cuối mỗi ngày
**Không nên**: Tích lũy nhiều ngày rồi nhập 1 lúc

### Có cần ghi chép từng khoản chi tiêu nhỏ không?

**Có!** Chi tiêu nhỏ (cafe 30k, ăn vặt 20k...) cộng lại thành số lớn. Ghi chép giúp bạn nhận ra điều này và kiểm soát tốt hơn.

### Làm sao để không quên thêm giao dịch?

Mẹo:
- Đặt reminder trên điện thoại (9PM hàng ngày)
- Dán sticker nhắc nhở trên ví
- Tạo thói quen: Mở FinTrack sau mỗi lần chi tiêu
- Bật thông báo nhắc nhở trong FinTrack

### Tôi có nhiều nguồn thu nhập, quản lý thế nào?

Tạo danh mục con cho từng nguồn:
- Thu nhập > Lương công ty
- Thu nhập > Freelance > Project A
- Thu nhập > Freelance > Project B
- Thu nhập > Đầu tư
- Thu nhập > Thu nhập thụ động

### Chi tiêu vợ/chồng có nên ghi chung không?

**Khuyến nghị**: Mỗi người 1 tài khoản riêng. Sau đó tổng hợp nếu cần.

**Lý do**:
- Tôn trọng quyền riêng tư
- Dễ theo dõi chi tiêu cá nhân
- Tránh nhầm lẫn

**Nếu muốn dùng chung**: Tạo danh mục riêng cho từng người.

### Làm sao để phân biệt chi tiêu cá nhân và gia đình?

Dùng danh mục con:
- Chi tiêu > Cá nhân > Ăn uống
- Chi tiêu > Gia đình > Sinh hoạt
- Chi tiêu > Gia đình > Học phí con

Hoặc dùng tag/nhãn (nếu có hỗ trợ).

## 📊 Ngân sách & Kế hoạch

### Ngân sách nên đặt bao nhiêu?

**Cách tính**:
1. Xem chi tiêu 3 tháng gần nhất
2. Lấy trung bình
3. Cộng thêm 10-15% buffer

**Ví dụ**:
- Tháng 1: 3.2 triệu
- Tháng 2: 3.8 triệu
- Tháng 3: 3.5 triệu
- Trung bình: 3.5 triệu
- Ngân sách đề xuất: 3.5 + 15% = **4 triệu**

### Vượt ngân sách thì làm sao?

**Ngắn hạn**:
- Cắt giảm chi tiêu không cần thiết
- Chuyển tiền từ lọ PLAY sang NEC (tạm thời)

**Dài hạn**:
- Phân tích xem vượt ở đâu
- Điều chỉnh ngân sách thực tế hơn
- Hoặc tìm cách tăng thu nhập

### Ngân sách có nên cố định không?

Không! Nên điều chỉnh theo:
- Mùa vụ (Tết tốn nhiều hơn)
- Hoàn cảnh (có con, mua nhà...)
- Thu nhập thay đổi
- Lạm phát

Review và điều chỉnh hàng quý.

## 🏺 Phương pháp 6 Lọ

### Tôi bắt buộc phải dùng 6 Lọ không?

Không bắt buộc. 6 Lọ là một phương pháp tốt, nhưng bạn có thể:
- Chỉ dùng FinTrack để ghi chép thu chi đơn giản
- Dùng phương pháp khác (50/30/20)
- Tự tạo phương pháp riêng

### Tỷ lệ 55-10-10-10-7-8 có phải cố định không?

Không! Đây chỉ là gợi ý. Điều chỉnh theo hoàn cảnh cá nhân.

Xem chi tiết: **[Phương pháp 6 Lọ](Phuong-phap-6-Lo)**

### Tôi không đủ tiền để chia 6 lọ?

Có thể:
- Giảm % các lọ không cấp thiết (PLAY, GIVE)
- Tăng % NEC lên 70-80%
- Tập trung tăng thu nhập trước

Quan trọng: BẮT ĐẦU TỪ NHỎ, dù mỗi lọ chỉ vài chục nghìn!

### Lọ FFA và LTS khác nhau thế nào?

**FFA (Tự do tài chính)**:
- **Không bao giờ được dùng**
- Chỉ dùng lợi nhuận từ đầu tư
- Mục tiêu: Tạo thu nhập thụ động

**LTS (Tiết kiệm dài hạn)**:
- **Có thể dùng khi cần**
- Cho các mục tiêu cụ thể (mua nhà, xe...)
- Có thể rút ra

### Tôi không biết đầu tư, lọ FFA để đâu?

Nếu chưa biết đầu tư:
- Gửi tiết kiệm ngân hàng (tạm thời)
- Học về đầu tư (dùng lọ EDUC)
- Tham khảo cố vấn tài chính
- Bắt đầu với quỹ mở, ETF (ít rủi ro)

**Không nên**: Để không (bị lạm phát ăn mòn)

## 🔗 Tích hợp

### Có thể kết nối ngân hàng/ví điện tử không?

Hiện tại chưa hỗ trợ kết nối trực tiếp. Bạn cần nhập thủ công hoặc import Excel.

**Đang phát triển**: Tích hợp MoMo, ZaloPay, Banking API

### Làm sao import dữ liệu từ MISA Money Keeper?

Xem hướng dẫn chi tiết: **[Tích hợp MISA](Tich-hop-MISA)**

### Có thể import từ Excel không?

Có! Xem: **[Import Excel](Import-Excel)**

### FinTrack có API không?

Có! FinTrack cung cấp RESTful API đầy đủ.

Xem: **[API Documentation](API-Documentation)**

## 🔐 Bảo mật

### TOTP/2FA là gì? Có cần thiết không?

TOTP (Time-based One-Time Password) hay 2FA là xác thực 2 lớp.

**Rất cần thiết!** Đặc biệt nếu:
- Dữ liệu tài chính nhạy cảm
- Sử dụng qua internet
- Lo ngại bị hack

Xem: **[Xác thực 2 yếu tố](Xac-thuc-2-yeu-to)**

### Tôi quên mật khẩu thì sao?

Dùng chức năng "Quên mật khẩu" trên trang login.

**Nếu không có email**: Liên hệ admin để reset.

**Nếu bạn là admin và quên mật khẩu**: Xem hướng dẫn reset password trong database.

### Làm sao để đổi mật khẩu?

1. Vào **Cài đặt** > **Bảo mật**
2. Click **Đổi mật khẩu**
3. Nhập mật khẩu cũ
4. Nhập mật khẩu mới (2 lần)
5. Lưu

## 🛠️ Kỹ thuật

### MongoDB là gì? Có khó không?

MongoDB là database NoSQL, dễ sử dụng hơn SQL.

**Cài đặt**:
- Windows/Mac: Cài như phần mềm bình thường
- Linux: Dùng package manager
- Docker: `docker run -d -p 27017:27017 mongo`

Xem: **[Hướng dẫn cài đặt](Huong-dan-Cai-dat)**

### Port 3000 bị chiếm, đổi sang port khác?

1. Mở file `.env`
2. Đổi `PORT=3000` thành port khác (ví dụ: `PORT=3001`)
3. Restart server
4. Truy cập: `http://localhost:3001`

### Làm sao để chạy FinTrack 24/7?

**Trên server**:
- Dùng PM2: `pm2 start dist/src/index.js --name fintrack`
- Hoặc systemd service
- Hoặc Docker container

**Trên máy cá nhân**: Không khuyến nghị (tốn điện, máy phải luôn bật)

Xem: **[Deployment Guide](Cai-dat-Moi-truong-Phat-trien)**

### Có thể truy cập từ xa (remote) không?

**Có**, nhưng cần:
1. Mở port trên router (port forwarding)
2. Có IP tĩnh hoặc dùng DDNS
3. **BẮT BUỘC** dùng HTTPS
4. Bật firewall, 2FA

**Hoặc**: Deploy lên cloud (VPS, Heroku, AWS...)

### Làm sao để update phiên bản mới?

```bash
# 1. Backup dữ liệu
mongodump --out backup/

# 2. Pull code mới
git pull origin main

# 3. Cài đặt dependencies mới
npm install

# 4. Build lại
npm run build

# 5. Restart server
npm start
```

## 📱 Sử dụng

### Có thể dùng trên điện thoại không?

Có! Mở trình duyệt trên điện thoại và truy cập URL FinTrack. Giao diện responsive, thân thiện với mobile.

### Có thể dùng offline không?

Không. FinTrack cần kết nối với server MongoDB. Tuy nhiên, bạn có thể cài đặt trên máy cá nhân và dùng như offline app.

### Có thể export báo cáo ra PDF không?

Hiện tại chỉ hỗ trợ Excel. Với PDF:
- Dùng chức năng Print to PDF của trình duyệt
- Hoặc convert từ Excel sang PDF

## ❗ Lỗi thường gặp

### Cannot connect to MongoDB

**Nguyên nhân**: MongoDB chưa chạy

**Giải pháp**:
```bash
# Kiểm tra MongoDB
mongosh

# Khởi động MongoDB (Linux)
sudo systemctl start mongod

# Khởi động MongoDB (Docker)
docker start mongodb
```

### JWT token expired

**Nguyên nhân**: Token hết hạn (mặc định 7 ngày)

**Giải pháp**: Đăng nhập lại

### Error: EADDRINUSE (Port already in use)

**Nguyên nhân**: Port 3000 bị chiếm

**Giải pháp**:
- Đổi port trong `.env`
- Hoặc kill process đang dùng port đó

### Module not found

**Nguyên nhân**: Thiếu dependencies

**Giải pháp**:
```bash
npm install
npm run build
```

## 💬 Hỗ trợ

### Tôi gặp lỗi không có trong FAQ?

1. Xem **[Khắc phục sự cố](Khac-phuc-Su-co)**
2. Tìm kiếm trong [GitHub Issues](https://github.com/nguyenquy0710/Financial-Tracking/issues)
3. Hỏi trong [Discussions](https://github.com/nguyenquy0710/Financial-Tracking/discussions)
4. Tạo issue mới nếu chưa có

### Tôi muốn đề xuất tính năng mới?

Tuyệt vời! Tạo [Feature Request](https://github.com/nguyenquy0710/Financial-Tracking/issues/new?template=feature_request.md)

### Tôi muốn đóng góp code?

Xin chào contributor! Xem: **[Đóng góp vào dự án](Dong-gop-vao-Du-an)**

### FinTrack có cộng đồng người dùng không?

Có! Tham gia:
- [GitHub Discussions](https://github.com/nguyenquy0710/Financial-Tracking/discussions)
- [Facebook Group](https://facebook.com/...) (nếu có)
- [Discord](https://discord.gg/...) (nếu có)

## 📚 Tài liệu khác

Không tìm thấy câu trả lời? Xem thêm:

- **[Bắt đầu nhanh](Bat-dau-Nhanh)** - Hướng dẫn chi tiết cho người mới
- **[Khắc phục sự cố](Khac-phuc-Su-co)** - Giải quyết lỗi cụ thể
- **[API Documentation](API-Documentation)** - Cho developers
- **[GitHub Wiki](https://github.com/nguyenquy0710/Financial-Tracking/wiki)** - Tất cả tài liệu

## 🤔 Câu hỏi của bạn chưa được trả lời?

Hãy hỏi cộng đồng tại [GitHub Discussions](https://github.com/nguyenquy0710/Financial-Tracking/discussions/categories/q-a)!

---

[⬅️ Quay lại trang chủ](Home)
