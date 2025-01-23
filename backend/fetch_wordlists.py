#!/usr/bin/env python3
"""Script to fetch and process word lists for multiple languages.
Primary source: Wiktionary frequency lists
"""

import sys
import logging
import requests
import re
from pathlib import Path
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# Language configurations with Wiktionary frequency list paths
LANGUAGES = {
    "en": {
        "name": "English",
        "freq_path": "Wiktionary:Frequency_lists/English/Wikipedia_(2016)",
        "section": "1"  # Section containing 1-1000
    }
}

WIKTIONARY_API_URL = "https://en.wiktionary.org/w/api.php"

def fetch_frequency_list(
    lang_code: str,
    lang_info: Dict,
    target_words: int,
) -> Optional[List[str]]:
    """Fetch frequency list from Wiktionary for a given language."""
    try:
        params = {
            "action": "parse",
            "page": lang_info["freq_path"],
            "section": lang_info.get("section", "0"),
            "format": "json",
            "prop": "text"
        }
        
        response = requests.get(WIKTIONARY_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if "parse" not in data:
            logging.error(f"No content found for {lang_info['name']} frequency list")
            return None
            
        # Extract words from the HTML content
        html_content = data["parse"]["text"]["*"]
        
        # Extract words from links in format:
        # <a href="/wiki/word#English" title="word">word</a>
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
            logging.error(f"No words found in {lang_info['name']} frequency list")
            return None
            
        return words[:target_words]
                
    except Exception as e:
        logging.error(
            f"Error fetching {lang_info['name']} frequency list: {str(e)}"
        )
        return None

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
        
        # Try Wiktionary frequency lists
        words = fetch_frequency_list(lang_code, lang_info, args.num_words)
        
        if words:
            if save_wordlist(words, lang_code):
                success_count += 1
                logging.info(
                    f"Successfully processed {lang_info['name']} "
                    f"({len(words)} words)"
                )
            else:
                logging.error(f"Failed to save {lang_info['name']} wordlist")
        else:
            logging.error(
                f"Failed to fetch {lang_info['name']} frequency list"
            )
    
    logging.info(
        f"Completed processing {success_count} out of {len(LANGUAGES)} languages"
    )
    return 0 if success_count > 0 else 1

if __name__ == "__main__":
    sys.exit(main())
