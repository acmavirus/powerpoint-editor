Kế Hoạch Triển Khai: PPTX Import Engine & Test Workspace

1. Mục Tiêu Dự Án

Xây dựng module Import PPTX chuẩn xác (Zero Data Loss / Zero Layout Break) và giao diện thử nghiệm tương tác trực quan (Test Workspace) để người dùng tải lên và kiểm tra ngay lập tức các file .pptx phức tạp.

2. Kiến Trúc Kỹ Thuật (Hybrid Layer Architecture)
   Backend (Python FastAPI + LibreOffice + python-pptx + PyMuPDF)
   Container: python:3.11-slim tích hợp libreoffice-impress (headless) và font chữ cơ bản (msttcorefonts / freefonts).
   Core Engine:
   python-pptx: Bóc tách cấu trúc OOXML (slide dimensions, text boxes, font attributes, hình khối, bảng biểu, hình ảnh đính kèm).
   libreoffice headless: Render slide ra PDF/SVG gốc để đảm bảo 100% layout, font fallback, vector shape không bao giờ bị vỡ.
   PyMuPDF (fitz): Chuyển đổi PDF sang SVG/PNG độ phân giải cao cho từng trang slide với tốc độ cao.
   REST API Endpoints:
   POST /api/import/pptx: Tiếp nhận file .pptx, bóc tách dữ liệu và sinh JSON deck hoàn chỉnh.
   GET /api/slides/{deck_id}/{slide_index}/preview: Lấy ảnh preview/SVG chuẩn gốc.
   GET /api/slides/{deck_id}/assets/{asset_id}: Tải các hình ảnh/media đã trích xuất từ file.
   GET /api/demo/samples: Cung cấp sẵn các file slide mẫu thử nghiệm.
   Frontend (Test Workspace & Canvas UI)
   Container: Node/Vite build -> Nginx reverse proxy.
   Tính năng giao diện:
   Drag & Drop Upload Zone: Kéo thả bất kỳ file .pptx nào (kèm nút "Nạp slide mẫu").
   Slide Navigator (Left Sidebar): Danh sách slide thu nhỏ (thumbnails) với số trang, tiêu đề.
   Center Canvas Stage: Khung hiển thị slide tỷ lệ chuẩn (16:9 / 4:3).
   View Modes:
   Original High-Fidelity Layer: Xem bản render chuẩn 100% gốc từ PowerPoint.
   Interactive Edit Mode: Hiện các hộp văn bản bóc tách có thể chỉnh sửa trực tiếp trên nền canvas.
   Data Inspector Mode: Xem chi tiết cấu trúc JSON, danh sách text/shapes/images đã bóc tách.
   Fidelity & Diagnostic Card: Đo đạc số lượng phần tử bóc tách, thời gian xử lý, xác nhận zero-loss.
3. Các Bước Thực Hiện
   Giai đoạn 1: Chuẩn bị Cấu hình & Docker Environment
   Dừng container cũ web_powerpoint_editor đang chiếm port 9030.
   Thiết lập .env (Port 9030 cho Web, 9031 cho API).
   Tạo docker-compose.yml liên kết frontend và backend.
   Giai đoạn 2: Xây dựng Backend PPTX Import Engine
   Viết backend/Dockerfile cài đặt Python, LibreOffice headless, fonts.
   Viết backend/requirements.txt (fastapi, uvicorn, python-pptx, pymupdf, python-multipart).
   Viết backend/importer.py thực hiện bóc tách Hybrid Layer (Metadata + SVG/PNG + Text/Images).
   Viết backend/main.py cung cấp các API upload, preview và sample decks.
   Tạo sẵn 1 file PPTX mẫu đa dạng (tiêu đề, định dạng chữ, bảng, hình khối, ảnh) để test tức thì.
   Giai đoạn 3: Xây dựng Frontend Test Workspace
   Tạo giao diện Web hiện đại, responsive, trực quan với Tailwind CSS.
   Tích hợp bộ Upload file, Slide Carousel, Canvas View và Toggle Mode (Original vs Editable).
   Tích hợp API gọi backend và kiểm tra lỗi.
   Giai đoạn 4: Build, Khởi Chạy Container & Kiểm Thử
   Chạy docker compose up --build -d.
   Kiểm tra logs backend và frontend.
   Kiểm thử import file mẫu và đo lường độ toàn vẹn dữ liệu.
   Cung cấp hướng dẫn sử dụng và bàn giao cho user.
