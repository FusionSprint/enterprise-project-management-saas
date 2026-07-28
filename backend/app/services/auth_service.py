from datetime import datetime, UTC
from app.utils.jwt_handler import create_access_token

from fastapi import HTTPException, status

from app.database.database import users_collection
from app.core.security import (
    hash_password,
    verify_password,
)

from app.schemas.user_schema import (
    UserRegister,
    UserLogin,
)

DEFAULT_ROLE = "Team Member"
DEFAULT_STATUS = "Active"


def register_user(user: UserRegister):
    """
    Register a new user.
    """

    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "hashed_password": hash_password(user.password),
        "role": DEFAULT_ROLE,
        "status": DEFAULT_STATUS,
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    }

    result = users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
        "email": user.email
    }


def login_user(user: UserLogin):
    """
    Login existing user.
    """

    db_user = users_collection.find_one(
        {"email": user.email}
    )

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user["hashed_password"]
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": db_user["email"],
            "role": db_user["role"]
        }
    )

    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "user": {
            "full_name": db_user["full_name"],
            "email": db_user["email"],
            "role": db_user["role"],
            "status": db_user["status"]
        }
    }