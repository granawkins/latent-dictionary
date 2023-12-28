import redis

_redis = None

def get_redis_client():
    global _redis
    if not _redis:
        _redis = redis.Redis(host="redis", port=6379, db=0)
    return _redis
