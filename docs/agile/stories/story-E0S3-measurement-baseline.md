# Story E0-S3 — Definition of Measurement Baseline

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S3 |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Done |
| **Responsible agent** | `agile-exercise-planner` |
| **Supporting agents** | `environment-validator` (T3 — validation suite), `git-ops` (T3 — commit) |
| **Skills** | `create-exercise-backlog`, `file-timestamps`, `timeline-tracker`, `generate-measurement-template`, `record-time-zero-snapshot`, `validate-exercise-environment`, `validate-ai-layer-coverage` |
| **Instructions** | `agile-planning.instructions.md`, `timeline-tracking.instructions.md`, `measurement-baseline.instructions.md` |
| **Depends on** | [E0-S2 — Minimum AI Layer Configuration](story-E0S2-minimum-ai-layer.md) |
| **Blocks** | E0-S4, EPIC-1 |
| Created at | 2026-04-09 22:24:08 -03 |
| Last updated | 2026-04-11 16:44:05 -03 |

---

## 1) User story

**As a** candidate preparing for the workshop interview exercise,
**I want to** define and document a measurement baseline — capturing the method, dimensions, and capture template for time, prompts, rework, and confidence — before starting the implementation of Exercise 1,
**so that** I can quantify my actual productivity with AI during the Baseline execution and produce a meaningful comparison against the AI-assisted run in Exercise 2.

---

## 2) Scope

### In scope

1. Define the measurement dimensions for Exercise 1 (time, prompt count, rework cycles, and confidence level).
2. Create a capture template (markdown table or structured form) ready to fill in during implementation.
3. Document the capture method (when to record, what counts as a prompt, what counts as rework, how confidence is self-assessed).
4. Record the pre-implementation state of the codebase and environment as the "time zero" reference point.
5. Verify that all environment prerequisites from E0-S1 and E0-S2 are confirmed before locking the baseline.
6. Produce the signed go/no-go checklist for EPIC-1 start.

### Out of scope

1. Actual implementation of the filtering task (belongs to EPIC-1).
2. Measurement collection itself — this story only defines the template and method; collection happens during EPIC-1 execution.
3. Automated measurement instrumentation (no tooling for prompt counting — manual capture only at this stage).
4. Comparison analysis against Exercise 2 (belongs to a later story after both exercises complete).

---

## 3) Acceptance criteria

### AC-1 — Measurement dimensions defined

- **Given** the Exercise 1 task requires tracking productivity with AI
- **When** I define the measurement dimensions
- **Then** the baseline document contains definitions for all 4 dimensions:
  - **Time:** elapsed wall-clock time from first code change to `pnpm test` all green; measured with start/end timestamps.
  - **Prompt count:** total number of distinct AI prompts sent during implementation (including follow-ups and corrections); counted manually.
  - **Rework cycles:** number of times a previously passing check (build/lint/test) is broken and must be fixed; a rework cycle = one regression + fix.
  - **Confidence level:** self-assessed 1–5 scale at three checkpoints (pre-implementation, mid-implementation, post-validation).

### AC-2 — Capture template produced

- **Given** the measurement dimensions are defined
- **When** I create the capture template
- **Then** a markdown template file exists at `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` containing:
  - A metadata header (date, exercise, executor, environment state — branch, last commit SHA, Node.js version, pnpm version).
  - A pre-implementation state table (all validation commands with current pass/fail status and output snippet).
  - A capture table for time (start timestamp, end timestamp, elapsed minutes).
  - A capture table for prompt count (tally per phase: Plan / Implement / Validate).
  - A capture table for rework (regression description, affected command, time to fix).
  - A confidence self-assessment table (checkpoint, score 1–5, justification).
  - A friction log section (free-form notes during implementation).

### AC-3 — Capture method documented

- **Given** the capture template exists
- **When** I document the capture method
- **Then** the baseline document contains a "How to use this template" section that specifies:
  - **Start signal:** clock starts when the first file is opened for editing with intent to implement.
  - **End signal:** clock stops when `cd server && pnpm test` and `cd client && pnpm run build` both exit 0 on the implementation branch.
  - **Prompt boundary:** a new prompt = any new message sent to the AI (not a continuation of the same session turn); self-corrections within the same response do not count.
  - **Rework boundary:** a rework cycle begins when a previously green check exits non-zero and ends when it returns to green; multiple simultaneous broken checks count as one cycle if fixed together.
  - **Confidence scale:** 1 = "no idea where to start", 3 = "clear direction but uncertain about edge cases", 5 = "execution is mechanical, no surprises expected".

### AC-4 — Time zero snapshot recorded

- **Given** the environment is configured (E0-S1 + E0-S2 complete)
- **When** I record the pre-implementation state
- **Then** the baseline document's pre-implementation table contains:
  - Current branch and last commit SHA of `exercise-1`.
  - Output of `node --version` and `pnpm --version`.
  - Pass/fail status of all 7 validation commands (server: build, lint, test; client: build, lint; + shared type check if applicable).
  - AI Layer artifacts confirmed present: `copilot-instructions.md`, both instruction files, 3 agent files, 4 skill directories, `copilot-setup-steps.yml`.

### AC-5 — Go/no-go checklist for EPIC-1 signed

- **Given** E0-S1, E0-S2, and E0-S3 are complete
- **When** I sign the readiness checklist
- **Then** the baseline document contains a signed go/no-go section where **all** items below are ✅:
  - [ ] Fork created, cloned, remotes configured (`origin` + `upstream`).
  - [ ] `exercise-1` confirmed as working base branch.
  - [ ] All 7 validation commands pass on `exercise-1`.
  - [ ] Codebase audit completed (E0-S1 evidence).
  - [ ] AI Layer minimum baseline deployed to fork (E0-S2 evidence).
  - [ ] `copilot-setup-steps.yml` dry-run successful (run ID documented).
  - [ ] Measurement capture template filled to "time zero" state.
  - [ ] Capture method understood and documented.
  - [ ] No critical blockers open.

---

## 4) Tasks

### ✅ [Task E0-S3-T0 — Bootstrap AI Layer artifacts for this story](../tasks/task-E0S3T0-bootstrap-ai-layer-artifacts-for-this-story.md)

**Goal:** verify and register the four AI Layer artifacts required to execute T2 and T3 of this story.

**Context:** T2 delegates to `generate-measurement-template` to produce the 9-section template; T3 delegates to `record-time-zero-snapshot` to fill it and sign the go/no-go checklist. Both skills use `elapsed-time.js` for elapsed-time computation. `measurement-baseline.instructions.md` enforces always-on behavioral rules across T2 and T3. All four artifacts were created by the `agile-exercise-planner` agent during E0-S3 story authoring.

**Agents:** `agile-exercise-planner` (bootstrap), `environment-validator` (T3 — validation suite), `git-ops` (T3 — commit)

**Artifacts:**

| Artifact | Path | Used in | Purpose |
|---|---|---|---|
| Function | `Docs/.github/functions/elapsed-time.js` | T3 (via `record-time-zero-snapshot`) | Computes elapsed minutes between two `datetime.js` timestamps — used in the Time Capture section of the baseline template |
| Skill | `Docs/.github/skills/generate-measurement-template/SKILL.md` | T2 | Generates the complete 9-section baseline capture template, parameterized by exercise name, fork root, and validation commands |
| Skill | `Docs/.github/skills/record-time-zero-snapshot/SKILL.md` | T3 | 6-phase time-zero capture: confirm prerequisites → run validation suite → verify AI Layer files → fill template → sign go/no-go → commit |
| Instruction | `Docs/.github/instructions/measurement-baseline.instructions.md` | T2, T3 | Always-on behavioral rules: timestamp format, prompt/rework boundary, elapsed-time calculation, confidence scale anchors, go/no-go signing, commit rules |

**Sub-tasks:**

1. Confirm all 4 files exist at the paths listed above.
2. Add `generate-measurement-template` and `record-time-zero-snapshot` to `Docs/ai-development-environment-catalog.md` §3 (Skills) with phase `E0-S3`.
3. Add `elapsed-time.js` to the shared functions table in `Docs/.github/copilot-instructions.md`.
4. Add E0-S3 row to the coverage map in `Docs/ai-development-environment-catalog.md` §4.
5. Append one timeline entry per artifact created.

**Acceptance:** all 4 files exist and are readable; catalog §3 contains both new skills; `elapsed-time.js` appears in the shared functions table; catalog §4 contains the E0-S3 coverage row.

**depends_on:** E0-S2 completed.

---

### ✅ [Task E0-S3-T1 — Define measurement dimensions and capture method](../tasks/task-E0S3T1-define-measurement-dimensions-and-capture-method.md)

**Goal:** produce the definition of what to measure and how, as the first section of the baseline document.

**Agent:** `agile-exercise-planner` | **Skill:** `create-exercise-backlog` (use structured decomposition to identify dimensions and method boundaries)

**Sub-tasks:**

1. Read the Exercise 1 task description (`nextjs-feature-flag-exercise/TASK.md`) and the exercise overview (`Docs/manuals/interview-4-exercises-overview.md §Exercício 1`) to understand what constitutes "implementation effort."
2. Draft 4 measurement dimensions (time, prompt count, rework cycles, confidence) with precise definitions:
   - for each dimension: what it measures, how it is captured, and what events mark its boundaries.
3. Define the confidence scale (1–5) with anchor descriptions at levels 1, 3, and 5.
4. Define the three confidence checkpoints: **pre-implementation** (before first code change), **mid-implementation** (after server-side logic is working), **post-validation** (after all checks pass).
5. Write the "How to use this template" section documenting start/end signals, prompt boundary, and rework boundary as defined in AC-3.
6. Record the output of steps 2–5 in a structured document or in working memory for use by T2 when generating the template file.

**Acceptance:** all 4 dimensions defined with boundary rules; confidence scale and checkpoints defined; capture method written and unambiguous.

**depends_on:** E0-S2 completed (AI Layer active in fork).

---

### ✅ [Task E0-S3-T2 — Create measurement capture template](../tasks/task-E0S3T2-create-measurement-capture-template.md)

**Goal:** produce the structured markdown template file at `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md`.

**Agent:** `agile-exercise-planner` | **Skills:** `generate-measurement-template` (primary — generates the 9-section template), `file-timestamps` (secondary — sets accurate `Created at` metadata in the produced file)

**Sub-tasks:**

1. Create directory `nextjs-feature-flag-exercise/.agents/baseline/` if it does not exist.
2. Create `measurement-baseline.md` with the following sections in order:
   - **Metadata header:** document date, exercise name, executor name, repository, branch, last commit SHA (placeholder — filled in T3), tool versions (placeholder).
   - **How to use this template** (from T1).
   - **Pre-implementation state** (table — filled in T3).
   - **Measurement dimensions** (definitions from T1 — included for reference while capturing).
   - **Time capture table** (start timestamp, end timestamp, elapsed minutes — placeholders).
   - **Prompt count tally** (three-column table: Phase | Prompt count | Notes).
   - **Rework log** (four-column table: # | Regression description | Affected command | Time to fix).
   - **Confidence self-assessment** (three-row table: pre-implementation | mid-implementation | post-validation; columns: checkpoint, score 1–5, justification).
   - **Friction log** (free-form section with sub-headings per implementation phase).
   - **Go/no-go checklist** (from AC-5 — filled in T3).
3. Commit and push the template file: `git commit -m "chore(baseline): add measurement baseline template"`.

**Acceptance:** template file exists at the correct path; all 9 sections present; all placeholders clearly marked with `[FILL IN]` or similar; no actual measurement data populated (this is a template).

**depends_on:** T1

---

### ✅ [Task E0-S3-T3 — Record time-zero snapshot and sign go/no-go checklist](../tasks/task-E0S3T3-record-time-zero-snapshot-and-sign-go-no-go-checklist.md)

**Goal:** fill in the pre-implementation snapshot (AC-4) and sign the go/no-go checklist (AC-5) in the template.

**Agent:** `agile-exercise-planner` | **Skills:** `record-time-zero-snapshot` (primary — orchestrates all 6 capture phases), `validate-exercise-environment` (phase 2 — runs and records the 7 validation commands), `validate-ai-layer-coverage` (phase 3 — verifies AI Layer file presence in fork)

**Sub-tasks:**

1. Confirm E0-S1 and E0-S2 are in **Done** state (check story status fields).
2. Run the 7 validation commands on `exercise-1` and record output in the pre-implementation state table:
   ```bash
   # Server
   cd server && pnpm run build
   cd server && pnpm run lint
   cd server && pnpm test
   # Client
   cd client && pnpm run build
   cd client && pnpm run lint
   # Versions
   node --version
   pnpm --version
   ```
3. Record `git log --oneline -1` on `exercise-1` to get branch name and last commit SHA.
4. Verify AI Layer file presence in fork:
   - `nextjs-feature-flag-exercise/.github/copilot-instructions.md`
   - `nextjs-feature-flag-exercise/.github/instructions/` (2 files)
   - `nextjs-feature-flag-exercise/.github/agents/` (3 files)
   - `nextjs-feature-flag-exercise/.github/skills/` (4 directories)
   - `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml`
5. Fill in all `[FILL IN]` placeholders in the metadata header and pre-implementation state table.
6. Go through the go/no-go checklist from AC-5 and mark each item ✅ or ❌ with evidence reference.
7. If all 9 items are ✅: sign the checklist with the current timestamp and the statement: `**READY — Exercise 1 may begin.**`
8. If any item is ❌: record the blocking gap, update the corresponding E0-S1 or E0-S2 story status, and do **not** sign until resolved.
9. Commit the completed baseline document to the fork:
   ```
   chore(baseline): record measurement baseline and sign EPIC-1 go/no-go checklist
   ```

**Acceptance:** pre-implementation table filled with real outputs (not placeholders); all 9 go/no-go items checked; checklist signed with timestamp; commit exists on fork branch derived from `exercise-1`.

**depends_on:** T2, E0-S1 Done, E0-S2 Done

---

## 5) Dependencies

| Type | Item |
|---|---|
| **Input** | E0-S1 completed — fork, remotes, codebase audit, validation suite passing |
| **Input** | E0-S2 completed — AI Layer deployed to fork, `copilot-setup-steps.yml` dry-run successful |
| **Input** | `nextjs-feature-flag-exercise/TASK.md` — exercise task and acceptance criteria |
| **Input** | `Docs/manuals/interview-4-exercises-overview.md §Exercício 1` — what to measure and compare |
| **Blocks** | E0-S4 — Preparation closure and handoff (requires signed go/no-go checklist from this story) |
| **Blocks** | EPIC-1 — Baseline implementation (requires capture template filled to time zero) |

---

## 6) Definition of Done

This story is done when **all** of the following are true:

- [ ] Measurement dimensions defined: time, prompt count, rework cycles, confidence — each with unambiguous boundary rules.
- [ ] Confidence scale defined (1–5) with anchors at 1, 3, and 5; three capture checkpoints identified.
- [ ] Capture method documented: start signal, end signal, prompt boundary, rework boundary.
- [ ] `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` exists with all 9 template sections.
- [ ] Pre-implementation state table filled with real command outputs (not placeholders).
- [ ] Tool versions recorded (`node --version`, `pnpm --version`).
- [ ] Branch and last commit SHA recorded from `exercise-1`.
- [ ] AI Layer file presence verified and recorded in the snapshot.
- [ ] Go/no-go checklist (9 items) signed with timestamp and `READY` declaration.
- [ ] Baseline document committed to fork with message `chore(baseline): record measurement baseline and sign EPIC-1 go/no-go checklist`.
- [ ] No ❌ items in the go/no-go checklist at the time of signing.

---

## 7) Key file reference

| Purpose | Path |
|---|---|
| Output — Baseline capture template | `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` |
| Input — Exercise task | `nextjs-feature-flag-exercise/TASK.md` |
| Input — Exercise overview manual | `Docs/manuals/interview-4-exercises-overview.md` |
| Input — Environment catalog | `Docs/ai-development-environment-catalog.md` |
| Input — E0-S1 evidence | `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` |
| Input — E0-S2 evidence | `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` |
| Prerequisite — AI Layer global rules | `nextjs-feature-flag-exercise/.github/copilot-instructions.md` |
| Prerequisite — Setup workflow | `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` |

---

## 8) References

- [nextjs-feature-flag-exercise/TASK.md](../../../nextjs-feature-flag-exercise/TASK.md)
- [Docs/manuals/interview-4-exercises-overview.md](../../manuals/interview-4-exercises-overview.md)
- [Docs/agile/stories/story-E0S1-repository-diagnosis.md](story-E0S1-repository-diagnosis.md)
- [Docs/agile/stories/story-E0S2-minimum-ai-layer.md](story-E0S2-minimum-ai-layer.md)
- [Docs/epics/Epic 0 — Environment Preparation for Exercise 1.md](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md)
- [Docs/ai-development-environment-catalog.md](../../ai-development-environment-catalog.md)
