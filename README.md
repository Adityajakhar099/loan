# 🏦 AI Loan Advisory Agent

> **Production-Grade Enterprise AI Architecture for Policy-Backed Intelligent Loan Advice**

---

## 📌 Project Overview
**AI Loan Advisory Agent** is an enterprise-grade web application platform that enables borrowers, credit officers, and loan underwriters to ask complex policy-related questions in plain conversational language and receive accurate, source-backed answers directly grounded in official loan policy manuals.

---

## 🛠 Tech Stack

### Frontend
- **Core Framework**: React 18 + Vite + TypeScript (Strict mode)
- **Styling**: Tailwind CSS (Fintech Modern Palette: `#020617` dark background, `#2563EB`/`#3B82F6`/`#1E3A8A` primary, `#38BDF8` accent)
- **Design & Motion**: Glassmorphism cards, GSAP, Framer Motion, Lenis Smooth Scroll
- **Routing & Icons**: React Router v6, Lucide Icons
- **Data & Services**: Axios API Client, `@tanstack/react-query`

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Settings & Schemas**: Pydantic v2 & `pydantic-settings`
- **Database & ORM**: PostgreSQL 16 + SQLAlchemy 2.0 (Async Engine via `asyncpg`)
- **Security & Infrastructure**: Passlib, Python-Jose (JWT foundation), CORS Middleware, Structured Logging

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose (Multi-stage builds)

---

## 📂 Complete File Structure & File Manifest Explanation

Below is the complete file tree of the repository along with the explicit rationale for why **every single file exists**:

```
loan-ai/
├── README.md                          # Primary project overview, architecture breakdown, install guide & file manifest
├── assets/                            # Static asset storage for screenshots, sample documents & media
│   └── .gitkeep
├── docs/                              # Detailed project documentation
│   ├── architecture.md               # Clean architecture breakdown & system diagrams
│   └── setup-guide.md                # Developer local & Docker installation guide
├── docker/                            # Production Docker environment configuration
│   ├── docker-compose.yml            # Multi-container orchestrator for Postgres, FastAPI, and Nginx React SPA
│   ├── Dockerfile.backend            # Python 3.11 slim multi-stage container build for FastAPI
│   └── Dockerfile.frontend           # Node 20 + Nginx alpine multi-stage build for React SPA
├── backend/                           # FastAPI Application Root
│   ├── app/
│   │   ├── main.py                   # FastAPI app entrypoint with CORS, logging middleware & global exception handlers
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── api.py            # API v1 router aggregator
│   │   ├── routes/
│   │   │   └── health.py             # Health check endpoint (/api/v1/health) returning DB connectivity & status
│   │   ├── config/
│   │   │   └── settings.py           # Pydantic Settings class loading environment variables
│   │   ├── core/
│   │   │   ├── exceptions.py         # Custom application exception hierarchy for uniform error responses
│   │   │   ├── logging_config.py     # Production-grade structured logging formatter
│   │   │   └── security.py           # Password hashing & JWT token generation utilities foundation
│   │   ├── database/
│   │   │   ├── base.py               # Registry importing all database models for Alembic metadata
│   │   │   └── connection.py         # PostgreSQL Database Connection Manager & SQLAlchemy async session provider
│   │   ├── middleware/
│   │   │   ├── cors.py               # CORS configuration setup allowing trusted origins
│   │   │   └── logging_middleware.py # Request latency & HTTP audit logging middleware
│   │   ├── models/
│   │   │   └── base_model.py         # Reusable SQLAlchemy mixin with UUID v4 primary key & UTC timestamps
│   │   ├── schemas/
│   │   │   ├── health_schema.py      # Pydantic schema for system health response
│   │   │   └── response_schema.py    # Standardized APIResponse & APIErrorResponse generic wrappers
│   │   ├── services/
│   │   │   └── base_service.py       # Generic BaseService CRUD abstraction layer following SOLID principles
│   │   └── utils/
│   │       └── helpers.py            # Helper utilities for UUID v4 generation & UTC timestamps
│   ├── .env                          # Local environment variables configuration
│   ├── .env.example                  # Environment template reference
│   └── requirements.txt              # Backend Python dependencies specification
└── frontend/                          # Vite + React + TypeScript Frontend Application
    ├── index.html                    # Single Page Application HTML entrypoint with Plus Jakarta Sans fonts
    ├── vite.config.ts                # Vite build configuration with `@/*` path alias mapping
    ├── tsconfig.json                 # TypeScript strict compiler options & path resolution
    ├── tsconfig.node.json            # Node-specific TypeScript config for build scripts
    ├── tailwind.config.js            # Tailwind CSS theme extension for fintech colors & glassmorphism
    ├── postcss.config.js             # PostCSS processing config for Tailwind & Autoprefixer
    ├── package.json                  # Frontend dependencies and npm scripts
    ├── .env                          # Frontend environment variables configuration
    ├── .env.example                  # Frontend environment template reference
    └── src/
        ├── main.tsx                  # React DOM rendering entrypoint
        ├── App.tsx                   # Main App component with React Router, QueryClient, Theme & Toast providers
        ├── styles/
        │   └── globals.css           # Global Tailwind directives, glassmorphic utilities & custom scrollbar
        ├── types/
        │   └── index.ts              # TypeScript interfaces for nav items, features, stats, FAQs & responses
        ├── constants/
        │   └── index.ts              # System configuration, navigation links, feature items, stats & FAQs
        ├── utils/
        │   └── cn.ts                 # `cn` helper combining `clsx` and `tailwind-merge` for class resolution
        ├── animations/
        │   ├── gsap.ts               # Reusable GSAP timeline animation helper functions
        │   └── framer.ts             # Reusable Framer Motion animation variants (fadeInUp, stagger, etc.)
        ├── contexts/
        │   ├── ThemeContext.tsx      # Dark/Light theme state provider (defaults to Dark theme)
        │   └── ToastContext.tsx      # Toast notification system provider & render container
        ├── hooks/
        │   ├── useTheme.ts           # Custom hook for theme state access
        │   ├── useToast.ts           # Custom hook for triggering toast alerts
        │   └── useSmoothScroll.ts    # Custom hook for initializing Lenis smooth scrolling
        ├── services/
        │   └── apiClient.ts          # Axios instance configured with base URL, timeout & error interceptors
        ├── components/
        │   ├── ui/
        │   │   ├── Button.tsx        # Reusable Button component with 5 variants, sizes, and loading state
        │   │   ├── Card.tsx          # Reusable Glassmorphism Card container with hover & glow options
        │   │   ├── Container.tsx     # Responsive max-width container wrapper
        │   │   ├── SectionWrapper.tsx# Page section wrapper with animated badge, title & subtitle headers
        │   │   └── LoadingSpinner.tsx# Reusable loading indicator spinner
        │   ├── layout/
        │   │   ├── Navbar.tsx        # Sticky glassmorphism navigation header with mobile drawer & theme toggle
        │   │   └── Footer.tsx        # Modern footer with quick links, social channels & compliance info
        │   └── sections/
        │       ├── Hero.tsx          # Hero section with motion text, CTA buttons, and interactive prompt card
        │       ├── FeaturesSection.tsx# Grid section showcasing core loan advisory capabilities
        │       ├── HowItWorksSection.tsx# Step-by-step pipeline demonstration section
        │       ├── StatisticsSection.tsx# Key performance metrics banner
        │       ├── TestimonialsSection.tsx# User reviews & client feedback cards
        │       └── FAQSection.tsx    # Interactive accordion for frequently asked questions
        └── pages/
            ├── Home.tsx              # Home page assembling all section components
            ├── About.tsx             # About Us page outlining mission and clean architecture
            ├── Features.tsx          # Features showcase page
            ├── Contact.tsx           # Contact page with interactive inquiry form & toast notification
            └── NotFound.tsx         # Custom 404 page for invalid routes
```

---

## ⚡ Quick Start & Installation

### Option 1: Docker (Recommended)
```bash
git clone <repo-url>
cd loan-ai/docker
docker-compose up --build
```
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000/api/v1/health
- **Swagger Docs**: http://localhost:8000/docs

### Option 2: Local Development

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 📜 Verification & Status
- **Health Endpoint**: `GET /api/v1/health`
- **Global Error Format**:
```json
{
  "success": false,
  "message": "Resource requested was not found.",
  "error": {
    "error_code": "NOT_FOUND",
    "details": null
  }
}
```

---

## 🛡 License
Enterprise Proprietary - All rights reserved.
