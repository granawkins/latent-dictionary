import os
from pathlib import Path
import shutil

from typing import List, Tuple, Set, cast, Optional

import chromadb
from chromadb.api.types import Include, Collection
from chromadb.utils.embedding_functions.openai_embedding_function import (
    OpenAIEmbeddingFunction,
)
from dotenv import load_dotenv

# Define valid include parameters
DOCUMENTS_AND_METADATAS: Include = ["documents", "metadatas"]  # type: ignore

# Current embedding model configuration
CURRENT_EMBEDDING_MODEL = "text-embedding-3-small"
EXPECTED_DIMENSIONS = 384  # text-embedding-3-small produces 384-dimensional embeddings

load_dotenv()

DB_PATH = Path("~/.latentdictionary").expanduser()
DB_PATH.parent.mkdir(exist_ok=True)


def get_embedding_function(api_key: Optional[str]) -> Optional[OpenAIEmbeddingFunction]:
    """Create an OpenAI embedding function if API key is available."""
    if api_key:
        return OpenAIEmbeddingFunction(
            api_key=api_key,
            model_name=CURRENT_EMBEDDING_MODEL,
        )
    return None


def check_collection_compatibility(collection: Collection) -> bool:
    """Check if the collection's embeddings are compatible with current model."""
    try:
        # Try to get one item to check its embedding dimension
        result = collection.get(limit=1)
        if result["embeddings"]:
            actual_dimensions = len(result["embeddings"][0])
            return actual_dimensions == EXPECTED_DIMENSIONS
    except Exception:
        # If we can't get embeddings or there are none, consider it compatible
        return True
    return True


def handle_incompatible_database() -> None:
    """Handle incompatible database by backing up and recreating."""
    backup_path = DB_PATH.with_suffix('.backup')
    print(f"Warning: Incompatible embedding dimensions detected!")
    print(f"The database was created with a different embedding model.")
    print(f"Current model ({CURRENT_EMBEDDING_MODEL}) produces {EXPECTED_DIMENSIONS}-dimensional embeddings.")
    print(f"\nBacking up existing database to: {backup_path}")
    print("Creating new database with current embedding model.")
    
    if DB_PATH.exists():
        if backup_path.exists():
            backup_path.unlink()
        shutil.move(DB_PATH, backup_path)
    
    print("\nPlease run this script again to rebuild the database.")
    print("Your existing data is safe in the backup file.")
    exit(1)


# Initialize database client and collection
openai_api_key = os.getenv("OPENAI_API_KEY")
client = chromadb.PersistentClient(path=DB_PATH.as_posix())
embedding_function = get_embedding_function(openai_api_key)

try:
    collection = client.get_or_create_collection(
        name="latent-dictionary",
        embedding_function=embedding_function,
    )
    
    # Check compatibility with current embedding model
    if not check_collection_compatibility(collection):
        handle_incompatible_database()
except Exception as e:
    if "Embedding dimension" in str(e):
        handle_incompatible_database()
    raise


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
