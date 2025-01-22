#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the script's directory
cd "$SCRIPT_DIR"

if [ -d ".venv" ]; then
    echo "Virtual environment exists, activating..."
else
    echo "Creating new virtual environment..."
    python3.12 -m venv .venv
fi
source .venv/bin/activate

echo "Installing/updating requirements..."
pip install -r requirements.txt

# Run db.py from the script's directory
python3 db.py
