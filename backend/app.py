import re

from flask import Flask, jsonify, request
from flask_cors import CORS

from word_vectors import get_coordinates, get_pca_id

app = Flask(__name__)
CORS(app)

with open('oxford_3000.txt') as f:
    oxford_3000 = [w.strip() for w in f.readlines()]


def validate_word(word):
    assert word, "Word must not be empty"
    assert word.isalpha(), "Word must be alphabetic"
    assert len(word) <= 20, "Word must be less than 20 characters"


_index_cache = None
@app.route('/api/index', methods=['GET'])
def index():
    global _index_cache
    try:
        if _index_cache is None:
            vectors = get_coordinates(oxford_3000, pca_id="default")
            _index_cache = {w: v for w, v in zip(oxford_3000, vectors)}
        return jsonify({"vectors": _index_cache, "pca_id": "default"})
    except Exception as e:
        return jsonify({"error": str(e)})
    

@app.route('/api/search', methods=['POST'])
def search():
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
def set_pca():
    try:
        data = request.get_json()
        words = data.get("words")
        [validate_word(w) for w in words]
        search_history = data.get("search_history") or []

        pca_id = get_pca_id(words)
        corpus = list(set(oxford_3000 + search_history + words))
        vectors = get_coordinates(corpus, pca_id)
        vectors = {w: v for w, v in zip(corpus, vectors)}
        return jsonify({"vectors": vectors, "pca_id": pca_id})
    except Exception as e:
        return jsonify({"error": str(e)})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
