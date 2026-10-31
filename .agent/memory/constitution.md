# SlideCraft — Hiến Pháp & Pháp Lệnh Tối Cao (.agent/memory/constitution.md)

---
project: PowerPoint Editor (SlideCraft)
version: 1.0.0
last_updated: 2026-10-31
domain: https://ppt-editor.thuc.me
---

## 1. PHÁP LỆNH TỐI CAO
- **Docker-First Policy**: Mọi hoạt động code, chạy ứng dụng, kiểm thử phải diễn ra bên trong Docker container (`ppt_import_api`, `ppt_import_web`). Tuyệt đối KHÔNG chạy Python/Node trực tiếp trên môi trường host.
- **Dải Port Độc Quyền**: Tuân thủ dải port 9000-9999 từ biến môi trường `.env`:
  - Frontend Web Nginx: `PORT_WEB=9030`
  - Backend API FastAPI: `PORT_API=9031`
- **An Toàn Dữ Liệu Tuyệt Đối**:
  - KHÔNG BAO GIỜ chạy `docker compose down -v` trên môi trường Production (mất volume `ppt_storage` chứa SQLite DB và tài nguyên tải lên).
  - Không tự ý xóa file trong thư mục lưu trữ volume `/app/storage/`.

## 2. CHÍNH SÁCH DỮ LIỆU & GIAO DIỆN
- **Real Data Only**: Toàn bộ dữ liệu hiển thị (danh sách thiết kế, cộng tác viên, vai trò) phải truy xuất chuẩn xác 100% từ Database SQLite (`slidecraft.db`). Tuyệt đối KHÔNG dùng mock data hoặc hardcode danh sách giả.
- **Clean UI Copy**: Ngôn ngữ giao diện tiêu chuẩn, tự nhiên, thân thiện (phong cách Canva). Tuyệt đối không phô trương thuật ngữ kỹ thuật hạ tầng lên mặt người dùng (như "Database Core", "Engine Internal", "256-bit AES"...).
- **Phân Quyền Rõ Ràng**: Tách biệt rõ ràng quyền hạn: Chủ sở hữu (`owner`), Cộng tác viên được sửa (`editor`), Khách chỉ xem (`viewer`).

## 3. QUY TRÌNH PHÁT TRIỂN & CODE CONVENTIONS
- **Giao Tiếp Bằng Tiếng Việt**: Phản hồi developer và giải thích bằng Tiếng Việt thân thiện, rõ ràng.
- **PowerShell 5.1+**: Trên môi trường Windows, ngăn cách các lệnh bằng dấu chấm phẩy `;` (tuyệt đối KHÔNG dùng `&&`).
- **15-Minute Rule**: Mỗi tác vụ phát triển phải mang tính nguyên tử (atomic), ảnh hưởng ≤ 3 files khi không phải refactor lớn.
- **Không Hardcode Secrets**: URL máy chủ, Google Client ID, Secret, Callback phải luôn lấy từ file cấu hình `.env`.

