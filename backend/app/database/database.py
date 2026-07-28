from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGODB_URL)

db = client[DATABASE_NAME]

users_collection = db["users"]
workspaces_collection = db["workspaces"]

# ---------------------------------------------------------------------------
# Project module collections (additive). Projects are still summarized inside
# a workspace document's embedded "projects" array (unchanged, existing
# behaviour), but full project detail plus Tasks / Calendar Events / Wiki
# Pages now live in their own collections, each referencing the owning
# project_id and workspace_id.
# ---------------------------------------------------------------------------
projects_collection = db["projects"]
tasks_collection = db["tasks"]
calendar_events_collection = db["calendar_events"]
wiki_pages_collection = db["wiki_pages"]
notifications_collection = db["notifications"]
google_calendar_tokens_collection = db["google_calendar_tokens"]
