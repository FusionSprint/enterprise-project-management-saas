from datetime import datetime, UTC
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.database.database import calendar_events_collection, tasks_collection
from app.schemas.calendar_schema import CalendarEventCreate, CalendarEventUpdate


def _to_object_id(id_str: str, entity_name: str = "resource") -> ObjectId:
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {entity_name} id",
        )


def _serialize_event(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "project_id": doc["project_id"],
        "workspace_id": doc["workspace_id"],
        "title": doc["title"],
        "description": doc.get("description"),
        "event_type": doc.get("event_type", "Event"),
        "start_time": doc["start_time"],
        "end_time": doc.get("end_time"),
        "all_day": doc.get("all_day", False),
        "source": "event",
        "created_by": doc.get("created_by"),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
        "priority": doc.get("priority", "Medium"),
        "category": doc.get("category"),
        "reminder_minutes": doc.get("reminder_minutes"),
        "participant_ids": doc.get("participant_ids", []),
        "location": doc.get("location"),
        "color": doc.get("color"),
        "notes": doc.get("notes"),
        "google_sync_enabled": doc.get("google_sync_enabled", False),
        "google_sync_status": doc.get("google_sync_status", "not_requested"),
        "google_event_id": doc.get("google_event_id"),
    }


def _task_deadline_as_event(task: Dict[str, Any]) -> Dict[str, Any]:
    """Represent a task's due date as a read-only, derived calendar entry —
    not duplicated data, computed on read from the Tasks collection."""
    return {
        "id": f"task-deadline:{task['_id']}",
        "project_id": task["project_id"],
        "workspace_id": task["workspace_id"],
        "title": f"Due: {task['title']}",
        "description": task.get("description"),
        "event_type": "Deadline",
        "start_time": task["due_date"],
        "end_time": None,
        "all_day": True,
        "source": "task_deadline",
        "created_by": None,
        "created_at": task["created_at"],
        "updated_at": task["updated_at"],
        "priority": task.get("priority", "Medium"), "category": "Task", "reminder_minutes": None,
        "participant_ids": [task["assignee"]["user_id"]] if task.get("assignee") else [], "location": None, "color": None, "notes": None,
        "google_sync_enabled": False, "google_sync_status": "not_applicable",
    }


def _get_event_doc(project_id: str, event_id: str) -> Dict[str, Any]:
    doc = calendar_events_collection.find_one(
        {"_id": _to_object_id(event_id, "event"), "project_id": project_id}
    )
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found in this project",
        )
    return doc


def create_event(
    workspace_id: str,
    project_id: str,
    payload: CalendarEventCreate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    now = datetime.now(UTC)
    doc = {
        "project_id": project_id,
        "workspace_id": workspace_id,
        "title": payload.title,
        "description": payload.description,
        "event_type": payload.event_type.value,
        "start_time": payload.start_time,
        "end_time": payload.end_time,
        "all_day": payload.all_day,
        "created_by": current_user["_id"],
        "created_at": now,
        "updated_at": now,
        "priority": payload.priority.value, "category": payload.category,
        "reminder_minutes": payload.reminder_minutes, "participant_ids": payload.participant_ids,
        "location": payload.location, "color": payload.color, "notes": payload.notes,
        "google_sync_enabled": payload.google_sync_enabled,
        "google_sync_status": "pending",
    }
    result = calendar_events_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    from app.services.google_calendar_service import sync_item
    sync_item(current_user["_id"], doc, "calendar_event")
    doc = calendar_events_collection.find_one({"_id": doc["_id"]}) or doc
    return _serialize_event(doc)


def list_events(
    workspace_id: str,
    project_id: str,
    include_task_deadlines: bool = True, start: Optional[datetime] = None, end: Optional[datetime] = None,
    priority: Optional[str] = None, category: Optional[str] = None, search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Real Project Events + Milestones + Meetings (stored), merged with Task
    Deadlines (derived on read from each task's due_date, so a task's due
    date never has to be kept in sync in two places).
    """
    query: Dict[str, Any] = {"project_id": project_id, "workspace_id": workspace_id}
    if start or end: query["start_time"] = {**({"$gte": start} if start else {}), **({"$lte": end} if end else {})}
    if priority: query["priority"] = priority
    if category: query["category"] = category
    if search: query["title"] = {"$regex": search, "$options": "i"}
    events = [
        _serialize_event(doc)
        for doc in calendar_events_collection.find(query)
    ]

    if include_task_deadlines:
        tasks_with_due_dates = tasks_collection.find(
            {
                "project_id": project_id,
                "workspace_id": workspace_id,
                "due_date": {"$ne": None},
            }
        )
        events.extend(_task_deadline_as_event(t) for t in tasks_with_due_dates)

    events.sort(key=lambda e: e["start_time"])
    return events


def list_workspace_events(workspace_id: str, include_task_deadlines: bool = True) -> List[Dict[str, Any]]:
    events = [_serialize_event(doc) for doc in calendar_events_collection.find({"workspace_id": workspace_id})]
    if include_task_deadlines:
        events.extend(_task_deadline_as_event(task) for task in tasks_collection.find({"workspace_id": workspace_id, "due_date": {"$ne": None}}))
    return sorted(events, key=lambda event: event["start_time"])


def get_event(workspace_id: str, project_id: str, event_id: str) -> Dict[str, Any]:
    return _serialize_event(_get_event_doc(project_id, event_id))


def update_event(
    workspace_id: str,
    project_id: str,
    event_id: str,
    payload: CalendarEventUpdate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    doc = _get_event_doc(project_id, event_id)

    updates: Dict[str, Any] = {}
    for field in ("title", "description", "start_time", "end_time", "all_day", "category", "reminder_minutes", "participant_ids", "location", "color", "notes", "google_sync_enabled"):
        value = getattr(payload, field)
        if value is not None:
            updates[field] = value
    if payload.event_type is not None:
        updates["event_type"] = payload.event_type.value
    if payload.priority is not None:
        updates["priority"] = payload.priority.value

    if not updates:
        return _serialize_event(doc)

    updates["updated_at"] = datetime.now(UTC)
    calendar_events_collection.update_one({"_id": doc["_id"]}, {"$set": updates})
    doc.update(updates)
    from app.services.google_calendar_service import sync_item
    sync_item(current_user["_id"], doc, "calendar_event")
    doc = calendar_events_collection.find_one({"_id": doc["_id"]}) or doc
    return _serialize_event(doc)


def delete_event(workspace_id: str, project_id: str, event_id: str, current_user: Dict[str, Any]) -> Dict[str, Any]:
    doc = _get_event_doc(project_id, event_id)
    from app.services.google_calendar_service import delete_synced_item
    delete_synced_item(current_user["_id"], doc, "calendar_event")
    calendar_events_collection.delete_one({"_id": doc["_id"]})
    return {"message": "Calendar event deleted successfully"}
