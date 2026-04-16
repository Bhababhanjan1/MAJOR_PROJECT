import os
from motor.motor_asyncio import AsyncIOMotorClient

from config import load_backend_env

# ---------------- LOAD ENV ----------------
load_backend_env()

# ---------------- READ MONGO URL ----------------
MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise Exception("MONGO_URL not found in .env file")

# ---------------- CONNECT DB ----------------
client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=10000,
)
db = client["apis_db"]

# ---------------- COLLECTIONS ----------------
users_collection = db["users"]
interview_sessions_collection = db["interview_sessions"]
report_ratings_collection = db["report_ratings"]
