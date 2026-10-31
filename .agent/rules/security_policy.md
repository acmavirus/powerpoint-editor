# SlideCraft — Chính Sách Bảo Mật (.agent/rules/security_policy.md)

---

## 1. BẢO VỆ THÔNG TIN NHẠY CẢM & SECRETS
- **Không Commit Secrets**: File `.env` chứa Google Client ID, Secret, API key và port phải luôn nằm trong `.gitignore`.
- **Tách Biệt Môi Trường**:
  - Development (máy local): `APP_AUTH_CALLBACK=http://localhost:9030/auth/google/callback`
  - Production (VPS): `APP_AUTH_CALLBACK=https://ppt-editor.thuc.me/auth/google/callback`

## 2. PHÂN QUYỀN TRUY CẬP (RBAC - ROLE-BASED ACCESS CONTROL)
- **Kiểm Tra Quyền Ở Cả Frontend Và Backend**:
  - Frontend: Ẩn thanh công cụ soạn thảo, khóa canvas `selectable = false`, `evented = false` nếu là `viewer`.
  - Backend: Kiểm tra quyền sở hữu (`owner_email`) trước khi cho phép thực hiện thao tác xóa (`DELETE /api/designs/{id}`) hoặc đổi cấp độ chia sẻ riêng tư (`PUT /api/designs/{id}/access-level`).
- **Access Denied Guard**:
  - Nếu bài thiết kế ở trạng thái `private`: chỉ chủ sở hữu và những người có email trong bảng `design_collaborators` mới được phép nạp bài. Mọi truy cập khác phải bị chặn bởi modal cảnh báo quyền riêng tư.

## 3. BẢO VỆ ĐƯỜNG TRUYỀN & MÁY CHỦ
- **HTTPS & SSL Bắt Buộc**: Toàn bộ kết nối trên môi trường Production phải đi qua SSL/TLS Let's Encrypt với HTTP Strict Transport Security và tự động chuyển hướng 301 từ HTTP sang HTTPS.
- **Giới Hạn Tải Lên (File Upload Limit)**: Cấu hình `client_max_body_size 100M` trên Nginx để tránh DoS/OOM bộ nhớ máy chủ khi người dùng tải lên tệp PowerPoint quá khổ.
- **Xóa Dữ Liệu An Toàn**: Khi xóa một bài thiết kế, phải xóa sạch trong cả 2 bảng `designs` và `design_collaborators` trong một transaction SQLite.

