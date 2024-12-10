from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific domains for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
#client = MongoClient("mongodb://localhost:27017/")
#db = client["webrtc_db"]
call_tokens={}

class CallPayload(BaseModel):
    token: str
    receiver_id: str

@app.post("/send-token")
async def send_token(payload: CallPayload):
    #calls_collection = db["calls"]
    #calls_collection.update_one(
        #{"receiver_id": payload.receiver_id},
        #{"$set": {"call_token": payload.token}},
        #upsert=True
    #)
    call_tokens[payload.receiver_id] = payload.token
    return {"message": "Token sent to receiver"}

@app.get("/get-token/{receiver_id}")
async def get_token(receiver_id: str):
    #calls_collection = db["calls"]
    #call_data = calls_collection.find_one({"receiver_id": receiver_id}, {"_id": 0, "call_token": 1})
    #if call_data:
     #   return {"call_token": call_data.get("call_token")}
    token = call_tokens.get(receiver_id)
    if token:
        return {"call_token": token}
    return {"error": "No token found for this receiver"}
