# Quy Trình Sửa Lỗi Chuẩn Hóa (.agent/workflows/fix-bug.md)

---

## 1. NGUYÊN TẮC DEBUG
- **Đọc Logs Ngay Lập Tức**:
  - `docker logs --tail 50 ppt_import_api` (hoặc qua SSH trên VPS).
  - Không đoán mò khi chưa nhìn thấy log lỗi hoặc stack trace.
- **Atomic & Reversible**:
  - Sửa từng lỗi một, kiểm tra xem có ảnh hưởng đến các module khác không.
  - Kiểm tra tính cân bằng cú pháp JavaScript (Braces, Parens, Brackets diff = 0) trước khi deploy.

---

## 2. QUY TRÌNH XỬ LÝ LỖI
1. **Tái hiện lỗi**: Ghi nhận chính xác URL, hành động của người dùng, và thông báo lỗi trên console/terminal.
2. **Xác định nguyên nhân gốc rễ (Root Cause)**:
   - Nếu là Frontend: kiểm tra Console error (F12), TDZ, biến trùng lặp, routing.
   - Nếu là Backend: kiểm tra exception log trong container FastAPI, kết nối SQLite, schema cột.
   - Nếu là Mạng / Nginx: kiểm tra Host Nginx error log (`/var/log/nginx/ppt-editor.thuc.me_error.log`).
3. **Thực thi bản vá (Patch)**:
   - Sửa mã nguồn cục bộ.
   - Kiểm tra syntax bằng script trong container.
   - Copy vào container local kiểm thử:
     `docker cp frontend/src/. ppt_import_web:/usr/share/nginx/html/; docker restart ppt_import_web`
4. **Kiểm thử hồi quy (Regression Test)**:
   - Đảm bảo các chức năng cũ (import, edit, share, projects) vẫn chạy tốt.
5. **Ghi lại vào Memory**:
   - Thêm bài học kinh nghiệm vào `.agent/memory/issue_resolutions.md`.
