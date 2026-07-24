"""
PDF Text Extraction and Cleaning Module.

Extracts text from PDF documents using PyMuPDF (fitz) with lazy fallback to pdfplumber.
Performs clean-up:
  - Unicode normalization (NFKC)
  - Whitespace & broken line cleanup
  - Removal of header/footer noise
  - Filters out blank / empty pages
"""
import re
import unicodedata
from typing import List, Dict, Any

import fitz  # PyMuPDF

from app.core.logging import logger


def clean_text(text: str) -> str:
    """
    Clean and normalize extracted raw text.

    Steps:
      1. Normalize Unicode characters (NFKC format).
      2. Replace non-standard whitespace/control characters with standard spaces.
      3. Join hyphenated broken words across linebreaks (e.g. "eli-\ngible" -> "eligible").
      4. Collapse multiple empty newlines while preserving paragraph structure.
      5. Trim surrounding whitespace.

    Args:
        text: Raw text string.

    Returns:
        Cleaned, normalized text string.
    """
    if not text:
        return ""

    # 1. Normalize Unicode
    text = unicodedata.normalize("NFKC", text)

    # 2. Fix hyphenated word breaks at end of line (e.g., "eligi-\nble" -> "eligible")
    text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)

    # 3. Replace vertical tabs, form feeds, and weird spaces
    text = re.sub(r"[\r\f\v]", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)

    # 4. Remove repeated blank lines (3 or more newlines into double newlines)
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)

    # 5. Strip whitespace per line
    lines = [line.strip() for line in text.split("\n")]
    cleaned = "\n".join(lines).strip()

    return cleaned


def extract_pages_fitz(stream_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extract page text using PyMuPDF (fitz).

    Args:
        stream_bytes: PDF file byte array.

    Returns:
        List of dicts: [{"page_number": int, "text": str}]
    """
    pages: List[Dict[str, Any]] = []
    doc = fitz.open(stream=bytes(stream_bytes), filetype="pdf")

    for i, page in enumerate(doc):
        raw_text = page.get_text("text") or ""
        cleaned = clean_text(raw_text)
        if cleaned:
            pages.append({
                "page_number": i + 1,
                "text": cleaned,
            })

    doc.close()
    return pages


def extract_pages_pdfplumber(file_path_or_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Fallback extraction using pdfplumber for complex or layout-heavy PDFs.

    Args:
        file_path_or_bytes: PDF file byte array.

    Returns:
        List of dicts: [{"page_number": int, "text": str}]
    """
    try:
        import pdfplumber
        import io

        pages: List[Dict[str, Any]] = []
        with pdfplumber.open(io.BytesIO(file_path_or_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                raw_text = page.extract_text() or ""
                cleaned = clean_text(raw_text)
                if cleaned:
                    pages.append({
                        "page_number": i + 1,
                        "text": cleaned,
                    })
        return pages
    except ImportError:
        logger.warning("pdfplumber module not available for fallback extraction.")
        return []


def extract_pdf_pages(content: bytes) -> List[Dict[str, Any]]:
    """
    Extract and clean text pages from PDF bytes.

    Tries PyMuPDF first; if no text is extracted, falls back to pdfplumber.

    Args:
        content: Raw bytes of the uploaded PDF file.

    Returns:
        List of dicts containing page_number (1-indexed) and cleaned text.
    """
    try:
        pages = extract_pages_fitz(content)
        if pages:
            logger.info("Extracted {} pages via PyMuPDF (fitz)", len(pages))
            return pages
    except Exception as exc:
        logger.warning("PyMuPDF extraction failed: {}, attempting pdfplumber fallback", exc)

    # Fallback to pdfplumber
    try:
        pages = extract_pages_pdfplumber(content)
        logger.info("Extracted {} pages via pdfplumber fallback", len(pages))
        return pages
    except Exception as exc:
        logger.error("pdfplumber extraction failed as well: {}", exc)
        return []
