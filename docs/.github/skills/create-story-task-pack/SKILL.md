---
name: create-story-task-pack
description: Generate a full task pack from a story Tasks section with dry-run, validation gates, and backlog sync.
---

# Skill: create-story-task-pack

## Purpose

Create all task files from a single story in a controlled batch, with strong
quality gates for architecture, security, and traceability.

Use this skill when a story already contains a complete `## 4) Tasks` section
and you want to generate `T0..Tn` task artifacts without losing detail.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| `STORY_FILE` | Absolute path | e.g. `Docs/agile/stories/story-E0S1-repository-diagnosis.md` |
| `AGILE_DIR` | Absolute path | e.g. `Docs/agile` |
| `scaffold-story-tasks.js` | `Docs/.github/functions/` | Required |
| `validate-task-pack.js` | `Docs/.github/functions/` | Required |
| `sync-backlog-index.js` | `Docs/.github/functions/` | Required |

---

## Process

### Phase 1 — Pre-check story readiness

Before generation, confirm:

1. Story has metadata table with valid `ID`, `Priority`, and `Responsible agent`.
2. Story includes `## 4) Tasks` section.
3. Each task heading follows:
   `### Task E<epic>-S<story>-T<n> — <title>`

---

### Phase 2 — Dry-run scaffold

```bash
node "Docs/.github/functions/scaffold-story-tasks.js" \
  "$STORY_FILE" \
  "$AGILE_DIR" \
  --dry-run
```

Review file names and ensure no unexpected IDs or slugs.

---

### Phase 3 — Generate files

```bash
node "Docs/.github/functions/scaffold-story-tasks.js" \
  "$STORY_FILE" \
  "$AGILE_DIR" \
  --overwrite
```

This writes detailed task markdown files under `Docs/agile/tasks/`.

---

### Phase 4 — Quality and safety validation

```bash
node "Docs/.github/functions/validate-task-pack.js" \
  "$AGILE_DIR" \
  --story E0-S1
```

Expected result:

- all generated files `✅`
- no missing required sections
- no placeholders
- security guidance present
- at least one `Given / When / Then` block in each task

If any file fails, fix it before proceeding.

---

### Phase 5 — Backlog synchronization

```bash
node "Docs/.github/functions/sync-backlog-index.js" "$AGILE_DIR"
```

This updates `Docs/agile/backlog-index.json` with all generated tasks.

---

## Outputs

| Output | Path | Notes |
|---|---|---|
| Task pack files | `Docs/agile/tasks/*.md` | One file per task heading in the story |
| Validation report | terminal output | Pass/fail details per file |
| Updated backlog index | `Docs/agile/backlog-index.json` | Includes generated tasks |

---

## Validation checklist

After running this skill:

- [ ] Every story task heading has a corresponding task file
- [ ] All task files pass `validate-task-pack.js`
- [ ] Story-to-task links are present when task files exist
- [ ] `backlog-index.json` is regenerated and valid JSON
- [ ] No placeholder text remains in generated task files

---

## Error recovery

| Error | Cause | Recovery |
|---|---|---|
| No task blocks found | Story headings do not match expected format | Fix headings in story `## 4) Tasks` section |
| Validation fails on missing sections | Manual edits removed required blocks | Re-run scaffold with `--overwrite` or patch file |
| Placeholder detected | Source story includes placeholders | Replace placeholders with concrete execution details |
| Backlog cycle detected | Incorrect dependency mapping in task metadata | Fix `**Depends on**` and rerun index sync |
