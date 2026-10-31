# Quy Trình Kiểm Tra Trạng Thái Hệ Thống (.agent/workflows/check-status.md)

---

## 1. MỤC TIÊU
Kiểm tra sức khỏe, kết nối mạng, cơ sở dữ liệu SQLite, và tính toàn vẹn của cả hai môi trường: Local Docker và Production VPS.

---

## 2. KIỂM TRA MÔI TRƯỜNG LOCAL
```powershell
# 1. Trạng thái containers local
docker ps --filter "name=ppt_import"

# 2. Kiểm tra web local
curl.exe -I http://localhost:9030/
curl.exe -I http://localhost:9030/projects

# 3. Kiểm tra database API local
curl.exe http://localhost:9030/api/designs

# 4. Kiểm tra logs container backend
docker logs --tail 25 ppt_import_api
```

---

## 3. KIỂM TRA MÔI TRƯỜNG PRODUCTION VPS
```powershell
# 1. Trạng thái containers trên VPS
ssh -p 2404 root@15.235.199.163 "docker ps --filter name=ppt_import"

# 2. Kiểm tra Host Nginx và SSL Let's Encrypt
ssh -p 2404 root@15.235.199.163 "nginx -t; certbot certificates | grep ppt-editor"

# 3. Kiểm tra Public HTTPS Endpoints
curl.exe -I https://ppt-editor.thuc.me
curl.exe -I https://ppt-editor.thuc.me/projects
curl.exe https://ppt-editor.thuc.me/api/designs
```

