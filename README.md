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

```bash id="7rwe1s"
cd OmniRoot-AI/backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Local Backend:

* `http://localhost:8000`

Production Backend API:

* `https://omniroot-agentic-backend.onrender.com`

Production Backend WebSocket:

* `wss://omniroot-agentic-backend.onrender.com/ws/stream`



### 2) Frontend (Next.js)
```bash
cd OmniRoot-AI/frontend
npm install
npm run dev
```

Frontend expects backend at:
- `NEXT_PUBLIC_BACKEND_WS_URL` (default provided in `.env.local` guidance)
- `NEXT_PUBLIC_BACKEND_HTTP_URL` (default provided)

## Environment Variables

Create `OmniRoot-AI/frontend/.env.local`

```bash id="g2m7x1"
NEXT_PUBLIC_BACKEND_HTTP_URL=https://omniroot-agentic-backend.onrender.com
NEXT_PUBLIC_BACKEND_WS_URL=wss://omniroot-agentic-backend.onrender.com/ws/stream
```


## Demo
1. Start backend
2. Start frontend
3. Open: http://localhost:3000/dashboard

