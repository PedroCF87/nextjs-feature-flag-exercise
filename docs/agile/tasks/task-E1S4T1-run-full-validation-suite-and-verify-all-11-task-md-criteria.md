# Task E1-S4-T1 — Run full validation suite and verify all 11 TASK.md criteria

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S4-T1 |
| **Story** | [E1-S4 — Baseline measurement and closure](../stories/story-E1S4-baseline-measurement-and-closure.md) |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `agile-exercise-planner` |
| **Depends on** | E1-S2, E1-S3 |
| **Blocks** | — |
| Created at | 2026-04-14 22:21:45 -03 |
| Last updated | 2026-04-14 22:21:45 -03 |

---

## 1) Task statement

As an `agile-exercise-planner`, I want to run the full server and client validation suite and verify all 11 TASK.md acceptance criteria so that the Baseline implementation is confirmed complete before metrics are captured.

---

## 2) Verifiable expected outcome

- `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint` exits 0.
- `docs/.agents/closure/e1s4-baseline-report.md` exists with all 11 TASK.md criteria verified with evidence.

---

## 3) Detailed execution plan

**Goal:** execute the complete server and client validation suite and run through all 11 TASK.md acceptance criteria to confirm the filtering feature is complete.

**Agent:** `agile-exercise-planner` | **Skill:** `execute-task-from-issue`

**Artifacts to create/modify:**
- Validation evidence section in `docs/.agents/closure/e1s4-baseline-report.md`

**Acceptance:** `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint` exits 0; all 11 TASK.md criteria are checked with evidence.

**depends_on:** E1-S2, E1-S3

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

- **Given** E1-S2 and E1-S3 are completed,
- **When** the full validation suite is run,
- **Then** all commands exit code 0 with zero errors; the baseline report lists all 11 criteria as verified with command output evidence.

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
