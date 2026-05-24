from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.health import router as health_router
from routes.incidents import router as incidents_router
from websocket.stream import router as stream_router

app = FastAPI(title="OmniRoot AI Backend (Simulated)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")
app.include_router(stream_router, prefix="")


@app.get("/")
def root():
    return {"name": "OmniRoot AI Backend", "status": "ok"}

