from typing import List

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.schemas.notification_schema import NotificationArchiveUpdate, NotificationOut, NotificationReadUpdate, NotificationUnreadCountOut
from app.schemas.workspace_schema import MessageResponse
from app.services import notification_service

router = APIRouter()

@router.get("", response_model=List[NotificationOut])
def list_notifications(unread_only: bool = False, archived: bool = False, current_user=Depends(get_current_user)):
    return notification_service.list_notifications(current_user["_id"], unread_only, archived)

@router.get("/unread-count", response_model=NotificationUnreadCountOut)
def get_unread_count(current_user=Depends(get_current_user)):
    return notification_service.unread_count(current_user["_id"])

@router.patch("/{notification_id}", response_model=NotificationOut)
def update_read_state(notification_id: str, payload: NotificationReadUpdate, current_user=Depends(get_current_user)):
    return notification_service.mark_read(current_user["_id"], notification_id, payload.is_read)

@router.patch("/{notification_id}/archive", response_model=NotificationOut)
def update_archive_state(notification_id: str, payload: NotificationArchiveUpdate, current_user=Depends(get_current_user)):
    return notification_service.set_archived(current_user["_id"], notification_id, payload.is_archived)

@router.delete("/{notification_id}", response_model=MessageResponse)
def delete_notification(notification_id: str, current_user=Depends(get_current_user)):
    return notification_service.delete_notification(current_user["_id"], notification_id)

@router.post("/mark-all-read", response_model=MessageResponse)
def mark_all_read(current_user=Depends(get_current_user)):
    return notification_service.mark_all_read(current_user["_id"])
