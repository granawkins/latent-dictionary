import argparse
from lib.oxford_3000 import oxford_3000
from lib.embeddings import get_embeddings
from lib.plot import visualize_embeddings
from lib.pca import get_default_pca, get_pca
from lib.related_words import get_related_words

def main():

    parser = argparse.ArgumentParser()
    parser.add_argument("--oxford", action="store_true", help="Enable the Oxford flag")
    parser.add_argument("--related", default=10, help="Number of related words")
    parser.add_argument("words", nargs="*", help="Words to process")
    args = parser.parse_args()

    words_input = args.words
    if len(words_input) < 1:
        print("Usage: python3 main.py word1 word2 word3 [--oxford]")
        return

    query = words_input[0]
    words_to_highlight = [query] + get_related_words(query, int(args.related))
    print('words_to_highlight', words_to_highlight)
    
    words = words_to_highlight
    if args.oxford:
        words = list(set(oxford_3000() + words_to_highlight))
    print(f"{len(words)} words {args.oxford and 'including Oxford 3000'}")
    
    embeddings = get_embeddings(words)
    print('Oxford 3000 embeddings, dim=', len(embeddings[0]))
    
    if args.oxford:
        pca_values = get_default_pca(embeddings)
    else:
        pca_values = get_pca(embeddings)
    pca_map = {word: value for word, value in zip(words, pca_values)}
    print('pca_map', len(pca_map))
    
    visualize_embeddings(pca_map, words_to_highlight)

if __name__ == "__main__":
    main()
