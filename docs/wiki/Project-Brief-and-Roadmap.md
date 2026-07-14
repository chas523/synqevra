<!-- Migrated from Linear document https://linear.app/softteco-fd/document/synqevra-project-brief-and-roadmap-6506ed2b585f on 2026-07-14. GitHub is now authoritative. -->

# Synqevra — Project Brief & Roadmap

## 1. Product Vision

Synqevra is an independent, extensible, multi-tenant IoT platform for managing devices, assets, telemetry, attributes, rules, alarms, dashboards, users, tenants, connectivity, and external integrations.

The platform is being built in two product stages:

1. **Synqevra Community Edition** — an Apache-2.0 open-source platform that completely replaces the current headless ThingsBoard dependency and reaches verified capability parity with ThingsBoard Community Edition 4.3.1.3.
2. **Synqevra Professional Edition** — a later, original product expansion built on the Synqevra CE foundation according to customer, managed-service, and enterprise requirements.

Healthcare and Medplum/FHIR are important domain modules, but the platform core remains domain-neutral.

## 2. Problem Statement

The current application depends on ThingsBoard as a headless platform for core IoT capabilities.

This creates several problems:

* Synqevra does not own the complete domain and data model.
* Core workflows depend on external APIs, identifiers, runtime services, and release decisions.
* Backend and frontend contain ThingsBoard-specific adapters, DTOs, routes, credentials, and embedded UI.
* Deep customization requires working around another platform’s architecture.
* Product evolution, security, tenancy, integrations, and operational behavior cannot be controlled end to end.
* Healthcare and future domain modules remain coupled to ThingsBoard concepts.
* The team cannot independently define compatibility, performance, deployment, and commercial strategy.

## 3. Strategic Goal

Build and operate a native Synqevra platform that:

* runs without a ThingsBoard service;
* owns all core data and processing;
* provides complete verified parity with the frozen ThingsBoard CE 4.3.1.3 baseline;
* preserves required API and device compatibility;
* provides strong multi-tenant isolation;
* is public and distributable under Apache License 2.0;
* becomes the stable foundation for original Synqevra Professional capabilities.

## 4. Frozen Stage 1 Baseline

**ThingsBoard Community Edition 4.3.1.3** is the frozen Stage 1 parity baseline.

Rules:

* Every documented CE 4.3.1.3 capability must appear in the parity catalog.
* No capability is excluded because it is unused in the current local application.
* Newer upstream CE releases do not silently expand Stage 1.
* New releases receive an explicit delta review.
* Changing the baseline requires an approved roadmap decision.
* Relevant security fixes are evaluated immediately.

The authoritative parity-catalog task is [SYN-13 / #10](https://github.com/chas523/synqevra/issues/10).

## 5. Stage 1 Scope — Synqevra Community Edition

Stage 1 covers the complete CE 4.3.1.3 product surface, including:

* platform, tenant, customer, user, and security administration;
* devices, assets, profiles, relations, groups, credentials, claiming, and provisioning;
* MQTT, HTTP, CoAP, LwM2M, gateways, and CE-supported connectivity;
* telemetry, attributes, events, subscriptions, retention, aggregation, and querying;
* Rule Engine, Rule Chains, CE node types, scripts, queues, retries, and lifecycle;
* alarms, notifications, acknowledgement, assignment, and lifecycle;
* dashboards, widgets, aliases, states, sharing, and CE SCADA capabilities;
* RPC, OTA, resources, packages, and device configuration;
* CE integrations, converters, import/export, and operational tooling;
* clustering, deployment, observability, backup, and recovery capabilities required for parity;
* compatibility and removal of every current headless ThingsBoard dependency.

### Parity definition

Parity means equivalent product capability and supported workflow. It does not require copying ThingsBoard architecture or pixel-identical UI.

A capability is verified only when:

* it is implemented natively by Synqevra;
* API/device compatibility requirements pass;
* tenancy, authorization, lifecycle, errors, and operational behavior are tested;
* execution and storage no longer delegate to ThingsBoard;
* acceptance evidence is linked.

## 6. Stage 1 Non-Goals

The following are not Stage 1 parity targets:

* ThingsBoard Professional Edition parity;
* copying closed ThingsBoard PE code or implementation;
* production-data migration, because no production deployment currently exists;
* preserving every internal ThingsBoard architectural choice;
* pixel-identical replication of the ThingsBoard UI;
* final pricing and packaging for Synqevra Professional Edition;
* customer-specific advanced capabilities that are unrelated to CE parity.

## 7. Stage 2 — Synqevra Professional Edition

After the CE foundation is complete and stable, Synqevra will define its own advanced Professional Edition.

Potential themes include advanced RBAC, enterprise identity, reporting, scheduling, managed integrations, white-label management, analytics, compliance, multi-region deployment, managed operations, low-code tools, and industry modules.

The licensing, packaging, commercial model, and feature boundary remain open and are tracked in [SYN-19 / #16](https://github.com/chas523/synqevra/issues/16).

Stage 2 must not block Stage 1.

## 8. Architecture Direction

The initial implementation is a **modular monolith** with strong module boundaries.

* Existing `apps/backend` and `apps/frontend` evolve in place.
* ThingsBoard dependencies are replaced incrementally through a strangler migration.
* Native Synqevra modules become the source of truth one capability at a time.
* Microservices are introduced only for measured scaling, isolation, security, reliability, or ownership needs.
* Architecture-impacting decisions are recorded as ADRs.

### Technical direction

* Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, React Flow/xyflow.
* Backend: NestJS, TypeScript, CQRS.
* Runtime baseline: Node.js 24 LTS.
* Data: PostgreSQL with TimescaleDB.
* Tenant isolation: PostgreSQL RLS with transaction-local context.
* Queues: Redis and BullMQ.
* Connectivity: MQTT/EMQX plus the complete CE baseline protocol scope.
* Healthcare: Medplum and FHIR modules.
* Monorepo: pnpm and Turborepo.
* CI: GitHub Actions.
* Infrastructure: Docker and DigitalOcean direction; final environments/IaC remain open.

## 9. Tenancy, Identity, and Authorization

Confirmed:

* Better Auth is the authentication foundation.
* A regular Stage 1 user belongs to one tenant.
* Platform Super Admin is separate from tenant roles.
* Tenant users may have multiple composable built-in roles.
* Effective permissions are the union of assigned roles; default deny.
* Built-in roles: Tenant Admin, Operator, Viewer, Device Manager, Alarm Manager.
* Roles apply tenant-wide in Stage 1.
* Custom roles and resource-level assignments are deferred.
* Service Accounts use scoped API keys in Stage 1.
* API keys default to 90 days and may not exceed 365 days.
* OAuth 2.0 Client Credentials is deferred.
* Integration Manager is deferred.

Open details remain in [SYN-15 / #12](https://github.com/chas523/synqevra/issues/12), [SYN-16 / #13](https://github.com/chas523/synqevra/issues/13), and [SYN-17 / #15](https://github.com/chas523/synqevra/issues/15).

## 10. Tenant Isolation

PostgreSQL RLS is the primary tenant-isolation control.

Tenant context is established inside a transaction using `set_config(..., true)` or `SET LOCAL`. Session-level tenant state on pooled connections is prohibited.

The design must cover HTTP, WebSocket, jobs, queues, telemetry, devices, integrations, migrations, and privileged administration.

## 11. Migration Strategy

The project uses an in-place strangler strategy:

1. Catalog all CE 4.3.1.3 capabilities.
2. Map all current headless ThingsBoard dependencies.
3. Define native module and compatibility boundaries.
4. Replace ThingsBoard as source of truth module by module.
5. Validate parity and compatibility through automated tests.
6. Remove proxies, iframes, identifiers, credentials, and runtime services.
7. Run the complete application without ThingsBoard.
8. Decommission ThingsBoard after acceptance.

Because there is no production deployment, production data audit, dual-write, and zero-downtime migration are not default requirements. They may be introduced later only if the operational context changes.

## 12. Open Source, Licensing, and Commercial Direction

Confirmed:

* Stage 1 Synqevra CE uses Apache License 2.0.
* Copyright holder: SoftTeco Sp. z o.o.
* The repository is intentionally public.
* External pull requests are not accepted during the current stage.
* Unofficial forks and hosted services may use the Synqevra name with a clear non-affiliation disclaimer.
* CE-derived material requires exact provenance, attribution, NOTICE, and modification records.
* ThingsBoard PE source must not be copied.
* Managed hosting, operations, support, migration, consulting, and extensions remain possible paid services.

The final Synqevra Professional Edition licensing model is intentionally deferred.

## 13. Repository and Delivery Governance

* Current temporary canonical repository: [chas523/synqevra](<https://github.com/chas523/synqevra>).
* GitHub is the source of truth.
* Bitbucket is a temporary migration mirror.
* Final GitHub ownership requires line-manager alignment.
* Merge strategy: merge commits.
* While Sergey is the only developer, PR and CI are required but approving review count is zero.
* Force-push and deletion of `main` are prohibited.
* When a second active developer joins, at least one approval becomes required.
* GitHub Actions is the authoritative CI provider.
* Node.js 24 LTS is the runtime baseline.
* Frontend unit/component tests use Vitest and React Testing Library.
* Coverage uses a non-decreasing baseline ratchet.

### GitHub issue naming convention

Every issue title starts with exactly one primary type:

* `[EPIC]` — milestone workstream/container; no implementation estimate.
* `[FEATURE]` — cross-stack capability container; implementation is split into typed subtasks.
* `[WEB]` — frontend/UI implementation.
* `[BACKEND]` — backend, database or server-side implementation.
* `[ARCH]` — architecture decision, ADR or proof of concept.
* `[RESEARCH]` — investigation, inventory, audit or parity discovery.
* `[DEVOPS]` — CI/CD, infrastructure, deployment or operational tooling.
* `[QA]` — test harness, verification, benchmark or acceptance.
* `[DOCS]` — documentation-only delivery.
* `[SECURITY]` — security remediation/audit not owned by a single implementation layer.
* `[LEGAL]` — licensing, copyright or legal metadata.
* `[PRODUCT]` — product scope, roadmap or commercial decision.

Format: `[TYPE] Imperative outcome`.

A single implementation ticket must not combine Web and Backend delivery. Cross-stack work uses an unestimated `[FEATURE]` container with separate `[BACKEND]` and `[WEB]` subtasks. Secondary concerns remain GitHub labels, not additional title prefixes.

## 14. Team and Governance

* **Sergey Hoishyk** — Product Owner, Project Lead, and Technical Lead.
* **Roman Navarych** — architecture and planning stakeholder.
* Additional engineering, QA, infrastructure, security, and design roles remain to be assigned.
* Major architecture and roadmap decisions require review with Sergey and Roman.

## 15. Roadmap Structure

### Phase 0 — Discovery and Architecture

* CE 4.3.1.3 parity catalog.
* Current headless dependency map.
* Repository, licensing, security, CI, authorization, RLS, NFR, architecture, and delivery decisions.
* Rebaselined roadmap and team plan.

### Phase 1 — Entity Registry and Core Domain Model

* Native multi-tenant entity source of truth.
* Tenants, customers, users, devices, assets, profiles, relations, groups, credentials, lifecycle, APIs, authorization, RLS, and compatibility boundaries.

### Phase 2 — Telemetry and Attributes

* Native telemetry/attribute ingestion, storage, retention, querying, subscriptions, and compatibility.

### Phase 3 — Data Processing and Alarms

* Native processing pipeline, alarms, lifecycle, and notifications.

### Phase 4 — Dashboards and Visualization

* Native dashboards, widgets, states, aliases, sharing, SCADA, and live data.

### Phase 5 — Rule Engine and Automation

* Native CE Rule Engine, Rule Chains, node catalog, execution, queues, retries, and lifecycle.

### Phase 6 — Device Connectivity

* Native CE protocols, credentials, provisioning, gateway, RPC, configuration, and OTA.

### Phase 7–8 — Cutover and Decommissioning

* Complete parity verification, runtime removal, final compatibility validation, and ThingsBoard decommissioning.

### Stage 2 — Platform Expansion

* Original Synqevra Professional Edition and domain/product expansion.

## 16. Timeline Status

Previous Q1 2027 MVP and Q2–Q3 2027 decommission dates are **provisional and not currently evidence-backed**.

Dates must be rebaselined through:

* the CE 4.3.1.3 capability catalog;
* milestone dependency analysis;
* team/staffing assumptions;
* architecture and NFR decisions;
* estimate ranges and risk analysis.

This work is tracked in [SYN-18 / #14](https://github.com/chas523/synqevra/issues/14).

## 17. Success Criteria

Stage 1 succeeds when:

* every CE 4.3.1.3 catalog capability is implemented or explicitly verified as equivalent;
* Synqevra runs without ThingsBoard;
* API/device compatibility tests pass;
* tenant isolation and authorization tests pass;
* licensing and provenance are release-ready;
* CI and quality gates are enforced;
* operational requirements are met;
* public installation and upgrade documentation works;
* ThingsBoard is removed from the runtime architecture.

## 18. Main Risks

* CE 4.3.1.3 scope is substantially larger than the previous MVP description.
* Dashboard, widget, SCADA, Rule Engine, and protocol parity are high-complexity areas.
* Existing code is deeply coupled to ThingsBoard.
* Current timeline and staffing are not yet aligned with full CE parity.
* RLS, authorization, API compatibility, and device compatibility require systematic automated testing.
* Public release requires strong provenance and secret-remediation discipline.
* The platform may overfit to Healthcare unless core/domain boundaries remain enforced.
* Stage 2 discussions may distract from CE replacement.

## 19. Authoritative Resources

* [Synqevra GitHub Project](https://github.com/users/chas523/projects)
* [Current Synqevra GitHub repository](<https://github.com/chas523/synqevra>)
* [CE capability catalog — SYN-13](<https://linear.app/softteco-fd/issue/SYN-13/build-the-complete-thingsboard-community-edition-capability-parity>)
* [Headless dependency map — SYN-12](<https://linear.app/softteco-fd/issue/SYN-12/map-the-current-headless-thingsboard-ce-dependencies-and-full>)
* [Roadmap rebaseline — SYN-18](<https://linear.app/softteco-fd/issue/SYN-18/rebaseline-the-roadmap-for-full-thingsboard-ce-replacement-and>)
* [Professional strategy — SYN-19](<https://linear.app/softteco-fd/issue/SYN-19/define-the-synqevra-professional-edition-product-and-commercial>)