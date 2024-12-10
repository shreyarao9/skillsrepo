from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific domains for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

call_tokens={}

class CallPayload(BaseModel):
    token: str
    receiver_id: str

@app.post("/send-token")
async def send_token(payload: CallPayload):
    call_tokens[payload.receiver_id] = payload.token
    return {"message": "Token sent to receiver"}

@app.get("/get-token/{receiver_id}")
async def get_token(receiver_id: str):
    print(f"Received token request for receiver_id: {receiver_id}")
    token = call_tokens.get(receiver_id)
    if token:
        print(f"Token found: {token}")
        return {"call_token": token}
    print("No token found for this receiver")
    return {"error": "No token found for this receiver"}
