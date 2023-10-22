# Embeddings Dictionary
An embeddings dictionary that shows the position in embedding space relative to some synonyms/antonyms instead of a definition.

## Instructions
1. Ensure you have Python 3 installed.
2. Install the required packages by running `pip install -r requirements.txt`.
3. Set the `OPENAI_API_KEY` environment variable to your OpenAI API key.
4. Run the main script with your desired word(s) as arguments, e.g., `python3 main.py word1 word2`.

### Optional Flags
- `--oxford`: Include the Oxford 3000 words in the visualization.
- `--related`: Set the number of related words to display (default is 10).

Example usage: `python3 main.py word1 word2 --oxford --related 5`

## Web Client
1. Follow the instructions 1-3 above.
2. To start the web server, run `python3 backend.app`.
3. Content is served to localhost:5000
