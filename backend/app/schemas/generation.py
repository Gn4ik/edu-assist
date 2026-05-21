from pydantic import BaseModel, Field
from typing import Optional


class SummaryRequest(BaseModel):
    text: Optional[str] = None
    topic: Optional[str] = None
    language: str = "ru"
    max_points: int = Field(default=7, ge=3, le=20)
    difficulty: Optional[str] = None
    model: Optional[str] = None
    temperature: float = 0.3
    save_to_history: bool = True


class FlashcardsRequest(BaseModel):
    text: Optional[str] = None
    topic: Optional[str] = None
    language: str = "ru"
    num_cards: int = Field(default=5, ge=1, le=20)
    difficulty: Optional[str] = None
    model: Optional[str] = None
    temperature: float = 0.3
    save_to_history: bool = True


class QuizRequest(BaseModel):
    text: Optional[str] = None
    topic: Optional[str] = None
    language: str = "ru"
    num_questions: int = Field(default=5, ge=1, le=20)
    difficulty: Optional[str] = None
    model: Optional[str] = None
    temperature: float = 0.3
    save_to_history: bool = True


class KeywordsRequest(BaseModel):
    text: str
    language: str = "ru"
    model: Optional[str] = None
    max_keywords: int = Field(default=10, ge=3, le=30)
    temperature: float = 0.3
    save_to_history: bool = True


class SimplifyRequest(BaseModel):
    text: str
    language: str = "ru"
    model: Optional[str] = None
    target_level: str = "beginner"
    temperature: float = 0.3
    save_to_history: bool = True


class StudyPlanRequest(BaseModel):
    topics: str
    available_hours: int = Field(default=10, ge=1, le=200)
    language: str = "ru"
    difficulty: str = "medium"
    model: Optional[str] = None
    temperature: float = 0.3
    save_to_history: bool = True
