---
name: generate-measurement-template
description: Generate the reusable baseline measurement template for exercises, including metadata, capture tables, friction log, and go/no-go checklist.
---

# Skill — Generate Measurement Template

## Metadata

- **Created at:** 2026-04-09 23:01:57 -03
- **Last updated:** 2026-04-11 17:18:46 -03

---

## Description

Generate the complete 10-section markdown baseline capture template for an exercise. The template is parameterized by exercise name, stack, and validation commands, so it can be reused across all four exercises without manual rewriting.

Use this skill for **Task E0-S3-T2** and for any subsequent exercise that requires a fresh baseline capture document.

---

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `exercise_name` | string | ✅ | e.g. `"Exercise 1 — Baseline"` |
| `fork_root` | string | ✅ | Absolute path to the fork's root directory |
| `output_path` | string | optional | Defaults to `{fork_root}/.agents/baseline/measurement-baseline.md` |
| `validation_commands` | list | optional | Override default 7-command list if the stack differs |
| `ai_layer_files` | list | optional | Override default AI Layer file presence checklist |

---

## Default validation command list

Used verbatim in the pre-implementation state table unless overridden:

```bash
cd server && pnpm run build
cd server && pnpm run lint
cd server && pnpm test
cd client && pnpm run build
cd client && pnpm run lint
node --version
pnpm --version
```

## Default AI Layer file checklist

```
.github/copilot-instructions.md
.github/instructions/feature-flag-exercise.instructions.md
.github/instructions/coding-agent.instructions.md
.github/agents/rdh-workflow-analyst.agent.md
.github/agents/codebase-gap-analyst.agent.md
.github/agents/technical-manual-writer.agent.md
.github/skills/analyze-rdh-workflow/SKILL.md
.github/skills/gap-analysis/SKILL.md
.github/skills/write-technical-manual/SKILL.md
.github/skills/system-evolution-retro/SKILL.md
.github/workflows/copilot-setup-steps.yml
```

---

## Process

1. Create directory `{fork_root}/.agents/baseline/` if it does not exist.
2. Write `measurement-baseline.md` with the following 10 sections **in this exact order:**

### Section 1 — Metadata header

```markdown
# Measurement Baseline — {exercise_name}

| Field | Value |
|---|---|
| **Exercise** | {exercise_name} |
| **Date** | [FILL IN — YYYY-MM-DD] |
| **Executor** | [FILL IN — your name] |
| **Repository** | nextjs-feature-flag-exercise (personal fork) |
| **Branch** | [FILL IN — output of: git branch --show-current] |
| **Last commit SHA** | [FILL IN — output of: git log --oneline -1] |
| **Node.js version** | [FILL IN — output of: node --version] |
| **pnpm version** | [FILL IN — output of: pnpm --version] |
| **Created at** | [FILL IN — node "Docs/.github/functions/datetime.js"] |
```

### Section 2 — How to use this template

Include the capture method definitions verbatim from AC-3 of story E0-S3:
- Start signal, End signal, Prompt boundary, Rework boundary, Confidence scale.

### Section 3 — Pre-implementation state

Table with one row per validation command:

```markdown
| Command | Exit code | Output snippet | Status |
|---|---|---|---|
| `cd server && pnpm run build` | [FILL IN] | [FILL IN] | ✅ / ❌ |
...
```

Plus a sub-table for AI Layer file presence:

```markdown
| Artifact | Expected path | Present |
|---|---|---|
| Global rules | `.github/copilot-instructions.md` | ✅ / ❌ |
...
```

### Section 4 — Measurement dimensions (reference)

Include the 4 dimension definitions from AC-1 (time, prompt count, rework cycles, confidence) as a reference block — these are **not** filled in; they exist to remind the executor what to capture.

### Section 5 — Time capture

```markdown
## Time Capture

| Field | Value |
|---|---|
| **Start timestamp** | [FILL IN — node "Docs/.github/functions/datetime.js"] |
| **End timestamp** | [FILL IN — node "Docs/.github/functions/datetime.js"] |
| **Elapsed** | [FILL IN — node "Docs/.github/functions/elapsed-time.js" "<start>" "<end>"] |
```

### Section 6 — Prompt count tally

```markdown
## Prompt Count Tally

| Phase | Prompt count | Notes |
|---|---|---|
| Plan | [FILL IN] | |
| Implement | [FILL IN] | |
| Validate | [FILL IN] | |
| **Total** | [FILL IN] | |
```

### Section 7 — Rework log

```markdown
## Rework Log

| # | Regression description | Affected command | Time to fix |
|---|---|---|---|
| 1 | [FILL IN] | [FILL IN] | [FILL IN] |
```

### Section 8 — Confidence self-assessment

```markdown
## Confidence Self-Assessment

| Checkpoint | Score (1–5) | Justification |
|---|---|---|
| Pre-implementation | [FILL IN] | |
| Mid-implementation | [FILL IN] | |
| Post-validation | [FILL IN] | |
```

Scale: 1 = no idea where to start · 3 = clear direction but uncertain about edge cases · 5 = execution is mechanical, no surprises.

### Section 9 — Friction log

```markdown
## Friction Log

Record blockers, ambiguities, or rework moments observed during implementation.

| Timestamp | Phase | Friction point | Impact (low/medium/high) | Mitigation |
|---|---|---|---|---|
| [FILL IN] | [FILL IN] | [FILL IN] | [FILL IN] | [FILL IN] |
```

### Section 10 — Go/no-go checklist

```markdown
## Go/No-Go Checklist for EPIC-1

- [ ] Fork created, cloned, remotes configured (`origin` + `upstream`).
- [ ] `exercise-1` confirmed as working base branch.
- [ ] All 7 validation commands pass on `exercise-1`.
- [ ] Codebase audit completed (E0-S1 evidence).
- [ ] AI Layer minimum baseline deployed to fork (E0-S2 evidence).
- [ ] `copilot-setup-steps.yml` dry-run successful (run ID documented).
- [ ] Measurement capture template filled to "time zero" state.
- [ ] Capture method understood and documented.
- [ ] No critical blockers open.

**Status:** [FILL IN — READY / NOT READY]
**Signed at:** [FILL IN — node "Docs/.github/functions/datetime.js"]
```

3. After writing the file, obtain the `birthtime` and `mtime` using:
   ```bash
   node "Docs/.github/functions/file-stats.js" "{output_path}"
   ```
4. Set the `Created at` field in Section 1 to the `birthtime` value.

---

## Output

- `{output_path}` written with all 10 sections, all data fields marked `[FILL IN]`.
- Confirmation message: `Template created at: {output_path}` with `birthtime` value.

---

## Quality checklist

- [ ] Directory `{fork_root}/.agents/baseline/` exists.
- [ ] All 10 sections present in the correct order.
- [ ] Every data field uses `[FILL IN]` — no actual measurements pre-populated.
- [ ] Validation command table has one row per command in the default list (or override list).
- [ ] AI Layer file presence sub-table has one row per expected artifact.
- [ ] Friction Log section is present before Go/No-Go checklist.
- [ ] `elapsed-time.js` CLI command shown in the Time Capture section.
- [ ] `datetime.js` CLI command shown wherever timestamps need to be captured.
- [ ] `Created at` set from `file-stats.js` birthtime after writing.

---

## Do not

- Do not pre-populate measurement data — the template must be blank at T2 completion.
- Do not omit the AI Layer file presence sub-table in Section 3.
- Do not omit the Friction Log section.
- Do not hardcode paths — use `{fork_root}` and `{output_path}` parameters throughout.
- Do not create the file before the directory exists.
