#!/usr/bin/env python3
"""Functions for fetching word frequency lists from Wiktionary.

Currently supported languages:
- English (Wikipedia 2016 frequency list)
- Spanish (Spanish Wikipedia frequency list)

Future languages to be added:
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
import time
from pathlib import Path
from typing import List, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Rate limiting parameters
REQUEST_DELAY = 0.1  # 100ms between requests to be nice to the API

def fetch_definitions_batch(words: List[str], language: str) -> dict[str, Optional[List[str]]]:
    """Fetch definitions for multiple words from Wiktionary using batch queries.
    
    Args:
        words: List of words to fetch definitions for
        language: Language code (e.g., "english", "spanish")
    
    Returns:
        Dictionary mapping words to their definitions (None if not found)
    """
    try:
        # Add delay for rate limiting
        time.sleep(REQUEST_DELAY)
        
        # Join words with | for batch query
        titles = '|'.join(words)
        
        params = {
            "action": "query",
            "titles": titles,
            "prop": "revisions",
            "rvprop": "content",
            "format": "json",
            "formatversion": "2",  # Use newer format
            "rvslots": "main"  # Required for newer format
        }

        response = requests.get(
            "https://en.wiktionary.org/w/api.php", params=params
        )
        response.raise_for_status()
        data = response.json()

        # Process batch response
        results = {}
        if "query" in data and "pages" in data["query"]:
            for page in data["query"]["pages"]:
                word = page["title"]
                if "missing" in page:
                    logging.debug(f"No content found for word: {word}")
                    results[word] = None
                    continue

                if "revisions" not in page:
                    logging.debug(f"No revisions found for word: {word}")
                    results[word] = None
                    continue

                content = page["revisions"][0]["slots"]["main"]["content"]
                
                # First check common words
                definitions = None
                if language.lower() == 'spanish':
                    common_meanings = {
                        'de': 'Of, from, or belonging to something or someone',
                        'en': 'In, on, or at a location or time',
                        'a': 'To, at, or towards a destination or recipient',
                        'por': 'For, by, or through something or someone',
                        'para': 'For, in order to, or intended for someone or something',
                        'con': 'With or along with someone or something',
                        'sin': 'Without or lacking something',
                        'que': 'That, which, or who; used to connect clauses or introduce subordinate clauses',
                        'y': 'And; used to connect words, phrases, clauses, or sentences',
                        'el': 'The; masculine singular definite article',
                        'la': 'The; feminine singular definite article',
                        'los': 'The; masculine plural definite article',
                        'las': 'The; feminine plural definite article',
                        'un': 'A or an; masculine singular indefinite article',
                        'una': 'A or an; feminine singular indefinite article',
                        'no': 'Not; used to express negation, denial, or refusal',
                        'sí': 'Yes; used to express affirmation or agreement',
                        'lo': 'The; neuter definite article used with adjectives',
                        'mi': 'My; first-person singular possessive adjective',
                        'tu': 'Your; second-person singular possessive adjective',
                        'su': 'His, her, its, or their; third-person possessive adjective'
                    }
                    if word.lower() in common_meanings:
                        definitions = [common_meanings[word.lower()]]
                elif language.lower() == 'english' and len(word) <= 3:
                    common_meanings = {
                        'the': 'The definite article used to indicate specific nouns',
                        'of': 'Expressing the relationship between a part and a whole',
                        'and': 'Used to connect words, phrases, clauses, or sentences',
                        'to': 'Expressing motion or direction toward a point',
                        'in': 'Located inside or within something',
                        'is': 'Third-person singular present of be',
                        'it': 'Third-person singular neuter pronoun',
                        'for': 'Intended to belong to or be used in connection with',
                        'as': 'Used for comparisons',
                        'on': 'Physically in contact with and supported by',
                        'at': 'Indicating location or position',
                        'by': 'Identifying the agent performing an action'
                    }
                    if word.lower() in common_meanings:
                        definitions = [common_meanings[word.lower()]]
                
                if not definitions:
                    # Find the language section
                    lang_title = language.title()
                    lang_pattern = rf"={{{2,3}}}\s*{lang_title}\s*={{{2,3}}}"
                    lang_sections = re.split(lang_pattern, content)
                    
                    if len(lang_sections) < 2:
                        logging.debug(f"No {language} section found for word: {word}")
                        results[word] = None
                        continue
                    
                    # Get content up to next language section
                    lang_content = lang_sections[1]
                    next_lang = re.search(r"={2,3}\s*[A-Z]", lang_content)
                    if next_lang:
                        lang_content = lang_content[:next_lang.start()]
                    
                    # Extract definitions
                    definitions = []
                    
                    # Look for definitions in various formats
                    def_patterns = [
                        r"# ([^\n]+)",  # Numbered definitions
                        r"\* ([^\n]+)",  # Bullet points
                        r"\{\{lb\|[^}]+\}\}\s*([^\n]+)",  # Label templates
                        r"\{\{def\|([^}]+)\}\}",  # Definition templates
                        r"\{\{gloss\|([^}]+)\}\}",  # Gloss templates
                        r"\{\{sense\|([^}]+)\}\}",  # Sense templates
                    ]
                    
                    for pattern in def_patterns:
                        matches = re.finditer(pattern, lang_content)
                        for match in matches:
                            definition = match.group(1).strip()
                            # Clean up wiki markup
                            definition = re.sub(r"\{\{[^}]+\}\}", "", definition)
                            definition = re.sub(r"\[\[([^]|]+\|)?([^]]+)\]\]", r"\2", definition)
                            definition = re.sub(r"''([^']+)''", r"\1", definition)
                            definition = re.sub(r"#\s*", "", definition)  # Remove list markers
                            
                            if definition and len(definition) >= 10:
                                definitions.append(definition)
                                if len(definitions) >= 3:
                                    break
                        if definitions:
                            break
                
                results[word] = definitions if definitions else None

        return results

    except Exception as e:
        logging.error(f"Error fetching definitions batch: {str(e)}")
        return {}

def fetch_wiktionary_words(
    language: str,
    config: dict,
    num_words: int,
) -> Optional[List[Tuple[str, Optional[str]]]]:
    """Fetch word frequency list and definitions from Wiktionary.

    Args:
        language: Language name (e.g., "english")
        config: Language configuration containing pages and sections
        num_words: Maximum number of words to fetch

    Returns:
        List of (word, definition) tuples, or None if fetch fails
    """
    try:
        all_words = []
        seen_words = set()  # Track unique words across all pages

        # Handle both single page_path and multiple pages configurations
        pages = config.get("pages", [config.get("page_path")])
        sections = config.get("sections", [])

        for page in pages:
            if len(all_words) >= num_words:
                break

            for section in sections:
                params = {
                    "action": "parse",
                    "page": page,
                    "section": section,
                    "format": "json",
                    "prop": "text",
                }

                response = requests.get(
                    "https://en.wiktionary.org/w/api.php", params=params
                )
                response.raise_for_status()
                data = response.json()

                if "parse" not in data:
                    logging.error(
                        f"No content found in {language} frequency list "
                        f"page {page} section {section}"
                    )
                    continue

                # Extract words from the HTML content
                html_content = data["parse"]["text"]["*"]

                # Extract words from links (format: <a title="word">word</a>)
                word_pattern = r'<a[^>]+?title="([^"#]+)(?:#[^"]*)?">([^<]+)</a>'
                for match in re.finditer(word_pattern, html_content):
                    title, word = match.groups()
                    # Skip disambiguation pages by only using exact matches
                    if word == title:
                        # Check word validity: non-empty, >1 char, no digits
                        has_digits = any(c.isdigit() for c in word)
                        if word and len(word) > 1 and not has_digits:
                            if word not in seen_words:
                                seen_words.add(word)
                                # Collect words for batch processing
                                all_words.append((word, None))
                                if len(all_words) >= num_words:
                                    break

                if len(all_words) >= num_words:
                    break

        if all_words:
            # Process words in batches
            batch_size = 50  # Maximum titles per request
            processed_words = []
            
            for i in range(0, len(all_words), batch_size):
                batch = all_words[i:i + batch_size]
                batch_words = [word for word, _ in batch]
                
                # Fetch definitions for the batch
                definitions = fetch_definitions_batch(batch_words, language)
                
                # Update words with their definitions
                for word, _ in batch:
                    definition = definitions.get(word)
                    processed_words.append((word, definition))
            
            all_words = processed_words[:num_words]

        if not all_words:
            logging.error(f"No words found in {language} frequency list")
            return None

        return all_words[:num_words]

    except Exception as e:
        logging.error(f"Error fetching {language} frequency list: {str(e)}")
        return None


def save_wordlist(words: List[Tuple[str, Optional[str]]], language: str) -> bool:
    """Save word list to a file.

    Args:
        words: List of (word, definition) tuples to save
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
            for word, definitions in words:
                if definitions:
                    definition_str = ' | '.join(definitions)
                    f.write(f"{word}\t{definition_str}\n")
                else:
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
        "-n",
        "--num-words",
        type=int,
        default=10000,
        help="Number of words to fetch (default: 10000)",
    )
    parser.add_argument(
        "-l",
        "--language",
        type=str,
        choices=["english", "spanish", "french", "german", "italian"],
        default="english",
        help="Language to fetch (default: english)",
    )
    args = parser.parse_args()

    # Language configurations
    # Comment out languages you don't want to use locally
    configs = {
        "english": {
            "page_path": "Wiktionary:Frequency_lists/English/Wikipedia_(2016)",
            # Sections 1-1000 through 9001-10000
            "sections": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        "spanish": {
            # Spanish frequency lists in 1000-word segments
            "pages": [
                "Wiktionary:Frequency_lists/Spanish1000",  # 1-1000
                "Wiktionary:Frequency_lists/Spanish1001-2000",  # 1001-2000
                "Wiktionary:Frequency_lists/Spanish2001-3000",  # 2001-3000
                "Wiktionary:Frequency_lists/Spanish3001-4000",  # 3001-4000
                "Wiktionary:Frequency_lists/Spanish4001-5000",  # 4001-5000
                "Wiktionary:Frequency_lists/Spanish5001-6000",  # 5001-6000
                "Wiktionary:Frequency_lists/Spanish6001-7000",  # 6001-7000
                "Wiktionary:Frequency_lists/Spanish7001-8000",  # 7001-8000
                "Wiktionary:Frequency_lists/Spanish8001-9000",  # 8001-9000
                "Wiktionary:Frequency_lists/Spanish9001-10000",  # 9001-10000
            ],
            "sections": ["0"],  # Main section containing the word list
        },
        "french": {
            "page_path": (
                "Wiktionary:Frequency_lists/French_wordlist_opensubtitles_5000"
            ),
            "sections": ["0"],  # Main section containing the word list
        },
        "german": {
            "page_path": "Wiktionary:Frequency_lists/German/Mixed_web_3M",
            # Sections 1-10 correspond to ranges 1-1000 through 9001-10000
            "sections": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
        "italian": {
            "page_path": "Wiktionary:Frequency_lists/Italian50k",
            "sections": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
        },
    }

    language = args.language
    config = configs[language]

    logging.info(f"Fetching {language} frequency list...")
    words = fetch_wiktionary_words(language, config, args.num_words)

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
