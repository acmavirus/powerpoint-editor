# SlideCraft — Nhật Ký Quyết Định Kỹ Thuật (.agent/memory/decision_log.md)

---

## 1. [2026-10-31] Kiến Trúc Hybrid PPTX Layer (Zero Data Loss)
- **Vấn đề**: Các thư viện JavaScript phía frontend (JSZip, pptxjs) hay backend thuần (`python-pptx`) khi parse file PowerPoint thường làm mất font chữ nhúng, vỡ SmartArt, lệch hình khối và mất màu sắc.
- **Quyết định**: Sử dụng mô hình **Hybrid 3 Lớp**:
  - Lớp nền: LibreOffice Headless chuyển PPTX sang PDF vector, sau đó dùng PyMuPDF bóc tách từng trang sang Vector SVG và High-Res PNG (150 DPI) làm background không thể vỡ.
  - Lớp phủ: Dùng `python-pptx` đọc tọa độ chính xác của các TextBox để vẽ các hộp văn bản có thể chỉnh sửa đè lên trên.
- **Hệ quả**: Slide hiển thị đẹp 100% như PowerPoint gốc, vừa có thể click vào sửa chữ trực tiếp.

## 2. [2026-10-31] Định Danh Canva URL & Cấu Trúc Link Chia Sẻ
- **Vấn đề**: Người dùng cần cơ chế chia sẻ link theo phong cách Canva (`/design/:id/:token/edit`).
- **Quyết định**:
  - `designId`: Tiền tố `DA` + 9 ký tự ngẫu nhiên (tổng 11 ký tự, e.g. `DAHZkAweP4E`).
  - `editToken`: 22 ký tự Base64 URL-safe.
  - Hỗ trợ routing SPA: Khi mở link, tự động đồng bộ bài từ SQLite server DB hoặc LocalStorage.

## 3. [2026-10-31] Cơ Chế Presence Thời Gian Thực Kết Hợp (BroadcastChannel + REST Heartbeat)
- **Vấn đề**: Khi nhiều người cùng mở bài hoặc người dùng mở 2 tab/trình duyệt để test, WebSocket phức tạp và dễ bị lỗi kết nối nếu qua Cloudflare proxy dài ngày.
- **Quyết định**:
  - Cùng trình duyệt/tab: Dùng **BroadcastChannel API** (`slidecraft_presence_{id}`) để truyền tin tức thì (< 5ms).
  - Giữa các máy khác nhau: Dùng **REST Heartbeat** gửi mỗi 2 giây lên server in-memory tracker, timeout 60 giây để tránh bị tab inactive throttle.
  - Thoát bài: Dùng `navigator.sendBeacon` đảm bảo gói tin rời phòng gửi thành công khi đóng tab.

## 4. [2026-10-31] Trang Quản Lý Dự Án Riêng Biệt (`/projects`)
- **Vấn đề**: Người dùng cần xem danh sách tất cả các slide mà họ đã tạo hoặc được chia sẻ.
- **Quyết định**:
  - Xây dựng view SPA `#projectsPageView` với phong cách Canva Dashboard: lưới card có mockup slide preview, badge vai trò (`Chủ sở hữu`, `Được sửa`, `Chỉ xem`), các tab bộ lọc (`Tất cả`, `Của tôi`, `Được chia sẻ`), tìm kiếm thời gian thực, menu nhân bản bài và xóa bài có modal xác nhận.
  - Định tuyến route `/projects` tương thích hoàn toàn với SPA Nginx (`try_files $uri $uri/ /index.html;`).
