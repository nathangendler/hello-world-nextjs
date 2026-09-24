#!/usr/bin/env bash
# Run a SQL statement against the Supabase project using the CLI's saved login.
# Usage: scripts/sql.sh "select * from albums"
set -euo pipefail
PROJECT_REF="noqnzgbjxhhstredkoiy"
TOKEN=$(security find-generic-password -s "Supabase CLI" -w 2>/dev/null || true)
if [ -z "$TOKEN" ]; then
  echo "Not logged in. Run: supabase login" >&2
  exit 1
fi
BODY=$(node -e 'console.log(JSON.stringify({ query: process.argv[1] }))' "$1")
curl -s -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$BODY"
echo
