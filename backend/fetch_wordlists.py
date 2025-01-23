#!/usr/bin/env python3
"""Script to fetch and process word lists for multiple languages.
Primary source: Wiktionary frequency lists
Backup: NLTK corpus
"""

import sys
import logging
import requests
import time
from pathlib import Path
from typing import Dict, List, Optional, Set

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Language configurations with Wiktionary language codes
LANGUAGES = {
    "en": {"name": "English", "wiktionary": "English"},
    "es": {"name": "Spanish", "wiktionary": "Spanish"},
    "fr": {"name": "French", "wiktionary": "French"},
    "de": {"name": "German", "wiktionary": "German"},
    "it": {"name": "Italian", "wiktionary": "Italian"},
    "pt": {"name": "Portuguese", "wiktionary": "Portuguese"},
    "ru": {"name": "Russian", "wiktionary": "Russian"},
    "zh": {"name": "Chinese", "wiktionary": "Mandarin"},
    "ja": {"name": "Japanese", "wiktionary": "Japanese"},
    "ko": {"name": "Korean", "wiktionary": "Korean"},
    "ar": {"name": "Arabic", "wiktionary": "Arabic"},
    "vi": {"name": "Vietnamese", "wiktionary": "Vietnamese"},
}

WIKTIONARY_API_URL = "https://en.wiktionary.org/w/api.php"

def fetch_wiktionary_words(lang_code: str, lang_info: Dict, target_words: int) -> Optional[List[str]]:
    """Fetch words from Wiktionary for a given language using the API."""
    words: Set[str] = set()
    continue_param = None
    
    while len(words) < target_words:
        params = {
            "action": "query",
            "format": "json",
            "list": "categorymembers",
            "cmtitle": f"Category:{lang_info['wiktionary']}_lemmas",
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
            logging.error(
                f"Error fetching {lang_info['name']} words from Wiktionary: {str(e)}"
            )
            return None
            
    return list(words)[:target_words]

def save_wordlist(words: List[str], lang_code: str) -> bool:
    """Save processed words to a file in the wordlists directory."""
    try:
        wordlists_dir = Path(__file__).parent / "wordlists"
        wordlists_dir.mkdir(exist_ok=True)
        
        output_file = wordlists_dir / f"{lang_code}.txt"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"# {LANGUAGES[lang_code]['name']} word list\n")
            for word in words:
                f.write(f"{word}\n")
        return True
    except Exception as e:
        logging.error(f"Error saving {lang_code} wordlist: {str(e)}")
        return False

def main():
    """Main function to fetch and process word lists for all languages."""
    import argparse
    parser = argparse.ArgumentParser(description="Fetch word lists from Wiktionary")
    parser.add_argument("-n", "--num-words", type=int, default=100,
                      help="Number of words to fetch per language (default: 100)")
    args = parser.parse_args()
    
    success_count = 0
    
    for lang_code, lang_info in LANGUAGES.items():
        logging.info(f"Processing {lang_info['name']}...")
        
        # Try Wiktionary
        words = fetch_wiktionary_words(lang_code, lang_info, args.num_words)
        
        if words and len(words) >= args.num_words:
            if save_wordlist(words, lang_code):
                success_count += 1
                logging.info(f"Successfully processed {lang_info['name']}")
            else:
                logging.error(f"Failed to save {lang_info['name']} wordlist")
        else:
            logging.error(f"Failed to fetch {lang_info['name']} words from Wiktionary")
            # TODO: Implement NLTK fallback if needed
    
    logging.info(
        f"Completed processing {success_count} out of {len(LANGUAGES)} languages"
    )
    return 0 if success_count == len(LANGUAGES) else 1

if __name__ == "__main__":
    sys.exit(main())
