import uuid
import secrets
from typing import Optional
from fastapi import Request, Response
from app.config import settings

SESSION_COOKIE_NAME = "session_id"
SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

def generate_session_id() -> str:
    return str(uuid.uuid4())

def generate_job_id() -> str:
    return str(uuid.uuid4())

def get_session_id_from_request(request: Request) -> Optional[str]:
    return request.cookies.get(SESSION_COOKIE_NAME)

def ensure_session_id(request: Request, response: Response) -> str:
    session_id = get_session_id_from_request(request)
    if not session_id:
        session_id = generate_session_id()
        set_session_cookie(response, session_id)
    return session_id

def set_session_cookie(response: Response, session_id: str):
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        max_age=SESSION_COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        path="/"
    )

def sanitize_filename(filename: str) -> str:
    import re
    filename = filename.replace("/", "_").replace("\\", "_")
    filename = re.sub(r'[^\w\-_\. ]', '_', filename)
    filename = re.sub(r'\s+', '_', filename)
    if len(filename) > 100:
        name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
        filename = name[:90] + (f".{ext}" if ext else "")
    return filename

def is_allowed_youtube_domain(url: str) -> bool:
    from urllib.parse import urlparse
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        allowed = [
            "youtube.com", "www.youtube.com", "m.youtube.com",
            "youtu.be", "www.youtu.be",
            "youtube-nocookie.com", "www.youtube-nocookie.com"
        ]
        for a in allowed:
            if domain == a or domain.endswith("." + a):
                return True
        return False
    except:
        return False
