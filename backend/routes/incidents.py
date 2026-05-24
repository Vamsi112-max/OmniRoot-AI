from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from simulators.state import state
from simulators.incident_engine import incident_engine

router = APIRouter()


class SimulationRequest(BaseModel):
    name: str


@router.get("/incidents")
def list_incidents(limit: int = 50) -> List[dict]:
    # Return most recent incident alerts from in-memory state.
    return state.get_incident_history(limit=limit)


@router.post("/simulate")
def trigger_simulation_endpoint(req: SimulationRequest):
    valid_names = [
        "CPU Spike Simulation",
        "Memory Leak Test",
        "Network Latency Inject",
        "Cache Overflow Test",
    ]
    if req.name not in valid_names:
        raise HTTPException(status_code=400, detail=f"Invalid simulation name: {req.name}")

    incident = incident_engine.trigger_simulation(req.name)
    return {"status": "success", "incident": incident}


