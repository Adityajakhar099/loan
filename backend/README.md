# AI Loan Advisory Agent – RAG System & Backend Architecture

Production-grade, asynchronous backend and **Retrieval-Augmented Generation (RAG)** pipeline built with **Python 3.12+**, **FastAPI**, **LangChain**, **Google Gemini 2.5 Flash**, **FAISS**, **Sentence Transformers**, **PyMuPDF**, and **SQLAlchemy 2.0**.

Follows **Clean Architecture** and **SOLID** principles.

---

## 📐 RAG Architecture & Pipeline Diagram

```text
  [ Upload Loan PDF ]
          │
          ▼
   [ PyMuPDF / pdfplumber ] ──> Clean Text (Unicode NFKC, Header/Footer Scrubbing)
          │
          ▼
 [ Recursive Text Chunker ] ──> 1000-char Chunks, 200-char Overlap
          │
          ▼
[ Sentence Transformers ] ──> 384-dim Embeddings (all-MiniLM-L6-v2)
          │
          ▼
 [ FAISS Vector Store ] ─────> Persisted locally (app/vector_store/)
          │
          ├────────────────────────────────────────────────┐
          ▼                                                ▼
  [ Vector Deletion ]                            [ User Asks Question ]
 (Auto-purges vectors                                      │
  & rebuilds FAISS)                                         ▼
                                                [ Semantic Search (Top-K=5) ]
                                                           │
                                                           ▼
                                                [ Anti-Hallucination Prompt ]
                                                           │
                                                           ▼
                                                [ Google Gemini 2.5 Flash ]
                                                           │
                                                           ▼
                                                [ Source-Backed Answer +
                                                  Citations & Confidence Score ]
```

---

## 🏗 Directory Structure

```text
backend/
├── alembic/                      # Alembic database migration scripts
│   ├── versions/                 # Migration revision scripts
│   └── env.py                    # Async migration environment configuration
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── routes/
│   │       │   ├── chat.py       # RAG Chat Query endpoint (POST /api/v1/chat)
│   │       │   ├── document.py   # PDF upload, listing, details & deletion
│   │       │   ├── documents.py  # Router alias for compatibility
│   │       │   ├── system.py     # Health & readiness probes
│   │       │   └── health.py     # Router alias for compatibility
│   │       ├── router.py         # v1 router aggregator
│   │       └── api.py            # API v1 module entry
│   ├── core/
│   │   ├── config.py             # Typed Pydantic V2 settings (.env loader)
│   │   ├── logging.py            # Loguru structured logging configuration
│   │   └── exceptions.py         # Custom exception hierarchy & global handlers
│   ├── database/
│   │   ├── connection.py         # Async SQLAlchemy engine & session pool
│   │   └── database.py           # Database module interface & exports
│   ├── middleware/
│   │   ├── cors.py               # CORS configuration
│   │   └── logging_middleware.py # Request logging & latency tracking
│   ├── models/
│   │   └── document.py           # LoanDocument ORM model
│   ├── schemas/
│   │   ├── document.py           # Input/Output Pydantic V2 schemas
│   │   └── response.py           # Standardised API response envelope
│   ├── services/
│   │   ├── pdf_extractor.py     # Text extraction & NFKC cleaning (PyMuPDF / pdfplumber)
│   │   ├── text_chunker.py      # Semantic text chunking (1000 size, 200 overlap)
│   │   ├── vector_store.py      # FAISS vector store manager & persistent embeddings
│   │   ├── rag_service.py       # Gemini 2.5 Flash LLM integration & RAG pipeline
│   │   └── document_service.py   # Document CRUD & RAG index lifecycle
│   ├── utils/
│   │   └── helpers.py            # Utility helpers
│   ├── vector_store/             # Persisted FAISS index files (index.faiss, index.pkl)
│   └── main.py                   # FastAPI application factory, lifespan & vector startup
├── uploads/                      # Local PDF document storage directory
├── tests/                        # Pytest async test suite
│   ├── conftest.py               # Fixtures & in-memory SQLite database
│   ├── test_documents.py         # Document CRUD endpoint tests
│   ├── test_health.py            # Health check tests
│   └── test_rag.py               # Full RAG pipeline tests (extraction, chunking, FAISS, chat)
├── .env.example                  # Environment configuration template
├── main.py                       # Uvicorn root entry point
├── README.md                     # Architecture documentation
└── requirements.txt              # Production python dependencies
```

---

## ⚙️ Environment Variables (`.env`)

```env
# Application
PROJECT_NAME="AI Loan Advisory Agent API"
VERSION="1.0.0"
API_V1_STR="/api/v1"
DEBUG=true
ENVIRONMENT="development"

# Database
POSTGRES_SERVER="localhost"
POSTGRES_PORT=5432
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres_password"
POSTGRES_DB="loan_ai_db"

# RAG & Vector Search
EMBEDDING_MODEL_NAME="sentence-transformers/all-MiniLM-L6-v2"
VECTOR_STORE_DIR="app/vector_store"
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
RAG_TOP_K=5

# Google Gemini LLM
GEMINI_API_KEY="your-google-gemini-api-key"
GEMINI_MODEL_NAME="gemini-2.5-flash"
LLM_TEMPERATURE=0.2
LLM_MAX_TOKENS=1024
```

---

## 🚀 Quickstart & Installation

```bash
# 1. Virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows PowerShell
# source venv/bin/activate    # Linux / macOS

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env

# 4. Run database migrations
alembic upgrade head

# 5. Execute full test suite
pytest -v

# 6. Launch development server
uvicorn main:app --reload --port 8000
```

---

## 📡 API Endpoints & Usage

### 1. Ask a Loan Policy Question (RAG Chat)
**`POST /api/v1/chat`**

Request:
```json
{
  "question": "What is the minimum credit score required for a home loan?"
}
```

Response:
```json
{
  "success": true,
  "message": "Response generated successfully.",
  "data": {
    "answer": "Based on official policy, the minimum credit score required for a home loan is 750.",
    "sources": [
      {
        "document": "Home_Loan_Policy_2026.pdf",
        "page": 1,
        "similarity": 0.92
      }
    ],
    "confidence": 0.92
  },
  "timestamp": "2026-07-24T13:00:00+00:00",
  "errors": null
}
```

---

## 🧪 Automated Test Suite

Run all 11 unit and integration tests:
```bash
pytest -v
```

Tests cover:
- PDF page text extraction & NFKC cleaning
- Semantic text chunking (1000/200 overlap)
- FAISS vector embedding & similarity search
- Document vector deletion & index purging
- Chat API context retrieval and source citations
- Fallback response when context is insufficient
