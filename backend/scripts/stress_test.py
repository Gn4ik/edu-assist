#!/usr/bin/env python3
"""Simple stress test — sends concurrent requests to the API."""

import asyncio
import sys
import time

import httpx

API_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
CONCURRENT = int(sys.argv[2]) if len(sys.argv) > 2 else 10
TOTAL = int(sys.argv[3]) if len(sys.argv) > 3 else 50


async def make_request(client: httpx.AsyncClient, req_id: int) -> dict:
    start = time.time()
    try:
        resp = await client.get(f"{API_URL}/api/health")
        elapsed = time.time() - start
        return {"id": req_id, "status": resp.status_code, "time": elapsed, "error": None}
    except Exception as e:
        elapsed = time.time() - start
        return {"id": req_id, "status": 0, "time": elapsed, "error": str(e)}


async def main():
    print(f"Stress test: {TOTAL} requests, {CONCURRENT} concurrent")
    print(f"Target: {API_URL}/api/health")

    start = time.time()
    results = []

    async with httpx.AsyncClient(timeout=30) as client:
        semaphore = asyncio.Semaphore(CONCURRENT)

        async def limited_request(req_id):
            async with semaphore:
                return await make_request(client, req_id)

        tasks = [limited_request(i) for i in range(TOTAL)]
        results = await asyncio.gather(*tasks)

    total_time = time.time() - start
    successes = [r for r in results if r["status"] == 200]
    failures = [r for r in results if r["status"] != 200]
    times = [r["time"] for r in successes]

    print("\nResults:")
    print(f"  Total time: {total_time:.2f}s")
    print(f"  Requests/sec: {TOTAL / total_time:.1f}")
    print(f"  Successes: {len(successes)}")
    print(f"  Failures: {len(failures)}")
    if times:
        print(f"  Avg response time: {sum(times)/len(times)*1000:.0f}ms")
        print(f"  Max response time: {max(times)*1000:.0f}ms")
        print(f"  Min response time: {min(times)*1000:.0f}ms")

    if failures:
        print("\nSample errors:")
        for f in failures[:5]:
            print(f"  Request {f['id']}: {f['error']}")


if __name__ == "__main__":
    asyncio.run(main())
