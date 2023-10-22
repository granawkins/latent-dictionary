import os
import json
from lib.database import Database

def test_database_set_get():
    db = Database(name="temp")
    key = "test_key"
    value = "test_value"
    db.set(key, value)
    assert db.get(key) == value
    os.remove(db.filename)

def test_database_save_load():
    db = Database()
    db = Database(name="temp")
    key = "test_key"
    value = "test_value"
    db.set(key, value)

    # Save the data to the file
    db.save_data()

    # Load the data from the file into a new database instance
    db2 = Database(name="temp")
    db2.load_data()
    assert db2.get(key) == value

    # Cleanup
    os.remove(db.filename)

    # Cleanup
    os.remove(db.filename)