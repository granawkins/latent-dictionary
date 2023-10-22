import requests

from database import get_database

# The Oxford 3000: "The 3000 most important words in the English language"
url = "https://raw.githubusercontent.com/sapbmw/The-Oxford-3000/master/The_Oxford_3000.txt"

def oxford_3000() -> list[str]:
    db = get_database()
    if not db.get("oxford_3000", "words"):
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error {response.status_code}: Unable to fetch data")
            return []
        lines = response.text.splitlines()
        words = [w.lower() for w in lines if w.isalpha()]
        db.set("oxford_3000", "words", words)
    return db.get("oxford_3000", "words")
