from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from db.mongodb import db
from core.security import decode_token
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await db.users.find_one({"_id": ObjectId(user_id)})

        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        user["_id"] = str(user["_id"])  
        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
