import json
import os
from typing import Any


class Database:
    def __init__(self, tables: list[str] = None, name = None):
        self.db_dir = os.path.dirname(os.path.abspath(__file__))
        self.filename = os.path.join(self.db_dir, f"{name or 'database'}.json")
        if os.path.exists(self.filename):
            self.load_data()
        elif tables is not None:
            self.data = {table: {} for table in tables}
        else:
            self.data = {}

    def set(self, table: str, key: str, value: Any):
        self.data[table][key] = value
        self.save_data()

    def get(self, table: str, key=None):
        if key is None:
            return self.data[table]
        return self.data[table].get(key, None)

    def exists(self, table: str, key: str) -> bool:
        return key in self.data[table]
    
    def batch_add(self, table: str, items: dict):
        self.data[table].update(items)
        self.save_data()
        
    def save_data(self):
        with open(self.filename, "w") as f:
            json.dump(self.data, f)

    def load_data(self):
        with open(self.filename, "r") as f:
            self.data = json.load(f)


DB_TABLES = ['oxford_3000', 'embeddings']

_database: Database | None = None
def get_database() -> Database:
    global _database
    if _database is None:
        _database = Database(tables=DB_TABLES)
    return _database
