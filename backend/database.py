import os
import json
import sqlite3
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

logger = logging.getLogger("pptx-database")

DB_DIR = os.getenv("STORAGE_DIR", "/app/storage")
DB_PATH = os.path.join(DB_DIR, "slidecraft.db")

def get_db_connection() -> sqlite3.Connection:
    """Creates a thread-safe connection to the SQLite database with dict row factory."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_database():
    """Initializes schema and tables for users, designs, and collaborators."""
    conn = get_db_connection()
    try:
        with conn:
            # 1. Users Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    google_id TEXT UNIQUE,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    picture TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # 2. Designs Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS designs (
                    design_id TEXT PRIMARY KEY,
                    edit_token TEXT NOT NULL,
                    title TEXT NOT NULL,
                    owner_id TEXT,
                    owner_name TEXT,
                    owner_email TEXT,
                    slide_count INTEGER DEFAULT 1,
                    slides_data TEXT,
                    custom_fonts TEXT,
                    thumbnail_url TEXT,
                    share_access_level TEXT DEFAULT 'private',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
                );
            """)

            # 3. Design Collaborators Table (Members with access)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS design_collaborators (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    design_id TEXT NOT NULL,
                    email TEXT NOT NULL,
                    name TEXT,
                    role TEXT DEFAULT 'editor',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (design_id) REFERENCES designs(design_id) ON DELETE CASCADE,
                    UNIQUE(design_id, email)
                );
            """)

            # Indexes for fast lookup
            conn.execute("CREATE INDEX IF NOT EXISTS idx_designs_owner ON designs(owner_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_collab_design ON design_collaborators(design_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_collab_email ON design_collaborators(email);")

        logger.info(f"Database initialized successfully at {DB_PATH}")
    except Exception as e:
        logger.exception(f"Database initialization error: {e}")
        raise
    finally:
        conn.close()

# ================= USER CRUD =================
def upsert_user(user_info: Dict[str, Any]) -> Dict[str, Any]:
    """Inserts or updates user from Google OAuth profile."""
    user_id = str(user_info.get("id") or user_info.get("sub") or "")
    email = user_info.get("email", "").strip().lower()
    name = user_info.get("name") or email.split("@")[0] or "Người dùng"
    picture = user_info.get("picture", "")

    if not email:
        raise ValueError("User email is required")

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute("SELECT * FROM users WHERE email = ?;", (email,))
            existing = cursor.fetchone()

            now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

            if existing:
                conn.execute("""
                    UPDATE users 
                    SET name = ?, picture = ?, last_login_at = ?
                    WHERE email = ?;
                """, (name, picture, now_str, email))
                final_id = existing["id"]
            else:
                final_id = user_id or f"usr_{os.urandom(8).hex()}"
                conn.execute("""
                    INSERT INTO users (id, google_id, email, name, picture, created_at, last_login_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                """, (final_id, user_id, email, name, picture, now_str, now_str))

        return get_user_by_email(email)
    finally:
        conn.close()

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT * FROM users WHERE email = ?;", (email.strip().lower(),))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

# ================= DESIGN CRUD =================
def save_design(design_data: Dict[str, Any]) -> Dict[str, Any]:
    """Creates or updates a presentation design in database."""
    design_id = design_data.get("designId") or design_data.get("id") or design_data.get("design_id")
    if not design_id:
        raise ValueError("designId is required")

    edit_token = design_data.get("editToken") or design_data.get("edit_token") or "token"
    title = design_data.get("title") or design_data.get("filename") or "Thiết kế không tên - Bài thuyết trình"
    
    owner_info = design_data.get("owner") or {}
    owner_id = owner_info.get("id") or design_data.get("ownerId") or design_data.get("owner_id")
    owner_name = owner_info.get("name") or design_data.get("ownerName") or design_data.get("owner_name")
    owner_email = owner_info.get("email") or design_data.get("ownerEmail") or design_data.get("owner_email") or design_data.get("created_by")

    slides = design_data.get("slides") or []
    slide_count = len(slides) or design_data.get("slideCount", 1)
    slides_json = json.dumps(slides, ensure_ascii=False)
    custom_fonts_json = json.dumps(design_data.get("customFonts", []), ensure_ascii=False)
    thumbnail_url = design_data.get("thumbnailUrl") or (f"/api/slides/{design_id}/0/render.png" if slides else "")
    share_access_level = design_data.get("shareAccessLevel", "private")

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute("SELECT design_id FROM designs WHERE design_id = ?;", (design_id,))
            exists = cursor.fetchone()

            if exists:
                conn.execute("""
                    UPDATE designs
                    SET title = ?, slide_count = ?, slides_data = ?, custom_fonts = ?,
                        thumbnail_url = ?, share_access_level = ?, updated_at = ?,
                        owner_id = COALESCE(?, owner_id),
                        owner_name = COALESCE(?, owner_name),
                        owner_email = COALESCE(?, owner_email)
                    WHERE design_id = ?;
                """, (title, slide_count, slides_json, custom_fonts_json, thumbnail_url, share_access_level, now_str,
                      owner_id, owner_name, owner_email, design_id))
            else:
                conn.execute("""
                    INSERT INTO designs (
                        design_id, edit_token, title, owner_id, owner_name, owner_email,
                        slide_count, slides_data, custom_fonts, thumbnail_url, share_access_level,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (
                    design_id, edit_token, title, owner_id, owner_name, owner_email,
                    slide_count, slides_json, custom_fonts_json, thumbnail_url, share_access_level,
                    now_str, now_str
                ))

            # Lưu danh sách collaborators nếu có
            shared_members = design_data.get("sharedMembers") or []
            for m in shared_members:
                email = m.get("email", "").strip().lower()
                if email:
                    conn.execute("""
                        INSERT OR IGNORE INTO design_collaborators (design_id, email, name, role)
                        VALUES (?, ?, ?, ?);
                    """, (design_id, email, m.get("name"), m.get("role", "editor")))

        return get_design(design_id)
    finally:
        conn.close()

def get_design(design_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves presentation by designId with parsed slides and collaborators."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT * FROM designs WHERE design_id = ?;", (design_id,))
        row = cursor.fetchone()
        if not row:
            return None

        d = dict(row)
        try:
            d["slides"] = json.loads(d["slides_data"]) if d.get("slides_data") else []
        except Exception:
            d["slides"] = []
        try:
            d["customFonts"] = json.loads(d["custom_fonts"]) if d.get("custom_fonts") else []
        except Exception:
            d["customFonts"] = []

        d.pop("slides_data", None)
        d.pop("custom_fonts", None)

        # Fetch collaborators
        collab_cursor = conn.execute("""
            SELECT email, name, role, created_at 
            FROM design_collaborators 
            WHERE design_id = ? 
            ORDER BY id ASC;
        """, (design_id,))
        d["sharedMembers"] = [dict(c) for c in collab_cursor.fetchall()]

        return d
    finally:
        conn.close()

def list_user_designs(user_email: str) -> List[Dict[str, Any]]:
    """Lists designs where user is owner or invited collaborator, with explicit user_role."""
    if not user_email:
        return list_all_designs()

    email = user_email.strip().lower()
    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            SELECT DISTINCT d.design_id, d.edit_token, d.title, d.owner_id, d.owner_name,
                            d.owner_email, d.owner_email AS created_by, d.slide_count, d.thumbnail_url, d.share_access_level,
                            d.created_at, d.updated_at,
                            CASE 
                                WHEN LOWER(COALESCE(d.owner_email, '')) = ? THEN 'owner'
                                WHEN c.role IS NOT NULL THEN c.role
                                ELSE 'viewer'
                            END AS user_role
            FROM designs d
            LEFT JOIN design_collaborators c ON d.design_id = c.design_id AND LOWER(c.email) = ?
            WHERE LOWER(COALESCE(d.owner_email, '')) = ? OR LOWER(COALESCE(c.email, '')) = ?
            ORDER BY d.updated_at DESC
            LIMIT 50;
        """, (email, email, email, email))

        results = [dict(r) for r in cursor.fetchall()]
        return results
    finally:
        conn.close()

def list_all_designs(limit: int = 50) -> List[Dict[str, Any]]:
    """Lists all recent presentation designs from database."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            SELECT design_id, edit_token, title, owner_id, owner_name, owner_email,
                   owner_email AS created_by, 'owner' AS user_role,
                   slide_count, thumbnail_url, share_access_level, created_at, updated_at
            FROM designs
            ORDER BY updated_at DESC
            LIMIT ?;
        """, (limit,))
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()

def delete_design(design_id: str) -> bool:
    """Deletes a presentation design and associated collaborators from database."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM design_collaborators WHERE design_id = ?;", (design_id,))
            conn.execute("DELETE FROM designs WHERE design_id = ?;", (design_id,))
        return True
    finally:
        conn.close()

def duplicate_design_in_db(source_design_id: str, new_design_id: str, new_edit_token: str, new_title: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Duplicates an existing design with a new ID and token."""
    source = get_design(source_design_id)
    if not source:
        return None

    title = new_title or f"{source.get('title', 'Bản sao')} (Bản sao)"
    source["designId"] = new_design_id
    source["editToken"] = new_edit_token
    source["title"] = title
    return save_design(source)

# ================= COLLABORATORS MANAGEMENT =================
def add_design_collaborator(design_id: str, email: str, name: Optional[str] = None, role: str = "editor") -> List[Dict[str, Any]]:
    email = email.strip().lower()
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                INSERT OR REPLACE INTO design_collaborators (design_id, email, name, role)
                VALUES (?, ?, ?, ?);
            """, (design_id, email, name or email.split("@")[0], role))
        return get_design_collaborators(design_id)
    finally:
        conn.close()

def remove_design_collaborator(design_id: str, email: str) -> List[Dict[str, Any]]:
    email = email.strip().lower()
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM design_collaborators WHERE design_id = ? AND email = ?;", (design_id, email))
        return get_design_collaborators(design_id)
    finally:
        conn.close()

def get_design_collaborators(design_id: str) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT email, name, role, created_at FROM design_collaborators WHERE design_id = ?;", (design_id,))
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()

def set_design_access_level(design_id: str, access_level: str) -> bool:
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("UPDATE designs SET share_access_level = ?, updated_at = CURRENT_TIMESTAMP WHERE design_id = ?;", (access_level, design_id))
        return True
    finally:
        conn.close()
