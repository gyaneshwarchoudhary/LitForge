"""
PDF text extraction using PyMuPDF (fitz).

Extracts text page-by-page, preserving structural information like
headings and paragraphs for downstream hierarchical chunking.
"""

import fitz  # PyMuPDF
import re
from dataclasses import dataclass, field

@dataclass
class PageContent:
    """Extracted content from a single PDF page."""

    page_number: int  # 1-indexed
    text: str
    headings: list[dict] = field(default_factory=list)  # {"level": int, "text": str, "position": int}


@dataclass
class ExtractedDocument:
    """Full extracted content from a PDF."""

    title: str
    total_pages: int
    pages: list[PageContent]
    full_text: str


def _detect_headings(blocks: list, page_text: str) -> list[dict]:
    """
    Heuristically detect headings from text blocks based on font size.
    Blocks with larger or bold fonts relative to the body are treated as headings.
    """
    headings = []

    if not blocks:
        return headings

    # Collect font sizes from all span-level data
    font_sizes = []
    for block in blocks:
        if block["type"] == 0:  # text block
            for line in block["lines"]:
                for span in line["spans"]:
                    font_sizes.append(span["size"])

    if not font_sizes:
        return headings

    # Median font size is considered "body" text
    sorted_sizes = sorted(font_sizes)
    median_size = sorted_sizes[len(sorted_sizes) // 2]

    for block in blocks:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                text = span["text"].strip()
                if not text:
                    continue

                is_bold = "bold" in span["font"].lower() or "black" in span["font"].lower()
                is_larger = span["size"] > median_size * 1.15

                if is_larger or (is_bold and span["size"] >= median_size):
                    # Assign heading level based on size difference
                    if span["size"] > median_size * 1.5:
                        level = 1
                    elif span["size"] > median_size * 1.25:
                        level = 2
                    else:
                        level = 3

                    # Find position of this text in the page text
                    pos = page_text.find(text)
                    headings.append({
                        "level": level,
                        "text": text,
                        "position": pos if pos >= 0 else 0,
                    })

    return headings


def extract_text_from_pdf(file_bytes: bytes) -> ExtractedDocument:
    """
    Extract text and structural information from a PDF.

    Args:
        file_bytes: Raw PDF file content.

    Returns:
        ExtractedDocument with per-page content and detected headings.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    pages: list[PageContent] = []
    all_text_parts: list[str] = []

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        text = page.get_text("text")

        # Get block-level data for heading detection
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
        headings = _detect_headings(blocks, text)

        page_content = PageContent(
            page_number=page_idx + 1,
            text=text,
            headings=headings,
        )
        pages.append(page_content)
        all_text_parts.append(text)

    # Try to extract title from metadata or first heading
    metadata = doc.metadata
    title = metadata.get("title", "").strip() if metadata else ""
    if not title and pages and pages[0].headings:
        title = pages[0].headings[0]["text"]
    if not title:
        title = "Untitled Document"

    full_text = "\n\n".join(all_text_parts)
    doc.close()

    return ExtractedDocument(
        title=title,
        total_pages=len(pages),
        pages=pages,
        full_text=full_text,
    )
