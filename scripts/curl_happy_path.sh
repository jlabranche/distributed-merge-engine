#!/usr/bin/env bash
set -euo pipefail # -e Exit on error # -u Treat unset variables as errors # -o pipefail Fail on pipeline errors
source "$(dirname "$0")/env.sh"

echo "Happy path: conflicting mood, appending notes, conflict window default (60s)."
echo

curl -s -X POST http://localhost:3000/merge \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "baseline": { "id": 1, "mood": "Neutral", "notes": [] },
    "patches": [
      { "timestamp": 600, "deviceId": "alice", "patch": { "mood": "Happy" } },
      { "timestamp": 605, "deviceId": "bob",   "patch": { "mood": "Sad" } },
      { "timestamp": 602, "deviceId": "alice", "patch": { "notes": ["Great session"] } },
      { "timestamp": 606, "deviceId": "bob",   "patch": { "notes": ["Client seemed tired"] } }
    ]
  }' | python3 -m json.tool
