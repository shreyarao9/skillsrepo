from pymongo import MongoClient
from datetime import datetime

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")

# Create or connect to the database
db = client["webrtc_db"]

# Collections
users_collection = db.users
skills_collection = db.skills
exchanges_collection = db.exchanges

# Ensure indexes for efficient lookups
users_collection.create_index("email", unique=True)
skills_collection.create_index("name", unique=True)
exchanges_collection.create_index("status")

# Sample User Schema
user_sample = {
    "username": "john_doe",
    "email": "john.doe@example.com",
    "skills_offered": [
        {"skill_name": "coding", "proficiency": "advanced"},
        {"skill_name": "data analysis", "proficiency": "intermediate"}
    ],
    "skills_needed": [
        {"skill_name": "graphic design", "proficiency": "beginner"},
        {"skill_name": "marketing", "proficiency": "beginner"}
    ],
    "profile": "Software engineer looking to exchange skills.",
    "created_at": datetime.utcnow()
}

# Sample Skill Schema
skill_sample = {
    "name": "coding",
    "description": "The ability to write and debug software.",
    "category": "IT",
    "difficulty_level": "Intermediate",
    "created_at": datetime.utcnow()
}

# Sample Exchange Schema
exchange_sample = {
    "user1": "john_doe",
    "user2": "jane_smith",
    "skill_offered": {
        "name": "coding",
        "proficiency": "advanced"
    },
    "skill_requested": {
        "name": "graphic design",
        "proficiency": "beginner"
    },
    "status": "pending",  # Can be 'pending', 'active', or 'completed'
    "chat_history": [
        {"sender": "john_doe", "message": "Hi, are you interested?", "timestamp": datetime.utcnow()},
        {"sender": "jane_smith", "message": "Yes, let's discuss!", "timestamp": datetime.utcnow()}
    ],
    "start_date": None,
    "end_date": None,
    "created_at": datetime.utcnow()
}

# Insert Sample Data
users_collection.insert_one(user_sample)
skills_collection.insert_one(skill_sample)
exchanges_collection.insert_one(exchange_sample)

# Queries
# 1. Retrieve all users
print("Users:")
for user in users_collection.find():
    print(user)

# 2. Retrieve all skills in IT category
print("\nSkills in IT category:")
for skill in skills_collection.find({"category": "IT"}):
    print(skill)

# 3. Retrieve pending exchanges
print("\nPending Exchanges:")
for exchange in exchanges_collection.find({"status": "pending"}):
    print(exchange)

print("\nDatabase setup with more complexity is complete!")