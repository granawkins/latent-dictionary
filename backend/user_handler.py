import datetime
import secrets
import pickle

import jwt

from redis_client import get_redis_client

SECRET_KEY = "please_be_gentle"


"""
USER MANAGEMENT

Scheme:
- When a user first visits the site, they're assigned a user id
- This is used to create a json web token, which is stored in the browser and included with each subsequent request
- The token can be decoded to get the user_id, and keep a record of user_ids.
"""
class UserHandler:

    _redis = None
    @property
    def redis(self):
        if not self._redis:
            self._redis = get_redis_client()
        return self._redis

    def get_token_for(self, user_id, days=365):
        return jwt.encode({
            "user_id": user_id,
            "exp": datetime.datetime.now() + datetime.timedelta(days=days),
        }, SECRET_KEY)

    def create(self):
        user_id = secrets.token_hex(16)
        user_data = {
            "created_at": datetime.datetime.now(),
            "search_history": [],
            "requireCaptcha": False,
        }
        self.redis.set(user_id, pickle.dumps(user_data))
        token = self.get_token_for(user_id)
        return user_id, token

    def get(self, user_id):
        user_data = self.redis.get(user_id)
        if user_data:
            return pickle.loads(user_data)
        else:
            return None

    def exists(self, user_id):
        return self.get(user_id) is not None

    def log(self, user_id, tx_type, payload):
        user_data = self.get(user_id)
        search_history = user_data.get("search_history", [])
        search_history.append({
            "type": tx_type,
            "payload": payload,
            "timestamp": datetime.datetime.now()
        })
        user_data["search_history"] = search_history
        self.redis.set(user_id, pickle.dumps(user_data))

    def decode(self, token):
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
