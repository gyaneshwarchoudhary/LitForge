"""
Pinecone vector store integration.

Handles:
  - Index initialisation (creates if not exists)
  - Embedding generation via Google Gemini text-embedding-004
  - Upserting hierarchical chunks
  - Deleting all vectors for a given document
"""

import logging
from pinecone import Pinecone, ServerlessSpec
from google import genai

from app.core.config import settings
from app.services.chunking_service import Chunk

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────

EMBEDDING_MODEL = "gemini-embedding-2"
EMBEDDING_DIMENSION = 768       # Gemini text-embedding-004 output dim
BATCH_SIZE = 100              # Pinecone upsert batch size


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
    """Get or create the Pinecone index."""
    global _index
    if _index is not None:
        return _index

    pc = _get_pinecone_client()
    index_name = settings.PINECONE_INDEX_NAME

    # Check if index exists, create if not
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    if index_name not in existing_indexes:
        logger.info(f"Creating Pinecone index '{index_name}'...")
        pc.create_index(
            name=index_name,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        logger.info(f"Pinecone index '{index_name}' created.")

    _index = pc.Index(index_name)
    return _index


# ── Embedding generation ──────────────────────────────────────


def _generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of texts using Google Gemini.
    Processes in batches to respect API limits.
    """
    client = _get_gemini_client()
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        result = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=batch,
        )
        all_embeddings.extend([e.values for e in result.embeddings])

    return all_embeddings


# ── Upsert chunks ─────────────────────────────────────────────


def upsert_chunks_to_pinecone(chunks: list[Chunk]) -> int:
    """
    Embed and upsert a list of hierarchical chunks into Pinecone.

    Returns the number of vectors upserted.
    """
    if not chunks:
        return 0

    index = _get_index()

    # Prepare texts for embedding
    texts = [chunk.text for chunk in chunks]
    embeddings = _generate_embeddings(texts)

    # Build Pinecone vectors
    vectors = []
    for chunk, embedding in zip(chunks, embeddings):
        vectors.append({
            "id": chunk.chunk_id,
            "values": embedding,
            "metadata": {
                "document_id": chunk.document_id,
                "user_id": chunk.user_id,
                "level": chunk.level,
                "text": chunk.text[:1000],  # Pinecone metadata size limit
                "section_title": chunk.metadata.get("section_title", ""),
                "parent_id": chunk.metadata.get("parent_id", ""),
                "start_page": chunk.metadata.get("start_page", 0),
                "end_page": chunk.metadata.get("end_page", 0),
                "title": chunk.metadata.get("title", ""),
            },
        })

    # Upsert in batches
    total_upserted = 0
    for i in range(0, len(vectors), BATCH_SIZE):
        batch = vectors[i : i + BATCH_SIZE]
        index.upsert(vectors=batch)
        total_upserted += len(batch)

    logger.info(
        f"Upserted {total_upserted} vectors for document_id={chunks[0].document_id}"
    )
    return total_upserted


# ── Delete by document ────────────────────────────────────────


def delete_document_vectors(document_id: int) -> None:
    """Delete all vectors associated with a document from Pinecone."""
    index = _get_index()
    # Use metadata filter to delete all chunks for this document
    index.delete(filter={"document_id": {"$eq": document_id}})
    logger.info(f"Deleted all vectors for document_id={document_id}")
