import time
from lib.oxford_3000 import oxford_3000

def test_oxford_3000_length_and_cache():
    words = oxford_3000()
    assert 3000 < len(words) < 4000

