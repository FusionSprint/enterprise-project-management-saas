from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from app.schemas.workspace_schema import ProjectPriority, ProjectStatus


class ProjectMemberRef(BaseModel):
    user_id: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class ProjectUpdate(BaseModel):
    """Partial update payload for a Project's own detail record."""

    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=1000)
    priority: Optional[ProjectPriority] = None
    status: Optional[ProjectStatus] = None
    progress: Optional[int] = Field(default=None, ge=0, le=100)
    color: Optional[str] = Field(default=None, max_length=30)
    icon: Optional[str] = Field(default=None, max_length=50)
    due_date: Optional[datetime] = None
    member_ids: Optional[List[str]] = None
    tags: Optional[List[str]] = None


class ProjectActivityEntryOut(BaseModel):
    id: str
    type: str
    message: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    created_at: datetime


class ProjectDetailOut(BaseModel):
    """Full Project detail record, as read by the Project Dashboard page."""

    id: str
    workspace_id: str
    name: str
    description: Optional[str] = None
    priority: ProjectPriority = ProjectPriority.MEDIUM
    status: ProjectStatus = ProjectStatus.PLANNING
    progress: int = 0
    color: str = "purple"
    icon: str = "tactic"
    due_date: Optional[datetime] = None
    members: List[ProjectMemberRef] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    is_favorite: bool = False
    is_archived: bool = False
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    recent_activity: List[ProjectActivityEntryOut] = Field(default_factory=list)


class ProjectStatsOut(BaseModel):
    """Real, derived statistics for a single project."""

    task_count: int
    tasks_by_status: dict
    overdue_task_count: int
    upcoming_event_count: int
    wiki_page_count: int
    member_count: int
