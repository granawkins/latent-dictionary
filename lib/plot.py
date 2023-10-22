import numpy as np
import plotly.graph_objects as go

def visualize_embeddings(pca_map: dict[str, list[float]], highlight: list[str]):

    words = pca_map.keys()
    vectors = np.array(list(pca_map.values()))

    colors = ['blue' if word not in highlight else 'red' for word in words]
    sizes = [5 if word not in highlight else 10 for word in words]
    texts = list(words)

    scatter = go.Scatter3d(
        x=vectors[:, 0],
        y=vectors[:, 1],
        z=vectors[:, 2],
        mode='markers+text',
        marker=dict(color=colors, size=sizes),
        text=texts
    )
    layout = go.Layout(height=800)
    fig = go.Figure(data=[scatter], layout=layout)
    fig.show()
