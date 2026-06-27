"""
PDF text extraction using PyMuPDF.
Simple: extract all text page-by-page, return as a single string with page metadata.
"""

import fitz  # PyMuPDF
from dataclasses import dataclass


@dataclass
class ExtractedDocument:
    title: str
    total_pages: int
    text: str  # full concatenated text


def extract_text_from_pdf(file_bytes: bytes) -> ExtractedDocument:
    """Extract all text from a PDF file."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    text_parts: list[str] = []
    for page in doc:
        page_text = page.get_text("text").strip()
        if page_text:
            text_parts.append(page_text)

    # Try title from metadata
    title = (doc.metadata.get("title", "") or "").strip() if doc.metadata else ""
    if not title:
        title = "Untitled Document"

    total_pages = len(doc)
    doc.close()

    return ExtractedDocument(
        title=title,
        total_pages=total_pages,
        text="\n\n".join(text_parts),
    )
