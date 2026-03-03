from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.mongodb_db]

# indexes creation helper (call at startup)
async def create_indexes():
    await db.users.create_index("email", unique=True)
    await db.exams.create_index("owner_id")
