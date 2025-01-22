import os
from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from dotenv import load_dotenv

load_dotenv()

DB_PATH = Path("~/.latentdictionary").expanduser()
DB_PATH.parent.mkdir(exist_ok=True)
try:
    openai_api_key = os.getenv("OPENAI_API_KEY")
except KeyError:
    openai_api_key = input("Enter your OpenAI API key: ")
client = chromadb.PersistentClient(
    path=DB_PATH.as_posix()
)
embedding_function = OpenAIEmbeddingFunction(
    api_key=openai_api_key,
    model_name="text-embedding-3-small"
)
collection = client.get_or_create_collection(
    name='latent-dictionary', 
    embedding_function=embedding_function
)


def main():
    all_records = collection.get(include=["documents", "metadatas"])
    all_words: set[tuple[str, str]] = {
        (document, metadata["language"]) 
        for document, metadata in zip(all_records["documents"], all_records["metadatas"])
    }
    print(f"Found {len(all_words)} records in db")

    new_words: list[tuple[str, str]] = []
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
            collection.add(ids=ids[i:_end], documents=documents[i:_end], metadatas=metadatas[i:_end])
        except Exception as e:
            print(f"Error adding {documents[i:_end]}: {e}")
            return
    print(f"Success!")


if __name__ == "__main__":
    main()
