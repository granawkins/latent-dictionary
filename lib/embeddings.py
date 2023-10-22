
import os
import openai


OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if OPENAI_API_KEY is None:
    raise Exception("OPENAI_API_KEY environment variable not set")
openai.api_key = OPENAI_API_KEY


MODEL = "text-embedding-ada-002"
BATCH_SIZE = 1000  # Some words are more than one token.
EMBEDDINGS_DIM = 1536
word_embeddings_map: dict[str, list[float]] = {}

def get_embeddings(words: list[str]) -> list[list[float]]:
    new_words = [w for w in words if w not in word_embeddings_map]
    n_batches = (len(new_words) + BATCH_SIZE - 1) // BATCH_SIZE
    for i in range(n_batches):
        start, end = i * BATCH_SIZE, (i + 1) * BATCH_SIZE
        input = new_words[start:end]
        response = openai.Embedding.create(input=input, model=MODEL)
        embeddings = [i["embedding"] for i in response["data"]]
        for word, embedding in zip(input, embeddings):
            word_embeddings_map[word] = embedding
    return [word_embeddings_map[w] for w in words]
