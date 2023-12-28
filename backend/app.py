import os
import datetime
import secrets
import pickle

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS
from functools import wraps

from word_vectors import get_coordinates, get_pca_id
from redis_client import get_redis_client

with open('oxford_3000.txt') as f:
    oxford_3000 = [w.strip() for w in f.readlines()]

app = Flask(__name__)
CORS(app)


"""
USER MANAGEMENT

Scheme:
- When a user first visits the site, they're assigned a user id
- This is used to create a json web token, which is stored in the browser and included with each subsequent request
- The token can be decoded to bet the user_id, and keep a record of user_ids.
"""
SECRET_KEY = "please_be_gentle"
def get_token_for(user_id, days=365):
    return jwt.encode({
        "user_id": user_id,
        "exp": datetime.datetime.now() + datetime.timedelta(days=days),
    }, SECRET_KEY)

def get_user_data(user_id):
    user_data = get_redis_client().get(user_id)
    if user_data:
        return pickle.loads(user_data)
    else:
        return None

def create_user():
    user_id = secrets.token_hex(16)
    user_data = {
        "created_at": datetime.datetime.now(),
        "search_history": [],
        "requireCaptcha": False,
    }
    get_redis_client().set(user_id, pickle.dumps(user_data))
    token = get_token_for(user_id)
    return user_id, token


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({"error": "Missing token"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data['user_id']
            user = get_user_data(user_id)
        except:
            return jsonify({"error": "Invalid token"}), 401
        return f(user, *args, **kwargs)
    return decorated


"""
API
- /api/index: Get the index of oxford_3000 with default pca
- /api/search: Get the coordinates of a list of words with a specified pca
- /api/set_pca: Generate a new pca from a list of words, and return the complete corpus set to the new pca

Endpoints generally return a json object like
{
    "vectors": {
        "word1": [x1, y1, z1],
        "word2": [x2, y2, z2],
        ...
    },
    "pca_id": "default",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
"""
_index_cache = None
@app.route('/api/index', methods=['GET'])
def index():
    global _index_cache
    try:
        # Check for Authentication token
        token = request.headers.get("Authorization")
        if token:
            token = token.split(" ")[1]
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data['user_id']
            if get_user_data(user_id) is None:
                token = None
        if not token:
            user_id, token = create_user()

        if _index_cache is None:
            vectors = get_coordinates(oxford_3000, pca_id="default")
            _index_cache = {w: v for w, v in zip(oxford_3000, vectors)}
        return jsonify({"vectors": _index_cache, "pca_id": "default", "token": token})
    except Exception as e:
        return jsonify({"error": str(e)})
    

def validate_word(word):
    assert word, "Word must not be empty"
    assert word.isalpha(), "Word must be alphabetic"
    assert len(word) <= 20, "Word must be less than 20 characters"


@app.route('/api/search', methods=['POST'])
@token_required
def search(user):
    try:
        data = request.get_json()
        words = data.get("words")
        [validate_word(w) for w in words]
        pca_id = data.get("pca_id") or "default"

        vectors = get_coordinates(words, pca_id)
        vectors = {w: v for w, v in zip(words, vectors)}
        return jsonify({"vectors": vectors, "pca_id": pca_id})
    except Exception as e:
        return jsonify({"error": str(e)})
    

@app.route('/api/set_pca', methods=["POST"])
@token_required
def set_pca(user):
    try:
        data = request.get_json()
        words = data.get("words")
        [validate_word(w) for w in words]
        search_history = data.get("search_history") or []
        reset = data.get("reset")

        pca_id = "default" if reset else get_pca_id(words)
        corpus = list(set(oxford_3000 + search_history + words))
        vectors = get_coordinates(corpus, pca_id)
        vectors = {w: v for w, v in zip(corpus, vectors)}
        return jsonify({"vectors": vectors, "pca_id": pca_id})
    except Exception as e:
        return jsonify({"error": str(e)})


# Development server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
