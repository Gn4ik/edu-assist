import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, JSONResponse

from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.export import ExportRequest
from app.services.export_service import (
    export_pdf, export_markdown, export_json, export_csv, export_docx,
)
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/export", tags=["export"])


@router.post("/pdf")
async def pdf_export(body: ExportRequest, user: User = Depends(get_current_user)):
    if not body.content.strip():
        raise HTTPException(400, "Content is empty")
    font_path = str(settings.FONT_DIR / "DejaVuSans.ttf") if (settings.FONT_DIR / "DejaVuSans.ttf").exists() else None
    data = export_pdf(body.title, body.content, body.author, font_path)
    return Response(
        content=data,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=summary_{datetime.now():%Y%m%d_%H%M%S}.pdf"},
    )


@router.post("/markdown")
async def markdown_export(body: ExportRequest, user: User = Depends(get_current_user)):
    if not body.content.strip():
        raise HTTPException(400, "Content is empty")
    md = export_markdown(body.title, body.content)
    return Response(
        content=md,
        media_type="text/markdown",
        headers={"Content-Disposition": f"attachment; filename=summary_{datetime.now():%Y%m%d_%H%M%S}.md"},
    )


@router.post("/json")
async def json_export(body: ExportRequest, user: User = Depends(get_current_user)):
    if not body.content.strip():
        raise HTTPException(400, "Content is empty")
    data = export_json(body.title, body.content, body.author)
    return Response(
        content=data,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=summary_{datetime.now():%Y%m%d_%H%M%S}.json"},
    )


@router.post("/csv")
async def csv_export(body: ExportRequest, user: User = Depends(get_current_user)):
    if not body.content.strip():
        raise HTTPException(400, "Content is empty")
    data = export_csv(body.title, body.content)
    return Response(
        content=data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=summary_{datetime.now():%Y%m%d_%H%M%S}.csv"},
    )


@router.post("/docx")
async def docx_export(body: ExportRequest, user: User = Depends(get_current_user)):
    if not body.content.strip():
        raise HTTPException(400, "Content is empty")
    data = export_docx(body.title, body.content, body.author)
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=summary_{datetime.now():%Y%m%d_%H%M%S}.docx"},
    )
