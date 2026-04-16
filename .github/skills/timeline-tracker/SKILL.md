---
name: timeline-tracker
description: Maintain a structured, append-only activity log (Docs/agile/timeline.jsonl) for all agile artifact operations performed by the agile-exercise-planner agent. Use this skill whenever an artifact is created, updated, or closed to enable time measurement and session-level analysis of work invested per exercise phase.
---

## Objective

Maintain `Docs/agile/timeline.jsonl` as the canonical activity log for all agile artifact operations, enabling:

- precise time measurement per artifact, story, epic, and exercise phase;
- session-level grouping of related actions;
- retrospective analysis of time invested during interview preparation.

## Hook-aware execution mode

The Docs workspace uses VS Code Agent Hooks (`Docs/.github/hooks/agile-auto-log.json`) to auto-write timeline/backlog records.

- When hook diagnostics confirm hooks are loaded and healthy, **do not** append manual duplicate entries with this skill.
- Use this skill as a **fallback/manual recovery** path only when hooks are unavailable, disabled by policy, or failing.

---

## Inputs

| Input | Type | Required | Description |
|---|---|---|---|
| `action` | string | ✅ | `create`, `update`, or `close` |
| `artifact_type` | string | ✅ | `epic`, `story`, `task`, `subtask`, or `backlog-index` |
| `artifact_id` | string | ✅ | ID matching the artifact's `ID` metadata field (e.g., `EPIC-0`, `E0-S1`, `E0-S1-T1`) |
| `artifact_path` | string | ✅ | Workspace-relative path to the artifact file |
| `epic_id` | string | ✅ | Parent epic ID (e.g., `EPIC-0`) |
| `story_id` | string | conditional | Parent story ID — required when `artifact_type` is `task` or `subtask`; `null` otherwise |
| `task_id` | string | conditional | Parent task ID — required when `artifact_type` is `subtask`; `null` otherwise |
| `session_id` | string | recommended | Identifier grouping all actions in one focused work period (e.g., `session-20260409-01`) |
| `notes` | string | optional | Free-form observation about this specific action |

---

## Log schema

Each entry in `Docs/agile/timeline.jsonl` is a single JSON object on one line (no trailing commas between lines).

```json
{
  "id": "YYYYMMDD-NNN",
  "timestamp": "YYYY-MM-DD HH:MM:SS -HH",
  "action": "create | update | close",
  "agent": "agile-exercise-planner",
  "artifact_type": "epic | story | task | subtask | backlog-index",
  "artifact_id": "<artifact-id>",
  "artifact_path": "<workspace-relative-path>",
  "epic_id": "<EPIC-n>",
  "story_id": "<story-id> | null",
  "task_id": "<task-id> | null",
  "session_id": "<session-id> | null",
  "notes": "<free-form text> | null"
}
```

### Field rules

| Field | Rule |
|---|---|
| `id` | Unique per entry: `YYYYMMDD-NNN`. Read the last entry in the file to determine the next sequence number for today. If no entries exist for today, start at `YYYYMMDD-001`. |
| `timestamp` | Current local datetime: `YYYY-MM-DD HH:MM:SS -HH`. Must match the `Last updated` value written to the artifact. |
| `action` | `create` on first file write; `update` on any subsequent edit; `close` when the artifact's status moves to Done. |
| `agent` | Always `agile-exercise-planner` for entries produced by this agent. |
| `artifact_type` | One of the defined enum values — never free-form. |
| `artifact_id` | Must match the artifact file's `ID` metadata field exactly (case-sensitive). |
| `story_id` | Required (non-null) when `artifact_type` is `task` or `subtask`. |
| `task_id` | Required (non-null) when `artifact_type` is `subtask`. |
| `session_id` | Recommended. Use a consistent ID for all actions within a single focused work session. Format: `session-YYYYMMDD-NN`. |
| `notes` | Optional but encouraged for `create` and `close` actions. |

---

## Process

### Step 1 — Resolve timestamps from the filesystem

**Never invent or estimate timestamps.** Use the shared function files:

```bash
# Get birthtime + mtime for an artifact file
node "Docs/.github/functions/file-stats.js" "<ABSOLUTE_PATH_TO_ARTIFACT>"

# Get current local datetime (for 'update' and 'close' actions recorded in real time)
node "Docs/.github/functions/datetime.js"
```

- For `action: create` → use `birthtime` as `Created at` and `mtime` as the JSONL entry `timestamp`.
- For `action: update` or `action: close` → use `mtime` as both `Last updated` and the JSONL entry `timestamp`.

See the `file-timestamps` skill and `Docs/.github/functions/file-stats.js` for Linux filesystem caveats.

### Step 2 — Determine next entry ID

Use the shared function:

```bash
node "Docs/.github/functions/timeline-id.js" "<ABSOLUTE_PATH_TO_TIMELINE_JSONL>"
```

The function handles all edge cases automatically: file not found → `YYYYMMDD-001`; previous-date entries → reset to `YYYYMMDD-001`; today's entries → increment.

### Step 3 — Compose the entry

Build the JSON object using the schema above. Validate before writing:
- All required fields are present and non-null.
- `artifact_id` matches the artifact file's `ID` metadata field.
- `action` correctly reflects whether this is a first write or a subsequent edit.

### Step 4 — Append to log

- If the file does not exist: create it and write the entry as the first line.
- If the file exists: append the entry as a new line at the end.
- Never modify existing lines.

### Step 5 — Update artifact metadata

- If `action` is `create`: set `Created at` and `Last updated` in the artifact file to the entry's `timestamp`.
- If `action` is `update` or `close`: update only `Last updated` in the artifact file to the entry's `timestamp`. Do not touch `Created at`.

---

## Example log file (`Docs/agile/timeline.jsonl`)

```jsonl
{"id":"20260409-001","timestamp":"2026-04-09 16:39:34 -03","action":"create","agent":"agile-exercise-planner","artifact_type":"epic","artifact_id":"EPIC-0","artifact_path":"Docs/agile/epics/epic-0-environment-preparation.md","epic_id":"EPIC-0","story_id":null,"task_id":null,"session_id":"session-20260409-01","notes":"Initial epic creation"}
{"id":"20260409-002","timestamp":"2026-04-09 17:05:25 -03","action":"update","agent":"agile-exercise-planner","artifact_type":"epic","artifact_id":"EPIC-0","artifact_path":"Docs/agile/epics/epic-0-environment-preparation.md","epic_id":"EPIC-0","story_id":null,"task_id":null,"session_id":"session-20260409-01","notes":"Added fork strategy and brownfield audit to scope"}
{"id":"20260409-003","timestamp":"2026-04-09 17:30:00 -03","action":"create","agent":"agile-exercise-planner","artifact_type":"story","artifact_id":"E0-S1","artifact_path":"Docs/agile/stories/story-E0-S1-repository-diagnosis.md","epic_id":"EPIC-0","story_id":"E0-S1","task_id":null,"session_id":"session-20260409-01","notes":""}
{"id":"20260409-004","timestamp":"2026-04-09 18:10:00 -03","action":"close","agent":"agile-exercise-planner","artifact_type":"story","artifact_id":"E0-S1","artifact_path":"Docs/agile/stories/story-E0-S1-repository-diagnosis.md","epic_id":"EPIC-0","story_id":"E0-S1","task_id":null,"session_id":"session-20260409-01","notes":"All tasks validated, story moved to Done"}
```

---

## Time measurement queries

Use these patterns to compute time invested from the JSONL log.

### Total time for a session

Group entries by `session_id`. For each session: `max(timestamp) − min(timestamp)`.

**jq:**
```bash
jq -r '[.session_id, .timestamp] | @tsv' Docs/agile/timeline.jsonl \
  | sort | awk -F'\t' '{ sessions[$1] = sessions[$1] == "" ? $2 : (sessions[$1] < $2 ? $2 : sessions[$1]) }'
```

### Total time per epic

Filter by `epic_id`, find earliest `create` and latest `close` or `update`.

**jq:**
```bash
jq -r 'select(.epic_id=="EPIC-1") | [.timestamp, .action, .artifact_id] | @tsv' \
  Docs/agile/timeline.jsonl
```

### First creation to close (single artifact)

```bash
jq -r 'select(.artifact_id=="E1-S2") | [.timestamp, .action] | @tsv' \
  Docs/agile/timeline.jsonl
```

### Python summary (pandas)

```python
import pandas as pd
df = pd.read_json("Docs/agile/timeline.jsonl", lines=True)
df["timestamp"] = pd.to_datetime(df["timestamp"])
df.groupby("epic_id")["timestamp"].agg(["min","max"]).assign(
    duration=lambda x: x["max"] - x["min"]
)
```

---

## Constraints

- All output artifacts must be written in **English** (entries, notes, and any narrative text).
- Prefer automatic hook logging in normal operation; this skill is fallback-first.
- Never rewrite, compact, or delete existing JSONL lines — append only.
- Never generate duplicate `id` values for the same date.
- `Created at` in an artifact file must never be overwritten after the initial `create` action.
- This skill operates on `Docs/agile/timeline.jsonl` only — do not create per-epic or per-story sub-logs.
- Do not produce invalid JSON lines (no trailing commas, no unquoted strings, no `undefined` values).

---

## Quality checklist

- [ ] Entry has a unique `id` for today's date
- [ ] `timestamp` matches the `Last updated` field written to the artifact
- [ ] All required fields are present and non-null
- [ ] `action` correctly reflects `create` vs `update` vs `close`
- [ ] `artifact_id` matches the artifact's metadata `ID` field exactly
- [ ] `story_id` and `task_id` follow the conditional rules
- [ ] Entry appended as a single line to `Docs/agile/timeline.jsonl`
- [ ] Artifact metadata (`Created at` / `Last updated`) updated in sync with this entry
