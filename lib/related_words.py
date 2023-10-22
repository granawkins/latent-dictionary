import requests
import random
from concurrent.futures import ThreadPoolExecutor


def get_related_words(
    word: str, 
    num: int = 3, 
    sample_size: int = 2
):

    base_url = "https://api.datamuse.com/words"
    def fetch_words(relation, query, limit=num):
        params = {relation: query, "max": limit}
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            return [item['word'] for item in response.json()]
        return []

    # Determine sample_size based on desired num to ensure a large enough 
    # pool for random sampling, derived from the quadratic relation between 
    # sample size and the number of results.
    sample_size = max(2, int((num/6)**0.5))
    # There aren't always enough for each feature, so we double it
    sample_size *= 2

    # Get context words for the given word
    features = ['rel_trg', 'rel_syn', 'rel_ant']  # Trigger words, synonyms, and antonyms
    context = []
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(fetch_words, feature, word, sample_size) for feature in features]
        for future in futures:
            context.extend(future.result())
    
    # Get synonyms for those context words
    synonyms = []
    with ThreadPoolExecutor(max_workers=len(context)) as executor:
        futures = [executor.submit(fetch_words, 'rel_syn', term, sample_size) for term in context]
        for future in futures:
            synonyms.extend(future.result())

    sample_from = context + synonyms
    if len(sample_from) < num:
        print(f"Warning: Not enough related words found for {word}.")
        return sample_from
    return random.sample(sample_from, num)
