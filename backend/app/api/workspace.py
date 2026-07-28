from typing import List

from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user
from app.schemas.workspace_schema import (
    AnnouncementCreate,
    ChangeMemberRoleRequest,
    InviteMemberRequest,
    MessageResponse,
    ProjectCreate,
    WorkspaceCreate,
    WorkspaceOut,
    WorkspaceStatsOut,
    WorkspaceUpdate,
)
from app.services import workspace_service

router = APIRouter()


@router.post(
    "",
    response_model=WorkspaceOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new workspace",
)
def create_workspace(
    payload: WorkspaceCreate,
    current_user=Depends(get_current_user),
):
    """
    Create a new workspace. The authenticated user automatically becomes the Owner.
    """
    return workspace_service.create_workspace(payload, current_user)


@router.get(
    "",
    response_model=List[WorkspaceOut],
    summary="List my workspaces",
)
def list_workspaces(
    current_user=Depends(get_current_user),
):
    """
    Return every workspace where the authenticated user is a member.
    """
    return workspace_service.get_user_workspaces(current_user)


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceOut,
    summary="Get a single workspace",
)
def get_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    """
    Retrieve a single workspace by id. Only members may view it.
    """
    return workspace_service.get_workspace(workspace_id, current_user)


@router.put(
    "/{workspace_id}",
    response_model=WorkspaceOut,
    summary="Update a workspace",
)
def update_workspace(
    workspace_id: str,
    payload: WorkspaceUpdate,
    current_user=Depends(get_current_user),
):
    """
    Update workspace name/description. Owner or Admin only.
    """
    return workspace_service.update_workspace(workspace_id, payload, current_user)


@router.delete(
    "/{workspace_id}",
    response_model=MessageResponse,
    summary="Delete a workspace (soft delete)",
)
def delete_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    """
    Soft-delete a workspace (sets is_deleted=True). Owner only.
    """
    return workspace_service.delete_workspace(workspace_id, current_user)


@router.post(
    "/{workspace_id}/invite",
    response_model=MessageResponse,
    summary="Invite a member to a workspace",
)
def invite_member(
    workspace_id: str,
    payload: InviteMemberRequest,
    current_user=Depends(get_current_user),
):
    """
    Invite an already-registered user (by email) into the workspace with a given role.
    Owner or Admin only.
    """
    return workspace_service.invite_member(workspace_id, payload, current_user)


@router.delete(
    "/{workspace_id}/members/{user_id}",
    response_model=MessageResponse,
    summary="Remove a member from a workspace",
)
def remove_member(
    workspace_id: str,
    user_id: str,
    current_user=Depends(get_current_user),
):
    """
    Remove a member from the workspace. Owner or Admin only. The Owner cannot remove themselves.
    """
    return workspace_service.remove_member(workspace_id, user_id, current_user)


@router.patch(
    "/{workspace_id}/members/{user_id}",
    response_model=MessageResponse,
    summary="Change a member's role",
)
def change_member_role(
    workspace_id: str,
    user_id: str,
    payload: ChangeMemberRoleRequest,
    current_user=Depends(get_current_user),
):
    """
    Change a member's role within the workspace. Owner only.
    """
    return workspace_service.change_member_role(
        workspace_id, user_id, payload, current_user
    )

@router.patch(
    "/{workspace_id}/archive",
    response_model=WorkspaceOut,
    summary="Archive a workspace",
)
def archive_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    """
    Archive a workspace (soft state, distinct from delete). Owner or Admin only.
    """
    return workspace_service.set_workspace_archived(workspace_id, True, current_user)


@router.patch(
    "/{workspace_id}/unarchive",
    response_model=WorkspaceOut,
    summary="Unarchive a workspace",
)
def unarchive_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    """
    Restore an archived workspace. Owner or Admin only.
    """
    return workspace_service.set_workspace_archived(workspace_id, False, current_user)


@router.post(
    "/{workspace_id}/favorite",
    response_model=WorkspaceOut,
    summary="Favorite a workspace",
)
def favorite_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    """
    Mark a workspace as a favorite for the current user only.
    """
    return workspace_service.set_workspace_favorite(workspace_id, True, current_user)


@router.delete(
    "/{workspace_id}/favorite",
    response_model=WorkspaceOut,
    summary="Unfavorite a workspace",
)
def unfavorite_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    """
    Remove a workspace from the current user's favorites.
    """
    return workspace_service.set_workspace_favorite(workspace_id, False, current_user)


@router.post(
    "/{workspace_id}/announcements",
    response_model=WorkspaceOut,
    summary="Post a workspace announcement",
)
def post_announcement(
    workspace_id: str,
    payload: AnnouncementCreate,
    current_user=Depends(get_current_user),
):
    """
    Post an announcement to the workspace. Owner or Admin only.
    """
    return workspace_service.add_announcement(workspace_id, payload, current_user)


@router.get(
    "/{workspace_id}/stats",
    response_model=WorkspaceStatsOut,
    summary="Get workspace statistics",
)
def get_workspace_stats(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    """
    Return real, derived statistics for a workspace.
    """
    return workspace_service.get_workspace_stats(workspace_id, current_user)


@router.post(
    "/{workspace_id}/projects",
    response_model=WorkspaceOut,
    summary="Create a project inside a workspace",
)
def create_project(
    workspace_id: str,
    payload: ProjectCreate,
    current_user=Depends(get_current_user),
):
    """
    Create a lightweight Project stub inside this workspace. Create Project
    lives ONLY here (Workspace Overview) — not on the Project Dashboard.
    """
    return workspace_service.add_project(workspace_id, payload, current_user)


@router.post(
    "/{workspace_id}/projects/{project_id}/favorite",
    response_model=WorkspaceOut,
    summary="Favorite a project",
)
def favorite_project(
    workspace_id: str,
    project_id: str,
    current_user=Depends(get_current_user),
):
    return workspace_service.set_project_favorite(workspace_id, project_id, True, current_user)


@router.delete(
    "/{workspace_id}/projects/{project_id}/favorite",
    response_model=WorkspaceOut,
    summary="Unfavorite a project",
)
def unfavorite_project(
    workspace_id: str,
    project_id: str,
    current_user=Depends(get_current_user),
):
    return workspace_service.set_project_favorite(workspace_id, project_id, False, current_user)


@router.patch(
    "/{workspace_id}/projects/{project_id}/archive",
    response_model=WorkspaceOut,
    summary="Archive a project",
)
def archive_project(
    workspace_id: str,
    project_id: str,
    current_user=Depends(get_current_user),
):
    return workspace_service.set_project_archived(workspace_id, project_id, True, current_user)


@router.patch(
    "/{workspace_id}/projects/{project_id}/unarchive",
    response_model=WorkspaceOut,
    summary="Unarchive a project",
)
def unarchive_project(
    workspace_id: str,
    project_id: str,
    current_user=Depends(get_current_user),
):
    return workspace_service.set_project_archived(workspace_id, project_id, False, current_user)
