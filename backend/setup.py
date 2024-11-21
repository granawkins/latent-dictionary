from pathlib import Path

from db import collection


def main():
    all_records = collection.query("", include=["metadatas"])
    all_words: set[tuple[str, str]] = {
        (document, metadata["language"]) 
        for document, metadata in zip(all_records["documents"], all_records["metadatas"])
    }
    print(f"Found {len(all_words)} records in db")

    new_words: list[tuple[str, str]] = []
    for file in Path('wordlists').glob("*.txt"):
        language = file.name
        for line in file.read_text().split("\n"):
            if line.startswith("#"): 
                continue
            word = (line.strip(), language)
            if word not in all_words:
                new_words.add(word)
    if len(new_words) == 0:
        print("Nothing to add")
    else:
        print(f"Adding {len(new_words)} new records")

    documents = []
    metadatas = []
    for word, language in new_words:
        documents.append(word)
        metadatas.append({"language": language})
    ids = range(len(all_words), len(all_words) + len(documents))
    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    print(f"Success!")


if __name__ == "__main__":
    main()
