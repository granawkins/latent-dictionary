import os
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from sklearn.decomposition import PCA

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


@app.get("/api/search")
async def search(word: str, l1: str, l2: Optional[str], words_per_l=20):
    # Get embeddings
    l1_records = collection.query(
        word,
        where={"language": l1},
        n_results=words_per_l,
        include=["embeddings"],
    )
    words = l1_records["documents"]
    embeddings = l1_records["embeddings"]
    languages = [l1] * len(l1_records)
    if l2:
        l2_records = collection.query(
            word,
            where={"language": l2},
            n_results=words_per_l,
            include=["embeddings"],
        )
        words = l2_records["documents"]
        embeddings = l2_records["embeddings"]
        languages = [l2] * len(l2_records)
    
    # Transform to coordiantes
    pca = PCA(n_components=3)
    pca.fit(embeddings)
    coordinates = pca.transform(embeddings)
    return [
        {"word": word, "language": language, "x": c[0], "y": c[1], "z": c[2]}
        for word, language, c in zip(words, languages, coordinates)
    ]


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
