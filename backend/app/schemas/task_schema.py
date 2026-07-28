from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.workspace_schema import ProjectPriority


class TaskMemberRef(BaseModel):
    user_id: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class TaskCreate(BaseModel):
    """
    Payload for creating a task. `status` is a free-form string rather than
    a fixed enum because the existing Kanban board (project_overview) lets
    users add arbitrary custom columns via the "Add Column" button — a
    task's status is simply whichever column name it belongs to.
    """

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="Backlog", max_length=60)
    priority: ProjectPriority = ProjectPriority.MEDIUM
    assignee_id: Optional[str] = Field(
        default=None,
        description="user_id of a project member to assign this task to.",
    )
    due_date: Optional[datetime] = None
    labels: Optional[List[str]] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    """Partial update — also used to move a task between Kanban columns."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[str] = Field(default=None, max_length=60)
    priority: Optional[ProjectPriority] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    labels: Optional[List[str]] = None


class TaskCommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class TaskCommentOut(BaseModel):
    id: str
    author_id: str
    author_name: Optional[str] = None
    body: str
    created_at: datetime


class TaskOut(BaseModel):
    id: str
    project_id: str
    workspace_id: str
    title: str
    description: Optional[str] = None
    status: str = "Backlog"
    priority: ProjectPriority = ProjectPriority.MEDIUM
    assignee: Optional[TaskMemberRef] = None
    due_date: Optional[datetime] = None
    labels: List[str] = Field(default_factory=list)
    comments: List[TaskCommentOut] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
