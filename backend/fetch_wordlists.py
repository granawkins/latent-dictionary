#!/usr/bin/env python3
"""Functions for fetching word frequency lists from Wiktionary.

Currently supported languages:
- English (Wikipedia 2016 frequency list)

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

def fetch_wiktionary_words(
    language: str,
    page_path: str,
    sections: List[str],
    num_words: int,
) -> Optional[List[str]]:
    """Fetch word frequency list from Wiktionary.
    
    Args:
        language: Language name (e.g., "english")
        page_path: Path to Wiktionary frequency list page
        sections: List of section numbers to fetch
        num_words: Maximum number of words to fetch
    
    Returns:
        List of words in frequency order, or None if fetch fails
    """
    try:
        all_words = []
        
        for section in sections:
            params = {
                "action": "parse",
                "page": page_path,
                "section": section,
                "format": "json",
                "prop": "text"
            }
            
            response = requests.get(
                "https://en.wiktionary.org/w/api.php",
                params=params
            )
            response.raise_for_status()
            data = response.json()
            
            if "parse" not in data:
                logging.error(
                    f"No content found in {language} frequency list section {section}"
                )
                continue
                
            # Extract words from the HTML content
            html_content = data["parse"]["text"]["*"]
            
            # Extract words from links (format: <a title="word">word</a>)
            word_pattern = (
                r'<a[^>]+?title="([^"#]+)(?:#[^"]*)?">([^<]+)</a>'
            )
            for match in re.finditer(word_pattern, html_content):
                title, word = match.groups()
                if word == title:  # Only use when title matches word (avoid disambiguation)
                    if word and len(word) > 1 and not any(c.isdigit() for c in word):
                        all_words.append(word)
                
        if not all_words:
            logging.error(f"No words found in {language} frequency list")
            return None
            
        return all_words[:num_words]
                
    except Exception as e:
        logging.error(f"Error fetching {language} frequency list: {str(e)}")
        return None

def save_wordlist(words: List[str], language: str) -> bool:
    """Save word list to a file.
    
    Args:
        words: List of words to save
        language: Language name (used for filename, e.g., "english.txt")
    
    Returns:
        True if save successful, False otherwise
    """
    try:
        wordlists_dir = Path(__file__).parent / "wordlists"
        wordlists_dir.mkdir(exist_ok=True)
        
        output_file = wordlists_dir / f"{language}.txt"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"# {language.title()} word list\n")
            for word in words:
                f.write(f"{word}\n")
        return True
    except Exception as e:
        logging.error(f"Error saving {language} word list: {str(e)}")
        return False

def main():
    """Fetch and save English frequency list."""
    import argparse
    parser = argparse.ArgumentParser(
        description="Fetch word frequency lists from Wiktionary"
    )
    parser.add_argument(
        "-n", "--num-words",
        type=int,
        default=10000,
        help="Number of words to fetch (default: 10000)"
    )
    args = parser.parse_args()
    
    # English Wikipedia frequency list
    language = "english"
    page_path = "Wiktionary:Frequency_lists/English/Wikipedia_(2016)"
    # Sections 1-1000 through 9001-10000
    sections = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
    
    logging.info(f"Fetching {language} frequency list...")
    words = fetch_wiktionary_words(language, page_path, sections, args.num_words)
    
    if words:
        if save_wordlist(words, language):
            logging.info(f"Successfully saved {len(words)} words")
            return 0
        else:
            logging.error(f"Failed to save {language} word list")
    else:
        logging.error(f"Failed to fetch {language} frequency list")
    
    return 1

if __name__ == "__main__":
    sys.exit(main())
