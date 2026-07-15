# Synqevra

**Synqevra** is an IoT platform developed by **SoftTeco Sp. z o.o.** It provides a custom NestJS backend and Next.js frontend that integrate with headless **ThingsBoard Community Edition** and **Medplum (FHIR)**, with a long-term goal of replacing ThingsBoard as the core.

> Strategy and migration context: [docs/synqevra/README.md](./docs/synqevra/README.md)

## Local development

**Start here for a clean clone:**

### [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)

That guide covers:

- Supported **Node.js** / **pnpm** versions and install steps  
- Environment files (placeholders only — no shared credentials)  
- What runs locally **now** vs what needs Docker/local substitutes vs what is unavailable  
- Smoke checks and safe cleanup  

**Important:** Shared deployment environments are shut down. Do not restore historical secrets from Git history. Full product flows require your own local ThingsBoard CE / Medplum instances after the backend bootstrap issues noted in the local guide are resolved.

### Quick start (frontend only — currently verified)

```bash
corepack enable
corepack prepare pnpm@10.26.0 --activate
pnpm install
cp apps/frontend/.env.example apps/frontend/.env.local
pnpm dev:frontend
# http://localhost:3000  →  /auth/login should return HTTP 200
```

Backend (`pnpm dev:backend`) is **not** currently startable on `main` due to known import-path issues — see the local development guide.

## Monorepo layout

| Path | Description |
|------|-------------|
| `apps/backend` | NestJS API (port 3003) and ThingsBoard iframe proxy (port 3002) |
| `apps/frontend` | Next.js 15 UI (port 3000) |
| `packages/` | Shared packages (placeholder) |
| `docs/synqevra/` | Product and migration documentation |
| `scripts/init.sh` | Optional Docker hostname patches (mutates source — read before use) |

## Common commands

```bash
pnpm install              # install workspace dependencies
pnpm dev:frontend         # frontend only
pnpm dev:backend          # backend only (blocked until G1 fix — see LOCAL_DEVELOPMENT.md)
pnpm dev                  # turbo: both (requires backend healthy)
pnpm lint                 # biome check (currently noisy — see SYN-10)
pnpm check-types          # typecheck via turbo
pnpm build                # production builds
pnpm clean                # remove node_modules/dist/.next/.turbo (keeps Git history)
```

## Documentation index

| Doc | Description |
|-----|-------------|
| [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) | Reproducible local startup (SYN-76) |
| [docs/synqevra/README.md](./docs/synqevra/README.md) | Product overview |
| [docs/synqevra/migration-roadmap.md](./docs/synqevra/migration-roadmap.md) | Migration phases |
| [docs/synqevra/linear-project-brief.md](./docs/synqevra/linear-project-brief.md) | Linear project brief |
| [apps/frontend/README.md](./apps/frontend/README.md) | Frontend architecture notes |

## Security

- Never commit `.env` files, private keys, or Kubernetes Secret manifests with real values.  
- Use only placeholders from `*.env.example`.  
- Report vulnerabilities per team process (see `SECURITY.md` when present on your branch).

## License

Application licensing for public release is tracked under the Synqevra legal/security workstream (Apache-2.0 intended). Check repository root `LICENSE` / `NOTICE` when those files are present on your branch.
