"""Optional Google Calendar OAuth entry points.

The application calendar remains authoritative; these routes only expose the
connection lifecycle when deployment credentials are configured.
"""
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, HTTPException, status
from app.config import settings
from app.core.auth import get_current_user
from app.database.database import google_calendar_tokens_collection

router = APIRouter()

def _configured():
    return all((settings.GOOGLE_OAUTH_CLIENT_ID, settings.GOOGLE_OAUTH_CLIENT_SECRET, settings.GOOGLE_OAUTH_REDIRECT_URI))

@router.get("/status")
def google_status(current_user=Depends(get_current_user)):
    token = google_calendar_tokens_collection.find_one({"user_id": current_user["_id"]})
    return {"connected": bool(token), "configured": _configured()}

@router.get("/connect")
def connect_google(current_user=Depends(get_current_user)):
    if not _configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google Calendar integration is not configured")
    state = current_user["_id"]
    query = urlencode({"client_id": settings.GOOGLE_OAUTH_CLIENT_ID, "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI, "response_type": "code", "scope": "https://www.googleapis.com/auth/calendar.events", "access_type": "offline", "prompt": "consent", "state": state})
    return {"authorization_url": f"https://accounts.google.com/o/oauth2/v2/auth?{query}"}

@router.get("/callback")
def google_callback(code: str, state: str):
    # Token exchange is deliberately disabled until a server-side encrypted
    # secret store is configured; OAuth credentials must never be persisted in
    # plaintext or accepted from the browser.
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Configure encrypted token storage to complete Google Calendar connection")
