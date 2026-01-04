# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import ObjectId
import os

load_dotenv()

uri = os.getenv("DB_URI")
client = MongoClient(uri)
db = client["2025Fall"]
prizes_col = db["Prizes"]
print("connected to prize col")
activities_col = db["Activities"]
print("connected to activities col")      


# --- FastAPI app ---
app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ewgweb2.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    username: str
    role: str

class Prize(BaseModel):
    points: int
    label: str

class Activity(BaseModel):
    activity: str
    points: int
    date: str

@app.get("/activities")
def get_activities():
    print("frontend wants all activities")
    acts = []
    for a in activities_col.find({}).sort("date", -1):
        a["_id"] = str(a["_id"])
        acts.append(a)
    print(acts)
    return acts

@app.post("/activities")
def store_activity(act: Activity):
    print("Storing an activity to backend")
    activities_col.insert_one(act.model_dump())
    return {"status": "success"}

@app.delete("/activities/{id}")
def delete_activity(id: str):
    result = activities_col.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"status": "deleted"}



@app.get("/prizes")
def getprizes():
    print("frontend wants all prizes")
    prizes = []
    for a in prizes_col.find({}).sort("points", 1):
        a["_id"] = str(a["_id"])
        prizes.append(a)
    print(prizes)
    return prizes

@app.post("/prizes")
def store_prize(prize: Prize):
    print("Storing an activity to backend")
    prizes_col.insert_one(prize.model_dump())
    return {"status": "success"}

@app.put("/prizes/{id}")
def update_prize(id: str, prize: Prize):
    prizes_col.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"points": prize.points, "label": prize.label}}
    )
    return {"status": "updated"}

@app.delete("/prizes/{id}")
def delete_prize(id: str):
    result = prizes_col.delete_one({"_id": ObjectId(id)})
    return {"status": "deleted"}