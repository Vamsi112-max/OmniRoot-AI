from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {
        "frontend": "ready",
        "backend": "ready",
        "database": "simulated",
        "cache": "simulated",
        "status": "healthy",
    }

