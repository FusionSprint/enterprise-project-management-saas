from datetime import datetime, UTC
from typing import Any, Dict, List, Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from app.database.database import users_collection, workspaces_collection
from app.schemas.workspace_schema import (
    AnnouncementCreate,
    ChangeMemberRoleRequest,
    InviteMemberRequest,
    ProjectCreate,
    WorkspaceCreate,
    WorkspaceRole,
    WorkspaceType,
    WorkspaceUpdate,
)

# ---------------------------------------------------------------------------
# Role / permission configuration
# ---------------------------------------------------------------------------

# Roles allowed to perform each workspace-level action. Kept centralised so
# authorization rules live in exactly one place.
ROLES_CAN_UPDATE_WORKSPACE = {WorkspaceRole.OWNER, WorkspaceRole.ADMIN}
ROLES_CAN_DELETE_WORKSPACE = {WorkspaceRole.OWNER}
ROLES_CAN_INVITE_MEMBERS = {WorkspaceRole.OWNER, WorkspaceRole.ADMIN}
ROLES_CAN_REMOVE_MEMBERS = {WorkspaceRole.OWNER, WorkspaceRole.ADMIN}
ROLES_CAN_CHANGE_ROLES = {WorkspaceRole.OWNER}
ROLES_CAN_ARCHIVE_WORKSPACE = {WorkspaceRole.OWNER, WorkspaceRole.ADMIN}
ROLES_CAN_POST_ANNOUNCEMENTS = {WorkspaceRole.OWNER, WorkspaceRole.ADMIN}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


def _to_object_id(id_str: str, entity_name: str = "resource") -> ObjectId:
    """
    Convert a string id to a Mongo ObjectId, raising a 400 if it is malformed.
    """
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {entity_name} id",
        )


def _serialize_workspace(
    doc: Dict[str, Any],
    current_user_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Convert a raw MongoDB workspace document into a JSON/Pydantic-friendly dict.
    """
    members = doc.get("members", [])
    favorited_by = doc.get("favorited_by", [])

    return {
        "id": str(doc["_id"]),
        "workspace_name": doc["workspace_name"],
        "description": doc.get("description"),
        "owner_id": doc["owner_id"],
        "members": members,
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
        "is_deleted": doc.get("is_deleted", False),
        "icon": doc.get("icon") or "rocket_launch",
        "color": doc.get("color") or "purple",
        "workspace_type": doc.get("workspace_type") or WorkspaceType.PRIVATE.value,
        "tags": doc.get("tags", []),
        "is_archived": doc.get("is_archived", False),
        "is_favorite": bool(current_user_id) and current_user_id in favorited_by,
        "member_count": len(members),
        "announcements": doc.get("announcements", []),
        "recent_activity": list(reversed(doc.get("activity_log", [])))[:20],
        "projects": doc.get("projects", []),
    }


def _log_activity(
    workspace_id: ObjectId,
    entry_type: str,
    message: str,
    current_user: Dict[str, Any],
) -> None:
    """
    Append a real (non-simulated) entry to the workspace's activity timeline.
    Best-effort: failures here should never break the calling action.
    """
    entry = {
        "id": str(ObjectId()),
        "type": entry_type,
        "message": message,
        "actor_id": current_user.get("_id"),
        "actor_name": current_user.get("full_name"),
        "created_at": datetime.now(UTC),
    }
    workspaces_collection.update_one(
        {"_id": workspace_id},
        {"$push": {"activity_log": entry}},
    )


def _get_workspace_doc(workspace_id: str) -> Dict[str, Any]:
    """
    Fetch a non-deleted workspace document by id, or raise 404.
    """
    oid = _to_object_id(workspace_id, "workspace")

    doc = workspaces_collection.find_one({"_id": oid, "is_deleted": False})

    if doc is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )

    return doc


def _find_member(doc: Dict[str, Any], user_id: str) -> Optional[Dict[str, Any]]:
    """
    Return the member sub-document for a given user_id, or None.
    """
    for member in doc.get("members", []):
        if member.get("user_id") == user_id:
            return member
    return None


def _require_membership(doc: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    """
    Ensure the user is a member of the workspace. Returns their member entry.
    """
    member = _find_member(doc, user_id)

    if member is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this workspace",
        )

    return member


def _require_role(
    doc: Dict[str, Any],
    user_id: str,
    allowed_roles: set,
) -> Dict[str, Any]:
    """
    Ensure the user is a member of the workspace AND holds one of the allowed roles.
    """
    member = _require_membership(doc, user_id)

    if member.get("role") not in {role.value for role in allowed_roles}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action",
        )

    return member


def _check_duplicate_name(
    owner_id: str,
    workspace_name: str,
    exclude_workspace_id: Optional[ObjectId] = None,
) -> None:
    """
    Ensure the given owner does not already have another workspace with the same name.
    Comparison is case-insensitive.
    """
    query: Dict[str, Any] = {
        "owner_id": owner_id,
        "is_deleted": False,
        "workspace_name": {
            "$regex": f"^{workspace_name}$",
            "$options": "i",
        },
    }

    if exclude_workspace_id is not None:
        query["_id"] = {"$ne": exclude_workspace_id}

    if workspaces_collection.find_one(query):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a workspace with this name",
        )


# ---------------------------------------------------------------------------
# Service functions
# ---------------------------------------------------------------------------


def create_workspace(
    payload: WorkspaceCreate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Create a new workspace. The creator automatically becomes the Owner.
    """
    owner_id = current_user["_id"]

    _check_duplicate_name(owner_id, payload.workspace_name)

    now = datetime.now(UTC)

    workspace_doc = {
        "workspace_name": payload.workspace_name,
        "description": payload.description,
        "owner_id": owner_id,
        "members": [
            {
                "user_id": owner_id,
                "email": current_user.get("email"),
                "full_name": current_user.get("full_name"),
                "role": WorkspaceRole.OWNER.value,
                "joined_at": now,
            }
        ],
        "created_at": now,
        "updated_at": now,
        "is_deleted": False,
        "icon": payload.icon or "rocket_launch",
        "color": payload.color or "purple",
        "workspace_type": (payload.workspace_type or WorkspaceType.PRIVATE).value,
        "tags": payload.tags or [],
        "is_archived": False,
        "favorited_by": [],
        "announcements": [],
        "activity_log": [
            {
                "id": str(ObjectId()),
                "type": "workspace_created",
                "message": f"{current_user.get('full_name') or 'A member'} created this workspace",
                "actor_id": owner_id,
                "actor_name": current_user.get("full_name"),
                "created_at": now,
            }
        ],
    }

    result = workspaces_collection.insert_one(workspace_doc)
    workspace_doc["_id"] = result.inserted_id

    # Best-effort invites for any emails supplied at creation time. A missing
    # or already-invited user should not fail workspace creation itself.
    for email in payload.invite_emails or []:
        invited_user = users_collection.find_one({"email": email})
        if invited_user is None:
            continue
        invited_user_id = str(invited_user["_id"])
        if invited_user_id == owner_id:
            continue
        new_member = {
            "user_id": invited_user_id,
            "email": invited_user.get("email"),
            "full_name": invited_user.get("full_name"),
            "role": WorkspaceRole.TEAM_MEMBER.value,
            "joined_at": datetime.now(UTC),
        }
        workspaces_collection.update_one(
            {"_id": workspace_doc["_id"]},
            {"$push": {"members": new_member}},
        )
        workspace_doc["members"].append(new_member)

    return _serialize_workspace(workspace_doc, current_user_id=owner_id)


def get_user_workspaces(current_user: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Return all non-deleted workspaces where the current user is a member.
    """
    user_id = current_user["_id"]

    cursor = workspaces_collection.find(
        {
            "members.user_id": user_id,
            "is_deleted": False,
        }
    ).sort("created_at", -1)

    return [_serialize_workspace(doc, current_user_id=user_id) for doc in cursor]


def get_workspace(
    workspace_id: str,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Return a single workspace. Only members may view it.
    """
    doc = _get_workspace_doc(workspace_id)

    _require_membership(doc, current_user["_id"])

    return _serialize_workspace(doc, current_user_id=current_user["_id"])


def update_workspace(
    workspace_id: str,
    payload: WorkspaceUpdate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Update workspace details. Only Owner/Admin members may do this.
    """
    doc = _get_workspace_doc(workspace_id)

    _require_role(doc, current_user["_id"], ROLES_CAN_UPDATE_WORKSPACE)

    updates: Dict[str, Any] = {}

    if payload.workspace_name is not None:
        _check_duplicate_name(
            doc["owner_id"],
            payload.workspace_name,
            exclude_workspace_id=doc["_id"],
        )
        updates["workspace_name"] = payload.workspace_name

    if payload.description is not None:
        updates["description"] = payload.description

    if payload.icon is not None:
        updates["icon"] = payload.icon

    if payload.color is not None:
        updates["color"] = payload.color

    if payload.workspace_type is not None:
        updates["workspace_type"] = payload.workspace_type.value

    if payload.tags is not None:
        updates["tags"] = payload.tags

    if not updates:
        # Nothing to change; return the workspace as-is.
        return _serialize_workspace(doc, current_user_id=current_user["_id"])

    updates["updated_at"] = datetime.now(UTC)

    workspaces_collection.update_one({"_id": doc["_id"]}, {"$set": updates})

    doc.update(updates)

    _log_activity(
        doc["_id"],
        "workspace_updated",
        f"{current_user.get('full_name') or 'A member'} updated workspace settings",
        current_user,
    )

    return _serialize_workspace(doc, current_user_id=current_user["_id"])


def delete_workspace(
    workspace_id: str,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Soft-delete a workspace (is_deleted=True). Owner only.
    """
    doc = _get_workspace_doc(workspace_id)

    _require_role(doc, current_user["_id"], ROLES_CAN_DELETE_WORKSPACE)

    workspaces_collection.update_one(
        {"_id": doc["_id"]},
        {
            "$set": {
                "is_deleted": True,
                "updated_at": datetime.now(UTC),
            }
        },
    )

    return {"message": "Workspace deleted successfully"}


def invite_member(
    workspace_id: str,
    payload: InviteMemberRequest,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Invite a registered user (by email) into the workspace with a given role.
    """
    if payload.role == WorkspaceRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot invite a member directly as Owner",
        )

    doc = _get_workspace_doc(workspace_id)

    _require_role(doc, current_user["_id"], ROLES_CAN_INVITE_MEMBERS)

    invited_user = users_collection.find_one({"email": payload.email})

    if invited_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registered user found with this email",
        )

    invited_user_id = str(invited_user["_id"])

    if _find_member(doc, invited_user_id) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a member of this workspace",
        )

    new_member = {
        "user_id": invited_user_id,
        "email": invited_user.get("email"),
        "full_name": invited_user.get("full_name"),
        "role": payload.role.value,
        "joined_at": datetime.now(UTC),
    }

    workspaces_collection.update_one(
        {"_id": doc["_id"]},
        {
            "$push": {"members": new_member},
            "$set": {"updated_at": datetime.now(UTC)},
        },
    )

    _log_activity(
        doc["_id"],
        "member_invited",
        f"{invited_user.get('full_name') or payload.email} joined as {payload.role.value}",
        current_user,
    )

    from app.services.notification_service import create_notification
    create_notification(invited_user_id, "workspace_invite", "You joined a workspace", f"You were added to {doc['workspace_name']} as {payload.role.value}.", workspace_id=workspace_id)
    return {"message": "Member invited successfully"}


def remove_member(
    workspace_id: str,
    member_user_id: str,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Remove a member from the workspace. Only Owner/Admin. Owner cannot remove themselves.
    """
    doc = _get_workspace_doc(workspace_id)

    _require_role(doc, current_user["_id"], ROLES_CAN_REMOVE_MEMBERS)

    if member_user_id == doc["owner_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The workspace owner cannot be removed",
        )

    if _find_member(doc, member_user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this workspace",
        )

    removed_member = _find_member(doc, member_user_id)

    workspaces_collection.update_one(
        {"_id": doc["_id"]},
        {
            "$pull": {"members": {"user_id": member_user_id}},
            "$set": {"updated_at": datetime.now(UTC)},
        },
    )

    _log_activity(
        doc["_id"],
        "member_removed",
        f"{(removed_member or {}).get('full_name') or 'A member'} was removed from the workspace",
        current_user,
    )

    return {"message": "Member removed successfully"}


def change_member_role(
    workspace_id: str,
    member_user_id: str,
    payload: ChangeMemberRoleRequest,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Change a member's role within the workspace. Owner only.
    """
    if payload.role == WorkspaceRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ownership cannot be reassigned through this endpoint",
        )

    doc = _get_workspace_doc(workspace_id)

    _require_role(doc, current_user["_id"], ROLES_CAN_CHANGE_ROLES)

    if member_user_id == doc["owner_id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The workspace owner's role cannot be changed",
        )

    if _find_member(doc, member_user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this workspace",
        )

    workspaces_collection.update_one(
        {"_id": doc["_id"], "members.user_id": member_user_id},
        {
            "$set": {
                "members.$.role": payload.role.value,
                "updated_at": datetime.now(UTC),
            }
        },
    )

    return {"message": "Member role updated successfully"}

# ---------------------------------------------------------------------------
# Additive Workspace-module functions (archive, favorites, announcements,
# activity, stats). These build on the collections/helpers above without
# touching any existing function's behaviour.
# ---------------------------------------------------------------------------


def set_workspace_archived(
    workspace_id: str,
    archived: bool,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Archive or unarchive a workspace. Owner or Admin only.
    """
    doc = _get_workspace_doc(workspace_id)

    _require_role(doc, current_user["_id"], ROLES_CAN_ARCHIVE_WORKSPACE)

    workspaces_collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"is_archived": archived, "updated_at": datetime.now(UTC)}},
    )
    doc["is_archived"] = archived

    _log_activity(
        doc["_id"],
        "workspace_archived" if archived else "workspace_unarchived",
        f"{current_user.get('full_name') or 'A member'} "
        f"{'archived' if archived else 'restored'} this workspace",
        current_user,
    )

    if archived:
        from app.services.notification_service import create_notification
        for member in doc.get("members", []):
            if member["user_id"] != current_user["_id"]:
                create_notification(member["user_id"], "workspace_archived", "Workspace archived", f"{doc['workspace_name']} was archived.", workspace_id=workspace_id)
    return _serialize_workspace(doc, current_user_id=current_user["_id"])


def set_workspace_favorite(
    workspace_id: str,
    favorite: bool,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Favorite or unfavorite a workspace for the current user only. Any member may do this;
    it does not affect other members' view of the workspace.
    """
    doc = _get_workspace_doc(workspace_id)

    user_id = current_user["_id"]
    _require_membership(doc, user_id)

    op = "$addToSet" if favorite else "$pull"
    workspaces_collection.update_one(
        {"_id": doc["_id"]},
        {op: {"favorited_by": user_id}},
    )

    favorited_by = set(doc.get("favorited_by", []))
    if favorite:
        favorited_by.add(user_id)
    else:
        favorited_by.discard(user_id)
    doc["favorited_by"] = list(favorited_by)

    return _serialize_workspace(doc, current_user_id=user_id)


def add_announcement(
    workspace_id: str,
    payload: AnnouncementCreate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Post an announcement to the workspace. Owner or Admin only.
    """
    doc = _get_workspace_doc(workspace_id)

    _require_role(doc, current_user["_id"], ROLES_CAN_POST_ANNOUNCEMENTS)

    announcement = {
        "id": str(ObjectId()),
        "title": payload.title,
        "body": payload.body,
        "author_id": current_user["_id"],
        "author_name": current_user.get("full_name"),
        "created_at": datetime.now(UTC),
    }

    workspaces_collection.update_one(
        {"_id": doc["_id"]},
        {
            "$push": {"announcements": {"$each": [announcement], "$position": 0}},
            "$set": {"updated_at": datetime.now(UTC)},
        },
    )

    _log_activity(
        doc["_id"],
        "announcement_posted",
        f"{current_user.get('full_name') or 'A member'} posted an announcement: {payload.title}",
        current_user,
    )

    doc.setdefault("announcements", []).insert(0, announcement)

    return _serialize_workspace(doc, current_user_id=current_user["_id"])


def get_workspace_stats(
    workspace_id: str,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Return real, derived statistics for a workspace (no simulated numbers).
    Project count is 0 until a Project module/collection exists to count against.
    """
    doc = _get_workspace_doc(workspace_id)

    _require_membership(doc, current_user["_id"])

    return {
        "member_count": len(doc.get("members", [])),
        "project_count": len([p for p in doc.get("projects", []) if not p.get("is_archived")]),
        "announcement_count": len(doc.get("announcements", [])),
        "pending_invites": 0,
    }


# ---------------------------------------------------------------------------
# Minimal Project sub-resource (embedded on the Workspace document).
# This intentionally does NOT introduce a separate Project collection,
# service module, or task/kanban logic — that remains out of scope. It only
# gives the Workspace Overview page something real to create/list/hand off
# to the existing Project Dashboard.
# ---------------------------------------------------------------------------


def add_project(
    workspace_id: str,
    payload: ProjectCreate,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Create a lightweight Project stub inside a workspace. Any member may do
    this (Create Project lives inside Workspace Overview, per the enterprise
    flow). Member selection is restricted to users already in the workspace.
    """
    doc = _get_workspace_doc(workspace_id)

    _require_membership(doc, current_user["_id"])

    workspace_member_ids = {m["user_id"] for m in doc.get("members", [])}
    members_by_id = {m["user_id"]: m for m in doc.get("members", [])}

    resolved_members = []
    for member_id in payload.member_ids or []:
        if member_id in workspace_member_ids:
            m = members_by_id[member_id]
            resolved_members.append(
                {
                    "user_id": m["user_id"],
                    "email": m.get("email"),
                    "full_name": m.get("full_name"),
                }
            )
    # Always include the creator so the project has at least one member.
    if current_user["_id"] not in {m["user_id"] for m in resolved_members}:
        resolved_members.insert(
            0,
            {
                "user_id": current_user["_id"],
                "email": current_user.get("email"),
                "full_name": current_user.get("full_name"),
            },
        )

    now = datetime.now(UTC)
    project = {
        "id": str(ObjectId()),
        "name": payload.name,
        "description": payload.description,
        "priority": payload.priority.value,
        "status": "Planning",
        "progress": 0,
        "color": payload.color or "purple",
        "icon": payload.icon or "tactic",
        "due_date": payload.due_date,
        "members": resolved_members,
        "tags": payload.tags or [],
        "is_favorite": False,
        "is_archived": False,
        "created_at": now,
        "updated_at": now,
    }

    workspaces_collection.update_one(
        {"_id": doc["_id"]},
        {
            "$push": {"projects": project},
            "$set": {"updated_at": now},
        },
    )
    doc.setdefault("projects", []).append(project)

    _log_activity(
        doc["_id"],
        "project_created",
        f"{current_user.get('full_name') or 'A member'} created project \"{payload.name}\"",
        current_user,
    )

    # Mirror into the dedicated projects collection (same id) so the Project
    # Dashboard, Tasks, Calendar and Wiki modules have a real record to
    # reference. This is purely additive — it does not change what this
    # function returns to the existing Workspace Overview frontend.
    from app.services import project_service as _project_service

    _project_service.mirror_project_created(
        project["id"], str(doc["_id"]), project, current_user
    )

    return _serialize_workspace(doc, current_user_id=current_user["_id"])


def _require_project(doc: Dict[str, Any], project_id: str) -> Dict[str, Any]:
    for project in doc.get("projects", []):
        if project["id"] == project_id:
            return project
    raise HTTPException(status_code=404, detail="Project not found in this workspace")


def set_project_favorite(
    workspace_id: str,
    project_id: str,
    favorite: bool,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    doc = _get_workspace_doc(workspace_id)
    _require_membership(doc, current_user["_id"])
    _require_project(doc, project_id)

    workspaces_collection.update_one(
        {"_id": doc["_id"], "projects.id": project_id},
        {"$set": {"projects.$.is_favorite": favorite, "updated_at": datetime.now(UTC)}},
    )
    for project in doc.get("projects", []):
        if project["id"] == project_id:
            project["is_favorite"] = favorite

    from app.services import project_service as _project_service

    _project_service.mirror_project_favorite(project_id, favorite)

    return _serialize_workspace(doc, current_user_id=current_user["_id"])


def set_project_archived(
    workspace_id: str,
    project_id: str,
    archived: bool,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    doc = _get_workspace_doc(workspace_id)
    _require_membership(doc, current_user["_id"])
    project = _require_project(doc, project_id)

    workspaces_collection.update_one(
        {"_id": doc["_id"], "projects.id": project_id},
        {"$set": {"projects.$.is_archived": archived, "updated_at": datetime.now(UTC)}},
    )
    for p in doc.get("projects", []):
        if p["id"] == project_id:
            p["is_archived"] = archived

    _log_activity(
        doc["_id"],
        "project_archived" if archived else "project_unarchived",
        f"{current_user.get('full_name') or 'A member'} "
        f"{'archived' if archived else 'restored'} project \"{project['name']}\"",
        current_user,
    )

    from app.services import project_service as _project_service

    _project_service.mirror_project_archived(project_id, archived)

    if archived:
        from app.services.notification_service import create_notification
        for member in project.get("members", []):
            if member["user_id"] != current_user["_id"]:
                create_notification(member["user_id"], "project_archived", "Project archived", f"{project['name']} was archived.", workspace_id=workspace_id, project_id=project_id)

    return _serialize_workspace(doc, current_user_id=current_user["_id"])
