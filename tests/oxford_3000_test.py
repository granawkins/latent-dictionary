import time
from lib.oxford_3000 import oxford_3000

def test_oxford_3000_length_and_cache():
    start_time = time.time()
    words = oxford_3000()
    first_call_duration = time.time() - start_time
    assert 3000 < len(words) < 4000

    start_time = time.time()
    words = oxford_3000()
    second_call_duration = time.time() - start_time
    assert second_call_duration < first_call_duration * 0.1
