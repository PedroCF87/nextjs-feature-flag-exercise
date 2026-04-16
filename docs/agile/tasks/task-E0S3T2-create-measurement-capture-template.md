# Task E0-S3-T2 — Create measurement capture template

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S3-T2 |
| **Story** | [E0-S3 — Definition of Measurement Baseline](../stories/story-E0S3-measurement-baseline.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Done |
| **Responsible agent** | `agile-exercise-planner` |
| **Depends on** | [E0-S3-T1 — Define measurement dimensions and capture method](task-E0S3T1-define-measurement-dimensions-and-capture-method.md), [E0-S3-T0 — Bootstrap AI Layer artifacts for this story](task-E0S3T0-bootstrap-ai-layer-artifacts-for-this-story.md) |
| **Blocks** | E0-S3-T3 |
| Created at | 2026-04-11 16:43:15 -03 |
| Last updated | 2026-04-14 19:50:00 -03 |

---

## 1) Task statement

Generate the baseline capture template file at `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md`, using the E0-S3-T1 definition package as source of truth and producing a ready-to-fill artifact for T3 (time-zero snapshot).

> **Execution context:** T2 runs **locally in VS Code** under the Epic 0 local execution rule — no GitHub Issue, no PR, no feature branch. All commits go directly to `exercise-1`. `REPO_ROOT` is derived from `git rev-parse --show-toplevel` at runtime. Hard dependency: E0-S3-T1 must be complete on `exercise-1` before T2 starts.

---

## 2) Verifiable expected outcome

1. Directory `nextjs-feature-flag-exercise/.agents/baseline/` exists.
2. File `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` exists.
3. Template includes the required structure for E0-S3 AC-2:
   - metadata header
   - how-to-use block
   - pre-implementation state table
   - measurement dimensions reference
   - time capture table
   - prompt count tally
   - rework log
   - confidence self-assessment
   - friction log
   - go/no-go checklist
4. Placeholders are present (`[FILL IN]`) and no real measurement values are pre-populated.
5. `Created at` in the template header is derived from filesystem birthtime using `file-stats.js`.

---

## 3) Detailed execution plan

**Goal:** produce the structured markdown template file at `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md`.

**Agent:** `agile-exercise-planner` | **Skills:** `generate-measurement-template` (primary — generates the 9-section template), `file-timestamps` (secondary — sets accurate `Created at` metadata in the produced file)

### Step 0 - Confirm hard dependencies

Before creating the template, confirm:

1. E0-S3-T0 verification task completed.
2. E0-S3-T1 definition package is present in section 5 of `task-E0S3T1-define-measurement-dimensions-and-capture-method.md`.
3. Required skill/instruction files exist:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
   "$REPO_ROOT/docs" \
   ".github/skills/generate-measurement-template/SKILL.md" \
   ".github/skills/file-timestamps/SKILL.md" \
   ".github/instructions/measurement-baseline.instructions.md"
```

Stop condition: all checks green.

### Step 1 - Create target directory

Ensure `nextjs-feature-flag-exercise/.agents/baseline/` exists.

### Step 2 - Generate the baseline template body

Use `generate-measurement-template` to produce `measurement-baseline.md` using exercise parameters and default command list.

### Step 3 - Enforce AC-2 structure alignment

Because AC-2 requires a **Friction log** block explicitly, verify it exists after generation.

- If present: keep as-is.
- If missing: append a `## Friction Log` section before the go/no-go checklist with `[FILL IN]` placeholders.

### Step 4 - Inject T1 definition package

Copy the finalized definitions from E0-S3-T1 section 5 into the template sections:

- measurement dimensions
- confidence anchors/checkpoints
- how-to-use rules (start/end/prompt/rework boundaries)

### Step 5 - Set Created at from filesystem birthtime

Run:

```bash
node "$REPO_ROOT/docs/.github/functions/file-stats.js" \
   "$REPO_ROOT/.agents/baseline/measurement-baseline.md"
```

Set `Created at` in the template header to the reported birthtime value.

### Step 6 — Commit and push template file via feature branch

Commit the baseline template to the fork:

```bash
cd "$REPO_ROOT"
git checkout -b exercise-1/measurement-template
git add .agents/baseline/measurement-baseline.md
git status  # confirm only this file is staged
git commit -m "chore(baseline): add measurement baseline template"
git push origin exercise-1/measurement-template
```

Open a Pull Request against `exercise-1` with title: `chore(baseline): add measurement baseline template`.

> **Stop condition:** PR merged into `exercise-1` before E0-S3-T3 starts. T3 reads the template from the merged state.

---
## 4) Architecture and security requirements

- Scope is documentation/template generation only; do not modify runtime code.
- Do not pre-populate measurement values; keep all capture cells as `[FILL IN]`.
- Never include secret/token values in examples or notes.
- Keep paths and commands consistent with `nextjs-feature-flag-exercise` stack (Node/pnpm workflow).
- Preserve deterministic section order so T3 can fill data without interpretation.

---

## 5) Validation evidence

### Commands

1. Dependency existence check:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
   "$REPO_ROOT/docs" \
   ".github/skills/generate-measurement-template/SKILL.md" \
   ".github/skills/file-timestamps/SKILL.md" \
   ".github/instructions/measurement-baseline.instructions.md"
```

Expected: exit code `0`, summary `3 / 3 present`.

2. Output file existence check:

```bash
ls -la "$REPO_ROOT/.agents/baseline/measurement-baseline.md"
```

Expected: exit code `0`.

3. Section presence check:

```bash
grep -n "Measurement Baseline\|How to use this template\|Pre-implementation state\|Measurement dimensions\|Time Capture\|Prompt Count Tally\|Rework Log\|Confidence Self-Assessment\|Friction Log\|Go/No-Go Checklist" \
   "$REPO_ROOT/.agents/baseline/measurement-baseline.md"
```

Expected: all required blocks found.

4. Birthtime capture:

```bash
node "$REPO_ROOT/docs/.github/functions/file-stats.js" \
   "$REPO_ROOT/.agents/baseline/measurement-baseline.md"
```

Expected: includes `birthtime`; template `Created at` matches that value.

### Given / When / Then checks

- **Given** T0 and T1 are complete and template-generation dependencies exist,
- **When** I generate the baseline template, enforce AC-2 structure (including Friction Log), and set Created at from birthtime,
- **Then** T3 can execute time-zero capture directly with no structural ambiguity.

---

## 6) Definition of Done

- [x] Dependencies (skill/instruction files) verified via command evidence.
- [x] Baseline template file exists at the expected path.
- [x] Required structure present, including Friction Log and Go/No-Go blocks.
- [x] Placeholder-only policy respected (`[FILL IN]` fields; no real measurements).
- [x] `Created at` in template header matches filesystem birthtime (`2026-04-14 19:49:31 -03`).
- [x] Committed directly to `exercise-1` (Epic 0 rule — no PR required).
- [x] E0-S3-T3 is unblocked.
