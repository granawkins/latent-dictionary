import pickle
import redis

from embeddings import DistilBertEmbeddingsModel
from pca import get_pca_for

model = DistilBertEmbeddingsModel()
redis_client = redis.Redis(host="redis", port=6379, db=0)


def get_pca_id(words: list[str] = []) -> str:
    return "".join(sorted(list(set(words))))


def get_embeddings(words: list[str] = []) -> list[list[float]]:
    # Get from redis and/or model
    new_words = [w for w in words if not redis_client.exists(w)]
    if new_words:
        new_embeddings = model.batch_get(new_words)
        for word, embedding in zip(new_words, new_embeddings):
            redis_client.set(word, pickle.dumps(embedding.tolist()))
    embeddings = [redis_client.get(w) for w in words]
    embeddings = [pickle.loads(e) if e else None for e in embeddings]
    return embeddings


pcas = {}
def get_coordinates(words: list[str] = [], pca_id: str = "default") -> list[list[float]]:
    print(f"Getting embeddings for {len(words)} words")
    embeddings = get_embeddings(words)
    if pca_id not in pcas:
        print(f"Getting PCA for {len(embeddings)} embeddings")
        pcas[pca_id] = get_pca_for(embeddings)
    print(f"Transforming {len(embeddings)} embeddings")
    coordinates = pcas[pca_id].transform(embeddings)
    return [list(c) for c in coordinates]
