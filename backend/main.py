import os
import shutil
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from importer import PPTXImporter
from sample_generator import create_sample_deck

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pptx-api")

app = FastAPI(title="SlideCraft PPTX Editor API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_DIR = os.getenv("STORAGE_DIR", "/app/storage")
importer = PPTXImporter(storage_dir=STORAGE_DIR)

SAMPLE_FILE = os.path.join(STORAGE_DIR, "samples", "demo_sample.pptx")

@app.on_event("startup")
def startup_event():
    """Ensure sample file and directories are initialized."""
    os.makedirs(os.path.join(STORAGE_DIR, "uploads"), exist_ok=True)
    os.makedirs(os.path.join(STORAGE_DIR, "outputs"), exist_ok=True)
    os.makedirs(os.path.join(STORAGE_DIR, "samples"), exist_ok=True)
    
    if not os.path.exists(SAMPLE_FILE):
        try:
            logger.info("Generating starter demo PPTX presentation...")
            create_sample_deck(SAMPLE_FILE)
            logger.info("Sample deck created successfully at %s", SAMPLE_FILE)
        except Exception as e:
            logger.error("Failed to generate sample deck: %s", e)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SlideCraft PPTX Engine",
        "version": "1.0.0"
    }

@app.post("/api/import/pptx")
async def import_presentation(file: UploadFile = File(...)):
    """Receives an uploaded .pptx file, parses elements, auto-registers fonts, and renders high-fidelity vector layers."""
    if not file.filename.lower().endswith((".pptx", ".ppt")):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ tệp định dạng .pptx hoặc .ppt")

    upload_path = os.path.join(STORAGE_DIR, "uploads", file.filename)
    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        deck_data = importer.import_pptx(upload_path, file.filename)
        return JSONResponse(content=deck_data)
    except Exception as e:
        logger.exception(f"Error processing presentation: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý file PPTX: {str(e)}")

@app.post("/api/demo/sample")
def import_demo_sample():
    """Immediately processes and returns the standard sample PPTX to test import instantly."""
    user_test_file = os.path.join(STORAGE_DIR, "uploads", "Thiết kế chưa có tên.pptx")
    target_file = user_test_file if os.path.exists(user_test_file) else SAMPLE_FILE
    filename = "Vietnam_Travel_Canva.pptx" if target_file == user_test_file else "demo_sample.pptx"

    if not os.path.exists(target_file):
        create_sample_deck(target_file)

    try:
        deck_data = importer.import_pptx(target_file, filename)
        return JSONResponse(content=deck_data)
    except Exception as e:
        logger.exception(f"Error processing sample deck: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý slide mẫu: {str(e)}")

@app.get("/api/slides/{deck_id}/{slide_index}/render.png")
def get_slide_render_png(deck_id: str, slide_index: int):
    """Returns high-resolution PNG rendering of the slide."""
    path = os.path.join(STORAGE_DIR, "outputs", deck_id, f"slide_{slide_index}_render.png")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Ảnh render slide không tồn tại")
    return FileResponse(path, media_type="image/png")

@app.get("/api/slides/{deck_id}/{slide_index}/render.svg")
def get_slide_render_svg(deck_id: str, slide_index: int):
    """Returns pure vector SVG rendering of the slide."""
    path = os.path.join(STORAGE_DIR, "outputs", deck_id, f"slide_{slide_index}_render.svg")
    if not os.path.exists(path):
        png_path = os.path.join(STORAGE_DIR, "outputs", deck_id, f"slide_{slide_index}_render.png")
        if os.path.exists(png_path):
            return FileResponse(png_path, media_type="image/png")
        raise HTTPException(status_code=404, detail="Bản vẽ SVG slide không tồn tại")
    return FileResponse(path, media_type="image/svg+xml")

@app.get("/api/slides/{deck_id}/assets/{asset_name}")
def get_slide_asset(deck_id: str, asset_name: str):
    """Returns extracted images, icons, or media from presentation."""
    path = os.path.join(STORAGE_DIR, "outputs", deck_id, "assets", asset_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Tài nguyên media không tồn tại")
    return FileResponse(path)

@app.get("/api/slides/{deck_id}/fonts/{font_name}")
def get_slide_font(deck_id: str, font_name: str):
    """Returns custom embedded font file for web browser."""
    path = os.path.join(STORAGE_DIR, "outputs", deck_id, "fonts", font_name)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Font không tồn tại")
    media_type = "font/ttf"
    if font_name.endswith(".otf"):
        media_type = "font/otf"
    elif font_name.endswith(".woff2"):
        media_type = "font/woff2"
    return FileResponse(path, media_type=media_type)
