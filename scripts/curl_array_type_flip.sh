#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "Edge case: baseline has notes as a string, patches convert it to an array and append."
echo

curl -s -X POST http://localhost:3000/merge \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "baseline": {
      "id": 4,
      "notes": "Initial text note"
    },
    "patches": [
      {
        "timestamp": 600,
        "deviceId": "alice",
        "patch": {
          "notes": ["Converted to array"]
        }
      },
      {
        "timestamp": 605,
        "deviceId": "bob",
        "patch": {
          "notes": ["Second entry"]
        }
      }
    ]
  }' | python3 -m json.tool
