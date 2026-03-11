# ShieldSpeak

**NLP-Based Cyberbullying Detection and Alert System**

ShieldSpeak is a web-based platform that analyzes text and voice communications for cyberbullying, classifies severity, provides warnings, and escalates incidents for human moderator review.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 16.4 |
| Cache/Queue | Redis 7.4, Celery |
| NLP | Transformers, Whisper |
| Auth | JWT (httpOnly cookies), bcrypt |

## Quick Start

### Prerequisites
- Node.js 20.16+
- Python 3.11+
- PostgreSQL 16+
- Redis 7+

### Option A: Docker (Recommended)
```bash
docker compose up -d
```

### Option B: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
cp .env.example .env     # Edit as needed

# Create database tables and seed data
python -c "from app.db.seed import seed; seed()"

# Start server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/docs
- API Health: http://localhost:8000/api/v1/health

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shieldspeak.com | admin123! |
| User | alex@demo.com | demo123! |
| User | jordan@demo.com | demo123! |

## Project Structure

```
cyberpro/
├── frontend/               # Next.js app
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom hooks (auth, toast)
│   │   ├── lib/           # API client, utilities
│   │   └── types/         # TypeScript types
│   └── tailwind.config.js
├── backend/                # FastAPI service
│   ├── app/
│   │   ├── api/           # Route handlers
│   │   ├── core/          # Config, security, dependencies
│   │   ├── db/            # Session, seed
│   │   ├── ml/            # NLP classifier
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── tasks/         # Celery tasks
│   └── requirements.txt
└── docker-compose.yml
```

## Features
- **Text Analysis** - Submit messages for NLP-powered safety analysis
- **Voice Analysis** - Upload/record audio, transcribe with Whisper, and analyze
- **Detection Results** - Severity, confidence, category, explanation, and guidance
- **User Dashboard** - Quick actions, stats, and recent analyses
- **Admin Dashboard** - KPI cards, incident queue, and analytics
- **Incident Review** - Human-reviewed moderation with audit logging
- **Analytics** - Severity distribution, category breakdown, and trend charts

## Design System
Uses "Trust + Safety Dark" theme - a cybersecurity-focused dark palette with blue/teal accents designed to feel protective, intelligent, and trustworthy.
