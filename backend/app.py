from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from typing import Optional
import os

from word_vectors import get_coordinates, get_pca_id
from user_handler import UserHandler

# Load oxford words
with open("oxford_3000.txt") as f:
    oxford_3000 = [w.strip() for w in f.readlines()]

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

user_handler = UserHandler()


# Authentication dependency
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        token = authorization.split(" ")[1]
        data = user_handler.decode(token)
        user_id = data["user_id"]
        user = user_handler.get(user_id)
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


def validate_word(word: str):
    if not word:
        raise HTTPException(status_code=400, detail="Word must not be empty")
    if not word.isalpha():
        raise HTTPException(status_code=400, detail="Word must be alphabetic")
    if len(word) > 20:
        raise HTTPException(
            status_code=400, detail="Word must be less than 20 characters"
        )


_index_cache = None


@app.get("/api/index")
async def index(authorization: Optional[str] = Header(None)):
    global _index_cache
    try:
        token = None
        if authorization:
            token = authorization.split(" ")[1]
            data = user_handler.decode(token)
            user_id = data["user_id"]
            if user_handler.exists(user_id):
                token = None

        if not token:
            user_id, token = user_handler.create()

        if _index_cache is None:
            vectors = get_coordinates(oxford_3000, pca_id="default")
            _index_cache = {w: v for w, v in zip(oxford_3000, vectors)}

        return {"vectors": _index_cache, "pca_id": "default", "token": token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/search")
async def search(request: Request, user: dict = Depends(get_current_user)):
    try:
        for word in request.words:
            validate_word(word)

        vectors = get_coordinates(request.words, request.pca_id)
        vectors = {w: v for w, v in zip(request.words, vectors)}
        return {"vectors": vectors, "pca_id": request.pca_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/set_pca")
async def set_pca(request: Request, user: dict = Depends(get_current_user)):
    try:
        for word in request.words:
            validate_word(word)

        pca_id = "default" if request.reset else get_pca_id(request.words)
        corpus = list(set(oxford_3000 + request.search_history + request.words))
        vectors = get_coordinates(corpus, pca_id)
        vectors = {w: v for w, v in zip(corpus, vectors)}
        return {"vectors": vectors, "pca_id": pca_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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
