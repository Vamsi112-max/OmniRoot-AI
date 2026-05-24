import random
import time
from collections import deque
from typing import Deque, List


class LogEngine:
    def __init__(self):
        self.buffer: Deque[dict] = deque(maxlen=800)
        self._seed()

    def _seed(self):
        for _ in range(40):
            self._append_one()

    def _append_one(self):
        severities = ["INFO", "WARNING", "ERROR", "CRITICAL"]
        probs = [0.72, 0.20, 0.07, 0.01]
        sev = random.choices(severities, probs)[0]

        # Build realistic messages
        pool = {
            "INFO": [
                "Background reconciliation completed successfully",
                "Metrics pipeline: ingestion OK",
                "Connection pool warmed up",
                "Cache hit ratio improved",
                "Autoscaler evaluated target capacity",
            ],
            "WARNING": [
                "API latency spike detected",
                "Database response time increased",
                "Retry budget used up for a subset of requests",
                "High memory watermark reached",
                "Gateway observed intermittent upstream slowness",
            ],
            "ERROR": [
                "Upstream timeout while calling Checkout Service",
                "Redis timeout threshold exceeded",
                "Failed to allocate worker thread",
                "DB connection refused",
                "Circuit breaker opened for payment API",
            ],
            "CRITICAL": [
                "DDoS pattern signature matched — WAF engaged",
                "Deployment failure: health checks failing",
                "Cache overflow: evictions throttling",
                "Critical memory leak suspected (heap growth trend)",
                "Fatal: unable to reach metadata service",
            ],
        }

        msg = random.choice(pool[sev])
        entry = {
            "ts": time.time(),
            "severity": sev,
            "message": msg,
        }
        self.buffer.append(entry)

    def tick(self):
        # Produce logs based on active incidents
        from simulators.state import state
        active_incidents = state.get_active_incidents()

        if active_incidents:
            active = active_incidents[0]
            now = time.time()
            elapsed = now - active.get("started_at", now)

            # High severity for active incidents
            sev = "WARNING" if random.random() < 0.3 else "ERROR" if random.random() < 0.7 else "CRITICAL"

            pool = {
                "Database Failure": [
                    "Connection failure to database node: User Profile DB",
                    "Database pool exhaustion in application connection pool",
                    "Database pool exhaustion in application connection pool",
                    "Deadlock detected during order checkout process flow",
                    "[AI-MITIGATOR] Checking primary database replica health...",
                ],
                "Traffic Spike": [
                    "Gateway throughput spike: 8,400 requests/sec",
                    "Thread pool exhaustion in backend gateway container",
                    "Tail response latency exceeded SLA threshold (900ms)",
                    "[AI-MITIGATOR] Adjusting traffic splitting weight to 60/40...",
                ],
                "API Timeout": [
                    "Gateway connection timed out to upstream: Recommendation API",
                    "HTTP retries exhausted for API orchestration layer",
                    "Circuit breaker tripped for critical downstream gateway route",
                    "[AI-MITIGATOR] Activating API fallback response handler...",
                ],
                "Memory Leak": [
                    "JVM garbage collection time exceeded 85% watermark limit",
                    "Heap usage trending toward critical OutOfMemory threshold",
                    "Heap memory expansion rate is higher than standard deviation",
                    "[AI-MITIGATOR] Triggering heap allocation recycle job...",
                ],
                "DDoS Attack": [
                    "Anomalous traffic signature matching DDoS pattern on public endpoints",
                    "Rate limit triggered for multiple IP ranges on Gateway",
                    "TCP flood suspected from public api routes",
                    "[AI-MITIGATOR] Deploying WAF blocklist rules immediately...",
                ],
                "Deployment Failure": [
                    "Deployment health check failed for version v2.4.1",
                    "Core container failed to register with system service registry",
                    "Rolling deploy rollback threshold exceeded in production namespaces",
                    "[AI-MITIGATOR] Initiating automated deployment rollback to v2.4.0...",
                ],
                "Cache Overflow": [
                    "Redis eviction rate exceeded critical baseline limit (22,000 keys/sec)",
                    "Key eviction latency causing significant request delays",
                    "Memory exhaustion on primary redis cache node",
                    "[AI-MITIGATOR] Cleaning up expired keys and ephemeral records...",
                ],
            }

            category = active.get("category", "API Timeout")
            messages = pool.get(category, [f"Incident active on: {', '.join(active['affected_services'])}"])
            msg = random.choice(messages)

            # Map active log levels precisely
            if "[AI-MITIGATOR]" in msg:
                if "rollback" in msg or "fallback" in msg or "Cleaning" in msg:
                    sev = "ERROR" if random.random() < 0.5 else "CRITICAL"
                else:
                    sev = "WARNING"
            elif "exceeded" in msg or "failed" in msg or "exhaustion" in msg or "failure" in msg:
                sev = "ERROR" if random.random() < 0.7 else "CRITICAL"
            elif "latency" in msg or "exhausted" in msg or "tripped" in msg:
                sev = "ERROR" if random.random() < 0.5 else "WARNING"

            # Add AI logs explicitly
            if random.random() < 0.4:
                ai_msgs = [
                    f"[AI-AGENT] Processing active anomaly in: {category}...",
                    "[AI-AGENT] Running automated playbook mitigation sequence...",
                    "[AI-AGENT] System health check status: Degradation warning.",
                ]
                msg = random.choice(ai_msgs)
                sev = "INFO"

            entry = {
                "ts": now,
                "severity": sev,
                "message": msg,
            }
            self.buffer.append(entry)
        else:
            # Produce 0-2 standard logs per tick
            for _ in range(random.randint(0, 2)):
                self._append_one()

    def consume_new_logs(self, max_logs: int = 60) -> List[dict]:
        # Create new logs on demand.
        self.tick()
        out: List[dict] = []
        # Consume from end-ish to preserve recent order
        while self.buffer and len(out) < max_logs:
            out.append(self.buffer.pop())
        # Reverse to chronological
        out.reverse()
        return out


log_engine = LogEngine()

