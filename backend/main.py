import os
import json
import time
import shutil
import logging
import urllib.parse
from typing import Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Form
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
    set_design_access_level,
    admin_authenticate,
    create_admin_token,
    verify_admin_token,
    revoke_admin_token,
    list_admin_users,
    create_admin_user,
    update_admin_user,
    delete_admin_user,
    list_users_for_admin,
    get_user_details_for_admin,
    set_user_status,
    delete_user_by_admin,
    get_admin_dashboard_stats,
    list_pptx_templates,
    get_pptx_template,
    create_pptx_template,
    update_pptx_template,
    delete_pptx_template,
    seed_default_templates
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

# ============================================================================
# ======================== ADMIN PORTAL RESTFUL APIS =========================
# ============================================================================

def get_current_admin(request: Request) -> Dict[str, Any]:
    """Dependency helper to verify admin token from headers."""
    auth_header = request.headers.get("Authorization", "")
    token = request.headers.get("X-Admin-Token") or (auth_header.replace("Bearer ", "").strip() if auth_header else "")
    if not token:
        raise HTTPException(status_code=401, detail="Vui lòng đăng nhập với quyền quản trị viên")
    
    admin = verify_admin_token(token)
    if not admin:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập quản trị không hợp lệ hoặc đã hết hạn")
    return admin

def require_super_admin(request: Request) -> Dict[str, Any]:
    admin = get_current_admin(request)
    if admin.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Yêu cầu quyền Quản trị cấp cao (Super Admin)")
    return admin

# --- 1. ADMIN AUTHENTICATION ---
@app.post("/api/admin/auth/login")
async def admin_login(request: Request):
    """Admin login endpoint verifying credentials and returning secure session token."""
    try:
        body = await request.json()
        username = body.get("username", "").strip()
        password = body.get("password", "")

        if not username or not password:
            raise HTTPException(status_code=400, detail="Vui lòng nhập tên đăng nhập và mật khẩu")

        admin = admin_authenticate(username, password)
        if not admin:
            raise HTTPException(status_code=401, detail="Tên đăng nhập hoặc mật khẩu không chính xác")

        token = create_admin_token(admin["id"])
        return JSONResponse(content={
            "status": "success",
            "token": token,
            "admin": admin
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Admin login error: {e}")
        raise HTTPException(status_code=500, detail="Lỗi máy chủ trong quá trình xác thực quản trị")

@app.get("/api/admin/auth/me")
def admin_me(request: Request):
    """Returns profile of currently authenticated admin."""
    admin = get_current_admin(request)
    return JSONResponse(content={"status": "success", "admin": admin})

@app.post("/api/admin/auth/logout")
async def admin_logout(request: Request):
    """Revokes the current admin session token."""
    auth_header = request.headers.get("Authorization", "")
    token = request.headers.get("X-Admin-Token") or (auth_header.replace("Bearer ", "").strip() if auth_header else "")
    if token:
        revoke_admin_token(token)
    return JSONResponse(content={"status": "success", "message": "Đã đăng xuất phiên quản trị"})

# --- 2. ADMIN DASHBOARD STATS ---
@app.get("/api/admin/stats")
def admin_stats(request: Request):
    """Returns overview metrics for dashboard."""
    get_current_admin(request)
    stats = get_admin_dashboard_stats()
    return JSONResponse(content={"status": "success", "stats": stats})

# --- 3. END-USER MANAGEMENT ---
@app.get("/api/admin/users")
def admin_list_users(request: Request, query: str = "", status: str = "all", page: int = 1, page_size: int = 50):
    """Lists end-users with pagination and filter."""
    get_current_admin(request)
    result = list_users_for_admin(query=query, status=status, page=page, page_size=page_size)
    return JSONResponse(content={"status": "success", "data": result})

@app.get("/api/admin/users/{user_id}")
def admin_get_user(user_id: str, request: Request):
    """Gets details and designs of an end-user."""
    get_current_admin(request)
    user = get_user_details_for_admin(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    return JSONResponse(content={"status": "success", "user": user})

@app.put("/api/admin/users/{user_id}/status")
async def admin_update_user_status(user_id: str, request: Request):
    """Locks or unlocks an end-user account."""
    get_current_admin(request)
    body = await request.json()
    is_active = int(body.get("is_active", 1))
    notes = body.get("notes")
    success = set_user_status(user_id, is_active, notes)
    if not success:
        raise HTTPException(status_code=400, detail="Không thể cập nhật trạng thái người dùng")
    return JSONResponse(content={"status": "success", "message": "Đã cập nhật trạng thái người dùng", "is_active": is_active})

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: str, request: Request):
    """Deletes an end-user and their presentations."""
    require_super_admin(request)
    success = delete_user_by_admin(user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Không thể xóa người dùng")
    return JSONResponse(content={"status": "success", "message": "Đã xóa tài khoản người dùng thành công"})

# --- 4. ADMINISTRATORS MANAGEMENT ---
@app.get("/api/admin/admins")
def admin_list_admins(request: Request):
    """Lists all admin accounts."""
    get_current_admin(request)
    admins = list_admin_users()
    return JSONResponse(content={"status": "success", "admins": admins})

@app.post("/api/admin/admins")
async def admin_create_admin(request: Request):
    """Creates a new admin account (Super Admin only)."""
    require_super_admin(request)
    body = await request.json()
    try:
        new_admin = create_admin_user(body)
        return JSONResponse(content={"status": "success", "admin": new_admin})
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.exception(f"Error creating admin: {e}")
        raise HTTPException(status_code=500, detail="Lỗi khi tạo tài khoản quản trị viên")

@app.put("/api/admin/admins/{admin_id}")
async def admin_update_admin(admin_id: str, request: Request):
    """Updates an admin account role, status or password."""
    current_admin = get_current_admin(request)
    if current_admin["role"] != "super_admin" and current_admin["id"] != admin_id:
        raise HTTPException(status_code=403, detail="Không có quyền chỉnh sửa tài khoản này")

    body = await request.json()
    updated = update_admin_user(admin_id, body)
    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản quản trị")
    return JSONResponse(content={"status": "success", "admin": updated})

@app.delete("/api/admin/admins/{admin_id}")
def admin_delete_admin(admin_id: str, request: Request):
    """Deletes an admin account (cannot delete self)."""
    current_admin = require_super_admin(request)
    if current_admin["id"] == admin_id:
        raise HTTPException(status_code=400, detail="Không thể tự xóa tài khoản của chính mình")

    success = delete_admin_user(admin_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản để xóa")
    return JSONResponse(content={"status": "success", "message": "Đã xóa tài khoản quản trị viên"})

# --- 5. PPTX TEMPLATES MANAGEMENT (ADMIN CRUD) ---
@app.get("/api/admin/templates")
def admin_get_templates(request: Request, category: Optional[str] = None, search: Optional[str] = None):
    """Lists all PPTX templates including inactive for admin."""
    get_current_admin(request)
    templates = list_pptx_templates(include_inactive=True, category=category, search=search)
    return JSONResponse(content={"status": "success", "templates": templates})

@app.post("/api/admin/templates/import-pptx")
async def admin_import_pptx_templates(
    request: Request,
    file: UploadFile = File(...),
    category: str = Form("business"),
    category_name: str = Form("Doanh nghiệp"),
    tags: str = Form(""),
    prefix_title: Optional[str] = Form("")
):
    """
    Receives an uploaded .pptx file, parses all slides via LibreOffice & PyMuPDF,
    extracts high-fidelity vector/raster renders, and registers each slide as an
    independent template in pptx_templates table.
    """
    current_admin = get_current_admin(request)

    if not file.filename.lower().endswith((".pptx", ".ppt")):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ tệp trình chiếu PowerPoint định dạng .pptx hoặc .ppt")

    # Safe file storage
    timestamp_prefix = int(time.time())
    safe_filename = f"{timestamp_prefix}_{file.filename}"
    upload_path = os.path.join(STORAGE_DIR, "uploads", safe_filename)

    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        deck_data = importer.import_pptx(upload_path, file.filename)
        slides = deck_data.get("slides", [])
        if not slides:
            raise HTTPException(status_code=400, detail="Tệp PowerPoint không chứa slide nào hợp lệ")

        # Parse tags
        clean_tags = [t.strip().lower() for t in tags.split(",") if t.strip()]
        if category not in clean_tags:
            clean_tags.insert(0, category)

        # Base name for titles
        original_base_name = os.path.splitext(file.filename)[0]
        deck_id = deck_data.get("id") or str(timestamp_prefix)

        created_templates = []
        for idx, slide in enumerate(slides):
            slide_idx = slide.get("index", idx)
            slide_title = (slide.get("title") or "").strip()

            if prefix_title and prefix_title.strip():
                final_title = f"{prefix_title.strip()} - Trang {slide_idx + 1}"
            elif slide_title and len(slide_title) > 2:
                final_title = slide_title
            else:
                final_title = f"{original_base_name} - Trang {slide_idx + 1}"

            tmpl_id = f"tmpl_{deck_id[:10]}_{slide_idx + 1}"

            # Slide tags
            slide_tags = list(clean_tags)
            slide_tags.extend([f"trang {slide_idx + 1}", f"slide {slide_idx + 1}"])
            if slide_title:
                slide_tags.extend([w.lower() for w in slide_title.split() if len(w) > 2])
            slide_tags = list(dict.fromkeys(slide_tags))

            render_png_url = slide.get("renderPngUrl") or f"/api/slides/{deck_id}/{slide_idx}/render.png"
            render_svg_url = slide.get("renderSvgUrl") or f"/api/slides/{deck_id}/{slide_idx}/render.svg"

            # High-res preview thumbnail
            preview_html = f'''<div class="w-full h-full relative overflow-hidden bg-slate-900 flex items-center justify-center select-none"><img src="{render_png_url}" class="w-full h-full object-contain pointer-events-none" alt="{final_title}" loading="lazy" /></div>'''

            tmpl_data = {
                "id": tmpl_id,
                "title": final_title,
                "category": category,
                "category_name": category_name,
                "tags": slide_tags,
                "bg_gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                "preview_badge": category_name.upper(),
                "preview_html": preview_html,
                "slide_data": {
                    "renderPngUrl": render_png_url,
                    "renderSvgUrl": render_svg_url,
                    "elements": slide.get("elements", []),
                    "customColor": None,
                    "width": slide.get("width", 1920),
                    "height": slide.get("height", 1080),
                    "fabricJson": {
                        "objects": []
                    }
                },
                "is_active": 1,
                "order_index": idx
            }

            created_tmpl = create_pptx_template(tmpl_data)
            created_templates.append(created_tmpl)

        logger.info(f"Admin {current_admin['username']} imported {len(created_templates)} slide templates from {file.filename}")
        return JSONResponse(content={
            "status": "success",
            "message": f"Đã bóc tách thành công {len(created_templates)} slide thành mẫu vào kho!",
            "deckId": deck_id,
            "filename": file.filename,
            "importedCount": len(created_templates),
            "templates": created_templates
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error importing PPTX presentation into template library: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi bóc tách file PPTX: {str(e)}")

@app.post("/api/admin/templates")
async def admin_create_template(request: Request):
    """Creates a new pre-made template."""
    get_current_admin(request)
    body = await request.json()
    new_template = create_pptx_template(body)
    return JSONResponse(content={"status": "success", "template": new_template})

@app.get("/api/admin/templates/{template_id}")
def admin_get_single_template(template_id: str, request: Request):
    """Gets details of a template."""
    get_current_admin(request)
    tmpl = get_pptx_template(template_id)
    if not tmpl:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu trang PPTX")
    return JSONResponse(content={"status": "success", "template": tmpl})

@app.put("/api/admin/templates/{template_id}")
async def admin_update_single_template(template_id: str, request: Request):
    """Updates an existing PPTX template."""
    get_current_admin(request)
    body = await request.json()
    updated = update_pptx_template(template_id, body)
    if not updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu trang để cập nhật")
    return JSONResponse(content={"status": "success", "template": updated})

@app.delete("/api/admin/templates/{template_id}")
def admin_delete_single_template(template_id: str, request: Request):
    """Deletes a PPTX template from system."""
    get_current_admin(request)
    success = delete_pptx_template(template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu trang để xóa")
    return JSONResponse(content={"status": "success", "message": "Đã xóa mẫu trang thành công"})

@app.post("/api/admin/templates/seed")
def admin_seed_templates(request: Request):
    """Restores default 10 pre-made templates."""
    require_super_admin(request)
    seed_default_templates()
    templates = list_pptx_templates(include_inactive=True)
    return JSONResponse(content={"status": "success", "message": "Đã khôi phục kho mẫu tiêu chuẩn", "templates": templates})

# --- 6. PUBLIC TEMPLATES API (FOR CANVA EDITOR DRAWER) ---
@app.get("/api/templates")
def public_get_templates(category: Optional[str] = None, search: Optional[str] = None):
    """Public endpoint returning active templates for the editor drawer."""
    try:
        templates = list_pptx_templates(include_inactive=False, category=category, search=search)
        return JSONResponse(content={"status": "success", "templates": templates})
    except Exception as e:
        logger.error(f"Error fetching public templates: {e}")
        return JSONResponse(content={"status": "error", "templates": []})
