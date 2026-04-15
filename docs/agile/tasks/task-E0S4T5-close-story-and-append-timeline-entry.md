# Task E0-S4-T5 — Close story and append timeline entry

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S4-T5 |
| **Story** | [E0-S4 — Preparation Closure and Handoff to EPIC-1](../stories/story-E0S4-preparation-closure.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Done |
| **Responsible agent** | `project-adaptation-analyst` |
| **Depends on** | [E0-S4-T0 — Bootstrap AI Layer artifacts](../tasks/task-E0S4T0-bootstrap-ai-layer-artifacts.md), [E0-S4-T4 — Verify closure artifacts and record final SHA](../tasks/task-E0S4T4-commit-and-push-closure-artifacts.md) |
| **Blocks** | — |
| Created at | 2026-04-11 20:50:15 -03 |
| Last updated | 2026-04-14 21:02:41 -03 |

---

## 1) Task statement

As a delivery agent, I want to update the story's `Last updated` metadata field, compute E0-S4 elapsed time, and append the closure entry to `timeline.jsonl` so that the session record is finalized and EPIC-0 is officially closed.

> **Execution context:** T5 runs **locally in VS Code** under the Epic 0 local execution rule — no GitHub Issue, no PR, no feature branch. All commits go directly to `exercise-1`.
> Define `REPO_ROOT="$(git rev-parse --show-toplevel)"` before running commands.

---

## 2) Verifiable expected outcome

- `story-E0S4-preparation-closure.md` has `Status: Done` and `Last updated` reflecting the actual closure timestamp.
- `docs/agile/timeline.jsonl` contains a new entry with `action: "close"` and `artifact_id: "E0-S4"` including the EPIC-0 total elapsed time in the notes.
- `backlog-index.json` is regenerated and reflects status `Done` for E0-S4.

---

## 3) Detailed execution plan

### Step 0 — Get final closure timestamp

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/datetime.js"
```

Record output as `<closure_ts>`. This is the canonical closure moment.

### Step 1 — Query E0-S4 elapsed time

```bash
node "$REPO_ROOT/docs/.github/functions/timeline-query.js" \
  "$REPO_ROOT/docs/agile/timeline.jsonl" \
  --story E0-S4
```

Record the elapsed minutes for E0-S4. If the query returns 0 or null, compute manually using `elapsed-time.js`:

```bash
node "$REPO_ROOT/docs/.github/functions/elapsed-time.js" \
  "<T0 Created at timestamp>" \
  "<closure_ts>" \
  "E0-S4 total"
```

### Step 2 — Query EPIC-0 total elapsed time

```bash
node "$REPO_ROOT/docs/.github/functions/timeline-query.js" \
  "$REPO_ROOT/docs/agile/timeline.jsonl" \
  --epic EPIC-0
```

Record the total EPIC-0 elapsed minutes. Use this value in the timeline closure note.

### Step 3 — Update story metadata

Edit `docs/agile/stories/story-E0S4-preparation-closure.md`:

1. Set `**Status**` to `Done`.
2. Set `Last updated` to `<closure_ts>`.

### Step 4 — Get next timeline entry ID

```bash
node "$REPO_ROOT/docs/.github/functions/timeline-id.js" "$REPO_ROOT/docs/agile/timeline.jsonl"
```

Record as `<N>`.

### Step 5 — Append closure timeline entry

Append one line to `docs/agile/timeline.jsonl` (no trailing comma, valid JSON):

```json
{"id": "<N>", "action": "close", "timestamp": "<closure_ts>", "artifact_type": "story", "artifact_id": "E0-S4", "epic": "EPIC-0", "story": "E0-S4", "agent": "project-adaptation-analyst", "artifact_file": "docs/agile/stories/story-E0S4-preparation-closure.md", "notes": "EPIC-0 closed. Closure report and EPIC-1 handoff committed. E0-S4 elapsed: X min. Total EPIC-0 elapsed: Y min."}
```

Replace `X` with E0-S4 elapsed (Step 1) and `Y` with EPIC-0 total elapsed (Step 2).

### Step 6 — Regenerate backlog index

```bash
node "$REPO_ROOT/docs/.github/functions/sync-backlog-index.js" \
  "$REPO_ROOT/docs/agile"
```

Verify `E0-S4` shows `Status: Done` in the regenerated index. Verify no dependency cycle warnings.

### Step 7 — Commit and push docs-side changes to the fork

The `docs/` folder lives inside the fork repository (moved there in E0-S1-T1 Step 8). Commit all three modified files and push to the fork's `origin`:

```bash
cd "$REPO_ROOT"
git checkout -b exercise-1/close-epic0-story
git add \
  docs/agile/stories/story-E0S4-preparation-closure.md \
  docs/agile/timeline.jsonl \
  docs/agile/backlog-index.json
git status  # confirm only these 3 files are staged
git commit -m "chore(epic0): close story E0-S4 and record EPIC-0 timeline"
git push origin exercise-1/close-epic0-story
```

Open a PR against `exercise-1` and merge to finalize story closure.

Exit code of all four commands must be `0`.

---

## 4) Architecture and security requirements

- **Append-only timeline** — never overwrite or reformat existing lines in `timeline.jsonl`.
- **Story status is the single source of truth** — set `Done` only after T4 is confirmed complete (both closure artifacts verified in fork).
- **Backlog index must be regenerated** — do not manually edit `backlog-index.json`; always use `sync-backlog-index.js`.
- **No new file creation in this task** — this task only updates existing files and appends to the timeline. All changes are committed in Step 7.
- **Rollback** — if the timeline entry is appended with wrong data, do not delete it; append a correction entry with `action: "correction"` and the corrected values.

---

## 5) Validation evidence

| Check | Command | Expected output |
|---|---|---|
| Story status is Done | `grep "Status" "docs/agile/stories/story-E0S4-preparation-closure.md"` | `\| **Status** \| Done \|` |
| Story Last updated updated | `grep "Last updated" "docs/agile/stories/story-E0S4-preparation-closure.md"` | Line reflects `<closure_ts>` value |
| Timeline close entry appended | `tail -1 "docs/agile/timeline.jsonl"` | Valid JSON with `"action":"close"` and `"artifact_id":"E0-S4"` |
| Backlog index E0-S4 Done | `node "$REPO_ROOT/docs/.github/functions/sync-backlog-index.js" "$REPO_ROOT/docs/agile" --dry-run` | No cycle warnings; E0-S4 listed as `Done` |

### BDD verification signal

**Given** T0 (timeline opened), T4 (closure artifacts verified in fork), and all prior tasks are complete,  
**When** Steps 0–7 are executed in order,  
**Then** the story metadata shows `Done`, a `close` entry with elapsed times is present in `docs/agile/timeline.jsonl`, `backlog-index.json` reflects the final status, and the 3 docs-side changes are committed and pushed to the fork.

---

## 6) Definition of Done

- [x] `story-E0S4-preparation-closure.md` has `**Status** | Done`.
- [x] `story-E0S4-preparation-closure.md` has `Last updated` set to the closure timestamp (`2026-04-14 21:02:41 -03`).
- [x] `timeline.jsonl` contains `{action: "close", artifact_id: "E0-S4"}` with E0-S4 elapsed: 6,238 min and EPIC-0 total elapsed: 7,410 min.
- [x] `sync-backlog-index.js` runs without cycle warnings.
- [x] `backlog-index.json` shows `E0-S4` with status `Done`.
- [x] Committed directly to `exercise-1` under Epic 0 local execution rule (no branch/PR required).
