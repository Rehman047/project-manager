from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.members import router as members_router
from routers.projects import router as projects_router
from routers.sprints import router as sprints_router, velocity_router
from routers.board import router as board_router
from routers.work_items import router as work_items_router
from routers.ai import router as ai_router
from routers.notifications import router as notifications_router
from models import *


app = FastAPI(title="AI Project Management System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(members_router)
app.include_router(work_items_router)
app.include_router(sprints_router)
app.include_router(velocity_router)
app.include_router(board_router)
app.include_router(ai_router)
app.include_router(notifications_router)
