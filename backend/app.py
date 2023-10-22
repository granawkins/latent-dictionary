from flask import Flask, jsonify

from lib.embeddings import get_embeddings
from lib.oxford_3000 import get_oxford_3000
from lib.related_words import get_related_words
from lib.pca import get_pca, get_default_pca

app = Flask(__name__)

@app.route('/')
def index():
    return "Flask App is working properly!"

@app.route('/api/oxford_3000')
def oxford_3000():
    words = get_oxford_3000()
    embeddings = get_embeddings(words)
    pcas = get_default_pca(embeddings, 3)
    result = {word: list(pca) for word, pca in zip(words, pcas)}
    return jsonify(result)

@app.route('/api/search/<word>')
def search(word):
    related_words = get_related_words(word, 10)
    words = [word] + related_words
    embeddings = get_embeddings(words)
    pcas = get_pca(embeddings, 3)
    result = {word: list(pca) for word, pca in zip(words, pcas)}
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
