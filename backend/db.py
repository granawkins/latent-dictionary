import os
from pathlib import Path

from typing import List, Tuple, Set, cast

import chromadb
from chromadb.api.types import Include
from chromadb.utils.embedding_functions.openai_embedding_function import (
    OpenAIEmbeddingFunction,
)
from dotenv import load_dotenv

# Define valid include parameters
DOCUMENTS_AND_METADATAS: Include = ["documents", "metadatas"]  # type: ignore

load_dotenv()

DB_PATH = Path("~/.latentdictionary").expanduser()
DB_PATH.parent.mkdir(exist_ok=True)
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key:
    client = chromadb.PersistentClient(
        path=DB_PATH.as_posix(),
        api_key=openai_api_key,
    )
    embedding_function = OpenAIEmbeddingFunction(
        api_key=openai_api_key, model_name="text-embedding-3-small"
    )
    collection = client.get_or_create_collection(
        name="latent-dictionary", embedding_function=embedding_function
    )
else:
    client = chromadb.PersistentClient(path=DB_PATH.as_posix())
    collection = client.get_or_create_collection(name="latent-dictionary")


def main() -> None:
    include: Include = DOCUMENTS_AND_METADATAS
    all_records = collection.get(include=include)

    documents = all_records.get("documents", [])
    metadatas = all_records.get("metadatas", [])

    if not documents or not metadatas:
        all_words: Set[Tuple[str, str]] = set()
    else:
        all_words = {
            (cast(str, doc), cast(str, meta.get("language", "")))
            for doc, meta in zip(documents, metadatas)
        }
    print(f"Found {len(all_words)} records in db")

    new_words: List[Tuple[str, str]] = []
    wordlists_dir = Path(__file__).parent / "wordlists"
    for file in wordlists_dir.glob("*.txt"):
        language = file.name[:-4]
        for line in file.read_text().split("\n"):
            if line.startswith("#") or not line.strip():
                continue
            word = (line.strip(), language)
            if word not in all_words:
                new_words.append(word)
    if len(new_words) == 0:
        print("Nothing to add")
    else:
        print(f"Adding {len(new_words)} new records")

    documents = []
    metadatas = []
    for word, language in new_words:
        documents.append(word)
        metadatas.append({"language": language})
    ids = [f"id{i}" for i in range(len(all_words), len(all_words) + len(documents))]
    batch_size = 1000
    for i in range(0, len(documents), batch_size):
        _end = min(i + batch_size, len(documents))
        try:
            collection.add(
                ids=ids[i:_end],
                documents=documents[i:_end],
                metadatas=metadatas[i:_end],
            )
        except Exception as e:
            print(f"Error adding {documents[i:_end]}: {e}")
            return
    print("Success!")


if __name__ == "__main__":
    main()
