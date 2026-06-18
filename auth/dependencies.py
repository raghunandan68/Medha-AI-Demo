from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.supabase_client import supabase

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token = credentials.credentials

        response = supabase.auth.get_user(token)

        return response.user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )