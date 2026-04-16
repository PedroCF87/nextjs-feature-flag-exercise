---
name: produce-epic-closure-report
description: Produces the 5-section EPIC closure report for any exercise epic by consolidating DoD evidence from predecessor stories, querying preparation elapsed time via timeline-query.js, and writing a traceable markdown document. Use this skill at task T2 of an epic-closure story (E0-S4, E1-S4, E2-S4, E3-S4) after DoD evidence has been verified.
---

## Objective

Consolidate all DoD evidence into a single, traceable closure document that:
- shows every DoD item with ✅/⚠️ status and an evidence link;
- records residual risks with mitigation notes;
- summarizes the top 3 preparation friction points;
- preserves key decisions made during the epic;
- records total preparation elapsed time from the timeline.

This document is the primary input for `produce-epic-handoff`.

---

## Parameters

| Parameter | Description | Example |
|---|---|---|
| `EPIC_ID` | Identifier of the epic being closed | `EPIC-0` |
| `EPIC_N` | Numeric suffix for file naming | `0` |
| `REPO_PATH` | Relative path to the exercise repository | `nextjs-feature-flag-exercise` |
| `OUTPUT_PATH` | Output path relative to `REPO_PATH` | `.agents/closure/epic0-closure-report.md` |
| `DOD_EVIDENCE_MAP` | In-memory DoD status map from T1 | 13-row table (item, status, evidence) |

---

## Inputs

| Input | Source | Required |
|---|---|---|
| DoD evidence map | T1 of the closure story (in-memory table) | ✅ |
| E0-S1 evidence | `<REPO_PATH>/.agents/diagnosis/codebase-audit.md` | ✅ |
| E0-S2 evidence | `<REPO_PATH>/.agents/validation/ai-layer-coverage-report.md` | ✅ |
| E0-S3 evidence | `<REPO_PATH>/.agents/baseline/measurement-baseline.md` | ✅ |
| Timeline file | `<REPO_PATH>/docs/agile/timeline.jsonl` | ✅ |

---

## Output Path

```
<REPO_PATH>/.agents/closure/epic<N>-closure-report.md
```

(Create the `.agents/closure/` directory if it does not exist.)

---

## Process

Set once before running any command:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
```

### Step 1 — Query elapsed time

```bash
node "$REPO_ROOT/docs/.github/functions/timeline-query.js" "$REPO_ROOT/docs/agile/timeline.jsonl" --epic <EPIC_ID>
```

Record the `N min` value. If the output is `—` (no timestamped entries), write `not available`.

### Step 2 — Get production timestamp

```bash
node "$REPO_ROOT/docs/.github/functions/datetime.js"
```

### Step 3 — Verify output directory exists

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" ".agents/closure/"
```

If missing, the directory will be created automatically when writing the file.

### Step 4 — Write the closure report

Use the template below. Fill every section completely. Do not leave placeholders.

### Step 5 — Verify the output file was created

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" ".agents/closure/epic<N>-closure-report.md"
```

Expected output: `✅ 1/1 files present`.

---

## Document Template

```markdown
# EPIC-<N> Closure Report

<!-- artifact_id: epic<N>-closure-report -->
<!-- epic_id: EPIC-<N> -->
<!-- produced_at: <datetime.js output> -->
<!-- produced_by: project-adaptation-analyst -->

---

## 1 — EPIC-<N> DoD Checklist

| # | DoD Item | Status | Evidence |
|---|---|---|---|
| 1 | <item text from Epic §3> | ✅ / ⚠️ / ❌ | [link or note] |
| 2 | ... | | |
<!-- repeat for all DoD items -->

> Legend: ✅ confirmed · ⚠️ partial (see note) · ❌ missing (see residual risks)

---

## 2 — Residual Risks

<!-- If all items are ✅, write: No open risks. -->

| Risk | Impact | Mitigation |
|---|---|---|
| <description> | High / Medium / Low | <action or acceptance note> |

---

## 3 — Friction Log Summary

Top 3 preparation friction points encountered across predecessor stories:

1. **<Friction point title>** — <1-sentence description>. Source: <E0-S1 / E0-S2 / E0-S3>.
2. ...
3. ...

---

## 4 — Decisions Record

| Decision | Rationale | Story |
|---|---|---|
| <key choice made> | <why this option was selected> | <E0-S1 / E0-S2 / E0-S3> |

---

## 5 — Preparation Time

Total **EPIC-<N>** elapsed time: **<N> minutes** (source: `timeline-query.js --epic EPIC-<N>`).

Individual story breakdown:

| Story | Elapsed (min) |
|---|---|
| E<N>-S1 | <from timeline-query.js --story E<N>-S1> |
| E<N>-S2 | <from timeline-query.js --story E<N>-S2> |
| E<N>-S3 | <from timeline-query.js --story E<N>-S3> |
| E<N>-S4 | <from timeline-query.js --story E<N>-S4 — may be partial> |
```

---

## Validation Checklist

Before handing off to `produce-epic-handoff`:

- [ ] All DoD items have a status (no blank rows).
- [ ] Every ❌ item has a mitigation note in Section 2.
- [ ] Section 3 has exactly 3 friction points with source story references.
- [ ] Section 4 has at least 2 decisions recorded.
- [ ] Section 5 elapsed time is a number (not `—` or `not available`).
- [ ] Output file verified with `check-ai-layer-files.js`.

---

## Error Recovery

| Situation | Action |
|---|---|
| `timeline-query.js` returns `—` for elapsed | Check that `timeline.jsonl` entries have a `timestamp` field. Fallback: compute manually from `Created at` of E<N>-S1 to `Last updated` of E<N>-S3. |
| Evidence file missing (e.g., `codebase-audit.md` not found) | Mark the corresponding DoD items as ⚠️ with note "evidence file not yet produced". Record as residual risk in Section 2. Do not block closure. |
| Output directory `.agents/closure/` does not exist | Create it with `mkdir -p <REPO_PATH>/.agents/closure/`. |
