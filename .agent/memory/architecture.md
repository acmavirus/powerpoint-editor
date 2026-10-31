# SlideCraft — Kiến Trúc Hệ Thống (.agent/memory/architecture.md)

---

## 1. TỔNG QUAN HỆ THỐNG

SlideCraft là trình biên tập bài thuyết trình web (Web PowerPoint Editor) được thiết kế theo phong cách Canva hiện đại, hỗ trợ:
- Nhập tệp PowerPoint (.pptx/.ppt) bảo toàn 100% vector & bố cục (Zero Data Loss).
- Soạn thảo và chỉnh sửa văn bản, hình khối, bảng biểu trực tiếp trên Canvas.
- Quản lý phiên làm việc, phân quyền cộng tác và hiển thị avatar người dùng cùng mở thời gian thực.
- Quản lý danh sách bài thiết kế (Dashboard Projects) với đầy đủ CRUD, nhân bản và xóa.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                    |
|   SPA (HTML5 / TailwindCSS / Fabric.js / Lucide Icons / BroadcastChannel API)     |
|   Routes: / (Upload) | /design/:id/:token/(edit|view) | /account | /projects      |
+-----------------------------------------------------------------------------------+
                                        |  HTTP/HTTPS (Port 80/443)
                                        v
+-----------------------------------------------------------------------------------+
|                        HOST NGINX (Reverse Proxy & SSL)                           |
|   Domain: https://ppt-editor.thuc.me | Let's Encrypt SSL | Client Max Body: 100M  |
+-----------------------------------------------------------------------------------+
                                        |  Proxy: http://127.0.0.1:9030
                                        v
+-----------------------------------------------------------------------------------+
|                         CONTAINER: ppt_import_web (Nginx)                         |
|   Static Assets (/usr/share/nginx/html)                                           |
|   /api/*  ---> Proxy tới http://backend:9031/api/*                                |
|   /auth/* ---> Proxy tới http://backend:9031/api/auth/*                           |
+-----------------------------------------------------------------------------------+
                                        |  Internal Network: backend:9031
                                        v
+-----------------------------------------------------------------------------------+
|                        CONTAINER: ppt_import_api (FastAPI)                        |
|   - PPTX Hybrid Parser (LibreOffice Headless + PyMuPDF + python-pptx)             |
|   - SQLite Central Database (/app/storage/slidecraft.db)                          |
|   - Real-time Multi-User Presence Tracker (Memory In-Memory + Heartbeat)          |
|   - Google OAuth 2.0 Auth Engine                                                  |
+-----------------------------------------------------------------------------------+
```

---

## 2. HYBRID PPTX PARSING ENGINE (ZERO DATA LOSS)

Phương pháp kết hợp 3 lớp giúp bóc tách và giữ trọn vẹn slide PowerPoint:
1. **Lớp 1: Vector & Raster Fidelity (LibreOffice Headless + PyMuPDF)**:
   - Chuyển đổi file `.pptx` sang PDF chất lượng cao.
   - Trích xuất từng slide sang định dạng Vector SVG và ảnh PNG phân giải cao (150 DPI) làm background layer.
   - Đảm bảo 100% SmartArt, font chữ nhúng, bảng màu và hình minh họa không bao giờ bị vỡ hay mất nét.
2. **Lớp 2: Editable Text & Object Overlay (python-pptx)**:
   - Quét cấu trúc XML để lấy tọa độ $(x, y, w, h)$, font chữ, cỡ chữ, màu sắc, canh lề của từng TextBox.
   - Tạo ra các đối tượng `fabric.IText` trong suốt hoặc có thể tương tác nằm khớp đè lên vị trí tương ứng trên canvas.
3. **Lớp 3: Bảng biểu & Hình khối (Tables & Shapes)**:
   - Trích xuất dữ liệu ma trận bảng (rows, cols) để vẽ bảng tương tác.

---

## 3. CƠ SỞ DỮ LIỆU SQLITE SCHEMA (`/app/storage/slidecraft.db`)

Cơ sở dữ liệu trung tâm gồm 4 bảng chính:
- **`designs`**:
  - `design_id` (TEXT, PK): ID theo chuẩn Canva (e.g., `DAHZkAweP4E`).
  - `edit_token` (TEXT): Token bảo mật URL 22 ký tự Base64.
  - `title` (TEXT): Tên bài thuyết trình.
  - `owner_id`, `owner_name`, `owner_email` (TEXT): Thông tin chủ sở hữu.
  - `slide_count` (INTEGER), `slides_json` (TEXT), `custom_fonts_json` (TEXT).
  - `thumbnail_url` (TEXT): Đường dẫn ảnh thu nhỏ.
  - `share_access_level` (TEXT): `private`, `public_view`, `public_edit`.
  - `created_at`, `updated_at` (DATETIME).
- **`design_collaborators`**:
  - `id` (INTEGER, PK), `design_id` (TEXT, FK), `email` (TEXT), `name` (TEXT), `role` (TEXT: `editor`/`viewer`), `invited_at` (DATETIME).
- **`users`**:
  - `google_id` (TEXT, PK), `email` (TEXT), `name` (TEXT), `picture` (TEXT), `created_at`, `last_login`.
- **`activity_logs`**:
  - Ghi nhận lịch sử thao tác: mở bài, cập nhật, phân quyền, nhân bản.

---

## 4. REAL-TIME PRESENCE & BROADCAST ENGINE

Theo dõi người dùng đồng thời mở cùng một bài thiết kế:
- **In-Memory Tracker trên Server**: Dictionary `active_collaborators[design_id]` lưu danh sách phiên active với timestamp `last_seen`. Chu kỳ dọn dẹp timeout sau 60 giây (chống throttle tab).
- **BroadcastChannel API ở Frontend**: Kênh `'slidecraft_presence_' + designId` kết nối các tab cùng trình duyệt tức thì (< 5ms) mà không phụ thuộc độ trễ mạng.
- **Heartbeat định kỳ**: Gửi định kỳ mỗi 2 giây tới `/api/presence/heartbeat` và `/api/presence/leave` (kèm `navigator.sendBeacon` khi đóng tab).
- **Avatar Stack trên Header**: Hiển thị avatar tròn xếp chồng (overlapping), viền màu sắc định danh, chấm xanh online và tooltip hiện tên khi hover.
