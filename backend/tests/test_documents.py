"""
Integration tests for Document Management Endpoints.
"""
import io
import fitz
import pytest


def create_minimal_pdf_bytes(title: str = "Test Policy Document") -> bytes:
    """Helper to generate valid PDF bytes using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), f"Sample Loan Policy - {title}")
    doc.set_metadata({"title": title, "author": "Test Author", "subject": "Loan Policy"})
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


@pytest.mark.asyncio
async def test_upload_pdf_success(async_client):
    """POST /api/v1/documents/upload should accept valid PDF and extract metadata."""
    pdf_bytes = create_minimal_pdf_bytes("Home Loan Terms 2026")
    files = {"file": ("home_loan_policy.pdf", io.BytesIO(pdf_bytes), "application/pdf")}

    response = await async_client.post("/api/v1/documents/upload", files=files)
    assert response.status_code == 201
    payload = response.json()

    assert payload["success"] is True
    data = payload["data"]
    assert "document_id" in data
    assert data["original_filename"] == "home_loan_policy.pdf"
    assert data["pages"] == 1
    assert data["status"] in ["UPLOADED", "PROCESSING", "PROCESSED"]
    assert data["metadata"]["title"] == "Home Loan Terms 2026"


@pytest.mark.asyncio
async def test_upload_invalid_file_type(async_client):
    """POST /api/v1/documents/upload should reject non-PDF files."""
    files = {"file": ("test.txt", io.BytesIO(b"Hello text file"), "text/plain")}

    response = await async_client.post("/api/v1/documents/upload", files=files)
    assert response.status_code == 400
    payload = response.json()
    assert payload["success"] is False
    assert payload["errors"]["error_code"] == "INVALID_FILE_TYPE"


@pytest.mark.asyncio
async def test_upload_invalid_pdf_magic_bytes(async_client):
    """POST /api/v1/documents/upload should reject files named .pdf but containing arbitrary text."""
    files = {"file": ("fake.pdf", io.BytesIO(b"Not a PDF file structure"), "application/pdf")}

    response = await async_client.post("/api/v1/documents/upload", files=files)
    assert response.status_code == 400
    payload = response.json()
    assert payload["success"] is False
    assert payload["errors"]["error_code"] == "INVALID_PDF"


@pytest.mark.asyncio
async def test_list_and_get_and_delete_document(async_client):
    """Test full cycle: Upload -> List -> Get -> Soft Delete -> Hard Delete."""
    # 1. Upload
    pdf_bytes = create_minimal_pdf_bytes("Personal Loan Terms")
    files = {"file": ("personal_loan.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    upload_res = await async_client.post("/api/v1/documents/upload", files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["data"]["document_id"]

    # 2. List
    list_res = await async_client.get("/api/v1/documents/")
    assert list_res.status_code == 200
    list_data = list_res.json()["data"]
    assert len(list_data) >= 1

    # 3. Get Detail
    get_res = await async_client.get(f"/api/v1/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == doc_id

    # 4. Soft Delete
    delete_res = await async_client.delete(f"/api/v1/documents/{doc_id}")
    assert delete_res.status_code == 200
    assert delete_res.json()["success"] is True

    # 5. Verify soft-deleted item not in active list
    get_after_delete = await async_client.get(f"/api/v1/documents/{doc_id}")
    assert get_after_delete.status_code == 404
