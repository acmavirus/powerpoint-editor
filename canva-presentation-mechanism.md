# Cơ chế cốt lõi của Slide thuyết trình kiểu Canva

> **Lưu ý cho AI đọc tài liệu này:** Canva không công bố schema hay kiến trúc nội bộ. Toàn bộ nội dung dưới đây là **mô hình khái niệm** suy ra từ cách các editor thiết kế trực tuyến thường hoạt động. Các đoạn JSON/code là **minh họa**, không phải cấu trúc thật của Canva. Khi dùng làm cơ sở để xây công cụ, hãy coi đây là thiết kế tham khảo, không phải đặc tả chính thức.

## 0. Tổng quan

Canva là nền tảng thiết kế đồ họa trực tuyến (ra đời ở Úc năm 2013), cho phép người không chuyên tạo poster, slide, logo, video ngắn... bằng kéo thả.

Công thức tóm gọn:

> **Tài liệu dạng layer lưu trên cloud + trình soạn thảo web kéo thả + kho mẫu/tài nguyên lớn + đồng bộ thời gian thực + bộ kết xuất ra nhiều định dạng.**

Tài liệu này tập trung vào hai lõi: **(1) mô hình dữ liệu** và **(2) trình soạn thảo trên trình duyệt**.

---

## 1. Slide là dữ liệu có cấu trúc (không phải ảnh)

### 1.1 Cấu trúc cây

```
Design
 └─ Page (slide)
     └─ Element (layer): text, image, shape, video, group, chart, table...
```

Khi người dùng kéo thả, đổi màu, đổi chữ, thực chất họ chỉ **sửa thuộc tính của các Element** trong cây này.

### 1.2 Ví dụ JSON minh họa

```json
{
  "id": "design_1",
  "size": { "w": 1920, "h": 1080 },
  "pages": [
    {
      "id": "page_1",
      "background": { "type": "color", "value": "#FFFFFF" },
      "elements": [
        {
          "id": "el_1",
          "type": "text",
          "x": 120, "y": 200, "w": 900, "h": 160,
          "rotation": 0,
          "text": "Tiêu đề slide",
          "style": { "font": "Montserrat", "size": 72, "color": "#111", "bold": true }
        },
        {
          "id": "el_2",
          "type": "image",
          "x": 1000, "y": 150, "w": 700, "h": 700,
          "assetId": "asset_abc123",
          "crop": { "x": 0, "y": 0, "w": 1, "h": 1 }
        }
      ]
    }
  ]
}
```

### 1.3 Nguyên tắc thiết kế cốt lõi

| Nguyên tắc | Mô tả |
|---|---|
| **Hệ tọa độ logic cố định** | Slide có kích thước "ảo" (vd 1920×1080). Mọi element đặt theo hệ này; khi hiển thị chỉ nhân một hệ số scale cho vừa khung nhìn. Nhờ vậy slide giống nhau trên mọi màn hình. |
| **Thứ tự lớp = thứ tự mảng** | Phần tử đứng sau nằm trên. "Bring to front" = đổi vị trí trong mảng. |
| **Tham chiếu asset bằng ID** | Tài liệu chỉ giữ `assetId`; file ảnh/video/font thật nằm ở kho lưu trữ riêng. Tài liệu nhẹ, dễ sao chép. |
| **Group/Frame là element chứa element con** | Cây có thể lồng nhau; nhóm di chuyển/xoay như một khối. |
| **Text là rich text** | Một khối chữ gồm nhiều đoạn (run), mỗi run có style riêng (đậm, màu, cỡ). |
| **Template cũng là dữ liệu cùng loại** | Chọn mẫu = sao chép một cây có sẵn vào tài liệu người dùng. |

### 1.4 Vì sao mô hình này quan trọng

Các tính năng sau trở nên dễ vì chúng chỉ là **phép biến đổi trên một cây dữ liệu rõ ràng**:

- Đổi cỡ thiết kế (resize), đổi bảng màu, thay font hàng loạt
- Xuất sang nhiều định dạng (PDF, PNG, MP4, PPTX)
- Nhiều người cùng sửa một tài liệu
- AI tự dựng slide (chỉ cần sinh ra đúng loại cây dữ liệu này)

---

## 2. Trình soạn thảo chạy trên trình duyệt

Vòng lặp tổng quát:

> **Dữ liệu → Vẽ (render) → Người dùng tương tác → Sửa dữ liệu → Vẽ lại**

### 2.1 Lớp hiển thị (Render)

Hai hướng phổ biến:

- **DOM/CSS:** mỗi element là một thẻ `div` định vị tuyệt đối (`position: absolute`, `transform`). Dễ làm chữ, dễ truy cập (accessibility), nhưng chậm khi có quá nhiều element.
- **Canvas/WebGL:** tự vẽ mọi thứ lên canvas. Nhanh, kiểm soát hiệu ứng tốt, nhưng phải tự xử lý chữ, vùng chọn, con trỏ.

Nhiều editor kết hợp cả hai. Không xác nhận được Canva dùng cách nào cho từng phần.

### 2.2 Lớp tương tác (Interaction overlay)

Một lớp riêng phủ lên slide, chịu trách nhiệm:

- **Chọn (hit-testing):** xác định element nào được bấm trúng, có tính góc xoay.
- **Khung điều khiển:** 8 tay nắm để kéo giãn + 1 tay nắm xoay.
- **Snap & đường gióng:** khi kéo, so cạnh/tâm element đang kéo với cạnh/tâm element khác và lề trang; nếu lệch dưới vài pixel thì "hút" vào và hiện đường kẻ hướng dẫn.
- **Chọn nhiều, nhóm/bỏ nhóm, copy/paste, phím tắt.**

### 2.3 Lớp trạng thái và hoàn tác (State & Undo/Redo)

- Mọi thay đổi được mô tả thành một **operation**, ví dụ: `moveElement(el_1, dx, dy)`, `setText(el_1, "...")`.
- State được cập nhật bằng cách áp operation lên dữ liệu cũ để tạo dữ liệu mới (kiểu **bất biến / immutable**).
- **Undo/redo** = ngăn xếp các operation (hoặc các bản snapshot state) đi lùi/đi tới.
- Thao tác liên tục (kéo chuột) được **gộp thành một operation** khi thả chuột, tránh undo bị vụn.

### 2.4 Lớp đồng bộ (Sync)

- Operation được **áp dụng ngay trên máy người dùng** (optimistic update, không có độ trễ), đồng thời gửi lên server để lưu và chuyển cho người khác đang mở cùng tài liệu.
- Các thay đổi đồng thời của nhiều người được hợp nhất để không ghi đè lẫn nhau.
- Đây là lý do không có nút "Lưu".

### 2.5 Phần khó nhất: Chữ (Text)

- Đo kích thước chữ, ngắt dòng, tải font, hiển thị đúng dấu tiếng Việt (dấu chồng, độ cao dòng) khó hơn nhiều so với vẽ hình khối.
- Đây cũng là chỗ dễ lệch nhất khi xuất sang PPTX (font thiếu, metrics khác nhau).

---

## 3. Các phần liên quan (ngoài trọng tâm)

- **Mẫu & tài nguyên:** template là bộ Pages + Elements dựng sẵn; kho ảnh, icon, font, nhạc được tìm kiếm rồi gắn vào như element mới.
- **Magic Design / AI:** nhận chủ đề/dàn ý, chọn bố cục từ thư viện mẫu, điền nội dung và chọn hình/màu. Bản chất vẫn sinh ra cùng loại dữ liệu Pages + Elements.
- **Trình chiếu & xuất file:** Present mode hiển thị từng slide full màn hình; xuất PDF/PNG/MP4/PPTX là bước server dựng lại từng trang từ dữ liệu gốc sang định dạng đích (PPTX phải quy đổi element sang cấu trúc PowerPoint nên dễ lệch font/hiệu ứng).

---

## 4. Hướng dẫn tự dựng bản mini (Next.js)

Một editor tối giản có thể gồm:

1. **Store** (Zustand hoặc reducer) giữ cây `Design → Pages → Elements`.
2. **Khung slide 1920×1080** scale bằng CSS `transform: scale()`, bên trong render element bằng `div` định vị tuyệt đối.
3. **Lớp overlay** vẽ khung chọn, xử lý kéo / xoay / resize, snap.
4. **Danh sách operation** để làm undo/redo (gộp thao tác kéo liên tục).
5. **Autosave:** đẩy JSON lên API (debounce), phía server lưu vào DB (vd PostgreSQL, cột JSONB).

Gợi ý lộ trình: demo kéo thả + đổi chữ → thêm undo/redo → thêm snap → thêm đa trang → thêm xuất PDF/PNG → (tùy chọn) đồng bộ nhiều người.

---

## 5. Checklist ghi nhớ nhanh

- [ ] Slide = cây dữ liệu `Design → Page → Element`, không phải ảnh.
- [ ] Dùng hệ tọa độ logic cố định, scale khi hiển thị.
- [ ] Thứ tự lớp = thứ tự mảng.
- [ ] Asset tham chiếu bằng ID, tách khỏi tài liệu.
- [ ] Mọi thay đổi là operation → dễ undo/redo, đồng bộ, cộng tác.
- [ ] Render bằng DOM, canvas hoặc kết hợp; lớp tương tác tách riêng.
- [ ] Chữ (đặc biệt tiếng Việt) là phần khó và dễ lệch nhất.
