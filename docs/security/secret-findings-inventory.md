# Secret findings inventory (SYN-7)

**Policy:** Every finding is treated as **potentially real** (owner cannot confirm
all historical values were examples). Secret **values are not recorded** here,
in Linear, PRs, or chat. Record only type, location, service, owner, and status.

**Rotation:** [SYN-8](https://linear.app/softteco-fd/issue/SYN-8/revoke-and-rotate-credentials-potentially-exposed-in-git-history)

**Scan tooling:** Gitleaks 8.30.1 (full history + working tree), 2026-07-15  
**Raw scan artifacts:** kept out of git; redacted summaries only in this repo.

## Severity legend

| Level | Meaning |
|-------|---------|
| **Critical** | Live-shaped credentials in Git history (K8s secrets, private keys, DB/JWT/mail passwords) |
| **High** | Historical `.env` / token material that may have been used |
| **Medium** | Test fixtures / example JSON containing JWT-shaped tokens |
| **Low / FP** | Build artifacts, type names, dashboard base64, docs |

Remediation rule: **revoke or rotate first**, then investigate whether the old
value was ever active. History rewrite alone is **not** remediation.

---

## Critical — Git history (must rotate via SYN-8)

| ID | Type | Affected service / env | Discovery location | Status |
|----|------|------------------------|--------------------|--------|
| S-01 | Kubernetes Secret manifest (multi-key) | TB Postgres, Medplum DB/Redis, Medplum signing key, TB sysadmin, JWT/refresh JWT, mail, app DB URL, BullMQ, MinIO | `k8s/01-secrets.yaml` (added ~2025-12-23; deleted in monorepo cleanup 2026-07-14; still in history) | Open → SYN-8 |
| S-02 | PEM / private-key shaped material | Medplum signing | `k8s/01-secrets.yaml` (same history) | Open → SYN-8 |
| S-03 | Kubernetes Secret YAML | Medplum Postgres + Redis passwords | `backend/kubernetes/medplum/medplum-postgres-secret.yaml` | Open → SYN-8 |
| S-04 | Kubernetes Secret YAML | ThingsBoard Postgres password | `backend/kubernetes/thingsboard/tb-postgres-secret.yaml` | Open → SYN-8 |
| S-05 | Private-key shaped config | Medplum signing key in ConfigMap | `backend/kubernetes/medplum/medplum-configmap.yaml` | Open → SYN-8 |
| S-06 | Application `.env` credentials | Backend DB / gateway access token | Historical `backend/.env`, `backend/gateway/.env`, `gateway/.env` | Open → SYN-8 |
| S-07 | Application `.env` / compose | Frontend, proxy, docker-compose credential fields | Historical `app/.env`, `frontend/.env`, `*/docker-compose.yml` | Open → SYN-8 |
| S-08 | JWT signing / system data | ThingsBoard-related SQL seed | Historical `test/system-data.sql`, `test/system-data-original.sql` | Open → SYN-8 |
| S-09 | GCP API key shaped values | Mobile Firebase | Historical `mobile_app/android/app/google-services.json`, `mobile_app/lib/firebase_options.dart` | Open → SYN-8 (if project still exists) |

### Key names observed in critical K8s secret (values omitted)

From historical `k8s/01-secrets.yaml` (names only):

`TB_DB_PASSWORD`, `TB_DB_NAME`, `MEDPLUM_DB_USER`, `MEDPLUM_DB_PASSWORD`,
`MEDPLUM_DB_NAME`, `MEDPLUM_REDIS_PASSWORD`, `MEDPLUM_SIGNING_KEY`,
`MEDPLUM_SIGNING_KEY_PASSPHRASE`, `MEDPLUM_ADMIN_CLIENT_ID`,
`THINGSBOARD_SYSADMIN_EMAIL`, `THINGSBOARD_SYSADMIN_PASSWORD`, `CORS_ORIGIN`,
`JWT_SECRET`, `REFRESH_JWT_SECRET`, `MAIL_USER`, `MAIL_PASSWORD`, `DB_URL`,
`BULLMQ_PASSWORD`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`

---

## High — historical client / service tokens

| ID | Type | Location | Status |
|----|------|----------|--------|
| S-10 | Gateway access token env | Historical `gateway/.env`, `backend/gateway/.env` | Open → SYN-8 |
| S-11 | Medplum / TB client IDs and URLs in env | Historical `frontend-new/*/.env` | Open → SYN-8 (rotate client secrets if any paired secrets exist outside repo) |
| S-12 | Device / script access tokens | Historical `scripts/coap.sh`, `scripts/http.sh`, `scripts/mqtt.sh` | Open → SYN-8 |

---

## Medium — tracked fixtures (current tree remediation)

| ID | Type | Location | Status |
|----|------|----------|--------|
| S-13 | JWT-shaped tokens in test fixture | `apps/backend/test/example.json` (and historical `proxy/test/example.json`) | **Remediated in current tree** — replaced with synthetic placeholders (this PR) |
| S-14 | Placeholder / weak values in `.env.example` | `apps/backend/.env.example` (`DEFAULT_ADMIN_PASSWORD` bcrypt hash, sample secrets) | **Remediated** — placeholders only |

---

## Low / false positive

| ID | Type | Location | Notes |
|----|------|----------|-------|
| S-15 | generic-api-key on type name | `Lwm2mInstanceAttributesDialog.tsx` | Type alias `Lwm2mAttributeKey` — allowlisted |
| S-16 | generic-api-key on dashboard JSON | `hospital_room_monitoring.json` | Embedded SVG/base64 UI assets — allowlisted |
| S-17 | Next.js build artifacts | `.next/**` | Generated; gitignored; not credentials |
| S-18 | Local untracked `.env` | `apps/backend/.env` | Present on developer machines; gitignored — do not commit |

---

## Current-tree status (after this PR)

| Check | Result |
|-------|--------|
| Tracked secret manifests in HEAD | None (`k8s/`, historical `backend/kubernetes/*-secret.yaml` deleted) |
| Tracked `.env` files | Only `*.env.example` |
| Gitleaks on source (with `.gitleaks.toml`) | Should pass after fixture/example sanitization |
| Git history still contains secrets | **Yes** — history rewrite is a separate public-release gate |
| Environments active (owner confirmation 2026-07-14) | **No active environments** — still rotate if credentials could be reused later |

---

## Preventive controls (this PR)

1. Root `.gitignore` expanded for secret patterns  
2. `.gitleaks.toml` + husky pre-commit gitleaks  
3. Bitbucket pipeline secret-scan step on PRs / main  
4. `SECURITY.md` reporting path  
5. Documentation forbidding secret values in issues/PRs  

## Explicit non-remediation

- **No** `git filter-repo` / BFG history rewrite in this issue (coordinate with
  public-release readiness; requires force-push and clone invalidation).
- **No** secret values copied into Linear or this inventory.
