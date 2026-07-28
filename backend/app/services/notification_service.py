from datetime import UTC, datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pymongo import ReturnDocument
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.database.database import notifications_collection


def _serialize(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {"id": str(doc["_id"]), "recipient_id": doc["recipient_id"], "type": doc["type"], "title": doc["title"], "body": doc["body"], "workspace_id": doc.get("workspace_id"), "project_id": doc.get("project_id"), "task_id": doc.get("task_id"), "is_read": doc.get("is_read", False), "is_archived": doc.get("is_archived", False), "created_at": doc["created_at"]}


def create_notification(recipient_id: str, notification_type: str, title: str, body: str, *, workspace_id: Optional[str] = None, project_id: Optional[str] = None, task_id: Optional[str] = None) -> None:
    notifications_collection.insert_one({"recipient_id": recipient_id, "type": notification_type, "title": title, "body": body, "workspace_id": workspace_id, "project_id": project_id, "task_id": task_id, "is_read": False, "is_archived": False, "created_at": datetime.now(UTC)})


def list_notifications(user_id: str, unread_only: bool = False, archived: bool = False) -> List[Dict[str, Any]]:
    query = {"recipient_id": user_id, "is_archived": archived}
    if unread_only: query["is_read"] = False
    return [_serialize(doc) for doc in notifications_collection.find(query).sort("created_at", -1)]


def unread_count(user_id: str) -> Dict[str, int]:
    return {"unread_count": notifications_collection.count_documents({"recipient_id": user_id, "is_read": False, "is_archived": False})}


def mark_read(user_id: str, notification_id: str, is_read: bool) -> Dict[str, Any]:
    try: oid = ObjectId(notification_id)
    except (InvalidId, TypeError): raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification id")
    result = notifications_collection.find_one_and_update({"_id": oid, "recipient_id": user_id}, {"$set": {"is_read": is_read}}, return_document=ReturnDocument.AFTER)
    if not result: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return _serialize(result)


def mark_all_read(user_id: str) -> Dict[str, str]:
    notifications_collection.update_many({"recipient_id": user_id, "is_read": False, "is_archived": False}, {"$set": {"is_read": True}})
    return {"message": "Notifications marked as read"}


def set_archived(user_id: str, notification_id: str, archived: bool) -> Dict[str, Any]:
    return _update_owned(user_id, notification_id, {"is_archived": archived})


def delete_notification(user_id: str, notification_id: str) -> Dict[str, str]:
    try: oid = ObjectId(notification_id)
    except (InvalidId, TypeError): raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification id")
    if not notifications_collection.delete_one({"_id": oid, "recipient_id": user_id}).deleted_count:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return {"message": "Notification deleted"}


def _update_owned(user_id: str, notification_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    try: oid = ObjectId(notification_id)
    except (InvalidId, TypeError): raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification id")
    result = notifications_collection.find_one_and_update({"_id": oid, "recipient_id": user_id}, {"$set": updates}, return_document=ReturnDocument.AFTER)
    if not result: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return _serialize(result)
