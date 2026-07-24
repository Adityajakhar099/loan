# Developer Setup & Run Guide

Follow these step-by-step instructions to run the **AI Loan Advisory Agent** locally or via Docker.

---

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: 3.11 or higher
- **PostgreSQL**: Local instance or Docker container

---

## 2. Local Environment Setup

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

FastAPI Interactive Swagger Docs: `http://localhost:8000/docs`
Health Check Endpoint: `http://localhost:8000/api/v1/health`

---

### Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start Vite dev server
npm run dev
```

Frontend application will open at `http://localhost:5173`.

---

## 3. Docker Deployment Setup

Run the full stack (PostgreSQL + FastAPI + React) in isolated containers:

```bash
cd docker
docker-compose up --build
```
