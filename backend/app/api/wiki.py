from typing import List, Optional

from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.core.workspace_guard import get_workspace_and_member
from app.schemas.wiki_schema import (
    WikiHistoryEntryOut,
    WikiPageCreate,
    WikiPageOut,
    WikiPageUpdate,
)
from app.schemas.workspace_schema import MessageResponse
from app.services import wiki_service

router = APIRouter()


@router.post(
    "",
    response_model=WikiPageOut,
    status_code=201,
    summary="Create a wiki page",
)
def create_page(
    workspace_id: str,
    project_id: str,
    payload: WikiPageCreate,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return wiki_service.create_page(workspace_id, project_id, payload, current_user)


@router.get(
    "",
    response_model=List[WikiPageOut],
    summary="List / search wiki pages",
)
def list_pages(
    workspace_id: str,
    project_id: str,
    q: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return wiki_service.list_pages(workspace_id, project_id, q)


@router.get(
    "/{page_id}",
    response_model=WikiPageOut,
    summary="Get a single wiki page",
)
def get_page(
    workspace_id: str,
    project_id: str,
    page_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return wiki_service.get_page(workspace_id, project_id, page_id)


@router.put(
    "/{page_id}",
    response_model=WikiPageOut,
    summary="Update a wiki page (records edit history)",
)
def update_page(
    workspace_id: str,
    project_id: str,
    page_id: str,
    payload: WikiPageUpdate,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return wiki_service.update_page(workspace_id, project_id, page_id, payload, current_user)


@router.delete(
    "/{page_id}",
    response_model=MessageResponse,
    summary="Delete a wiki page",
)
def delete_page(
    workspace_id: str,
    project_id: str,
    page_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return wiki_service.delete_page(workspace_id, project_id, page_id)


@router.get(
    "/{page_id}/history",
    response_model=List[WikiHistoryEntryOut],
    summary="Get a wiki page's edit history",
)
def get_history(
    workspace_id: str,
    project_id: str,
    page_id: str,
    current_user=Depends(get_current_user),
):
    get_workspace_and_member(workspace_id, current_user)
    return wiki_service.get_history(workspace_id, project_id, page_id)
