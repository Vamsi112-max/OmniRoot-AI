import random
import time
from collections import deque
from typing import Deque, Dict, List, Optional


class OmniState:
    def __init__(self):
        self._incident_history: Deque[dict] = deque(maxlen=500)
        self._active_incidents: Dict[str, dict] = {}
        self._ai_latest: Optional[dict] = None
        self._last_ai_ts: float = 0.0

    def push_incident(self, incident: dict):
        self._incident_history.appendleft(incident)
        self._active_incidents[incident["id"]] = incident

    def expire_incident(self, incident_id: str):
        if incident_id in self._active_incidents:
            self._active_incidents.pop(incident_id, None)

    def get_incident_history(self, limit: int = 50) -> List[dict]:
        return list(self._incident_history)[:limit]

    def get_active_incidents(self) -> List[dict]:
        return list(self._active_incidents.values())

    def set_ai_latest(self, ai: dict):
        self._ai_latest = ai
        self._last_ai_ts = time.time()

    def latest_ai(self) -> Optional[dict]:
        return self._ai_latest

    def ai_ts(self) -> float:
        return self._last_ai_ts


state = OmniState()

