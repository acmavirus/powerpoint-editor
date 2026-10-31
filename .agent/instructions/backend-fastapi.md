# Hướng Dẫn Phát Triển Backend FastAPI & Hybrid Engine (.agent/instructions/backend-fastapi.md)

---

## 1. CÔNG NGHỆ CHỦ CHỐT
- **Framework**: FastAPI (Python 3.11+).
- **Thư viện xử lý PPTX**:
  - `python-pptx`: Bóc tách cấu trúc XML của slide, văn bản, bảng và tọa độ.
  - `LibreOffice Headless`: Chuyển đổi `.pptx` sang `.pdf` vector với đầy đủ font chữ nhúng và SmartArt.
  - `PyMuPDF (fitz)`: Trích xuất từng trang PDF sang Vector SVG và High-Res PNG (150 DPI).
- **Cơ sở dữ liệu**: SQLite (`/app/storage/slidecraft.db`).

---

## 2. QUY CHUẨN ENDPOINT RESTFUL API
- **Endpoint Quản Lý Thiết Kế**:
  - `GET /api/designs`: Trả về danh sách bài thiết kế (toàn bộ hoặc lọc theo `?user_email=...`).
  - `POST /api/designs`: Lưu bài thiết kế mới.
  - `GET /api/designs/{design_id}`: Chi tiết bài thiết kế.
  - `PUT /api/designs/{design_id}`: Tự động lưu (Auto-save) bài thiết kế.
  - `DELETE /api/designs/{design_id}`: Xóa bài thiết kế và toàn bộ cộng tác viên.
  - `POST /api/designs/{design_id}/duplicate`: Nhân bản bài thiết kế với ID và token mới.
- **Endpoint Phân Quyền Chia Sẻ**:
  - `POST /api/designs/{design_id}/collaborators`: Thêm thành viên cộng tác (`role`: `editor` / `viewer`).
  - `DELETE /api/designs/{design_id}/collaborators`: Xóa thành viên cộng tác.
  - `PUT /api/designs/{design_id}/access-level`: Cập nhật quyền chung (`private`, `public_view`, `public_edit`).
- **Endpoint Presence Thời Gian Thực**:
  - `POST /api/presence/heartbeat`: Nhận nhịp tim từ client và trả về danh sách người dùng đang active.
  - `POST /api/presence/leave`: Nhận thông báo người dùng đóng tab / rời bài thiết kế.

---

## 3. CÁC LƯU Ý QUAN TRỌNG
- Luôn kiểm tra đường dẫn file upload và sanitized filename trước khi ghi vào `/app/storage/uploads/`.
- Khi bổ sung cột mới cho database SQLite, viết hàm kiểm tra `PRAGMA table_info(...)` và `ALTER TABLE ADD COLUMN` an toàn trong `init_db()` để không làm mất dữ liệu hiện có.

