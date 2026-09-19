from enum import Enum
from fastapi import HTTPException

class ErrorCode(str, Enum):
    INVALID_URL = "invalid_url"
    VIDEO_NOT_FOUND = "video_not_found"
    VIDEO_TOO_LONG = "video_too_long"
    TRANSCRIPT_TOO_LONG = "transcript_too_long"
    NO_TRANSCRIPT = "no_transcript"
    TRANSCRIPT_BLOCKED = "transcript_blocked"
    AI_KEY_MISSING = "ai_key_missing"
    AI_RATE_LIMIT = "ai_rate_limit"
    AI_TIMEOUT = "ai_timeout"
    AI_FAILURE = "ai_failure"
    FILE_GENERATION_FAILED = "file_generation_failed"
    SERVER_BUSY = "server_busy"
    RATE_LIMITED = "rate_limited"
    JOB_NOT_FOUND = "job_not_found"
    FORBIDDEN = "forbidden"
    UNEXPECTED_ERROR = "unexpected_error"

ERROR_MESSAGES = {
    ErrorCode.INVALID_URL: "The provided URL is not a valid YouTube URL.",
    ErrorCode.VIDEO_NOT_FOUND: "The video could not be found or is not accessible.",
    ErrorCode.VIDEO_TOO_LONG: "This video is too long to process. Please try a shorter lecture.",
    ErrorCode.TRANSCRIPT_TOO_LONG: "The transcript is too long to process.",
    ErrorCode.NO_TRANSCRIPT: "An accessible transcript could not be retrieved for this video.",
    ErrorCode.TRANSCRIPT_BLOCKED: "Transcript extraction is temporarily blocked. Please try again later or contact support.",
    ErrorCode.AI_KEY_MISSING: "AI service is not configured. Please contact support.",
    ErrorCode.AI_RATE_LIMIT: "AI service is rate limited. Please try again in a few minutes.",
    ErrorCode.AI_TIMEOUT: "AI processing timed out. Please try again.",
    ErrorCode.AI_FAILURE: "Failed to generate notes due to an AI error. Please try again.",
    ErrorCode.FILE_GENERATION_FAILED: "Failed to generate download files. Please try again.",
    ErrorCode.SERVER_BUSY: "Server is busy, try again shortly.",
    ErrorCode.RATE_LIMITED: "You have reached the hourly limit for note generation. Please try again later.",
    ErrorCode.JOB_NOT_FOUND: "Job not found.",
    ErrorCode.FORBIDDEN: "You do not have permission to access this job.",
    ErrorCode.UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
}

class AppError(Exception):
    def __init__(self, code: ErrorCode, message: str = None, detail: str = None, status_code: int = 400):
        self.code = code
        self.message = message or ERROR_MESSAGES.get(code, "An error occurred")
        self.detail = detail
        self.status_code = status_code
        super().__init__(self.message)

def raise_http_error(error: AppError):
    raise HTTPException(
        status_code=error.status_code,
        detail={
            "error_code": error.code.value,
            "message": error.message,
            "detail": error.detail if error.detail else None
        }
    )

class InvalidURLError(AppError):
    def __init__(self, detail=None):
        super().__init__(ErrorCode.INVALID_URL, status_code=400, detail=detail)

class VideoNotFoundError(AppError):
    def __init__(self, detail=None):
        super().__init__(ErrorCode.VIDEO_NOT_FOUND, status_code=404, detail=detail)

class VideoTooLongError(AppError):
    def __init__(self, duration_minutes: float, max_minutes: int):
        msg = f"This video is {duration_minutes:.1f} minutes long, exceeding the {max_minutes} minute limit."
        super().__init__(ErrorCode.VIDEO_TOO_LONG, message=msg, status_code=400)

class NoTranscriptError(AppError):
    def __init__(self, detail=None):
        super().__init__(ErrorCode.NO_TRANSCRIPT, status_code=422, detail=detail)

class TranscriptBlockedError(AppError):
    def __init__(self, detail=None):
        super().__init__(ErrorCode.TRANSCRIPT_BLOCKED, status_code=503, detail=detail)

class ServerBusyError(AppError):
    def __init__(self):
        super().__init__(ErrorCode.SERVER_BUSY, status_code=503)

class RateLimitedError(AppError):
    def __init__(self, detail=None):
        super().__init__(ErrorCode.RATE_LIMITED, status_code=429, detail=detail)
