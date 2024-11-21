from pathlib import Path

import chromadb


DB_PATH = Path("~/.latentdictionary/chroma")
DB_NAME = "latentdictionary"
DB_PATH.mkdir(exist_ok=True)


client = chromadb.PersistentClient(path=DB_PATH)
collection = client.get_or_create_collection(name=DB_NAME)
