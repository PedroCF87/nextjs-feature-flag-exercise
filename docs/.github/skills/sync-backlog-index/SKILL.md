---
name: sync-backlog-index
description: Regenerate backlog-index.json from story/task metadata with dependency validation and cycle detection.
---

# Skill: sync-backlog-index

## Purpose

Scan `Docs/agile/stories/*.md` and `Docs/agile/tasks/*.md`, extract structured
metadata from each file's pipe-table front-matter, validate dependency
consistency, and write an up-to-date `Docs/agile/backlog-index.json`.

Use this skill whenever you create or update a story or task file, or whenever
you need to verify that the backlog index reflects the current state of all
artifacts.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| `AGILE_DIR` | Absolute path | Path to `Docs/agile/` — e.g. `/path/to/Docs/agile` |
| Story `.md` files | `AGILE_DIR/stories/*.md` | Must contain required metadata table rows |
| Task `.md` files | `AGILE_DIR/tasks/*.md` | Must contain required metadata table rows |
| `sync-backlog-index.js` | `Docs/.github/functions/` | Required — must exist before running this skill |

---

## Process

### Phase 1 — Validate prerequisites

```bash
# Verify the function exists
ls "Docs/.github/functions/sync-backlog-index.js"

# Verify the agile directory exists
ls "$AGILE_DIR/stories"
```

If `sync-backlog-index.js` is missing, stop — the skill cannot proceed.

---

### Phase 2 — Dry run (preview)

Always preview before writing:

```bash
node "Docs/.github/functions/sync-backlog-index.js" "$AGILE_DIR" --dry-run
```

Review the output:
1. Confirm item count matches expected number of stories + tasks.
2. Check that `id`, `priority`, `status`, `depends_on`, and `blocks` are correct.
3. Verify no item has empty `responsible_agent`.
4. Note any items with empty `epic` — indicates missing `**Epic**` field in source.

---

### Phase 3 — Validate dependencies (no cycles)

The dry-run output also runs cycle detection. Look for:

```
⚠️  Dependency cycles detected:
   E0-S1 → E0-S2 → E0-S1
```

If any cycle is reported:
1. Identify which story or task has an incorrect `depends_on` entry.
2. Fix the source `.md` file.
3. Return to Phase 2.

---

### Phase 4 — Write the index

Once the dry run is clean:

```bash
node "Docs/.github/functions/sync-backlog-index.js" "$AGILE_DIR"
```

Expected output:

```
✅  backlog-index.json written — N items
🔗  No dependency cycles found (N items checked).
```

Verify the file was written:

```bash
cat "$AGILE_DIR/backlog-index.json" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Items: {len(d[\"items\"])} | Generated: {d[\"generated_at\"]}')"
```

---

## Outputs

| Output | Path | Notes |
|---|---|---|
| `backlog-index.json` | `Docs/agile/backlog-index.json` | Updated in place |

---

## Validation checklist

After running this skill:

- [ ] `backlog-index.json` exists and is valid JSON
- [ ] Item count matches the number of `.md` files in `stories/` + `tasks/`
- [ ] No item has an empty `id` or `status`
- [ ] No dependency cycles reported
- [ ] All story items have a non-empty `epic` field
- [ ] `generated_at` timestamp reflects the current run

---

## Error recovery

| Error | Cause | Recovery |
|---|---|---|
| `Module not found: datetime` | `datetime.js` missing from same directory | Ensure `Docs/.github/functions/datetime.js` exists |
| Item has empty `id` | Source `.md` missing `\| **ID** \|` row | Add the required metadata row and re-run |
| Cycle detected | Circular `depends_on` | Correct the source file's `**Depends on**` field |
| `ENOENT: stories/` | `AGILE_DIR` path is wrong | Pass the absolute path to `Docs/agile/` |
