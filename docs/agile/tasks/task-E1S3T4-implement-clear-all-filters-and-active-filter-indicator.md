# Task E1-S3-T4 — Implement clear-all-filters and active-filter indicator

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S3-T4 |
| **Story** | [E1-S3 — Client-side filtering UI implementation](../stories/story-E1S3-client-side-filtering-ui-implementation.md) |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `task-implementer` |
| **Depends on** | E1-S3-T3 |
| **Blocks** | — |
| Created at | 2026-04-14 22:21:41 -03 |
| Last updated | 2026-04-14 22:21:41 -03 |

---

## 1) Task statement

As a `task-implementer`, I want to add a 'clear all filters' button and an active-filter indicator to the UI so that users can reset filters and see at a glance when filters are applied.

---

## 2) Verifiable expected outcome

- A 'clear all filters' button resets all filter fields to empty.
- An active-filter indicator (badge or label) is visible when any filter is active and hidden when no filters are set.
- `pnpm run build && pnpm run lint` exit 0.

---

## 3) Detailed execution plan

**Goal:** add a "clear all filters" button that resets all filter fields, and an active-filter indicator (badge or label) that shows when at least one filter is active.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `client/src/App.tsx` or filter controls component — add clear button and active indicator

**Acceptance:** clear button resets all fields and refetches without filters; indicator is visible when any filter is active and hidden when no filters are active; `pnpm run build && pnpm run lint` exit 0.

**depends_on:** E1-S3-T3

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed:
- Exit code(s):
- Output summary:
- Files created/updated:
- Risks found / mitigations:

### Given / When / Then checks

- **Given** one or more filters are active,
- **When** the user clicks 'clear all filters',
- **Then** all filter fields reset to empty, the indicator disappears, and the full unfiltered list is fetched; given no filters are active, the indicator is not visible.

---

## 6) Definition of Done

- [ ] Expected outcome is objectively verifiable.
- [ ] Dependencies are explicit and valid.
- [ ] Security and architecture checks were performed.
- [ ] Validation evidence is attached.
- [ ] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved:
- Downstream items unblocked:
- Open risks (if any):
