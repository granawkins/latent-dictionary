from flask import Flask, jsonify, request
from flask_cors import CORS

from word_vectors import get_word_vectors

app = Flask(__name__)
CORS(app)

_index_cache = None
@app.route('/api/get_vectors', methods=['POST'])
def get_vectors():
    data = request.get_json()
    highlight = data.get("highlight", [])
    if not highlight:
        global _index_cache
        if _index_cache is None:
            _index_cache = get_word_vectors()
        return jsonify(_index_cache)
    set_pca = data.get("set_pca", False)
    pca_id = data.get("pca_id", "default")
    vectors = get_word_vectors(highlight, set_pca, pca_id)
    return jsonify({"vectors": vectors, "pca_id": pca_id})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
