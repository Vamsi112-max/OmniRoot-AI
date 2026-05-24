import random
import time
import uuid
from typing import Dict, List, Optional

from simulators.state import state


class IncidentEngine:
    def __init__(self):
        self._pending_alerts: List[dict] = []
        self._last_incident_ts: float = 0.0
        self._ai_refresh_every_s = 12.0

        self._active_duration_s = (18, 45)
        self._system_status = {
            "frontend": "Healthy",
            "backend": "Healthy",
            "database": "Healthy",
            "cache": "Healthy",
            "APIs": "Healthy",
            "cloud gateway": "Healthy",
        }

    def _severity(self, score: float) -> str:
        if score > 0.88:
            return "CRITICAL"
        if score > 0.65:
            return "ERROR"
        if score > 0.40:
            return "WARNING"
        return "INFO"

    def _pick_category(self) -> str:
        return random.choice(
            [
                "Database Failure",
                "Traffic Spike",
                "API Timeout",
                "Memory Leak",
                "DDoS Attack",
                "Deployment Failure",
                "Cache Overflow",
            ]
        )

    def _impact_score(self) -> float:
        base = random.random() * 0.7
        # bias toward moderate incidents
        return min(0.99, base + random.random() * 0.35)

    def _affected_services_for_category(self, category: str) -> List[str]:
        mapping = {
            "Database Failure": ["User Profile DB", "Orders DB", "Auth Store"],
            "Traffic Spike": ["Gateway", "Checkout Service", "Search API"],
            "API Timeout": ["Checkout Service", "Recommendation API"],
            "Memory Leak": ["Worker Pool", "Ingestion Service"],
            "DDoS Attack": ["WAF/Gateway", "Rate Limiter", "Public APIs"],
            "Deployment Failure": ["Deployment Controller", "Core API"],
            "Cache Overflow": ["Redis", "Session Store", "Rate Cache"],
        }
        return mapping.get(category, ["Core API"])

    def _update_system_status(self, category: str, severity: str):
        level = "Healthy"
        if severity in ("WARNING", "ERROR"):
            level = "Warning"
        if severity == "CRITICAL":
            level = "Critical"

        # Simple mapping of components.
        if category in ("Database Failure",):
            self._system_status["database"] = level
        if category in ("Cache Overflow",):
            self._system_status["cache"] = level
        if category in ("DDoS Attack", "Traffic Spike"):
            self._system_status["cloud gateway"] = level
            self._system_status["APIs"] = level
        if category in ("API Timeout", "Deployment Failure"):
            self._system_status["backend"] = level
            self._system_status["APIs"] = level
        if category in ("Memory Leak",):
            self._system_status["backend"] = level
            self._system_status["APIs"] = level

        # Reduce back to healthy over time handled when incidents expire.

    def _expire_old_incidents(self):
        now = time.time()
        expired = []
        for inc_id, inc in list(state._active_incidents.items()):
            if now - inc.get("started_at", now) > inc.get("ttl_s", 30):
                expired.append(inc_id)

        for inc_id in expired:
            state.expire_incident(inc_id)

        if not state.get_active_incidents():
            self._system_status = {
                "frontend": "Healthy",
                "backend": "Healthy",
                "database": "Healthy",
                "cache": "Healthy",
                "APIs": "Healthy",
                "cloud gateway": "Healthy",
            }
            try:
                from simulators.metrics_engine import metrics_engine
                metrics_engine.reset_metrics_spikes()
            except ImportError:
                pass

    def trigger_simulation(self, sim_name: str):
        now = time.time()
        mapping = {
            "CPU Spike Simulation": ("Traffic Spike", "cpu", "CRITICAL"),
            "Memory Leak Test": ("Memory Leak", "memory", "CRITICAL"),
            "Network Latency Inject": ("API Timeout", "latency", "CRITICAL"),
            "Cache Overflow Test": ("Cache Overflow", "error", "ERROR"),
        }
        category, spike, actual_sev = mapping.get(sim_name, ("API Timeout", "latency", "CRITICAL"))

        score = {"WARNING": 0.5, "ERROR": 0.75, "CRITICAL": 0.95}[actual_sev]
        sev_num = {"INFO": 1, "WARNING": 2, "ERROR": 3, "CRITICAL": 4}[actual_sev]

        incident_id = str(uuid.uuid4())
        started_at = now
        ttl_s = 40.0

        affected = self._affected_services_for_category(category)

        incident = {
            "id": incident_id,
            "category": category,
            "severity": actual_sev,
            "severity_score": sev_num,
            "started_at": started_at,
            "ttl_s": ttl_s,
            "affected_services": affected,
            "current_impact": f"Operator simulated: {sim_name}",
            "estimated_resolution": "~40 seconds",
        }

        try:
            from simulators.metrics_engine import metrics_engine
            metrics_engine.trigger_metrics_spike(spike)
        except ImportError:
            pass

        state.push_incident(incident)
        self._pending_alerts.append(incident)
        self._last_incident_ts = now
        self._update_system_status(category, actual_sev)
        return incident

    def maybe_generate_incident(self):
        now = time.time()
        # Rate-limit incident generation.
        if now - self._last_incident_ts < 8:
            self._expire_old_incidents()
            return

        # Probability per tick.
        if random.random() < 0.12:
            category = self._pick_category()
            score = self._impact_score()
            sev = self._severity(score)

            incident_id = str(uuid.uuid4())
            started_at = time.time()
            ttl_s = random.uniform(*self._active_duration_s)

            sev_num = {"INFO": 1, "WARNING": 2, "ERROR": 3, "CRITICAL": 4}[sev]
            affected = self._affected_services_for_category(category)

            incident = {
                "id": incident_id,
                "category": category,
                "severity": sev,
                "severity_score": sev_num,
                "started_at": started_at,
                "ttl_s": ttl_s,
                "affected_services": affected,
                "current_impact": random.choice(
                    [
                        "Elevated error rate",
                        "Increased tail latency",
                        "Timeouts in critical flows",
                        "Partial outage",
                        "Degraded performance",
                    ]
                ),
                "estimated_resolution": f"~{random.randint(15, 60)} min",
            }

            state.push_incident(incident)
            self._pending_alerts.append(incident)
            self._last_incident_ts = now
            self._update_system_status(category, sev)

    def latest_ai_insight_snapshot(self) -> Optional[dict]:
        # Refresh AI insight occasionally when incidents exist.
        now = time.time()
        active_incidents = state.get_active_incidents()
        if not active_incidents:
            return None

        active = active_incidents[0]
        elapsed = now - active.get("started_at", now)
        ttl = active.get("ttl_s", 40.0)

        # Add small randomness so the AI panel doesn’t repeat the exact same text each tick.
        # (We key randomness off incident id and elapsed bucket to keep it stable within a stage.)
        stage_bucket = int(elapsed // 4)
        jitter = random.Random(hash(active["id"]) + stage_bucket)
       
        # State machine mapping based on elapsed time of incident
        if elapsed < 8:
            status = "Detecting & Correlating"
            progress = int((elapsed / 8.0) * 20.0)
            logs = [
                "CRITICAL anomaly triggered in system telemetry.",
                "AI Agent initialized. Correlation ID: " + active["id"],
                "Analyzing metric variance across microservices...",
                "Running heuristic log pattern correlation...",
                f"Sampler verdict: {jitter.choice(['high', 'medium', 'low'])} confidence"
            ]
        elif elapsed < 16:
            status = "Diagnosing Cause"
            progress = 20 + int(((elapsed - 8.0) / 8.0) * 25.0)
            logs = [
                "CRITICAL anomaly triggered in system telemetry.",
                "AI Agent initialized. Correlation ID: " + active["id"],
                "Analyzing metric variance across microservices...",
                "Running heuristic log pattern correlation...",
                "Anomaly signature identified: " + active["category"],
                "Determined root cause: " + active["current_impact"],
                "Formulating automated mitigation playbook...",
                f"Root cause hash: {jitter.randint(1000, 9999)}"
            ]
        elif elapsed < 28:
            status = "Executing Playbook"
            progress = 45 + int(((elapsed - 16.0) / 12.0) * 35.0)
            logs = [
                "CRITICAL anomaly triggered in system telemetry.",
                "AI Agent initialized. Correlation ID: " + active["id"],
                "Analyzing metric variance across microservices...",
                "Running heuristic log pattern correlation...",
                "Anomaly signature identified: " + active["category"],
                "Determined root cause: " + active["current_impact"],
                "Playbook loaded: MITIGATE_" + active["category"].replace(" ", "_").upper(),
                "Step 1: Rerouting traffic from affected services...",
                "Step 2: Spawning auto-scaled backup container pods...",
                "Step 3: Hot-patching rate limit configurations on gateway...",
                f"Mitigation channel: {jitter.choice(['primary', 'secondary'])}"
            ]
        elif elapsed < 36:
            status = "Verifying Recovery"
            progress = 80 + int(((elapsed - 28.0) / 8.0) * 15.0)
            logs = [
                "CRITICAL anomaly triggered in system telemetry.",
                "AI Agent initialized. Correlation ID: " + active["id"],
                "Analyzing metric variance across microservices...",
                "Running heuristic log pattern correlation...",
                "Anomaly signature identified: " + active["category"],
                "Determined root cause: " + active["current_impact"],
                "Playbook loaded: MITIGATE_" + active["category"].replace(" ", "_").upper(),
                "Step 1: Rerouting traffic from affected services...",
                "Step 2: Spawning auto-scaled backup container pods...",
                "Step 3: Hot-patching rate limit configurations on gateway...",
                "Mitigation playbook executed successfully.",
                "Verifying system metrics stabilization...",
                "HTTP health checks: 200 OK (100% success rate)",
                f"Stabilization delta: {jitter.randint(1, 8)}%"
            ]
        else:
            status = "Resolved"
            progress = 100
            logs = [
                "CRITICAL anomaly triggered in system telemetry.",
                "AI Agent initialized. Correlation ID: " + active["id"],
                "Analyzing metric variance across microservices...",
                "Running heuristic log pattern correlation...",
                "Anomaly signature identified: " + active["category"],
                "Determined root cause: " + active["current_impact"],
                "Playbook loaded: MITIGATE_" + active["category"].replace(" ", "_").upper(),
                "Step 1: Rerouting traffic from affected services...",
                "Step 2: Spawning auto-scaled backup container pods...",
                "Step 3: Hot-patching rate limit configurations on gateway...",
                "Mitigation playbook executed successfully.",
                "Verifying system metrics stabilization...",
                "HTTP health checks: 200 OK (100% success rate)",
                "System fully restored to normal. Archiving playbook log.",
                f"Archive id: {jitter.randint(100000, 999999)}"
            ]

        ai = {
            "root_cause": f"{active['category']} correlated with metric divergence.",
            "severity": active["severity"],
            "predicted_impact": f"Likely impact window: next {max(5, int(ttl - elapsed))} seconds; active auto-mitigation in progress.",
            "recommendations": [
                "Enable targeted circuit breaker policies for affected services",
                "Quarantine anomalous traffic patterns and validate rate limiter behavior",
            ],
            "risks": [
                "Cascading failures across gateway and API layer",
                "Sustained error budget burn causing user-facing degradation",
            ],
            "predictions": {
                "outage_confidence": round(max(0.0, 0.95 - (elapsed / ttl) * 0.95), 2),
                "expected_recovery_minutes": max(0.0, round((ttl - elapsed) / 60, 2)),
            },
            "timeline_reconstruction": [
                {"t": "T-12m", "event": "Latency baseline drift detected"},
                {"t": "T-7m", "event": "Elevated errors & retry storms observed"},
                {"t": "T-3m", "event": "WAF/Gateway or DB/cache anomaly confirmed"},
                {"t": "Now", "event": "Incident declared and mitigation recommended"},
            ],
            "mitigation": {
                "status": status,
                "progress": progress,
                "logs": logs,
                "elapsed": round(elapsed, 1),
                "ttl": ttl
            }
        }
        state.set_ai_latest(ai)
        return state.latest_ai()

    def consume_new_incident_alerts(self, max_alerts: int = 5) -> List[dict]:
        self.maybe_generate_incident()
        out = self._pending_alerts[:max_alerts]
        self._pending_alerts = self._pending_alerts[max_alerts:]
        return out

    def active_incidents_snapshot(self) -> List[dict]:
        self.maybe_generate_incident()
        self._expire_old_incidents()
        return state.get_active_incidents()[:6]

    def system_status_snapshot(self) -> Dict[str, str]:
        self.maybe_generate_incident()
        self._expire_old_incidents()
        return self._system_status


incident_engine = IncidentEngine()

