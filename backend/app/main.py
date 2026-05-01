import json
import os
import time
from datetime import datetime
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

from app.cache import clear_cache, get_from_cache, save_to_cache
from app.config import MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, OLLAMA_HOST, OLLAMA_MODEL
from app.file_parser import extract_text_from_file
from app.llm_client import call_ollama, get_cache_key
from app.models import (
    ErrorResponse,
    Flashcard,
    FlashcardsRequest,
    FlashcardsResponse,
    HealthResponse,
    PDFExportRequest,
    QuizQuestion,
    QuizRequest,
    QuizResponse,
    SummaryRequest,
    SummaryResponse,
    UploadResponse,
)
from app.prompts import (
    FLASHCARD_PROMPT,
    FLASHCARD_TOPIC_PROMPT,
    QUIZ_PROMPT,
    QUIZ_TOPIC_PROMPT,
    SUMMARY_PROMPT,
    SUMMARY_TOPIC_PROMPT,
)

app = FastAPI(title="Edication Assistant API", version="1.0.0")

# CORS для React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Health Check ============
@app.get("/api/health", response_model=HealthResponse)
async def health():
    import httpx

    try:
        async with httpx.AsyncClient(timeout=2) as client:
            resp = await client.get(f"{OLLAMA_HOST}/api/tags")
            if resp.status_code == 200:
                llm_status = "connected"
            else:
                llm_status = "disconnected"
    except:
        llm_status = "disconnected"

    return HealthResponse(
        status="ok",
        llm=llm_status,
        model=OLLAMA_MODEL,
        timestamp=datetime.now().isoformat(),
    )


# ============ Upload File ============
@app.post("/api/upload/file")
async def upload_file(file: UploadFile = File(...)):
    # Проверка размера
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413, detail=f"File too large. Max {MAX_FILE_SIZE_MB} MB"
        )

    # Проверка расширения
    allowed_extensions = (".txt", ".pdf", ".docx")
    if not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}",
        )

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
        raise HTTPException(status_code=422, detail=str(e))


# ============ Summary ============
@app.post("/api/summary")
async def generate_summary(request: SummaryRequest):
    start_time = time.time()

    if not request.text and not request.topic:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                success=False,
                error="Text or topic must be provided",
                code="MISSING_INPUT",
            ).dict(),
        )

    source_type = "text" if request.text else "topic"
    input_text = request.text if request.text else request.topic

    cache_key = get_cache_key("summary", input_text, max_points=request.max_points)
    cached = get_from_cache(cache_key)

    if cached:
        processing_time = int((time.time() - start_time) * 1000)
        return SummaryResponse(
            success=True,
            summary=cached,
            from_cache=True,
            processing_time_ms=processing_time,
            source_type=source_type,
        )

    if request.text:
        prompt = SUMMARY_PROMPT.format(text=request.text, max_points=request.max_points)
    else:
        prompt = SUMMARY_TOPIC_PROMPT.format(
            topic=request.topic, max_points=request.max_points
        )

    try:
        summary = await call_ollama(prompt, max_tokens=1000)
        save_to_cache(cache_key, summary)
        processing_time = int((time.time() - start_time) * 1000)
        return SummaryResponse(
            success=True,
            summary=summary,
            from_cache=False,
            processing_time_ms=processing_time,
            source_type=source_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Flashcards ============
@app.post("/api/flashcards")
async def generate_flashcards(request: FlashcardsRequest):
    start_time = time.time()

    if not request.text and not request.topic:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                success=False,
                error="Text or topic must be provided",
                code="MISSING_INPUT",
            ).dict(),
        )

    input_text = request.text if request.text else request.topic

    cache_key = get_cache_key("flashcards", input_text, num_cards=request.num_cards)
    cached = get_from_cache(cache_key)

    if cached:
        processing_time = int((time.time() - start_time) * 1000)
        return FlashcardsResponse(
            success=True,
            flashcards=[Flashcard(**item) for item in cached],
            from_cache=True,
            processing_time_ms=processing_time,
        )

    if request.text:
        prompt = FLASHCARD_PROMPT.format(text=request.text, num_cards=request.num_cards)
    else:
        prompt = FLASHCARD_TOPIC_PROMPT.format(
            topic=request.topic, num_cards=request.num_cards
        )

    try:
        response = await call_ollama(prompt, max_tokens=2000)
        # Парсим JSON
        flashcards_data = json.loads(response)
        if not isinstance(flashcards_data, list):
            flashcards_data = [flashcards_data]

        flashcards = [
            Flashcard(**item) for item in flashcards_data[: request.num_cards]
        ]
        save_to_cache(cache_key, [f.dict() for f in flashcards])

        processing_time = int((time.time() - start_time) * 1000)
        return FlashcardsResponse(
            success=True,
            flashcards=flashcards,
            from_cache=False,
            processing_time_ms=processing_time,
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                success=False,
                error="Failed to generate valid flashcards",
                code="LLM_FORMAT_ERROR",
            ).dict(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Quiz ============
@app.post("/api/quiz")
async def generate_quiz(request: QuizRequest):
    start_time = time.time()

    if not request.text and not request.topic:
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                success=False,
                error="Text or topic must be provided",
                code="MISSING_INPUT",
            ).dict(),
        )

    input_text = request.text if request.text else request.topic

    cache_key = get_cache_key("quiz", input_text, num_questions=request.num_questions)
    cached = get_from_cache(cache_key)

    if cached:
        processing_time = int((time.time() - start_time) * 1000)
        return QuizResponse(
            success=True,
            quiz=[QuizQuestion(**item) for item in cached],
            from_cache=True,
            processing_time_ms=processing_time,
        )

    if request.text:
        prompt = QUIZ_PROMPT.format(
            text=request.text, num_questions=request.num_questions
        )
    else:
        prompt = QUIZ_TOPIC_PROMPT.format(
            topic=request.topic, num_questions=request.num_questions
        )

    try:
        response = await call_ollama(prompt, max_tokens=2000)
        quiz_data = json.loads(response)
        if not isinstance(quiz_data, list):
            quiz_data = [quiz_data]

        quiz = [QuizQuestion(**item) for item in quiz_data[: request.num_questions]]
        save_to_cache(cache_key, [q.dict() for q in quiz])

        processing_time = int((time.time() - start_time) * 1000)
        return QuizResponse(
            success=True,
            quiz=quiz,
            from_cache=False,
            processing_time_ms=processing_time,
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=422,
            detail=ErrorResponse(
                success=False,
                error="Failed to generate valid quiz",
                code="LLM_FORMAT_ERROR",
            ).dict(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Export PDF ============
@app.post("/api/export/pdf")
async def export_pdf(request: PDFExportRequest):
    if not request.content.strip():
        raise HTTPException(
            status_code=400,
            detail=ErrorResponse(
                success=False, error="Content is empty", code="EMPTY_CONTENT"
            ).dict(),
        )

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Левое и правое поле (20 мм от края)
    left_margin = 20 * mm
    right_margin = width - 20 * mm
    max_text_width = right_margin - left_margin

    # Пытаемся загрузить русский шрифт
    font_dir = os.path.join(os.path.dirname(__file__), "..", "fonts")
    dejavu_path = os.path.join(font_dir, "DejaVuSans.ttf")

    font_loaded = False
    if os.path.exists(dejavu_path):
        try:
            pdfmetrics.registerFont(TTFont("DejaVu", dejavu_path))
            c.setFont("DejaVu", 11)
            font_loaded = True
        except:
            pass

    if not font_loaded:
        c.setFont("Helvetica", 11)

    # Функция для отрисовки текста с переносом
    def draw_text_with_wrap(canvas_obj, text, x, y, max_width, font_size=11):
        canvas_obj.setFontSize(font_size)
        # Разбиваем текст на строки с учетом ширины
        lines = []
        for paragraph in text.split("\n"):
            words = paragraph.split(" ")
            current_line = []
            for word in words:
                test_line = " ".join(current_line + [word])
                text_width = canvas_obj.stringWidth(
                    test_line, "DejaVu" if font_loaded else "Helvetica", font_size
                )
                if text_width <= max_width:
                    current_line.append(word)
                else:
                    if current_line:
                        lines.append(" ".join(current_line))
                    current_line = [word]
            if current_line:
                lines.append(" ".join(current_line))
            lines.append("")  # Пустая строка для разделения параграфов

        # Рисуем строки
        current_y = y
        for line in lines:
            if current_y < 50:  # Если достигли низа страницы
                canvas_obj.showPage()
                current_y = height - 50
                canvas_obj.setFont("DejaVu" if font_loaded else "Helvetica", font_size)
            canvas_obj.drawString(x, current_y, line)
            current_y -= 15

    # Заголовок
    draw_text_with_wrap(c, request.title, 20 * mm, height - 40 * mm, max_text_width, 16)

    # Дата и автор
    y_position = height - 70 * mm
    draw_text_with_wrap(
        c,
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        20 * mm,
        y_position,
        max_text_width,
        10,
    )
    y_position -= 15
    draw_text_with_wrap(
        c, f"Author: {request.author}", 20 * mm, y_position, max_text_width, 10
    )

    # Содержимое
    y_position -= 30
    draw_text_with_wrap(c, request.content, 20 * mm, y_position, max_text_width, 11)

    c.save()

    pdf_output = buffer.getvalue()

    return Response(
        content=pdf_output,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        },
    )


# ============ Clear Cache ============
@app.delete("/api/cache/{cache_type}")
async def clear_cache_endpoint(cache_type: str):
    if cache_type not in ["all", "summary", "flashcards", "quiz"]:
        raise HTTPException(status_code=400, detail="Invalid cache type")

    keys_removed = clear_cache(cache_type)
    return {"success": True, "cleared": cache_type, "keys_removed": keys_removed}
