import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import init_db
from app.core.middleware import LoggingMiddleware
from app.routers import (
    auth, users, generation, history, favorites,
    export, upload, health, cache, tasks, models,
)

settings = get_settings()

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("edu_assist")


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001
    logger.info("Starting EduAssist v%s", settings.APP_VERSION)
    await init_db()
    settings.UPLOAD_DIR.mkdir(exist_ok=True)
    yield
    logger.info("Shutting down")


app = FastAPI(
    title="EduAssist API",
    version=settings.APP_VERSION,
    description="Educational AI Assistant — generate summaries, flashcards, quizzes, and more using local LLMs.",
    lifespan=lifespan,
)

app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s. Detail: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "code": "INTERNAL_ERROR",
        },
    )


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(generation.router)
app.include_router(history.router)
app.include_router(favorites.router)
app.include_router(export.router)
app.include_router(upload.router)
app.include_router(cache.router)
app.include_router(tasks.router)
app.include_router(models.router)
