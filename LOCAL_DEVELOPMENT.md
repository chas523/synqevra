# Local development guide (Synqevra)

**Issue:** SYN-76  
**Status date:** 2026-07-15  
**Security:** Do not use shared or historical credentials. Shared environments are **intentionally shut down**. This guide uses **placeholders only**.

This document describes what a clean clone can run **today**, what needs **local substitute services**, and what is **unavailable or broken** until follow-up work lands. Prefer native Synqevra steps over undocumented team knowledge.

Related:

- Product strategy / CE 4.3.1.3 context: [docs/synqevra/README.md](./docs/synqevra/README.md), [SYN-20](https://linear.app/softteco-fd/issue/SYN-20)
- CI baseline commands (coordinate with): [SYN-10](https://linear.app/softteco-fd/issue/SYN-10)
- Secret / provenance policy: [SECURITY.md](./SECURITY.md) (if present on your branch), [docs/security/](./docs/security/)

---

## 1. Prerequisites

| Tool | Supported / required | Notes |
|------|----------------------|--------|
| **Node.js** | `>= 20` (`package.json` `engines`) | Validated with Node **24.x** for install/frontend; Docker images pin **Node 20** |
| **pnpm** | `>= 9`; lockfile built with **pnpm@10.26.0** (`packageManager`) | Enable via Corepack: `corepack enable` |
| **Git** | any recent | Clone only; do not import historical secret material |
| **Docker** (optional) | recent Docker / OrbStack / Colima | Recommended for local Postgres/Redis/MinIO substitutes |
| **ThingsBoard CE 4.3.1.3** | external | Not shipped in this monorepo |
| **Medplum** | external | Not shipped in this monorepo |

Install pnpm via Corepack (recommended):

```bash
corepack enable
corepack prepare pnpm@10.26.0 --activate
node -v   # expect v20+
pnpm -v   # expect 10.x matching packageManager when possible
```

---

## 2. Repository layout (current monorepo)

```text
.
├── apps/backend     # NestJS API (default port 3003) + TB iframe proxy (port 3002)
├── apps/frontend    # Next.js 15 UI (default port 3000)
├── packages/        # shared packages placeholder
├── scripts/init.sh  # optional path patches for Docker hostnames (see caveats)
├── package.json     # workspace scripts (turbo)
└── pnpm-workspace.yaml
```

There is **no** `docker-compose.yml` in the current tree for a full stack. Historical K8s/Compose layouts were removed during monorepo cleanup and must **not** be restored from Git history for credentials.

---

## 3. Install dependencies

From a clean clone:

```bash
git clone <repository-url>
cd <repo-root>
pnpm install
```

If the lockfile is present, prefer:

```bash
pnpm install --frozen-lockfile
```

(`--frozen-lockfile` is the intended CI-style install; coordinate exact CI matrix with **SYN-10**.)

### Workspace commands (root)

| Command | Purpose | Verified 2026-07-15 |
|---------|---------|---------------------|
| `pnpm install` | Install monorepo deps | Yes |
| `pnpm dev:frontend` | Next.js dev server (port **3000**, hardcoded in package script) | Yes (UI boots; see smoke tests) |
| `pnpm dev:backend` | NestJS watch mode | **No — fails** (see [§8 gaps](#8-known-gaps-and-follow-ups)) |
| `pnpm dev` | Turbo runs both apps’ `dev` | Backend failure blocks a healthy full stack |
| `pnpm build:frontend` / `pnpm build:backend` | Production builds | Not fully green; backend import paths broken |
| `pnpm lint` | `biome check .` | Runs but currently reports **thousands** of diagnostics (not a clean gate) |
| `pnpm check-types` | Turbo typecheck | Backend fails (`tsconfig` / compile issues) |
| `pnpm clean` | Removes `node_modules`, `dist`, `.next`, `.turbo` under apps | Safe cleanup (does not touch Git) |

Frontend-only dev without turbo (useful if port 3000 is taken):

```bash
cd apps/frontend
pnpm exec next dev -p 3001 --turbo
```

---

## 4. Configuration (placeholders only)

### 4.1 Backend

```bash
cp apps/backend/.env.example apps/backend/.env
# edit apps/backend/.env — never commit this file
```

| Variable | Purpose | Safe example / placeholder | Required for |
|----------|---------|----------------------------|--------------|
| `NODE_ENV` | Runtime mode | `development` | Backend |
| `PORT` | Nest HTTP port | `3003` | Backend listen |
| `FRONTEND_BASE_URL` / `ORIGIN_URL` / `CORS_ORIGIN` | Browser origin | `http://localhost:3000` | CORS / links |
| `DB_URL` | Postgres connection URL | `postgresql://postgres:postgres@localhost:5434/fpl_api` | **Startup** (TypeORM) |
| `JWT_SECRET` | Access token signing | `change-me-jwt-secret` (use long random locally) | Auth |
| `REFRESH_JWT_SECRET` | Refresh token signing | `change-me-refresh-jwt-secret` | Auth |
| `JWT_EXPIRES_IN` / `REFRESH_JWT_EXPIRES_IN` | TTL seconds | `3600` / `604800` | Auth |
| `THINGSBOARD_API_URL` | TB CE HTTP base | `http://localhost:8088` | TB features |
| `THINGSBOARD_SYSADMIN_EMAIL` / `THINGSBOARD_SYSADMIN_PASSWORD` | TB sysadmin for server-side calls | placeholders only | TB admin APIs |
| `TB_URL` / `TB_SYSTEM_VALUE` | TB deep-links / system markers | see `.env.example` | Some Medplum/TB bridges |
| `MEDPLUM_URL` | Medplum base URL | `http://localhost:8103` | FHIR / Medplum |
| `REDIS_HOST` / `REDIS_PORT` | BullMQ Redis | `127.0.0.1` / `6379` | HL7/alarm queues |
| `BULLMQ_PASSWORD` | Redis password | empty for local open Redis, or a local-only value | BullMQ |
| `OUTBOX_DISPATCHER_ENABLED` | Outbox worker | `false` for minimal local | Alarms outbox |
| `ALARM_MQTT_INGEST_ENABLED` | MQTT alarm consumer | omit or `false` unless you run MQTT | Alarms |
| `ALARM_MQTT_BROKER_URL` / `ALARM_MQTT_TOPIC` | MQTT broker | `mqtt://localhost:1883` / default topic | Only if ingest enabled |
| `MINIO_*` | S3-compatible object storage | localhost:9000 placeholders | Asset uploads |
| `MAIL_*` / `APP_NAME` | Transactional mail | local MailHog/Mailpit or leave empty | Email flows |
| `GOOGLE_OAUTH_*` | Google OAuth | leave empty unless configuring OAuth | Google login |
| `DEFAULT_ADMIN_EMAIL` | Seed admin email | `admin@example.com` | Optional seed |
| `DEFAULT_ADMIN_PASSWORD` | Seed admin **bcrypt hash** (not plaintext) | generate locally; see below | Optional seed |

**Admin seed note:** `AdminInitService` stores `DEFAULT_ADMIN_PASSWORD` as already hashed. Generate a disposable hash:

```bash
node -e "require('bcrypt').hash('change-me-admin-password', 8).then(console.log)"
```

Put the **hash** in `.env`, not the plaintext, if you use the seed.

### 4.2 Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
# or apps/frontend/.env — both are gitignored patterns depending on tooling
```

| Variable | Purpose | Safe example |
|----------|---------|--------------|
| `NEXT_PUBLIC_PROXY_URL` | Browser → API prefix | `http://localhost:3003/api` |
| `NEXT_PUBLIC_FHIR_URL` | Browser → FHIR proxy | `http://localhost:3003/fhir` |
| `API_URL` | Server-side API base | `http://localhost:3003` |

Next.js rewrites (see `apps/frontend/next.config.ts`) also proxy:

| Browser path | Destination (local) |
|--------------|---------------------|
| `/api/*` | `http://localhost:3003/api/*` |
| `/fhir/*` | `http://localhost:3003/fhir/*` |
| `/tb-assets/*` | `http://localhost:8088/assets/*` (ThingsBoard CE) |
| `/public-assets/*` | `http://localhost:9000/public-assets/*` (MinIO) |

---

## 5. Local infrastructure matrix

Legend:

| Status | Meaning |
|--------|---------|
| **Verified now** | Confirmed during SYN-76 validation on a clean-ish workstation |
| **Local substitute** | Run yourself (Docker/native); not provided as a monorepo compose stack |
| **Unavailable / not validated** | Shared env off, or not exercised end-to-end in this issue |
| **Blocked** | Code or packaging prevents run until a fix lands |

| Dependency | Status | How to start locally (examples use fake passwords only) | App use |
|------------|--------|----------------------------------------------------------|---------|
| **Node apps (frontend)** | **Verified now** | `pnpm dev:frontend` or `pnpm exec next dev -p <port> --turbo` | UI |
| **Node apps (backend)** | **Blocked** | Would be `pnpm dev:backend` after import-path fix | API, TB proxy :3002 |
| **PostgreSQL** | **Local substitute** | e.g. `docker run --name synqevra-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fpl_api -p 5434:5432 -d postgres:16-alpine` | TypeORM app DB (`DB_URL`) |
| **TimescaleDB** | **Unavailable / not validated** | Not required by current code paths for basic Nest/TypeORM; future telemetry store per migration roadmap | Future CE replacement work |
| **Redis** | **Local substitute** | e.g. `docker run --name synqevra-redis -p 6379:6379 -d redis:7-alpine` | BullMQ (HL7, alarms) |
| **MQTT / EMQX** | **Unavailable / not validated** | Only if `ALARM_MQTT_INGEST_ENABLED=true`; default path leaves ingest **disabled** | Alarm ingest |
| **MinIO / S3** | **Local substitute (not validated E2E)** | Run MinIO on `:9000` with `MINIO_*` placeholders; create bucket `public-assets` | Asset URLs / uploads |
| **ThingsBoard CE 4.3.1.3** | **Unavailable / not validated** | Install CE yourself (Docker/native); point `THINGSBOARD_API_URL` at it. **No shared TB.** | Devices, dashboards iframe proxy, most product APIs |
| **Medplum / FHIR** | **Unavailable / not validated** | Install Medplum yourself; point `MEDPLUM_URL`. **No shared Medplum.** | Patients, practitioners, FHIR proxy |
| **SMTP** | **Local substitute (optional)** | MailHog/Mailpit on `localhost:1025` or leave unset | Invitation / mailer |
| **Shared K8s / cloud envs** | **Intentionally not required** | All shared environments are shut down — do not reconnect as part of onboarding | — |

### TypeORM SSL caveat

`apps/backend/src/config/db.config.ts` currently sets `ssl: true` unconditionally. Many local Postgres containers do **not** speak SSL. Even after import-path fixes, you may need a code change or SSL-enabled Postgres before the backend accepts `DB_URL`. Tracked as a gap below.

---

## 6. Recommended startup sequences

### 6.A Verified today — frontend only

Use this when you only need UI shell, static routes, or frontend work that mocks APIs.

```bash
pnpm install
cp apps/frontend/.env.example apps/frontend/.env.local
# ensure values point at http://localhost:3003 even if API is down

pnpm dev:frontend
# open http://localhost:3000
# public routes: / and /auth/login (middleware allows guests)
```

If port 3000 is already taken:

```bash
cd apps/frontend && pnpm exec next dev -p 3001 --turbo
```

**Expected signals**

- Terminal: `Next.js 15.x` Ready; `Local: http://localhost:3000` (or your port)
- HTTP: `GET /auth/login` → **200**
- HTTP: `GET /` → **200** (landing)
- Authenticated app routes redirect to `/auth/login` without a cookie

**Not expected without backend/TB:** successful login, device lists, dashboards data.

### 6.B Intended full local stack (not fully green — 2026-07-15)

When backend import paths and DB SSL are fixed, the intended sequence is:

```bash
# 1) local substitutes (fake credentials only)
docker run --name synqevra-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fpl_api -p 5434:5432 -d postgres:16-alpine
docker run --name synqevra-redis -p 6379:6379 -d redis:7-alpine
# optional: MinIO, Mailpit, TB CE, Medplum — your own installs

# 2) config
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
# set DB_URL=postgresql://postgres:postgres@localhost:5434/fpl_api
# set REDIS_HOST=127.0.0.1, empty BULLMQ_PASSWORD for open Redis
# set JWT secrets to long local-only random strings
# set OUTBOX_DISPATCHER_ENABLED=false and leave ALARM_MQTT_INGEST_ENABLED unset/false

# 3) apps
pnpm install
pnpm dev:backend    # expect :3003 API + :3002 TB proxy process
pnpm dev:frontend   # expect :3000
```

**Intended smoke checks (after backend boots)**

| Check | Expect |
|-------|--------|
| Log: `Server running on port 3003` | Nest main process up |
| Log: `ThingsBoard Proxy Server running on port 3002` | TB iframe proxy up (still needs TB for useful HTML) |
| `GET http://localhost:3003/swagger` | Swagger UI **200** |
| `GET http://localhost:3003/fhir/hello` | Body `Hello World!` (**200**) — controller under `/fhir`, not `/api/fhir` |
| `GET http://localhost:3000/auth/login` | Frontend **200** |
| Login / TB device APIs | Need live TB CE + valid local credentials — **not validated** here |

**Validation result (SYN-76):** `pnpm dev:backend` / `nest start` failed before listen with TypeScript module errors (`persistence` vs `persistance` path mismatches). Running existing `dist/main.js` also failed with `Cannot find module './infrastructure/persistence/medplum.entity'`. Full API smoke is therefore **documented but not currently executable**.

### 6.C `scripts/init.sh` caveat

`scripts/init.sh` rewrites paths inside:

- `apps/backend/src/thingsboard/base_rule_chain.json`
- `apps/frontend/next.config.ts`

for Docker vs localhost. It **mutates tracked source**. Prefer reviewing diffs before commit; do not run it as a silent step on a clean clone unless you understand the patches. It does **not** start containers by itself.

---

## 7. Safe cleanup / reset

These commands do **not** delete Git history or source.

```bash
# stop dev servers (Ctrl+C in terminals), then:

# workspace build artifacts + deps
pnpm clean

# optional: remove only frontend/backend build caches
rm -rf apps/frontend/.next apps/backend/dist .turbo

# optional: remove local env files you created (never commit them)
rm -f apps/backend/.env apps/frontend/.env apps/frontend/.env.local

# optional: stop disposable Docker substitutes
docker rm -f synqevra-pg synqevra-redis 2>/dev/null || true
```

Do **not**:

- run history rewrites or force-push as part of local onboarding
- restore deleted K8s secret manifests from Git history
- point `.env` at production or former shared environments

---

## 8. Known gaps and follow-ups

Documented from validation, not guessed behaviour. Open or link engineering issues rather than papering over failures.

| ID | Gap | Impact | Suggested follow-up |
|----|-----|--------|---------------------|
| G1 | Mixed folder spelling `persistance` vs imports of `persistence` (e.g. Medplum, Connection, IAM vs Thingsboard) | **Backend cannot compile/start** | Bugfix: normalize persistence paths |
| G2 | `db.config.ts` hardcodes `ssl: true` | Local Postgres without SSL will fail connect | Bugfix: make SSL env-driven |
| G3 | No root `docker-compose` for Postgres/Redis/MinIO/TB/Medplum | Every developer invents substitutes | Feature/docs+devops: optional compose profiles |
| G4 | `apps/frontend/Dockerfile` still references `apps/front` | Image build path broken | Bugfix: align Dockerfile with `apps/frontend` |
| G5 | `pnpm lint` reports thousands of Biome diagnostics | Not a useful local/CI green gate yet | **SYN-10** lint baseline |
| G6 | `pnpm check-types` fails (backend `ignoreDeprecations` / TS) | Typecheck not CI-ready | **SYN-10** |
| G7 | ThingsBoard CE + Medplum not packaged; shared envs off | Full product flows unavailable out of the box | Docs/runbooks per component; no shared env revival in this issue |
| G8 | MQTT/MinIO/mail E2E not validated | Alarm ingest, assets, mail may fail silently or at runtime | Per-feature validation issues |
| G9 | `DEFAULT_ADMIN_PASSWORD` requires bcrypt hash | Easy misconfiguration | DX improvement: hash on seed or document generator (this guide) |
| G10 | `scripts/init.sh` mutates source | Dirty working tree risk | Make init non-destructive or use env-based config |

---

## 9. Security rules (local dev)

1. Copy only from `*.env.example`. Never commit `.env` / `.env.local`.
2. Use explicit fake placeholders (`change-me-…`, `admin@example.com`, local hostnames).
3. Do not paste credentials into Linear, PRs, or docs.
4. Do not reconnect to shut-down shared environments for onboarding.
5. Treat anything found in Git history as potentially compromised (see security audit / SYN-8 if present); rotation is separate from this guide.

---

## 10. Quick reference — ports

| Port | Process | Verified |
|------|---------|----------|
| 3000 | Next.js frontend (`pnpm dev:frontend`) | Yes (when free) |
| 3001 | Alternate Next port (manual) | Yes |
| 3002 | ThingsBoard iframe proxy (backend `main.ts`) | Not reached (backend blocked) |
| 3003 | Nest API + Swagger `/swagger` | Not reached (backend blocked) |
| 5432/5434 | Postgres substitute | Container start verified |
| 6379 | Redis substitute | Container start verified |
| 8088 | ThingsBoard CE (external) | Not validated |
| 8103 | Medplum (external) | Not validated |
| 9000 | MinIO (external) | Not validated |
| 1883 | MQTT (external) | Not validated |

---

## 11. Acceptance mapping (SYN-76)

| Criterion | How this guide meets it |
|-----------|-------------------------|
| Clean clone can follow the guide | Install + frontend path documented without tribal knowledge |
| Distinguishes verified vs unavailable | Status matrix §5 + validation notes §6 |
| Safe placeholders for config | §4 tables; sanitized `.env.example` files |
| Start verified subset + smoke checks | Frontend §6.A; backend recorded as blocked with reasons |
| README links here | Root [README.md](./README.md) |
| No secrets in Git | Placeholders only; no shared URLs with credentials |
