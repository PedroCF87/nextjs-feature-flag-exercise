# Story E2-S5 — Measurement, comparison, and closure

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S5 |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `agile-exercise-planner` |
| **Skills** | `produce-epic-closure-report`, `produce-epic-handoff`, `record-friction-point` |
| **Instructions** | `documentation.instructions.md`, `measurement-baseline.instructions.md` |
| **Depends on** | E2-S3, E2-S4 |
| **Blocks** | — |
| Created at | 2026-04-16 02:31:41 -03 |
| Last updated | 2026-04-16 02:38:40 -03 |

---

## 1) User story

**As an** engineer completing the AI-assisted exercise run,
**I want** a comprehensive comparative analysis of Exercise 1 vs Exercise 2,
**so that** the PIV Loop's impact on productivity, quality, and confidence can be quantitatively assessed for the workshop debrief.

---

## 2) Scope

### In scope

1. Execute full validation suite (server + client) and confirm all 11 TASK.md criteria pass.
2. Complete metrics document (`.agents/baseline/measurement-exercise2.md`) with all collected data (time, prompts, rework cycles, confidence on 1–5 scale).
3. Produce comparative analysis document — delta table (time, prompts, rework, confidence) with explanatory notes; include prep overhead as separate line item.
4. Write friction log with PIV Loop-specific observations, including all `[SYSTEM-EVOLUTION]` entries.
5. System Evolution retrospective: classify entries as Pattern A (Preventable) or Pattern B (Emergent); audit "3+ times = command" heuristic.
6. Create PR → `exercise-2` and confirm automated Claude reviews complete.
7. Produce EPIC-2 closure report.
8. Produce EPIC-3 handoff document.

### Out of scope

1. Feature flag implementation (already done in E2-S3 and E2-S4).
2. AI Layer creation (already done in E2-S1).
3. Repository configuration (already done in E2-S2).

---

## 3) Acceptance criteria

### AC-1 — Full validation suite passes on exercise-2

- **Given** all implementation is complete
- **When** server and client validation suites run
- **Then** zero errors; all 11 TASK.md acceptance criteria verified

### AC-2 — Metrics document complete

- **Given** data was collected during implementation
- **When** `.agents/baseline/measurement-exercise2.md` is finalized
- **Then** it contains: total time (prep + implementation broken out), prompt count, rework cycles, confidence score (1–5 scale)

### AC-3 — Comparative analysis produced

- **Given** Exercise 1 baseline metrics exist
- **When** the delta document is created
- **Then** it contains side-by-side comparison table (time, prompts, rework, confidence); prep overhead as separate line; explanatory notes for each metric

### AC-4 — Friction log with System Evolution entries

- **Given** friction points and system evolution actions were recorded during implementation
- **When** the friction log is finalized
- **Then** it contains PIV Loop-specific observations; all `[SYSTEM-EVOLUTION]` entries from Phase 3; each entry has impact classification

### AC-5 — System Evolution retrospective complete

- **Given** `[SYSTEM-EVOLUTION]` entries exist in the friction log
- **When** the retrospective is done
- **Then** each entry is classified as Pattern A (Preventable) or Pattern B (Emergent); "3+ times = command" audit is performed; root causes documented

### AC-6 — PR with automated Claude reviews

- **Given** Claude Code workflows are active
- **When** a PR is created
- **Then** at least `pr-review.yml` and `security-review.yml` produce review comments

### AC-7 — EPIC-2 closure report produced

- **Given** all DoD items are verified
- **When** the closure report is written
- **Then** it follows the standard 5-section closure template with evidence links

### AC-8 — EPIC-3 handoff document produced

- **Given** EPIC-2 is closed
- **When** the handoff document is written
- **Then** it contains branch state, AI Layer coverage, top 3 risks, and READY declaration

---

## 4) Tasks

### [Task E2-S5-T1 — Run full validation suite and verify all 11 criteria](../tasks/task-E2S5T1-run-full-validation-suite-and-verify-all-11-criteria.md)

**Description:** Execute the full validation suite on both server and client. Verify each of the 11 TASK.md acceptance criteria is met.

**Acceptance criteria:**
- **Given** implementation is complete on `exercise-2`
- **When** the validation commands run
- **Then** `pnpm run build && pnpm run lint && pnpm test` (server) and `pnpm run build && pnpm run lint` (client) pass with zero errors; all 11 TASK.md criteria verified

---

### [Task E2-S5-T2 — Complete metrics document](../tasks/task-E2S5T2-complete-metrics-document.md)

**Description:** Finalize `.agents/baseline/measurement-exercise2.md` with all data collected during the PIV Loop implementation. Break out prep time (E2-S1 + E2-S2) vs implementation time (E2-S3 + E2-S4).

**Acceptance criteria:**
- **Given** raw metrics were recorded during implementation
- **When** the document is finalized
- **Then** it contains total time, prep/implementation breakdown, prompt count, rework cycles, and confidence (1–5 scale)

---

### [Task E2-S5-T3 — Produce comparative analysis document](../tasks/task-E2S5T3-produce-comparative-analysis-document.md)

**Description:** Create a delta document comparing Exercise 1 (Baseline: 212 min, 25 prompts, 3 rework cycles, confidence 3→4→5) with Exercise 2 metrics. Include prep overhead as a separate line item.

**Acceptance criteria:**
- **Given** both exercise metrics are available
- **When** the comparison document is written
- **Then** it contains a side-by-side table, explanatory notes, and a total-cost analysis (prep + implementation)

---

### [Task E2-S5-T4 — Write friction log with System Evolution entries](../tasks/task-E2S5T4-write-friction-log-with-system-evolution-entries.md)

**Description:** Consolidate all friction points and `[SYSTEM-EVOLUTION]` entries recorded during the PIV Loop into a final friction log document.

**Acceptance criteria:**
- **Given** friction points were recorded during Phases 1–3
- **When** the friction log is finalized
- **Then** each entry has: timestamp, description, impact classification, resolution; all `[SYSTEM-EVOLUTION]` entries are present

---

### [Task E2-S5-T5 — System Evolution retrospective](../tasks/task-E2S5T5-system-evolution-retrospective.md)

**Description:** Review all `[SYSTEM-EVOLUTION]` entries. Classify each as Pattern A (Preventable) or Pattern B (Emergent). Audit the "3+ times = command" heuristic. Document root causes.

**Acceptance criteria:**
- **Given** the friction log is complete
- **When** the retrospective is performed
- **Then** each system evolution entry is classified; the "3+ times = command" audit identifies any missed extraction opportunities; all findings are documented

---

### [Task E2-S5-T6 — Create PR and verify automated reviews](../tasks/task-E2S5T6-create-pr-and-verify-automated-reviews.md)

**Description:** Create a PR from `exercise-2` and confirm that `pr-review.yml` and `security-review.yml` produce review comments.

**Acceptance criteria:**
- **Given** all implementation and documentation are committed on `exercise-2`
- **When** the PR is created
- **Then** Claude Code automated reviews trigger and produce comments

---

### [Task E2-S5-T7 — Produce EPIC-2 closure report](../tasks/task-E2S5T7-produce-epic-2-closure-report.md)

**Description:** Write the EPIC-2 closure report using the standard 5-section template. Include evidence links for all DoD items.

**Acceptance criteria:**
- **Given** all EPIC-2 DoD items are verified
- **When** the closure report is written
- **Then** it follows the 5-section template; every DoD item has an evidence link

---

### [Task E2-S5-T8 — Produce EPIC-3 handoff document](../tasks/task-E2S5T8-produce-epic-3-handoff-document.md)

**Description:** Write the EPIC-3 handoff document capturing branch state, AI Layer coverage, first story link, top 3 risks, and READY declaration.

**Acceptance criteria:**
- **Given** EPIC-2 is closed
- **When** the handoff is written
- **Then** it contains all 6 standard sections; READY declaration is signed

---
