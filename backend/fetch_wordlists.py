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
from typing import List, Optional, Dict, Tuple

# Configure logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Rate limiting parameters
REQUEST_DELAY = 0.1  # 100ms between requests to be nice to the API

def fetch_definition(word: str, language: str) -> Optional[str]:
    """Fetch definition for a word from Wiktionary.
    
    Args:
        word: Word to fetch definition for
        language: Language code (e.g., "english", "spanish")
    
    Returns:
        Definition string or None if not found
    """
    try:
        # Add delay for rate limiting
        time.sleep(REQUEST_DELAY)
        
        params = {
            "action": "parse",
            "page": word,
            "format": "json",
            "prop": "text",
        }

        response = requests.get(
            "https://en.wiktionary.org/w/api.php", params=params
        )
        response.raise_for_status()
        data = response.json()

        if "parse" not in data:
            logging.debug(f"No content found for word: {word}")
            return None

        html_content = data["parse"]["text"]["*"]
        
        # Find the language section using a more flexible pattern
        lang_title = language.title()
        lang_patterns = [
            f'<h2><span class="mw-headline" id="{lang_title}">',
            f'<h2 id="{lang_title}">',
            f'class="mw-headline" id="{lang_title}"'
        ]
        
        lang_content = None
        for pattern in lang_patterns:
            sections = html_content.split(pattern)
            if len(sections) > 1:
                lang_content = sections[1]
                break
        
        if not lang_content:
            logging.debug(f"No {language} section found for word: {word}")
            return None
        
        # Find the end of the language section (next h2 heading)
        next_lang = re.search(r'<h2[^>]*>', lang_content)
        if next_lang:
            lang_content = lang_content[:next_lang.start()]
        
        # Special handling for Spanish common words
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
                meaning = common_meanings[word.lower()]
                return [meaning] if isinstance(meaning, str) else meaning

        # Special handling for English common words
        if language.lower() == 'english' and len(word) <= 3:
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
                meaning = common_meanings[word.lower()]
                return [meaning] if isinstance(meaning, str) else meaning

        # Look for definitions section
        def_section = None
        
        # Try to find the section with definitions
        section_titles = ['Article', 'Noun', 'Verb', 'Adjective', 'Adverb', 'Preposition', 'Conjunction', 'Particle']
        section_matches = re.finditer(r'<h[34][^>]*>(?:<span[^>]*>)?([^<]+)', lang_content)
        
        for match in section_matches:
            section_title = match.group(1)
            if any(title in section_title for title in section_titles):
                section_start = match.end()
                next_section = re.search(r'<h[234][^>]*>', lang_content[section_start:])
                if next_section:
                    def_section = lang_content[section_start:section_start + next_section.start()]
                else:
                    def_section = lang_content[section_start:]
                break
        
        # If no definition section found in headers, try looking for definition lists
        if not def_section:
            dl_match = re.search(r'<dl>(.+?)</dl>', lang_content, re.DOTALL)
            if dl_match:
                def_section = dl_match.group(1)
        
        if not def_section:
            logging.debug(f"No definition section found for word: {word}")
            return None
        
        # Look for numbered definitions
        definitions = []
        
        # First try to find definitions in ordered lists
        ol_sections = re.finditer(r'<ol[^>]*>(.+?)</ol>', def_section, re.DOTALL)
        for ol in ol_sections:
            ol_content = ol.group(1)
            def_items = re.findall(r'<li[^>]*>(.+?)</li>', ol_content, re.DOTALL)
            
            for item in def_items:
                # Remove citations, examples, and nested content
                clean_def = re.sub(r'<ul>.+?</ul>', '', item, flags=re.DOTALL)
                clean_def = re.sub(r'<dl>.+?</dl>', '', clean_def, flags=re.DOTALL)
                clean_def = re.sub(r'\[\[.+?\]\]', '', clean_def)
                clean_def = re.sub(r'\[.+?\]', '', clean_def)
                
                # Remove HTML tags but keep their text content
                clean_def = re.sub(r'<[^>]+>', '', clean_def)
                
                # Remove dates, citations, and parenthetical notes
                clean_def = re.sub(r'\[from \d+(?:th|st|nd|rd) c\.\]', '', clean_def)
                clean_def = re.sub(r'\d{4}.*?:', '', clean_def)
                clean_def = re.sub(r'\([^)]*(?:obsolete|dialectal|archaic|dated|rare|informal)[^)]*\)', '', clean_def)
                
                # Clean up HTML entities
                clean_def = clean_def.replace('&nbsp;', ' ')
                clean_def = clean_def.replace('&#32;', ' ')
                clean_def = clean_def.replace('&#59;', ';')
                clean_def = clean_def.replace('&#58;', ':')
                
                # Clean up whitespace and dots
                clean_def = re.sub(r'\s+', ' ', clean_def)
                clean_def = re.sub(r'\.{2,}', '.', clean_def)
                clean_def = clean_def.strip(' .,')
                
                # Skip if empty or starts with unwanted prefixes
                if not clean_def or clean_def.startswith('...') or any(clean_def.lower().startswith(x) for x in [
                    '(', 'alternative', 'misspelling', 'present', 'past', 'obsolete',
                    'archaic', 'dated', 'rare', 'informal', 'plural', 'singular',
                    'countable', 'uncountable', 'transitive', 'intransitive',
                    'see also', 'compare', 'often', 'usually', 'especially'
                ]):
                    continue
                
                # Skip if it's too short or looks like an example
                if len(clean_def) < 10 or ': ' in clean_def or clean_def.startswith('"') or clean_def.startswith("'"):
                    continue
                
                # Extract meaningful sentences
                sentences = []
                for sentence in re.split(r'[.!?](?:\s|$)', clean_def):
                    sentence = sentence.strip()
                    if not (sentence and len(sentence) >= 10):
                        continue
                    if sentence.startswith('...'):
                        continue

                    # Remove grammatical notes at start of sentence
                    grammar_prefixes = (
                        'of|in|on|with|by|for|to|at|from|about|like|used|being|having'
                    )
                    sentence = re.sub(
                        f'^(?:{grammar_prefixes})\\s+',
                        '',
                        sentence,
                        flags=re.IGNORECASE
                    )

                    # Remove articles at start
                    sentence = re.sub(
                        r'^(?:a|an|the)\s+',
                        '',
                        sentence,
                        flags=re.IGNORECASE
                    )
                    
                    if not (sentence and len(sentence) >= 10):
                        continue

                    # Remove examples and parenthetical notes
                    sentence = sentence.split(';')[0]  # Before first semicolon
                    sentence = re.sub(r'\s*\([^)]*\)', '', sentence)  # No parentheses
                    sentence = sentence.strip()
                    
                    # Skip if it looks like a usage note, example, or letter name
                    skip_phrases = [
                        'example', 'see also', 'compare', 'often used',
                        'usually', 'especially', 'note:', 'e.g.', 'i.e.',
                        'name of', 'letter', 'alphabet', 'pronunciation',
                        'spelling', 'variant of', 'alternative form',
                        'abbreviation', 'initialism', 'acronym'
                    ]
                    
                    if any(x in sentence.lower() for x in skip_phrases):
                        continue

                    # Clean up the sentence
                    sentence = re.sub(r'\s*\[[^\]]*\]', '', sentence)  # No brackets
                    sentence = re.sub(r'\s+', ' ', sentence)  # Clean whitespace
                    sentence = sentence.strip()
                    
                    # For Spanish words, look for translations and glosses
                    if language.lower() == 'spanish':
                        translation = None
                        # Look for quoted translations
                        if '"' in sentence:
                            translations = re.findall(r'"([^"]+)"', sentence)
                            if translations:
                                translation = translations[0].strip()
                        # Look for translations after ":" or "="
                        if not translation:
                            delimiters = [':', '=']
                            if any(x in sentence for x in delimiters):
                                parts = re.split(r'[:=]', sentence)
                                if len(parts) > 1:
                                    translation = parts[1].strip(' "\'')
                        # Look for glosses in parentheses
                        if not translation:
                            glosses = re.findall(r'\(([^)]+)\)', sentence)
                            if glosses:
                                translation = glosses[0].strip()
                        
                        if translation:
                            sentence = translation
                    
                    # Special handling for prepositions
                    prepositions = ['de', 'en', 'a', 'por', 'para', 'con', 'sin']
                    if word.lower() in prepositions:
                        preposition_meanings = {
                            'de': 'Of, from, belonging to',
                            'en': 'In, on, at',
                            'a': 'To, at, towards',
                            'por': 'For, by, through',
                            'para': 'For, in order to, towards',
                            'con': 'With, along with',
                            'sin': 'Without, lacking'
                        }
                        sentence = preposition_meanings.get(word.lower(), sentence)
                    
                    # Skip if it's too generic or too specific
                    is_normal_case = (
                        len(sentence) >= 15 and
                        len(sentence.split()) >= 3
                    )
                    is_preposition = word.lower() in prepositions
                    unwanted_starts = ('name of', 'form of', 'alternative', 'short for')

                    if (sentence and
                            (is_normal_case or is_preposition) and
                            not sentence.lower().startswith(unwanted_starts)):
                        sentences.append(sentence)
                
                if sentences:
                    clean_def = sentences[0]  # Take first good sentence
                    # Capitalize first letter
                    clean_def = clean_def[0].upper() + clean_def[1:]
                    # Remove trailing punctuation
                    clean_def = clean_def.rstrip('.,;')
                    
                    # Final length and quality check
                    bad_words = ['letter', 'alphabet', 'pronunciation']
                    is_good_length = (
                        len(clean_def) >= 15 and
                        len(clean_def.split()) > 3
                    )
                    has_bad_words = any(x in clean_def.lower() for x in bad_words)

                    if clean_def and is_good_length and not has_bad_words:
                        logging.debug(f"Found definition for {word}: {clean_def}")
                        definitions.append(clean_def)
                        if len(definitions) >= 3:  # Limit to first 3 definitions
                            break
            
            if definitions:
                break
        
        if not definitions:
            logging.debug(f"No definitions found in ordered lists for word: {word}")
            # Try alternative patterns if no definitions found in ordered lists
            def_patterns = [
                r'<dd[^>]*>([^<]+)</dd>',
                r'<li[^>]*>([^<]+)</li>'
            ]
            
            # Words to skip at start of definition
            skip_words = [
                '(', 'Alternative', 'Misspelling', 'present', 'past',
                'Obsolete', 'archaic', 'dated', 'rare', 'informal',
                'plural', 'singular', 'countable', 'uncountable',
                'transitive', 'intransitive'
            ]

            for pattern in def_patterns:
                def_items = re.findall(pattern, def_section)
                for item in def_items:
                    clean_def = re.sub(r'\s+', ' ', item).strip()
                    if (len(clean_def) >= 10 and
                            not any(clean_def.startswith(x) for x in skip_words)):
                        msg = f"Found alternative definition for {word}: {clean_def}"
                        logging.debug(msg)
                        definitions.append(clean_def)
                        if len(definitions) >= 3:
                            break
                if definitions:
                    break
        
        if not definitions:
            logging.debug(f"No definitions found for word: {word}")
            return None
            
        # Return first 3 definitions combined
        return ' | '.join(definitions[:3])

    except Exception as e:
        logging.debug(f"Error fetching definition for {word}: {str(e)}")
        return None

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
                                # Fetch definition for the word
                                definition = fetch_definition(word, language)
                                all_words.append((word, definition))
                                if len(all_words) >= num_words:
                                    break

                if len(all_words) >= num_words:
                    break

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
            for word, definition in words:
                if definition:
                    f.write(f"{word}\t{definition}\n")
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
