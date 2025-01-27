#!/usr/bin/env python3

import os
import logging
import argparse
from fontTools.ttLib import TTFont
from fontTools.subset import main as subset

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def optimize_chinese_font(input_ttf, output_woff):
    """Create optimized WOFF font with only the characters used in the wordlist."""
    # Ensure we have the wordlist
    if not os.path.exists('wordlists/chinese.txt'):
        raise FileNotFoundError(
            "Chinese wordlist not found. Please run fetch_wordlists.py first: "
            "python3 fetch_wordlists.py --language=chinese"
        )

    # Read unique characters from wordlist
    with open('wordlists/chinese.txt', 'r') as f:
        chars = set(''.join(f.readlines()))

    # Write characters to a temporary file
    with open('chars.txt', 'w') as f:
        f.write('\n'.join(chars))

    # Create subset font
    subset([
        input_ttf,
        '--output-file=subset.ttf',
        '--text-file=chars.txt',
        '--layout-features=*',
        '--desubroutinize',
    ])

    # Convert to WOFF
    font = TTFont('subset.ttf')
    font.flavor = 'woff'
    font.save(output_woff)

    # Clean up temporary files
    os.remove('chars.txt')
    os.remove('subset.ttf')

    # Print size comparison
    original_size = os.path.getsize(input_ttf)
    optimized_size = os.path.getsize(output_woff)
    reduction = (1 - optimized_size / original_size) * 100

    logging.info(f"Font optimization complete:")
    logging.info(f"Original TTF: {original_size/1024/1024:.2f}MB")
    logging.info(f"Optimized WOFF: {optimized_size/1024/1024:.2f}MB")
    logging.info(f"Size reduction: {reduction:.1f}%")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Optimize Chinese font by subsetting and converting to WOFF')
    parser.add_argument('--input-ttf', type=str, required=True,
                      help='Input TTF font file')
    parser.add_argument('--output-woff', type=str, required=True,
                      help='Output WOFF font file')
    args = parser.parse_args()

    optimize_chinese_font(args.input_ttf, args.output_woff)