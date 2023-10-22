import requests


# The Oxford 3000: "The 3000 most important words in the English language"
url = "https://raw.githubusercontent.com/sapbmw/The-Oxford-3000/master/The_Oxford_3000.txt"
_cache: list[str] | None = None

def oxford_3000() -> list[str]:
    global _cache
    if _cache is None:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Error {response.status_code}: Unable to fetch data")
            return []
        lines = response.text.splitlines()
        _cache = [s.lower() for s in lines if s.isalpha()]
    return _cache
