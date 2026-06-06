from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_rate_limit
from app.database import get_db
from app.models.user import User
from app.schemas.generation import (
    FlashcardsRequest,
    KeywordsRequest,
    QuizRequest,
    SimplifyRequest,
    StudyPlanRequest,
    SummaryRequest,
)
from app.services.generation_service import generate

router = APIRouter(prefix="/api/generation", tags=["generation"])


def _get_model(user: User, request_model: str | None) -> str:
    if request_model:
        return request_model
    if user.settings:
        import json
        try:
            settings = json.loads(user.settings)
            if "default_model" in settings:
                return settings["default_model"]
        except (json.JSONDecodeError, TypeError):
            pass
    return "llama3.1:latest"


@router.post("/summary")
async def gen_summary(
    body: SummaryRequest,
    user: User = Depends(require_rate_limit),
    db: AsyncSession = Depends(get_db),
):
    if not body.text and not body.topic:
        raise HTTPException(400, detail="text or topic required")
    input_content = body.text or body.topic
    input_type = "text" if body.text else "topic"
    result = await generate(
        "summary", user.id, input_type, input_content,
        _get_model(user, body.model),
        language=body.language, save=body.save_to_history, db=db,
        max_points=body.max_points, temperature=body.temperature,
    )
    return {"success": True, **result}


@router.post("/flashcards")
async def gen_flashcards(
    body: FlashcardsRequest,
    user: User = Depends(require_rate_limit),
    db: AsyncSession = Depends(get_db),
):
    if not body.text and not body.topic:
        raise HTTPException(400, detail="text or topic required")
    input_content = body.text or body.topic
    input_type = "text" if body.text else "topic"
    result = await generate(
        "flashcards", user.id, input_type, input_content,
        _get_model(user, body.model),
        language=body.language, save=body.save_to_history, db=db,
        num_cards=body.num_cards, temperature=body.temperature,
    )
    return {"success": True, **result}


@router.post("/quiz")
async def gen_quiz(
    body: QuizRequest,
    user: User = Depends(require_rate_limit),
    db: AsyncSession = Depends(get_db),
):
    if not body.text and not body.topic:
        raise HTTPException(400, detail="text or topic required")
    input_content = body.text or body.topic
    input_type = "text" if body.text else "topic"
    result = await generate(
        "quiz", user.id, input_type, input_content,
        _get_model(user, body.model),
        language=body.language, difficulty=body.difficulty or "medium",
        save=body.save_to_history, db=db,
        num_questions=body.num_questions, temperature=body.temperature,
    )
    return {"success": True, **result}


@router.post("/keywords")
async def gen_keywords(
    body: KeywordsRequest,
    user: User = Depends(require_rate_limit),
    db: AsyncSession = Depends(get_db),
):
    result = await generate(
        "keywords", user.id, "text", body.text,
        _get_model(user, body.model),
        language=body.language, save=True, db=db,
        max_keywords=body.max_keywords, temperature=body.temperature,
    )
    return {"success": True, **result}


@router.post("/simplify")
async def gen_simplify(
    body: SimplifyRequest,
    user: User = Depends(require_rate_limit),
    db: AsyncSession = Depends(get_db),
):
    result = await generate(
        "simplify", user.id, "text", body.text,
        _get_model(user, body.model),
        language=body.language, save=True, db=db,
        target_level=body.target_level, temperature=body.temperature,
    )
    return {"success": True, **result}


@router.post("/study-plan")
async def gen_study_plan(
    body: StudyPlanRequest,
    user: User = Depends(require_rate_limit),
    db: AsyncSession = Depends(get_db),
):
    result = await generate(
        "study_plan", user.id, "topic", body.topics,
        _get_model(user, body.model),
        language=body.language, difficulty=body.difficulty,
        save=True, db=db,
        available_hours=body.available_hours, temperature=body.temperature,
    )
    return {"success": True, **result}
