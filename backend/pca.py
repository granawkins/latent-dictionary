from sklearn.decomposition import PCA
COMPONENTS = 3

def get_pca_for(
    items: list[list[float]], n_components: int = COMPONENTS
) -> list[list[float]]:
    """Reduce dimensionality of a list of embeddings using PCA."""
    pca = PCA(n_components=n_components)
    pca.fit(items)  # 10x longer than transform; 0.6s for oxford 3000
    return pca
