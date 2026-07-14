# Linear → GitHub migration map

Migration performed on 2026-07-14.

## Summary

- Source: Linear project **Synqevra**.
- Destination: [GitHub repository](https://github.com/chas523/synqevra) and GitHub Project **synqevra**.
- Migrated issues: **71** (`SYN-5` through `SYN-75`).
- Phase 0 milestone: GitHub milestone **#1**.
- Phase 1 milestone: GitHub milestone **#2**.
- `SYN-19` remains without a GitHub milestone until the Stage 2 milestone is created.
- `SYN-14` was canceled in Linear and is closed in GitHub as **not planned**.
- Parent/child and blocker relationships are preserved in issue bodies with GitHub links.
- Original Linear ID, status, priority, estimate, source URL, and milestone are preserved in each issue body.
- GitHub Project auto-add is enabled for repository issues.

## Issue mapping

| Linear | GitHub | Title | Migrated state | Milestone |
|---|---:|---|---|---|
| SYN-5 | [#2](https://github.com/chas523/synqevra/issues/2) | [DEVOPS] Establish GitHub as canonical repository and mirror Bitbucket | Todo | Phase 0 — Discovery and Architecture |
| SYN-6 | [#3](https://github.com/chas523/synqevra/issues/3) | [DEVOPS] Agree final GitHub ownership and repository cutover | Todo | Phase 0 — Discovery and Architecture |
| SYN-7 | [#4](https://github.com/chas523/synqevra/issues/4) | [SECURITY] Audit repository provenance, licenses and exposed secrets | Todo | Phase 0 — Discovery and Architecture |
| SYN-8 | [#6](https://github.com/chas523/synqevra/issues/6) | [SECURITY] Revoke and rotate credentials potentially exposed in Git history | Todo | Phase 0 — Discovery and Architecture |
| SYN-9 | [#5](https://github.com/chas523/synqevra/issues/5) | [LEGAL] Apply Apache-2.0 and public-release legal metadata | Todo | Phase 0 — Discovery and Architecture |
| SYN-10 | [#7](https://github.com/chas523/synqevra/issues/7) | [DEVOPS] Establish GitHub Actions CI baseline for the monorepo | Todo | Phase 0 — Discovery and Architecture |
| SYN-11 | [#8](https://github.com/chas523/synqevra/issues/8) | [WEB] Add frontend unit and component testing baseline | Todo | Phase 0 — Discovery and Architecture |
| SYN-12 | [#9](https://github.com/chas523/synqevra/issues/9) | [RESEARCH] Map headless ThingsBoard CE dependencies and replacement boundaries | Todo | Phase 0 — Discovery and Architecture |
| SYN-13 | [#10](https://github.com/chas523/synqevra/issues/10) | [RESEARCH] Build the complete ThingsBoard CE 4.3.1.3 parity catalog | Todo | Phase 0 — Discovery and Architecture |
| SYN-14 | [#11](https://github.com/chas523/synqevra/issues/11) | [RESEARCH] Build a sanitized ThingsBoard audit and export toolkit | Closed · not planned | Phase 0 — Discovery and Architecture |
| SYN-15 | [#12](https://github.com/chas523/synqevra/issues/12) | [ARCH] Define Stage 1 authorization roles and permission matrix | Todo | Phase 0 — Discovery and Architecture |
| SYN-16 | [#13](https://github.com/chas523/synqevra/issues/13) | [ARCH] Design Stage 1 Service Accounts and scoped API keys | Todo | Phase 0 — Discovery and Architecture |
| SYN-17 | [#15](https://github.com/chas523/synqevra/issues/15) | [ARCH] Design and prove PostgreSQL RLS tenant context | Todo | Phase 0 — Discovery and Architecture |
| SYN-18 | [#14](https://github.com/chas523/synqevra/issues/14) | [PRODUCT] Rebaseline roadmap for ThingsBoard CE replacement | Todo | Phase 0 — Discovery and Architecture |
| SYN-19 | [#16](https://github.com/chas523/synqevra/issues/16) | [PRODUCT] Define Synqevra Professional Edition strategy | Backlog | Stage 2 — Platform Expansion |
| SYN-20 | [#17](https://github.com/chas523/synqevra/issues/17) | [DOCS] Synchronize GitHub documentation with the CE 4.3.1.3 strategy | Todo | Phase 0 — Discovery and Architecture |
| SYN-21 | [#18](https://github.com/chas523/synqevra/issues/18) | [ARCH] Prepare the Phase 1 Entity Registry planning package | In Progress | Phase 0 — Discovery and Architecture |
| SYN-22 | [#19](https://github.com/chas523/synqevra/issues/19) | [ARCH] Define Stage 1 NFR and capacity baseline | Todo | Phase 0 — Discovery and Architecture |
| SYN-23 | [#21](https://github.com/chas523/synqevra/issues/21) | [ARCH] Define Better Auth identity lifecycle and privileged access | Todo | Phase 0 — Discovery and Architecture |
| SYN-24 | [#20](https://github.com/chas523/synqevra/issues/20) | [ARCH] Define ThingsBoard CE compatibility contracts | Todo | Phase 0 — Discovery and Architecture |
| SYN-25 | [#22](https://github.com/chas523/synqevra/issues/22) | [EPIC] Phase 1 — Core persistence, tenancy and events | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-26 | [#23](https://github.com/chas523/synqevra/issues/23) | [EPIC] Phase 1 — Entity Relations and Entity Groups | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-27 | [#24](https://github.com/chas523/synqevra/issues/24) | [EPIC] Phase 1 — Profiles, Device and Asset registry | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-28 | [#25](https://github.com/chas523/synqevra/issues/25) | [EPIC] Phase 1 — Entity management frontend | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-29 | [#26](https://github.com/chas523/synqevra/issues/26) | [EPIC] Phase 1 — Native API, import and compatibility | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-30 | [#27](https://github.com/chas523/synqevra/issues/27) | [EPIC] Phase 1 — Tenant, Customer, User and identity | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-31 | [#28](https://github.com/chas523/synqevra/issues/28) | [EPIC] Phase 1 — Security, audit, retention and legal hold | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-32 | [#29](https://github.com/chas523/synqevra/issues/29) | [EPIC] Phase 1 — Quality, observability and acceptance | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-33 | [#30](https://github.com/chas523/synqevra/issues/30) | [BACKEND] Implement shared entity persistence primitives | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-34 | [#31](https://github.com/chas523/synqevra/issues/31) | [BACKEND] Implement transaction-bound Unit of Work and tenant RLS context | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-35 | [#32](https://github.com/chas523/synqevra/issues/32) | [BACKEND] Implement Tenant and flat Customer aggregates and APIs | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-36 | [#33](https://github.com/chas523/synqevra/issues/33) | [BACKEND] Implement transactional outbox and domain-event envelope | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-37 | [#34](https://github.com/chas523/synqevra/issues/34) | [BACKEND] Implement Phase 1 table classification and RLS migrations | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-38 | [#36](https://github.com/chas523/synqevra/issues/36) | [BACKEND] Implement common lifecycle, tombstone and restore services | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-39 | [#35](https://github.com/chas523/synqevra/issues/35) | [BACKEND] Implement Better Auth tenant bootstrap and invitations | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-40 | [#37](https://github.com/chas523/synqevra/issues/37) | [BACKEND] Implement sessions, recovery, MFA and step-up controls | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-41 | [#38](https://github.com/chas523/synqevra/issues/38) | [BACKEND] Implement atomic Customer reassignment | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-42 | [#70](https://github.com/chas523/synqevra/issues/70) | [BACKEND] Implement User aggregate, roles and Customer assignment | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-43 | [#39](https://github.com/chas523/synqevra/issues/39) | [BACKEND] Implement versioned Device and Asset Profiles | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-44 | [#40](https://github.com/chas523/synqevra/issues/40) | [BACKEND] Implement encrypted Device credentials and provisioning | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-45 | [#71](https://github.com/chas523/synqevra/issues/71) | [BACKEND] Implement Asset aggregate, lifecycle and API | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-46 | [#41](https://github.com/chas523/synqevra/issues/41) | [BACKEND] Implement Device aggregate, lifecycle and API | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-47 | [#42](https://github.com/chas523/synqevra/issues/42) | [RESEARCH] Create Phase 1 CE registry parity mapping and fixtures | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-48 | [#43](https://github.com/chas523/synqevra/issues/43) | [BACKEND] Implement typed Entity Relations and APIs | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-49 | [#44](https://github.com/chas523/synqevra/issues/44) | [BACKEND] Implement relation traversal, cycle checks and Customer visibility | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-50 | [#45](https://github.com/chas523/synqevra/issues/45) | [BACKEND] Implement safe Entity Group bulk operations | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-51 | [#46](https://github.com/chas523/synqevra/issues/46) | [BACKEND] Implement homogeneous Entity Groups and memberships | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-52 | [#47](https://github.com/chas523/synqevra/issues/47) | [BACKEND] Implement shared native REST API contracts | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-53 | [#49](https://github.com/chas523/synqevra/issues/49) | [BACKEND] Implement idempotency and per-item bulk commands | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-54 | [#48](https://github.com/chas523/synqevra/issues/48) | [BACKEND] Implement versioned JSON import and export | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-55 | [#50](https://github.com/chas523/synqevra/issues/50) | [BACKEND] Implement external identifier registry and resolution | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-56 | [#52](https://github.com/chas523/synqevra/issues/52) | [BACKEND] Implement isolated ThingsBoard CE compatibility adapter | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-57 | [#54](https://github.com/chas523/synqevra/issues/54) | [WEB] Build API client and management UI foundations | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-58 | [#51](https://github.com/chas523/synqevra/issues/51) | [WEB] Build Tenant, Customer, User and invitation management | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-59 | [#53](https://github.com/chas523/synqevra/issues/53) | [WEB] Build Profile versioning and rollback management | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-60 | [#55](https://github.com/chas523/synqevra/issues/55) | [WEB] Build Device and Asset registry management | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-61 | [#56](https://github.com/chas523/synqevra/issues/56) | [BACKEND] Implement privileged target-Tenant administration | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-62 | [#57](https://github.com/chas523/synqevra/issues/57) | [WEB] Build Entity Relation and Entity Group management | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-63 | [#58](https://github.com/chas523/synqevra/issues/58) | [BACKEND] Implement permission catalog and policy guards | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-64 | [#59](https://github.com/chas523/synqevra/issues/59) | [QA] Build real-PostgreSQL integration and isolation test harness | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-65 | [#60](https://github.com/chas523/synqevra/issues/60) | [BACKEND] Implement retention, purge and legal holds | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-66 | [#61](https://github.com/chas523/synqevra/issues/61) | [BACKEND] Implement envelope encryption and secret redaction | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-67 | [#62](https://github.com/chas523/synqevra/issues/62) | [FEATURE] Deliver append-only audit log and viewer | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-68 | [#63](https://github.com/chas523/synqevra/issues/63) | [QA] Create deterministic multi-tenant demo and attack dataset | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-69 | [#64](https://github.com/chas523/synqevra/issues/64) | [DEVOPS] Implement logs, metrics, traces and health dashboards | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-70 | [#65](https://github.com/chas523/synqevra/issues/65) | [QA] Run Phase 1 parity review and no-ThingsBoard demonstration | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-71 | [#66](https://github.com/chas523/synqevra/issues/66) | [DEVOPS] Add contract, frontend and E2E CI gates | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-72 | [#72](https://github.com/chas523/synqevra/issues/72) | [DEVOPS] Verify migrations, rollback and upgrade safety | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-73 | [#67](https://github.com/chas523/synqevra/issues/67) | [QA] Benchmark Entity Registry against the NFR baseline | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-74 | [#68](https://github.com/chas523/synqevra/issues/68) | [BACKEND] Implement append-only audit store and query API | Todo | Phase 1 — Entity Registry and Core Domain Model |
| SYN-75 | [#69](https://github.com/chas523/synqevra/issues/69) | [WEB] Build audit log viewer | Todo | Phase 1 — Entity Registry and Core Domain Model |

## Known follow-up

- Create Project custom fields and views described in [GitHub Project Views](Project-Views).
- Create/apply labels if label-based filtering is preferred; title prefixes already provide the authoritative work type.
- Verify whether non-empty Linear comments need archival migration.
- After acceptance, freeze Linear as read-only; do not delete it, because it remains migration provenance.
