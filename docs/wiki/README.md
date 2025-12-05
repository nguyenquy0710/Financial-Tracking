# FinTrack Wiki Documentation 📚

Đây là thư mục chứa các tài liệu hướng dẫn sử dụng FinTrack bằng tiếng Việt.

## 🎯 Mục đích

Cung cấp hướng dẫn chi tiết, dễ hiểu bằng tiếng Việt cho người dùng FinTrack.

## 📁 Cấu trúc Wiki

Các file markdown trong thư mục này được tổ chức theo chủ đề:

### Bắt đầu
- `Home.md` - Trang chủ wiki, điểm bắt đầu cho người dùng mới
- `Huong-dan-Cai-dat.md` - Hướng dẫn cài đặt FinTrack chi tiết
- `Dang-ky-va-Dang-nhap.md` - Hướng dẫn tạo tài khoản và đăng nhập
- `Bat-dau-Nhanh.md` - Hướng dẫn nhanh các bước đầu tiên

### Tính năng chính
- `Quan-ly-Thu-chi.md` - Quản lý giao dịch thu chi
- `Phuong-phap-6-Lo.md` - Hướng dẫn chi tiết phương pháp 6 Lọ
- `Quan-ly-Luong.md` - Quản lý lương và thu nhập
- `Quan-ly-Thue-phong.md` - Quản lý tiền thuê nhà
- `Quan-ly-Tiet-kiem.md` - Quản lý tiết kiệm
- `Quan-ly-Gui-tiet-kiem.md` - Quản lý gửi tiết kiệm ngân hàng

### Tích hợp
- `Tich-hop-MISA.md` - Tích hợp MISA Money Keeper
- `Import-Excel.md` - Import dữ liệu từ Excel
- `Export-Excel.md` - Export dữ liệu ra Excel

### Bảo mật & Cấu hình
- `Xac-thuc-2-yeu-to.md` - Xác thực 2 yếu tố (TOTP)
- `Cai-dat-Ca-nhan.md` - Cài đặt cá nhân

### Trợ giúp
- `FAQ.md` - Câu hỏi thường gặp
- `Khac-phuc-Su-co.md` - Khắc phục các vấn đề thường gặp

### Dành cho nhà phát triển
- `API-Documentation.md` - Tài liệu API
- `Cai-dat-Moi-truong-Phat-trien.md` - Setup môi trường dev
- `Dong-gop-vao-Du-an.md` - Hướng dẫn contribute

## 🚀 Cách sử dụng

### Cho người dùng

1. **Đọc trực tiếp**: Mở file `.md` bằng trình đọc markdown hoặc trên GitHub
2. **GitHub Wiki**: Các file này có thể được publish lên GitHub Wiki
3. **Documentation Site**: Có thể dùng với Jekyll, MkDocs, hoặc Docusaurus

### Cho maintainers

#### Publish lên GitHub Wiki

GitHub Wiki sử dụng git repository riêng. Để publish:

```bash
# Clone wiki repository
git clone https://github.com/nguyenquy0710/Financial-Tracking.wiki.git

# Copy các file wiki
cp wiki/*.md Financial-Tracking.wiki/

# Commit và push
cd Financial-Tracking.wiki/
git add .
git commit -m "Add Vietnamese documentation"
git push origin master
```

#### Cập nhật tài liệu

1. Chỉnh sửa file `.md` trong thư mục `wiki/`
2. Commit và push vào repository chính
3. Sync sang wiki repository

#### Tạo tài liệu mới

1. Tạo file `.md` mới với tên theo format: `Ten-Chu-de.md`
2. Thêm link trong `Home.md`
3. Đảm bảo navigation links (⬅️ ➡️) ở cuối mỗi trang

## 📝 Quy tắc viết

### Tên file

- Sử dụng format: `Ten-Chu-de.md` (PascalCase với dấu gạch ngang)
- Ví dụ: `Quan-ly-Thu-chi.md`, `Tich-hop-MISA.md`
- **Không** sử dụng: dấu cách, ký tự đặc biệt

### Format nội dung

- **Tiêu đề H1**: Tên chủ đề + emoji
- **Phần mục**: Sử dụng H2 (##), H3 (###)
- **Danh sách**: Sử dụng `-` hoặc `1.`
- **Code blocks**: Sử dụng ` ```bash ` hoặc ` ```javascript `
- **Boxes/Alerts**: Sử dụng blockquotes hoặc tables
- **Links**: Format `[Text](Link)` hoặc `[Text](Page-Name)`

### Navigation

Mỗi trang nên có navigation ở cuối:

```markdown
---

[⬅️ Trang trước](Previous-Page) | [➡️ Trang sau](Next-Page)
```

### Screenshots (Nếu có)

```markdown
![Mô tả](../docs/assets/images/screenshot.png)
```

## 🌍 Đa ngôn ngữ

Hiện tại wiki chỉ có **tiếng Việt**. Nếu cần thêm ngôn ngữ khác:

1. Tạo thư mục `wiki/en/` cho tiếng Anh
2. Dịch các file sang ngôn ngữ tương ứng
3. Cập nhật Home page với link chuyển ngôn ngữ

## 🔄 Sync với Repository

Wiki này được lưu trong repository chính (`/wiki/`), nhưng có thể sync với GitHub Wiki:

### Manual Sync

```bash
# Setup
git clone https://github.com/nguyenquy0710/Financial-Tracking.wiki.git /tmp/wiki
cd /tmp/wiki

# Copy files
cp /path/to/Financial-Tracking/wiki/*.md .

# Commit and push
git add .
git commit -m "Update wiki from main repo"
git push origin master
```

### Automated Sync (GitHub Actions)

Có thể setup GitHub Actions để tự động sync. Xem `.github/workflows/sync-wiki.yml` (nếu có).

## 📋 Checklist cho tài liệu mới

Khi tạo tài liệu mới:

- [ ] Tên file đúng format (`Ten-Chu-de.md`)
- [ ] Có tiêu đề H1 với emoji
- [ ] Có phần giới thiệu ngắn gọn
- [ ] Có mục lục (nếu dài)
- [ ] Code blocks có syntax highlighting
- [ ] Có ví dụ cụ thể
- [ ] Có screenshots (nếu cần)
- [ ] Có phần câu hỏi thường gặp
- [ ] Có navigation links
- [ ] Có cross-reference đến tài liệu liên quan
- [ ] Kiểm tra chính tả
- [ ] Link trong `Home.md` đã được cập nhật

## 🤝 Đóng góp

Mọi người đều có thể đóng góp vào wiki:

1. Fork repository
2. Tạo/sửa file trong `wiki/`
3. Tạo Pull Request
4. Maintainer sẽ review và merge

### Guidelines

- Viết bằng tiếng Việt chuẩn, dễ hiểu
- Sử dụng ví dụ cụ thể từ Việt Nam
- Tránh dùng thuật ngữ khó hiểu (hoặc giải thích)
- Format markdown đúng chuẩn
- Kiểm tra links không bị lỗi

## 📞 Liên hệ

Nếu có câu hỏi về wiki:

- **GitHub Issues**: [Tạo issue](https://github.com/nguyenquy0710/Financial-Tracking/issues)
- **GitHub Discussions**: [Thảo luận](https://github.com/nguyenquy0710/Financial-Tracking/discussions)

## 📜 License

Wiki documentation được phân phối theo cùng license với dự án chính (MIT License).

---

Made with ❤️ in Vietnam
