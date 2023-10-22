import pytest

from backend.lib.database import get_database
from backend.lib.embeddings import get_embeddings, EMBEDDINGS_DIM

def test_get_embeddings_single_word(mock_database):
    word = "hello"
    embeddings = get_embeddings([word])
    assert len(embeddings) == 1
    assert len(embeddings[0]) == EMBEDDINGS_DIM

    db = get_database()
    assert db.exists("embeddings", word)

def test_get_embeddings_multiple_words(mock_database):
    words = ["hello", "world"]
    embeddings = get_embeddings(words)
    assert len(embeddings) == 2
    assert len(embeddings[0]) == EMBEDDINGS_DIM
    assert len(embeddings[1]) == EMBEDDINGS_DIM

    db = get_database()
    assert db.exists("embeddings", words[0])
    assert db.exists("embeddings", words[1])

def test_get_embeddings_empty_list():
    embeddings = get_embeddings([])
    assert len(embeddings) == 0
