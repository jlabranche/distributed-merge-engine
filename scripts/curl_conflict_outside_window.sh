#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "Edge case: same field updated outside conflict window (no conflicts expected)."
echo

curl -s -X POST http://localhost:3000/merge \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "baseline": { "id": 2, "mood": "Neutral" },
    "patches": [
      { "timestamp": 0,        "deviceId": "alice", "patch": { "mood": "Happy" } },
      { "timestamp": 120000,   "deviceId": "bob",   "patch": { "mood": "Sad" } }
    ],
    "conflictWindowMs": 30000
  }' | python3 -m json.tool
