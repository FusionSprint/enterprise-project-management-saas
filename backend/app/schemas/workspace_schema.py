from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class WorkspaceRole(str, Enum):
    """Roles a member can hold inside a workspace."""

    OWNER = "Owner"
    ADMIN = "Admin"
    PROJECT_MANAGER = "Project Manager"
    TEAM_MEMBER = "Team Member"
    VIEWER = "Viewer"


class WorkspaceType(str, Enum):
    """Visibility of a workspace within the organization."""

    PRIVATE = "Private"
    PUBLIC = "Public"


class ProjectPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class ProjectStatus(str, Enum):
    PLANNING = "Planning"
    ACTIVE = "Active"
    ON_TRACK = "On Track"
    AT_RISK = "At Risk"
    COMPLETED = "Completed"


class ProjectMemberOut(BaseModel):
    user_id: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class ProjectCreate(BaseModel):
    """
    Payload for creating a lightweight Project stub inside a Workspace.
    NOTE: this is intentionally minimal (no tasks/kanban/etc.) — it exists so
    the Workspace Overview page has something real to list and hand off to
    the existing Project Dashboard. A full Project module/backend is out of
    scope for this change.
    """

    name: str = Field(min_length=2, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    priority: ProjectPriority = ProjectPriority.MEDIUM
    color: Optional[str] = Field(default="purple", max_length=30)
    icon: Optional[str] = Field(default="tactic", max_length=50)
    due_date: Optional[datetime] = None
    member_ids: Optional[List[str]] = Field(
        default_factory=list,
        description="Subset of this workspace's existing member user_ids. Members are not managed separately per-project.",
    )
    tags: Optional[List[str]] = Field(default_factory=list)


class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    priority: ProjectPriority = ProjectPriority.MEDIUM
    status: ProjectStatus = ProjectStatus.PLANNING
    progress: int = 0
    color: str = "purple"
    icon: str = "tactic"
    due_date: Optional[datetime] = None
    members: List[ProjectMemberOut] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    is_favorite: bool = False
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime


class WorkspaceCreate(BaseModel):
    """Payload for creating a new workspace."""

    workspace_name: str = Field(
        min_length=3,
        max_length=100,
        description="Unique (per owner) display name for the workspace.",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Optional short description of the workspace.",
    )
    icon: Optional[str] = Field(
        default="rocket_launch",
        max_length=50,
        description="Material Symbols icon name shown on the workspace card.",
    )
    color: Optional[str] = Field(
        default="purple",
        max_length=30,
        description="Accent color key used by the existing design system (e.g. purple, orange, cyan).",
    )
    workspace_type: Optional[WorkspaceType] = Field(
        default=WorkspaceType.PRIVATE,
        description="Whether the workspace is Private (invite-only) or Public (discoverable).",
    )
    tags: Optional[List[str]] = Field(
        default_factory=list,
        description="Free-form labels for the workspace (e.g. Infrastructure, Design).",
    )
    invite_emails: Optional[List[EmailStr]] = Field(
        default=None,
        description="Optional list of registered-user emails to invite as Team Members immediately after creation.",
    )


class WorkspaceUpdate(BaseModel):
    """Payload for updating an existing workspace. All fields are optional (partial update)."""

    workspace_name: Optional[str] = Field(
        default=None,
        min_length=3,
        max_length=100,
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
    )
    icon: Optional[str] = Field(default=None, max_length=50)
    color: Optional[str] = Field(default=None, max_length=30)
    workspace_type: Optional[WorkspaceType] = Field(default=None)
    tags: Optional[List[str]] = Field(default=None)


class AnnouncementCreate(BaseModel):
    """Payload for posting a workspace announcement."""

    title: str = Field(min_length=1, max_length=150)
    body: str = Field(min_length=1, max_length=2000)


class AnnouncementOut(BaseModel):
    """A single announcement as returned to clients."""

    id: str
    title: str
    body: str
    author_id: str
    author_name: Optional[str] = None
    created_at: datetime


class ActivityEntryOut(BaseModel):
    """A single workspace activity timeline entry."""

    id: str
    type: str
    message: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    created_at: datetime


class WorkspaceStatsOut(BaseModel):
    """Lightweight, real (non-simulated) statistics derived from workspace data."""

    member_count: int
    project_count: int
    announcement_count: int
    pending_invites: int = 0


class InviteMemberRequest(BaseModel):
    """Payload for inviting a registered user into a workspace."""

    email: EmailStr
    role: WorkspaceRole = Field(
        default=WorkspaceRole.TEAM_MEMBER,
        description="Role to assign to the invited member. Cannot be 'Owner'.",
    )


class ChangeMemberRoleRequest(BaseModel):
    """Payload for changing an existing member's role."""

    role: WorkspaceRole = Field(
        description="New role to assign to the member. Cannot be 'Owner'."
    )


class WorkspaceMemberOut(BaseModel):
    """A single member entry as returned to clients."""

    model_config = ConfigDict(from_attributes=True)

    user_id: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: WorkspaceRole
    joined_at: datetime


class WorkspaceOut(BaseModel):
    """Full workspace representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    workspace_name: str
    description: Optional[str] = None
    owner_id: str
    members: List[WorkspaceMemberOut]
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False

    # --- Additive fields for the Workspace module (default-backed so older
    # documents created before this change still serialize correctly) ---
    icon: str = "rocket_launch"
    color: str = "purple"
    workspace_type: WorkspaceType = WorkspaceType.PRIVATE
    tags: List[str] = Field(default_factory=list)
    is_archived: bool = False
    is_favorite: bool = False
    member_count: int = 0
    announcements: List[AnnouncementOut] = Field(default_factory=list)
    recent_activity: List[ActivityEntryOut] = Field(default_factory=list)
    projects: List[ProjectOut] = Field(default_factory=list)


class MessageResponse(BaseModel):
    """Generic success message response."""

    message: str