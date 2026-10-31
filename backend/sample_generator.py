import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_sample_deck(output_path: str):
    """Creates a comprehensive sample PPTX presentation with diverse elements to test import."""
    prs = Presentation()
    prs.slide_width = Inches(13.333)  # 16:9 Widescreen
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # --- SLIDE 1: Title & Hero Cover ---
    slide1 = prs.slides.add_slide(blank_layout)
    
    # Background Accent Shape
    shape1 = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.4))
    shape1.fill.solid()
    shape1.fill.fore_color.rgb = RGBColor(37, 99, 235)  # Blue 600
    shape1.line.color.rgb = RGBColor(37, 99, 235)

    # Title Box
    title_box = slide1.shapes.add_textbox(Inches(1.2), Inches(2.2), Inches(10.9), Inches(1.8))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "Kiểm Thử Import PPTX Chuẩn Doanh Nghiệp"
    p1.font.size = Pt(40)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(15, 23, 42)

    # Subtitle
    sub_p = tf1.add_paragraph()
    sub_p.text = "Hệ thống bóc tách Hybrid Layer - Đảm bảo 100% không mất dữ liệu & không vỡ Layout"
    sub_p.font.size = Pt(20)
    sub_p.font.color.rgb = RGBColor(100, 116, 139)

    # Decorative Badge Shape
    badge = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(4.5), Inches(3.2), Inches(0.8))
    badge.fill.solid()
    badge.fill.fore_color.rgb = RGBColor(16, 185, 129)  # Green 500
    badge.line.color.rgb = RGBColor(16, 185, 129)
    btf = badge.text_frame
    bp = btf.paragraphs[0]
    bp.text = "Zero Data Loss Engine"
    bp.alignment = PP_ALIGN.CENTER
    bp.font.size = Pt(14)
    bp.font.bold = True
    bp.font.color.rgb = RGBColor(255, 255, 255)

    # --- SLIDE 2: Table & Structured Data ---
    slide2 = prs.slides.add_slide(blank_layout)

    # Slide 2 Title
    s2_title = slide2.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.0), Inches(0.8))
    p2 = s2_title.text_frame.paragraphs[0]
    p2.text = "Bảng So Sánh Hiệu Năng & Độ Tương Thích"
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(30, 41, 59)

    # Table
    rows, cols = 4, 4
    left, top, width, height = Inches(1.0), Inches(2.0), Inches(11.3), Inches(3.8)
    table_shape = slide2.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table

    headers = ["Phương Pháp Import", "Độ Giữ Layout", "Mất Dữ Liệu / Font", "Khả Năng Thương Mại"]
    data = [
        ["Frontend JS thô (JSZip)", "35% - 50%", "Rất cao (Vỡ font, lệch bảng)", "Kém, dễ lỗi khi gặp slide nặng"],
        ["Pure Parser (PptxGenJS)", "Chỉ hỗ trợ Xuất", "Không hỗ trợ Đọc file", "Chỉ làm được 1 chiều"],
        ["Hybrid Layer (Hệ Thống Này)", "100% Vector & Raster", "Zero Data Loss (Tuyệt đối)", "Sẵn sàng làm SaaS / Thương mại"]
    ]

    for c_idx, h in enumerate(headers):
        cell = table.cell(0, c_idx)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(30, 58, 138)
        p = cell.text_frame.paragraphs[0]
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = RGBColor(255, 255, 255)

    for r_idx, row in enumerate(data):
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx + 1, c_idx)
            cell.text = val
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(12)
            p.font.color.rgb = RGBColor(51, 65, 85)

    # --- SLIDE 3: Multi-column Cards & Metrics ---
    slide3 = prs.slides.add_slide(blank_layout)

    s3_title = slide3.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.0), Inches(0.8))
    p3 = s3_title.text_frame.paragraphs[0]
    p3.text = "3 Trụ Cột Đảm Bảo Độ Chuẩn Xác Của Engine"
    p3.font.size = Pt(28)
    p3.font.bold = True
    p3.font.color.rgb = RGBColor(30, 41, 59)

    cards = [
        ("01. Vector Render", "Giữ nguyên 100% nét vẽ vector, SmartArt và hình học phức tạp từ LibreOffice headless.", RGBColor(59, 130, 246)),
        ("02. Editable Overlay", "Trích xuất tọa độ chính xác của từng hộp văn bản, cho phép sửa chữ trực tiếp trên canvas.", RGBColor(16, 185, 129)),
        ("03. Asset Preservation", "Tách riêng toàn bộ hình ảnh nhúng, logo và bảng biểu vào thư viện dữ liệu sạch.", RGBColor(245, 158, 11))
    ]

    for idx, (head, desc, color) in enumerate(cards):
        c_left = Inches(1.0 + idx * 3.9)
        # Background card shape
        c_shape = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(2.2), Inches(3.6), Inches(3.8))
        c_shape.fill.solid()
        c_shape.fill.fore_color.rgb = RGBColor(248, 250, 252)
        c_shape.line.color.rgb = color
        c_shape.line.width = Pt(2)

        # Text in card
        tb = slide3.shapes.add_textbox(c_left + Inches(0.2), Inches(2.4), Inches(3.2), Inches(3.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        ph = tf.paragraphs[0]
        ph.text = head
        ph.font.size = Pt(18)
        ph.font.bold = True
        ph.font.color.rgb = color

        pd = tf.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(13)
        pd.font.color.rgb = RGBColor(71, 85, 105)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    return output_path

if __name__ == "__main__":
    create_sample_deck("/app/storage/samples/demo_sample.pptx")

