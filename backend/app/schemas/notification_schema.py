from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class NotificationOut(BaseModel):
    id: str
    recipient_id: str
    type: str
    title: str
    body: str
    workspace_id: Optional[str] = None
    project_id: Optional[str] = None
    task_id: Optional[str] = None
    is_read: bool = False
    is_archived: bool = False
    created_at: datetime


class NotificationUnreadCountOut(BaseModel):
    unread_count: int


class NotificationReadUpdate(BaseModel):
    is_read: bool = Field(default=True)


class NotificationArchiveUpdate(BaseModel):
    is_archived: bool
