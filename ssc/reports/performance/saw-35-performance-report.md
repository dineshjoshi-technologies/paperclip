# SAW-35 Backend Load Test Report

Date (UTC): 2026-04-10
Issue: SAW-35
Target service: SSC backend `/health` endpoint

## Test Scenarios

1. Artillery scenario (primary pass/fail evidence)
- Config: `scripts/loadtest/saw-35-health-artillery.yml`
- Warmup: 20 arrivals/sec for 10s
- Sustained: 60 arrivals/sec for 60s
- Endpoint: `GET /health`

2. Autocannon scenario (throughput cross-check)
- Config: `scripts/loadtest/saw-35-autocannon-health.json`
- Warmup: 10 connections for 5s
- Sustained: 50 connections for 20s
- Endpoint: `GET /health`

## Expected Traffic Target (for SAW-6 gate)

- Minimum throughput: 60 req/sec sustained
- p95 latency <= 2000 ms
- p99 latency <= 2000 ms
- Error rate <= 1%

## Results

### Artillery (primary)
- Total requests: 3800
- Sustained request rate: 60 req/sec
- Status codes: 100% HTTP 200
- Error rate: 0%
- Response time mean: 1.7 ms
- Response time p95: 3 ms
- Response time p99: 5 ms
- Response time max: 31 ms

### Autocannon (cross-check)
- Total requests: 44k in 20.05s
- Average throughput: 2202.45 req/sec
- Latency avg: 22.18 ms
- Latency p99: 62 ms
- No request failures observed

## Pass/Fail Verdict

PASS

The backend health API exceeded the expected traffic target with wide margin and remained stable:
- Throughput met/exceeded target (`60 req/sec` sustained in Artillery; `2202.45 req/sec` in Autocannon cross-check).
- p95 and p99 latency were far below threshold (`p95=3 ms`, `p99=5 ms`).
- Error rate remained `0%`.

## Artifacts

- `reports/performance/saw-35-artillery-summary.txt`
- `reports/performance/saw-35-artillery-raw.json`
- `reports/performance/saw-35-autocannon-summary.txt`
- `scripts/loadtest/saw-35-health-artillery.yml`
- `scripts/loadtest/saw-35-autocannon-health.json`
