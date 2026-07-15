# ThingsBoard CE-derived material review process

**Owner:** SoftTeco Sp. z o.o.  
**Related:** SYN-7 (provenance audit), SYN-9 (Apache-2.0 legal metadata)

## Policy summary

| Source | Allowed? | Conditions |
|--------|----------|------------|
| Original SoftTeco / Synqevra code | Yes | Apache-2.0; copyright SoftTeco Sp. z o.o. |
| ThingsBoard **Community Edition** | Only via this process | Apache-2.0; exact provenance + NOTICE |
| ThingsBoard **Professional Edition** | **No** | Never copy, adapt, decompile, or incorporate |
| Customer / NDA / restricted material | **No** | Must not enter this repository |

Native Synqevra implementation is preferred when it yields a cleaner architecture.
Accidental copy/paste without provenance is prohibited.

## When this process applies

Any addition that is copied or adapted from ThingsBoard CE, including:

- source code (any language)
- configuration, schemas, SQL, migrations
- rule-chain / dashboard / widget JSON exports
- documentation, diagrams, or assets derived from CE
- generated SDKs or OpenAPI artifacts taken from CE trees

API client code written against public CE HTTP/WebSocket contracts is **not**
automatically “CE-derived source,” but still must not include PE-only endpoints
or proprietary PE behavior.

## Required provenance record

Before merge, create or update an entry under
`docs/legal/provenance/` (one file per import batch) with:

1. **Upstream repository** (exact URL)
2. **Version** (e.g. ThingsBoard CE `4.3.1.3`)
3. **Commit SHA**
4. **Upstream file path(s)**
5. **Apache-2.0 confirmation** (link to LICENSE at that tag/commit)
6. **Original copyright** as stated upstream
7. **Local destination path(s)** in this repository
8. **Modifications made** (summary of diffs)
9. **NOTICE / attribution** updates required
10. **CE vs PE review** — explicit confirmation that material is CE, with reviewer name and date
11. **Related PR / issue**

Template: [`provenance/_TEMPLATE.md`](./provenance/_TEMPLATE.md)

## Review checklist (reviewer must confirm)

- [ ] Source is ThingsBoard **CE**, not PE (no PE repo, PE branch, PE license, or PE-only feature code)
- [ ] Version and commit are pinned and reproducible
- [ ] Upstream LICENSE is Apache-2.0 at that revision
- [ ] Copyright lines preserved where required
- [ ] `NOTICE` updated if redistribution/attribution requires it
- [ ] No customer secrets, private keys, or environment credentials included
- [ ] Prefer thin adapters over large vendor trees when architecture allows

## PE prohibition (hard stop)

If any of the following appear, **reject** the change and open a Security issue:

- Paths, packages, or docs referring to ThingsBoard Professional Edition source
- PE-only license headers or proprietary notices
- Decompiled or reverse-engineered PE binaries
- “Copied from PE” comments or internal PE tickets as source

Synqevra Professional Edition (future product expansion) must be an **original**
product, not a ThingsBoard PE clone.

## Default for current tree (SYN-7 baseline)

As of the SYN-7 audit:

- Application TypeScript/TSX under `apps/` is classified as **original SoftTeco**
  code (NestJS adapter + Next.js UI over ThingsBoard APIs + Medplum).
- Bundled JSON under `apps/backend/src/thingsboard/*.json` is classified as
  **CE configuration/data exports** (rule chains / dashboard), not PE source.
- No complete ThingsBoard CE or PE source tree is vendored in the current tree.

Future CE imports must follow this process; do not expand JSON/config reuse
without a provenance record.
