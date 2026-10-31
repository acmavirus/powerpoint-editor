import os
import json
import sqlite3
import logging
import hashlib
import secrets
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

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

            # 4. Admin Users Table (Phân tách hoàn toàn với users thông thường)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS admin_users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    role TEXT DEFAULT 'admin',
                    is_active INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login_at TIMESTAMP
                );
            """)

            # 5. Admin Authentication Tokens Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS admin_tokens (
                    token TEXT PRIMARY KEY,
                    admin_id TEXT NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
                );
            """)

            # 6. PPTX Slide Templates Table (Quản lý kho mẫu hệ thống)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS pptx_templates (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    category TEXT NOT NULL,
                    category_name TEXT NOT NULL,
                    tags TEXT NOT NULL,
                    bg_gradient TEXT,
                    preview_badge TEXT,
                    preview_html TEXT,
                    slide_data TEXT NOT NULL,
                    is_active INTEGER DEFAULT 1,
                    order_index INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Safe migrations for existing users table
            try:
                conn.execute("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;")
            except Exception:
                pass
            try:
                conn.execute("ALTER TABLE users ADD COLUMN notes TEXT;")
            except Exception:
                pass

            # Indexes for fast lookup
            conn.execute("CREATE INDEX IF NOT EXISTS idx_designs_owner ON designs(owner_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_collab_design ON design_collaborators(design_id);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_collab_email ON design_collaborators(email);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_admin_token ON admin_tokens(token);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_templates_cat ON pptx_templates(category);")

        logger.info(f"Database schema initialized successfully at {DB_PATH}")

        # Seed initial admin and templates if empty
        seed_default_admin()
        seed_default_templates()
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

# ============================================================================
# ======================== ADMIN & SECURITY MANAGEMENT ========================
# ============================================================================

def hash_password(password: str) -> tuple[str, str]:
    """Generates a secure PBKDF2-HMAC-SHA256 password hash with unique random salt."""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return pwd_hash, salt

def verify_password(password: str, salt: str, expected_hash: str) -> bool:
    """Verifies a password against the stored PBKDF2 hash in constant time."""
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    return secrets.compare_digest(pwd_hash, expected_hash)

def seed_default_admin():
    """Seeds default super admin if admin_users table is empty."""
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute("SELECT COUNT(*) as count FROM admin_users;")
            row = cursor.fetchone()
            count = row["count"] if row else 0
            if count == 0:
                admin_id = f"adm_{secrets.token_hex(8)}"
                username = "admin"
                email = "admin@slidecraft.local"
                full_name = "Quản Trị Viên Hệ Thống"
                password = os.getenv("ADMIN_INITIAL_PASSWORD", "Admin@2026!")
                pwd_hash, salt = hash_password(password)
                now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                conn.execute("""
                    INSERT INTO admin_users (id, username, email, password_hash, salt, full_name, role, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'super_admin', 1, ?);
                """, (admin_id, username, email, pwd_hash, salt, full_name, now_str))
                logger.info("Default Super Admin created: username='admin'")
    except Exception as e:
        logger.error(f"Error seeding default admin: {e}")
    finally:
        conn.close()

def admin_authenticate(username_or_email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticates admin user by username or email and password."""
    target = username_or_email.strip().lower()
    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            SELECT * FROM admin_users 
            WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND is_active = 1;
        """, (target, target))
        row = cursor.fetchone()
        if not row:
            return None

        admin = dict(row)
        if not verify_password(password, admin["salt"], admin["password_hash"]):
            return None

        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        with conn:
            conn.execute("UPDATE admin_users SET last_login_at = ? WHERE id = ?;", (now_str, admin["id"]))

        # Remove sensitive hash fields before returning
        admin.pop("password_hash", None)
        admin.pop("salt", None)
        return admin
    finally:
        conn.close()

def create_admin_token(admin_id: str, expires_days: int = 7) -> str:
    """Creates a cryptographically secure token for authenticated admin session."""
    token = f"adm_tok_{secrets.token_urlsafe(32)}"
    expires_at = datetime.utcnow() + timedelta(days=expires_days)
    expires_str = expires_at.strftime("%Y-%m-%d %H:%M:%S")
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    try:
        with conn:
            # Clean expired tokens
            conn.execute("DELETE FROM admin_tokens WHERE expires_at < CURRENT_TIMESTAMP;")
            conn.execute("""
                INSERT INTO admin_tokens (token, admin_id, expires_at, created_at)
                VALUES (?, ?, ?, ?);
            """, (token, admin_id, expires_str, now_str))
        return token
    finally:
        conn.close()

def verify_admin_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifies admin token and returns the corresponding admin user profile."""
    if not token:
        return None
    token = token.replace("Bearer ", "").strip()
    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            SELECT a.id, a.username, a.email, a.full_name, a.role, a.is_active, a.created_at, a.last_login_at
            FROM admin_tokens t
            JOIN admin_users a ON t.admin_id = a.id
            WHERE t.token = ? AND t.expires_at > CURRENT_TIMESTAMP AND a.is_active = 1;
        """, (token,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def revoke_admin_token(token: str) -> bool:
    """Revokes an admin session token on logout."""
    if not token:
        return False
    token = token.replace("Bearer ", "").strip()
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM admin_tokens WHERE token = ?;", (token,))
        return True
    finally:
        conn.close()

def list_admin_users() -> List[Dict[str, Any]]:
    """Lists all administrators."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            SELECT id, username, email, full_name, role, is_active, created_at, last_login_at
            FROM admin_users ORDER BY created_at ASC;
        """)
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()

def create_admin_user(data: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a new administrator account."""
    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    full_name = data.get("full_name", "").strip() or username
    password = data.get("password", "")
    role = data.get("role", "admin")

    if not username or not email or not password:
        raise ValueError("Tên đăng nhập, email và mật khẩu là bắt buộc")
    if role not in ("super_admin", "admin", "editor"):
        role = "admin"

    pwd_hash, salt = hash_password(password)
    admin_id = f"adm_{secrets.token_hex(8)}"
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                INSERT INTO admin_users (id, username, email, password_hash, salt, full_name, role, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?);
            """, (admin_id, username, email, pwd_hash, salt, full_name, role, now_str))
        return {
            "id": admin_id,
            "username": username,
            "email": email,
            "full_name": full_name,
            "role": role,
            "is_active": 1,
            "created_at": now_str
        }
    finally:
        conn.close()

def update_admin_user(admin_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates an administrator account."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT * FROM admin_users WHERE id = ?;", (admin_id,))
        existing = cursor.fetchone()
        if not existing:
            return None

        full_name = data.get("full_name") or existing["full_name"]
        role = data.get("role") or existing["role"]
        is_active = data.get("is_active", existing["is_active"])

        password = data.get("password")
        with conn:
            if password:
                pwd_hash, salt = hash_password(password)
                conn.execute("""
                    UPDATE admin_users 
                    SET full_name = ?, role = ?, is_active = ?, password_hash = ?, salt = ?
                    WHERE id = ?;
                """, (full_name, role, is_active, pwd_hash, salt, admin_id))
            else:
                conn.execute("""
                    UPDATE admin_users 
                    SET full_name = ?, role = ?, is_active = ?
                    WHERE id = ?;
                """, (full_name, role, is_active, admin_id))

        cursor = conn.execute("""
            SELECT id, username, email, full_name, role, is_active, created_at, last_login_at
            FROM admin_users WHERE id = ?;
        """, (admin_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def delete_admin_user(admin_id: str) -> bool:
    """Deletes an administrator account."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM admin_users WHERE id = ?;", (admin_id,))
        return True
    finally:
        conn.close()

# ============================================================================
# ====================== USER MANAGEMENT FOR ADMIN ===========================
# ============================================================================

def list_users_for_admin(query: str = "", status: str = "all", page: int = 1, page_size: int = 50) -> Dict[str, Any]:
    """Lists end-users with presentation counts and search/filter support."""
    conn = get_db_connection()
    try:
        offset = max(0, (page - 1) * page_size)
        where_clauses = []
        params = []

        if query:
            q = f"%{query.strip().lower()}%"
            where_clauses.append("(LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)")
            params.extend([q, q])

        if status == "active":
            where_clauses.append("u.is_active = 1")
        elif status == "banned":
            where_clauses.append("u.is_active = 0")

        where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

        # Total count
        count_cursor = conn.execute(f"SELECT COUNT(*) as total FROM users u {where_sql};", params)
        total = count_cursor.fetchone()["total"]

        # User rows with design count
        sql = f"""
            SELECT u.id, u.google_id, u.email, u.name, u.picture, u.created_at, u.last_login_at,
                   COALESCE(u.is_active, 1) as is_active, u.notes,
                   (SELECT COUNT(*) FROM designs d WHERE d.owner_id = u.id) as designs_count
            FROM users u
            {where_sql}
            ORDER BY u.created_at DESC
            LIMIT ? OFFSET ?;
        """
        cursor = conn.execute(sql, params + [page_size, offset])
        users = [dict(r) for r in cursor.fetchall()]

        return {
            "users": users,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size)
        }
    finally:
        conn.close()

def get_user_details_for_admin(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves full user details including their presentations."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("""
            SELECT id, google_id, email, name, picture, created_at, last_login_at,
                   COALESCE(is_active, 1) as is_active, notes
            FROM users WHERE id = ?;
        """, (user_id,))
        row = cursor.fetchone()
        if not row:
            return None
        user = dict(row)

        design_cursor = conn.execute("""
            SELECT design_id, title, slide_count, share_access_level, created_at, updated_at
            FROM designs WHERE owner_id = ? ORDER BY updated_at DESC;
        """, (user_id,))
        user["designs"] = [dict(r) for r in design_cursor.fetchall()]
        return user
    finally:
        conn.close()

def set_user_status(user_id: str, is_active: int, notes: Optional[str] = None) -> bool:
    """Locks or unlocks an end-user account."""
    conn = get_db_connection()
    try:
        with conn:
            if notes is not None:
                conn.execute("UPDATE users SET is_active = ?, notes = ? WHERE id = ?;", (is_active, notes, user_id))
            else:
                conn.execute("UPDATE users SET is_active = ? WHERE id = ?;", (is_active, user_id))
        return True
    finally:
        conn.close()

def delete_user_by_admin(user_id: str) -> bool:
    """Deletes an end-user account and cascades their presentations."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM designs WHERE owner_id = ?;", (user_id,))
            conn.execute("DELETE FROM users WHERE id = ?;", (user_id,))
        return True
    finally:
        conn.close()

def get_admin_dashboard_stats() -> Dict[str, Any]:
    """Retrieves overall KPIs and metrics for the admin dashboard."""
    conn = get_db_connection()
    try:
        user_cnt = conn.execute("SELECT COUNT(*) as c FROM users;").fetchone()["c"]
        banned_cnt = conn.execute("SELECT COUNT(*) as c FROM users WHERE is_active = 0;").fetchone()["c"]
        design_cnt = conn.execute("SELECT COUNT(*) as c FROM designs;").fetchone()["c"]
        template_cnt = conn.execute("SELECT COUNT(*) as c FROM pptx_templates WHERE is_active = 1;").fetchone()["c"]
        admin_cnt = conn.execute("SELECT COUNT(*) as c FROM admin_users;").fetchone()["c"]

        recent_users = [dict(r) for r in conn.execute("""
            SELECT id, email, name, picture, created_at, last_login_at, COALESCE(is_active, 1) as is_active
            FROM users ORDER BY created_at DESC LIMIT 5;
        """).fetchall()]

        recent_designs = [dict(r) for r in conn.execute("""
            SELECT design_id, title, owner_name, owner_email, slide_count, updated_at
            FROM designs ORDER BY updated_at DESC LIMIT 5;
        """).fetchall()]

        return {
            "total_users": user_cnt,
            "banned_users": banned_cnt,
            "total_designs": design_cnt,
            "active_templates": template_cnt,
            "total_admins": admin_cnt,
            "recent_users": recent_users,
            "recent_designs": recent_designs
        }
    finally:
        conn.close()

# ============================================================================
# ==================== PPTX TEMPLATES LIBRARY MANAGEMENT =====================
# ============================================================================

DEFAULT_SEEDED_TEMPLATES = [
    {
        "id": "travel-beach",
        "title": "Khám Phá Biển & Nghỉ Dưỡng Hè",
        "category": "travel",
        "category_name": "Du lịch",
        "tags": ["travel", "du lich", "beach", "bien", "resort", "nghi duong", "tour", "summer", "he", "kham pha", "phu quoc", "ha long"],
        "bg_gradient": "linear-gradient(135deg, #032030 0%, #004d73 100%)",
        "preview_badge": "SUMMER 2026",
        "preview_html": """<div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #032030 0%, #004d73 100%);"><div><span class="inline-block px-1.5 py-0.5 rounded bg-cyan-500/80 text-[8px] font-bold tracking-wider mb-1">SUMMER 2026</span><p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">HÀNH TRÌNH DU LỊCH</p><p class="text-[7px] text-cyan-200 mt-0.5 truncate">Khám phá thiên nhiên biển đảo & nghỉ dưỡng</p></div><div class="grid grid-cols-3 gap-1 my-auto"><div class="bg-cyan-950/70 p-1 rounded border border-cyan-700/50 text-[6px]"><span class="font-bold text-cyan-300 block">01. Phú Quốc</span><span class="text-slate-300 text-[5px]">Biển ngọc 5★</span></div><div class="bg-cyan-950/70 p-1 rounded border border-cyan-500 text-[6px]"><span class="font-bold text-cyan-300 block">02. Hạ Long</span><span class="text-slate-300 text-[5px]">Du thuyền vịnh</span></div><div class="bg-cyan-950/70 p-1 rounded border border-cyan-700/50 text-[6px]"><span class="font-bold text-cyan-300 block">03. Sapa</span><span class="text-slate-300 text-[5px]">Săn mây Fansipan</span></div></div><div class="text-[5px] text-cyan-300/80 border-t border-cyan-800/40 pt-0.5 truncate">Hotline: 1900 8888 • travel-vietnam.vn</div></div>""",
        "slide_data": {
            "customColor": "#032030",
            "fabricJson": {
                "objects": [
                    {"type": "rect", "left": 80, "top": 40, "width": 140, "height": 30, "fill": "#00a8cc", "rx": 6, "ry": 6},
                    {"type": "textbox", "left": 92, "top": 46, "width": 120, "text": "SUMMER 2026", "fontSize": 13, "fontFamily": "Inter", "fontWeight": "bold", "fill": "#ffffff"},
                    {"type": "textbox", "left": 80, "top": 85, "width": 800, "text": "HÀNH TRÌNH DU LỊCH & KHÁM PHÁ", "fontSize": 34, "fontFamily": "Inter", "fontWeight": "bold", "fill": "#ffffff"},
                    {"type": "textbox", "left": 80, "top": 135, "width": 800, "text": "Trải nghiệm những bờ biển nguyên sơ, danh lam thắng cảnh và văn hóa bản địa độc đáo", "fontSize": 16, "fontFamily": "Inter", "fill": "#94d2bd"},
                    {"type": "rect", "left": 80, "top": 195, "width": 245, "height": 260, "fill": "#003a52", "rx": 12, "ry": 12, "stroke": "#005c53", "strokeWidth": 1},
                    {"type": "textbox", "left": 100, "top": 220, "width": 205, "text": "01. ĐẢO PHÚ QUỐC\\n\\n• Lặn ngắm san hô biển ngọc\\n• Nghỉ dưỡng resort 5 sao\\n• Trải nghiệm cáp treo vượt biển\\n• Ẩm thực hải sản nướng than\\n• Tour cano 4 đảo trọn gói", "fontSize": 14, "fontFamily": "Inter", "fill": "#ffffff", "lineHeight": 1.4},
                    {"type": "rect", "left": 355, "top": 195, "width": 245, "height": 260, "fill": "#004766", "rx": 12, "ry": 12, "stroke": "#00a8cc", "strokeWidth": 2},
                    {"type": "textbox", "left": 375, "top": 220, "width": 205, "text": "02. VỊNH HẠ LONG\\n\\n• Du thuyền ngủ đêm trên vịnh\\n• Chèo kayak qua hang động\\n• Ngắm hoàng hôn trên biển\\n• Tham quan làng chài cổ\\n• Tiệc BBQ buffet hải sản", "fontSize": 14, "fontFamily": "Inter", "fill": "#ffffff", "lineHeight": 1.4},
                    {"type": "rect", "left": 630, "top": 195, "width": 245, "height": 260, "fill": "#003a52", "rx": 12, "ry": 12, "stroke": "#005c53", "strokeWidth": 1},
                    {"type": "textbox", "left": 650, "top": 220, "width": 205, "text": "03. CAO NGUYÊN SAPA\\n\\n• Chinh phục đỉnh Fansipan\\n• Bản Cát Cát mộng mơ\\n• Thưởng thức lẩu cá hồi\\n• Săn mây đèo Ô Quy Hồ\\n• Giao lưu văn hóa bản địa", "fontSize": 14, "fontFamily": "Inter", "fill": "#ffffff", "lineHeight": 1.4},
                    {"type": "textbox", "left": 80, "top": 480, "width": 800, "text": "Hotline đặt tour: 1900 8888  |  Email: contact@vietnam-travel.vn  |  Website: www.travel-vietnam.vn", "fontSize": 13, "fontFamily": "Inter", "fill": "#7dd3fc"}
                ]
            }
        }
    },
    {
        "id": "travel-itinerary",
        "title": "Lịch Trình Tour Khám Phá 4N3Đ",
        "category": "travel",
        "category_name": "Du lịch",
        "tags": ["travel", "du lich", "itinerary", "lich trinh", "tour", "ke hoach", "ngay", "timeline", "schedule"],
        "bg_gradient": "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
        "preview_badge": "TIMELINE",
        "preview_html": """<div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);"><div><span class="inline-block px-1.5 py-0.5 rounded bg-emerald-500/80 text-[8px] font-bold tracking-wider mb-1">TOUR 4N3Đ</span><p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">LỊCH TRÌNH CHI TIẾT</p><p class="text-[7px] text-emerald-200 mt-0.5 truncate">Hành trình khám phá trọn vẹn điểm đến</p></div><div class="grid grid-cols-4 gap-0.5 my-auto"><div class="bg-emerald-950/80 p-1 rounded border border-emerald-700/60 text-[5px]"><span class="font-bold text-emerald-300 block">N1: Đón đoàn</span><span class="text-slate-300">Check-in</span></div><div class="bg-emerald-900/80 p-1 rounded border border-emerald-400 text-[5px]"><span class="font-bold text-emerald-200 block">N2: Vịnh biển</span><span class="text-slate-200">Lặn san hô</span></div><div class="bg-emerald-950/80 p-1 rounded border border-emerald-700/60 text-[5px]"><span class="font-bold text-emerald-300 block">N3: Trekking</span><span class="text-slate-300">Ẩm thực</span></div><div class="bg-emerald-950/80 p-1 rounded border border-emerald-700/60 text-[5px]"><span class="font-bold text-emerald-300 block">N4: Mua sắm</span><span class="text-slate-300">Tiễn khách</span></div></div><div class="text-[5px] text-emerald-300/80 border-t border-emerald-800/40 pt-0.5 truncate">Tiêu chuẩn xe đưa đón & khách sạn 4-5 sao</div></div>""",
        "slide_data": {
            "customColor": "#064e3b",
            "fabricJson": {
                "objects": [
                    {"type": "textbox", "left": 80, "top": 45, "width": 800, "text": "LỊCH TRÌNH CHI TIẾT TOUR 4 NGÀY 3 ĐÊM", "fontSize": 30, "fontFamily": "Inter", "fontWeight": "bold", "fill": "#ffffff"},
                    {"type": "textbox", "left": 80, "top": 90, "width": 800, "text": "Hành trình kết hợp tham quan danh lam thắng cảnh, ẩm thực bản địa và nghỉ dưỡng tiêu chuẩn quốc tế", "fontSize": 15, "fontFamily": "Inter", "fill": "#a7f3d0"},
                    {"type": "rect", "left": 80, "top": 145, "width": 185, "height": 320, "fill": "#065f46", "rx": 10, "ry": 10},
                    {"type": "textbox", "left": 95, "top": 165, "width": 155, "text": "NGÀY 01\\n\\nĐón Đoàn & Check-in\\n\\n• 08:00: Đón tại sân bay\\n• 11:30: Ăn trưa đặc sản\\n• 14:00: Nhận phòng resort\\n• 16:30: Tự do tắm biển\\n• 18:30: Tiệc BBQ bãi biển", "fontSize": 13, "fontFamily": "Inter", "fill": "#ecfdf5", "lineHeight": 1.4},
                    {"type": "rect", "left": 285, "top": 145, "width": 185, "height": 320, "fill": "#047857", "rx": 10, "ry": 10, "stroke": "#34d399", "strokeWidth": 2},
                    {"type": "textbox", "left": 300, "top": 165, "width": 155, "text": "NGÀY 02\\n\\nKhám Phá Vịnh Biển\\n\\n• 07:00: Buffet sáng\\n• 08:30: Lên tàu cano ra đảo\\n• 10:30: Lặn ngắm san hô\\n• 12:30: Ăn trưa bè nổi\\n• 16:00: Sunset check-in", "fontSize": 13, "fontFamily": "Inter", "fill": "#ffffff", "lineHeight": 1.4},
                    {"type": "rect", "left": 490, "top": 145, "width": 185, "height": 320, "fill": "#065f46", "rx": 10, "ry": 10},
                    {"type": "textbox", "left": 505, "top": 165, "width": 155, "text": "NGÀY 03\\n\\nTrekking & Văn Hóa\\n\\n• 07:30: Thăm di tích lịch sử\\n• 10:00: Trekking rừng nguyên sinh\\n• 12:00: Ẩm thực cơm lam gà nướng\\n• 15:00: Trải nghiệm làng nghề\\n• 19:00: Chợ đêm dạo phố", "fontSize": 13, "fontFamily": "Inter", "fill": "#ecfdf5", "lineHeight": 1.4},
                    {"type": "rect", "left": 695, "top": 145, "width": 185, "height": 320, "fill": "#064e3b", "stroke": "#34d399", "strokeWidth": 1.5, "rx": 10, "ry": 10},
                    {"type": "textbox", "left": 710, "top": 165, "width": 155, "text": "NGÀY 04\\n\\nMua Sắm & Tạm Biệt\\n\\n• 08:00: Cà phê ngắm bình minh\\n• 10:00: Mua sắm đặc sản\\n• 12:00: Check-out khách sạn\\n• 14:00: Tiễn đoàn ra sân bay\\n• Hẹn gặp lại quý khách!", "fontSize": 13, "fontFamily": "Inter", "fill": "#ecfdf5", "lineHeight": 1.4},
                    {"type": "textbox", "left": 80, "top": 485, "width": 800, "text": "Lưu ý: Lịch trình có thể linh hoạt điều chỉnh theo thời tiết thực tế để đảm bảo trải nghiệm tốt nhất.", "fontSize": 12, "fontFamily": "Inter", "fill": "#6ee7b7"}
                ]
            }
        }
    },
    {
        "id": "travel-pricing",
        "title": "Bảng Giá Gói Tour Nghỉ Dưỡng",
        "category": "travel",
        "category_name": "Du lịch",
        "tags": ["travel", "du lich", "pricing", "bang gia", "gia", "hotel", "resort", "package"],
        "bg_gradient": "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        "preview_badge": "BẢNG GIÁ",
        "preview_html": """<div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);"><div><span class="inline-block px-1.5 py-0.5 rounded bg-indigo-500/80 text-[8px] font-bold tracking-wider mb-1">GÓI DỊCH VỤ</span><p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">BẢNG GIÁ TOUR 2026</p><p class="text-[7px] text-indigo-200 mt-0.5 truncate">Lựa chọn phù hợp cho gia đình & đoàn thể</p></div><div class="grid grid-cols-3 gap-1 my-auto"><div class="bg-indigo-950/70 p-1 rounded border border-indigo-700/60 text-[6px]"><span class="font-semibold text-slate-300 block">Tiêu Chuẩn</span><span class="font-bold text-indigo-300 text-[8px]">3.990k</span></div><div class="bg-indigo-900/90 p-1 rounded border border-amber-400 text-[6px]"><span class="font-bold text-amber-300 block">Cao Cấp ★</span><span class="font-bold text-amber-300 text-[8px]">6.990k</span></div><div class="bg-indigo-950/70 p-1 rounded border border-indigo-700/60 text-[6px]"><span class="font-semibold text-slate-300 block">VIP Luxury</span><span class="font-bold text-indigo-300 text-[8px]">12.990k</span></div></div><div class="text-[5px] text-indigo-300/80 border-t border-indigo-800/40 pt-0.5 truncate">Đã bao gồm vé máy bay, khách sạn & bảo hiểm</div></div>""",
        "slide_data": {
            "customColor": "#1e1b4b",
            "fabricJson": {
                "objects": [
                    {"type": "textbox", "left": 80, "top": 45, "width": 800, "text": "BẢNG GIÁ DỊCH VỤ TOUR NGHỈ DƯỠNG TRỌN GÓI", "fontSize": 28, "fontFamily": "Inter", "fontWeight": "bold", "fill": "#ffffff"},
                    {"type": "textbox", "left": 80, "top": 90, "width": 800, "text": "Chính sách giá minh bạch, trọn gói, không phát sinh phụ phí ẩn", "fontSize": 15, "fontFamily": "Inter", "fill": "#c7d2fe"},
                    {"type": "rect", "left": 80, "top": 145, "width": 245, "height": 320, "fill": "#2e1065", "rx": 12, "ry": 12},
                    {"type": "textbox", "left": 100, "top": 170, "width": 205, "text": "GÓI TIÊU CHUẨN\\n\\n3.990.000 VNĐ / Khách\\n\\n• Khách sạn 3 sao trung tâm\\n• Xe đưa đón máy lạnh\\n• Ăn sáng buffet hàng ngày\\n• Hướng dẫn viên nhiệt tình\\n• Vé tham quan các điểm", "fontSize": 13, "fontFamily": "Inter", "fill": "#ede9fe", "lineHeight": 1.4},
                    {"type": "rect", "left": 355, "top": 140, "width": 250, "height": 330, "fill": "#3730a3", "stroke": "#fbbf24", "strokeWidth": 2, "rx": 12, "ry": 12},
                    {"type": "textbox", "left": 375, "top": 165, "width": 210, "text": "GÓI CAO CẤP (PHỔ BIẾN NHẤT)\\n\\n6.990.000 VNĐ / Khách\\n\\n• Resort 4-5 sao view biển\\n• Xe limousine đưa đón riêng\\n• Vé máy bay khứ hồi gồm hành lý\\n• Tiệc hải sản BBQ cao cấp\\n• Cano riêng lặn ngắm san hô\\n• Bảo hiểm du lịch 100 triệu", "fontSize": 13, "fontFamily": "Inter", "fill": "#ffffff", "lineHeight": 1.4},
                    {"type": "rect", "left": 635, "top": 145, "width": 245, "height": 320, "fill": "#2e1065", "rx": 12, "ry": 12},
                    {"type": "textbox", "left": 655, "top": 170, "width": 205, "text": "GÓI VIP LUXURY\\n\\n12.990.000 VNĐ / Khách\\n\\n• Villa hồ bơi riêng 5 sao+\\n• Du thuyền riêng tham quan\\n• Quản gia và đầu bếp phục vụ\\n• Spa & massage trị liệu hàng ngày\\n• Trải nghiệm bay trực thăng", "fontSize": 13, "fontFamily": "Inter", "fill": "#ede9fe", "lineHeight": 1.4},
                    {"type": "textbox", "left": 80, "top": 490, "width": 800, "text": "Ưu đãi: Giảm thêm 10% khi đăng ký nhóm từ 4 khách trước ngày 15 hàng tháng.", "fontSize": 12, "fontFamily": "Inter", "fill": "#a5b4fc"}
                ]
            }
        }
    },
    {
        "id": "business-report",
        "title": "Báo Cáo Doanh Thu & Tăng Trưởng Q3",
        "category": "business",
        "category_name": "Doanh nghiệp",
        "tags": ["business", "doanh nghiep", "bao cao", "report", "doanh thu", "kpi", "revenue", "growth"],
        "bg_gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        "preview_badge": "BÁO CÁO Q3",
        "preview_html": """<div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);"><div><span class="inline-block px-1.5 py-0.5 rounded bg-blue-500/80 text-[8px] font-bold tracking-wider mb-1">BUSINESS REPORT</span><p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">KẾT QUẢ KINH DOANH Q3</p><p class="text-[7px] text-blue-200 mt-0.5 truncate">Tăng trưởng vượt 145% chỉ tiêu đề ra</p></div><div class="grid grid-cols-3 gap-1 my-auto"><div class="bg-slate-900/90 p-1 rounded border border-blue-500/50 text-center"><span class="font-extrabold text-blue-400 text-[10px] block">+145%</span><span class="text-[5px] text-slate-300">Doanh thu</span></div><div class="bg-slate-900/90 p-1 rounded border border-emerald-500/50 text-center"><span class="font-extrabold text-emerald-400 text-[10px] block">2.8M</span><span class="text-[5px] text-slate-300">Khách hàng</span></div><div class="bg-slate-900/90 p-1 rounded border border-purple-500/50 text-center"><span class="font-extrabold text-purple-400 text-[10px] block">98.5%</span><span class="text-[5px] text-slate-300">Hài lòng</span></div></div><div class="text-[5px] text-slate-400 border-t border-slate-700/60 pt-0.5 truncate">Phòng Kế Hoạch & Tài Chính Chiến Lược</div></div>""",
        "slide_data": {
            "customColor": "#0f172a",
            "fabricJson": {
                "objects": [
                    {"type": "textbox", "left": 80, "top": 45, "width": 800, "text": "BÁO CÁO KẾT QUẢ KINH DOANH QUÝ 3 / 2026", "fontSize": 30, "fontFamily": "Inter", "fontWeight": "bold", "fill": "#ffffff"},
                    {"type": "textbox", "left": 80, "top": 90, "width": 800, "text": "Tổng hợp các chỉ số tài chính, tăng trưởng thị phần và hiệu quả vận hành", "fontSize": 15, "fontFamily": "Inter", "fill": "#94a3b8"},
                    {"type": "rect", "left": 80, "top": 150, "width": 245, "height": 160, "fill": "#1e293b", "rx": 12, "ry": 12, "stroke": "#3b82f6", "strokeWidth": 1.5},
                    {"type": "textbox", "left": 100, "top": 175, "width": 205, "text": "+145% DOANH THU\\n\\nĐạt 48.5 tỷ VNĐ, vượt 25% so với kế hoạch quý 3 đã phê duyệt.", "fontSize": 13, "fontFamily": "Inter", "fill": "#60a5fa", "lineHeight": 1.4},
                    {"type": "rect", "left": 355, "top": 150, "width": 245, "height": 160, "fill": "#1e293b", "rx": 12, "ry": 12, "stroke": "#10b981", "strokeWidth": 1.5},
                    {"type": "textbox", "left": 375, "top": 175, "width": 205, "text": "2.8 TRIỆU NGƯỜI DÙNG\\n\\nLượng người dùng hoạt động hàng tháng (MAU) tăng trưởng 68% YoY.", "fontSize": 13, "fontFamily": "Inter", "fill": "#34d399", "lineHeight": 1.4},
                    {"type": "rect", "left": 630, "top": 150, "width": 245, "height": 160, "fill": "#1e293b", "rx": 12, "ry": 12, "stroke": "#a855f7", "strokeWidth": 1.5},
                    {"type": "textbox", "left": 650, "top": 175, "width": 205, "text": "98.5% HÀI LÒNG\\n\\nChỉ số NPS đạt kỷ lục nhờ cải tiến dịch vụ chăm sóc khách hàng 24/7.", "fontSize": 13, "fontFamily": "Inter", "fill": "#c084fc", "lineHeight": 1.4}
                ]
            }
        }
    },
    {
        "id": "pitch-deck",
        "title": "Startup Pitch Deck - Công Nghệ AI",
        "category": "pitch",
        "category_name": "Pitch Deck",
        "tags": ["pitch", "pitch deck", "startup", "khoi nghiep", "ai", "cong nghe", "goi von"],
        "bg_gradient": "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
        "preview_badge": "PITCH DECK",
        "preview_html": """<div class="w-full h-full p-2.5 flex flex-col justify-between text-white" style="background: linear-gradient(135deg, #18181b 0%, #27272a 100%);"><div><span class="inline-block px-1.5 py-0.5 rounded bg-purple-600 text-[8px] font-bold tracking-wider mb-1">STARTUP PITCH</span><p class="font-extrabold text-[11px] leading-tight text-white tracking-tight">CÔNG NGHỆ ĐỘT PHÁ</p><p class="text-[7px] text-zinc-400 mt-0.5 truncate">Nền tảng tự động hóa thông minh thế hệ mới</p></div><div class="grid grid-cols-2 gap-1 my-auto"><div class="bg-red-950/40 p-1 rounded border border-red-500/40 text-[6px]"><span class="font-bold text-red-400 block">Vấn Đề (Problem)</span><span class="text-zinc-300 text-[5px]">Quy trình thủ công chậm</span></div><div class="bg-emerald-950/40 p-1 rounded border border-emerald-500/40 text-[6px]"><span class="font-bold text-emerald-400 block">Giải Pháp (Solution)</span><span class="text-zinc-300 text-[5px]">AI tự động hóa 10x</span></div></div><div class="text-[5px] text-purple-400 border-t border-zinc-800 pt-0.5 truncate">Vòng gọi vốn Seed: 1.5M USD</div></div>""",
        "slide_data": {
            "customColor": "#18181b",
            "fabricJson": {
                "objects": [
                    {"type": "textbox", "left": 80, "top": 45, "width": 800, "text": "GIẢI PHÁP TỰ ĐỘNG HÓA DOANH NGHIỆP THẾ HỆ MỚI", "fontSize": 28, "fontFamily": "Inter", "fontWeight": "bold", "fill": "#ffffff"},
                    {"type": "textbox", "left": 80, "top": 90, "width": 800, "text": "Rút ngắn 80% thời gian xử lý dữ liệu và tiết kiệm 60% chi phí vận hành", "fontSize": 15, "fontFamily": "Inter", "fill": "#a1a1aa"},
                    {"type": "rect", "left": 80, "top": 150, "width": 380, "height": 300, "fill": "#27272a", "rx": 12, "ry": 12, "stroke": "#ef4444", "strokeWidth": 1.5},
                    {"type": "textbox", "left": 105, "top": 175, "width": 330, "text": "VẤN ĐỀ THỊ TRƯỜNG (PROBLEM)\\n\\n• Quy trình thủ công mất từ 4 - 6 giờ mỗi ngày\\n• Tỷ lệ sai sót dữ liệu người nhập lên đến 14%\\n• Chi phí tuyển dụng và đào tạo nhân sự tăng cao\\n• Khó khăn trong việc mở rộng quy mô kinh doanh", "fontSize": 13, "fontFamily": "Inter", "fill": "#fca5a5", "lineHeight": 1.5},
                    {"type": "rect", "left": 495, "top": 150, "width": 380, "height": 300, "fill": "#27272a", "rx": 12, "ry": 12, "stroke": "#10b981", "strokeWidth": 1.5},
                    {"type": "textbox", "left": 520, "top": 175, "width": 330, "text": "GIẢI PHÁP ĐỘT PHÁ (SOLUTION)\\n\\n• Tự động hóa thông minh tích hợp AI đa phương thức\\n• Tốc độ xử lý chỉ trong 10 giây với độ chính xác 99.8%\\n• Kết nối trực tiếp vào mọi hệ thống ERP & CRM hiện có\\n• Giúp doanh nghiệp sẵn sàng tăng trưởng gấp 10 lần", "fontSize": 13, "fontFamily": "Inter", "fill": "#86efac", "lineHeight": 1.5}
                ]
            }
        }
    }
]

def seed_default_templates():
    """Seeds default pre-made templates into pptx_templates table if empty."""
    conn = get_db_connection()
    try:
        with conn:
            cursor = conn.execute("SELECT COUNT(*) as count FROM pptx_templates;")
            row = cursor.fetchone()
            count = row["count"] if row else 0
            if count == 0:
                for idx, tmpl in enumerate(DEFAULT_SEEDED_TEMPLATES):
                    tags_json = json.dumps(tmpl.get("tags", []), ensure_ascii=False)
                    slide_data_json = json.dumps(tmpl.get("slide_data", {}), ensure_ascii=False)
                    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                    conn.execute("""
                        INSERT OR REPLACE INTO pptx_templates (
                            id, title, category, category_name, tags, bg_gradient, preview_badge, preview_html, slide_data, is_active, order_index, created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?);
                    """, (
                        tmpl["id"], tmpl["title"], tmpl["category"], tmpl["category_name"],
                        tags_json, tmpl.get("bg_gradient", ""), tmpl.get("preview_badge", ""),
                        tmpl.get("preview_html", ""), slide_data_json, idx, now_str, now_str
                    ))
                logger.info(f"Seeded {len(DEFAULT_SEEDED_TEMPLATES)} default PPTX templates.")
    except Exception as e:
        logger.error(f"Error seeding templates: {e}")
    finally:
        conn.close()

def list_pptx_templates(include_inactive: bool = False, category: Optional[str] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    """Lists templates from database with category & keyword filtering."""
    conn = get_db_connection()
    try:
        where_clauses = []
        params = []

        if not include_inactive:
            where_clauses.append("is_active = 1")

        if category and category != "all":
            where_clauses.append("category = ?")
            params.append(category)

        if search:
            q = f"%{search.strip().lower()}%"
            where_clauses.append("(LOWER(title) LIKE ? OR LOWER(category_name) LIKE ? OR LOWER(tags) LIKE ?)")
            params.extend([q, q, q])

        where_sql = ("WHERE " + " AND ".join(where_clauses)) if where_clauses else ""
        sql = f"SELECT * FROM pptx_templates {where_sql} ORDER BY order_index ASC, created_at DESC;"

        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            try:
                d["tags"] = json.loads(d["tags"]) if isinstance(d["tags"], str) else d["tags"]
            except Exception:
                d["tags"] = []
            try:
                d["slide_data"] = json.loads(d["slide_data"]) if isinstance(d["slide_data"], str) else d["slide_data"]
            except Exception:
                d["slide_data"] = {}
            result.append(d)
        return result
    finally:
        conn.close()

def get_pptx_template(template_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single PPTX template by ID."""
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT * FROM pptx_templates WHERE id = ?;", (template_id,))
        row = cursor.fetchone()
        if not row:
            return None
        d = dict(row)
        try:
            d["tags"] = json.loads(d["tags"]) if isinstance(d["tags"], str) else d["tags"]
        except Exception:
            d["tags"] = []
        try:
            d["slide_data"] = json.loads(d["slide_data"]) if isinstance(d["slide_data"], str) else d["slide_data"]
        except Exception:
            d["slide_data"] = {}
        return d
    finally:
        conn.close()

def create_pptx_template(data: Dict[str, Any]) -> Dict[str, Any]:
    """Creates a new PPTX template in the database."""
    template_id = data.get("id") or f"tmpl_{secrets.token_hex(6)}"
    title = data.get("title", "Mẫu trang mới").strip()
    category = data.get("category", "custom").strip()
    category_name = data.get("category_name", "Tùy chỉnh").strip()
    tags = data.get("tags") or []
    tags_json = json.dumps(tags, ensure_ascii=False) if isinstance(tags, list) else str(tags)
    bg_gradient = data.get("bg_gradient", "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)")
    preview_badge = data.get("preview_badge", category_name.upper())
    preview_html = data.get("preview_html", "")
    slide_data = data.get("slide_data") or {"customColor": "#0f172a", "fabricJson": {"objects": []}}
    slide_data_json = json.dumps(slide_data, ensure_ascii=False) if isinstance(slide_data, dict) else str(slide_data)
    is_active = int(data.get("is_active", 1))
    order_index = int(data.get("order_index", 0))
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                INSERT INTO pptx_templates (
                    id, title, category, category_name, tags, bg_gradient, preview_badge, preview_html, slide_data, is_active, order_index, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                template_id, title, category, category_name, tags_json, bg_gradient,
                preview_badge, preview_html, slide_data_json, is_active, order_index, now_str, now_str
            ))
        return get_pptx_template(template_id)
    finally:
        conn.close()

def update_pptx_template(template_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates an existing PPTX template."""
    existing = get_pptx_template(template_id)
    if not existing:
        return None

    title = data.get("title", existing["title"]).strip()
    category = data.get("category", existing["category"]).strip()
    category_name = data.get("category_name", existing["category_name"]).strip()
    tags = data.get("tags", existing["tags"])
    tags_json = json.dumps(tags, ensure_ascii=False) if isinstance(tags, list) else str(tags)
    bg_gradient = data.get("bg_gradient", existing.get("bg_gradient", ""))
    preview_badge = data.get("preview_badge", existing.get("preview_badge", ""))
    preview_html = data.get("preview_html", existing.get("preview_html", ""))
    slide_data = data.get("slide_data", existing.get("slide_data", {}))
    slide_data_json = json.dumps(slide_data, ensure_ascii=False) if isinstance(slide_data, dict) else str(slide_data)
    is_active = int(data.get("is_active", existing.get("is_active", 1)))
    order_index = int(data.get("order_index", existing.get("order_index", 0)))
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                UPDATE pptx_templates
                SET title = ?, category = ?, category_name = ?, tags = ?, bg_gradient = ?, preview_badge = ?, preview_html = ?, slide_data = ?, is_active = ?, order_index = ?, updated_at = ?
                WHERE id = ?;
            """, (
                title, category, category_name, tags_json, bg_gradient,
                preview_badge, preview_html, slide_data_json, is_active, order_index, now_str, template_id
            ))
        return get_pptx_template(template_id)
    finally:
        conn.close()

def delete_pptx_template(template_id: str) -> bool:
    """Deletes a template from the database."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("DELETE FROM pptx_templates WHERE id = ?;", (template_id,))
        return True
    finally:
        conn.close()
