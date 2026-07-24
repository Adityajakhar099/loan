# System Architecture - AI Loan Advisory Agent

## Overview
The **AI Loan Advisory Agent** system is structured around Clean Architecture principles, ensuring modularity, scalability, strict domain isolation, and high testability.

```
                    ┌─────────────────────────┐
                    │    React + Vite SPA     │
                    │ (Tailwind, GSAP, Lenis) │
                    └────────────┬────────────┘
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │    FastAPI Gateway      │
                    │  (CORS, Logging, Auth)  │
                    └────────────┬────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             ▼                                       ▼
  ┌─────────────────────┐                 ┌─────────────────────┐
  │   Health & Core     │                 │ Database Connection │
  │    Services         │                 │  (PostgreSQL Async) │
  └─────────────────────┘                 └─────────────────────┘
```

## Architectural Layers

### Frontend (SPA Layer)
- **Framework**: React 18 with TypeScript & Vite.
- **Styling System**: Tailwind CSS with custom fintech tokens (Dark palette: `#020617`, primary blues `#2563EB`/`#3B82F6`/`#1E3A8A`, accent `#38BDF8`, glassmorphism backdrop blurs).
- **Animations**: GSAP for smooth timeline transitions, Framer Motion for component entry animations, and Lenis for smooth momentum scrolling.
- **State & Data Fetching**: `@tanstack/react-query` & Axios API client with standardized request interceptors.

### Backend (Clean Layered API)
- **Framework**: FastAPI (Python 3.11+) with Pydantic v2 validation.
- **Application Structure**:
  - `core/`: Logging, security tokens (JWT foundation), exception hierarchies.
  - `config/`: Type-safe settings loaded from `.env` via `pydantic-settings`.
  - `database/`: Connection manager with SQLAlchemy 2.0 async engine and session dependencies.
  - `middleware/`: CORS middleware and latency/request audit logging middleware.
  - `routes/`: Versioned API endpoints (`/api/v1/health`).
  - `schemas/`: Pydantic input/output schemas and standardized `APIResponse`/`APIErrorResponse` wrappers.
  - `services/`: Abstract `BaseService` implementing CRUD boundaries.

### Database Layer
- **Engine**: PostgreSQL 16 managed via SQLAlchemy 2.0 `asyncpg` engine pool.
