# SYN-7 Audit Report — Repository provenance, licenses, and exposed secrets

| Field | Value |
|-------|--------|
| Issue | [SYN-7](https://linear.app/softteco-fd/issue/SYN-7/security-audit-repository-provenance-licenses-and-exposed) |
| Date | 2026-07-15 |
| Auditor | Agent-assisted audit for SoftTeco Sp. z o.o. |
| Branch | `sergeygojshik81/syn-7-security-audit-repository-provenance-licenses-and-exposed` |
| Copyright holder (confirmed) | **SoftTeco Sp. z o.o.** |
| Intended public license | Apache License 2.0 |

## Executive summary

1. **Ownership:** Git history authorship is overwhelmingly SoftTeco engineers.
   Current application code is a custom NestJS + Next.js stack that **integrates
   with** ThingsBoard via HTTP/WebSocket APIs; it is not a vendored ThingsBoard
   source tree.
2. **ThingsBoard PE:** No Professional Edition source, decompilation artifacts,
   or PE license headers were found in the current tree or path inventory.
3. **ThingsBoard CE:** No full CE source tree is vendored. JSON rule-chain and
   dashboard exports are classified as **CE configuration/data**. Future CE
   reuse must follow `docs/legal/ce-derived-material-process.md`.
4. **Secrets:** Critical credential material remains reachable in **Git history**
   (notably deleted `k8s/01-secrets.yaml`). Values are treated as compromised
   and must be rotated under **SYN-8**. Values are **not** reproduced in this
   report.
5. **Licenses:** Transitive dependencies are predominantly MIT/Apache/BSD.
   Package metadata mismatches (`ISC`, `UNLICENSED`, missing) are corrected to
   Apache-2.0. `LICENSE` + `NOTICE` added.
6. **Public-release gate:** History rewrite + SYN-8 completion remain required
   before claiming a clean public history.

---

## 1. Scope and method

### In scope

- Current monorepo tree (`apps/backend`, `apps/frontend`, docs, scripts, CI)
- Complete Git history (357 commits at audit time)
- Dependency licenses via `pnpm licenses list`
- Secret scanning via Gitleaks 8.30.1 (workdir + `--all` history)
- Classification of ThingsBoard-related material

### Out of scope / deferred

- Live credential rotation (SYN-8)
- Git history rewrite / force-push (public-release task)
- Legal sign-off on Apache-2.0 application (SYN-9), beyond prepared artifacts

### Tools

| Tool | Use |
|------|-----|
| `gitleaks detect` | Secrets in tree and history |
| `git log` / `git show` | History, authors, deleted paths (key names only) |
| `pnpm licenses list` | Dependency SPDX inventory |
| `rg` / filesystem inventory | PE markers, copyright, structure |

---

## 2. Repository inventory (current tree)

| Area | Role | Approx. source files |
|------|------|----------------------|
| `apps/backend` | NestJS API, TB adapter, Medplum, auth, HL7, IAM | ~370+ TS under `src/thingsboard` alone; full backend ~700+ TS |
| `apps/frontend` | Next.js UI, TB client services, Medplum UI | ~400+ TSX/TS |
| `docs/synqevra` | Product / migration docs | few MD |
| Root | pnpm workspace, Turbo, Biome, Bitbucket pipeline | config |
| `packages/` | Placeholder | README only |

**Not present in current HEAD:** historical `k8s/`, `mobile_app/`, `backend/`
(legacy), `proxy/`, `frontend-new/`, `mllp-server/` — removed in monorepo cleanup
commit `5222bcf` but still in history.

### Generated / vendored

| Kind | Location | Classification |
|------|----------|----------------|
| `node_modules` | local installs | Third-party; not committed |
| `dist/`, `.next/` | build outputs | Generated; gitignored |
| shadcn-style UI primitives | `apps/frontend/components/ui/*` | Common MIT UI pattern (Radix + CVA); original project wiring |

---

## 3. Provenance and ownership evidence

### 3.1 Authorship (Git)

Top authors by commit count (all history):

| Author | Domain | Approx. commits |
|--------|--------|-----------------|
| Jakub / Jakub Jajkowicz | softteco.com | ~189 |
| Michal Sternik / variants | softteco.com / personal | ~100+ |
| Norayr Baghdasarov | softteco.com | ~14 |
| Sergey | gmail (current maintainer activity) | ~5 |
| Ivan Shevchik | softteco.com | 1 |

**Conclusion:** Development is SoftTeco-staff authored. No external “dump of
ThingsBoard source” commit series was identified.

### 3.2 Architecture vs ThingsBoard source

The backend ThingsBoard module is an **API adapter**:

- `thingsboard.api.adapter.ts` uses Nest `HttpService` against
  `THINGSBOARD_API_URL` REST paths.
- CQRS handlers map application use-cases to TB endpoints.
- Frontend `lib/services/thingsboardServices/*` calls the backend proxy.

This is consistent with **original integration code**, not a Java/Scala CE/PE
codebase import (no `.java`/`.scala` application sources in current tree).

### 3.3 Classification of ThingsBoard-related material

| Material | Classification | License / notes |
|----------|----------------|-----------------|
| `apps/backend/src/thingsboard/**/*.ts` | **Original Synqevra / SoftTeco** | Apache-2.0 (intended) |
| `apps/frontend/**/thingsboard*` services & hooks | **Original SoftTeco** | Apache-2.0 (intended) |
| `base_rule_chain.json`, `telemetry_emulator_nobase.json` | **CE configuration/data** | Exported rule-chain JSON; not PE source |
| `hospital_room_monitoring.json` | **CE configuration/data** | Dashboard export with system widget FQNs (`system.cards.*`) |
| Runtime ThingsBoard CE 4.3.1.3 (external) | External dependency | Apache-2.0; not in this repo |
| ThingsBoard PE | **Not present** | Prohibited |

### 3.4 PE / restricted code search

Searches for Professional Edition source markers, PE paths, and customer NDA
source trees in the current tree returned **no PE source incorporation**.

**Residual risk:** API surface knowledge may overlap CE docs; that is not PE
source. Reviewers must still block any future PE paste.

### 3.5 CE-derived provenance status

| Item | Exact CE version/commit recorded? | Action |
|------|-----------------------------------|--------|
| Adapter TS | N/A (original) | None |
| Rule chain / dashboard JSON | **Not pinned** to CE git SHA | Accept as config/data; if CE source is later copied, use provenance process |

A formal process and template live in `docs/legal/`.

---

## 4. Secrets and sensitive history

See detailed inventory: [`secret-findings-inventory.md`](./secret-findings-inventory.md)

### Highlights

- **Critical:** Historical `k8s/01-secrets.yaml` contained multi-service
  credential material (DB, JWT, mail, MinIO, Medplum signing, TB sysadmin).
  Deleted from HEAD but reachable in Git history.
- **Owner decision:** Treat all historical secrets as potentially real; rotate
  via SYN-8; do not publish values.
- **Owner confirmation (2026-07-14):** No environments currently active — still
  rotate before any reuse or public release.
- **Current tree:** Local `apps/backend/.env` may exist on developer machines
  (gitignored). Tracked fixtures sanitized. Examples use placeholders.

### Acceptance mapping

| Criterion | Status |
|-----------|--------|
| Every secret finding classified | **Done** (inventory) |
| Remediated | Partial — current tree + controls; **rotation = SYN-8**; **history rewrite = later** |

---

## 5. Dependencies and licensing

See [`dependency-licenses.md`](./dependency-licenses.md)

- No AGPL/SSPL/proprietary npm packages detected.
- Attention: LGPL platform binary (`sharp-libvips`), MPL lightningcss, CC-BY
  caniuse-lite — acceptable with NOTICE awareness.
- Package `license` fields aligned to Apache-2.0.
- `LICENSE` + `NOTICE` added for SoftTeco Sp. z o.o.

---

## 6. Public-release artifacts checklist

| Artifact | Status |
|----------|--------|
| `LICENSE` (Apache-2.0) | Added |
| `NOTICE` | Added |
| `SECURITY.md` | Added |
| SPDX / package metadata | Root + apps → Apache-2.0 |
| CE provenance process | `docs/legal/ce-derived-material-process.md` |
| Secret scanning config | `.gitleaks.toml` |
| Pre-commit gitleaks | `.husky/pre-commit` |
| CI gitleaks step | `bitbucket-pipelines.yml` (current tree `--no-git` until history rewrite) |
| Attribution process | Documented in NOTICE + dependency-licenses |

---

## 7. Preventive controls

1. **Gitleaks** on pre-commit and Bitbucket pipeline  
2. **.gitignore** secret patterns at repo root  
3. **No secret values** in issues/docs policy (SECURITY.md + inventory)  
4. **CE import process** required for future CE material  
5. **License field consistency** on application packages  

---

## 8. Remaining open items (not blocking audit document)

| Item | Owner | Related |
|------|-------|---------|
| Rotate all historical credentials | Ops / project owner | SYN-8 |
| History rewrite before public claim | Release engineer | Public release |
| Legal final review of Apache-2.0 application | Legal | SYN-9 |
| Optional pin CE JSON exports to TB CE tag | Engineering | Provenance process |
| Confirm security@ email routing | SoftTeco | SECURITY.md |

---

## 9. Acceptance criteria traceability

| Acceptance criterion | Evidence |
|----------------------|----------|
| Provenance report covers tree + full history | This document §§2–3 |
| Custom code ownership supported by evidence | §3.1–3.2 SoftTeco authors + adapter architecture |
| Every reused CE component has versioned provenance | JSON config classified; no CE source tree; process for future imports |
| No TB PE / customer / NDA code remains | §3.4–3.5 |
| Dependency licenses reviewed | §5 + dependency-licenses.md |
| Every secret finding classified and remediated | Inventory; rotation → SYN-8; tree sanitized |
| LICENSE, NOTICE, package metadata consistent | §6 |
| CI prevents unreviewed licensing/provenance regressions | Gitleaks CI + documented CE process (license CI can be extended) |
| Audit result linked from SYN-7 | Attach/link this path on the Linear issue |

---

## 10. Conclusion

The repository is **suitable to continue open-source preparation** under
Apache-2.0 with SoftTeco Sp. z o.o. as copyright holder, provided:

1. SYN-8 completes credential rotation for historical exposures  
2. History is rewritten or the public release uses a clean export after rotation  
3. Future CE reuse follows the documented provenance process  
4. SYN-9 completes remaining legal metadata application as needed  

**Audit classification:** Pass with open operational follow-ups (SYN-8, history
hygiene), not a PE contamination finding.
