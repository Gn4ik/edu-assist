from pydantic import BaseModel
from typing import Optional


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    code: str
    details: Optional[dict] = None


class HealthResponse(BaseModel):
    status: str
    llm: str
    model: str
    timestamp: str


class UploadResponse(BaseModel):
    success: bool
    filename: str
    text: str
    char_count: int
    pages: Optional[int] = None
