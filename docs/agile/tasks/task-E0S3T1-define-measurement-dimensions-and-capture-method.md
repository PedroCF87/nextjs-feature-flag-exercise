# Task E0-S3-T1 — Define measurement dimensions and capture method

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S3-T1 |
| **Story** | [E0-S3 — Definition of Measurement Baseline](../stories/story-E0S3-measurement-baseline.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Done |
| **Responsible agent** | `agile-exercise-planner` |
| **Depends on** | [E0-S2 — Minimum AI Layer Configuration](../stories/story-E0S2-minimum-ai-layer.md), [E0-S3-T0 — Bootstrap AI Layer artifacts for this story](task-E0S3T0-bootstrap-ai-layer-artifacts-for-this-story.md) |
| **Blocks** | E0-S3-T2, E0-S3-T3 |
| Created at | 2026-04-11 16:43:15 -03 |
| Last updated | 2026-04-14 20:15:00 -03 |

---

## 1) Task statement

Define the measurement model and capture method for Exercise 1, producing an unambiguous definition package that T2 will embed into `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md`.

This task defines *what to measure* and *how to measure* before any baseline implementation work starts.

> **Execution context:** T1 runs as a cloud agent via GitHub Issue in the exercise fork. `REPO_ROOT` is derived from `git rev-parse --show-toplevel` at runtime. Hard dependency: E0-S3-T0 must be complete before T1 starts. The definition package in §5 is pre-authored during story authoring; T1 reads source inputs to validate correctness and then commits the confirmed task file via a feature branch PR so T2 can verify T1 was executed.

---

## 2) Verifiable expected outcome

1. The 4 measurement dimensions are fully defined with boundaries:
   - Time
   - Prompt count
   - Rework cycles
   - Confidence level
2. Confidence scale anchors are defined for levels 1, 3, and 5.
3. Three confidence checkpoints are defined:
   - pre-implementation
   - mid-implementation
   - post-validation
4. A complete "How to use this template" method is authored with:
   - start signal
   - end signal
   - prompt boundary
   - rework boundary
5. A ready-to-copy "Definition package" block exists in this task file and is marked as input for T2.

---

## 3) Detailed execution plan

**Goal:** produce the definition of what to measure and how, as the first section of the baseline document.

**Agent:** `agile-exercise-planner` | **Skill:** `create-exercise-backlog` (use structured decomposition to identify dimensions and method boundaries)

### Step 0 - Confirm hard dependencies

Before starting, confirm:

1. E0-S2 is available as upstream dependency.
2. E0-S3-T0 has validated baseline AI artifacts.

Stop condition: no unresolved blocker from E0-S2 or E0-S3-T0.

### Step 1 - Read source inputs

Read and extract constraints from:

- `nextjs-feature-flag-exercise/TASK.md`
- `docs/manuals/interview-4-exercises-overview.md`

Capture what counts as implementation effort and validation completion.

### Step 2 - Define the 4 dimensions with boundaries

Produce explicit definitions:

1. **Time**
   - Start: first code change with implementation intent.
   - End: server `pnpm test` and client `pnpm run build` both exit `0`.
2. **Prompt count**
   - Count one prompt per new user message sent to AI.
   - Do not count model self-corrections in the same response.
3. **Rework cycles**
   - Starts when a previously green check becomes non-zero.
   - Ends when all affected checks return to green.
   - Simultaneous breakages fixed together count as one cycle.
4. **Confidence level**
   - Scale 1-5 with anchored interpretation.

### Step 3 - Define confidence model

Set anchors:

- **1:** no idea where to start
- **3:** clear direction, uncertain edge cases
- **5:** execution is mechanical, no surprises expected

Set checkpoints:

- pre-implementation
- mid-implementation
- post-validation

### Step 4 - Author the "How to use this template" method

Write a deterministic method block containing:

- start signal
- end signal
- prompt boundary
- rework boundary
- confidence checkpoint cadence

### Step 5 - Record the T2 input package in this task file

Add a section in Validation Evidence named **Definition package for T2** containing:

1. finalized dimension definitions
2. confidence anchors and checkpoints
3. finalized "How to use this template" text

This block is the source text that T2 will copy into the baseline template file.

### Step 6 - Commit definition package confirmation and open PR

Update task metadata status (`Draft` → `In Progress`). Then commit the confirmed task file via a feature branch:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
git checkout -b exercise-1/define-measurement-dimensions
git add docs/agile/tasks/task-E0S3T1-define-measurement-dimensions-and-capture-method.md
git status  # confirm only this file is staged
git commit -m "docs(baseline): confirm measurement dimensions definition package"
git push origin exercise-1/define-measurement-dimensions
```

Open a Pull Request against `exercise-1` with title: `docs(baseline): confirm measurement dimensions definition package`.

> **Stop condition:** PR merged into `exercise-1` before E0-S3-T2 starts.

## 4) Architecture and security requirements

- Scope is documentation and measurement-method definition only; do not modify implementation code.
- Keep definitions repository-agnostic to avoid leaking stack-specific assumptions into measurement rules.
- Never include secret values, tokens, or personal credentials in examples.
- Ensure each boundary rule is testable by a different agent (no implicit interpretation).
- If any rule remains ambiguous, refine it in this task before unblocking T2.

---

## 5) Validation evidence

### Commands

1. Input existence check:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
ls -la "$REPO_ROOT/TASK.md"
ls -la "$REPO_ROOT/docs/manuals/interview-4-exercises-overview.md"
```

Expected: both commands exit `0`.

**Result: PASS** — `TASK.md` (1 783 B, Apr 8) and `interview-4-exercises-overview.md` (5 216 B, Apr 9) both exist. Exit 0.

2. Definition presence checks in this task file:

```bash
grep -n "Time\|Prompt count\|Rework cycles\|Confidence level" \
   "$REPO_ROOT/docs/agile/tasks/task-E0S3T1-define-measurement-dimensions-and-capture-method.md"
grep -n "How to use this template\|start signal\|end signal\|prompt boundary\|rework boundary" \
   "$REPO_ROOT/docs/agile/tasks/task-E0S3T1-define-measurement-dimensions-and-capture-method.md"
```

Expected: definitions and method boundaries present.

**Result: PASS** — all 4 dimensions found (lines 33–36, 79–89, 185–188). All method boundaries found (lines 42–46, 106–113, 173, 202–223). Exit 0.

### Definition package for T2

The block below must be copied into `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` during T2.

**Measurement dimensions**

- **Time:** elapsed wall-clock time from first implementation code change to green validation state (`server/pnpm test` and `client/pnpm run build` exit `0`).
- **Prompt count:** total number of distinct AI prompts sent by the user; follow-up prompts count, same-response self-corrections do not.
- **Rework cycles:** one cycle begins when a previously green check breaks and ends when it returns to green; simultaneous broken checks fixed together count as one cycle.
- **Confidence level:** self-assessed 1-5 score at three checkpoints.

**Confidence anchors**

- **1:** no idea where to start
- **3:** clear direction, uncertain edge cases
- **5:** execution is mechanical, no surprises expected

**Confidence checkpoints**

- pre-implementation
- mid-implementation
- post-validation

**How to use this template**

- **Start signal:** clock starts when the first file is edited with implementation intent.
- **End signal:** clock stops when `cd server && pnpm test` and `cd client && pnpm run build` both exit `0` on the working branch.
- **Prompt boundary:** a new prompt is any new user message sent to AI; continuations inside one model response do not count.
- **Rework boundary:** cycle starts when a previously green check turns non-zero and ends when the check(s) return to green.
- **Confidence capture cadence:** capture at pre-implementation, mid-implementation, and post-validation.

### Given / When / Then checks

- **Given** E0-S2 and E0-S3-T0 are available and both source inputs are readable,
- **When** the definition package is authored with the 4 dimensions, confidence anchors/checkpoints, and full method boundaries,
- **Then** T2 can copy the package without reinterpretation and produce the baseline template with no ambiguity.

---

## 6) Definition of Done

- [x] Source inputs (`TASK.md` and interview overview manual) were read and validated.
- [x] All 4 measurement dimensions include explicit start/end boundaries.
- [x] Confidence anchors (1, 3, 5) and 3 checkpoints are defined.
- [x] "How to use this template" boundaries are complete and deterministic.
- [x] Definition package for T2 is present in section 5 and ready to copy.
- [x] Committed directly to `exercise-1` (Epic 0 rule — no PR required).
- [x] E0-S3-T2 and E0-S3-T3 are unblocked by this definition set.
