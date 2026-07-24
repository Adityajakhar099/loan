"""
Comprehensive Tests for RAG Pipeline (PDF Extraction, Chunking, FAISS, Chat API).
"""
import io
import fitz
import pytest

from app.services.pdf_extractor import clean_text, extract_pdf_pages
from app.services.text_chunker import chunk_document_pages
from app.services.vector_store import VectorStoreManager, vector_store_manager
from app.services.rag_service import NOT_ENOUGH_INFO_MSG, generate_rag_response


def create_sample_pdf_bytes() -> bytes:
    """Helper to generate a multi-page loan policy PDF in memory."""
    doc = fitz.open()

    page1 = doc.new_page()
    page1.insert_text((50, 50), "AI Loan Advisory Home Loan Policy 2026.\n\nMinimum Credit Score Required: 750.\nMaximum LTV Ratio: 80% for loans above 30 Lakhs.")

    page2 = doc.new_page()
    page2.insert_text((50, 50), "Interest Rates and Charges.\n\nBase Interest Rate: 8.5% p.a.\nProcessing Fee: 0.5% of loan amount.")

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_text_cleaning():
    """Test text normalization and whitespace cleanup."""
    raw = "  Home   Loan --\n\n  Policy   Details\n\n\n\nExtra lines  "
    cleaned = clean_text(raw)
    assert "Home Loan" in cleaned
    assert "\n\n\n" not in cleaned


def test_pdf_page_extraction():
    """Test PyMuPDF extraction returns list of pages."""
    pdf_bytes = create_sample_pdf_bytes()
    pages = extract_pdf_pages(pdf_bytes)
    assert len(pages) == 2
    assert pages[0]["page_number"] == 1
    assert "Minimum Credit Score" in pages[0]["text"]
    assert pages[1]["page_number"] == 2
    assert "Base Interest Rate" in pages[1]["text"]


def test_text_chunking():
    """Test intelligent chunker produces chunk dicts with metadata."""
    pdf_bytes = create_sample_pdf_bytes()
    pages = extract_pdf_pages(pdf_bytes)
    chunks = chunk_document_pages(
        pages=pages,
        document_id="test-doc-123",
        original_filename="Home_Loan_Policy.pdf",
        chunk_size=200,
        chunk_overlap=50,
    )
    assert len(chunks) >= 2
    assert chunks[0]["document_id"] == "test-doc-123"
    assert chunks[0]["document_name"] == "Home_Loan_Policy.pdf"
    assert "metadata" in chunks[0]


@pytest.mark.asyncio
async def test_faiss_vector_store_operations():
    """Test embedding addition, similarity search, and vector deletion."""
    pdf_bytes = create_sample_pdf_bytes()
    pages = extract_pdf_pages(pdf_bytes)
    chunks = chunk_document_pages(
        pages=pages,
        document_id="doc-faiss-test",
        original_filename="FAISS_Test_Policy.pdf",
    )

    # Add to vector store
    added_count = vector_store_manager.add_chunks(chunks)
    assert added_count == len(chunks)

    # Search query
    results = vector_store_manager.search(query="credit score for home loan", top_k=3)
    assert len(results) >= 1
    assert "doc-faiss-test" in [r["document_id"] for r in results]
    assert results[0]["similarity"] > 0.3

    # Delete vectors
    purged = vector_store_manager.delete_document_vectors("doc-faiss-test")
    assert purged is True


@pytest.mark.asyncio
async def test_chat_endpoint_integration(async_client):
    """Test POST /api/v1/chat endpoint with sample document uploaded."""
    # 1. Upload a PDF first
    pdf_bytes = create_sample_pdf_bytes()
    files = {"file": ("Policy_2026.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    upload_res = await async_client.post("/api/v1/documents/upload", files=files)
    assert upload_res.status_code == 201

    # 2. Query Chat API for relevant information
    chat_payload = {"question": "What is the minimum credit score required for home loan?"}
    chat_res = await async_client.post("/api/v1/chat", json=chat_payload)
    assert chat_res.status_code == 200
    res_data = chat_res.json()

    assert res_data["success"] is True
    data = res_data["data"]
    assert "answer" in data
    assert len(data["sources"]) >= 1
    assert data["confidence"] > 0.0


@pytest.mark.asyncio
async def test_chat_endpoint_unanswerable_question(async_client):
    """Test POST /api/v1/chat when asking a completely unrelated question."""
    chat_payload = {"question": "What is the capital of Mars?"}
    chat_res = await async_client.post("/api/v1/chat", json=chat_payload)
    assert chat_res.status_code == 200
    data = chat_res.json()["data"]

    # Should state not enough information or return fallback with very low confidence
    assert data["answer"] == NOT_ENOUGH_INFO_MSG or data["confidence"] < 0.3
