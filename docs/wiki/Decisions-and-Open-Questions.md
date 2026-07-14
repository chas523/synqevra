<!-- Migrated from Linear document https://linear.app/softteco-fd/document/synqevra-decisions-and-open-questions-53714b34871c on 2026-07-14. GitHub is now authoritative. -->

# Synqevra — Decisions and Open Questions

This document is the current decision register and unresolved-question backlog for Synqevra. GitHub is authoritative.

Architecture decisions should become ADRs. Actionable work should become GitHub issues. Superseded decisions remain recorded only where needed for traceability.

## 1. Confirmed Product Decisions

* Stage 1 is **Synqevra Community Edition**.
* Stage 1 must completely replace the current headless ThingsBoard dependency.
* The frozen parity baseline is **ThingsBoard Community Edition 4.3.1.3**.
* All documented CE 4.3.1.3 capabilities are in the long-term Stage 1 scope.
* Local production usage is not used to remove CE capabilities from scope.
* Parity means equivalent capability and workflow, not pixel-identical UI or copied architecture.
* Stage 2 is an original **Synqevra Professional Edition**.
* ThingsBoard PE parity is not a product target.
* Healthcare/Medplum/FHIR are domain modules; the core remains domain-neutral.

## 2. Confirmed Architecture Decisions

* Existing `apps/backend` and `apps/frontend` evolve in place.
* Migration uses an in-place strangler approach.
* Initial architecture is a modular monolith.
* Microservices require measured justification.
* PostgreSQL with TimescaleDB is the initial data platform.
* PostgreSQL RLS is the tenant-isolation mechanism.
* Tenant context uses transaction-local `set_config(..., true)` / `SET LOCAL`.
* Session-level tenant context on pooled connections is prohibited.
* Better Auth is the authentication foundation.
* Node.js 24 LTS is the runtime baseline.
* MQTT/EMQX is the primary connectivity direction; full CE protocol scope is tracked through the catalog.

## 3. Confirmed Authorization Decisions

* A regular Stage 1 user belongs to one tenant.
* Platform Super Admin is separate from tenant roles.
* Built-in tenant roles:
  * Tenant Admin;
  * Operator;
  * Viewer;
  * Device Manager;
  * Alarm Manager.
* A user may have multiple composable roles.
* Effective permissions are the union of role permissions.
* Default behavior is deny.
* Explicit deny and custom tenant roles are not included initially.
* Operational roles apply tenant-wide.
* Resource/group-scoped role assignments are deferred.
* Integration Manager is deferred.
* Service Accounts use scoped API keys.
* Service Account scopes apply at account level.
* API key validity defaults to 90 days and cannot exceed 365 days.
* Non-expiring keys are prohibited.
* OAuth 2.0 Client Credentials is deferred until after the initial release.
* Milestone 1 entity scope is Tenant, Customer, User, Device, Device Profile, Asset, Asset Profile, Entity Relation, and Entity Group.
* Tenant is the Milestone 1 ownership and isolation boundary.
* Device, Asset, User, and Entity Group are tenant-owned and may be assigned to a Customer.
* Device Profile and Asset Profile are tenant-owned and shared within the Tenant.
* Customer assignment never changes tenant ownership or RLS context.
* Customers are flat within a Tenant; nested Customers are not included in Phase 1.
* Device, Asset, Entity Group, and Customer-scoped User may be assigned to at most one Customer at a time.
* Multi-Customer sharing is not included in Phase 1.
* Customer reassignment is atomic, preserves entity history, switches access at transaction commit, and emits an audit event.
* Customer reassignment never changes Tenant ownership and cannot cross Tenant boundaries.
* New Synqevra entities use UUIDv7 primary identifiers.
* ThingsBoard UUIDs and other imported identifiers are stored separately as external identifiers.
* Native Synqevra APIs accept and return UUIDv7 only.
* External ThingsBoard UUIDs may be resolved only by explicit import/compatibility APIs.
* External identifiers are unique within `tenant_id + source + entity_type + external_id`.
* Mutable Phase 1 entities use numeric-version optimistic locking.
* Stale mutations return `409 Conflict` without changing state.
* Phase 1 core entities use soft delete by default and remain restorable until purge.
* Purge is a separate privileged, irreversible and audited operation after the retention period.
* Retention is configurable and supports multi-year regulated deployments; no fixed 365-day maximum applies.
* Purge is prohibited until the effective retention policy allows it.
* Platform Super Admin sets retention minimum and default; Tenant Admin may only extend retention.
* Legal hold is supported, overrides retention expiry, and blocks purge until explicitly released.
* Legal-hold placement, modification and release are privileged audited operations.
* Platform Super Admin and Tenant Admin with a dedicated permission may manage legal holds; Tenant Admin is restricted to its Tenant.
* Legal hold can target an entire Tenant or an individual entity; every applicable active hold must be released before purge.
* Phase 1 core lifecycle is `active → disabled → deleted`; no separate archive state.
* Restore returns a soft-deleted entity to `disabled`; activation is separate.
* Disabled/deleted entities retain telemetry, alarms and audit history.
* Assigned profiles and containers with unresolved dependencies cannot be deleted.
* Lifecycle transitions are authorized, version-checked and audited.
* Every Device and Asset has exactly one tenant-owned Profile.
* Every Tenant has one default Device Profile and one default Asset Profile.
* Profiles are versioned, schema-validated, audited and rollback-capable; assigned entities follow the latest active version.
* Assigned Profiles cannot be deleted.
* Generic per-entity Profile overrides are excluded; credentials and entity metadata remain entity-owned.
* Relations are directed, typed, tenant-owned and unique by active from/to/type; cross-tenant and self-relations are prohibited.
* General graph cycles are allowed; hierarchy relation types must be acyclic.
* A Customer user sees a Relation only when both endpoints are readable.
* Entity Groups contain one entity type, allow multiple memberships, are not nested and do not grant permissions.
* Customer-assigned Groups may contain only entities assigned to that Customer.
* Phase 1 identity is invitation-only with verified email/password authentication.
* Platform Super Admin uses mandatory MFA; legal hold, purge and other critical actions require MFA/step-up.
* Invitations last 72 hours; password reset tokens last 30 minutes.
* Sessions have a 12-hour idle and 7-day absolute lifetime and are revoked by disable/password/role changes.
* Passkeys, social login, SSO and general support impersonation are deferred unless required by the CE catalog.
* Phase 1 native API is JSON REST under `/api/v1`, UUIDv7-only and specified by OpenAPI.
* ThingsBoard compatibility is isolated in a versioned adapter; frontend uses native API only.
* Collections use cursor pagination (50 default, 100 maximum), allowlisted filters/sorts and RFC 9457 errors.
* Writes use optimistic locking; create/import/bulk support idempotency keys.
* Bulk operations report per-item outcomes without rolling back successful siblings.
* Import/export uses versioned JSON; GraphQL is excluded from Phase 1.
* Tenant-owned tables use RLS; runtime roles do not own them or bypass RLS.
* RLS enforces Tenant isolation; centralized backend policies enforce Customer/role visibility.
* Platform Super Admin uses explicit audited target-Tenant access without unrestricted runtime bypass.
* Tenant database work uses transaction-local context; raw SQL is restricted to reviewed helpers.
* Recoverable credentials/secrets use envelope encryption and never appear in logs.
* Audit storage is append-only; negative isolation/authorization tests are mandatory.
* Every successful mutation emits a versioned domain event through a transactional outbox.
* Event delivery is at-least-once, ordered per aggregate and consumed idempotently.
* Retry/DLQ/replay are observable; replay is permission-protected and audited.
* Audit records are separate, append-only and contain safe diffs; secrets are prohibited in events and audit.
* Soft deletion emits a tombstone event.
* Phase 1 provides complete management UI for all scoped entities and dedicated invitation/assignment/Profile/Relation/Group workflows.
* UI targets WCAG 2.1 AA with explicit loading, empty, error, conflict, forbidden and destructive states.
* Required verification includes backend unit/integration, real-PostgreSQL RLS, permission denial, OpenAPI contract, golden compatibility, Vitest/RTL and critical Playwright E2E tests.
* Coverage uses a non-decreasing ratchet; structured logs, metrics, traces, health checks and an audit viewer are required.
* Phase 1 exits only after an end-to-end demo without ThingsBoard.

## 4. Confirmed Repository and Quality Decisions

* GitHub is the source of truth.
* Current repository `chas523/synqevra` is temporary.
* Bitbucket is a temporary migration mirror.
* Final GitHub ownership requires line-manager alignment.
* Repository visibility is intentionally public.
* Merge strategy is merge commits.
* PR and CI are required.
* No approval is required while only one developer is active.
* One approval becomes required when a second developer joins.
* GitHub Actions is the authoritative CI.
* GitHub documentation and repository metadata synchronization is tracked by [SYN-20 / #17](https://github.com/chas523/synqevra/issues/17).
* Frontend tests use Vitest and React Testing Library.
* Coverage uses a non-decreasing baseline ratchet.

## 5. Confirmed Licensing and Brand Decisions

* Synqevra CE uses Apache License 2.0.
* Copyright holder: **SoftTeco Sp. z o.o.**
* Existing custom source is expected to be SoftTeco-owned, subject to audit.
* ThingsBoard CE-derived material requires exact Apache-2.0 provenance and attribution.
* ThingsBoard PE source must not be copied.
* External pull requests are not accepted during the current stage.
* Unofficial forks/hosted services may use the Synqevra brand with a prominent non-affiliation disclaimer.
* Final Synqevra Professional Edition licensing and packaging are deferred.

## 6. Superseded Decisions

The following earlier assumptions are no longer valid:

* “Only actively used ThingsBoard capabilities need compatibility.”
* “Stage 1 targets both ThingsBoard CE and PE parity.”
* “Bitbucket is the primary source-control system.”
* “The same open-source feature set must necessarily be used for all future professional packaging.”
* “Q1 2027 and Q2–Q3 2027 dates are committed delivery dates.”

Current scope and dates are governed by [SYN-13 / #10](https://github.com/chas523/synqevra/issues/10) and [SYN-18 / #14](https://github.com/chas523/synqevra/issues/14).

## 7. Questions Closed from the Previous Register

The following earlier questions are considered closed or sufficiently decided for planning:

* Exact copyright entity: SoftTeco Sp. z o.o.
* External contributions: not accepted during the current stage.
* Trademark use: unofficial use allowed with disclosure.
* Source control and CI: GitHub and GitHub Actions.
* Architecture style: modular monolith with justified extraction.
* Tenant isolation: PostgreSQL RLS.
* Canonical RLS context: transaction-local PostgreSQL setting.
* Regular user tenant membership: one tenant.
* Built-in MVP/Stage 1 role set.
* Multiple composable roles.
* Custom tenant roles: deferred.
* Resource-level role assignments: deferred.
* Service Accounts: required.
* Service Account authentication: scoped API keys.
* API key expiry: 90-day default, 365-day maximum.
* OAuth Client Credentials: deferred.
* Node.js runtime: 24 LTS.
* Frontend unit-test stack and coverage policy.
* Migration application strategy: evolve existing backend/frontend in place.
* Production-data audit: not required because no production deployment exists.
* ThingsBoard scope baseline: full CE 4.3.1.3.
* Dashboard parity: capability/workflow parity, not pixel-identical UI.
* Professional direction: original Synqevra expansion, not ThingsBoard PE parity.

## 8. Phase 0 Blocking Open Decisions

### Repository, Legal, and Security

1. Which GitHub account or organization will own the final repository?
2. When will Bitbucket synchronization stop?
3. Which historical credentials require rotation?
4. Does the current history contain CE-derived material requiring NOTICE entries?
5. What private security-reporting channel will be published?
6. Who performs final legal approval of LICENSE, NOTICE, trademark, and provenance?

Tracked by [SYN-5 / #2](https://github.com/chas523/synqevra/issues/2)–[SYN-9 / #5](https://github.com/chas523/synqevra/issues/5).

### Identity and Privileged Access

 7. How will Better Auth replace the current JWT/Passport flows?
 8. Which login, invitation, activation, password-reset, email-verification, and session-management flows are required for the first release?
 9. Are MFA, passkeys, passwordless login, and social login required in Stage 1 or deferred?
10. Is SSO required for CE parity, Stage 2, or both?
11. How does Platform Super Admin select and access a tenant?
12. Does privileged access use ordinary RLS with explicit tenant selection, restricted security-definer functions, or a separate audited database role?
13. What step-up authentication is required for privileged actions?
14. How is support impersonation authorized, time-limited, displayed, and audited?
15. What is the final action-level permission matrix for each built-in role?

Tracked by [SYN-15 / #12](https://github.com/chas523/synqevra/issues/12)–[SYN-17 / #15](https://github.com/chas523/synqevra/issues/15) and [SYN-23 / #21](https://github.com/chas523/synqevra/issues/21).

### Data, Capacity, and Reliability

16. What reference workload defines the first benchmark?
17. What are the target tenant, user, device, asset, and relation counts?
18. What are target messages/second and daily telemetry volumes?
19. What are acceptable write, query, API, and dashboard-update latencies?
20. What retention, compression, aggregation, archive, and deletion policies are required?
21. What availability, RPO, and RTO targets apply to self-hosted and managed deployments?
22. What storage-growth and cost assumptions are used?
23. At what measured threshold is an analytical store beyond TimescaleDB reconsidered?

Tracked by [SYN-22 / #19](https://github.com/chas523/synqevra/issues/19). No milestone should claim production readiness until these are decided.

### Protocol and Device Compatibility

24. Which CE 4.3.1.3 protocols and transport behaviors require wire-level compatibility?
25. Which device credential types and provisioning flows must preserve ThingsBoard-compatible behavior?
26. What RPC, device configuration, gateway, claiming, LwM2M, CoAP, and OTA semantics must be compatible?
27. Is exact REST API compatibility required, or will Synqevra provide a native API plus a compatibility layer?
28. How are legacy ThingsBoard identifiers mapped to Synqevra identifiers?
29. What automated conformance test suite proves device and API compatibility?

The inventory is tracked by [SYN-12 / #9](https://github.com/chas523/synqevra/issues/9) and [SYN-13 / #10](https://github.com/chas523/synqevra/issues/10); the compatibility contract is tracked by [SYN-24 / #20](https://github.com/chas523/synqevra/issues/20).

### Rule Engine, Dashboards, and Alarms

30. What execution guarantees are required for Rule Engine ordering, retries, idempotency, replay, scheduling, and dead letters?
31. How are CE rule-node behaviors cataloged and tested?
32. What rule versioning, deployment, rollback, and audit model is required?
33. What alarm lifecycle, deduplication, assignment, acknowledgement, escalation, and clearance semantics are required?
34. How are CE widgets, dashboards, aliases, states, and SCADA behavior cataloged?
35. Which UI differences are intentional while preserving parity?
36. What extension model supports future Synqevra nodes, widgets, protocols, and integrations?

### GDPR, Security, and Compliance

37. What personal or sensitive data may Synqevra store in real deployments?
38. What audit events are mandatory?
39. What data export, deletion, retention, and right-to-erasure workflows are required?
40. Are regional deployment or data-residency controls required?
41. Which data requires application-level encryption?
42. What vulnerability-management, dependency-update, backup, incident-response, and secrets-management processes are required?
43. Which foundations are required now for later HIPAA, ISO 27001, and SOC 2 work?

### Team and Delivery

44. Which engineers and roles are allocated to Phase 0 and Phase 1?
45. Who owns backend, frontend, infrastructure, QA, security, product design, and documentation?
46. Which environments are required?
47. What infrastructure-as-code approach is used?
48. What observability stack is used?
49. How often are demos, architecture reviews, and roadmap reviews held?
50. What estimate confidence and contingency policy is used?
51. May an early Synqevra CE release ship before complete CE 4.3.1.3 parity?

Tracked through [SYN-18 / #14](https://github.com/chas523/synqevra/issues/14) and future delivery issues.

## 9. Milestone 1 Planning Questions

Milestone 1 is **Phase 1 — Entity Registry and Core Domain Model**. Its planning package and final ticket tree are tracked by [SYN-21 / #18](https://github.com/chas523/synqevra/issues/18).

The following must be decided before it can be completely covered by implementation-ready tickets:

### Domain boundary

1. **Closed:** Phase 1 includes Tenant, Customer, User, Device, Device Profile, Asset, Asset Profile, Entity Relation, and Entity Group.
2. **Closed:** Tenant is the ownership/isolation boundary; all remaining Phase 1 entities are tenant-owned.
3. **Closed:** Device, Asset, User, and Entity Group may be assigned to a Customer; profiles remain tenant-owned.
4. **Closed:** Customers are flat within a Tenant; no nested hierarchy in Phase 1.
5. **Closed:** An assignable entity belongs to at most one Customer at a time; multi-Customer sharing is excluded from Phase 1.
6. **Closed:** Reassignment is atomic; history is preserved, access switches on commit, and the operation is audited.
7. How are relations handled when their endpoints are assigned to different Customers?

### Identity and identifiers

 6. **Closed:** Synqevra uses UUIDv7 native identifiers.
 7. **Closed:** ThingsBoard UUIDs are external identifiers, not Synqevra primary keys.
 8. Which APIs may accept or resolve external identifiers?
 9. **Closed:** External IDs are unique by tenant, source, entity type, and external ID value.
10. **Closed:** Numeric optimistic locking; successful mutations increment `version`, stale mutations return `409 Conflict`.

### Lifecycle

10. **Closed:** Lifecycle is `active → disabled → deleted`; restore returns to `disabled`; no archive state.
11. **Closed:** Core entities use soft delete; permanent purge is a separate privileged operation after configurable retention.
12. **Closed:** Platform defines the minimum/default; Tenant Admin may extend but not shorten below the minimum.
13. **Closed:** Legal hold is required and blocks purge regardless of retention expiry.
14. **Closed:** Platform Super Admin and Tenant Admin with dedicated permission; Tenant Admin is tenant-scoped.
15. **Closed:** Legal hold may apply to an entire Tenant or an individual entity; any applicable active hold blocks purge.
16. What happens to relations, credentials, telemetry, alarms, dashboards, and rules when an entity is disabled or deleted?
17. Which lifecycle changes emit domain events and audit events?

### Profiles and configuration

14. **Closed:** Profile owns shared typed configuration; credentials and entity metadata remain on the entity.
15. **Closed:** Exactly one Profile per entity and one default Profile of each type per Tenant; latest active version applies.
16. Credential types/provisioning details are finalized through the CE catalog and compatibility contract.
17. Dynamic/custom fields require an explicit schema; generic Profile overrides are excluded.

### Relations and groups

18. **Closed:** Directed typed relations, validated metadata, no self/cross-tenant links; hierarchy types are acyclic.
19. **Closed:** Homogeneous non-nested groups, multiple memberships, organization/bulk use without permission grants.
20. **Closed:** Relation and membership changes are audited and protected against stale mutation.

### APIs and compatibility

21. **Closed:** Native `/api/v1` plus a separate versioned compatibility adapter.
22. **Closed:** Cursor pagination, allowlisted filters/sorts, RFC 9457 errors, versioned JSON import/export and per-item bulk outcomes.
23. **Closed:** Phase 1 frontend migrates to native API only.
24. Compatibility completion is defined by the [SYN-24 / #20](https://github.com/chas523/synqevra/issues/20) matrix and golden conformance fixtures.

### Security and tenancy

25. **Closed:** Every tenant-owned Phase 1 table is RLS-protected.
26. **Closed:** Separate migration/runtime roles; runtime has no ownership/BYPASSRLS; transaction-local tenant context.
27. The action-level permission mapping is produced by [SYN-15 / #12](https://github.com/chas523/synqevra/issues/12) and copied into implementation tickets.
28. **Closed:** Explicit audited target-Tenant flow without unrestricted runtime bypass.
29. **Closed:** All mutations are audited; cataloged critical actions require dedicated permission and MFA/step-up.

### Data and events

30. Schema/index details are implementation-ticket deliverables under confirmed RLS and lifecycle rules.
31. **Closed:** State and outbox share a transaction-bound Unit of Work.
32. **Closed:** Every successful mutation emits a versioned aggregate domain event; deletes emit tombstones.
33. **Closed:** Numeric optimistic locking, idempotency keys and idempotent at-least-once consumers.
34. A deterministic multi-tenant seed/demo dataset is required for acceptance and isolation tests.

### Frontend

35. **Closed:** Full management UI for all scoped entities plus invitation, assignment, Profile, Relation and Group workflows.
36. Reuse is preferred when existing components satisfy the confirmed contracts; otherwise refactor within the existing frontend.
37. **Closed:** Loading, empty, validation, conflict, forbidden and destructive states are mandatory.
38. **Closed:** Vitest/RTL plus Playwright for critical workflows.

### Quality and operations

39. **Closed:** Unit, real-database integration, RLS/authorization negative, OpenAPI, golden compatibility and critical E2E suites.
40. Numeric targets are supplied by [SYN-22 / #19](https://github.com/chas523/synqevra/issues/19); benchmark tasks and evidence are mandatory in Phase 1.
41. **Closed:** Structured logs, metrics, traces, health checks, outbox/DLQ monitoring and audit viewer.
42. **Closed:** Tested rollback or forward-fix, deterministic demo data and end-to-end no-ThingsBoard evidence.

## 10. Decision Recording Rule

For every confirmed decision:

* update this document;
* update the Project Brief if product scope changes;
* create or update an ADR for architecture decisions;
* create/update GitHub issues;
* record owner, review date, assumptions, and superseded decisions;
* update the CE capability catalog when parity scope changes;
* update LICENSE, NOTICE, SPDX, and attribution records when provenance changes.