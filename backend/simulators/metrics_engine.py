import math
import random
import time
from collections import deque
from typing import Deque, Dict, List


class MetricsEngine:
    def __init__(self):
        self.cpu_series: Deque[float] = deque(maxlen=120)
        self.mem_series: Deque[float] = deque(maxlen=120)
        self.latency_series: Deque[float] = deque(maxlen=120)
        self.throughput_series: Deque[float] = deque(maxlen=120)
        self.error_series: Deque[float] = deque(maxlen=120)

        # Seed initial values for smoother chart starts.
        self.forced_cpu_spike = False
        self.forced_mem_spike = False
        self.forced_latency_spike = False
        self.forced_error_spike = False

        for _ in range(30):
            self._append_initial_tick()

    def _append_initial_tick(self):
        t = len(self.cpu_series)
        cpu = 42 + 8 * math.sin(t / 6) + random.uniform(-3, 3)
        mem = 58 + 10 * math.sin(t / 8 + 1.2) + random.uniform(-4, 4)
        latency = 80 + 18 * math.sin(t / 7) + random.uniform(-8, 10)
        throughput = 520 + 90 * math.sin(t / 5 + 0.2) + random.uniform(-35, 35)
        errors = max(0, 3 + 2 * math.sin(t / 4 + 0.7) + random.uniform(-1.5, 2.0))

        self.cpu_series.append(cpu)
        self.mem_series.append(mem)
        self.latency_series.append(latency)
        self.throughput_series.append(throughput)
        self.error_series.append(errors)

    def _next_tick(self) -> Dict[str, float]:
        t = time.time()

        # Natural fluctuation
        cpu = 44 + 10 * math.sin(t / 10) + random.uniform(-4, 4)
        mem = 60 + 11 * math.sin(t / 12 + 0.6) + random.uniform(-4, 4)
        latency = 90 + 22 * math.sin(t / 9) + random.uniform(-10, 14)
        throughput = 540 + 110 * math.sin(t / 8 + 0.2) + random.uniform(-45, 45)
        errors = max(0, 3 + 2.5 * math.sin(t / 6 + 0.4) + random.uniform(-1.2, 2.2))

        # Occasionally introduce spikes (will also tend to coincide with incident engine)
        if random.random() < 0.04:
            cpu += random.uniform(15, 35)
        if random.random() < 0.05:
            latency += random.uniform(40, 120)
        if random.random() < 0.03:
            errors += random.uniform(6, 18)
        if random.random() < 0.03:
            mem += random.uniform(8, 18)

        # Forced spike overrides
        if self.forced_cpu_spike:
            cpu = random.uniform(88, 97)
        if self.forced_mem_spike:
            mem = random.uniform(91, 98)
        if self.forced_latency_spike:
            latency = random.uniform(480, 720)
        if self.forced_error_spike:
            errors = random.uniform(22, 38)

        cpu = max(0, min(100, cpu))
        mem = max(0, min(100, mem))
        latency = max(20, latency)
        throughput = max(50, throughput)
        errors = max(0, errors)

        self.cpu_series.append(cpu)
        self.mem_series.append(mem)
        self.latency_series.append(latency)
        self.throughput_series.append(throughput)
        self.error_series.append(errors)

        return {
            "cpu": cpu,
            "memory": mem,
            "api_latency": latency,
            "throughput": throughput,
            "error_rate": errors,
        }

    def trigger_metrics_spike(self, spike_type: str):
        if spike_type == "cpu":
            self.forced_cpu_spike = True
        elif spike_type == "memory":
            self.forced_mem_spike = True
        elif spike_type == "latency":
            self.forced_latency_spike = True
        elif spike_type == "error":
            self.forced_error_spike = True

    def reset_metrics_spikes(self):
        self.forced_cpu_spike = False
        self.forced_mem_spike = False
        self.forced_latency_spike = False
        self.forced_error_spike = False

    def snapshot(self) -> dict:
        latest = self._next_tick()
        # Return series with time indices for recharts.
        def series_map(series: Deque[float]):
            return [{"x": i, "y": v} for i, v in enumerate(series)]

        return {
            "latest": latest,
            "series": {
                "cpu": series_map(self.cpu_series),
                "memory": series_map(self.mem_series),
                "api_latency": series_map(self.latency_series),
                "throughput": series_map(self.throughput_series),
                "error_rate": series_map(self.error_series),
            },
        }


metrics_engine = MetricsEngine()

