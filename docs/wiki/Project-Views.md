# Synqevra — GitHub Project Views

The canonical planning board is the GitHub Project **synqevra**. Issues are auto-added from `chas523/synqevra`.

Until custom project fields and labels are added, views use GitHub milestone, status, assignee, repository, and the mandatory title prefix.

## Recommended views

| Order | View | Filter | Layout / grouping |
|---:|---|---|---|
| 00 | My active work | `assignee:@me is:open` | Board grouped by Status |
| 01 | Ready to start | `is:open status:Todo -title:"[EPIC]" -title:"[FEATURE]"` | Table grouped by Milestone |
| 02 | In progress | `is:open status:"In Progress"` | Board grouped by Assignee |
| 03 | Blocked | `is:open label:blocked` | Table grouped by Milestone |
| 10 | Phase 0 decisions | `milestone:"Phase 0 — Discovery and Architecture" is:open` | Table grouped by Status |
| 20 | Phase 1 Backend | `milestone:"Phase 1 — Entity Registry and Core Domain Model" title:"[BACKEND]" is:open` | Table grouped by Status |
| 21 | Phase 1 Web | `milestone:"Phase 1 — Entity Registry and Core Domain Model" title:"[WEB]" is:open` | Table grouped by Status |
| 22 | Phase 1 Quality and Operations | `milestone:"Phase 1 — Entity Registry and Core Domain Model" is:open` plus `[QA]` / `[DEVOPS]` title filtering | Table grouped by Status |
| 30 | Epics and Features | `is:open` plus `[EPIC]` / `[FEATURE]` title filtering | Roadmap or table grouped by Milestone |
| 40 | Security and Compliance | `is:open` plus `[SECURITY]` / `[LEGAL]` title filtering | Table grouped by Milestone |

> GitHub Project filter syntax should be selected from the UI suggestions when a quoted milestone/title filter is entered. If title-prefix matching is inconvenient, create matching labels and switch these filters to `label:`.

## Fields to add

- **Priority**: Urgent, High, Medium, Low.
- **Estimate**: number.
- **Work Type**: EPIC, FEATURE, WEB, BACKEND, ARCH, RESEARCH, DEVOPS, QA, DOCS, SECURITY, LEGAL, PRODUCT.
- **Linear ID**: text, retained temporarily for migration traceability.
- **Target date**: date, when roadmap dates are evidence-backed.

## Maintenance rules

- Every issue title starts with exactly one work-type prefix.
- `[EPIC]` and `[FEATURE]` are containers and do not receive implementation estimates.
- Cross-stack work is split into separate `[BACKEND]` and `[WEB]` issues.
- Keep WIP deliberately small while only one developer is active.
- Use merge commits for pull requests into `main`.
- Review views whenever milestones, fields, or workflow statuses change.
