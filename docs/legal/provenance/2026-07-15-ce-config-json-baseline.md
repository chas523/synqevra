# Provenance record: ThingsBoard CE configuration JSON (baseline)

| Field | Value |
|-------|--------|
| Date | 2026-07-15 |
| Author | SYN-7 audit |
| Reviewer | Pending engineering confirmation |
| Related issue/PR | SYN-7 |

## Upstream

| Field | Value |
|-------|--------|
| Project | ThingsBoard Community Edition (runtime export; not a direct git path copy) |
| Repository URL | https://github.com/thingsboard/thingsboard (product origin) |
| Version / tag | Project target CE **4.3.1.3** (export commit not recovered from Git history) |
| Commit SHA | **Unknown** — exports predate provenance policy; treat as CE **configuration/data**, not source import |
| Upstream path(s) | N/A (UI/API export of rule chains / dashboard) |
| License at revision | Apache-2.0 (ThingsBoard CE) |
| Upstream copyright notice | Copyright of ThingsBoard authors / ThingsBoard, Inc. as applicable to CE |

## Local placement

| Field | Value |
|-------|--------|
| Destination path(s) | `apps/backend/src/thingsboard/base_rule_chain.json`, `telemetry_emulator_nobase.json`, `hospital_room_monitoring.json` |
| File type | configuration / data (JSON exports) |

## Modifications

Unknown historical edits after export. Files are used as seed/demo configuration
for SoftTeco integration work (hospital monitoring demo dashboard, rule chains).

## Classification

- [ ] Original Synqevra (not CE-derived)
- [ ] CE-derived (attributable source)
- [x] Configuration/data export from CE
- [ ] Prohibited / unknown — **do not merge**

## CE vs PE confirmation

Classified as CE configuration/data based on:

- system widget FQNs (`system.cards.*`) typical of CE
- absence of PE source trees or PE license headers
- project policy: runtime is ThingsBoard CE 4.3.1.3

Reviewer: _______________ Date: _______________

## NOTICE / attribution actions

- [x] `NOTICE` notes CE configuration/data handling
- [ ] File headers / SPDX updated if required
- [x] If these files are rewritten as native Synqevra config, reclassify and drop CE attribution need

## Follow-up

Prefer replacing demo JSON with native Synqevra fixtures when CE independence
is achieved, or re-export from a pinned CE 4.3.1.3 instance and update this
record with exact export provenance.
