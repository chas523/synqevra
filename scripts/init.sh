#!/usr/bin/env bash
set -euo pipefail

# This is the single initialization script.
# It prepares the project for local development when running
# ThingsBoard (and optionally other services) in Docker.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

RULE_CHAIN="$ROOT_DIR/apps/backend/src/thingsboard/base_rule_chain.json"
NEXT_CONFIG="$ROOT_DIR/apps/frontend/next.config.ts"

echo "=== FPL ThingsBoard Init Script ==="
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
echo "Next steps:"
echo "  pnpm install"
echo "  # Start ThingsBoard/Medplum via your own Docker setup if needed"
echo "  pnpm dev:backend"
echo "  pnpm dev:frontend"
