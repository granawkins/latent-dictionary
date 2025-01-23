#!/usr/bin/env python3
"""Script to fetch Vietnamese words from Wiktionary."""

import logging
import requests
import time
from pathlib import Path
from typing import List, Optional, Set

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

WIKTIONARY_API_URL = "https://en.wiktionary.org/w/api.php"
TARGET_WORDS = 10000

def fetch_vietnamese_words() -> Optional[List[str]]:
    """Fetch Vietnamese words from Wiktionary."""
    words: Set[str] = set()
    continue_param = None
    
    while len(words) < TARGET_WORDS:
        params = {
            "action": "query",
            "format": "json",
            "list": "categorymembers",
            "cmtitle": "Category:Vietnamese_lemmas",
            "cmlimit": 500,
            "cmprop": "title"
        }
        
        if continue_param:
            params["cmcontinue"] = continue_param
            
        try:
            response = requests.get(WIKTIONARY_API_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Extract words from response
            for item in data["query"]["categorymembers"]:
                word = item["title"].split(":")[-1].strip()
                if word and len(word) > 1:  # Skip single characters
                    words.add(word)
            
            # Check if there are more results
            if "continue" in data:
                continue_param = data["continue"]["cmcontinue"]
                time.sleep(1)  # Be nice to the API
            else:
                break
                
        except Exception as e:
            logging.error(f"Error fetching Vietnamese words: {str(e)}")
            return None
            
    return list(words)[:TARGET_WORDS]

def save_wordlist(words: List[str]) -> bool:
    """Save Vietnamese words to a file."""
    try:
        wordlists_dir = Path(__file__).parent / "wordlists"
        wordlists_dir.mkdir(exist_ok=True)
        
        output_file = wordlists_dir / "vi.txt"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("# Vietnamese word list\n")
            for word in words:
                f.write(f"{word}\n")
        return True
    except Exception as e:
        logging.error(f"Error saving Vietnamese wordlist: {str(e)}")
        return False

def main():
    """Main function to fetch and save Vietnamese words."""
    logging.info("Processing Vietnamese...")
    
    words = fetch_vietnamese_words()
    
    if words and len(words) >= TARGET_WORDS:
        if save_wordlist(words):
            logging.info("Successfully processed Vietnamese")
            return 0
        else:
            logging.error("Failed to save Vietnamese wordlist")
    else:
        logging.error("Failed to fetch Vietnamese words")
    
    return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
