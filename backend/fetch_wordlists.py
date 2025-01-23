#!/usr/bin/env python3
"""Script to fetch English word frequency list from Wiktionary.
Source: English Wikipedia (2016) frequency list
https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/English/Wikipedia_(2016)

Future languages to be added:
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- Vietnamese (vi)
"""

import sys
import logging
import requests
import re
from pathlib import Path
from typing import List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

WIKTIONARY_API_URL = "https://en.wiktionary.org/w/api.php"
FREQUENCY_LIST_PATH = "Wiktionary:Frequency_lists/English/Wikipedia_(2016)"
FREQUENCY_LIST_SECTION = "1"  # Section containing 1-1000

def fetch_frequency_list(target_words: int) -> Optional[List[str]]:
    """Fetch English frequency list from Wiktionary."""
    try:
        params = {
            "action": "parse",
            "page": FREQUENCY_LIST_PATH,
            "section": FREQUENCY_LIST_SECTION,
            "format": "json",
            "prop": "text"
        }
        
        response = requests.get(WIKTIONARY_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if "parse" not in data:
            logging.error("No content found in frequency list")
            return None
            
        # Extract words from the HTML content
        html_content = data["parse"]["text"]["*"]
        
        # Extract words from links (format: <a title="word">word</a>)
        words = []
        word_pattern = (
            r'<a[^>]+?title="([^"#]+)(?:#[^"]*)?">([^<]+)</a>'
        )
        for match in re.finditer(word_pattern, html_content):
            title, word = match.groups()
            if word == title:  # Only use when title matches word (avoid disambiguation)
                if word and len(word) > 1 and not any(c.isdigit() for c in word):
                    words.append(word)
                
        if not words:
            logging.error("No words found in frequency list")
            return None
            
        return words[:target_words]
                
    except Exception as e:
        logging.error(f"Error fetching frequency list: {str(e)}")
        return None

def save_wordlist(words: List[str]) -> bool:
    """Save English word list to a file."""
    try:
        wordlists_dir = Path(__file__).parent / "wordlists"
        wordlists_dir.mkdir(exist_ok=True)
        
        output_file = wordlists_dir / "en.txt"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("# English word list\n")
            for word in words:
                f.write(f"{word}\n")
        return True
    except Exception as e:
        logging.error(f"Error saving word list: {str(e)}")
        return False

def main():
    """Fetch and save English frequency list."""
    import argparse
    parser = argparse.ArgumentParser(
        description="Fetch English word frequency list from Wiktionary"
    )
    parser.add_argument(
        "-n", "--num-words",
        type=int,
        default=100,
        help="Number of words to fetch (default: 100)"
    )
    args = parser.parse_args()
    
    logging.info("Fetching English frequency list...")
    words = fetch_frequency_list(args.num_words)
    
    if words:
        if save_wordlist(words):
            logging.info(f"Successfully saved {len(words)} words")
            return 0
        else:
            logging.error("Failed to save word list")
    else:
        logging.error("Failed to fetch frequency list")
    
    return 1

if __name__ == "__main__":
    sys.exit(main())
