# Distributed Conflict Resolution Algorithm
Principal Backend Engineering Challenge

This project demonstrates an offline-first distributed data synchronization system with deterministic conflict resolution. It includes:

- Deep Merge logic
- Last-Write-Wins (LWW) based on timestamp
- Optional conflict window detection
- Array append semantics
- Deterministic ordering with tied timestamps
- Full unit and integration tests
- Runnable curl scripts for scenario simulations

---

## Architecture Overview

    Client devices (offline changes)
            |
            v
    +-------------------+
    |   Gateway API     |  <-- HTTP interface (port 3000)
    +-------------------+
            |
            v
    +-------------------+
    |  Aggregator API   |  <-- Merge engine (port 4000)
    +-------------------+
            |
            v
    Final State JSON (LWW + Deep Merge)

The Aggregator produces a deterministic final result from a baseline object and a set of timestamped patches.

---

## Merge Algorithm Rules

| Concern | Strategy |
|--------|----------|
| Timestamp conflicts | Last-write-wins based on client timestamp |
| Field-level changes | Deep merge JSON patches |
| Arrays | Append items rather than overwriting |
| Conflict detection | Log changes within a short time window |
| Deterministic ordering | timestamp → deviceId → originalIndex |

Example:  
Alice sets `"mood": "Happy"` at 600  
Bob sets `"mood": "Sad"` at 605  
Final mood = "Sad" and conflict is recorded

---

## Running the System Locally

Requirements:
- Node.js 18+
- Python3 (for pretty-printing JSON)

Install:

    npm install

Run Aggregator:

    cd services/aggregator
    npm start

Expected:
    Aggregator service listening on port 4000

Run Gateway:

    cd ../gateway
    npm start

Expected:
    Gateway service listening on port 3000

---

## Testing

Aggregator tests:

    cd services/aggregator
    npm test

Gateway tests:

    cd services/gateway
    npm test

---

## cURL Demo Scripts

Scripts are in:

    scripts/

Each script pretty-prints JSON using:

    python3 -m json.tool

Run examples from project root:

    ./scripts/curl_happy_path.sh
    ./scripts/curl_conflict_outside_window.sh
    ./scripts/curl_invalid_body.sh
    ./scripts/curl_nested_merge.sh
    ./scripts/curl_array_type_flip.sh
    ./scripts/curl_tied_timestamps.sh

What they cover:

| Script | Scenario |
|--------|----------|
| curl_happy_path.sh | Normal conflicting fields + appended notes |
| curl_conflict_outside_window.sh | No conflict if updates far apart |
| curl_invalid_body.sh | Input validation error |
| curl_nested_merge.sh | Deep merge with independent nested changes |
| curl_array_type_flip.sh | Scalar → array conversion + append semantics |
| curl_tied_timestamps.sh | Deterministic LWW ordering on ties |

---

## Deterministic Guarantees

- Same baseline + patches always → same final state
- No nested updates lost
- Arrays always append
- Conflict metadata always recorded for UX/auditing

---

## Future Enhancements

- Vector clocks for causal ordering
- Per-field CRDT behavior (grow-only sets, ordered lists)
- Offline replay timeline UI

---

## Summary

This solution demonstrates:

- Principal-level distributed backend architecture
- Deterministic conflict resolution algorithm
- Robust test coverage across services
- Easy reproducibility for interview demonstrations

---

flowchart TD
    Client[Offline Clients\n(e.g. Tablets)]
    Gateway[Gateway API\nPort 3000\nRequest Router]
    Aggregator[Aggregator Service\nPort 4000\nMerge + Conflict Resolution]
    Storage[(Final Merged State JSON)]

    Client -->|Sync patches| Gateway
    Gateway -->|Forward patches| Aggregator
    Aggregator -->|Deep Merge\nLWW\nConflict Logging| Storage
    Gateway -->|Return Final State| Client
