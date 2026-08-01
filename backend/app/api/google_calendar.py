"""Google Calendar OAuth entry points.

The application calendar remains authoritative for project events and task
deadlines; this module only handles the connection lifecycle (consent
redirect, token exchange, status) when deployment credentials are
configured.
"""
import json
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, UTC, timedelta
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse

from app.config import settings
from app.core.auth import get_current_user
from app.core.crypto import encrypt_value
from app.database.database import google_calendar_tokens_collection

router = APIRouter()

GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_CALENDAR_URL = "https://calendar.google.com/calendar/u/0/r"


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
    """Google redirects the browser here after the user approves consent.
    Exchanges the one-time code for real tokens, stores them encrypted
    (never in plaintext), then sends the browser on to Google Calendar."""
    if not _configured():
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Google Calendar integration is not configured")

    payload = urlencode({
        "code": code,
        "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
        "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
        "grant_type": "authorization_code",
    }).encode()

    request = urllib.request.Request(GOOGLE_TOKEN_ENDPOINT, data=payload, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            token_data = json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode() if exc.fp else str(exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Google rejected the token exchange: {detail}")
    except urllib.error.URLError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Couldn't reach Google's token endpoint: {exc.reason}")

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google didn't return an access token")

    now = datetime.now(UTC)
    expires_in = token_data.get("expires_in", 3600)
    update = {
        "user_id": state,
        "access_token": encrypt_value(access_token),
        "scope": token_data.get("scope"),
        "token_type": token_data.get("token_type"),
        "expires_at": now + timedelta(seconds=expires_in),
        "updated_at": now,
    }
    # Google only returns a refresh_token on the *first* consent for a given
    # user/app pair — don't overwrite an existing one with a missing value
    # on subsequent reconnects.
    if token_data.get("refresh_token"):
        update["refresh_token"] = encrypt_value(token_data["refresh_token"])

    google_calendar_tokens_collection.update_one(
        {"user_id": state},
        {"$set": update, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )

    return RedirectResponse(url=GOOGLE_CALENDAR_URL)
