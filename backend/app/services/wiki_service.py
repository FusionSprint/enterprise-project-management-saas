from datetime import datetime, UTC
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.database.database import wiki_pages_collection
from app.schemas.wiki_schema import WikiPageCreate, WikiPageUpdate


def _to_object_id(id_str: str, entity_name: str = "resource") -> ObjectId:
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {entity_name} id",
        )


def _serialize_page(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc["_id"]),
        "project_id": doc["project_id"],
        "workspace_id": doc["workspace_id"],
        "title": doc["title"],
        "body": doc.get("body", ""),
        "version": doc.get("version", 1),
        "created_by": doc.get("created_by"),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
        "edit_history": doc.get("edit_history", []),
    }


def _get_page_doc(project_id: str, page_id: str) -> Dict[str, Any]:
    doc = wiki_pages_collection.find_one(
        {"_id": _to_object_id(page_id, "wiki page"), "project_id": project_id}
    )
    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wiki page not found in this project",
        )
    return doc


def create_page(
    workspace_id: str,
    project_id: str,
    payload: WikiPageCreate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    now = datetime.now(UTC)
    doc = {
        "project_id": project_id,
        "workspace_id": workspace_id,
        "title": payload.title,
        "body": payload.body or "",
        "version": 1,
        "created_by": current_user["_id"],
        "created_at": now,
        "updated_at": now,
        "edit_history": [],
    }
    result = wiki_pages_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize_page(doc)


def list_pages(
    workspace_id: str,
    project_id: str,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {"project_id": project_id, "workspace_id": workspace_id}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"body": {"$regex": search, "$options": "i"}},
        ]
    cursor = wiki_pages_collection.find(query).sort("updated_at", -1)
    return [_serialize_page(doc) for doc in cursor]


def get_page(workspace_id: str, project_id: str, page_id: str) -> Dict[str, Any]:
    return _serialize_page(_get_page_doc(project_id, page_id))


def update_page(
    workspace_id: str,
    project_id: str,
    page_id: str,
    payload: WikiPageUpdate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    doc = _get_page_doc(project_id, page_id)

    if payload.title is None and payload.body is None:
        return _serialize_page(doc)

    # Snapshot the current version into history before overwriting it.
    history_entry = {
        "version": doc.get("version", 1),
        "title": doc["title"],
        "body": doc.get("body", ""),
        "edited_by": doc.get("created_by"),
        "edited_by_name": None,
        "edited_at": doc["updated_at"],
    }

    now = datetime.now(UTC)
    updates: Dict[str, Any] = {
        "title": payload.title if payload.title is not None else doc["title"],
        "body": payload.body if payload.body is not None else doc.get("body", ""),
        "version": doc.get("version", 1) + 1,
        "updated_at": now,
    }

    wiki_pages_collection.update_one(
        {"_id": doc["_id"]},
        {
            "$set": updates,
            "$push": {"edit_history": history_entry},
        },
    )
    doc.update(updates)
    doc.setdefault("edit_history", []).append(history_entry)

    return _serialize_page(doc)


def delete_page(workspace_id: str, project_id: str, page_id: str) -> Dict[str, Any]:
    doc = _get_page_doc(project_id, page_id)
    wiki_pages_collection.delete_one({"_id": doc["_id"]})
    return {"message": "Wiki page deleted successfully"}


def get_history(workspace_id: str, project_id: str, page_id: str) -> List[Dict[str, Any]]:
    doc = _get_page_doc(project_id, page_id)
    return list(reversed(doc.get("edit_history", [])))
