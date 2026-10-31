# Quy Trình Triển Khai Lên VPS (.agent/workflows/deploy.md)

---

## 1. MỤC TIÊU
Quy trình chuẩn hóa để triển khai cập nhật mã nguồn SlideCraft từ máy local lên Production VPS (`15.235.199.163` - `https://ppt-editor.thuc.me`).

---

## 2. CÁC BƯỚC THỰC HIỆN

### Bước 1: Kiểm tra thay đổi và commit tại Local
```powershell
# Kiểm tra trạng thái git
git status

# Add các file thay đổi (không add .env)
git add frontend/ backend/ docker-compose.yml README.md

# Commit với thông điệp Conventional Commits
git commit -m "feat: <tên tính năng mới>"

# Push lên GitHub
git push origin main
```

### Bước 2: Kéo code và build trên VPS
```powershell
# Chạy chuỗi lệnh đồng bộ trên VPS qua cổng SSH 2404
ssh -p 2404 root@15.235.199.163 "cd /var/www/ppt-editor.thuc.me && git pull origin main && docker compose build && docker compose up -d"
```

### Bước 3: Kiểm tra tính sẵn sàng của hệ thống
```powershell
# Kiểm tra containers trên VPS
ssh -p 2404 root@15.235.199.163 "docker ps --filter name=ppt_import"

# Kiểm tra log nếu có lỗi
ssh -p 2404 root@15.235.199.163 "docker logs --tail 25 ppt_import_api"

# Kiểm tra public endpoint
curl.exe -I https://ppt-editor.thuc.me
curl.exe -I https://ppt-editor.thuc.me/projects
curl.exe https://ppt-editor.thuc.me/api/designs
```
