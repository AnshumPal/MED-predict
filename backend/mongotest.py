from pymongo import MongoClient

try:
    client = MongoClient("mongodb://localhost:27017")
    db = client["Project-MED"]
    print("✅ MongoDB Connection Successful:", db.list_collection_names())
except Exception as err:
    print("❌ MongoDB Connection Failed:", err)
