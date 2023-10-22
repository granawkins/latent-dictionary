import os
import json
from backend.lib.database import Database

def test_database_set_get():
    table = "test_table"
    key = "test_key"
    value = "test_value"
    db = Database(name="temp", tables=[table])
    db.set(table, key, value)
    assert db.get(table, key) == value
    os.remove(db.filename)

def test_database_save_load():
    table = "test_table"
    key = "test_key"
    value = "test_value"
    db = Database(name="temp", tables=[table])
    db.set(table, key, value)

    # Save the data to the file
    db.save_data()

    # Load the data from the file into a new database instance
    db2 = Database(name="temp")
    db2.load_data()
    assert db2.get(table, key) == value

    # Cleanup
    os.remove(db.filename)
