"""
Pinecone vector store + Google Gemini embeddings.
"""

import logging
import time

from pinecone import Pinecone, ServerlessSpec
from google import genai

from app.core.config import settings
from app.services.chunking_service import Chunk

logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────

EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIMENSION = 768
EMBED_BATCH_SIZE = 10         # texts per API call
PINECONE_BATCH_SIZE = 100
MAX_RETRIES = 5
# Free tier = 100 requests/min. Each text = 1 request.
# 10 texts every 10 seconds = 60 texts/min → safely under limit.
DELAY_BETWEEN_BATCHES = 10

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


# ── Embeddings ────────────────────────────────────────────────


def _embed_batch_with_retry(client, texts: list[str]) -> list[list[float]]:
    """Embed a small batch with retry on rate limits."""
    for attempt in range(MAX_RETRIES):
        try:
            result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=texts,
                config={"output_dimensionality": EMBEDDING_DIMENSION},
            )
            return [e.values for e in result.embeddings]
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                # Google says "retry in ~48s", so start at 15s and double
                wait = (2 ** attempt) * 15  # 15, 30, 60, 120, 240
                logger.warning(f"Rate limited (attempt {attempt + 1}/{MAX_RETRIES}). Waiting {wait}s...")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError("Max retries exceeded for embedding.")


def _generate_embeddings(texts: list[str]) -> list[list[float]]:
    """Embed all texts in small batches with delays."""
    client = _get_gemini_client()
    all_embeddings: list[list[float]] = []
    total = (len(texts) + EMBED_BATCH_SIZE - 1) // EMBED_BATCH_SIZE

    for i in range(0, len(texts), EMBED_BATCH_SIZE):
        batch = texts[i : i + EMBED_BATCH_SIZE]
        batch_num = (i // EMBED_BATCH_SIZE) + 1
        logger.info(f"Embedding batch {batch_num}/{total} ({len(batch)} texts)")

        embeddings = _embed_batch_with_retry(client, batch)
        all_embeddings.extend(embeddings)

        # Wait between batches to stay under rate limit
        if i + EMBED_BATCH_SIZE < len(texts):
            time.sleep(DELAY_BETWEEN_BATCHES)

    return all_embeddings


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


# ── Delete ────────────────────────────────────────────────────


def delete_document_vectors(document_id: int) -> None:
    index = _get_index()
    index.delete(filter={"document_id": {"$eq": document_id}})
    logger.info(f"Deleted vectors for document_id={document_id}")
