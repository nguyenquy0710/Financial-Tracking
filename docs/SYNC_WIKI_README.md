# GitHub Action: Sync Wiki Documentation 🔄

## Mục đích

GitHub Action này tự động đồng bộ các file markdown từ thư mục `/wiki/` trong repository chính sang GitHub Wiki repository khi có thay đổi.

## Cách hoạt động

### Kích hoạt (Triggers)

Action sẽ tự động chạy khi:

1. **Push vào branches chính** (main, master, develop) và có thay đổi trong thư mục `wiki/`:
   ```yaml
   on:
     push:
       branches: [main, master, develop]
       paths: ['wiki/**']
   ```

2. **Manual trigger** - Có thể chạy thủ công từ Actions tab:
   - Vào **Actions** tab trên GitHub
   - Chọn workflow **"Sync Wiki Documentation"**
   - Click **"Run workflow"**

### Quy trình

```
┌─────────────────────────────────────────────────────────┐
│ 1. Checkout main repository                            │
│    - Clone code từ repository chính                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Configure Git                                        │
│    - Setup git user name và email                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Clone wiki repository                                │
│    - Clone wiki repo vào thư mục wiki-repo/            │
│    - URL: github.com/{repo}.wiki.git                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Copy wiki files                                      │
│    - Copy tất cả *.md từ wiki/ sang wiki-repo/        │
│    - List files để kiểm tra                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. Commit and push changes                              │
│    - Check có thay đổi không                           │
│    - Commit với message chi tiết                       │
│    - Push lên wiki repository                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Summary                                              │
│    - Hiển thị thông tin sync                           │
│    - Link đến Wiki                                      │
└─────────────────────────────────────────────────────────┘
```

## Yêu cầu

### Permissions

Action cần quyền `contents: write` để:
- Đọc code từ repository chính
- Clone và push vào wiki repository
- Sử dụng `GITHUB_TOKEN` built-in

**Không cần** tạo Personal Access Token hay Deploy Key!

### Repository Settings

1. **Wiki phải được kích hoạt**:
   - Vào **Settings** > **Features**
   - Tích ☑️ **Wikis**

2. **Actions có quyền write**:
   - Vào **Settings** > **Actions** > **General**
   - Trong **Workflow permissions**, chọn:
     - ✅ **Read and write permissions**

## Sử dụng

### Tự động

Sau khi merge PR này:

1. Mỗi khi push thay đổi vào `wiki/` trên branch main/master/develop
2. Action tự động chạy
3. Wiki được cập nhật trong vài giây
4. Truy cập: https://github.com/nguyenquy0710/Financial-Tracking/wiki

### Thủ công

Nếu cần sync ngay:

1. Vào **Actions** tab
2. Chọn **Sync Wiki Documentation**
3. Click **Run workflow**
4. Chọn branch
5. Click **Run workflow** (xanh)

## Commit Message

Action sẽ tạo commit message với format:

```
Auto-sync wiki from main repo

Source commit: abc123def456...
Message: [Original commit message]

Synced by GitHub Actions
```

## Output & Logs

### Step Summary

Sau khi chạy xong, sẽ hiển thị summary:

```
### Wiki Sync Summary 📚

**Repository:** nguyenquy0710/Financial-Tracking
**Branch:** main
**Commit:** abc123def456...
**Wiki URL:** https://github.com/nguyenquy0710/Financial-Tracking/wiki

Wiki documentation has been synced successfully! 🎉
```

### Console Logs

Trong logs sẽ thấy:

```bash
# Khi có thay đổi
Files to be synced:
-rw-r--r-- 1 runner docker  4798 Dec  5 07:25 Home.md
-rw-r--r-- 1 runner docker  7225 Dec  5 07:25 Huong-dan-Cai-dat.md
...
✅ Wiki synced successfully!

# Khi không có thay đổi
ℹ️ No changes to sync
```

## Troubleshooting

### Action không chạy

**Kiểm tra**:
1. Wiki đã được kích hoạt trong Settings?
2. Actions có quyền write?
3. Push có thay đổi trong thư mục `wiki/` không?

**Debug**:
- Xem trong Actions tab > workflow runs
- Kiểm tra logs của từng step
- Xem "Annotations" nếu có lỗi

### Lỗi: Permission denied

**Nguyên nhân**: Actions không có quyền write

**Giải pháp**:
1. Vào **Settings** > **Actions** > **General**
2. Chọn **Read and write permissions**
3. Save

### Lỗi: Wiki repository not found

**Nguyên nhân**: Wiki chưa được tạo

**Giải pháp**:
1. Vào Wiki tab
2. Click **Create the first page**
3. Tạo trang đầu tiên (bất kỳ nội dung)
4. Action sẽ hoạt động sau đó

### Files không được sync

**Kiểm tra**:
1. Files có extension `.md` không?
2. Files nằm trong thư mục `wiki/` không?
3. Xem logs để biết files nào được copy

## Best Practices

### 1. Test trước khi merge

Trước khi merge PR:
- Chạy thử action bằng workflow_dispatch
- Kiểm tra wiki có được cập nhật không
- Verify links và formatting

### 2. Commit message rõ ràng

Viết commit message rõ ràng khi sửa wiki:
```
Update FAQ with MongoDB troubleshooting

Added 5 new Q&A about MongoDB connection issues
```

Action sẽ copy message này vào wiki commit.

### 3. Review wiki sau mỗi sync

- Check wiki pages sau khi action chạy
- Verify links không bị broken
- Kiểm tra formatting

### 4. Branch protection

Nếu dùng branch protection:
- Action cần chạy trên protected branch
- Hoặc dùng workflow_dispatch để sync thủ công

## Monitoring

### GitHub Actions Dashboard

Xem trạng thái actions:
1. Vào **Actions** tab
2. Xem workflow runs
3. Check status: ✅ Success, ❌ Failed, 🟡 Running

### Notifications

Nhận thông báo khi action fail:
1. Vào **Settings** > **Notifications**
2. Bật **Actions** notifications
3. Chọn email hoặc GitHub notifications

## Workflow File

File workflow: `.github/workflows/sync-wiki.yml`

```yaml
name: Sync Wiki Documentation

on:
  push:
    branches: [main, master, develop]
    paths: ['wiki/**']
  workflow_dispatch:

permissions:
  contents: write

jobs:
  sync-wiki:
    runs-on: ubuntu-latest
    steps:
      - Checkout repository
      - Configure Git
      - Clone wiki
      - Copy files
      - Commit and push
      - Summary
```

## Giới hạn

### Rate Limits

GitHub Actions có giới hạn:
- **Public repos**: Unlimited minutes
- **Private repos**: 2000 minutes/month (free tier)

Action này chạy rất nhanh (~30 giây), không lo vượt quá.

### File Size

- Wiki pages nên < 1MB/file
- Không upload binary files (images, PDFs) vào wiki/
- Dùng links đến assets trong repo chính

### Conflicts

Nếu edit wiki trực tiếp trên GitHub và cũng push từ repo:
- Action có thể bị conflict
- Solution: Luôn edit trong repo, không edit trực tiếp trên wiki
- Hoặc pull changes từ wiki về repo trước

## Alternative: Manual Sync

Nếu không muốn dùng Action, có thể sync thủ công:

```bash
# Clone wiki
git clone https://github.com/nguyenquy0710/Financial-Tracking.wiki.git

# Copy files
cp wiki/*.md Financial-Tracking.wiki/

# Commit and push
cd Financial-Tracking.wiki
git add .
git commit -m "Update wiki"
git push
```

## Support

Nếu gặp vấn đề:
1. Check workflow logs
2. Xem [GitHub Actions Documentation](https://docs.github.com/en/actions)
3. Tạo issue với logs đính kèm

## Changelog

### v1.0.0 (2024-12-05)
- ✅ Initial release
- ✅ Auto-sync wiki on push to main/master/develop
- ✅ Manual trigger support
- ✅ Detailed commit messages
- ✅ Summary output

---

Created for FinTrack project by GitHub Copilot
