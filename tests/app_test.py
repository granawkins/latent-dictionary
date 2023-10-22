import pytest
from lib.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_oxford_3000(client):
    response = client.get('/oxford_3000')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0

def test_search(client):
    response = client.get('/search/hello')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) > 0
    assert "hello" in data
