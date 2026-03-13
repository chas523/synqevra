#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RULE_CHAIN="$ROOT_DIR/apps/api/src/thingsboard/base_rule_chain.json"
NEXT_CONFIG="$ROOT_DIR/apps/front/next.config.ts"

# ─── 0. Docker health check ──────────────────────────────────────────────────
echo "[0/3] Checking if Docker is running ..."
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi
echo "Docker is running."


# ─── 1. base_rule_chain.json: api → localhost ───────────────────────────────
echo "[1/3] Patching $RULE_CHAIN ..."
sed -i 's|http://api:3003/api/proxy/telemetry|http://localhost:3003/api/proxy/telemetry|g' "$RULE_CHAIN"
echo "Done."

# ─── 2. next.config.ts: Docker/K8s DNS → localhost ──────────────────────────
echo "[2/3] Patching $NEXT_CONFIG ..."
sed -i \
  -e 's|http://api:3003/api/:path\*|http://localhost:3003/api/:path*|g' \
  -e 's|http://api:3003/fhir/:path\*|http://localhost:3003/fhir/:path*|g' \
  -e 's|http://thingsboard:8080/assets/:path\*|http://localhost:8088/assets/:path*|g' \
  -e 's|http://minio:9000/public-assets/:path\*|http://localhost:9000/public-assets/:path*|g' \
  "$NEXT_CONFIG"
echo "Done."

# ─── 3. Docker Compose – ThingsBoard install ─────────────────────────────────
echo "[3/3] Running ThingsBoard CE install (INSTALL_TB=true, LOAD_DEMO=true) ..."
echo "Note: If you're running this for the second time it will throw error, but you can safely ignore it"
cd "$ROOT_DIR/backend"
docker compose run --rm \
  -e INSTALL_TB=true \
  -e LOAD_DEMO=true \
  thingsboard-ce

echo ""
echo "init.sh completed successfully."
