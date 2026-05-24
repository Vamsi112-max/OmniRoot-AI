import asyncio
import json
import time
from fastapi import APIRouter, WebSocket

from simulators.metrics_engine import metrics_engine
from simulators.log_engine import log_engine
from simulators.incident_engine import incident_engine

router = APIRouter()


@router.websocket("/ws/stream")
async def stream(ws: WebSocket):
    await ws.accept()

    try:
        # Background queue approach: run engines concurrently and push unified payload.
        while True:
            t = time.time()

            metrics = metrics_engine.snapshot()
            logs = log_engine.consume_new_logs()
            incidents = incident_engine.consume_new_incident_alerts()

            payload = {
                "type": "tick",
                "ts": t,
                "metrics": metrics,
                "logs": logs,
                "incident_alerts": incidents,
                "active_incidents": incident_engine.active_incidents_snapshot(),
                "system_status": incident_engine.system_status_snapshot(),
                "ai": incident_engine.latest_ai_insight_snapshot(),
            }

            await ws.send_text(json.dumps(payload))

            # Pace the stream.
            await asyncio.sleep(1.0)

    except Exception:
        # Client disconnected or server error.
        try:
            await ws.close()
        except Exception:
            pass

