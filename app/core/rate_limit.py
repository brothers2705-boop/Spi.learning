import time
from typing import Dict, Optional
import redis
from app.config import settings
from app.core.errors import RateLimitedError, ServerBusyError

_in_memory_store: Dict[str, list] = {}
_queue_length = 0
_concurrent_jobs = 0

def get_redis_client() -> Optional[redis.Redis]:
    try:
        client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        client.ping()
        return client
    except:
        return None

def check_rate_limit(session_id: str, ip: str):
    limit = settings.RATE_LIMIT_JOBS_PER_HOUR
    if limit <= 0:
        return
    redis_client = get_redis_client()
    now = time.time()
    hour_ago = now - 3600
    keys_to_check = [f"rate_limit:session:{session_id}", f"rate_limit:ip:{ip}"]
    if redis_client:
        for key in keys_to_check:
            try:
                redis_client.zremrangebyscore(key, 0, hour_ago)
                count = redis_client.zcard(key)
                if count >= limit:
                    raise RateLimitedError(f"Rate limit exceeded: {limit} jobs per hour")
            except RateLimitedError:
                raise
            except Exception:
                pass
    else:
        for key in keys_to_check:
            timestamps = _in_memory_store.get(key, [])
            timestamps = [t for t in timestamps if t > hour_ago]
            _in_memory_store[key] = timestamps
            if len(timestamps) >= limit:
                raise RateLimitedError(f"Rate limit exceeded: {limit} jobs per hour")

def record_job_attempt(session_id: str, ip: str):
    redis_client = get_redis_client()
    now = time.time()
    keys = [f"rate_limit:session:{session_id}", f"rate_limit:ip:{ip}"]
    if redis_client:
        for key in keys:
            try:
                redis_client.zadd(key, {str(now): now})
                redis_client.expire(key, 3600)
            except:
                pass
    else:
        for key in keys:
            if key not in _in_memory_store:
                _in_memory_store[key] = []
            _in_memory_store[key].append(now)

def check_global_concurrency_and_queue():
    redis_client = get_redis_client()
    max_concurrent = settings.MAX_CONCURRENT_JOBS
    max_queue = settings.MAX_QUEUE_LENGTH
    if redis_client:
        try:
            concurrent = int(redis_client.get("concurrent_jobs") or 0)
            queued = int(redis_client.get("queue_length") or 0)
            if concurrent >= max_concurrent and queued >= max_queue:
                raise ServerBusyError()
        except ServerBusyError:
            raise
        except Exception:
            pass
    else:
        global _queue_length, _concurrent_jobs
        if _concurrent_jobs >= max_concurrent and _queue_length >= max_queue:
            raise ServerBusyError()

def increment_concurrent():
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.incr("concurrent_jobs")
        except:
            pass
    else:
        global _concurrent_jobs
        _concurrent_jobs += 1

def decrement_concurrent():
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.decr("concurrent_jobs")
            val = int(redis_client.get("concurrent_jobs") or 0)
            if val < 0:
                redis_client.set("concurrent_jobs", 0)
        except:
            pass
    else:
        global _concurrent_jobs
        _concurrent_jobs = max(0, _concurrent_jobs - 1)

def increment_queue():
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.incr("queue_length")
        except:
            pass
    else:
        global _queue_length
        _queue_length += 1

def decrement_queue():
    redis_client = get_redis_client()
    if redis_client:
        try:
            redis_client.decr("queue_length")
            val = int(redis_client.get("queue_length") or 0)
            if val < 0:
                redis_client.set("queue_length", 0)
        except:
            pass
    else:
        global _queue_length
        _queue_length = max(0, _queue_length - 1)
