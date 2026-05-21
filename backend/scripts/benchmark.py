#!/usr/bin/env python3
"""Benchmark script — compares all available Ollama models on standard prompts."""

import asyncio
import json
import time
import sys

import httpx

OLLAMA_HOST = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:11434"
OUTPUT_FILE = "benchmark_results.json"

TEST_PROMPTS = {
    "summary": "Summarize the following text in 5 bullet points:\n\nMachine learning is a subset of artificial intelligence that focuses on building systems that learn from data. It includes supervised learning, unsupervised learning, and reinforcement learning. Deep learning uses neural networks with many layers. Common applications include image recognition, natural language processing, and recommendation systems.",
    "flashcards": 'Create 3 flashcards as JSON array: [{"front":"","back":""}]\n\nTopic: Python programming basics',
    "quiz": 'Create 3 quiz questions as JSON array: [{"question":"","options":["A","B","C","D"],"correct":0}]\n\nTopic: Data structures',
}


async def get_models():
    async with httpx.AsyncClient(timeout=5) as client:
        resp = await client.get(f"{OLLAMA_HOST}/api/tags")
        return [m["name"] for m in resp.json().get("models", [])]


async def run_benchmark(model: str, prompt_name: str, prompt: str) -> dict:
    start = time.time()
    async with httpx.AsyncClient(timeout=180) as client:
        try:
            resp = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False, "options": {"num_predict": 1000}},
            )
            resp.raise_for_status()
            data = resp.json()
            elapsed = time.time() - start
            return {
                "model": model,
                "prompt_type": prompt_name,
                "time_seconds": round(elapsed, 2),
                "tokens_generated": len(data.get("response", "").split()),
                "success": True,
            }
        except Exception as e:
            return {"model": model, "prompt_type": prompt_name, "error": str(e), "success": False}


async def main():
    models = await get_models()
    if not models:
        print("No models found. Is Ollama running?")
        return

    print(f"Found models: {models}")
    results = []

    for model in models:
        for prompt_name, prompt in TEST_PROMPTS.items():
            print(f"  Testing {model} on {prompt_name}...", end=" ", flush=True)
            result = await run_benchmark(model, prompt_name, prompt)
            results.append(result)
            if result["success"]:
                print(f"{result['time_seconds']}s")
            else:
                print(f"FAILED: {result.get('error', 'unknown')}")

    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nResults saved to {OUTPUT_FILE}")

    # Print summary table
    print("\n{:<25} {:<12} {:<10} {:<10}".format("Model", "Prompt", "Time(s)", "Tokens"))
    print("-" * 60)
    for r in results:
        if r["success"]:
            print("{:<25} {:<12} {:<10} {:<10}".format(
                r["model"], r["prompt_type"], r["time_seconds"], r["tokens_generated"]
            ))
        else:
            print("{:<25} {:<12} FAILED".format(r["model"], r["prompt_type"]))


if __name__ == "__main__":
    asyncio.run(main())
