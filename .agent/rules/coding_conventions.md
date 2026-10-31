# SlideCraft — Quy Chuẩn Viết Code (.agent/rules/coding_conventions.md)

---

## 1. BACKEND (Python 3.11+ / FastAPI / SQLite)
- **Type Hints**: Toàn bộ hàm, router, service phải có type hints đầy đủ (`Optional`, `Dict[str, Any]`, `List[...]`).
- **Database Connection Lifecycle**:
  - Luôn mở kết nối SQLite bằng hàm `get_db_connection()`.
  - Luôn bọc trong khối `try...finally: conn.close()` để tránh rò rỉ file lock hoặc connection pool.
  - Sử dụng tham số hóa truy vấn SQL (`?`) tuyệt đối không cộng chuỗi SQL trực tiếp để chống SQL Injection.
- **Handling Payload Casing**:
  - Khi nhận JSON từ frontend, luôn hỗ trợ cả hai phong cách đặt tên: `camelCase` (JS convention) và `snake_case` (Python convention).
- **Error Handling**:
  - Ghi log chi tiết bằng `logger.exception()` khi gặp lỗi backend.
  - Ném `HTTPException(status_code=..., detail="Mô tả lỗi rõ ràng")`.

## 2. FRONTEND (Vanilla JavaScript ES6 / Tailwind CSS / Fabric.js)
- **Khai Báo Biến Toàn Cục**:
  - Tất cả các biến DOM elements (`const ... = document.getElementById(...)`) và biến trạng thái toàn cục (`let ...`) PHẢI được khai báo ở đầu file `app.js` để tránh lỗi Temporal Dead Zone (TDZ).
- **Trình Tự Khởi Tạo SPA**:
  - Khai báo DOM & State &rarr; Utilities Functions &rarr; View Controllers &rarr; Event Handlers &rarr; Gọi `initAppRouting()` ở cuối cùng.
- **Tránh XSS & Escape HTML**:
  - Khi render dữ liệu chuỗi từ người dùng (tên bài, email, tên người dùng), luôn qua hàm `escapeHtml()`.
- **Hiển Thị 4 Trạng Thái Chuẩn Mực**:
  - Mọi view hoặc tính năng tải dữ liệu phải xử lý đủ 4 trạng thái: **Loading** (skeleton/spinner), **Empty** (thông báo trống + nút gợi ý tạo), **Error** (toast/thông báo đỏ), **Success** (hiển thị dữ liệu chuẩn).
- **Cache-Buster**:
  - Mỗi khi sửa file `app.js` hoặc `index.html`, hãy cập nhật query param version trong thẻ script: `<script src="/app.js?v=YYYYMMDD_feature"></script>`.

## 3. DOCKER & HẠ TẦNG
- **Docker-First**: Mọi lệnh test, chạy uvicorn, python, nginx phải diễn ra trong container.
- **Không Mount Volume Trực Tiếp Vào Môi Trường Đang Build**:
  - Dùng volume Docker (`ppt_storage`) cho dữ liệu bền vững (/app/storage).
