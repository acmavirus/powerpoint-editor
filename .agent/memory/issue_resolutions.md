# SlideCraft — Nhật Ký Xử Lý Sự Cố (.agent/memory/issue_resolutions.md)

---

## 1. Lỗi F5 / Reload Trang `/projects` Bị Rơi Lại Màn Hình Import
- **Triệu chứng**: Khi gõ hoặc F5 trang `http://localhost:9030/projects`, trang web không hiện Projects Grid mà quay về màn hình upload PPTX ban đầu.
- **Nguyên nhân**:
  - `initAppRouting()` được gọi ở giữa file `app.js` (dòng ~2240).
  - Các biến trạng thái của Projects Module (`previousViewBeforeProjects`, `cachedProjectsList`...) lại được khai báo ở dòng ~3170 bằng từ khóa `let`.
  - Trong JavaScript ES6, việc truy cập biến `let` trước dòng khai báo ném ra lỗi **Temporal Dead Zone (TDZ)**: `ReferenceError: Cannot access 'previousViewBeforeProjects' before initialization`.
  - Ngoại lệ này ngắt quá trình chạy của `initAppRouting`, khiến câu lệnh ẩn `uploadView` và hiện `projectsPageView` không được thực thi.
- **Cách khắc phục**:
  1. Đưa toàn bộ khai báo biến state của Projects Module lên đầu file `app.js`.
  2. Di chuyển lệnh gọi `initAppRouting()` xuống cuối cùng của file sau khi toàn bộ modules và event handlers đã sẵn sàng.
  3. Cập nhật version query string của thẻ `<script src="/app.js?v=...">` để chống trình duyệt cache mã nguồn cũ.

## 2. Lỗi `btnGoogleLoginHeader has already been declared`
- **Triệu chứng**: Trình duyệt báo `Uncaught SyntaxError: Identifier 'btnGoogleLoginHeader' has already been declared`.
- **Nguyên nhân**: Biến `const btnGoogleLoginHeader` bị khai báo 2 lần ở các phần code khác nhau khi bổ sung chức năng Google Auth.
- **Cách khắc phục**: Hợp nhất khai báo về một vị trí duy nhất ở đầu file `app.js`.

## 3. Lỗi PowerShell Regex Escape & Chuỗi Tìm Kiếm
- **Triệu chứng**: Chạy lệnh `Select-String -Pattern "id=\"..."` trên PowerShell gặp lỗi parse regex `\`.
- **Nguyên nhân**: PowerShell hiểu ký tự `\` theo cú pháp escape của PowerShell thay vì truyền nguyên vẹn vào regex.
- **Cách khắc phục**: Luôn dùng tham số `-SimpleMatch` cho chuỗi tĩnh: `Select-String -Path ... -SimpleMatch 'id="uploadView"'`.

## 4. Lỗi SQLite Foreign Key / Column Name Mismatch
- **Triệu chứng**: Gửi payload tạo hoặc nhân bản bài thiết kế nhận mã lỗi `500 Internal Server Error` (`ValueError: designId is required`).
- **Nguyên nhân**: Frontend gửi snake_case (`design_id`, `edit_token`), trong khi backend chỉ kiểm tra camelCase (`designId`, `editToken`).
- **Cách khắc phục**: Chuẩn hóa hàm `save_design()` trong `database.py` để chấp nhận cả hai kiểu đặt tên:
  `design_id = design_data.get("designId") or design_data.get("id") or design_data.get("design_id")`.

