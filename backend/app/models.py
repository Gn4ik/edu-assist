from pydantic import BaseModel
from typing import Optional, List

# Request models
class SummaryRequest(BaseModel):
    text: Optional[str] = None
    topic: Optional[str] = None
    language: str = "ru"
    max_points: int = 7

class FlashcardsRequest(BaseModel):
    text: Optional[str] = None
    topic: Optional[str] = None
    language: str = "ru"
    num_cards: int = 5

class QuizRequest(BaseModel):
    text: Optional[str] = None
    topic: Optional[str] = None
    num_questions: int = 5
    language: str = "ru"

class PDFExportRequest(BaseModel):
    title: str
    content: str
    author: str = "Учебный ассистент"

# Response models
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

class SummaryResponse(BaseModel):
    success: bool
    summary: str
    from_cache: bool
    processing_time_ms: int
    tokens_used: Optional[int] = None
    source_type: str

class Flashcard(BaseModel):
    front: str
    back: str

class FlashcardsResponse(BaseModel):
    success: bool
    flashcards: List[Flashcard]
    from_cache: bool
    processing_time_ms: int
    tokens_used: Optional[int] = None

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct: int

class QuizResponse(BaseModel):
    success: bool
    quiz: List[QuizQuestion]
    from_cache: bool
    processing_time_ms: int
    tokens_used: Optional[int] = None

class ErrorResponse(BaseModel):
    success: bool
    error: str
    code: str
    details: Optional[dict] = None