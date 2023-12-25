import pickle
import redis

from embeddings import DistilBertEmbeddingsModel
from pca import get_pca_for

model = DistilBertEmbeddingsModel()
with open('oxford_3000.txt') as f:
    oxford_3000 = [w.strip() for w in f.readlines()]

# A dict of all the different PCAs, indexed by word basis
pcas = {}

# A database to store word embeddings
redis_client = redis.Redis(host='redis', port=6379, db=0)

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
    new_words = [w for w in words if not redis_client.exists(w)]
    if new_words:
        new_embeddings = model.batch_get(new_words)
        for word, embedding in zip(new_words, new_embeddings):
            redis_client.set(word, pickle.dumps(embedding.tolist()))
    embeddings = [redis_client.get(w) for w in words]
    embeddings = [pickle.loads(e) if e else None for e in embeddings]
    index = {w: e for w, e in zip(words, embeddings) if e is not None}

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
