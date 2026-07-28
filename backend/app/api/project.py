from typing import List

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.workspace_guard import get_workspace_and_member, get_workspace_with_role
from app.schemas.project_schema import (
    ProjectDetailOut,
    ProjectStatsOut,
    ProjectActivityEntryOut,
    ProjectUpdate,
)
from app.services import project_service
from app.schemas.workspace_schema import MessageResponse, WorkspaceRole

router = APIRouter()


@router.get(
    "",
    response_model=List[ProjectDetailOut],
    summary="List projects in a workspace",
)
def list_projects(
    workspace_id: str,
    current_user=Depends(get_current_user),
):
    """
    Return every Project detail record belonging to this workspace.
    Only workspace members may view it.
    """
    get_workspace_and_member(workspace_id, current_user)
    return project_service.list_projects(workspace_id)


@router.get(
    "/{project_id}",
    response_model=ProjectDetailOut,
    summary="Get a single project (Project Dashboard load)",
)
def get_project(
    workspace_id: str,
    project_id: str,
    current_user=Depends(get_current_user),
):
    """
    Load one Project's full detail — this is what the Project Dashboard
    calls when a user opens a specific project from Workspace Overview.
    """
    get_workspace_and_member(workspace_id, current_user)
    return project_service.get_project(workspace_id, project_id)


@router.put(
    "/{project_id}",
    response_model=ProjectDetailOut,
    summary="Update a project's detail record",
)
def update_project(
    workspace_id: str,
    project_id: str,
    payload: ProjectUpdate,
    current_user=Depends(get_current_user),
):
    """
    Update project fields shown on the Project Dashboard's Overview tab
    (name, description, priority, status, progress, due date, tags, etc).
    Any workspace member may update it (matches the existing embedded
    Create Project permission model — any member).
    """
    get_workspace_and_member(workspace_id, current_user)
    return project_service.update_project(
        workspace_id, project_id, payload, current_user
    )


@router.delete(
    "/{project_id}",
    response_model=MessageResponse,
    summary="Permanently delete a project and its project-scoped records",
)
def delete_project(
    workspace_id: str,
    project_id: str,
    current_user=Depends(get_current_user),
):
    """Owner-only destructive operation; removes the project, tasks, events,
    and wiki pages, then removes its embedded workspace summary."""
    get_workspace_with_role(workspace_id, current_user, {WorkspaceRole.OWNER})
    return project_service.delete_project(workspace_id, project_id)


@router.get(
    "/{project_id}/stats",
    response_model=ProjectStatsOut,
    summary="Get project statistics",
)
def get_project_stats(
    workspace_id: str,
    project_id: str,
    current_user=Depends(get_current_user),
):
    """Real, derived statistics for the Project Overview tab."""
    get_workspace_and_member(workspace_id, current_user)
    return project_service.get_project_stats(workspace_id, project_id)


@router.get(
    "/{project_id}/activity",
    response_model=List[ProjectActivityEntryOut],
    summary="Get project activity timeline",
)
def get_project_activity(
    workspace_id: str,
    project_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return project_service.get_project_activity(workspace_id, project_id)
