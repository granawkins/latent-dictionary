import os
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import numpy as np

from db import collection

# Server
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def pca(data: list[list[float]]) -> list[list[float]]:
    "Basic 3-dimensional Principal Component Analysis"
    # Reshape if we have a 3D array
    data = np.array(data)
    if len(data.shape) == 3:
        data = data.reshape(-1, data.shape[-1])  # Flatten to 2D: (batch*n_embeddings, embedding_dim)
    
    X = data - np.mean(data, axis=0)
    _, _, Vt = np.linalg.svd(X, full_matrices=False)
    coordinates = np.dot(X, Vt.T[:, :3])
    return coordinates

@app.post("/api/search")
async def search(request: Request):
    data = await request.json()
    word = data["word"]
    l1 = data["l1"]
    l2 = data["l2"]
    words_per_l = data["words_per_l"]
    # Get embeddings
    l1_records = collection.query(
        query_texts=[word],
        where={"language": l1},
        n_results=words_per_l,
        include=["embeddings", "documents"],
    )
    words = l1_records["documents"][0]
    embeddings = l1_records["embeddings"][0]
    languages = [l1] * len(words)
    if l2:
        l2_records = collection.query(
            word,
            where={"language": l2},
            n_results=words_per_l,
            include=["embeddings"],
        )
        words += l2_records["documents"][0]
        embeddings += l2_records["embeddings"][0]
        languages += [l2] * len(words)
    
    # Transform to coordinates
    coordinates = pca(embeddings)
    dots = []
    for word, language, c in zip(words, languages, list(coordinates)):
        dots.append({"word": word, "language": language, "x": float(c[0]), "y": float(c[1]), "z": float(c[2])})
    return dots

# Frontend
@app.get("/favicon.png")
async def favicon():
    return FileResponse("frontend/dist/favicon.png")


@app.get("/{full_path:path}")
async def serve_index(request: Request, full_path: str):
    public_file_path = os.path.join("../frontend/build", full_path)
    if os.path.exists(public_file_path) and os.path.isfile(public_file_path):
        return FileResponse(public_file_path)
    with open("../frontend/build/index.html") as file:
        return HTMLResponse(content=file.read())
