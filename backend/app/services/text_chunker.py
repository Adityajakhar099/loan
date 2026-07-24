"""
Semantic Text Chunking Service.

Splits document text pages into semantic chunks while maintaining paragraph
and sentence structure without abrupt breaks.
"""
from typing import Any, Dict, List

from app.core.config import settings
from app.core.logging import logger


class LightweightTextSplitter:
    """Fallback text splitter when LangChain is initializing."""

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200) -> None:
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_text(self, text: str) -> List[str]:
        if not text:
            return []
        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + self.chunk_size, text_len)
            if end < text_len:
                # Try to break at paragraph or sentence boundary
                last_space = text.rfind(". ", start, end)
                if last_space == -1 or last_space < start + int(self.chunk_size * 0.5):
                    last_space = text.rfind("\n", start, end)
                if last_space == -1 or last_space < start + int(self.chunk_size * 0.5):
                    last_space = text.rfind(" ", start, end)
                if last_space != -1 and last_space > start:
                    end = last_space + 1

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = max(start + 1, end - self.chunk_overlap)
        return chunks


def chunk_document_pages(
    pages: List[Dict[str, Any]],
    document_id: str,
    original_filename: str,
    chunk_size: int = settings.CHUNK_SIZE,
    chunk_overlap: int = settings.CHUNK_OVERLAP,
) -> List[Dict[str, Any]]:
    """
    Split extracted PDF pages into intelligent semantic chunks.
    """
    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", "; ", ", ", " ", ""],
        )
    except ImportError:
        text_splitter = LightweightTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

    all_chunks: List[Dict[str, Any]] = []
    global_chunk_index = 0

    for page in pages:
        page_num = page["page_number"]
        page_text = page["text"]

        if not page_text:
            continue

        raw_splits = text_splitter.split_text(page_text)

        for sub_index, split_text in enumerate(raw_splits):
            chunk_id = f"{document_id}_p{page_num}_c{global_chunk_index}"
            chunk_item = {
                "chunk_id": chunk_id,
                "text": split_text,
                "document_id": str(document_id),
                "document_name": original_filename,
                "page_number": page_num,
                "chunk_index": global_chunk_index,
                "metadata": {
                    "document_id": str(document_id),
                    "document_name": original_filename,
                    "page_number": page_num,
                    "chunk_index": global_chunk_index,
                    "chunk_id": chunk_id,
                },
            }
            all_chunks.append(chunk_item)
            global_chunk_index += 1

    logger.info(
        "Chunked document | doc_id={} | filename='{}' | pages={} | total_chunks={}",
        document_id,
        original_filename,
        len(pages),
        len(all_chunks),
    )
    return all_chunks
