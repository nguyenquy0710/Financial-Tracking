# Tích hợp MISA Money Keeper 🔗

Hướng dẫn kết nối và đồng bộ dữ liệu từ MISA Money Keeper (Sổ thủ chi) vào FinTrack.

## 📱 MISA Money Keeper là gì?

MISA Money Keeper (Sổ thủ chi) là ứng dụng quản lý tài chính cá nhân phổ biến tại Việt Nam, được phát triển bởi MISA JSC.

**Website**: https://moneykeeper.vn/

## 🔗 Tại sao nên tích hợp?

✅ **Import dữ liệu có sẵn**: Không cần nhập lại từ đầu
✅ **Đồng bộ tự động**: Cập nhật dữ liệu mới nhất từ MISA
✅ **Tiết kiệm thời gian**: Không phải nhập 2 lần
✅ **Dữ liệu chính xác**: Lấy trực tiếp từ nguồn
✅ **Chuyển đổi dễ dàng**: Chuyển từ MISA sang FinTrack

## ⚙️ Cài đặt kết nối

### Bước 1: Lấy thông tin đăng nhập MISA

Bạn cần có:
- ✅ Tài khoản MISA Money Keeper
- ✅ Email/Số điện thoại đăng ký
- ✅ Mật khẩu

### Bước 2: Kết nối trong FinTrack

1. Đăng nhập vào FinTrack
2. Vào **Cài đặt** > **Tích hợp**
3. Click **Kết nối MISA Money Keeper**
4. Nhập thông tin:
   - Email/Số điện thoại MISA
   - Mật khẩu
5. Click **Kết nối**

### Bước 3: Xác nhận kết nối

1. Hệ thống sẽ xác thực với MISA
2. Nếu thành công, hiển thị:
   - ✅ Đã kết nối thành công
   - Thông tin tài khoản MISA
   - Số lượng giao dịch có thể import
3. Nếu thất bại:
   - ❌ Kiểm tra lại email/mật khẩu
   - Đảm bảo tài khoản MISA hoạt động bình thường

## 📥 Import dữ liệu từ MISA

### Import toàn bộ dữ liệu

1. Vào **Tích hợp** > **MISA Money Keeper**
2. Click **Import dữ liệu**
3. Chọn khoảng thời gian:
   - Tuần này
   - Tháng này
   - 3 tháng gần đây
   - 6 tháng gần đây
   - 1 năm gần đây
   - Tùy chỉnh (từ ngày - đến ngày)
4. Chọn loại dữ liệu:
   - ☑️ Thu nhập
   - ☑️ Chi tiêu
   - ☑️ Tiết kiệm
   - ☑️ Vay nợ
5. Click **Bắt đầu import**

### Quá trình import

```
┌──────────────────────────────────────┐
│ Đang import dữ liệu từ MISA...       │
│                                      │
│ ████████████████░░░░ 75%             │
│                                      │
│ Đã import: 450/600 giao dịch         │
│ Thời gian còn lại: ~30 giây          │
└──────────────────────────────────────┘
```

### Kết quả import

```
✅ Import thành công!

📊 Thống kê:
- Tổng giao dịch: 600
- Thu nhập: 24 giao dịch
- Chi tiêu: 560 giao dịch
- Tiết kiệm: 12 giao dịch
- Đã bỏ qua (trùng): 4 giao dịch

⚠️ Lưu ý:
- Đã tự động ánh xạ danh mục
- Đã chuyển đổi định dạng tiền tệ
- Có thể cần kiểm tra và điều chỉnh
```

## 🔄 Đồng bộ tự động

### Kích hoạt đồng bộ tự động

1. Vào **Cài đặt** > **Tích hợp** > **MISA**
2. Bật **Đồng bộ tự động**
3. Chọn tần suất:
   - Mỗi giờ
   - Mỗi 6 giờ
   - Mỗi 12 giờ
   - Hàng ngày (vào 00:00)
   - Hàng tuần (Chủ nhật)
4. Lưu cài đặt

### Đồng bộ thủ công

Nếu cần cập nhật ngay:

1. Vào **Tích hợp** > **MISA**
2. Click **Đồng bộ ngay**
3. Chờ hệ thống xử lý

## 🔍 Tìm kiếm giao dịch MISA

FinTrack hỗ trợ tìm kiếm và import giao dịch cụ thể từ MISA.

### Tìm kiếm thu nhập

1. Vào **Tích hợp** > **MISA** > **Tìm kiếm**
2. Chọn **Loại**: Thu nhập
3. Điền bộ lọc:
   - Khoảng thời gian
   - Số tiền (từ - đến)
   - Danh mục
   - Ghi chú (keyword)
4. Click **Tìm kiếm**
5. Chọn các giao dịch cần import
6. Click **Import đã chọn**

### Tìm kiếm chi tiêu

Tương tự như tìm kiếm thu nhập, nhưng chọn loại **Chi tiêu**.

### Tìm kiếm nâng cao

```
Bộ lọc:
┌────────────────────────────────────┐
│ Loại: Chi tiêu                     │
│ Từ ngày: 01/01/2024                │
│ Đến ngày: 31/12/2024               │
│ Số tiền: 100,000 - 5,000,000       │
│ Danh mục: Ăn uống, Di chuyển       │
│ Ghi chú: "cafe" hoặc "trà sữa"     │
└────────────────────────────────────┘
```

## 🗺️ Ánh xạ danh mục

MISA và FinTrack có thể có tên danh mục khác nhau. FinTrack tự động ánh xạ, nhưng bạn có thể tùy chỉnh.

### Xem ánh xạ mặc định

| Danh mục MISA | Danh mục FinTrack |
|---------------|-------------------|
| Ăn uống | Ăn uống |
| Đi lại | Di chuyển |
| Mua sắm | Mua sắm |
| Giải trí | Giải trí |
| Nhà cửa | Nhà ở |
| Y tế | Y tế |
| Giáo dục | Giáo dục |
| Khác | Khác |

### Tùy chỉnh ánh xạ

1. Vào **Cài đặt** > **Tích hợp** > **MISA** > **Ánh xạ danh mục**
2. Chọn danh mục MISA
3. Chọn danh mục FinTrack tương ứng
4. Lưu

**Ví dụ**:
- MISA "Coffee & Tea" → FinTrack "Ăn uống"
- MISA "Grab/Uber" → FinTrack "Di chuyển"

## 📊 Xử lý dữ liệu trùng lặp

### Phát hiện trùng lặp

FinTrack tự động phát hiện giao dịch trùng dựa trên:
- Ngày giao dịch
- Số tiền
- Danh mục
- Ghi chú

### Xử lý khi trùng

Bạn có 3 lựa chọn:

1. **Bỏ qua** (mặc định): Không import giao dịch trùng
2. **Ghi đè**: Cập nhật giao dịch cũ bằng dữ liệu mới từ MISA
3. **Tạo mới**: Import tất cả, kể cả trùng

Cài đặt tại: **Cài đặt** > **Tích hợp** > **MISA** > **Xử lý trùng**

## ⚠️ Lưu ý quan trọng

### Về bảo mật

- ✅ Mật khẩu được mã hóa an toàn
- ✅ Kết nối sử dụng HTTPS/TLS
- ✅ Token được làm mới tự động
- ⚠️ Không chia sẻ thông tin đăng nhập với người khác

### Về dữ liệu

- ✅ Dữ liệu import là bản sao, không ảnh hưởng MISA
- ✅ Có thể xóa dữ liệu import nếu không hài lòng
- ⚠️ Import nhiều lần có thể gây trùng lặp
- ⚠️ Kiểm tra kỹ trước khi xóa dữ liệu

### Về đồng bộ

- ✅ Đồng bộ 1 chiều: MISA → FinTrack
- ❌ Không đồng bộ ngược: FinTrack → MISA
- ⚠️ Thay đổi trên FinTrack không ảnh hưởng MISA
- ⚠️ Thay đổi trên MISA sẽ được cập nhật qua đồng bộ

## 🔧 Khắc phục sự cố

### Lỗi: Không kết nối được MISA

**Nguyên nhân**:
- Sai email/mật khẩu
- Tài khoản MISA bị khóa
- Mạng không ổn định

**Giải pháp**:
1. Kiểm tra lại thông tin đăng nhập
2. Đăng nhập vào app MISA để xác nhận tài khoản hoạt động
3. Kiểm tra kết nối internet
4. Thử lại sau vài phút

### Lỗi: Import thất bại

**Nguyên nhân**:
- Quá nhiều dữ liệu
- API MISA quá tải
- Lỗi ánh xạ danh mục

**Giải pháp**:
1. Chia nhỏ khoảng thời gian import (mỗi lần 1 tháng)
2. Thử import vào lúc khác (tránh giờ cao điểm)
3. Kiểm tra ánh xạ danh mục
4. Liên hệ admin nếu lỗi lặp lại

### Lỗi: Đồng bộ tự động không hoạt động

**Kiểm tra**:
- Đã bật đồng bộ tự động chưa?
- Thời gian đồng bộ cuối cùng là khi nào?
- Có lỗi gì trong lịch sử đồng bộ không?

**Giải pháp**:
1. Tắt và bật lại đồng bộ tự động
2. Thử đồng bộ thủ công
3. Kiểm tra log lỗi
4. Ngắt kết nối và kết nối lại MISA

### Danh mục không khớp

Nếu một số giao dịch có danh mục "Khác":

1. Vào **Cài đặt** > **Tích hợp** > **MISA** > **Ánh xạ danh mục**
2. Xem các danh mục MISA chưa được ánh xạ
3. Ánh xạ chúng với danh mục FinTrack phù hợp
4. Import lại hoặc cập nhật thủ công

## 📱 Sử dụng song song MISA và FinTrack

### Kịch bản 1: MISA là nguồn chính

- Nhập giao dịch trên MISA
- Đồng bộ sang FinTrack tự động/thủ công
- Dùng FinTrack để phân tích, báo cáo

### Kịch bản 2: FinTrack là nguồn chính

- Nhập giao dịch trên FinTrack
- Dùng MISA để backup/tham khảo
- Import dữ liệu cũ từ MISA một lần

### Kịch bản 3: Chuyển đổi hoàn toàn

- Import toàn bộ dữ liệu từ MISA
- Kiểm tra và điều chỉnh
- Ngừng dùng MISA, chuyển sang FinTrack

## 🎯 Best Practices

### 1. Import ban đầu

✅ **Nên**:
- Import từng tháng một để dễ kiểm tra
- Kiểm tra kỹ sau mỗi lần import
- Backup dữ liệu FinTrack trước khi import

❌ **Không nên**:
- Import 1 lúc nhiều năm (dễ lỗi, khó kiểm tra)
- Không kiểm tra dữ liệu sau import

### 2. Đồng bộ định kỳ

✅ **Nên**:
- Đặt đồng bộ hàng ngày
- Kiểm tra log đồng bộ hàng tuần
- Xử lý lỗi kịp thời

❌ **Không nên**:
- Đồng bộ quá thường xuyên (mỗi giờ) - gây tải hệ thống
- Để lỗi đồng bộ kéo dài

### 3. Bảo trì

- Kiểm tra kết nối MISA hàng tháng
- Cập nhật ánh xạ danh mục khi cần
- Xóa dữ liệu trùng lặp định kỳ

## 📊 Thống kê sử dụng

Xem thống kê import/đồng bộ:

1. Vào **Tích hợp** > **MISA** > **Thống kê**
2. Xem:
   - Tổng số lần import
   - Tổng giao dịch đã import
   - Lần đồng bộ cuối
   - Tỷ lệ thành công/thất bại
   - Top danh mục import nhiều nhất

## ❓ Câu hỏi thường gặp

**Q: Có mất phí khi kết nối MISA không?**
A: Không, tích hợp MISA hoàn toàn miễn phí.

**Q: Dữ liệu trên MISA có bị thay đổi không?**
A: Không, FinTrack chỉ đọc dữ liệu, không sửa đổi trên MISA.

**Q: Có thể kết nối nhiều tài khoản MISA không?**
A: Hiện tại chỉ hỗ trợ 1 tài khoản MISA. Liên hệ nếu cần nhiều tài khoản.

**Q: Import có giới hạn số lượng không?**
A: Không giới hạn số lượng giao dịch, nhưng nên chia nhỏ để dễ xử lý.

**Q: Mất bao lâu để import?**
A: Trung bình 1-2 giây/100 giao dịch. Import 1000 giao dịch ~ 10-20 giây.

**Q: Có thể import lại không?**
A: Có, nhưng cần xử lý trùng lặp. Khuyến nghị backup trước khi import lại.

## 🔗 API Endpoints

Dành cho developers:

```
POST /api/misa/connect
POST /api/misa/import
GET  /api/misa/transactions
POST /api/misa/sync
GET  /api/misa/categories/mapping
PUT  /api/misa/categories/mapping
DELETE /api/misa/disconnect
```

Chi tiết tại: **[API Documentation](API-Documentation)**

## 📚 Tài liệu liên quan

- **[Quản lý thu chi](Quan-ly-Thu-chi)** - Sau khi import
- **[Import Excel](Import-Excel)** - Phương án thay thế
- **[API Documentation](API-Documentation)** - Tích hợp API

---

[⬅️ Quay lại trang chủ](Home) | [➡️ Import Excel](Import-Excel)
