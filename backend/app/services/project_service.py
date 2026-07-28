from datetime import datetime, UTC
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.database.database import (
    calendar_events_collection,
    projects_collection,
    tasks_collection,
    wiki_pages_collection,
    workspaces_collection,
)
from app.schemas.project_schema import ProjectUpdate

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _to_object_id(id_str: str, entity_name: str = "resource") -> ObjectId:
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {entity_name} id",
        )


def _serialize_project(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "workspace_id": doc["workspace_id"],
        "name": doc["name"],
        "description": doc.get("description"),
        "priority": doc.get("priority", "Medium"),
        "status": doc.get("status", "Planning"),
        "progress": doc.get("progress", 0),
        "color": doc.get("color") or "purple",
        "icon": doc.get("icon") or "tactic",
        "due_date": doc.get("due_date"),
        "members": doc.get("members", []),
        "tags": doc.get("tags", []),
        "is_favorite": doc.get("is_favorite", False),
        "is_archived": doc.get("is_archived", False),
        "created_by": doc.get("created_by"),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
        "recent_activity": list(reversed(doc.get("activity_log", [])))[:20],
    }


def _log_project_activity(
    project_oid: ObjectId,
    entry_type: str,
    message: str,
    current_user: Dict[str, Any],
) -> None:
    entry = {
        "id": str(ObjectId()),
        "type": entry_type,
        "message": message,
        "actor_id": current_user.get("_id"),
        "actor_name": current_user.get("full_name"),
        "created_at": datetime.now(UTC),
    }
    projects_collection.update_one(
        {"_id": project_oid},
        {"$push": {"activity_log": entry}},
    )


def mirror_project_created(
    project_id: str,
    workspace_id: str,
    project_stub: Dict[str, Any],
    current_user: Dict[str, Any],
) -> None:
    """
    Called by workspace_service.add_project() right after it appends the
    lightweight project stub into the workspace's embedded array. Creates
    the matching full Project detail document — same id — in the dedicated
    projects collection, which is what Tasks / Calendar / Wiki reference and
    what the Project Dashboard reads from.
    """
    now = datetime.now(UTC)
    doc = {
        "_id": ObjectId(project_id),
        "workspace_id": workspace_id,
        "name": project_stub["name"],
        "description": project_stub.get("description"),
        "priority": project_stub.get("priority", "Medium"),
        "status": project_stub.get("status", "Planning"),
        "progress": project_stub.get("progress", 0),
        "color": project_stub.get("color") or "purple",
        "icon": project_stub.get("icon") or "tactic",
        "due_date": project_stub.get("due_date"),
        "members": project_stub.get("members", []),
        "tags": project_stub.get("tags", []),
        "is_favorite": False,
        "is_archived": False,
        "created_by": current_user["_id"],
        "created_at": now,
        "updated_at": now,
        "activity_log": [
            {
                "id": str(ObjectId()),
                "type": "project_created",
                "message": f"{current_user.get('full_name') or 'A member'} created this project",
                "actor_id": current_user["_id"],
                "actor_name": current_user.get("full_name"),
                "created_at": now,
            }
        ],
    }
    projects_collection.insert_one(doc)


def mirror_project_favorite(project_id: str, favorite: bool) -> None:
    projects_collection.update_one(
        {"_id": _to_object_id(project_id, "project")},
        {"$set": {"is_favorite": favorite, "updated_at": datetime.now(UTC)}},
    )


def mirror_project_archived(project_id: str, archived: bool) -> None:
    projects_collection.update_one(
        {"_id": _to_object_id(project_id, "project")},
        {"$set": {"is_archived": archived, "updated_at": datetime.now(UTC)}},
    )


def _backfill_from_workspace(workspace_id: str, project_id: str, oid: ObjectId) -> Optional[Dict[str, Any]]:
    """
    Look for this project's lightweight stub inside the workspace's embedded
    `projects` array and, if found, materialize a full dedicated project
    document for it. This makes Tasks/Calendar/Wiki work for any project
    that predates this module (or otherwise never got mirrored), without
    requiring the user to recreate anything.
    """
    try:
        ws_oid = ObjectId(workspace_id)
    except (InvalidId, TypeError):
        return None

    ws_doc = workspaces_collection.find_one({"_id": ws_oid})
    if ws_doc is None:
        return None

    stub = next(
        (p for p in ws_doc.get("projects", []) if p.get("id") == project_id),
        None,
    )
    if stub is None:
        return None

    now = datetime.now(UTC)
    doc = {
        "_id": oid,
        "workspace_id": workspace_id,
        "name": stub.get("name", "Untitled Project"),
        "description": stub.get("description"),
        "priority": stub.get("priority", "Medium"),
        "status": stub.get("status", "Planning"),
        "progress": stub.get("progress", 0),
        "color": stub.get("color") or "purple",
        "icon": stub.get("icon") or "tactic",
        "due_date": stub.get("due_date"),
        "members": stub.get("members", []),
        "tags": stub.get("tags", []),
        "is_favorite": stub.get("is_favorite", False),
        "is_archived": stub.get("is_archived", False),
        "created_by": ws_doc.get("owner_id"),
        "created_at": now,
        "updated_at": now,
        "activity_log": [],
    }
    projects_collection.insert_one(doc)
    return doc


def _get_project_doc(workspace_id: str, project_id: str) -> Dict[str, Any]:
    """
    Fetch a project detail document, scoped to its owning workspace so a
    project_id from a different workspace can never be addressed here.
    """
    oid = _to_object_id(project_id, "project")

    doc = projects_collection.find_one({"_id": oid, "workspace_id": workspace_id})

    if doc is None:
        doc = _backfill_from_workspace(workspace_id, project_id, oid)

    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found in this workspace",
        )

    return doc


def get_project_for_scope(workspace_id: str, project_id: str) -> Dict[str, Any]:
    """Public entry point used by task_service/calendar_service/wiki_service
    so every module resolves a project the same self-healing way."""
    return _get_project_doc(workspace_id, project_id)


# ---------------------------------------------------------------------------
# Public service functions
# ---------------------------------------------------------------------------


def list_projects(workspace_id: str) -> List[Dict[str, Any]]:
    cursor = projects_collection.find({"workspace_id": workspace_id}).sort(
        "created_at", -1
    )
    return [_serialize_project(doc) for doc in cursor]


def get_project(workspace_id: str, project_id: str) -> Dict[str, Any]:
    doc = _get_project_doc(workspace_id, project_id)
    return _serialize_project(doc)


def update_project(
    workspace_id: str,
    project_id: str,
    payload: ProjectUpdate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    doc = _get_project_doc(workspace_id, project_id)

    updates: Dict[str, Any] = {}
    for field in (
        "name",
        "description",
        "priority",
        "status",
        "progress",
        "color",
        "icon",
        "due_date",
        "tags",
    ):
        value = getattr(payload, field)
        if value is not None:
            updates[field] = value.value if hasattr(value, "value") else value

    if payload.member_ids is not None:
        # Members must already belong to the workspace; the router validates
        # that before calling this function.
        updates["members"] = payload.member_ids

    if not updates:
        return _serialize_project(doc)

    updates["updated_at"] = datetime.now(UTC)
    projects_collection.update_one({"_id": doc["_id"]}, {"$set": updates})

    # Workspace Overview reads the lightweight embedded project summary. Keep
    # it in lockstep with the detail document so edits made in Project
    # Settings are visible immediately when the user navigates back.
    summary_updates = {
        f"projects.$.{field}": value
        for field, value in updates.items()
        if field in {"name", "description", "priority", "status", "progress", "color", "icon", "due_date", "tags", "updated_at"}
    }
    if summary_updates:
        workspaces_collection.update_one(
            {"_id": _to_object_id(workspace_id, "workspace"), "projects.id": project_id},
            {"$set": summary_updates},
        )
    doc.update(updates)

    _log_project_activity(
        doc["_id"],
        "project_updated",
        f"{current_user.get('full_name') or 'A member'} updated project settings",
        current_user,
    )

    return _serialize_project(doc)


def delete_project(workspace_id: str, project_id: str) -> Dict[str, str]:
    """Permanently remove a project and every collection owned by it.

    The workspace summary is updated last, so a failed dependent deletion does
    not leave a workspace pointing at a project that can no longer be opened.
    """
    doc = _get_project_doc(workspace_id, project_id)
    project_id_str = str(doc["_id"])

    tasks_collection.delete_many({"workspace_id": workspace_id, "project_id": project_id_str})
    calendar_events_collection.delete_many({"workspace_id": workspace_id, "project_id": project_id_str})
    wiki_pages_collection.delete_many({"workspace_id": workspace_id, "project_id": project_id_str})
    projects_collection.delete_one({"_id": doc["_id"], "workspace_id": workspace_id})
    workspaces_collection.update_one(
        {"_id": _to_object_id(workspace_id, "workspace")},
        {"$pull": {"projects": {"id": project_id_str}}, "$set": {"updated_at": datetime.now(UTC)}},
    )
    return {"message": "Project deleted successfully"}


def _as_aware_utc(value: datetime) -> datetime:
    """PyMongo returns naive UTC datetimes by default even though this app
    always stores timezone-aware UTC datetimes — normalize before comparing
    so overdue checks never raise on naive-vs-aware comparisons."""
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value


def get_project_stats(workspace_id: str, project_id: str) -> Dict[str, Any]:
    doc = _get_project_doc(workspace_id, project_id)
    project_id_str = str(doc["_id"])

    tasks = list(tasks_collection.find({"project_id": project_id_str}))
    tasks_by_status: Dict[str, int] = {}
    overdue = 0
    now = datetime.now(UTC)
    for t in tasks:
        tasks_by_status[t.get("status", "Todo")] = (
            tasks_by_status.get(t.get("status", "Todo"), 0) + 1
        )
        due = t.get("due_date")
        if due and _as_aware_utc(due) < now and t.get("status") != "Done":
            overdue += 1

    upcoming_events = calendar_events_collection.count_documents(
        {"project_id": project_id_str, "start_time": {"$gte": now}}
    )
    wiki_count = wiki_pages_collection.count_documents(
        {"project_id": project_id_str}
    )

    return {
        "task_count": len(tasks),
        "tasks_by_status": tasks_by_status,
        "overdue_task_count": overdue,
        "upcoming_event_count": upcoming_events,
        "wiki_page_count": wiki_count,
        "member_count": len(doc.get("members", [])),
    }


def get_project_activity(workspace_id: str, project_id: str) -> List[Dict[str, Any]]:
    doc = _get_project_doc(workspace_id, project_id)
    return list(reversed(doc.get("activity_log", [])))
