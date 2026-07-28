from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class CalendarEventType(str, Enum):
    MEETING = "Meeting"
    MILESTONE = "Milestone"
    DEADLINE = "Deadline"
    EVENT = "Event"


class CalendarEventPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class CalendarEventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=1000)
    event_type: CalendarEventType = CalendarEventType.EVENT
    start_time: datetime
    end_time: Optional[datetime] = None
    all_day: bool = False
    priority: CalendarEventPriority = CalendarEventPriority.MEDIUM
    category: Optional[str] = Field(default=None, max_length=60)
    reminder_minutes: Optional[int] = Field(default=None, ge=0, le=10080)
    participant_ids: List[str] = Field(default_factory=list)
    location: Optional[str] = Field(default=None, max_length=250)
    color: Optional[str] = Field(default=None, max_length=30)
    notes: Optional[str] = Field(default=None, max_length=4000)
    google_sync_enabled: bool = False


class CalendarEventUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=150)
    description: Optional[str] = Field(default=None, max_length=1000)
    event_type: Optional[CalendarEventType] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    all_day: Optional[bool] = None
    priority: Optional[CalendarEventPriority] = None
    category: Optional[str] = Field(default=None, max_length=60)
    reminder_minutes: Optional[int] = Field(default=None, ge=0, le=10080)
    participant_ids: Optional[List[str]] = None
    location: Optional[str] = Field(default=None, max_length=250)
    color: Optional[str] = Field(default=None, max_length=30)
    notes: Optional[str] = Field(default=None, max_length=4000)
    google_sync_enabled: Optional[bool] = None


class CalendarEventOut(BaseModel):
    id: str
    project_id: str
    workspace_id: str
    title: str
    description: Optional[str] = None
    event_type: CalendarEventType = CalendarEventType.EVENT
    start_time: datetime
    end_time: Optional[datetime] = None
    all_day: bool = False
    source: str = "event"  # "event" (user-created) or "task_deadline" (derived, read-only)
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    priority: CalendarEventPriority = CalendarEventPriority.MEDIUM
    category: Optional[str] = None
    reminder_minutes: Optional[int] = None
    participant_ids: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    color: Optional[str] = None
    notes: Optional[str] = None
    google_sync_enabled: bool = False
    google_sync_status: str = "not_requested"
