#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "Edge case: tied timestamps. Deterministic order comes from deviceId + original index."
echo

curl -s -X POST http://localhost:3000/merge \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "baseline": { "id": 5, "mood": "Neutral" },
    "patches": [
      {
        "timestamp": 700,
        "deviceId": "device-a",
        "patch": { "mood": "Happy" }
      },
      {
        "timestamp": 700,
        "deviceId": "device-b",
        "patch": { "mood": "Sad" }
      }
    ]
  }' | python3 -m json.tool
