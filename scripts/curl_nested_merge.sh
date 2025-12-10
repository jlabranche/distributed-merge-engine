#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "Edge case: nested deep merge where different devices update different nested fields."
echo

curl -s -X POST http://localhost:3000/merge \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "baseline": {
      "id": 3,
      "profile": {
        "details": {
          "mood": "Neutral",
          "energy": "Medium",
          "appetite": "Normal"
        }
      }
    },
    "patches": [
      {
        "timestamp": 600,
        "deviceId": "alice",
        "patch": {
          "profile": {
            "details": {
              "mood": "Happy",
              "energy": "High"
            }
          }
        }
      },
      {
        "timestamp": 605,
        "deviceId": "bob",
        "patch": {
          "profile": {
            "details": {
              "appetite": "Low"
            }
          }
        }
      }
    ]
  }' | python3 -m json.tool
