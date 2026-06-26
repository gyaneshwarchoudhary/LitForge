"""
Hierarchical (Multi-Level) Chunking.

Creates a 3-level chunk hierarchy:
  Level 1 — Document: full document summary/context
  Level 2 — Section:  grouped by detected headings or page ranges
  Level 3 — Paragraph: individual paragraphs within each section

Each chunk carries metadata about its parent, enabling contextual retrieval.
"""

import re
import uuid
from dataclasses import dataclass, field

from app.services.pdf_extractor import ExtractedDocument, PageContent


@dataclass
class Chunk:
    """A single chunk at any level of the hierarchy."""

    chunk_id: str
    document_id: int        # DB document.id
    user_id: int
    level: str              # "document" | "section" | "paragraph"
    text: str
    metadata: dict = field(default_factory=dict)


# ── Configuration ─────────────────────────────────────────────

MAX_PARAGRAPH_CHARS = 1500      # soft limit per paragraph chunk
OVERLAP_CHARS = 200             # overlap between paragraph chunks
MIN_CHUNK_CHARS = 50            # discard chunks shorter than this


def _split_into_paragraphs(text: str) -> list[str]:
    """Split text into paragraphs by double-newline or significant whitespace."""
    # Normalise line breaks
    text = text.replace("\r\n", "\n")
    # Split on 2+ newlines
    paragraphs = re.split(r"\n{2,}", text)
    # Clean up and filter empty
    return [p.strip() for p in paragraphs if p.strip()]


def _split_long_paragraph(text: str, max_chars: int, overlap: int) -> list[str]:
    """
    Split a long paragraph into overlapping sub-chunks,
    breaking at sentence boundaries where possible.
    """
    if len(text) <= max_chars:
        return [text]

    # Try to split at sentence boundaries
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks = []
    current = ""

    for sentence in sentences:
        if len(current) + len(sentence) + 1 > max_chars and current:
            chunks.append(current.strip())
            # Keep overlap from end of current chunk
            overlap_text = current[-overlap:] if len(current) > overlap else current
            current = overlap_text + " " + sentence
        else:
            current = (current + " " + sentence).strip() if current else sentence

    if current.strip():
        chunks.append(current.strip())

    return chunks


def _extract_sections(extracted_doc: ExtractedDocument) -> list[dict]:
    """
    Group pages into sections based on detected headings.
    If no headings are found, each page becomes its own section.
    """
    sections: list[dict] = []

    # Collect all headings across all pages with their page numbers
    all_headings = []
    for page in extracted_doc.pages:
        for heading in page.headings:
            if heading["level"] <= 2:  # Only L1 and L2 headings define sections
                all_headings.append({
                    "text": heading["text"],
                    "level": heading["level"],
                    "page_number": page.page_number,
                })

    if not all_headings:
        # No headings found — group every ~5 pages into a section
        group_size = 5
        for i in range(0, len(extracted_doc.pages), group_size):
            group = extracted_doc.pages[i : i + group_size]
            section_text = "\n\n".join(p.text for p in group)
            start_page = group[0].page_number
            end_page = group[-1].page_number
            sections.append({
                "title": f"Pages {start_page}–{end_page}",
                "text": section_text,
                "start_page": start_page,
                "end_page": end_page,
            })
        return sections

    # Build sections from headings
    for idx, heading in enumerate(all_headings):
        start_page = heading["page_number"]
        # End page is the page before the next heading (or the last page)
        if idx + 1 < len(all_headings):
            end_page = all_headings[idx + 1]["page_number"]
            # Include text up to (but not including) the next heading's page
            # unless they share a page
            if end_page > start_page:
                end_page_inclusive = end_page - 1
            else:
                end_page_inclusive = start_page
        else:
            end_page_inclusive = extracted_doc.total_pages

        section_pages = [
            p for p in extracted_doc.pages
            if start_page <= p.page_number <= end_page_inclusive
        ]
        section_text = "\n\n".join(p.text for p in section_pages)

        sections.append({
            "title": heading["text"],
            "text": section_text,
            "start_page": start_page,
            "end_page": end_page_inclusive,
        })

    return sections


def create_hierarchical_chunks(
    extracted_doc: ExtractedDocument,
    document_id: int,
    user_id: int,
) -> list[Chunk]:
    """
    Build a 3-level chunk hierarchy from an extracted PDF document.

    Returns a flat list of Chunk objects with level and parent metadata.
    """
    chunks: list[Chunk] = []

    # ── Level 1: Document chunk ───────────────────────────────
    # A summary-level chunk with the first ~2000 chars + metadata
    doc_preview = extracted_doc.full_text[:2000].strip()
    doc_chunk_id = uuid.uuid4().hex

    chunks.append(Chunk(
        chunk_id=doc_chunk_id,
        document_id=document_id,
        user_id=user_id,
        level="document",
        text=doc_preview,
        metadata={
            "title": extracted_doc.title,
            "total_pages": extracted_doc.total_pages,
            "parent_id": None,
        },
    ))

    # ── Level 2: Section chunks ───────────────────────────────
    sections = _extract_sections(extracted_doc)

    for section in sections:
        section_chunk_id = uuid.uuid4().hex
        section_preview = section["text"][:3000].strip()

        if len(section_preview) < MIN_CHUNK_CHARS:
            continue

        chunks.append(Chunk(
            chunk_id=section_chunk_id,
            document_id=document_id,
            user_id=user_id,
            level="section",
            text=section_preview,
            metadata={
                "section_title": section["title"],
                "start_page": section["start_page"],
                "end_page": section["end_page"],
                "parent_id": doc_chunk_id,
            },
        ))

        # ── Level 3: Paragraph chunks ─────────────────────────
        paragraphs = _split_into_paragraphs(section["text"])

        for para in paragraphs:
            sub_chunks = _split_long_paragraph(
                para, MAX_PARAGRAPH_CHARS, OVERLAP_CHARS
            )
            for sub in sub_chunks:
                if len(sub) < MIN_CHUNK_CHARS:
                    continue

                para_chunk_id = uuid.uuid4().hex
                chunks.append(Chunk(
                    chunk_id=para_chunk_id,
                    document_id=document_id,
                    user_id=user_id,
                    level="paragraph",
                    text=sub,
                    metadata={
                        "section_title": section["title"],
                        "start_page": section["start_page"],
                        "end_page": section["end_page"],
                        "parent_id": section_chunk_id,
                    },
                ))

    return chunks
