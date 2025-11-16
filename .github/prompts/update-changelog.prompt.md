---
mode: edit
model: GPT-5
description: Cập nhật file Changelog.md dựa trên lịch sử commit của repository và phân loại các thay đổi theo chuẩn Keep a Changelog.
---

Đọc toàn bộ lịch sử commit của repository và cập nhật file Changelog.md một cách có hệ thống và chi tiết.

## Yêu cầu cụ thể:

1. **Đọc file Changelog.md hiện tại** để hiểu cấu trúc và phiên bản
2. **Lấy lịch sử commit** với lệnh: `git log --pretty=format:"%h - %an, %ar : %s" --since="2024-01-01" --no-merges`
3. **Lấy danh sách tag/version** với: `git tag --sort=-version:refname`
4. **Phân tích và phân loại commit** theo 4 loại:
   - **Added**: Tính năng mới, file/script mới, cấu hình mới, documentation mới
   - **Changed**: Cải thiện hiệu suất, cập nhật cấu hình, refactor code, cập nhật dependencies
   - **Fixed**: Bug fixes, sửa lỗi formatting, sửa lỗi cấu hình, security fixes
   - **Removed**: Xóa file obsolete, loại bỏ code không sử dụng, xóa dependencies cũ

## Ràng buộc:

- Sử dụng tiếng Việt cho mô tả
- Nhóm các commit liên quan lại với nhau
- Ưu tiên các thay đổi quan trọng
- Không liệt kê từng commit nhỏ lẻ
- Sử dụng mô tả có ý nghĩa thay vì copy nguyên commit message
- Tuân theo format [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## Tiêu chí thành công:

- File Changelog.md được cập nhật với phần [Unreleased] cho các commit mới nhất
- Các phiên bản đã release được tổ chức rõ ràng
- Mô tả tiếng Việt rõ ràng và có ý nghĩa
- Ngày tháng chính xác
- Cấu trúc markdown đúng chuẩn
- Đặc biệt chú ý đến SQL database changes, PowerShell/Batch script updates, Documentation improvements, GitLab CI/CD modifications cho dự án Guide Integrate

## Format chuẩn cho Changelog:

```markdown
# Changelog

Tất cả những thay đổi đáng chú ý của dự án sẽ được ghi lại trong file này.

## [Unreleased] - YYYY-MM-DD

### Added

- Mô tả tính năng/file mới được thêm

### Changed

- Mô tả những thay đổi cải thiện

### Fixed

- Mô tả bug được sửa

### Removed

- Mô tả những gì bị xóa bỏ

## [Version] - YYYY-MM-DD

### Added

### Changed

### Fixed

### Removed
```

## Mapping ví dụ:

| Commit gốc                                   | Phân loại | Mô tả trong Changelog                                      |
| -------------------------------------------- | --------- | ---------------------------------------------------------- |
| `Add new SQL scripts for SMS archiving`      | Added     | Thêm script archiving cho SMS với error logging            |
| `Update partition scripts for November 2025` | Changed   | Cập nhật partition scripts để thêm phân vùng tháng 11/2025 |
| `Fix formatting of ALTER TABLE statement`    | Fixed     | Sửa lỗi formatting của ALTER TABLE statement               |
| `Remove obsolete SSH configuration files`    | Removed   | Loại bỏ file cấu hình SSH obsolete                         |
