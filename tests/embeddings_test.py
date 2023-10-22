import pytest
from lib.embeddings import get_embeddings, EMBEDDINGS_DIM

def test_get_embeddings_single_word():
    word = "hello"
    embeddings = get_embeddings([word])
    assert len(embeddings) == 1
    assert len(embeddings[0]) == EMBEDDINGS_DIM

def test_get_embeddings_multiple_words():
    words = ["hello", "world"]
    embeddings = get_embeddings(words)
    assert len(embeddings) == 2
    assert len(embeddings[0]) == EMBEDDINGS_DIM
    assert len(embeddings[1]) == EMBEDDINGS_DIM

def test_get_embeddings_empty_list():
    embeddings = get_embeddings([])
    assert len(embeddings) == 0
