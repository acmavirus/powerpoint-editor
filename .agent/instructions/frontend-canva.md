# Hướng Dẫn Phát Triển Frontend Canva-Style SPA (.agent/instructions/frontend-canva.md)

---

## 1. CÔNG NGHỆ CHỦ CHỐT
- **Giao Diện**: Vanilla HTML5, Tailwind CSS, Lucide Icons.
- **Canvas Engine**: Fabric.js (quản lý layer vector, chỉnh sửa text `fabric.IText`, zoom/pan canvas, undo/redo stack).
- **Client Routing**: HTML5 History API (`window.history.pushState`, `popstate`), tương thích chuẩn Nginx SPA (`try_files $uri $uri/ /index.html;`).

---

## 2. QUẢN LÝ CÁC VIEW (SPA STATES)
Toàn bộ ứng dụng gồm 4 view chính nằm bên trong thẻ `<main>`:
1. `#uploadView`: Màn hình khởi đầu (kéo thả file PPTX, nút mở slide mẫu, nút tạo slide mới, nút điều hướng tới Projects).
2. `#editorView`: Trình biên tập Canvas chính (thanh công cụ Canva trên đỉnh, sidebar định dạng bên trái, canvas ở giữa, thanh thumbnail slide bên dưới).
3. `#accountPageView`: Trang quản lý tài khoản người dùng Google riêng biệt (`/account`).
4. `#projectsPageView`: Trang quản lý danh sách toàn bộ bài thuyết trình (`/projects`).

---

## 3. NGUYÊN TẮC BẮT BUỘC KHI VIẾT CODE TRONG `app.js`
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
