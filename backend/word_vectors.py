import pickle

from embeddings import DistilBertEmbeddingsModel
from pca import get_pca_for
from redis_client import get_redis_client

model = DistilBertEmbeddingsModel()


pcas = {}
def get_pca_id(words: list[str] = []) -> str:
    print(f"Getting PCA for {len(words)} words")
    pca_id = "".join(sorted(list(set(words))))
    if pca_id not in pcas:
        pcas[pca_id] = get_pca_for(get_embeddings(words))
    return pca_id


def get_embeddings(words: list[str] = []) -> list[list[float]]:
    redis_client = get_redis_client()
    # Get from redis and/or model
    new_words = [w for w in words if not redis_client.exists(w)]
    if new_words:
        print(f"Generating embeddings for {len(words)} words")
        new_embeddings = model.batch_get(new_words)
        for word, embedding in zip(new_words, new_embeddings):
            redis_client.set(word, pickle.dumps(embedding.tolist()))
    embeddings = [redis_client.get(w) for w in words]
    embeddings = [pickle.loads(e) if e else None for e in embeddings]
    return embeddings


def get_coordinates(words: list[str] = [], pca_id: str = "default") -> list[list[float]]:
    embeddings = get_embeddings(words)
    if pca_id not in pcas:
        if pca_id == "default":
            pcas["default"] = get_pca_for(embeddings)  # First time only
        else:
            raise Exception(f"PCA {pca_id} not found")
    coordinates = pcas[pca_id].transform(embeddings)
    return [list(c) for c in coordinates]
