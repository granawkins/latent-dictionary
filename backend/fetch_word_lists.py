import os
import nltk
from nltk.corpus import words

nltk.download('words')

languages = ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'dutch', 'russian', 'chinese', 'japanese']
word_count = 10000
output_dir = 'wordlist'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for lang in languages:
    word_list = words.words(lang)[:word_count]
    with open(os.path.join(output_dir, f'{lang}.txt'), 'w') as f:
        for word in word_list:
            f.write(f"{word}\n")