import pytest
from backend.lib.pca import get_pca, get_default_pca
from backend.lib.embeddings import get_embeddings

def test_get_pca():
    words = ["hello", "world"]
    embeddings = get_embeddings(words)
    reduced_embeddings = get_pca(embeddings, n_components=2)
    assert len(reduced_embeddings) == 2
    assert len(reduced_embeddings[0]) == 2

def test_get_default_pca(mocker):
    words = ["hello", "world"]
    embeddings = [[0.1] * 1536, [0.2] * 1536]

    mocker.patch("backend.lib.pca.oxford_3000", return_value=words)
    mocker.patch("backend.lib.pca.get_embeddings", return_value=embeddings)

    reduced_embeddings = get_default_pca(embeddings, n_components=2)
    assert len(reduced_embeddings) == 2
    assert len(reduced_embeddings[0]) == 2
