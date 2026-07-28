"""
Shared workspace-membership / role guard, reused by every module that lives
"inside" a workspace (Projects, Tasks, Calendar, Wiki).

This intentionally reuses the exact same private helpers the Workspace
module already relies on internally (app/services/workspace_service.py),
so "is this user allowed to touch this workspace" is decided in exactly one
place across the whole codebase.
"""
from typing import Any, Dict, Set

from app.services.workspace_service import (
    _get_workspace_doc,
    _require_membership,
    _require_role,
)
from app.schemas.workspace_schema import WorkspaceRole


def get_workspace_and_member(
    workspace_id: str,
    current_user: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Fetch the (non-deleted) workspace and confirm the current user is a
    member of it. Raises 404 / 403 exactly like the Workspace module does.
    Returns the raw workspace document.
    """
    doc = _get_workspace_doc(workspace_id)
    _require_membership(doc, current_user["_id"])
    return doc


def get_workspace_with_role(
    workspace_id: str,
    current_user: Dict[str, Any],
    allowed_roles: Set[WorkspaceRole],
) -> Dict[str, Any]:
    """
    Fetch the workspace and confirm the current user holds one of the
    allowed workspace roles (Owner/Admin/etc). Raises 404 / 403.
    """
    doc = _get_workspace_doc(workspace_id)
    _require_role(doc, current_user["_id"], allowed_roles)
    return doc
