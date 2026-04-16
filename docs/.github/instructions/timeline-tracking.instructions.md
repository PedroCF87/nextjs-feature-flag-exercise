---
applyTo: agile/**/*.md,agile/**/*.json
---

# Timeline Tracking — Always-On Instructions

## Objective

Record every creation and update of agile artifacts in a structured, append-only activity log (`Docs/agile/timeline.jsonl`) to enable time measurement across exercise phases.

## Scope

Applies to all agile artifacts created or updated by the `agile-exercise-planner` agent:

- Epics (`Docs/agile/epics/*.md`)
- Stories (`Docs/agile/stories/*.md`)
- Tasks (`Docs/agile/tasks/*.md`)
- Subtasks (`Docs/agile/tasks/*.md`)
- Backlog index (`Docs/agile/backlog-index.json`)

## Mandatory rules

1. **Every artifact file must include `Created at` and `Last updated` metadata fields** using the format `YYYY-MM-DD HH:MM:SS -HH`.
2. **`Created at` must be set once at file creation and never overwritten.**
3. **`Last updated` must be refreshed on every edit** to the artifact.
4. **Timeline logging is hook-first.** When `Docs/.github/hooks/agile-auto-log.json` is active and healthy, creation/update entries are appended automatically to `Docs/agile/timeline.jsonl`.
5. **Manual timeline append is fallback-only** and must be used only when hooks are unavailable, disabled by policy, or failing; follow the schema defined in the `timeline-tracker` skill.
6. If `Docs/agile/timeline.jsonl` does not yet exist, create it with the first entry as its sole content.

## Date format (required in all artifact metadata blocks)

```
- **Created at:** YYYY-MM-DD HH:MM:SS -HH
- **Last updated:** YYYY-MM-DD HH:MM:SS -HH
```

Example:

```
- **Created at:** 2026-04-09 16:39:34 -03
- **Last updated:** 2026-04-09 17:05:25 -03
```

## Log file

| Field | Value |
|---|---|
| Path | `Docs/agile/timeline.jsonl` |
| Format | JSONL — one JSON object per line |
| Mode | Append-only — never overwrite or compact existing lines |
| Schema | See `timeline-tracker` skill |

## Process (per action)

1. Capture the current timestamp in `YYYY-MM-DD HH:MM:SS -HH` format.
2. Set `Created at` (on new files) or update `Last updated` (on edits) in the artifact metadata block.
3. Verify hook diagnostics; if hooks are active, rely on automated timeline logging.
4. Only if hooks are unavailable/disabled/failing: compose the JSONL entry using the schema from the `timeline-tracker` skill and append it to `Docs/agile/timeline.jsonl` as a single line with no trailing comma.

## Do not

- Do not omit `Created at` or `Last updated` from any artifact metadata block.
- Do not overwrite `Created at` after the file's initial creation.
- Do not append manual duplicate entries when hook automation has already written the event.
- Do not reformat, compact, or rewrite existing entries in the JSONL file.
