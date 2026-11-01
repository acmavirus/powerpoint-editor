# Hướng Dẫn Phát Triển Frontend Canva-Style SPA (.agent/instructions/frontend-canva.md)

---

## 1. CÔNG NGHỆ CHỦ CHỐT
- **Giao Diện**: Vanilla HTML5, Tailwind CSS, Lucide Icons.
- **Canvas Engine**: Fabric.js (quản lý layer vector, chỉnh sửa text `fabric.IText`, zoom/pan canvas, undo/redo stack).
- **Client Routing**: HTML5 History API (`window.history.pushState`, `popstate`), tương thích chuẩn Nginx SPA (`try_files $uri $uri/ /index.html;`).

---

## 2. QUẢN LÝ CÁC VIEW (SPA STATES)
Toàn bộ ứng dụng gồm 4 view chính nằm bên trong thẻ `<main>`:
1. `#uploadView`: Màn hình khởi đầu (kéo thả file PPTX, kho slide mẫu thực tế từ DB, tạo slide mới, điều hướng tới Projects).
2. `#editorView`: Trình biên tập Canvas chính (thanh công cụ Canva trên đỉnh, sidebar định dạng bên trái, canvas ở giữa, thanh thumbnail slide bên dưới).
3. `#accountPageView`: Trang quản lý tài khoản người dùng Google riêng biệt (`/account`).
4. `#projectsPageView`: Trang quản lý danh sách toàn bộ bài thuyết trình thực tế (`/projects`).

---

## 3. PHÁP LỆNH DỮ LIỆU THỰC & SẢN XUẤT (100% REAL API DATA - STRICT NO MOCK DATA)
1. **Tuyệt Đối Cấm Hardcode Mock Data**:
   - Nghiêm cấm tạo các mảng dữ liệu giả lập tĩnh (như `const SYSTEM_PPTX_TEMPLATES = [...]`, `const MOCK_SLIDES = [...]`, `const DEMO_PROJECTS = [...]`) trong bất kỳ file JavaScript nào.
   - Toàn bộ dữ liệu hiển thị trên các drawer, modal, danh sách (Mẫu thiết kế, Bài thuyết trình của tôi, Slides, Phông chữ, Lịch sử...) BẮT BUỘC phải lấy trực tiếp từ Backend REST API (`/api/templates`, `/api/designs`, `/api/projects`...).
2. **Tôn Trọng Tuyệt Đối Trạng Thái Rỗng (Respect Empty State)**:
   - Khi API trả về mảng rỗng `[]` (ví dụ người dùng/admin đã xóa hết các mẫu trong Database), giao diện PHẢI hiển thị giao diện **Empty State** chân thực (ví dụ: "Chưa có mẫu nào. Nhấn để tạo mẫu đầu tiên!").
   - **CẤM SILENT FALLBACK**: Tuyệt đối không viết logic dạng: `const list = (res.templates && res.templates.length > 0) ? res.templates : HARDCODED_MOCK_LIST`. Khi database trống, phải hiển thị trống!
3. **Xử Lý Lỗi Trung Thực (Transparent Error State)**:
   - Khi API gặp lỗi kết nối (network error) hoặc mã lỗi HTTP (4xx, 5xx), PHẢI thông báo lỗi trung thực hoặc hiển thị Error State kèm nút Thử lại ("Retry"). Không được âm thầm nuốt lỗi rồi render dữ liệu giả.

---

## 4. QUY CHUẨN TRẢI NGHIỆM BIÊN TẬP CANVA (CANVA-PURE UX)
1. **Trải Nghiệm Xóa Đối Tượng Tức Thì (Instant Delete Execution)**:
   - Khi người dùng nhấn phím `Delete`, `Backspace` hoặc nhấn nút "Xóa" trên toolbar/menu ngữ cảnh:
     - Nếu đang ở chế độ gõ chữ, phải thoát chế độ gõ: `activeObj.exitEditing && activeObj.exitEditing()`.
     - Hủy lựa chọn ngay lập tức: `fabricCanvas.discardActiveObject()`.
     - Xóa đối tượng khỏi canvas: `fabricCanvas.remove(activeObj)`.
     - Reset trạng thái thanh công cụ: gọi `onObjectDeselected()`.
     - Render lại đồng bộ ngay lập tức: `fabricCanvas.renderAll()` (không chỉ dựa vào `requestRenderAll()` bất đồng bộ).
   - Đối tượng và khung viền bao quanh (bounding box / selection handles) PHẢI biến mất ngay lập tức, không được chờ click chuột ra ngoài mới mất.
2. **Giao Diện Tối Giản, Không Thừa Thãi (Canva-Clean)**:
   - Tuyệt đối không gắn các nút điều khiển thừa thãi, kỹ thuật (như nút "Bật / Tắt Sửa Chữ Trên Slide"). Chỉnh sửa chữ phải diễn ra in-place trực quan (double-click hoặc single-click trên canvas) tương tự Canva.com.
   - Không để lộ các nhãn kỹ thuật, badge hay thuật ngữ nội bộ backend/hạ tầng lên UI.

---

## 5. NGUYÊN TẮC BẮT BUỘC KHI VIẾT CODE TRONG `app.js`
1. **Khởi Tạo Tránh Lỗi TDZ (Temporal Dead Zone)**:
   - Tất cả các biến `const` (DOM elements) và `let` (state) PHẢI được đặt ở đầu file.
   - Hàm `initAppRouting()` PHẢI được gọi ở dòng CUỐI CÙNG của file sau khi toàn bộ modules đã load xong.
2. **Khóa Quyền Canvas Cho Viewer (Read-only Guard)**:
   - Khi `user_role === 'viewer'`, mọi phần tử trên Fabric Canvas phải bị vô hiệu hóa tương tác:
     `obj.set({ selectable: false, evented: false, lockMovementX: true, lockMovementY: true })`.
   - Ẩn thanh công cụ định dạng chữ và các nút thêm/xóa/sửa slide.
3. **Đồng Bộ Dữ Liệu Hai Chiều**:
   - Vừa lưu vào LocalStorage (`canva_design_{id}`) để làm việc offline mượt mà.
   - Vừa đồng bộ lên Database SQLite trung tâm qua `/api/designs` khi có mạng.
4. **Cache Busting**:
   - Mỗi lần cập nhật logic trong `app.js`, PHẢI tăng version query string trong `index.html` (ví dụ: `<script src="/app.js?v=20261101_canva_editor_v9"></script>`) để client không bị dính cache cũ trên Production.
