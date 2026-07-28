from datetime import datetime

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict,
)


class UserRegister(BaseModel):

    full_name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128
    )


class UserLogin(BaseModel):

    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128
    )


class UserResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: str

    full_name: str

    email: EmailStr

    role: str

    status: str

    created_at: datetime