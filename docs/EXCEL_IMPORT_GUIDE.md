# Hướng dẫn Import Excel - Excel Import Guide

## 📁 Định dạng file Excel / Excel File Format

Để import dữ liệu từ Excel vào FinTrack, file Excel của bạn cần có các sheet với định dạng như sau:

### 1. Sheet Thuê phòng (Rental Sheets)

**Tên sheet**: Tên chứa pattern "P" + số phòng (ví dụ: `P3L1-600.QGV.HCM`, `P67-303.Q9.HCM`)

**Cấu trúc**:
- Dòng 0: Thông tin phòng (ví dụ: "Phòng P3L1 Số 1 Hẻm 600, Đường Quang Trung...")
- Dòng header chứa các cột: Tháng, Tiền nhà, Điện, Nước, Internet, Gửi xe, Rác, Bonus, Tổng, Note
- Dòng tổng chứa dữ liệu tổng hợp

**Ví dụ**:
```
| Phòng P3L1 ... | | | | | | | |
| STT | Tháng | Tiền nhà (VND) | Số đầu kỳ (KW) | Số cuối kỳ (KW) | Tiêu thụ (KW) | Thành tiền |...
| Tổng | 42 | 109900000 | 311298 | 316190 | 4892 | 19568000 |...
```

### 2. Sheet Lương (Salary Sheet)

**Tên sheet**: `salary`

**Cấu trúc**:
- Cột A-I: Dữ liệu công ty (Tháng, Đơn vị, Salary VIHAT, KPI, Leader, Dự án, OT, Thưởng/Tháng 13, Tổng)
- Cột J-L: Salary Freelance (DAKIATech, Other, Tổng)
- Cột M: Tổng thu nhập
- Cột N: Ngày nhận

**Ví dụ**:
```
| STT | Tháng | Đơn vị | Salary VIHAT | KPI | Leader | Dự án | OT | Bonus | Tổng | Freelance DAKIATech | Other | Tổng | Tổng thu nhập | Ngày nhận |
| Tổng | 70 | | 1550500000 | 5920927 | 7370000 | 7290124 | ... | ... | 1662761859 | 6600000 | 13500000 | 20100000 | 1682861859 | dd/mm/yyyy |
```

### 3. Sheet Chi tiêu (Expense Sheet)

**Tên sheet**: `chi-tieu` hoặc `chi tiêu`

**Cấu trúc**:
- Cột A: Số thứ tự
- Cột B: Hạng mục (Danh mục)
- Cột C: Tên khoảng chi
- Cột D: Số lượng (SL)
- Cột E: Đơn giá
- Cột F: Thành tiền
- Cột G: No. (Số thứ tự)
- Cột H: Tháng hiện tại
- Cột I: Lương tháng trước
- Cột J: Gửi Mẹ
- Cột K: NEC (55%)
- Cột L: FFA (10%)
- Cột M: EDUC (10%)
- Cột N: PLAY (10%)
- Cột O: GIVE (7%)
- Cột P: LTS (10%)

**Ví dụ**:
```
| No. | Hạng mục | Tên khoảng chi | SL | Đơn giá | Thành tiền | No. | Tháng hiện tại | Lương tháng trước | Gửi Mẹ | NEC | FFA | EDUC | PLAY | GIVE | LTS |
| 2 | Nhà cửa | Tiền thuê nhà | 1 | 3670000 | 3670000 | 2 | 2022-10-01 | 25670000 | 4000000 | 7259000 | 2567000 | 2567000 | 2567000 | 1796900 | 4913100 |
```

### 4. Sheet Tiết kiệm (Savings Sheet)

**Tên sheet**: `Tiết kiệm`

**Cấu trúc**:
- Phân biệt 2 loại: Gửi Mẹ và Gửi quỹ
- Mỗi loại có: Ngày, STK Nhận, Số Tiền

**Ví dụ**:
```
| STT | Tháng hiện tại | Gửi Mẹ | | | Gửi quỹ | | |
| | | Ngày | STK Nhận | Số Tiền (VND) | Ngày | STK Nhận | Số Tiền (VND) |
```

### 5. Sheet Tiền gửi số (Deposit Sheet)

**Tên sheet**: `deposit no.` hoặc `Tiền gửi số`

**Cấu trúc**:
- STT
- Ngân hàng
- Loại tài khoản
- Trạng thái
- Tên tài khoản
- Số tài khoản
- Gửi quỹ
- Ngày bắt đầu
- Ngày đến hạn
- Kỳ hạn (tháng)
- Lãi suất (%)
- Số tiền gốc (VND)
- Số tiền lãi (VND)
- Tổng (VND)

**Ví dụ**:
```
| STT | Ngân hàng | Loại TK | Trạng thái | Tên TK | Số TK | Gửi quỹ | Ngày bắt đầu | Ngày đến hạn | Kỳ hạn | Lãi suất | Số tiền gốc | Số tiền lãi | Tổng |
| Tổng | | | 0 | | | | dd/mm/yyyy | dd/mm/yyyy | (tháng) | (%) | 227226161 | 13714027.509 | 240940188.509 |
```

### 6. Sheet Thông tin tài khoản (Bank Account Settings)

**Tên sheet**: `setting` hoặc `Thông tin chuyển khoản`

**Cấu trúc**:
- Ngân hàng
- Chủ tài khoản
- Số tài khoản
- Chi nhánh
- Định danh

**Ví dụ**:
```
| Ngân hàng | Chủ tài khoản | Số tài khoản | Chi nhánh | Định danh |
| ACB | NGUYEN HUU QUY | 2 2791 8969 | PGD Bùi Đình Túy | ACB / NGUYEN HUU QUY / 2 2791 8969 |
| Agribank | NGUYEN THI NGUNG | 4807 20527 5626 | | Agribank / NGUYEN THI NGUNG / 4807 20527 5626 |
```

## 🔧 Lưu ý khi chuẩn bị file Excel / Notes for Preparing Excel File

1. **Định dạng file**: Chỉ hỗ trợ `.xlsx` và `.xls`
2. **Kích thước file**: Tối đa 10MB
3. **Encoding**: Sử dụng UTF-8 để hiển thị tiếng Việt chính xác
4. **Số liệu**: 
   - Số tiền không cần dấu phân cách hàng nghìn
   - Có thể dùng dấu phẩy (,) cho hàng nghìn nhưng không bắt buộc
5. **Ngày tháng**: 
   - Định dạng: `dd/mm/yyyy` hoặc ISO format `YYYY-MM-DD`
   - Có thể để trống, hệ thống sẽ lấy ngày hiện tại

## 📝 Template Excel

Bạn có thể tải file template mẫu từ repository:
- [Xem ví dụ trong problem statement](../../)

## ❓ Troubleshooting

### Lỗi thường gặp:

1. **"Only Excel files are allowed"**
   - Kiểm tra đuôi file phải là `.xlsx` hoặc `.xls`

2. **"File quá lớn"**
   - File phải nhỏ hơn 10MB
   - Xóa các sheet không cần thiết
   - Xóa các hình ảnh, biểu đồ trong file

3. **"Import thất bại"**
   - Kiểm tra tên các sheet có đúng không
   - Kiểm tra cấu trúc dữ liệu trong sheet
   - Đảm bảo có dữ liệu trong dòng "Tổng"

4. **Dữ liệu hiển thị không đúng**
   - Kiểm tra định dạng số (không có ký tự đặc biệt)
   - Kiểm tra định dạng ngày tháng
   - Đảm bảo encoding của file là UTF-8

## 💡 Tips

- Bắt đầu với một tháng dữ liệu để test trước
- Export dữ liệu mẫu từ hệ thống để tham khảo cấu trúc
- Giữ lại bản backup của file Excel gốc
- Import từng sheet một để dễ debug nếu có lỗi

## 🆘 Hỗ trợ

Nếu bạn gặp vấn đề khi import Excel, vui lòng:
1. Kiểm tra lại format theo hướng dẫn trên
2. Mở issue trên GitHub với file Excel mẫu (ẩn thông tin nhạy cảm)
3. Liên hệ qua email support
