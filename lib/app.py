from flask import Flask, jsonify
from embeddings import get_embeddings
from oxford_3000 import oxford_3000
from related_words import get_related_words

app = Flask(__name__)

@app.route('/')
def index():
    return "Flask App is working properly!"

@app.route('/oxford_3000')
def get_oxford_3000():
    words = oxford_3000()
    embeddings = get_embeddings(words)
    result = {word: embedding for word, embedding in zip(words, embeddings)}
    return jsonify(result)

@app.route('/search/<word>')
def search(word):
    related_words = get_related_words(word)
    words = [word] + related_words
    embeddings = get_embeddings(words)
    result = {word: embedding for word, embedding in zip(words, embeddings)}
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
