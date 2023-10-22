# Embeddings Dictionary
An embeddings dictionary that shows the position in embedding space relative to some synonyms/antonyms instead of a definition.

## Instructions
1. Ensure you have Python 3 installed.
2. Install the required packages by running `pip install -r requirements.txt`.
3. Set the `OPENAI_API_KEY` environment variable to your OpenAI API key.


### CLI Interface
After completing steps 1-3, change to the 'backend' directory and run e.g. `python3 main.py word1 word2`.

Optional Flags
- `--oxford`: Include the Oxford 3000 words in the visualization.
- `--related`: Set the number of related words to display (default is 10).
Example usage: `python3 main.py word1 word2 --oxford --related 5`

### Docker Interface
- Complete #3 in Instructions
- Start docker with `docker-compose up`
