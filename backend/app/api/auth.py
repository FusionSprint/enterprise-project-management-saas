from fastapi import APIRouter, status, Depends

from app.core.auth import get_current_user
from app.core.auth import require_role

from app.schemas.user_schema import (
    UserRegister,
    UserLogin,
)

from app.services.auth_service import (
    register_user,
    login_user,
)

router = APIRouter()


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register(user: UserRegister):
    return register_user(user)


@router.post("/login")
def login(user: UserLogin):
    return login_user(user)

@router.get("/profile")
def profile(
    current_user=Depends(get_current_user)
):
    return {
        "message": "User profile retrieved successfully",
        "user": {
            "id": current_user["_id"],
            "full_name": current_user["full_name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "status": current_user["status"]
        }
    }

@router.get("/admin")
def admin_dashboard(
    current_user=Depends(require_role("Admin"))
):
    return {
        "message": "Welcome Admin",
        "user": current_user["full_name"]
    }