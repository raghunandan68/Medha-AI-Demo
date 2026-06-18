from fastapi import APIRouter
from pydantic import BaseModel
from auth.supabase_client import supabase

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

class UserSignup(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(user: UserSignup):
    try:
        response = supabase.auth.sign_up(
            {
                "email": user.email,
                "password": user.password
            }
        )

        return {
            "message": "User created successfully",
            "user_id": response.user.id,
            "email": response.user.email
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


from fastapi import HTTPException

@router.post("/login")
def login(user: UserLogin):

    try:
        response = supabase.auth.sign_in_with_password(
            {
                "email": user.email,
                "password": user.password
            }
        )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )