#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist/client dist/server
find dist -mindepth 1 -maxdepth 1 ! -name client ! -name server ! -name .openai -exec cp -R {} dist/client/ \;
cp worker/index.js worker/reasoning.js dist/server/
cat > dist/server/wrangler.json <<'JSON'
{
  "main": "index.js",
  "compatibility_date": "2026-05-15",
  "assets": { "directory": "../client", "binding": "ASSETS" },
  "d1_databases": [{
    "binding": "DB",
    "database_name": "javalingo-squad",
    "database_id": "00000000-0000-4000-8000-000000000000"
  }]
}
JSON
