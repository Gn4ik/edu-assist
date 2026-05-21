import asyncio
import json

from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.task_service import task_tracker

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/{task_id}")
async def stream_task(
    task_id: str,
    user: User = Depends(get_current_user),
):
    async def event_generator():
        while True:
            status = task_tracker.get_status(task_id)
            if status is None:
                yield {"event": "error", "data": json.dumps({"error": "Task not found"})}
                break
            yield {"event": "progress", "data": json.dumps(status)}
            if status.get("status") in ("completed", "failed"):
                yield {"event": "done", "data": json.dumps(status)}
                break
            await asyncio.sleep(0.5)

    return EventSourceResponse(event_generator())
