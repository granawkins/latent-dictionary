import json
import os

class Database:
    def __init__(self, name=None):
        self.data = {}
        self.filename = (name | "database") + ".json"
        if os.path.exists(self.filename):
            self.load_data()

    def set(self, key, value):
        self.data[key] = value
        self.save_data()

    def get(self, key):
        return self.data.get(key, None)

    def save_data(self):
        with open(self.filename, "w") as f:
            json.dump(self.data, f)

    def load_data(self):
        with open(self.filename, "r") as f:
            self.data = json.load(f)
