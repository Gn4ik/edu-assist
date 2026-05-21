import time
from collections import defaultdict
from threading import Lock

from app.config import get_settings

settings = get_settings()


class RateLimiter:
    def __init__(self, max_requests: int | None = None, window_seconds: int = 60):
        self.max_requests = max_requests or settings.RATE_LIMIT_PER_MINUTE
        self.window = window_seconds
        self._requests: dict[int, list[float]] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, user_id: int) -> bool:
        now = time.time()
        cutoff = now - self.window
        with self._lock:
            self._requests[user_id] = [
                t for t in self._requests[user_id] if t > cutoff
            ]
            if len(self._requests[user_id]) >= self.max_requests:
                return False
            self._requests[user_id].append(now)
            return True
