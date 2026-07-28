from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class WikiPageCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    body: str = Field(default="", max_length=20000)


class WikiPageUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=150)
    body: Optional[str] = Field(default=None, max_length=20000)


class WikiHistoryEntryOut(BaseModel):
    version: int
    title: str
    body: str
    edited_by: Optional[str] = None
    edited_by_name: Optional[str] = None
    edited_at: datetime


class WikiPageOut(BaseModel):
    id: str
    project_id: str
    workspace_id: str
    title: str
    body: str
    version: int = 1
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    edit_history: List[WikiHistoryEntryOut] = Field(default_factory=list)
