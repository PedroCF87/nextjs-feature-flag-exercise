# Story E1-S4 — Baseline measurement and closure

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S4 |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `agile-exercise-planner` |
| **Skills** | `execute-task-locally`, `record-friction-point`, `record-time-zero-snapshot`, `produce-epic-closure-report`, `produce-epic-handoff` |
| **Instructions** | `documentation.instructions.md`, `measurement-baseline.instructions.md` |
| **Depends on** | E1-S2, E1-S3 |
| **Blocks** | — |
| Created at | 2026-04-14 21:29:36 -03 |
| Last updated | 2026-04-15 21:11:16 -03 |

---

## 1) User story

**As a** candidate executing the workshop interview exercises,
**I want to** finalize the Baseline run by executing the full validation suite, completing the metrics document, writing the friction log, and closing Epic 1 with a handoff document,
**so that** the Baseline is fully signed off with objective evidence and Epic 2 (AI-assisted run) can begin with a reliable comparison baseline.

---

## 2) Scope

### In scope

1. Execute the full validation suite (server + client) and confirm all 11 TASK.md criteria pass.
2. Complete the baseline metrics document with all collected data (time elapsed, prompt count, rework cycles, confidence score).
3. Write the friction log with at least 3 meaningful observations from the Baseline run.
4. Commit all changes to the personal fork with conventional commit messages.
5. Write a brief summary comparing expected vs actual implementation effort.
6. Produce the Epic 1 closure report and handoff document for Epic 2.

### Out of scope

1. Epic 2 implementation (AI-assisted run — separate epic).
2. Applying structured AI-assisted validation workflows.
3. Stack migration to Gold Standard.

---

## 3) Acceptance criteria

### AC-1 — Full validation suite passes

- **Given** the complete filtering implementation is in place (E1-S2 + E1-S3)
- **When** `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint` is run
- **Then** all commands exit with code 0 and zero errors

### AC-2 — All 11 TASK.md criteria verified

- **Given** the filtering feature is implemented
- **When** the agent runs through the TASK.md acceptance criteria checklist
- **Then** all 11 criteria are marked as verified with evidence

### AC-3 — Baseline metrics document complete

- **Given** data was collected in real time during the implementation
- **When** the metrics document is finalized
- **Then** it contains: time-per-phase, total prompt count, rework cycle count, and self-reported confidence score

### AC-4 — Friction log has ≥ 3 observations

- **Given** friction points were experienced during the Baseline run
- **When** the friction log is finalized
- **Then** at least 3 meaningful friction points are recorded with context, impact, and classification

### AC-5 — Epic 1 closure report produced

- **Given** all stories (E1-S0 to E1-S3) are Done
- **When** the closure report is generated using `produce-epic-closure-report`
- **Then** the closure document exists at `docs/.agents/closure/epic1-closure-report.md` with DoD evidence for each story

### AC-6 — Epic 1 handoff document produced

- **Given** the closure report is complete
- **When** the handoff is generated using `produce-epic-handoff`
- **Then** the handoff document exists at `docs/.agents/closure/epic1-handoff.md` with readiness statement for Epic 2

---

## 4) Tasks

### ✅ [Task E1-S4-T1 — Run full validation suite and verify all 11 TASK.md criteria](../tasks/task-E1S4T1-run-full-validation-suite-and-verify-all-11-task-md-criteria.md)

**Goal:** execute the complete server and client validation suite and run through all 11 TASK.md acceptance criteria to confirm the filtering feature is complete.

**Agent:** `agile-exercise-planner` (local VS Code)

**Artifacts to create/modify:**
- Validation evidence section in `docs/.agents/closure/e1s4-baseline-report.md`

**Acceptance:** `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint` exits 0; all 11 TASK.md criteria are checked with evidence.

**depends_on:** E1-S2 and E1-S3 completed

---

### ✅ [Task E1-S4-T2 — Complete baseline metrics document and friction log](../tasks/task-E1S4T2-complete-baseline-metrics-document-and-friction-log.md)

**Goal:** fill in the baseline metrics document with all collected data (time, prompt count, rework cycles, confidence) and write the friction log with at least 3 meaningful observations.

**Agent:** `agile-exercise-planner` | **Skill:** `record-friction-point`, `record-time-zero-snapshot`

**Artifacts to create/modify:**
- `docs/.agents/baseline/epic1-baseline-metrics.md` — complete with all measurement fields
- `docs/.agents/baseline/epic1-friction-log.md` — at least 3 friction point entries

**Acceptance:** metrics document has time-per-phase, total prompt count, rework cycles, and confidence score; friction log has ≥ 3 entries with context, impact, and classification.

**depends_on:** E1-S4-T1

---

### [Task E1-S4-T3 — Produce Epic 1 closure report and handoff document](../tasks/task-E1S4T3-produce-epic-1-closure-report-and-handoff-document.md)

**Goal:** generate the Epic 1 closure report and Epic 2 handoff document using `produce-epic-closure-report` and `produce-epic-handoff` skills, then commit all changes.

**Agent:** `agile-exercise-planner` | **Skill:** `produce-epic-closure-report`, `produce-epic-handoff`

**Artifacts to create/modify:**
- `docs/.agents/closure/epic1-closure-report.md` — DoD evidence for all E1 stories
- `docs/.agents/closure/epic1-handoff.md` — readiness statement for Epic 2

**Acceptance:** closure report exists with DoD evidence for E1-S0 through E1-S3; handoff document has signed READY statement; `sync-backlog-index.js` exits 0; all changes committed to `exercise-1`.

**depends_on:** E1-S4-T2
