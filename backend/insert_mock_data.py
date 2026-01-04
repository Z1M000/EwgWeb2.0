from dotenv import load_dotenv
import os
import uuid
from pymongo import MongoClient

load_dotenv()

# 1) read env
uri = os.getenv("DB_URI")
if not uri:
    raise ValueError("DB_URI not found. Put DB_URI=... in your .env")

# 2) connect db
client = MongoClient(uri)  # cluster
db = client["2025Fall"]
prizes_col = db["Prizes"]
activities_col = db["Activities"]

# 3) mock data (Python lists/dicts)
prizes = [
  {"points": 150, "label": "Sticker Pack"},
  {"points": 425, "label": "Team Hat"},
  {"points": 1150, "label": "Team Hoodie"},
]

activities = [
  {"activity": "World champion", "points": 400, "date": "2025/11/16"},
  {"activity": "Team Win", "points": 100, "date": "2025/11/15"},
  {"activity": "Play day goal", "points": 20, "date": "2025/11/04"},
  {"activity": "Team Tournament Goal", "points": 25, "date": "2025/11/04"},
  {"activity": "Close-out Drills", "points": 10, "date": "2025/11/03"},
  {"activity": "Community Service", "points": 50, "date": "2025/11/01"},
  {"activity": "Close-out Drills", "points": 10, "date": "2025/10/25"},
  {"activity": "Team Round Under-Par", "points": 50, "date": "2025/10/19"},
  {"activity": "Drills at Practice", "points": 57, "date": "2025/10/14"},
  {"activity": "Close-out Drills", "points": 10, "date": "2025/10/08"},
  {"activity": "Flamingo Drill", "points": 31, "date": "2025/10/07"},
  {"activity": "Team Tournament Goal", "points": 25, "date": "2025/10/01"},
  {"activity": "Cards for veterans", "points": 31, "date": "2025/09/28"},
  {"activity": "Team Win", "points": 100, "date": "2025/09/18"},
]

def reset_and_insert():
  prizes_col.delete_many({})
  activities_col.delete_many({})

  p_res = prizes_col.insert_many(prizes)
  a_res = activities_col.insert_many(activities)

  print(f"Inserted prizes: {len(p_res.inserted_ids)}")
  print(f"Inserted activities: {len(a_res.inserted_ids)}")

if __name__ == "__main__":
  reset_and_insert()