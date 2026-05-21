import asyncio
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_rate_limit
from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.schemas.common import UploadResponse
from app.services.file_service import extract_text_from_file
from app.services.task_service import task_tracker

settings = get_settings()
router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/file", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    user: User = Depends(require_rate_limit),
):
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(413, f"File too large. Max {settings.MAX_FILE_SIZE_MB} MB")

    allowed = (".txt", ".pdf", ".docx")
    if not file.filename.lower().endswith(allowed):
        raise HTTPException(415, f"Unsupported format. Allowed: {', '.join(allowed)}")

    try:
        text, pages = extract_text_from_file(content, file.filename)
        return UploadResponse(
            success=True,
            filename=file.filename,
            text=text,
            char_count=len(text),
            pages=pages if pages > 1 else None,
        )
    except ValueError as e:
        raise HTTPException(422, str(e))


@router.post("/batch")
async def upload_batch(
    files: list[UploadFile] = File(...),
    user: User = Depends(require_rate_limit),
):
    if len(files) > 10:
        raise HTTPException(400, "Maximum 10 files per batch")

    task_id = str(uuid.uuid4())
    task_tracker.create(task_id, total=len(files))

    async def process_files():
        results = []
        for i, file in enumerate(files):
            try:
                content = await file.read()
                if len(content) > settings.MAX_FILE_SIZE_BYTES:
                    results.append({"filename": file.filename, "success": False, "error": "File too large"})
                    continue
                text, pages = extract_text_from_file(content, file.filename)
                results.append({
                    "filename": file.filename,
                    "success": True,
                    "text": text,
                    "char_count": len(text),
                    "pages": pages,
                })
            except Exception as e:
                results.append({"filename": file.filename, "success": False, "error": str(e)})
            task_tracker.update(task_id, progress=i + 1, message=f"Processed {i+1}/{len(files)}")

        task_tracker.update(task_id, progress=len(files), message="Complete", result=results)

    asyncio.create_task(process_files())
    return {"task_id": task_id, "status": "processing"}
