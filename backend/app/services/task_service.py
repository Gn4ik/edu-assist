import threading
from datetime import datetime


class TaskTracker:
    def __init__(self):
        self._tasks: dict[str, dict] = {}
        self._lock = threading.Lock()

    def create(self, task_id: str, total: int = 1) -> dict:
        with self._lock:
            self._tasks[task_id] = {
                "task_id": task_id,
                "status": "pending",
                "progress": 0,
                "total": total,
                "message": "Queued",
                "result": None,
                "started_at": datetime.now().isoformat(),
            }
            return self._tasks[task_id]

    def update(self, task_id: str, progress: int, message: str = "", result=None):
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id]["progress"] = progress
                self._tasks[task_id]["message"] = message
                if result is not None:
                    self._tasks[task_id]["result"] = result
                if progress >= self._tasks[task_id]["total"]:
                    self._tasks[task_id]["status"] = "completed"

    def fail(self, task_id: str, error: str):
        with self._lock:
            if task_id in self._tasks:
                self._tasks[task_id]["status"] = "failed"
                self._tasks[task_id]["message"] = error

    def get_status(self, task_id: str) -> dict | None:
        with self._lock:
            return self._tasks.get(task_id)


task_tracker = TaskTracker()
