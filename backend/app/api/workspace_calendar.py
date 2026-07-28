from typing import List

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.workspace_guard import get_workspace_and_member
from app.schemas.calendar_schema import CalendarEventOut
from app.services import calendar_service

router = APIRouter()


@router.get("", response_model=List[CalendarEventOut], summary="List every project event in a workspace calendar")
def list_workspace_calendar(workspace_id: str, include_task_deadlines: bool = True, current_user=Depends(get_current_user)):
    get_workspace_and_member(workspace_id, current_user)
    return calendar_service.list_workspace_events(workspace_id, include_task_deadlines)
