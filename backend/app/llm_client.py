import hashlib
from typing import List

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    OLLAMA_HOST,
    OLLAMA_MODEL,
    OLLAMA_TIMEOUT,
)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
async def call_ollama(prompt: str, max_tokens: int = 1000) -> str:
    async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
        response = await client.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "num_predict": max_tokens,
                    "temperature": 0.3,
                },
            },
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", "").strip()


def chunk_text(
    text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP
) -> List[str]:
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start = end - overlap
        if start >= len(text):
            break

    return chunks


async def generate_with_long_text(prompt_template: str, text: str, **kwargs) -> str:
    chunks = chunk_text(text)
    if len(chunks) == 1:
        prompt = prompt_template.format(text=text, **kwargs)
        return await call_ollama(prompt)

    results = []
    for i, chunk in enumerate(chunks):
        chunk_prompt = prompt_template.format(text=chunk, **kwargs)
        result = await call_ollama(chunk_prompt)
        results.append(result)

    return "\n\n".join(results)


def get_cache_key(prefix: str, text: str, **kwargs) -> str:
    content = f"{prefix}:{text}:{sorted(kwargs.items())}"
    return hashlib.md5(content.encode()).hexdigest()
