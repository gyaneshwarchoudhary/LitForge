"""
Simple fixed-size chunking with overlap.

No multi-level hierarchy — just split the text into ~1000 char chunks
with 200 char overlap. Each chunk gets a page estimate and metadata.
This keeps the total chunk count low and predictable.
"""

import re
import uuid
from dataclasses import dataclass, field


@dataclass
class Chunk:
    chunk_id: str
    document_id: int
    user_id: int
    text: str
    metadata: dict = field(default_factory=dict)


CHUNK_SIZE = 1000       # target chars per chunk
CHUNK_OVERLAP = 200     # overlap between consecutive chunks
MIN_CHUNK_SIZE = 100    # discard chunks shorter than this


def _clean_text(text: str) -> str:
    """Normalize whitespace."""
    text = text.replace("\r\n", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)   # collapse excessive newlines
    text = re.sub(r" {2,}", " ", text)        # collapse multiple spaces
    return text.strip()


def create_chunks(
    text: str,
    document_id: int,
    user_id: int,
    title: str = "",
) -> list[Chunk]:
    """
    Split text into fixed-size overlapping chunks.
    Simple, predictable, and keeps chunk count low.
    """
    text = _clean_text(text)

    if not text:
        return []

    chunks: list[Chunk] = []
    start = 0

    while start < len(text):
        end = start + CHUNK_SIZE

        # Try to break at a sentence boundary (. ! ?) near the end
        if end < len(text):
            # Look for the last sentence-ending punctuation within the chunk
            last_break = -1
            for punct in [".\n", ".\n", ". ", "?\n", "? ", "!\n", "! "]:
                pos = text.rfind(punct, start + MIN_CHUNK_SIZE, end)
                if pos > last_break:
                    last_break = pos + len(punct)

            if last_break > start + MIN_CHUNK_SIZE:
                end = last_break

        chunk_text = text[start:end].strip()

        if len(chunk_text) >= MIN_CHUNK_SIZE:
            chunks.append(Chunk(
                chunk_id=uuid.uuid4().hex,
                document_id=document_id,
                user_id=user_id,
                text=chunk_text,
                metadata={
                    "title": title,
                    "chunk_index": len(chunks),
                },
            ))

        # Move forward with overlap
        start = end - CHUNK_OVERLAP
        if start <= 0 and end >= len(text):
            break
        if end >= len(text):
            break

    return chunks
