# OmniRoot AI

AI-Powered Autonomous Infrastructure Intelligence Platform (Hackathon MVP)

## What’s included (Foundation Phase)
- FastAPI backend with REST + WebSocket streaming
- Simulated live metrics + logs + incidents
- Next.js (App Router) frontend with Tailwind + futuristic dark theme
- Recharts live-updating charts
- Streaming terminal logs
- Dashboard shell (health cards, charts, logs, incidents, system status grid)

> Note: All infrastructure behavior is simulated with realistic fake data. No real AWS/Kubernetes integrations.

## Local setup

### 1) Backend (FastAPI)
```bash
cd OmniRoot-AI/backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend WebSocket:
- `ws://localhost:8000/ws/stream`

### 2) Frontend (Next.js)
```bash
cd OmniRoot-AI/frontend
npm install
npm run dev
```

Frontend expects backend at:
- `NEXT_PUBLIC_BACKEND_WS_URL` (default provided in `.env.local` guidance)
- `NEXT_PUBLIC_BACKEND_HTTP_URL` (default provided)

## Environment variables
Create `OmniRoot-AI/frontend/.env.local`:
```bash
NEXT_PUBLIC_BACKEND_HTTP_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:8000/ws/stream
```

## Demo
1. Start backend
2. Start frontend
3. Open: http://localhost:3000/dashboard

