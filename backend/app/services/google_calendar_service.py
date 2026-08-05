"""Google Calendar client and synchronization orchestration.

MongoDB remains the source of truth.  Callers invoke this service only after
their local write succeeds; failures are recorded on the local document and
reported to the actor without rolling back application data.
"""
import json
import logging
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import UTC, datetime, timedelta
from typing import Any, Dict, Optional
from bson import ObjectId

from app.config import settings
from app.core.crypto import decrypt_value, encrypt_value
from app.database.database import (
    calendar_events_collection,
    google_calendar_tokens_collection,
    projects_collection,
    tasks_collection,
    workspaces_collection,
)
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)
TOKEN_URL = "https://oauth2.googleapis.com/token"
EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
DEFAULT_PREFERENCES = {"tasks": True, "meetings": True, "milestones": True, "deadlines": True}


def _now() -> datetime:
    return datetime.now(UTC)


def _aware(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


def preferences_for(user_id: str) -> Dict[str, bool]:
    token = google_calendar_tokens_collection.find_one({"user_id": user_id}) or {}
    return {**DEFAULT_PREFERENCES, **token.get("sync_preferences", {})}


def update_preferences(user_id: str, preferences: Dict[str, bool]) -> Dict[str, bool]:
    merged = {**preferences_for(user_id), **preferences}
    google_calendar_tokens_collection.update_one(
        {"user_id": user_id}, {"$set": {"sync_preferences": merged, "updated_at": _now()}}, upsert=True
    )
    logger.info("Google Calendar preferences updated for user %s", user_id)
    return merged


def disconnect(user_id: str) -> None:
    """Forget credentials only; previously created Google events are retained."""
    google_calendar_tokens_collection.update_one(
        {"user_id": user_id},
        {"$unset": {"access_token": "", "refresh_token": "", "expires_at": ""}, "$set": {"connected": False, "updated_at": _now()}},
    )
    logger.info("Google Calendar disconnected for user %s", user_id)


def _refresh_token(token_doc: Dict[str, Any]) -> Optional[str]:
    refresh = token_doc.get("refresh_token")
    if not refresh:
        return None
    payload = urllib.parse.urlencode({
        "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
        "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
        "refresh_token": decrypt_value(refresh),
        "grant_type": "refresh_token",
    }).encode()
    request = urllib.request.Request(TOKEN_URL, data=payload, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode())
    except (urllib.error.HTTPError, urllib.error.URLError, ValueError) as exc:
        logger.warning("Google token refresh failed for user %s: %s", token_doc["user_id"], exc)
        return None
    access = data.get("access_token")
    if not access:
        return None
    google_calendar_tokens_collection.update_one(
        {"_id": token_doc["_id"]},
        {"$set": {"access_token": encrypt_value(access), "expires_at": _now() + timedelta(seconds=data.get("expires_in", 3600)), "updated_at": _now()}},
    )
    return access


def _access_token(user_id: str) -> Optional[str]:
    token = google_calendar_tokens_collection.find_one({"user_id": user_id})
    if not token or not token.get("connected", True) or not token.get("access_token"):
        return None
    expires = token.get("expires_at")
    if expires and _aware(expires) <= _now() + timedelta(seconds=60):
        return _refresh_token(token)
    try:
        return decrypt_value(token.get("access_token"))
    except RuntimeError as exc:
        logger.error("Google token decryption failed for user %s: %s", user_id, exc)
        return None


def is_connected(user_id: str) -> bool:
    token = google_calendar_tokens_collection.find_one({"user_id": user_id}, {"access_token": 1, "connected": 1})
    return bool(token and token.get("access_token") and token.get("connected", True))


def _google_request(user_id: str, method: str, url: str, body: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    token = _access_token(user_id)
    if not token:
        return None
    data = json.dumps(body).encode() if body is not None else None
    for attempt in range(2):
        request = urllib.request.Request(url, data=data, method=method, headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(request, timeout=15) as response:
                raw = response.read().decode()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            if exc.code == 401 and attempt == 0:
                token_doc = google_calendar_tokens_collection.find_one({"user_id": user_id})
                token = _refresh_token(token_doc) if token_doc else None
                if token:
                    continue
            if exc.code in {429, 500, 502, 503, 504} and attempt == 0:
                time.sleep(0.5)
                continue
            logger.warning("Google Calendar %s failed (%s): %s", method, exc.code, exc.read().decode() if exc.fp else exc)
            return None
        except (urllib.error.URLError, TimeoutError, ValueError) as exc:
            if attempt == 0:
                time.sleep(0.5)
                continue
            logger.warning("Google Calendar %s network failure: %s", method, exc)
            return None
    return None


def _event_payload(item: Dict[str, Any], kind: str) -> Optional[Dict[str, Any]]:
    if kind == "task":
        due = item.get("due_date")
        if not due:
            return None
        summary = item["title"]
        description = "\n".join(filter(None, [item.get("description"), f"Workspace: {item.get('_workspace_name', '')}", f"Project: {item.get('_project_name', '')}", f"Priority: {item.get('priority', 'Medium')}", f"Status: {item.get('status', 'Backlog')}"]))
        assignee = item.get("assignee") or {}
        attendees = [{"email": assignee["email"]}] if assignee.get("email") else []
        payload: Dict[str, Any] = {"summary": summary, "description": description, "start": {"dateTime": _aware(due).isoformat()}, "end": {"dateTime": (_aware(due) + timedelta(hours=1)).isoformat()}, "attendees": attendees}
    else:
        start = item.get("start_time")
        if not start:
            return None
        description = "\n".join(filter(None, [item.get("description"), item.get("notes"), f"Workspace: {item.get('_workspace_name', '')}", f"Project: {item.get('_project_name', '')}", f"Priority: {item.get('priority', 'Medium')}"]))
        payload = {"summary": item["title"], "description": description, "location": item.get("location")}
        if item.get("all_day"):
            payload["start"] = {"date": _aware(start).date().isoformat()}
            payload["end"] = {"date": (_aware(item.get("end_time") or start) + timedelta(days=1)).date().isoformat()}
        else:
            payload["start"] = {"dateTime": _aware(start).isoformat()}
            payload["end"] = {"dateTime": _aware(item.get("end_time") or start + timedelta(hours=1)).isoformat()}
        if item.get("reminder_minutes") is not None:
            payload["reminders"] = {"useDefault": False, "overrides": [{"method": "popup", "minutes": item["reminder_minutes"]}]}
        participant_emails = item.get("_participant_emails", [])
        if participant_emails:
            payload["attendees"] = [{"email": email} for email in participant_emails]
    return {key: value for key, value in payload.items() if value not in (None, [], "")}


def _category(kind: str, item: Dict[str, Any]) -> str:
    if kind == "task":
        return "tasks"
    return {"Meeting": "meetings", "Milestone": "milestones", "Deadline": "deadlines"}.get(item.get("event_type"), "deadlines")


def _decorate(item: Dict[str, Any]) -> Dict[str, Any]:
    workspace = workspaces_collection.find_one({"_id": ObjectId(item["workspace_id"])})
    project = projects_collection.find_one({"_id": ObjectId(item["project_id"])})
    project_members = (project or {}).get("members", [])
    participant_ids = set(item.get("participant_ids", []))
    participant_emails = [member["email"] for member in project_members if member.get("user_id") in participant_ids and member.get("email")]
    return {**item, "_workspace_name": (workspace or {}).get("workspace_name", ""), "_project_name": (project or {}).get("name", ""), "_participant_emails": participant_emails}


def sync_item(user_id: str, item: Dict[str, Any], kind: str) -> None:
    """Create/update the matching Google event, recording all outcomes locally."""
    collection = tasks_collection if kind == "task" else calendar_events_collection
    category = _category(kind, item)
    if not preferences_for(user_id).get(category, True):
        collection.update_one({"_id": item["_id"]}, {"$set": {"google_sync_status": "disabled", "google_sync_updated_at": _now()}})
        return
    if not is_connected(user_id):
        collection.update_one({"_id": item["_id"]}, {"$set": {"google_sync_status": "not_connected", "google_sync_updated_at": _now()}})
        return
    payload = _event_payload(_decorate(item), kind)
    if not payload:
        collection.update_one({"_id": item["_id"]}, {"$set": {"google_sync_status": "awaiting_schedule", "google_sync_updated_at": _now()}})
        return
    event_id = item.get("google_event_id")
    url = f"{EVENTS_URL}/{urllib.parse.quote(event_id, safe='')}" if event_id else EVENTS_URL
    response = _google_request(user_id, "PUT" if event_id else "POST", url, payload)
    if response and response.get("id"):
        collection.update_one({"_id": item["_id"]}, {"$set": {"google_event_id": response["id"], "google_sync_status": "synced", "google_sync_updated_at": _now(), "google_sync_error": None}})
        create_notification(user_id, "google_calendar_synced", f"{kind.title()} synchronized", f"{item['title']} synchronized with Google Calendar.", workspace_id=item["workspace_id"], project_id=item["project_id"], task_id=str(item["_id"]) if kind == "task" else None)
        logger.info("Google Calendar %s synchronized: %s", kind, item["_id"])
    else:
        collection.update_one({"_id": item["_id"]}, {"$set": {"google_sync_status": "failed", "google_sync_error": "Google Calendar request failed; retry is available.", "google_sync_updated_at": _now()}})
        create_notification(user_id, "google_calendar_sync_failed", "Synchronization failed", f"{kind.title()} {item['title']} could not be synchronized. Retry is available.", workspace_id=item["workspace_id"], project_id=item["project_id"], task_id=str(item["_id"]) if kind == "task" else None)


def delete_synced_item(user_id: str, item: Dict[str, Any], kind: str) -> None:
    event_id = item.get("google_event_id")
    if not event_id:
        return
    response = _google_request(user_id, "DELETE", f"{EVENTS_URL}/{urllib.parse.quote(event_id, safe='')}")
    if response is not None:
        logger.info("Google Calendar %s deleted: %s", kind, item["_id"])
    else:
        create_notification(user_id, "google_calendar_sync_failed", "Synchronization failed", f"{kind.title()} {item['title']} could not be removed from Google Calendar. Retry is available.", workspace_id=item["workspace_id"], project_id=item["project_id"], task_id=str(item["_id"]) if kind == "task" else None)
