# SlideCraft — Thông Tin Triển Khai & Vận Hành (.agent/memory/deployment.md)

---

## 1. THÔNG SỐ PRODUCTION VPS

- **Tên miền**: `https://ppt-editor.thuc.me`
- **Địa chỉ IP VPS**: `15.235.199.163`
- **Cổng SSH**: `2404`
- **Tài khoản SSH**: `root` (xác thực qua SSH Key `id_ed25519` / `id_rsa`)
- **Hệ điều hành**: Ubuntu 24.04.4 LTS
- **Thư mục dự án**: `/var/www/ppt-editor.thuc.me`
- **Git Remote**: `git@github.com:acmavirus/powerpoint-editor.git`

---

## 2. KIẾN TRÚC MẠNG & PHÂN BỔ PORT

- **Internet Traffic**:
  - Người dùng truy cập qua `https://ppt-editor.thuc.me` (Port 443 HTTPS).
  - Cloudflare Proxy bảo vệ và tăng tốc CDN.
- **Host Nginx trên VPS**:
  - File cấu hình: `/etc/nginx/sites-available/ppt-editor.thuc.me.conf`
  - Symlink: `/etc/nginx/sites-enabled/ppt-editor.thuc.me.conf`
  - Chứng chỉ SSL: Let's Encrypt tại `/etc/letsencrypt/live/ppt-editor.thuc.me/fullchain.pem` (Certbot tự động gia hạn)
  - `client_max_body_size 100M`
  - Reverse Proxy chuyển hướng toàn bộ traffic tới `http://127.0.0.1:9030`
- **Docker Containers**:
  - `ppt_import_web`: Lắng nghe trên host port `9030:80` (Nginx static + API proxy).
  - `ppt_import_api`: Lắng nghe trên host port `9031:9031` (FastAPI backend).

---

## 3. FILE CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env`)

```ini
PORT_WEB=9030
PORT_API=9031
ENV=production

APP_AUTH_CLIENTID=<YOUR_GOOGLE_OAUTH_CLIENT_ID>
APP_AUTH_CLIENTSECRET=<YOUR_GOOGLE_OAUTH_CLIENT_SECRET>
APP_AUTH_CALLBACK=https://ppt-editor.thuc.me/auth/google/callback
```

> **Lưu ý Google Cloud Console**: Cần duy trì 2 cấu hình sau trong OAuth 2.0 Client ID:
> - **Authorized JavaScript origins**: `https://ppt-editor.thuc.me`
> - **Authorized redirect URIs**: `https://ppt-editor.thuc.me/auth/google/callback`

---

## 4. QUY TRÌNH DEPLOY & CẬP NHẬT (QUICK DEPLOY)

Mỗi khi có code mới cần đưa lên VPS:
```bash
# 1. Commit và push từ máy local
git add .
git commit -m "feat: your new feature"
git push origin main

# 2. SSH vào VPS và pull code
ssh -p 2404 root@15.235.199.163 "cd /var/www/ppt-editor.thuc.me && git pull origin main && docker compose build && docker compose up -d"

# 3. Kiểm tra logs nếu cần
ssh -p 2404 root@15.235.199.163 "docker logs --tail 20 ppt_import_api"
```
