from pydantic import BaseModel


class GoogleCalendarSyncPreferences(BaseModel):
    """Per-account categories that may be published to Google Calendar."""

    tasks: bool = True
    meetings: bool = True
    milestones: bool = True
    deadlines: bool = True


class GoogleCalendarStatus(BaseModel):
    connected: bool
    configured: bool
    preferences: GoogleCalendarSyncPreferences

