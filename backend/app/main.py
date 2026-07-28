from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.api.workspace import router as workspace_router
from app.api.project import router as project_router
from app.api.task import router as task_router
from app.api.calendar import router as calendar_router
from app.api.wiki import router as wiki_router
from app.api.notification import router as notification_router
from app.api.workspace_calendar import router as workspace_calendar_router
from app.api.google_calendar import router as google_calendar_router

app = FastAPI(
    title="Enterprise Project Management API",
    description="Backend API for Enterprise Project Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Frontend is served as static files (file:// or a local dev server) and was
# not previously able to reach this API from the browser. Enabling CORS is
# additive/necessary infrastructure for the Workspace module integration and
# does not change any existing route or business logic.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Enterprise Project Management Backend Running Successfully 🚀"
    }


app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

app.include_router(
    workspace_router,
    prefix="/api/v1/workspaces",
    tags=["Workspaces"]
)

# ---------------------------------------------------------------------------
# Project module (additive). Mounted under the same /workspaces/{workspace_id}
# path space as the existing embedded Create/Favorite/Archive Project routes
# in workspace_router above — those are untouched. These add the full
# Project detail resource, plus Tasks / Calendar / Wiki nested beneath it.
# ---------------------------------------------------------------------------
app.include_router(
    project_router,
    prefix="/api/v1/workspaces/{workspace_id}/projects",
    tags=["Projects"],
)

app.include_router(
    task_router,
    prefix="/api/v1/workspaces/{workspace_id}/projects/{project_id}/tasks",
    tags=["Tasks"],
)

app.include_router(
    calendar_router,
    prefix="/api/v1/workspaces/{workspace_id}/projects/{project_id}/calendar",
    tags=["Calendar"],
)

app.include_router(
    wiki_router,
    prefix="/api/v1/workspaces/{workspace_id}/projects/{project_id}/wiki",
    tags=["Wiki"],
)

app.include_router(notification_router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(workspace_calendar_router, prefix="/api/v1/workspaces/{workspace_id}/calendar", tags=["Workspace Calendar"])
app.include_router(google_calendar_router, prefix="/api/v1/integrations/google-calendar", tags=["Google Calendar"])
