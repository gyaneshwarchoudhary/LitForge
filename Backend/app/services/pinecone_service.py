"""
Pinecone vector store + Google Gemini embeddings (async, rate-limited).
"""

import asyncio
import logging
import time
from collections import deque

from pinecone import Pinecone, ServerlessSpec
from google import genai

from app.core.config import settings
from app.services.chunking_service import Chunk

logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────

EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIMENSION = 768

# IMPORTANT: set these to your ACTUAL quota. Check Google AI Studio ->
# your API key -> rate limits for this model/tier. Don't guess — your
# batch-100/5s test hit 429s, which at only ~12 req/min means TPM
# (tokens/minute) was the limit you crossed, not request count.
# Start a bit under whatever the dashboard shows (~80% of it) and adjust.
RPM_LIMIT = 60            # requests per minute
TPM_LIMIT = 150_000       # tokens per minute
MAX_CONCURRENT_REQUESTS = 6   # in-flight HTTP calls at once

EMBED_BATCH_SIZE = 50     # texts per API call — tune alongside TPM_LIMIT above
PINECONE_BATCH_SIZE = 100
MAX_RETRIES = 5
BACKOFF_BASE_SECONDS = 5
MAX_BACKOFF_SECONDS = 60

# Rough estimate only, used to pre-throttle before sending. Gemini's real
# tokenizer will differ slightly — the retry/backoff below is what actually
# protects you against a bad estimate, this just avoids obvious overshoot.
CHARS_PER_TOKEN_ESTIMATE = 4

# ── Singletons ────────────────────────────────────────────────

_pc: Pinecone | None = None
_index = None
_gemini_client: genai.Client | None = None


def _get_pinecone_client() -> Pinecone:
    global _pc
    if _pc is None:
        _pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    return _pc


def _get_gemini_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    return _gemini_client


def _get_index():
    global _index
    if _index is not None:
        return _index

    pc = _get_pinecone_client()
    index_name = settings.PINECONE_INDEX_NAME

    existing = [idx.name for idx in pc.list_indexes()]
    if index_name not in existing:
        logger.info(f"Creating Pinecone index '{index_name}'...")
        pc.create_index(
            name=index_name,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    _index = pc.Index(index_name)
    return _index


# ── Rate limiter ──────────────────────────────────────────────


class RateLimiter:
    """
    Sliding 60s-window limiter tracking BOTH requests/min and tokens/min.
    One shared instance is used across all concurrent workers, so total
    throughput (not just per-worker throughput) stays under quota.
    """

    def __init__(self, rpm_limit: int, tpm_limit: int):
        self.rpm_limit = rpm_limit
        self.tpm_limit = tpm_limit
        self._request_times: deque[float] = deque()
        self._token_events: deque[tuple[float, int]] = deque()
        self._lock = asyncio.Lock()

    def _purge(self, now: float) -> None:
        while self._request_times and now - self._request_times[0] > 60:
            self._request_times.popleft()
        while self._token_events and now - self._token_events[0][0] > 60:
            self._token_events.popleft()

    async def acquire(self, estimated_tokens: int) -> None:
        while True:
            async with self._lock:
                now = time.monotonic()
                self._purge(now)
                tokens_in_window = sum(t for _, t in self._token_events)
                room_for_requests = len(self._request_times) < self.rpm_limit
                room_for_tokens = tokens_in_window + estimated_tokens <= self.tpm_limit
                if room_for_requests and room_for_tokens:
                    self._request_times.append(now)
                    self._token_events.append((now, estimated_tokens))
                    return
            # Didn't get a slot — wait a bit and re-check. Short sleep keeps
            # us responsive to slots freeing up as the window slides.
            await asyncio.sleep(0.5)


_rate_limiter = RateLimiter(RPM_LIMIT, TPM_LIMIT)


def _estimate_tokens(texts: list[str]) -> int:
    return sum(max(1, len(t) // CHARS_PER_TOKEN_ESTIMATE) for t in texts)


# ── Embeddings (async) ────────────────────────────────────────


async def _embed_batch_with_retry_async(
    client: genai.Client,
    texts: list[str],
    semaphore: asyncio.Semaphore,
) -> list[list[float]]:
    estimated_tokens = _estimate_tokens(texts)

    for attempt in range(MAX_RETRIES):
        await _rate_limiter.acquire(estimated_tokens)
        async with semaphore:
            try:
                result = await client.aio.models.embed_content(
                    model=EMBEDDING_MODEL,
                    contents=texts,
                    config={"output_dimensionality": EMBEDDING_DIMENSION},
                )
                return [e.values for e in result.embeddings]
            except Exception as e:
                is_rate_limit = "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e)
                if is_rate_limit and attempt < MAX_RETRIES - 1:
                    wait = min(BACKOFF_BASE_SECONDS * (2 ** attempt), MAX_BACKOFF_SECONDS)
                    logger.warning(
                        f"Rate limited (attempt {attempt + 1}/{MAX_RETRIES}). "
                        f"Waiting {wait}s... Google error: {e}"
                    )
                    await asyncio.sleep(wait)
                else:
                    raise
    raise RuntimeError("Max retries exceeded for embedding.")


async def _generate_embeddings_async(texts: list[str]) -> list[list[float]]:
    """Embed all texts concurrently, gated by the shared RPM/TPM limiter."""
    client = _get_gemini_client()
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

    batches = [
        texts[i : i + EMBED_BATCH_SIZE] for i in range(0, len(texts), EMBED_BATCH_SIZE)
    ]
    total = len(batches)
    logger.info(
        f"Embedding {len(texts)} texts in {total} batches "
        f"(concurrency={MAX_CONCURRENT_REQUESTS}, rpm={RPM_LIMIT}, tpm={TPM_LIMIT})"
    )

    async def run_batch(idx: int, batch: list[str]) -> list[list[float]]:
        logger.info(f"Embedding batch {idx + 1}/{total} ({len(batch)} texts)")
        return await _embed_batch_with_retry_async(client, batch, semaphore)

    tasks = [run_batch(i, batch) for i, batch in enumerate(batches)]
    # gather() preserves input order in the results list regardless of
    # completion order, so this still lines up with `texts` order.
    results = await asyncio.gather(*tasks)

    all_embeddings: list[list[float]] = []
    for r in results:
        all_embeddings.extend(r)
    return all_embeddings


def _generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Sync entry point — safe to call from a Celery task body."""
    return asyncio.run(_generate_embeddings_async(texts))


# ── Upsert ────────────────────────────────────────────────────


def upsert_chunks_to_pinecone(chunks: list[Chunk]) -> int:
    """Embed chunks and upsert to Pinecone. Returns count of vectors stored."""
    if not chunks:
        return 0

    index = _get_index()
    texts = [c.text for c in chunks]
    embeddings = _generate_embeddings(texts)

    vectors = []
    for chunk, emb in zip(chunks, embeddings):
        vectors.append({
            "id": chunk.chunk_id,
            "values": emb,
            "metadata": {
                "document_id": chunk.document_id,
                "user_id": chunk.user_id,
                "text": chunk.text[:1000],
                "title": chunk.metadata.get("title", ""),
                "chunk_index": chunk.metadata.get("chunk_index", 0),
            },
        })

    total = 0
    for i in range(0, len(vectors), PINECONE_BATCH_SIZE):
        batch = vectors[i : i + PINECONE_BATCH_SIZE]
        index.upsert(vectors=batch)
        total += len(batch)

    logger.info(f"Upserted {total} vectors for document_id={chunks[0].document_id}")
    return total


# ── Search ────────────────────────────────────────────────────


def search_chunks(
    question: str,
    document_id: int,
    user_id: int,
    top_k: int = 5,
) -> list[dict]:
    """Embed the question and return the top-k matching chunks for a document."""
    index = _get_index()

    query_vector = _generate_embeddings([question])[0]

    results = index.query(
        vector=query_vector,
        top_k=top_k,
        filter={"document_id": {"$eq": document_id}, "user_id": {"$eq": user_id}},
        include_metadata=True,
    )

    chunks = []
    for match in results.matches:
        meta = match.metadata or {}
        chunks.append({
            "text": meta.get("text", ""),
            "score": match.score,
            "chunk_index": meta.get("chunk_index", 0),
            "title": meta.get("title", ""),
        })
    return chunks


# ── Delete ────────────────────────────────────────────────────


def delete_document_vectors(document_id: int) -> None:
    index = _get_index()
    index.delete(filter={"document_id": {"$eq": document_id}})
    logger.info(f"Deleted vectors for document_id={document_id}")