# Dependency license inventory (SYN-7)

**Generated:** 2026-07-15  
**Tooling:** `pnpm licenses list --json` against workspace lockfile  
**Scope:** root, `apps/backend`, `apps/frontend` (pnpm monorepo)

## Package metadata (before → after remediation)

| Package | Previous `license` field | Target |
|---------|--------------------------|--------|
| root `package.json` | `ISC` | `Apache-2.0` |
| `apps/backend/package.json` | `UNLICENSED` | `Apache-2.0` |
| `apps/frontend/package.json` | *(missing)* | `Apache-2.0` |

Application source is intended public under Apache-2.0 (SoftTeco Sp. z o.o.).
Package metadata must match `LICENSE` / `NOTICE`.

## Aggregate license counts (transitive, ~1270 package entries)

| License | Approx. count | Notes |
|---------|---------------|--------|
| MIT | ~1003 | Compatible |
| Apache-2.0 | ~131 | Compatible; include in NOTICE themes |
| ISC | ~63 | Compatible |
| BSD-2-Clause / BSD-3-Clause / BSD | ~50 | Compatible |
| BlueOak-1.0.0 | ~6 | Permissive |
| MPL-2.0 | ~2–3 | Weak copyleft — file-level; OK as dependency |
| LGPL-3.0-or-later | 1 | `@img/sharp-libvips-darwin-arm64` (optional platform binary via Next/sharp) |
| CC-BY-4.0 | 1 | `caniuse-lite` (data) |
| Python-2.0 | 1 | `argparse` (transitive) |
| Unknown | 1 | `pause@0.0.1` (tiny transitive; passport-related) |
| Unlicense / 0BSD / MIT-0 | few | Public domain–style |

No AGPL, SSPL, BUSL, or proprietary npm licenses were detected in the lockfile
inventory.

## Attention items

| Package | License | Assessment |
|---------|---------|------------|
| `@img/sharp-libvips-darwin-arm64` | LGPL-3.0-or-later | Platform optional dependency of image tooling; not modified; dynamic linking via sharp. Acceptable for app distribution with attribution awareness. |
| `lightningcss` / `lightningcss-darwin-arm64` | MPL-2.0 | Build/runtime CSS tooling; unmodified. |
| `caniuse-lite` | CC-BY-4.0 | Attribution via this inventory / NOTICE umbrella. |
| `pause@0.0.1` | Unknown | Negligible; monitor if it ever becomes a direct dependency. |
| `argparse` | Python-2.0 | Transitive CLI helper; compatible. |

## Direct production dependencies (high level)

### Root

- `@biomejs/biome`, `husky`, `lint-staged`, `turbo` — MIT / Apache-class tooling

### Backend (NestJS)

- NestJS ecosystem, TypeORM, Passport, BullMQ, Axios, Socket.IO, MQTT, AWS S3
  SDK, Argon2/bcrypt, Medplum core — predominantly MIT / Apache-2.0

### Frontend (Next.js)

- Next.js, React, Radix UI, Redux Toolkit, Mantine (dev), Medplum React, Monaco,
  XYFlow, Recharts, SWR, Zod — predominantly MIT / Apache-2.0

## Containers / infrastructure

Current tree does **not** vendor third-party container source. Historical Docker
Compose / K8s manifests referenced upstream images (Postgres, Redis, MinIO,
ThingsBoard, Medplum) — those images carry their own licenses and are not
relicensed by this repository.

## Attribution process

1. Keep `LICENSE` = Apache-2.0 and `NOTICE` copyright = SoftTeco Sp. z o.o.
2. On major dependency upgrades, re-run `pnpm licenses list` and update this file
   if new copyleft or unknown licenses appear.
3. Block merge of packages with AGPL/SSPL/Commons-Clause/proprietary licenses
   without legal review.
4. CE-derived code (if any) must also update `NOTICE` per
   `docs/legal/ce-derived-material-process.md`.

## CI expectation

- Package `license` fields must remain `Apache-2.0` for publishable packages.
- Optional future gate: license-checker fail on disallowed SPDX expressions.
