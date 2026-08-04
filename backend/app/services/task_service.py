from datetime import datetime, UTC
import re
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.database.database import tasks_collection, users_collection
from app.schemas.task_schema import TaskCommentCreate, TaskCreate, TaskUpdate
from app.services.project_service import get_project_for_scope


def _to_object_id(id_str: str, entity_name: str = "resource") -> ObjectId:
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {entity_name} id",
        )


def _serialize_task(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "project_id": doc["project_id"],
        "workspace_id": doc["workspace_id"],
        "title": doc["title"],
        "description": doc.get("description"),
        "status": doc.get("status", "Backlog"),
        "priority": doc.get("priority", "Medium"),
        "assignee": doc.get("assignee"),
        "due_date": doc.get("due_date"),
        "labels": doc.get("labels", []),
        "comments": doc.get("comments", []),
        "google_event_id": doc.get("google_event_id"),
        "google_sync_status": doc.get("google_sync_status", "not_requested"),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


def _resolve_assignee(
    project_doc: Dict[str, Any], assignee_id: Optional[str]
) -> Optional[Dict[str, Any]]:
    """Assignee must be one of the project's own members (reuses Workspace
    members that were selected onto the project at creation time)."""
    if not assignee_id:
        return None

    for member in project_doc.get("members", []):
        if member.get("user_id") == assignee_id:
            return {
                "user_id": member["user_id"],
                "email": member.get("email"),
                "full_name": member.get("full_name"),
            }

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Assignee must already be a member of this project",
    )


def _get_project_for_scope(workspace_id: str, project_id: str) -> Dict[str, Any]:
    return get_project_for_scope(workspace_id, project_id)


def _get_task_doc(project_id: str, task_id: str) -> Dict[str, Any]:
    doc = tasks_collection.find_one(
        {"_id": _to_object_id(task_id, "task"), "project_id": project_id}
    )
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found in this project",
        )
    return doc


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------


def create_task(
    workspace_id: str,
    project_id: str,
    payload: TaskCreate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    project_doc = _get_project_for_scope(workspace_id, project_id)
    assignee = _resolve_assignee(project_doc, payload.assignee_id)

    now = datetime.now(UTC)
    doc = {
        "project_id": project_id,
        "workspace_id": workspace_id,
        "title": payload.title,
        "description": payload.description,
        "status": payload.status or "Backlog",
        "priority": payload.priority.value,
        "assignee": assignee,
        "due_date": payload.due_date,
        "labels": payload.labels or [],
        "comments": [],
        "google_sync_status": "pending",
        "created_at": now,
        "updated_at": now,
    }

    result = tasks_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    from app.services.google_calendar_service import sync_item
    sync_item(current_user["_id"], doc, "task")
    doc = tasks_collection.find_one({"_id": doc["_id"]}) or doc

    if assignee and assignee["user_id"] != current_user["_id"]:
        from app.services.notification_service import create_notification
        create_notification(assignee["user_id"], "task_assigned", "Task assigned to you", f"You were assigned “{payload.title}”.", workspace_id=workspace_id, project_id=project_id, task_id=str(doc["_id"]))

    return _serialize_task(doc)


def list_tasks(
    workspace_id: str,
    project_id: str,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
    assignee_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {"project_id": project_id, "workspace_id": workspace_id}

    if status_filter:
        query["status"] = status_filter
    if priority_filter:
        query["priority"] = priority_filter
    if assignee_id:
        query["assignee.user_id"] = assignee_id
    if search:
        query["title"] = {"$regex": search, "$options": "i"}

    sort_field = sort_by if sort_by in {"created_at", "due_date", "priority", "title"} else "created_at"

    cursor = tasks_collection.find(query).sort(sort_field, -1 if sort_field == "created_at" else 1)
    return [_serialize_task(doc) for doc in cursor]


def get_task(workspace_id: str, project_id: str, task_id: str) -> Dict[str, Any]:
    _get_project_for_scope(workspace_id, project_id)
    return _serialize_task(_get_task_doc(project_id, task_id))


def update_task(
    workspace_id: str,
    project_id: str,
    task_id: str,
    payload: TaskUpdate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    project_doc = _get_project_for_scope(workspace_id, project_id)
    doc = _get_task_doc(project_id, task_id)

    updates: Dict[str, Any] = {}
    for field in ("title", "description", "status", "due_date", "labels"):
        value = getattr(payload, field)
        if value is not None:
            updates[field] = value

    if payload.priority is not None:
        updates["priority"] = payload.priority.value

    if payload.assignee_id is not None:
        updates["assignee"] = _resolve_assignee(project_doc, payload.assignee_id) if payload.assignee_id else None

    if not updates:
        return _serialize_task(doc)

    updates["updated_at"] = datetime.now(UTC)
    tasks_collection.update_one({"_id": doc["_id"]}, {"$set": updates})
    doc.update(updates)

    from app.services.google_calendar_service import sync_item
    sync_item(current_user["_id"], doc, "task")
    doc = tasks_collection.find_one({"_id": doc["_id"]}) or doc

    assignee = updates.get("assignee")
    if assignee and assignee["user_id"] != current_user["_id"]:
        from app.services.notification_service import create_notification
        create_notification(assignee["user_id"], "task_assigned", "Task assigned to you", f"You were assigned “{doc['title']}”.", workspace_id=workspace_id, project_id=project_id, task_id=task_id)

    return _serialize_task(doc)


def delete_task(workspace_id: str, project_id: str, task_id: str, current_user: Dict[str, Any]) -> Dict[str, Any]:
    _get_project_for_scope(workspace_id, project_id)
    doc = _get_task_doc(project_id, task_id)
    from app.services.google_calendar_service import delete_synced_item
    delete_synced_item(current_user["_id"], doc, "task")
    tasks_collection.delete_one({"_id": doc["_id"]})
    return {"message": "Task deleted successfully"}


def add_comment(
    workspace_id: str,
    project_id: str,
    task_id: str,
    payload: TaskCommentCreate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    _get_project_for_scope(workspace_id, project_id)
    doc = _get_task_doc(project_id, task_id)

    comment = {
        "id": str(ObjectId()),
        "author_id": current_user["_id"],
        "author_name": current_user.get("full_name"),
        "body": payload.body,
        "created_at": datetime.now(UTC),
    }

    tasks_collection.update_one(
        {"_id": doc["_id"]},
        {
            "$push": {"comments": comment},
            "$set": {"updated_at": datetime.now(UTC)},
        },
    )
    doc.setdefault("comments", []).append(comment)

    recipients = {entry.get("author_id") for entry in doc["comments"] if entry.get("author_id")}
    assignee = doc.get("assignee") or {}
    if assignee.get("user_id"):
        recipients.add(assignee["user_id"])
    recipients.discard(current_user["_id"])
    if recipients:
        from app.services.notification_service import create_notification
        for recipient_id in recipients:
            create_notification(recipient_id, "task_comment", "New task comment", f"{current_user.get('full_name') or 'A member'} commented on “{doc['title']}”.", workspace_id=workspace_id, project_id=project_id, task_id=task_id)

    mentioned_emails = set(re.findall(r"@([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})", payload.body))
    for email in mentioned_emails:
        mentioned_user = users_collection.find_one({"email": email})
        if mentioned_user and str(mentioned_user["_id"]) != current_user["_id"]:
            create_notification(str(mentioned_user["_id"]), "mention", "You were mentioned", f"{current_user.get('full_name') or 'A member'} mentioned you in a comment on “{doc['title']}”.", workspace_id=workspace_id, project_id=project_id, task_id=task_id)

    return _serialize_task(doc)


def list_comments(workspace_id: str, project_id: str, task_id: str) -> List[Dict[str, Any]]:
    _get_project_for_scope(workspace_id, project_id)
    doc = _get_task_doc(project_id, task_id)
    return doc.get("comments", [])
