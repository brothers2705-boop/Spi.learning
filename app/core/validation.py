import re
from typing import Optional, Tuple
from urllib.parse import urlparse, parse_qs
from app.core.errors import InvalidURLError

YOUTUBE_PATTERNS = [
    r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
    r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})',
    r'(?:https?://)?(?:www\.)?youtube\.com/v/([a-zA-Z0-9_-]{11})',
    r'(?:https?://)?(?:www\.)?youtu\.be/([a-zA-Z0-9_-]{11})',
    r'(?:https?://)?(?:www\.)?youtube\.com/shorts/([a-zA-Z0-9_-]{11})',
]

def extract_video_id(url: str) -> Optional[str]:
    if not url or not isinstance(url, str):
        return None
    url = url.strip()
    for pattern in YOUTUBE_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    try:
        parsed = urlparse(url)
        if "youtube.com" in parsed.netloc:
            qs = parse_qs(parsed.query)
            if "v" in qs and qs["v"]:
                vid = qs["v"][0]
                if re.match(r'^[a-zA-Z0-9_-]{11}$', vid):
                    return vid
    except:
        pass
    return None

def validate_youtube_url(url: str) -> Tuple[str, str]:
    if not url or len(url) > 2048:
        raise InvalidURLError("URL is empty or too long")
    from app.core.security import is_allowed_youtube_domain
    if not is_allowed_youtube_domain(url):
        raise InvalidURLError("Only youtube.com and youtu.be URLs are allowed")
    video_id = extract_video_id(url)
    if not video_id:
        raise InvalidURLError("Could not extract video ID from URL")
    normalized = f"https://www.youtube.com/watch?v={video_id}"
    return normalized, video_id

def format_timestamp(seconds: float) -> str:
    total = int(seconds)
    hours = total // 3600
    minutes = (total % 3600) // 60
    secs = total % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes:02d}:{secs:02d}"

def parse_timestamp_to_seconds(ts: str) -> float:
    parts = ts.strip().split(":")
    try:
        if len(parts) == 3:
            return int(parts[0])*3600 + int(parts[1])*60 + float(parts[2])
        elif len(parts) == 2:
            return int(parts[0])*60 + float(parts[1])
        else:
            return float(parts[0])
    except:
        return 0.0
