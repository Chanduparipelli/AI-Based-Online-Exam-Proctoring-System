from core.security import create_access_token, decode_token
from typing import Optional, Dict, Any

def generate_token(subject: str, role: str, email: str, expires_minutes: Optional[int] = None) -> str:
    payload: Dict[str, Any] = {
        "sub": subject,
        "role": role,
        "email": email
    }
    return create_access_token(payload, expires_minutes)

def verify_token(token: str) -> Dict[str, Any]:
    return decode_token(token)