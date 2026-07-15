#!/usr/bin/env bash
set -euo pipefail

# This is the single initialization script.
# It prepares the project for local development when running
# ThingsBoard (and optionally other services) in Docker.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

RULE_CHAIN="$ROOT_DIR/apps/backend/src/thingsboard/base_rule_chain.json"
NEXT_CONFIG="$ROOT_DIR/apps/frontend/next.config.ts"

echo "=== Synqevra / monorepo init script ==="
echo "WARNING: This script mutates tracked source files (rule chain JSON + next.config.ts)."
echo "Prefer LOCAL_DEVELOPMENT.md for day-to-day setup. Review git diff before committing."
echo ""

# ─── Docker check ────────────────────────────────────────────────────────────
echo "[1/3] Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi
echo "Docker is running."

# ─── Patch rule chain (inside Docker → call host API) ────────────────────────
echo "[2/3] Patching rule chain for Docker networking..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS (BSD sed)
  sed -i '' 's|http://api:3003/api/proxy/telemetry|http://host.docker.internal:3003/api/proxy/telemetry|g' "$RULE_CHAIN"
else
  # Linux (GNU sed)
  sed -i 's|http://api:3003/api/proxy/telemetry|http://host.docker.internal:3003/api/proxy/telemetry|g' "$RULE_CHAIN"
fi
echo "Done: $RULE_CHAIN"

# ─── Patch Next.js config (Docker hostnames → localhost for local dev) ───────
echo "[3/3] Patching next.config.ts for local development..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' \
    -e 's|http://api:3003/api/:path\*|http://localhost:3003/api/:path*|g' \
    -e 's|http://api:3003/fhir/:path\*|http://localhost:3003/fhir/:path*|g' \
    -e 's|http://thingsboard:8080/assets/:path\*|http://localhost:8088/assets/:path*|g' \
    -e 's|http://minio:9000/public-assets/:path\*|http://localhost:9000/public-assets/:path*|g' \
    "$NEXT_CONFIG"
else
  sed -i \
    -e 's|http://api:3003/api/:path\*|http://localhost:3003/api/:path*|g' \
    -e 's|http://api:3003/fhir/:path\*|http://localhost:3003/fhir/:path*|g' \
    -e 's|http://thingsboard:8080/assets/:path\*|http://localhost:8088/assets/:path*|g' \
    -e 's|http://minio:9000/public-assets/:path\*|http://localhost:9000/public-assets/:path*|g' \
    "$NEXT_CONFIG"
fi
echo "Done: $NEXT_CONFIG"

echo ""
echo "Init completed successfully."
echo ""
echo "Next steps (see LOCAL_DEVELOPMENT.md):"
echo "  pnpm install"
echo "  cp apps/backend/.env.example apps/backend/.env"
echo "  cp apps/frontend/.env.example apps/frontend/.env.local"
echo "  # Start your own Postgres/Redis/TB CE/Medplum substitutes if needed"
echo "  # pnpm dev:backend  # currently blocked by import-path gaps — see LOCAL_DEVELOPMENT.md"
echo "  pnpm dev:frontend"
