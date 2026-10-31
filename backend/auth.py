import os
import json
import logging
import urllib.request
import urllib.parse
from typing import Optional, Dict, Any

logger = logging.getLogger("auth-google")

GOOGLE_CLIENT_ID = os.getenv("APP_AUTH_CLIENTID", "")
GOOGLE_CLIENT_SECRET = os.getenv("APP_AUTH_CLIENTSECRET", "")
GOOGLE_CALLBACK_URL = os.getenv("APP_AUTH_CALLBACK", "http://localhost:9030/auth/google/callback")

GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"

def get_google_login_url(state: Optional[str] = None) -> str:
    """Generates the Google OAuth2 authorization URL."""
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_CALLBACK_URL,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    if state:
        params["state"] = state
    return f"{GOOGLE_AUTH_ENDPOINT}?{urllib.parse.urlencode(params)}"

def exchange_code_for_user_info(code: str) -> Dict[str, Any]:
    """
    Exchanges the authorization code for tokens and retrieves user profile
    from Google using standard urllib (no third-party dependencies required).
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise ValueError("Google Client ID hoặc Client Secret chưa được thiết lập trong .env")

    # 1. Exchange code for tokens
    token_payload = urllib.parse.urlencode({
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_CALLBACK_URL,
        "grant_type": "authorization_code"
    }).encode("utf-8")

    req = urllib.request.Request(
        GOOGLE_TOKEN_ENDPOINT,
        data=token_payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            token_data = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        logger.error(f"Google Token Exchange Failed: {e.code} - {error_body}")
        raise ValueError(f"Xác thực mã Google thất bại: {error_body}")

    access_token = token_data.get("access_token")
    if not access_token:
        raise ValueError("Không nhận được access_token từ Google")

    # 2. Retrieve user profile info
    user_req = urllib.request.Request(
        GOOGLE_USERINFO_ENDPOINT,
        headers={"Authorization": f"Bearer {access_token}"}
    )

    try:
        with urllib.request.urlopen(user_req, timeout=15) as res:
            user_data = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        logger.error(f"Google UserInfo Request Failed: {e.code} - {error_body}")
        raise ValueError(f"Không thể lấy thông tin người dùng Google: {error_body}")

    return {
        "id": user_data.get("id"),
        "email": user_data.get("email"),
        "name": user_data.get("name", "Người dùng"),
        "picture": user_data.get("picture", ""),
        "verified_email": user_data.get("verified_email", True)
    }

