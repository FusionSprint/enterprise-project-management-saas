from typing import List, Optional

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.workspace_guard import get_workspace_and_member
from app.schemas.task_schema import (
    TaskCommentCreate,
    TaskCommentOut,
    TaskCreate,
    TaskOut,
    TaskUpdate,
)
from app.schemas.workspace_schema import MessageResponse
from app.services import task_service

router = APIRouter()


@router.post(
    "",
    response_model=TaskOut,
    status_code=201,
    summary="Create a task",
)
def create_task(
    workspace_id: str,
    project_id: str,
    payload: TaskCreate,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return task_service.create_task(workspace_id, project_id, payload, current_user)


@router.get(
    "",
    response_model=List[TaskOut],
    summary="List tasks (with filters/sort)",
)
def list_tasks(
    workspace_id: str,
    project_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assignee_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    current_user=Depends(get_current_user),
):
    """
    Backs the Kanban Board, List View, and Timeline View — each is just a
    different rendering of the same task list, optionally filtered/sorted.
    """
    get_workspace_and_member(workspace_id, current_user)
    return task_service.list_tasks(
        workspace_id, project_id, status, priority, assignee_id, search, sort_by
    )


@router.get(
    "/{task_id}",
    response_model=TaskOut,
    summary="Get a single task",
)
def get_task(
    workspace_id: str,
    project_id: str,
    task_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return task_service.get_task(workspace_id, project_id, task_id)


@router.put(
    "/{task_id}",
    response_model=TaskOut,
    summary="Update a task (including drag-and-drop status change)",
)
def update_task(
    workspace_id: str,
    project_id: str,
    task_id: str,
    payload: TaskUpdate,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return task_service.update_task(
        workspace_id, project_id, task_id, payload, current_user
    )


@router.delete(
    "/{task_id}",
    response_model=MessageResponse,
    summary="Delete a task",
)
def delete_task(
    workspace_id: str,
    project_id: str,
    task_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return task_service.delete_task(workspace_id, project_id, task_id, current_user)


@router.post(
    "/{task_id}/comments",
    response_model=TaskOut,
    summary="Add a comment to a task",
)
def add_comment(
    workspace_id: str,
    project_id: str,
    task_id: str,
    payload: TaskCommentCreate,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return task_service.add_comment(
        workspace_id, project_id, task_id, payload, current_user
    )


@router.get(
    "/{task_id}/comments",
    response_model=List[TaskCommentOut],
    summary="List a task's comments",
)
def list_comments(
    workspace_id: str,
    project_id: str,
    task_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return task_service.list_comments(workspace_id, project_id, task_id)
