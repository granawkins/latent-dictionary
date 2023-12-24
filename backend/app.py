from flask import Flask, jsonify, request
from flask_cors import CORS

from embeddings import DistilBertEmbeddingsModel
from pca import get_pca_for

app = Flask(__name__)
CORS(app)


# Load dependencies
model = DistilBertEmbeddingsModel()
with open('oxford_3000.txt') as f:
    oxford_3000 = [w.strip() for w in f.readlines()]
    oxford_3000 = oxford_3000[:500]


# A dict of all the different PCAs, indexed by word basis
pcas = {}


def get_word_vectors(
    highlight: list[str] = [], 
    set_pca: bool = False, 
    pca_id: str = "default"
):
    """Return a dict of words and 3d vectors.
    
    Args:
        highlight: A list of items (besides oxford 3000) to embed
        set_pca: If true, apply new PCA based on highlight
        pca_id: To re-use a previous PCA
    """
    global pcas

    _highlight = [w for w in highlight if w.isalpha()]
    _oxford_3000 = [w for w in oxford_3000 if w.isalpha()]
    words = list(set(_highlight + _oxford_3000))
    embeddings = model.batch_get(words)
    index = {w: e for w, e in zip(words, embeddings)}

    if set_pca or (pca_id == "default" and "default" not in pcas):
        if set_pca:
            pca_id = str(str(_highlight.keys()))
            pca_vals = [index[w] for w in _highlight]
        else:
            pca_vals = [index[w] for w in _oxford_3000]
        pcas[pca_id] = get_pca_for(pca_vals)
    elif pca_id != "default" and pca_id not in pcas:
        raise ValueError(f"Unrecognized pca_id: {pca_id}")

    vectors = pcas[pca_id].transform(embeddings)
    return {k: list(v) for k, v in zip(words, vectors)}



@app.route('/api/get_vectors', methods=['POST'])
def get_vectors():
    data = request.get_json()
    highlight = data.get("highlight", [])
    set_pca = data.get("set_pca", False)
    pca_id = data.get("pca_id", "default")
    vectors = get_word_vectors(highlight, set_pca, pca_id)
    return jsonify(vectors)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
