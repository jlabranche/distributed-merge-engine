#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"

echo "Edge case: invalid body (missing baseline/patches). Should get 400 error."
echo

curl -s -X POST http://localhost:3000/merge \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "foo": "bar"
  }' | python3 -m json.tool
