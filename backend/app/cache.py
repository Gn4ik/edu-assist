import diskcache as dc

from app.config import CACHE_DIR, CACHE_SIZE_MB

cache = dc.Cache(
    directory=str(CACHE_DIR),
    size_limit=CACHE_SIZE_MB * 1024 * 1024,
    eviction_policy="least-recently-used",
)


def get_from_cache(key: str):
    if key in cache:
        return cache[key]
    return None


def save_to_cache(key: str, value):
    cache[key] = value


def clear_cache(cache_type: str = "all"):
    keys_removed = 0
    if cache_type == "all":
        keys_removed = len(cache)
        cache.clear()
    else:
        keys_to_remove = [k for k in cache if k.startswith(f"{cache_type}:")]
        for k in keys_to_remove:
            del cache[k]
            keys_removed += 1
    return keys_removed
