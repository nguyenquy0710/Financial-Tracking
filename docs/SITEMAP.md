# FinTrack Sitemap Documentation

## Tổng quan / Overview

Dự án FinTrack đã cập nhật cấu trúc đường dẫn URL để tổ chức tốt hơn các trang ứng dụng.

The FinTrack project has updated its URL path structure for better organization of application pages.

## Cập nhật đường dẫn / Path Updates

### Trước đây / Previously
Các trang ứng dụng nằm ở cấp gốc:
- `/dashboard` 
- `/rentals`
- `/salaries`
- etc.

### Hiện tại / Currently
Tất cả các trang ứng dụng đều nằm dưới prefix `/app`:
- `/app/dashboard`
- `/app/rentals`
- `/app/salaries`
- etc.

## Cấu trúc URL / URL Structure

### 1. Trang công khai / Public Pages
- `/` - Trang chủ
- `/changelog` - Nhật ký phát triển
- `/login` - Đăng nhập
- `/register` - Đăng ký

### 2. Trang ứng dụng / Application Pages (`/app/*`)
Yêu cầu xác thực người dùng / Requires user authentication:
- `/app/dashboard` - Bảng điều khiển
- `/app/salaries` - Quản lý lương
- `/app/expenses` - Quản lý chi tiêu
- `/app/savings` - Quản lý tiết kiệm
- `/app/deposits` - Quản lý tiền gửi
- `/app/recurring-bills` - Hóa đơn định kỳ
- `/app/rentals` - Quản lý thuê phòng
- `/app/rentals/:id/detail` - Chi tiết thuê phòng
- `/app/excel` - Import/Export Excel
- `/app/totp` - Xác thực 2 yếu tố
- `/app/settings` - Cài đặt

### 3. Trang quản trị / Admin Pages (`/admin/*`)
Yêu cầu quyền quản trị viên / Requires admin privileges:
- `/admin/dashboard` - Bảng điều khiển quản trị
- `/admin/settings` - Cài đặt quản trị

### 4. API Endpoints (`/api/*`)
RESTful API cho ứng dụng / RESTful API for the application:
- `/api/auth` - Authentication
- `/api/salaries` - Salaries
- `/api/expenses` - Expenses
- `/api/savings` - Savings
- `/api/deposits` - Deposits
- `/api/budget` - Budget
- `/api/transactions` - Transactions
- `/api/categories` - Categories
- `/api/bankAccount` - Bank Accounts
- `/api/rental-properties` - Rental Properties
- `/api/rentals` - Rentals
- `/api/recurring-bills` - Recurring Bills
- `/api/totp` - TOTP
- `/api/excel` - Excel Import/Export
- `/api/misa` - MISA Integration
- `/api/external` - External APIs
- `/api/goal` - Goals
- `/api/userConfig` - User Configuration

### 5. Tài liệu / Documentation
- `/api-docs` - Swagger API Documentation
- `/api-docs.json` - Swagger JSON specification

### 6. Hệ thống / System
- `/health` - Health check endpoint
- `/appInfo` - Application information

## Tệp Sitemap / Sitemap Files

### sitemap.xml
Tệp XML tiêu chuẩn cho công cụ tìm kiếm (SEO).
Standard XML format for search engines (SEO).

**Vị trí / Location**: `/public/sitemap.xml`
**URL truy cập / Access URL**: `https://example.com/sitemap.xml`

**⚠️ Lưu ý / Note**: Thay đổi `https://example.com` thành domain thực tế của bạn trước khi deploy.
**⚠️ Note**: Replace `https://example.com` with your actual domain before deployment.

### sitemap.txt
Tệp văn bản dễ đọc với mô tả song ngữ (Tiếng Việt/English).
Human-readable text format with bilingual descriptions (Vietnamese/English).

**Vị trí / Location**: `/public/sitemap.txt`
**URL truy cập / Access URL**: `https://example.com/sitemap.txt`

## Thay đổi trong Code / Code Changes

### JavaScript Files Updated
- `public/js/rental-detail.js` - Updated redirects to use `/app/rentals`
- `public/js/rentals.js` - Updated navigation to use `/app/rentals/:id/detail`

### Files Added
- `public/sitemap.xml` - XML sitemap
- `public/sitemap.txt` - Text sitemap with descriptions
- `public/SITEMAP.md` - This documentation file

## Lưu ý / Notes

1. **Tương thích ngược / Backward Compatibility**: 
   - Route `/app` sẽ tự động chuyển hướng đến `/app/dashboard`
   - Route `/admin` sẽ tự động chuyển hướng đến `/admin/dashboard`

2. **Bảo mật / Security**:
   - Tất cả các route `/app/*` yêu cầu xác thực người dùng
   - All `/app/*` routes require user authentication
   - Tất cả các route `/admin/*` yêu cầu quyền quản trị viên
   - All `/admin/*` routes require admin privileges

3. **Cập nhật liên kết / Updating Links**:
   - Các liên kết trong sidebar đã được cập nhật
   - Sidebar links have been updated
   - Các script JavaScript đã được cập nhật
   - JavaScript files have been updated

## Kiểm tra / Testing

Để kiểm tra các đường dẫn hoạt động đúng:
1. Khởi động server: `npm start`
2. Truy cập: `http://localhost:3000/sitemap.txt`
3. Kiểm tra từng URL trong danh sách

To test that paths work correctly:
1. Start server: `npm start`
2. Visit: `http://localhost:3000/sitemap.txt`
3. Test each URL in the list

## Hỗ trợ / Support

Nếu có vấn đề về đường dẫn, vui lòng kiểm tra:
- File constants: `src/constants/route_prefix.constant.ts`
- File routes: `src/routes/view.route.ts`, `src/routes/apps/view.route.ts`

If you have path issues, please check:
- Constants file: `src/constants/route_prefix.constant.ts`
- Route files: `src/routes/view.route.ts`, `src/routes/apps/view.route.ts`
