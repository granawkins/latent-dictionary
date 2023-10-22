from sklearn.decomposition import PCA
from .oxford_3000 import oxford_3000
from .embeddings import get_embeddings


COMPONENTS = 3

def get_pca(
    items: list[list[float]], n_components: int = COMPONENTS
) -> list[list[float]]:
    """Reduce dimensionality of a list of embeddings using PCA."""
    pca = PCA(n_components=n_components)
    pca.fit(items)
    return pca.transform(items)


oxford_3000_pca: PCA | None = None
def get_default_pca(
    items: list[list[float]], n_components: int = COMPONENTS
) -> dict[str, list[float]]:
    """Reduce dimensionality using a PCA fit on the Oxford 3000 Words."""
    global oxford_3000_pca
    if oxford_3000_pca is None:
        words = oxford_3000()
        embeddings = get_embeddings(words)
        pca = PCA(n_components=n_components)
        pca.fit(embeddings)
        oxford_3000_pca = pca

    return oxford_3000_pca.transform(items)
