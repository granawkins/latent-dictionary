import os
from typing import Union, List, Dict, Any, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
import numpy as np
from chromadb.api.types import Include, Embeddings

from db import collection

# Define valid include parameters
EMBEDDINGS_AND_DOCUMENTS: Include = ["embeddings", "documents"]  # type: ignore
DOCUMENTS_AND_METADATAS: Include = ["documents", "metadatas"]  # type: ignore

# Server
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def pca(data: Embeddings) -> Embeddings:
    "Basic 3-dimensional Principal Component Analysis"
    # Convert input to numpy array
    data_array = np.array(data, dtype=np.float64)
    
    # Reshape if we have a 3D array
    if len(data_array.shape) == 3:
        # Flatten to 2D: (batch*n_embeddings, embedding_dim)
        data_array = data_array.reshape(-1, data_array.shape[-1])
    
    X = data_array - np.mean(data_array, axis=0)
    _, _, Vt = np.linalg.svd(X, full_matrices=False)
    coordinates = np.dot(X, Vt.T[:, :3])
    return coordinates.tolist()

@app.post("/api/search")
async def search(request: Request) -> List[Dict[str, Any]]:
    data = await request.json()
    word: str = data["word"]
    l1: str = data["l1"]
    l2: Optional[str] = data["l2"]
    words_per_l: int = data["words_per_l"]
    # Get embeddings
    include: Include = EMBEDDINGS_AND_DOCUMENTS
    l1_records = collection.query(
        query_texts=[word],
        where={"language": l1},
        n_results=words_per_l,
        include=include,
    )
    l1_docs = l1_records.get("documents", [[]])
    l1_embeddings = l1_records.get("embeddings", [[]])
    
    if not l1_docs or not l1_embeddings:
        return []
        
    words = l1_docs[0]
    embeddings = l1_embeddings[0]
    languages = [l1] * len(words)
    
    if l2:
        include_l2: Include = EMBEDDINGS_AND_DOCUMENTS
        l2_records = collection.query(
            query_texts=[word],
            where={"language": l2},
            n_results=words_per_l,
            include=include_l2,
        )
        l2_docs = l2_records.get("documents", [[]])
        l2_embeddings = l2_records.get("embeddings", [[]])
        
        if l2_docs and l2_embeddings:
            words.extend(l2_docs[0])
            embeddings.extend(l2_embeddings[0])
            languages.extend([l2] * len(l2_docs[0]))
    
    # Transform to coordinates
    coordinates = pca(embeddings)
    dots = []
    for word, language, c in zip(words, languages, list(coordinates)):
        dots.append({
            "word": word,
            "language": language,
            "x": float(c[0]),
            "y": float(c[1]),
            "z": float(c[2])
        })
    return dots

# Frontend
@app.get("/favicon.png")
async def favicon():
    return FileResponse("frontend/dist/favicon.png")


@app.get("/{full_path:path}")
async def serve_index(request: Request, full_path: str):
    public_file_path = os.path.join("../frontend/dist", full_path)
    if os.path.exists(public_file_path) and os.path.isfile(public_file_path):
        return FileResponse(public_file_path)
    with open("../frontend/dist/index.html") as file:
        return HTMLResponse(content=file.read())
