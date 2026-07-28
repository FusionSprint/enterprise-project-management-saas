from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.workspace_guard import get_workspace_and_member
from app.schemas.calendar_schema import (
    CalendarEventCreate,
    CalendarEventOut,
    CalendarEventUpdate,
)
from app.schemas.workspace_schema import MessageResponse
from app.services import calendar_service

router = APIRouter()


@router.post(
    "",
    response_model=CalendarEventOut,
    status_code=201,
    summary="Create a project calendar event (meeting/milestone/event)",
)
def create_event(
    workspace_id: str,
    project_id: str,
    payload: CalendarEventCreate,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return calendar_service.create_event(workspace_id, project_id, payload, current_user)


@router.get(
    "",
    response_model=List[CalendarEventOut],
    summary="List calendar events (events + task deadlines merged)",
)
def list_events(
    workspace_id: str,
    project_id: str,
    include_task_deadlines: bool = True,
    start: Optional[datetime] = None, end: Optional[datetime] = None, priority: Optional[str] = None,
    category: Optional[str] = None, search: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    """
    Backs the "Live Calendar" panel — real stored events plus each task's
    due date, shown as read-only Deadline entries.
    """
    get_workspace_and_member(workspace_id, current_user)
    return calendar_service.list_events(workspace_id, project_id, include_task_deadlines, start, end, priority, category, search)


@router.get(
    "/{event_id}",
    response_model=CalendarEventOut,
    summary="Get a single calendar event",
)
def get_event(
    workspace_id: str,
    project_id: str,
    event_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return calendar_service.get_event(workspace_id, project_id, event_id)


@router.put(
    "/{event_id}",
    response_model=CalendarEventOut,
    summary="Update a calendar event",
)
def update_event(
    workspace_id: str,
    project_id: str,
    event_id: str,
    payload: CalendarEventUpdate,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return calendar_service.update_event(workspace_id, project_id, event_id, payload)


@router.delete(
    "/{event_id}",
    response_model=MessageResponse,
    summary="Delete a calendar event",
)
def delete_event(
    workspace_id: str,
    project_id: str,
    event_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return calendar_service.delete_event(workspace_id, project_id, event_id)
