import os
import sys
import json
import sqlite3
import subprocess
import pymupdf
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE

STORAGE_DIR = os.getenv("STORAGE_DIR", "/app/storage")
DB_PATH = os.path.join(STORAGE_DIR, "slidecraft.db")
OUTPUTS_DIR = os.path.join(STORAGE_DIR, "outputs")
UPLOADS_DIR = os.path.join(STORAGE_DIR, "uploads")

def clear_shape_text(shape):
    if shape.has_text_frame:
        try:
            shape.text_frame.clear()
        except Exception:
            pass
    if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
        for child in shape.shapes:
            clear_shape_text(child)

def process_deck_clean_backgrounds(deck_id: str, pptx_path: str):
    deck_output_dir = os.path.join(OUTPUTS_DIR, deck_id)
    if not os.path.exists(deck_output_dir):
        print(f"Deck dir not found: {deck_output_dir}")
        return False

    print(f"--> Processing clean backgrounds for deck: {deck_id} using {os.path.basename(pptx_path)}")
    try:
        clean_prs = Presentation(pptx_path)
        for s in clean_prs.slides:
            for shp in s.shapes:
                clear_shape_text(shp)

        clean_pptx_path = os.path.join(deck_output_dir, f"{deck_id}_clean_bg.pptx")
        clean_prs.save(clean_pptx_path)

        cmd = ["soffice", "--headless", "--convert-to", "pdf", clean_pptx_path, "--outdir", deck_output_dir]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120, check=True)

        clean_pdf_path = os.path.join(deck_output_dir, f"{deck_id}_clean_bg.pdf")
        if not os.path.exists(clean_pdf_path):
            print(f"Error: clean PDF not created at {clean_pdf_path}")
            return False

        doc = pymupdf.open(clean_pdf_path)
        print(f"Rendered {len(doc)} background pages from clean PDF")
        for idx in range(len(doc)):
            page = doc[idx]
            pix = page.get_pixmap(dpi=150)
            out_png = os.path.join(deck_output_dir, f"slide_{idx}_bg.png")
            pix.save(out_png)
            print(f"  Saved clean background: slide_{idx}_bg.png ({os.path.getsize(out_png)} bytes)")
        doc.close()

        try:
            os.remove(clean_pdf_path)
            os.remove(clean_pptx_path)
        except Exception:
            pass
        return True
    except Exception as e:
        print(f"Error processing {deck_id}: {e}")
        return False

def update_templates_in_db():
    if not os.path.exists(DB_PATH):
        print(f"DB not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, slide_data FROM pptx_templates")
    rows = c.fetchall()

    updated_count = 0
    for tmpl_id, slide_data_json in rows:
        try:
            sd = json.loads(slide_data_json) if slide_data_json else {}
            render_png_url = sd.get("renderPngUrl")
            if render_png_url and "/api/slides/" in render_png_url:
                parts = render_png_url.split("/")
                deck_id = parts[3]
                slide_idx = parts[4]

                bg_png_file = os.path.join(OUTPUTS_DIR, deck_id, f"slide_{slide_idx}_bg.png")
                if os.path.exists(bg_png_file):
                    sd["backgroundPngUrl"] = f"/api/slides/{deck_id}/{slide_idx}/bg.png"
                    c.execute("UPDATE pptx_templates SET slide_data = ? WHERE id = ?", (json.dumps(sd), tmpl_id))
                    updated_count += 1
        except Exception as e:
            print(f"Error updating template {tmpl_id}: {e}")

    conn.commit()
    conn.close()
    print(f"--> Updated {updated_count} templates with backgroundPngUrl in database!")

def main():
    print("=== PPTX CLEAN BACKGROUND REGENERATION TOOL ===")
    if not os.path.exists(OUTPUTS_DIR):
        print(f"Outputs dir does not exist: {OUTPUTS_DIR}")
        return

    # Scan outputs for deck_ids
    decks = [d for d in os.listdir(OUTPUTS_DIR) if os.path.isdir(os.path.join(OUTPUTS_DIR, d))]
    print(f"Found {len(decks)} decks in outputs: {decks}")

    uploads = [os.path.join(UPLOADS_DIR, f) for f in os.listdir(UPLOADS_DIR) if f.endswith(('.pptx', '.ppt'))] if os.path.exists(UPLOADS_DIR) else []
    print(f"Found {len(uploads)} upload files: {[os.path.basename(u) for u in uploads]}")

    for deck_id in decks:
        # Check if bg.png already exists for slide 0
        bg_slide0 = os.path.join(OUTPUTS_DIR, deck_id, "slide_0_bg.png")
        if os.path.exists(bg_slide0):
            print(f"Deck {deck_id} already has clean backgrounds.")
            continue

        # Find matching PPTX in uploads
        matched_pptx = None
        for u in uploads:
            fname = os.path.basename(u)
            # Match by prefix timestamp or name
            matched_pptx = u
            try:
                prs = Presentation(u)
                render0 = os.path.join(OUTPUTS_DIR, deck_id, "slide_0_render.png")
                if os.path.exists(render0):
                    # Check slide count
                    render_files = [f for f in os.listdir(os.path.join(OUTPUTS_DIR, deck_id)) if f.endswith("_render.png")]
                    if len(prs.slides) == len(render_files):
                        matched_pptx = u
                        break
            except Exception:
                pass

        if matched_pptx:
            process_deck_clean_backgrounds(deck_id, matched_pptx)
        else:
            print(f"Could not find matching PPTX for deck {deck_id}")

    # Now update database
    update_templates_in_db()
    print("=== ALL DONE ===")

if __name__ == "__main__":
    main()
