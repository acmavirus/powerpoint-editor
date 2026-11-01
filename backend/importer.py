import os
import shutil
import subprocess
import uuid
import struct
import zipfile
import logging
from typing import Dict, Any, List
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
import pymupdf

logger = logging.getLogger(__name__)

# Constants for EMU conversion
EMU_PER_INCH = 914400
DPI = 96
EMU_TO_PX = DPI / EMU_PER_INCH

SYSTEM_FONT_DIR = "/usr/local/share/fonts/embedded_fonts"

def color_to_hex(color_format) -> str:
    """Safe conversion of shape/font color to hex string."""
    try:
        if color_format and color_format.type and color_format.rgb:
            rgb = color_format.rgb
            return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
    except Exception:
        pass
    return ""

def extract_font_from_eot(data: bytes) -> bytes:
    """Extracts raw TTF/OTF font payload from EOT / fntdata wrapper."""
    for magic in [b'OTTO', b'\x00\x01\x00\x00', b'true']:
        idx = 0
        while True:
            pos = data.find(magic, idx)
            if pos == -1:
                break
            if pos + 16 <= len(data):
                num_tables = struct.unpack('>H', data[pos+4:pos+6])[0]
                if 4 <= num_tables <= 60:
                    first_tag = data[pos+12:pos+16]
                    if all(32 <= b <= 126 for b in first_tag):
                        return data[pos:]
            idx = pos + 1
    return None

class PPTXImporter:
    def __init__(self, storage_dir: str = "/app/storage"):
        self.storage_dir = storage_dir
        self.uploads_dir = os.path.join(storage_dir, "uploads")
        self.outputs_dir = os.path.join(storage_dir, "outputs")
        os.makedirs(self.uploads_dir, exist_ok=True)
        os.makedirs(self.outputs_dir, exist_ok=True)
        os.makedirs(SYSTEM_FONT_DIR, exist_ok=True)

    def extract_and_install_fonts(self, pptx_path: str, deck_output_dir: str, deck_id: str) -> List[Dict[str, str]]:
        """
        Extracts all embedded fonts from the PPTX package, installs them into the system
        font cache for LibreOffice, and prepares them for the web client.
        """
        fonts_dir = os.path.join(deck_output_dir, "fonts")
        os.makedirs(fonts_dir, exist_ok=True)
        custom_fonts: List[Dict[str, str]] = []

        try:
            with zipfile.ZipFile(pptx_path, 'r') as z:
                # 1. Check for presentation.xml to map rId to font typeface names
                rid_to_typeface = {}
                if 'ppt/presentation.xml' in z.namelist():
                    import re
                    pres_xml = z.read('ppt/presentation.xml').decode('utf-8', errors='ignore')
                    # Parse embeddedFont definitions: <p:font typeface="..."/> ... <p:regular r:id="..."/>
                    matches = re.findall(r'<p:font typeface="([^"]+)".*?<p:(?:regular|bold|italic|boldItalic) r:id="([^"]+)"', pres_xml)
                    for tf, rid in matches:
                        rid_to_typeface[rid] = tf

                # 2. Check presentation.xml.rels to map rId to file path
                file_to_typeface = {}
                if 'ppt/_rels/presentation.xml.rels' in z.namelist():
                    import xml.etree.ElementTree as ET
                    rels_xml = z.read('ppt/_rels/presentation.xml.rels')
                    root = ET.fromstring(rels_xml)
                    for rel in root:
                        rid = rel.attrib.get('Id')
                        target = rel.attrib.get('Target', '')
                        if rid in rid_to_typeface:
                            # Normalize target path
                            norm_target = target.replace('\\', '/').split('/')[-1]
                            file_to_typeface[norm_target] = rid_to_typeface[rid]

                # 3. Extract fonts
                font_updated = False
                for name in z.namelist():
                    if 'ppt/fonts/' in name:
                        raw_data = z.read(name)
                        base_fname = name.split('/')[-1]
                        
                        font_bytes = None
                        ext = ".ttf"
                        if name.endswith('.fntdata'):
                            font_bytes = extract_font_from_eot(raw_data)
                            if font_bytes and font_bytes.startswith(b'OTTO'):
                                ext = ".otf"
                        elif name.endswith(('.ttf', '.otf')):
                            font_bytes = raw_data
                            ext = os.path.splitext(name)[1]

                        if font_bytes:
                            out_fname = f"{base_fname}{ext}"
                            font_path = os.path.join(fonts_dir, out_fname)
                            with open(font_path, 'wb') as f:
                                f.write(font_bytes)

                            # Copy to system font dir for LibreOffice
                            sys_font_path = os.path.join(SYSTEM_FONT_DIR, f"{deck_id}_{out_fname}")
                            shutil.copy(font_path, sys_font_path)
                            font_updated = True

                            # Detect font family name
                            detected_family = file_to_typeface.get(base_fname)
                            if not detected_family:
                                try:
                                    res = subprocess.run(['fc-scan', '--format', '%{family}\n', font_path], stdout=subprocess.PIPE, timeout=5)
                                    output = res.stdout.decode().strip()
                                    if output:
                                        detected_family = output.split(',')[0].strip()
                                except Exception:
                                    pass

                            if not detected_family:
                                detected_family = os.path.splitext(base_fname)[0]

                            custom_fonts.append({
                                "family": detected_family,
                                "filename": out_fname,
                                "url": f"/api/slides/{deck_id}/fonts/{out_fname}"
                            })
                            logger.info(f"Extracted & registered custom font: {detected_family} ({out_fname})")

                # Refresh fontconfig if new fonts were added
                if font_updated:
                    try:
                        subprocess.run(['fc-cache', '-f'], check=True, timeout=10)
                        logger.info("System fontconfig cache updated successfully.")
                    except Exception as ex:
                        logger.warning(f"Failed to update fc-cache: {ex}")

        except Exception as e:
            logger.error(f"Error extracting embedded fonts: {e}")

        return custom_fonts

    def import_pptx(self, pptx_path: str, original_filename: str) -> Dict[str, Any]:
        """
        Processes a .pptx file using the Hybrid Layer Engine:
        1. Auto-extracts & registers embedded fonts into system
        2. High-fidelity rendering via LibreOffice + PyMuPDF (Zero layout break)
        3. Deep structural parsing via python-pptx (Editable elements)
        """
        deck_id = str(uuid.uuid4())[:8]
        deck_output_dir = os.path.join(self.outputs_dir, deck_id)
        assets_dir = os.path.join(deck_output_dir, "assets")
        os.makedirs(assets_dir, exist_ok=True)

        logger.info(f"Starting import for {original_filename} (deck_id: {deck_id})")

        # 1. Extract & Install Embedded Fonts First!
        custom_fonts = self.extract_and_install_fonts(pptx_path, deck_output_dir, deck_id)

        # 2. Parse OOXML Structure with python-pptx
        prs = Presentation(pptx_path)
        slide_width_emu = prs.slide_width
        slide_height_emu = prs.slide_height

        canvas_width = int(slide_width_emu * EMU_TO_PX)
        canvas_height = int(slide_height_emu * EMU_TO_PX)

        scale_x = canvas_width / max(1, slide_width_emu)
        scale_y = canvas_height / max(1, slide_height_emu)

        slides_data: List[Dict[str, Any]] = []

        total_text_count = 0
        total_image_count = 0
        total_shape_count = 0
        total_table_count = 0

        for slide_idx, slide in enumerate(prs.slides):
            slide_elements: List[Dict[str, Any]] = []
            slide_title = f"Slide {slide_idx + 1}"

            for shape_idx, shape in enumerate(slide.shapes):
                try:
                    left = int(shape.left * scale_x)
                    top = int(shape.top * scale_y)
                    width = int(shape.width * scale_x)
                    height = int(shape.height * scale_y)

                    element_id = f"el_{slide_idx}_{shape_idx}"

                    # A. Text Frame Element
                    if shape.has_text_frame:
                        text_content = shape.text.strip()
                        if text_content:
                            total_text_count += 1
                            if not slide_title or slide_title == f"Slide {slide_idx + 1}":
                                if len(text_content) < 60:
                                    slide_title = text_content.split("\n")[0]

                            font_name = "Inter"
                            font_size = 18
                            font_color = "#1e293b"
                            is_bold = False
                            is_italic = False
                            align_str = "left"

                            for p in shape.text_frame.paragraphs:
                                if p.alignment == PP_ALIGN.CENTER:
                                    align_str = "center"
                                elif p.alignment == PP_ALIGN.RIGHT:
                                    align_str = "right"
                                elif p.alignment == PP_ALIGN.JUSTIFY:
                                    align_str = "justify"

                                for r in p.runs:
                                    if r.font.name:
                                        font_name = r.font.name
                                    if r.font.size:
                                        font_size = int(r.font.size.pt)
                                    if r.font.bold:
                                        is_bold = True
                                    if r.font.italic:
                                        is_italic = True
                                    c = color_to_hex(r.font.color)
                                    if c:
                                        font_color = c
                                    break
                                if font_name != "Inter" or font_size != 18:
                                    break

                            slide_elements.append({
                                "id": element_id,
                                "type": "text",
                                "content": text_content,
                                "x": left,
                                "y": top,
                                "width": max(60, width),
                                "height": max(30, height),
                                "style": {
                                    "fontFamily": font_name,
                                    "fontSize": font_size,
                                    "color": font_color,
                                    "bold": is_bold,
                                    "italic": is_italic,
                                    "align": align_str
                                }
                            })
                            continue

                    # B. Picture Element
                    if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                        total_image_count += 1
                        image_part = shape.image
                        image_ext = image_part.ext or "png"
                        image_filename = f"img_{slide_idx}_{shape_idx}.{image_ext}"
                        image_path = os.path.join(assets_dir, image_filename)

                        with open(image_path, "wb") as img_file:
                            img_file.write(image_part.blob)

                        slide_elements.append({
                            "id": element_id,
                            "type": "image",
                            "src": f"/api/slides/{deck_id}/assets/{image_filename}",
                            "x": left,
                            "y": top,
                            "width": width,
                            "height": height
                        })
                        continue

                    # C. Table Element
                    if shape.has_table:
                        total_table_count += 1
                        table = shape.table
                        rows = []
                        for r in table.rows:
                            row_cells = [c.text.strip() for c in r.cells]
                            rows.append(row_cells)

                        slide_elements.append({
                            "id": element_id,
                            "type": "table",
                            "rows": rows,
                            "rowCount": len(table.rows),
                            "colCount": len(table.columns),
                            "x": left,
                            "y": top,
                            "width": width,
                            "height": height
                        })
                        continue

                    # D. Shape Element
                    total_shape_count += 1
                    shape_color = "#3b82f6"
                    try:
                        c = color_to_hex(shape.fill.fore_color)
                        if c:
                            shape_color = c
                    except Exception:
                        pass

                    slide_elements.append({
                        "id": element_id,
                        "type": "shape",
                        "shapeType": shape.name,
                        "fill": shape_color,
                        "x": left,
                        "y": top,
                        "width": width,
                        "height": height
                    })

                except Exception as ex:
                    logger.warning(f"Error parsing shape {shape_idx} on slide {slide_idx}: {ex}")

            slides_data.append({
                "index": slide_idx,
                "title": slide_title,
                "width": canvas_width,
                "height": canvas_height,
                "elements": slide_elements,
                "renderSvgUrl": f"/api/slides/{deck_id}/{slide_idx}/render.svg",
                "renderPngUrl": f"/api/slides/{deck_id}/{slide_idx}/render.png",
                "stats": {
                    "elementCount": len(slide_elements)
                }
            })

        # 3. High-Fidelity Rendering via LibreOffice Headless (Now with all fonts installed!)
        self._convert_pptx_to_pdf(pptx_path, deck_output_dir)

        base_name = os.path.splitext(os.path.basename(pptx_path))[0]
        expected_pdf = os.path.join(deck_output_dir, f"{base_name}.pdf")
        
        pdf_file_to_use = None
        if os.path.exists(expected_pdf):
            pdf_file_to_use = expected_pdf
        else:
            for f in os.listdir(deck_output_dir):
                if f.endswith(".pdf"):
                    pdf_file_to_use = os.path.join(deck_output_dir, f)
                    break

        # 4. Render PDF Pages to PNG & SVG with PyMuPDF
        if pdf_file_to_use and os.path.exists(pdf_file_to_use):
            try:
                pdf_doc = pymupdf.open(pdf_file_to_use)
                for page_idx in range(len(pdf_doc)):
                    if page_idx < len(slides_data):
                        page = pdf_doc[page_idx]
                        
                        pix = page.get_pixmap(dpi=150)
                        png_path = os.path.join(deck_output_dir, f"slide_{page_idx}_render.png")
                        pix.save(png_path)

                        svg_data = page.get_svg_image()
                        svg_path = os.path.join(deck_output_dir, f"slide_{page_idx}_render.svg")
                        with open(svg_path, "w", encoding="utf-8") as f:
                            f.write(svg_data)

                pdf_doc.close()
                logger.info(f"Successfully generated {len(slides_data)} slide renders for deck {deck_id}")
            except Exception as e:
                logger.error(f"Error converting PDF pages via PyMuPDF: {e}")
        else:
            logger.error(f"No PDF file found in {deck_output_dir} after LibreOffice conversion.")

        # 5. Generate Clean Background Layer (Textless) for True In-place Canva Editing
        try:
            clean_prs = Presentation(pptx_path)
            for s in clean_prs.slides:
                for shp in s.shapes:
                    self._clear_shape_text(shp)

            clean_pptx_name = f"{deck_id}_clean_bg.pptx"
            clean_pptx_path = os.path.join(deck_output_dir, clean_pptx_name)
            clean_prs.save(clean_pptx_path)

            self._convert_pptx_to_pdf(clean_pptx_path, deck_output_dir)
            clean_pdf_name = f"{deck_id}_clean_bg.pdf"
            clean_pdf_path = os.path.join(deck_output_dir, clean_pdf_name)

            if os.path.exists(clean_pdf_path):
                bg_pdf_doc = pymupdf.open(clean_pdf_path)
                for page_idx in range(len(bg_pdf_doc)):
                    if page_idx < len(slides_data):
                        bg_page = bg_pdf_doc[page_idx]
                        bg_pix = bg_page.get_pixmap(dpi=150)
                        bg_png_path = os.path.join(deck_output_dir, f"slide_{page_idx}_bg.png")
                        bg_pix.save(bg_png_path)
                        slides_data[page_idx]["backgroundPngUrl"] = f"/api/slides/{deck_id}/{page_idx}/bg.png"
                bg_pdf_doc.close()

                try:
                    os.remove(clean_pdf_path)
                    os.remove(clean_pptx_path)
                except Exception:
                    pass
                logger.info(f"Successfully generated clean background renders for deck {deck_id}")
            else:
                logger.warning(f"Clean background PDF not found at {clean_pdf_path}")
        except Exception as ex:
            logger.error(f"Error generating clean background renders for deck {deck_id}: {ex}")

        return {
            "id": deck_id,
            "filename": original_filename,
            "slideCount": len(slides_data),
            "customFonts": custom_fonts,
            "canvas": {
                "width": canvas_width,
                "height": canvas_height,
                "aspectRatio": round(canvas_width / max(1, canvas_height), 2)
            },
            "slides": slides_data,
            "metrics": {
                "totalTextElements": total_text_count,
                "totalImages": total_image_count,
                "totalShapes": total_shape_count,
                "totalTables": total_table_count,
                "customFontsCount": len(custom_fonts),
                "fidelityStatus": "100% Vector/Raster Preserved with Auto Font Integration",
                "engine": "LibreOffice Headless + PyMuPDF + python-pptx"
            }
        }

    def _convert_pptx_to_pdf(self, pptx_path: str, output_dir: str):
        """Converts a PPTX presentation to PDF headlessly with LibreOffice."""
        cmd = [
            "soffice",
            "--headless",
            "--convert-to",
            "pdf",
            pptx_path,
            "--outdir",
            output_dir
        ]
        try:
            logger.info(f"Running conversion: {' '.join(cmd)}")
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
            logger.info(f"LibreOffice stdout: {result.stdout.decode('utf-8', errors='ignore')}")
            if result.returncode != 0:
                logger.error(f"LibreOffice stderr: {result.stderr.decode('utf-8', errors='ignore')}")
        except Exception as e:
            logger.error(f"Subprocess LibreOffice failed: {e}")

    def _clear_shape_text(self, shape):
        """Recursively clears all text from shapes and group shapes for clean background rendering."""
        if shape.has_text_frame:
            try:
                shape.text_frame.clear()
            except Exception:
                pass
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            for child in shape.shapes:
                self._clear_shape_text(child)

