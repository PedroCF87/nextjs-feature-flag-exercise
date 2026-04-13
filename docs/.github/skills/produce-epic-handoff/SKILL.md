---
name: produce-epic-handoff
description: Produces the 6-section EPIC handoff document for the next exercise epic. Captures live branch state (git-info.js), AI Layer coverage (check-ai-layer-files.js), task reference, first story link, top 3 risks from the codebase audit, and a signed READY statement. Use this skill at task T3 of an epic-closure story (E0-S4, E1-S4, E2-S4, E3-S4) after the closure report is complete.
---

## Objective

Give the implementation agent of the next epic a single, self-contained document that:
- shows the exact starting state (branch, SHA, AI Layer coverage);
- links directly to the task and acceptance criteria;
- names the first story to execute;
- surfaces the top 3 risks to monitor;
- contains a signed `READY` declaration with a timestamp.

This document eliminates preparation research at the start of each epic.

---

## Parameters

| Parameter | Description | Example |
|---|---|---|
| `CURRENT_EPIC_ID` | Closing epic ID | `EPIC-0` |
| `NEXT_EPIC_ID` | Epic to be handed off to | `EPIC-1` |
| `NEXT_EPIC_N` | Numeric suffix of next epic | `1` |
| `REPO_PATH` | Relative path to the exercise repository | `nextjs-feature-flag-exercise` |
| `OUTPUT_PATH` | Output path relative to `REPO_PATH` | `.agents/closure/epic1-handoff.md` |
| `FIRST_STORY_ID` | First story of next epic | `E1-S1` |
| `FIRST_STORY_FILE` | Path to first story file (if it exists) | `docs/agile/stories/story-E1S1-*.md` |

---

## Inputs

| Input | Source | Required |
|---|---|---|
| Closure report | `<REPO_PATH>/.agents/closure/epic<N>-closure-report.md` | ✅ |
| Codebase audit (for risks) | `<REPO_PATH>/.agents/diagnosis/codebase-audit.md` | ✅ |
| AI Layer file list | Defined per epic — see Step 2 | ✅ |
| Live git state | `git-info.js --branch-ref` | ✅ |

---

## Output Path

```
<REPO_PATH>/.agents/closure/epic<NEXT_EPIC_N>-handoff.md
```

(Create the `.agents/closure/` directory if it does not exist.)

---

## Process

Set once before running any command:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
```

### Step 1 — Capture live git state

```bash
node "$REPO_ROOT/docs/.github/functions/git-info.js" "$REPO_ROOT" --branch-ref
```

Record the output (`<branch> @ <sha>`). This goes into Section 1 of the handoff.

### Step 2 — Generate AI Layer coverage table

Run `check-ai-layer-files.js` with the full list of expected AI Layer files for the next epic. At minimum, include:

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" \
  ".github/copilot-instructions.md" \
  ".github/workflows/copilot-setup-steps.yml" \
  ".github/instructions/feature-flag-exercise.instructions.md" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".github/skills/analyze-rdh-workflow/SKILL.md" \
  ".github/skills/gap-analysis/SKILL.md" \
  ".github/skills/write-technical-manual/SKILL.md" \
  ".github/skills/system-evolution-retro/SKILL.md" \
  --table
```

Paste the markdown table output into Section 2 of the handoff.

### Step 3 — Get production timestamp

```bash
node "$REPO_ROOT/docs/.github/functions/datetime.js"
```

### Step 4 — Write the handoff document

Use the template below. Fill every section completely. Do not leave placeholders.

### Step 5 — Verify the output file was created

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" ".agents/closure/epic<NEXT_EPIC_N>-handoff.md"
```

Expected output: `✅ 1/1 files present`.

---

## Document Template

```markdown
# EPIC-<NEXT_EPIC_N> Handoff Document

<!-- artifact_id: epic<NEXT_EPIC_N>-handoff -->
<!-- epic_id: EPIC-<NEXT_EPIC_N> -->
<!-- produced_at: <datetime.js output> -->
<!-- produced_by: project-adaptation-analyst -->

---

## 1 — Starting State

| Field | Value |
|---|---|
| Branch + SHA | `<git-info.js --branch-ref output>` |
| Last upstream sync | <date or commit, from codebase-audit.md or git log> |
| Server validation | `cd server && pnpm run build && pnpm run lint && pnpm test` — ✅ / ⚠️ |
| Client validation | `cd client && pnpm run build && pnpm run lint` — ✅ / ⚠️ |

---

## 2 — AI Layer Coverage

<paste check-ai-layer-files.js --table output here>

---

## 3 — Task Reference

**Task file:** [`nextjs-feature-flag-exercise/TASK.md`](../../TASK.md)

### Key acceptance criteria

<!-- Extract the acceptance criteria from TASK.md — do not paraphrase -->

- ...
- ...

---

## 4 — First Story to Execute

**Story:** `<FIRST_STORY_ID>` — [link once story file exists](<FIRST_STORY_FILE>)

**Objective in one sentence:** <describe what E<NEXT_EPIC_N>-S1 must accomplish>

---

## 5 — Known Risks

Top 3 risks from codebase audit to monitor during implementation:

| # | Risk | Monitoring Action |
|---|---|---|
| 1 | <risk from codebase-audit.md risk register> | <what to watch for during implementation> |
| 2 | ... | ... |
| 3 | ... | ... |

---

## 6 — Go / No-Go

> **READY — EPIC-<NEXT_EPIC_N> may begin.**

Signed: `project-adaptation-analyst` at `<datetime.js output>`.

All EPIC-<CURRENT_EPIC_N> DoD items resolved. See [`epic<N>-closure-report.md`](./<CURRENT_EPIC_N>-closure-report.md).
```

---

## Validation Checklist

Before committing:

- [ ] Section 1 branch + SHA matches live `git-info.js` output.
- [ ] Section 2 table was produced by `check-ai-layer-files.js --table` (not written manually).
- [ ] Section 3 acceptance criteria are exact quotes from `TASK.md` (not paraphrased).
- [ ] Section 4 names the correct first story ID.
- [ ] Section 5 has exactly 3 risks with monitoring actions (not generic advice).
- [ ] Section 6 contains the exact text `READY — EPIC-<N> may begin.` with a valid timestamp.
- [ ] Output file verified with `check-ai-layer-files.js`.

---

## Error Recovery

| Situation | Action |
|---|---|
| `git-info.js` fails (not a git repo) | Run `git -C <REPO_PATH> status` to diagnose. Ensure the path is correct. |
| `codebase-audit.md` not found | Use the E0-S1 codebase audit findings from `docs/agile/stories/story-E0S1-repository-diagnosis.md` T3 sub-tasks as fallback risk source. Record as ⚠️ in Section 5. |
| First story file does not exist yet | Write `E<N>-S1 (story file pending — will be created at start of EPIC-<N>)` in Section 4. |
| `check-ai-layer-files.js` shows missing files | Do not block the handoff. Record missing items as residual risks in the closure report Section 2. |
