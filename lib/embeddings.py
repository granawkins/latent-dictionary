
import os
import openai
from .database import get_database


OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if OPENAI_API_KEY is None:
    raise Exception("OPENAI_API_KEY environment variable not set")
openai.api_key = OPENAI_API_KEY


MODEL = "text-embedding-ada-002"
BATCH_SIZE = 1000  # Some words are more than one token.
EMBEDDINGS_DIM = 1536

def get_embeddings(words: list[str]) -> list[list[float]]:
    db = get_database()
    new_words = [w for w in words if not db.exists("embeddings", w)]
    n_batches = (len(new_words) + BATCH_SIZE - 1) // BATCH_SIZE
    for i in range(n_batches):
        start, end = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
        batch_words = new_words[start:end]
        print(f"BATCH {i+1}/{n_batches}: {len(batch_words)} words")
        response = openai.Embedding.create(input=batch_words, model=MODEL)
        embeddings = [i["embedding"] for i in response["data"]]
        batch_embeddings = {word: embedding for word, embedding in zip(batch_words, embeddings)}
        db.batch_add("embeddings", batch_embeddings)
    return [db.get("embeddings", w) for w in words]
