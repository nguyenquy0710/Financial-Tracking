# Hướng dẫn publish Wiki lên GitHub 📖

Hướng dẫn chi tiết cách đưa các tài liệu wiki lên GitHub Wiki để người dùng có thể truy cập.

## 🎯 Tổng quan

GitHub Wiki là một tính năng của GitHub cho phép bạn tạo tài liệu cho dự án. Wiki được lưu trong một Git repository riêng biệt.

**URL Wiki**: https://github.com/nguyenquy0710/Financial-Tracking/wiki

## 📋 Yêu cầu

- Quyền write trên repository
- Git đã được cài đặt
- Đã clone repository chính

## 🚀 Cách 1: Publish thủ công

### Bước 1: Kích hoạt Wiki trên GitHub

1. Vào repository: https://github.com/nguyenquy0710/Financial-Tracking
2. Click tab **Settings**
3. Scroll xuống phần **Features**
4. Tích ☑️ **Wikis**
5. Save

### Bước 2: Clone Wiki repository

Wiki có Git repository riêng:

```bash
# Clone wiki repository
git clone https://github.com/nguyenquy0710/Financial-Tracking.wiki.git

# Hoặc nếu đã clone rồi, pull để lấy bản mới nhất
cd Financial-Tracking.wiki
git pull origin master
```

### Bước 3: Copy các file wiki

```bash
# Giả sử bạn đang ở thư mục Financial-Tracking
cd /path/to/Financial-Tracking

# Copy tất cả file .md từ thư mục wiki
cp wiki/*.md ../Financial-Tracking.wiki/

# Hoặc nếu đã clone wiki trong cùng thư mục cha
cp wiki/*.md ../Financial-Tracking.wiki/
```

### Bước 4: Commit và push

```bash
# Di chuyển vào thư mục wiki
cd ../Financial-Tracking.wiki

# Kiểm tra các file đã copy
git status

# Add tất cả file
git add .

# Commit với message mô tả
git commit -m "Add Vietnamese wiki documentation

- Hướng dẫn cài đặt
- Hướng dẫn sử dụng
- FAQ
- Tích hợp MISA
- Và nhiều tài liệu khác"

# Push lên GitHub
git push origin master
```

### Bước 5: Kiểm tra

1. Truy cập: https://github.com/nguyenquy0710/Financial-Tracking/wiki
2. Bạn sẽ thấy tất cả các trang đã được tạo
3. Trang `Home.md` sẽ là trang chủ

## 🔧 Cách 2: Sử dụng GitHub Actions (Tự động)

### Tạo GitHub Action workflow

Tạo file `.github/workflows/sync-wiki.yml`:

```yaml
name: Sync Wiki

on:
  push:
    branches:
      - main
      - master
    paths:
      - 'wiki/**'

jobs:
  sync-wiki:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout main repo
        uses: actions/checkout@v3

      - name: Checkout wiki repo
        uses: actions/checkout@v3
        with:
          repository: ${{ github.repository }}.wiki
          path: wiki-repo

      - name: Copy wiki files
        run: |
          cp wiki/*.md wiki-repo/
          cd wiki-repo
          
      - name: Commit and push to wiki
        run: |
          cd wiki-repo
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git add .
          git diff --quiet && git diff --staged --quiet || (git commit -m "Auto-sync wiki from main repo" && git push)
```

**Lưu ý**: Cần cấp quyền write cho GitHub Actions trong Settings > Actions > General > Workflow permissions

### Cách hoạt động

1. Khi bạn commit vào thư mục `wiki/` trên branch main
2. GitHub Actions tự động chạy
3. Copy các file sang wiki repository
4. Commit và push tự động

## 📝 Cấu trúc tên file

GitHub Wiki yêu cầu:

| File trong `/wiki/` | Tên trang trên Wiki |
|---------------------|---------------------|
| `Home.md` | Home (trang chủ) |
| `Huong-dan-Cai-dat.md` | Huong-dan-Cai-dat |
| `FAQ.md` | FAQ |

**Lưu ý**:
- Tên file phải đúng format (không dấu cách)
- Sử dụng dấu gạch ngang `-` thay vì khoảng trắng
- GitHub tự động chuyển đổi tên file thành title

## 🔗 Cập nhật links

### Links giữa các trang

Trong file markdown, sử dụng:

```markdown
[Tên trang](Ten-Trang)
```

Ví dụ:
```markdown
Xem thêm tại [Hướng dẫn cài đặt](Huong-dan-Cai-dat)
```

**Không** cần đuôi `.md` khi link.

### Links đến hình ảnh

Nếu có hình ảnh:

```markdown
![Mô tả](https://raw.githubusercontent.com/nguyenquy0710/Financial-Tracking/main/docs/assets/screenshot.png)
```

Hoặc lưu trong wiki:

```markdown
![Mô tả](uploads/screenshot.png)
```

## 📋 Sidebar (Menu bên)

Tạo file `_Sidebar.md` trong wiki repo:

```markdown
# FinTrack Wiki

## 🚀 Bắt đầu
- [Trang chủ](Home)
- [Cài đặt](Huong-dan-Cai-dat)
- [Đăng ký & Đăng nhập](Dang-ky-va-Dang-nhap)
- [Bắt đầu nhanh](Bat-dau-Nhanh)

## 📖 Hướng dẫn
- [Giao diện Dashboard](Giao-dien-Tong-quan)
- [Quản lý thu chi](Quan-ly-Thu-chi)
- [Phương pháp 6 Lọ](Phuong-phap-6-Lo)
- [Tích hợp MISA](Tich-hop-MISA)

## ❓ Trợ giúp
- [FAQ](FAQ)
- [Liên hệ](Lien-he-Ho-tro)
```

## 🎨 Footer

Tạo file `_Footer.md`:

```markdown
---

© 2024 FinTrack | [GitHub](https://github.com/nguyenquy0710/Financial-Tracking) | [Issues](https://github.com/nguyenquy0710/Financial-Tracking/issues)

Made with ❤️ in Vietnam
```

## 🔄 Workflow cập nhật

### Quy trình thường ngày

1. **Chỉnh sửa trong repo chính**:
   ```bash
   cd Financial-Tracking
   # Sửa file trong wiki/
   vim wiki/Ten-Trang.md
   git add wiki/Ten-Trang.md
   git commit -m "Update Ten-Trang documentation"
   git push
   ```

2. **Sync sang wiki** (thủ công):
   ```bash
   cd ../Financial-Tracking.wiki
   git pull origin master
   cp ../Financial-Tracking/wiki/*.md .
   git add .
   git commit -m "Sync from main repo"
   git push origin master
   ```

3. **Hoặc để GitHub Actions tự động sync**

### Khi tạo trang mới

1. Tạo file mới trong `wiki/Ten-Trang-Moi.md`
2. Thêm link trong `Home.md`
3. Commit và push
4. Sync sang wiki
5. Cập nhật `_Sidebar.md` nếu cần

## 🚨 Lưu ý quan trọng

### 1. Tên file

✅ **Đúng**:
- `Huong-dan-Cai-dat.md`
- `FAQ.md`
- `Bat-dau-Nhanh.md`

❌ **Sai**:
- `Hướng dẫn Cài đặt.md` (có dấu và khoảng trắng)
- `huong dan cai dat.md` (có khoảng trắng)
- `huong_dan_cai_dat.md` (dấu gạch dưới không chuẩn)

### 2. Links

✅ **Đúng**:
```markdown
[Hướng dẫn](Huong-dan-Cai-dat)
```

❌ **Sai**:
```markdown
[Hướng dẫn](Huong-dan-Cai-dat.md)  # Không cần .md
[Hướng dẫn](./Huong-dan-Cai-dat)   # Không cần ./
[Hướng dẫn](wiki/Huong-dan-Cai-dat) # Không cần wiki/
```

### 3. Hình ảnh

- Upload vào thư mục `uploads/` trong wiki
- Hoặc dùng absolute URL từ repo chính
- Không lưu ảnh trong thư mục `wiki/` của repo chính

### 4. Xung đột (Conflicts)

Nếu gặp conflict khi push wiki:

```bash
cd Financial-Tracking.wiki
git pull origin master
# Giải quyết conflict
git add .
git commit -m "Resolve conflicts"
git push origin master
```

## 📱 Chỉnh sửa trực tiếp trên GitHub

### Sửa trang có sẵn

1. Vào Wiki: https://github.com/nguyenquy0710/Financial-Tracking/wiki
2. Vào trang cần sửa
3. Click **Edit** ở góc trên bên phải
4. Chỉnh sửa nội dung (Markdown)
5. Thêm message
6. Click **Save Page**

### Tạo trang mới

1. Trên Wiki, click **New Page**
2. Nhập tên trang (không dấu, dùng dấu gạch ngang)
3. Viết nội dung
4. Click **Save Page**

**Lưu ý**: Trang tạo trên web không có trong thư mục `wiki/` của repo chính. Cần pull về và sync.

## 🔍 Tìm kiếm trong Wiki

GitHub Wiki có chức năng tìm kiếm:

1. Vào Wiki
2. Dùng ô tìm kiếm ở góc trên
3. Hoặc Google: `site:github.com/nguyenquy0710/Financial-Tracking/wiki [từ khóa]`

## 📊 Thống kê Wiki

Xem:
- Số lượng trang
- Lịch sử chỉnh sửa
- Contributors

Tại: https://github.com/nguyenquy0710/Financial-Tracking/wiki/_history

## ❓ Xử lý vấn đề

### Wiki không hiển thị

**Kiểm tra**:
1. Wiki đã được kích hoạt trong Settings chưa?
2. File `Home.md` có tồn tại không?
3. Format markdown có đúng không?

### Link không hoạt động

**Kiểm tra**:
1. Tên trang có đúng không? (phân biệt hoa thường)
2. Có thêm `.md` không? (không nên)
3. File trang đích có tồn tại không?

### Không push được

**Giải pháp**:
```bash
# Kiểm tra remote
git remote -v

# Nếu không có remote origin
git remote add origin https://github.com/nguyenquy0710/Financial-Tracking.wiki.git

# Nếu không có quyền, kiểm tra authentication
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🎓 Best Practices

1. **Luôn giữ sync** giữa `wiki/` trong repo chính và wiki repo
2. **Commit message rõ ràng**: "Update FAQ", "Add MISA integration guide"
3. **Review trước khi push**: Kiểm tra links, chính tả
4. **Backup định kỳ**: Clone wiki repo về máy local
5. **Update _Sidebar**: Mỗi khi thêm trang mới

## 📚 Tài liệu tham khảo

- [GitHub Wiki Documentation](https://docs.github.com/en/communities/documenting-your-project-with-wikis)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

## ✅ Checklist publish Wiki

- [ ] Kích hoạt Wiki trong Settings
- [ ] Clone wiki repository
- [ ] Copy tất cả file .md từ wiki/
- [ ] Tạo _Sidebar.md
- [ ] Tạo _Footer.md
- [ ] Commit và push
- [ ] Kiểm tra tất cả links
- [ ] Test trên mobile
- [ ] Thông báo với team/users

## 🔗 Links hữu ích

- **Wiki URL**: https://github.com/nguyenquy0710/Financial-Tracking/wiki
- **Wiki Git**: https://github.com/nguyenquy0710/Financial-Tracking.wiki.git
- **Main Repo**: https://github.com/nguyenquy0710/Financial-Tracking

---

[⬅️ Quay lại README](README.md) | [➡️ Trang chủ Wiki](Home)
