import time
from backend.lib.oxford_3000 import get_oxford_3000

def test_oxford_3000_length_and_cache():
    words = get_oxford_3000()
    assert 3000 < len(words) < 4000

