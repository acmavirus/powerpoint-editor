# SlideCraft — Quy Chuẩn Viết Code (.agent/rules/coding_conventions.md)

---

## 1. TƯ DUY SẢN XUẤT & QUY CHUẨN DỮ LIỆU THỰC TẾ (PRODUCTION & REAL DATA)
- **Tuyệt Đối Không Mock Data / Code Demo**:
  - Không được hardcode mảng dữ liệu giả định, item mẫu cố định, hoặc danh sách fake trong cả frontend lẫn backend.
  - Toàn bộ nội dung hiển thị (danh sách bài thuyết trình, kho mẫu slide, cộng tác viên, phông chữ...) phải được fetch từ API backend và kết nối trực tiếp vào SQLite Database.
- **Xử Lý Triệt Để Trạng Thái Rỗng (Empty State)**:
  - Khi API trả về mảng rỗng `[]` (ví dụ sau khi người dùng xóa hết dữ liệu):
    - Frontend PHẢI xóa sạch mọi hiển thị cũ.
    - Hiển thị component **Empty State chuẩn mực** (icon biểu tượng, thông báo "Chưa có dữ liệu trong hệ thống", nút kêu gọi hành động nếu phù hợp).
    - TUYỆT ĐỐI CẤM fallback sang mảng mock data hoặc mảng mẫu hardcoded.
- **Không Silent Fallbacks**:
  - Không tự ý thay thế dữ liệu null hoặc lỗi API bằng các chuỗi fake "cho đẹp giao diện". Phải phản ánh đúng trạng thái thực tế: Loading, Empty, Error, hoặc Success.
- **Data Integrity Check Trước Khi Triển Khai**:
  - Trước khi commit và đẩy lên máy chủ Production, phải kiểm tra đối chiếu dữ liệu trên màn hình với dữ liệu thực tế trong Database.

## 2. BACKEND (Python 3.11+ / FastAPI / SQLite)
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

## 3. FRONTEND (Vanilla JavaScript ES6 / Tailwind CSS / Fabric.js)
- **Khai Báo Biến Toàn Cục**:
  - Tất cả các biến DOM elements (`const ... = document.getElementById(...)`) và biến trạng thái toàn cục (`let ...`) PHẢI được khai báo ở đầu file `app.js` để tránh lỗi Temporal Dead Zone (TDZ).
- **Trình Tự Khởi Tạo SPA**:
  - Khai báo DOM & State &rarr; Utilities Functions &rarr; View Controllers &rarr; Event Handlers &rarr; Gọi `initAppRouting()` ở cuối cùng.
- **Tránh XSS & Escape HTML**:
  - Khi render dữ liệu chuỗi từ người dùng (tên bài, email, tên người dùng), luôn qua hàm `escapeHtml()`.
- **Hiển Thị Đầy Đủ 4 Trạng Thái Chuẩn Mực**:
  - **Loading**: skeleton/spinner khi đang gọi API.
  - **Empty**: hiển thị giao diện rỗng khi database không có dữ liệu (số lượng = 0).
  - **Error**: hiển thị thông báo lỗi khi API thất bại hoặc mất mạng.
  - **Success**: hiển thị danh sách dữ liệu thực tế.
- **Cache-Buster**:
  - Mỗi khi sửa file `app.js` hoặc `index.html`, hãy cập nhật query param version trong thẻ script: `<script src="/app.js?v=YYYYMMDD_feature"></script>`.

## 4. DOCKER & HẠ TẦNG
- **Docker-First**: Mọi lệnh test, chạy uvicorn, python, nginx phải diễn ra trong container.
- **Không Mount Volume Trực Tiếp Vào Môi Trường Đang Build**:
  - Dùng volume Docker (`ppt_storage`) cho dữ liệu bền vững (/app/storage).
- **Cấm Tuyệt Đối Lệnh Xóa Dữ Liệu Production**:
  - Tuyệt đối không chạy `docker compose down -v` trên server Production.
