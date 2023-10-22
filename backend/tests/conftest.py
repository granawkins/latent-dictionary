import pytest
from backend.lib.database import Database, DB_TABLES


@pytest.fixture
def mock_database(mocker):
    def _mock_database(name="temp"):
        temp_db = Database(name=name, tables=DB_TABLES)
        mocker.patch("lib.database.get_database", return_value=temp_db)
        return temp_db

    return _mock_database
