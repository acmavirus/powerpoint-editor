import os
import json
import time
import shutil
import logging
import urllib.parse
from typing import Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from importer import PPTXImporter
from sample_generator import create_sample_deck
from auth import (
    get_google_login_url,
    exchange_code_for_user_info,
    GOOGLE_CLIENT_ID
)
from database import (
    init_database,
    upsert_user,
    get_user_by_email,
    get_user_by_id,
    save_design,
    get_design,
    list_user_designs,
    list_all_designs,
    delete_design,
    duplicate_design_in_db,
    add_design_collaborator,
    remove_design_collaborator,
    set_design_access_level
)

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
    """Ensure sample file, database schema, and directories are initialized."""
    os.makedirs(os.path.join(STORAGE_DIR, "uploads"), exist_ok=True)
    os.makedirs(os.path.join(STORAGE_DIR, "outputs"), exist_ok=True)
    os.makedirs(os.path.join(STORAGE_DIR, "samples"), exist_ok=True)
    
    # Initialize SQLite Database tables
    try:
        init_database()
        logger.info("SQLite Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
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

# ================= GOOGLE AUTHENTICATION ENDPOINTS =================
@app.get("/api/auth/config")
def get_auth_config():
    """Returns Google OAuth Client configuration."""
    return {
        "clientId": GOOGLE_CLIENT_ID,
        "enabled": bool(GOOGLE_CLIENT_ID),
        "loginUrl": "/auth/google/login"
    }

@app.get("/api/auth/google/login")
def google_login(state: Optional[str] = None):
    """Initiates Google OAuth login by redirecting to Google Consent Screen."""
    url = get_google_login_url(state)
    return RedirectResponse(url=url)

@app.get("/api/auth/google/callback")
def google_callback(code: Optional[str] = None, error: Optional[str] = None):
    """
    Receives authorization code from Google OAuth redirect,
    exchanges code for user profile, and redirects back to frontend.
    """
    if error or not code:
        logger.warning(f"Google OAuth cancelled or returned error: {error}")
        return RedirectResponse(url="http://localhost:9030/?auth_error=cancelled")

    try:
        user_info = exchange_code_for_user_info(code)
        # Lưu vào SQLite Database
        saved_user = upsert_user(user_info)
        user_json = json.dumps(saved_user)
        encoded_user = urllib.parse.quote(user_json)
        logger.info(f"User authenticated and saved to DB: {saved_user.get('email')}")
        return RedirectResponse(url=f"http://localhost:9030/?auth_status=success&user={encoded_user}")
    except Exception as e:
        logger.exception(f"Google Auth callback error: {e}")
        err_msg = urllib.parse.quote(str(e))
        return RedirectResponse(url=f"http://localhost:9030/?auth_error={err_msg}")

# ================= DATABASE REST API (DESIGNS & COLLABORATION) =================
@app.get("/api/designs")
async def api_list_designs(user_email: Optional[str] = None):
    """Liệt kê danh sách các bài thiết kế (toàn bộ hoặc lọc theo email người dùng)."""
    try:
        designs = list_user_designs(user_email) if user_email else list_all_designs()
        return JSONResponse(content={"designs": designs})
    except Exception as e:
        logger.exception(f"Error listing designs from DB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/designs")
async def api_save_design(payload: Dict[str, Any]):
    """Lưu hoặc cập nhật bài thiết kế vào Database."""
    try:
        saved = save_design(payload)
        return JSONResponse(content={"status": "ok", "design": saved})
    except Exception as e:
        logger.exception(f"Error saving design to DB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/designs/{design_id}")
async def api_get_design(design_id: str):
    """Lấy dữ liệu đầy đủ của bài thiết kế từ Database."""
    design = get_design(design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Bài thiết kế không tồn tại")
    return JSONResponse(content=design)

@app.put("/api/designs/{design_id}")
async def api_update_design(design_id: str, payload: Dict[str, Any]):
    """Cập nhật dữ liệu bài thiết kế (Auto-save) vào Database."""
    payload["designId"] = design_id
    try:
        updated = save_design(payload)
        return JSONResponse(content={"status": "ok", "design": updated})
    except Exception as e:
        logger.exception(f"Error updating design in DB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/designs/{design_id}")
async def api_delete_design(design_id: str):
    """Xóa hoàn toàn bài thiết kế khỏi Database."""
    try:
        success = delete_design(design_id)
        return JSONResponse(content={"status": "ok", "deleted": success})
    except Exception as e:
        logger.exception(f"Error deleting design from DB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/designs/{design_id}/duplicate")
async def api_duplicate_design(design_id: str, payload: Optional[Dict[str, Any]] = None):
    """Nhân bản bài thiết kế sang bài mới trong Database."""
    import secrets
    payload = payload or {}
    new_id = payload.get("newDesignId") or f"DA{secrets.token_urlsafe(7)[:9]}"
    new_token = payload.get("newEditToken") or secrets.token_urlsafe(16)
    new_title = payload.get("title")

    try:
        duplicated = duplicate_design_in_db(design_id, new_id, new_token, new_title)
        if not duplicated:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài thiết kế gốc để nhân bản")
        return JSONResponse(content={"status": "ok", "design": duplicated})
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error duplicating design in DB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_email}/designs")
async def api_get_user_designs(user_email: str):
    """Lấy danh sách các bài thiết kế của người dùng từ Database."""
    try:
        designs = list_user_designs(user_email)
        return JSONResponse(content={"designs": designs})
    except Exception as e:
        logger.exception(f"Error fetching user designs from DB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/designs/{design_id}/collaborators")
async def api_add_collaborator(design_id: str, payload: Dict[str, Any]):
    """Thêm người dùng vào danh sách cộng tác viên của bài thiết kế."""
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email là bắt buộc")
    name = payload.get("name")
    role = payload.get("role", "editor")
    collaborators = add_design_collaborator(design_id, email, name, role)
    return JSONResponse(content={"status": "ok", "collaborators": collaborators})

@app.delete("/api/designs/{design_id}/collaborators")
async def api_remove_collaborator(design_id: str, payload: Dict[str, Any]):
    """Xóa người dùng khỏi danh sách cộng tác viên."""
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email là bắt buộc")
    collaborators = remove_design_collaborator(design_id, email)
    return JSONResponse(content={"status": "ok", "collaborators": collaborators})

@app.put("/api/designs/{design_id}/access-level")
async def api_set_access_level(design_id: str, payload: Dict[str, Any]):
    """Cập nhật quyền truy cập (private, view, edit) trong Database."""
    level = payload.get("accessLevel", "private")
    set_design_access_level(design_id, level)
    return JSONResponse(content={"status": "ok", "accessLevel": level})

# ================= REAL-TIME MULTI-USER PRESENCE TRACKER =================
# Stores active collaborators per design: { design_id: { session_id: { user_data, last_seen } } }
active_collaborators: Dict[str, Dict[str, Any]] = {}
COLLABORATOR_TIMEOUT_SECONDS = 60  # Coi như offline nếu không gửi heartbeat sau 60 giây (chống tab throttle)

def cleanup_stale_collaborators(design_id: str):
    now = time.time()
    if design_id in active_collaborators:
        sessions = active_collaborators[design_id]
        active = {
            s_id: data for s_id, data in sessions.items()
            if now - data.get("last_seen", 0) < COLLABORATOR_TIMEOUT_SECONDS
        }
        active_collaborators[design_id] = active

@app.post("/api/presence/heartbeat")
async def presence_heartbeat(request: Request):
    """
    Heartbeat định kỳ báo hiệu người dùng đang mở và xem/chỉnh sửa bản thiết kế.
    Trả về danh sách tất cả những người dùng đang active trên design này.
    """
    try:
        payload = await request.json()
    except Exception:
        return JSONResponse(content={"activeUsers": []})

    design_id = payload.get("designId")
    session_id = payload.get("sessionId")
    user_info = payload.get("user") or {}

    if not design_id or not session_id:
        return JSONResponse(content={"activeUsers": []})

    now = time.time()
    if design_id not in active_collaborators:
        active_collaborators[design_id] = {}

    name = user_info.get("name") or "Khách tham gia"
    email = user_info.get("email") or ""
    picture = user_info.get("picture") or ""
    color = user_info.get("color") or "#7d2ae8"

    active_collaborators[design_id][session_id] = {
        "sessionId": session_id,
        "name": name,
        "email": email,
        "picture": picture,
        "color": color,
        "last_seen": now
    }

    cleanup_stale_collaborators(design_id)

    users_list = [
        {
            "sessionId": data["sessionId"],
            "name": data["name"],
            "email": data["email"],
            "picture": data["picture"],
            "color": data["color"]
        }
        for data in active_collaborators[design_id].values()
    ]
    logger.info(f"Presence active users for '{design_id}': {len(users_list)} users")

    return JSONResponse(content={"activeUsers": users_list})

@app.post("/api/presence/leave")
async def presence_leave(request: Request):
    """Xóa người dùng khỏi danh sách active khi đóng tab hoặc thoát bài thiết kế (chấp nhận cả sendBeacon và fetch)."""
    try:
        raw_body = await request.body()
        if raw_body:
            payload = json.loads(raw_body.decode('utf-8'))
            design_id = payload.get("designId")
            session_id = payload.get("sessionId")
            if design_id and session_id and design_id in active_collaborators:
                active_collaborators[design_id].pop(session_id, None)
                logger.info(f"Presence session '{session_id}' left '{design_id}'")
    except Exception as e:
        logger.debug(f"Presence leave error: {e}")
    return JSONResponse(content={"status": "ok"})
