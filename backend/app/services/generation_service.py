import json
import re
import time

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.generation import Generation
from app.services.llm_service import call_ollama, get_cache_key
from app.cache import get_from_cache, save_to_cache
from app.prompts.summary import SUMMARY_PROMPT, SUMMARY_TOPIC_PROMPT
from app.prompts.flashcards import FLASHCARD_PROMPT, FLASHCARD_TOPIC_PROMPT
from app.prompts.quiz import QUIZ_PROMPT, QUIZ_TOPIC_PROMPT
from app.prompts.keywords import KEYWORDS_PROMPT
from app.prompts.simplify import SIMPLIFY_PROMPT
from app.prompts.study_plan import STUDY_PLAN_PROMPT

PROMPT_MAP = {
    "summary": {"text": SUMMARY_PROMPT, "topic": SUMMARY_TOPIC_PROMPT},
    "flashcards": {"text": FLASHCARD_PROMPT, "topic": FLASHCARD_TOPIC_PROMPT},
    "quiz": {"text": QUIZ_PROMPT, "topic": QUIZ_TOPIC_PROMPT},
}


def _parse_json_output(raw: str):
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        for start_ch, end_ch in [("[", "]"), ("{", "}")]:
            start = raw.find(start_ch)
            end = raw.rfind(end_ch)
            if start != -1 and end > start:
                try:
                    return json.loads(raw[start : end + 1])
                except json.JSONDecodeError:
                    pass
        return raw


async def generate(
    gen_type: str,
    user_id: int,
    input_type: str,
    input_content: str,
    model: str,
    language: str = "ru",
    difficulty: str | None = None,
    temperature: float = 0.3,
    save: bool = True,
    db: AsyncSession | None = None,
    **prompt_kwargs,
) -> dict:
    start = time.time()

    cache_key = get_cache_key(
        gen_type, input_content, model=model, language=language,
        difficulty=difficulty, **prompt_kwargs,
    )
    cached = get_from_cache(cache_key)

    if cached:
        result = {**cached, "from_cache": True}
    else:
        if gen_type in PROMPT_MAP:
            template = PROMPT_MAP[gen_type][input_type]
            prompt = template.format(
                text=input_content if input_type == "text" else "",
                topic=input_content if input_type == "topic" else "",
                language=language,
                difficulty=difficulty or "medium",
                **prompt_kwargs,
            )
        elif gen_type == "keywords":
            prompt = KEYWORDS_PROMPT.format(
                text=input_content, language=language, **prompt_kwargs,
            )
        elif gen_type == "simplify":
            prompt = SIMPLIFY_PROMPT.format(
                text=input_content, language=language, **prompt_kwargs,
            )
        elif gen_type == "study_plan":
            prompt = STUDY_PLAN_PROMPT.format(
                topics=input_content, language=language,
                difficulty=difficulty or "medium", **prompt_kwargs,
            )
        else:
            raise ValueError(f"Unknown generation type: {gen_type}")

        max_tokens = prompt_kwargs.get("max_tokens", 2000)
        raw = await call_ollama(
            prompt, model=model, max_tokens=max_tokens, temperature=temperature,
        )

        if gen_type in ("flashcards", "quiz", "keywords", "study_plan"):
            parsed = _parse_json_output(raw)
        else:
            parsed = raw

        processing_time = int((time.time() - start) * 1000)
        result = {
            "output": parsed,
            "from_cache": False,
            "processing_time_ms": processing_time,
        }
        save_to_cache(cache_key, result)

    if save and db:
        output_str = (
            json.dumps(result["output"], ensure_ascii=False)
            if isinstance(result["output"], (list, dict))
            else str(result["output"])
        )
        generation = Generation(
            user_id=user_id,
            type=gen_type,
            input_type=input_type,
            input_content=input_content[:5000],
            output_content=output_str,
            model_used=model,
            processing_time_ms=result.get("processing_time_ms", 0),
            language=language,
            difficulty=difficulty,
            from_cache=result["from_cache"],
        )
        db.add(generation)
        await db.commit()
        await db.refresh(generation)
        result["generation_id"] = generation.id

    return result
