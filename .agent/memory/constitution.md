# SlideCraft — Hiến Pháp & Pháp Lệnh Tối Cao (.agent/memory/constitution.md)

---
project: PowerPoint Editor (SlideCraft)
version: 2.0.0
last_updated: 2026-11-01
domain: https://ppt-editor.thuc.me
status: Live Production
---

## 1. PHÁP LỆNH TỐI CAO & TƯ DUY SẢN XUẤT (PRODUCTION-GRADE MANDATE)
- **Tư Duy Dự Án Đang Sản Xuất (Production Mindset)**:
  - Đây là sản phẩm đang hoạt động thực tế trên Production (`https://ppt-editor.thuc.me`) phục vụ người dùng thật.
  - Tuyệt đối KHÔNG viết code theo kiểu "thử nghiệm", "chạy demo", "tạm thời" hay "cho đẹp mắt".
  - Mọi tính năng, module, API phải được thiết kế hoàn chỉnh, an toàn, ổn định và sẵn sàng chịu tải thực tế.
- **NGHIÊM CẤM MOCK DATA & CODE DEMO DƯỚI MỌI HÌNH THỨC (STRICT NO MOCK DATA)**:
  - **Tuyệt đối KHÔNG hardcode mock data**: Không được tạo bất kỳ mảng mẫu giả, danh sách giả, thẻ giả (như `SAMPLE_TEMPLATES`, `MOCK_SLIDES`, `DEMO_PROJECTS`...) trong mã nguồn frontend hoặc backend.
  - **100% Real Data**: Toàn bộ dữ liệu hiển thị (kho mẫu Templates, danh sách bài Projects, cộng tác viên, phông chữ, slide) BẮT BUỘC phải truy xuất 100% từ Database SQLite (`slidecraft.db`) thông qua API backend.
  - **Tôn Trọng Tuyệt Đối Trạng Thái Rỗng (Respect Empty State)**: Khi người dùng hoặc admin xóa hết dữ liệu trong Database (mảng trả về `[]`), hệ thống PHẢI hiển thị trạng thái **Empty State chân thực** (thông báo trống + nút hướng dẫn thêm mới). Tuyệt đối KHÔNG được "chữa cháy" bằng cách fallback âm thầm sang mảng mẫu giả.
  - **Xử Lý Lỗi Trung Thực (No Silent Fallbacks)**: Khi API lỗi, phải hiển thị Error State hoặc thông báo lỗi rõ ràng, không được tự ý thay thế bằng dữ liệu giả lập để "lấp liếm".
  - **CẤM Tự Ý Seed/Insert Dữ Liệu Rác Vào Database**: Không được tự chế hoặc tự động insert dữ liệu giả vào Database trừ khi người dùng yêu cầu rõ ràng, tường minh.
- **Docker-First Policy**: Mọi hoạt động code, chạy ứng dụng, kiểm thử phải diễn ra bên trong Docker container (`ppt_import_api`, `ppt_import_web`). Tuyệt đối KHÔNG chạy Python/Node trực tiếp trên môi trường host.
- **Dải Port Độc Quyền**: Tuân thủ dải port 9000-9999 từ biến môi trường `.env`:
  - Frontend Web Nginx: `PORT_WEB=9030`
  - Backend API FastAPI: `PORT_API=9031`
- **An Toàn Dữ Liệu Tuyệt Đối**:
  - KHÔNG BAO GIỜ chạy `docker compose down -v` trên môi trường Production (mất volume `ppt_storage` chứa SQLite DB và tài nguyên tải lên).
  - Không tự ý xóa file trong thư mục lưu trữ volume `/app/storage/`.

## 2. CHÍNH SÁCH GIAO DIỆN & BẢO MẬT (CLEAN UI & SECURITY)
- **Clean UI Copy**: Ngôn ngữ giao diện tiêu chuẩn, tự nhiên, thân thiện (phong cách Canva thuần túy). Tuyệt đối không phô trương thuật ngữ kỹ thuật hạ tầng lên mặt người dùng (như "Database Core", "Engine Internal", "256-bit AES"...).
- **Phân Quyền Rõ Ràng**: Tách biệt rõ ràng quyền hạn: Chủ sở hữu (`owner`), Cộng tác viên được sửa (`editor`), Khách chỉ xem (`viewer`).
- **Không Hardcode Secrets**: URL máy chủ, Google Client ID, Secret, Callback phải luôn lấy từ file cấu hình `.env`.

## 3. QUY TRÌNH PHÁT TRIỂN & CODE CONVENTIONS
- **Giao Tiếp Bằng Tiếng Việt**: Phản hồi developer và giải thích bằng Tiếng Việt thân thiện, rõ ràng, trung thực.
- **PowerShell 5.1+**: Trên môi trường Windows, ngăn cách các lệnh bằng dấu chấm phẩy `;` (tuyệt đối KHÔNG dùng `&&`).
- **15-Minute Rule**: Mỗi tác vụ phát triển phải mang tính nguyên tử (atomic), ảnh hưởng ≤ 3 files khi không phải refactor lớn.
- **Pre-Deploy Verification**: Trước khi triển khai lên VPS Production, phải đối chiếu số liệu hiển thị trên giao diện với truy vấn database thực tế để đảm bảo khớp 100%.
