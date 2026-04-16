---
name: record-friction-point
description: Record execution friction points with impact classification into the friction log using append-friction-log.js.
---

# Skill: record-friction-point

## Purpose

Identify a friction event during story execution, classify its impact level, and
append a structured entry to `nextjs-feature-flag-exercise/.agents/templates/friction-log.md`
using `append-friction-log.js`.

Use this skill whenever you encounter a blocker, rework event, ambiguity, tool
failure, or environment issue **during any story of any exercise**. Do not wait
until closure — record at the moment it occurs.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| `REPO_PATH` | Absolute path | Root of `nextjs-feature-flag-exercise` |
| `STORY_ID` | Current context | e.g. `E0-S1`, `E1-S2` |
| `DESCRIPTION` | Observation | One sentence, max 120 chars, no pipe characters |
| `IMPACT` | Classification (see §3) | `high` \| `medium` \| `low` |
| `friction-log.md` | `REPO_PATH/.agents/templates/friction-log.md` | Must exist before running this skill |
| `append-friction-log.js` | `Docs/.github/functions/` | Must exist before running this skill |

---

## Process

### Step 1 — Identify the friction event

Ask: does this event meet at least one criterion from `friction-log.instructions.md §1`?

| Criterion | Indicator |
|---|---|
| Blocker | Progress stopped; had to wait, revert, or restart |
| Rework | Artifact substantially changed after initial creation |
| Ambiguity | Task description required clarification before continuing |
| Tool failure | CLI produced unexpected output, timed out, or was unavailable |
| Environment issue | Config, secret, port, or path was wrong and blocked execution |

If **none** apply, do not record — continue with story execution.

---

### Step 2 — Classify impact

| Level | Apply when |
|---|---|
| `high` | Blocked > 30 min or required reverting completed work |
| `medium` | Delayed 10–30 min or required consulting external docs |
| `low` | Resolved in < 10 min without blocking other tasks |

---

### Step 3 — Append the entry

```bash
node "Docs/.github/functions/append-friction-log.js" \
  "$REPO_PATH" \
  "$STORY_ID" \
  "$DESCRIPTION" \
  --impact "$IMPACT"
```

Expected output:

```
✅  Friction point #N appended (E0-S1 | high)
    pnpm install failed: engine incompatibility with Node 22
```

Verify the entry was added:

```bash
tail -3 "$REPO_PATH/.agents/templates/friction-log.md"
```

---

## Outputs

| Output | Location | Notes |
|---|---|---|
| New table row | `REPO_PATH/.agents/templates/friction-log.md` | Appended; `#` and `Timestamp` auto-set |

---

## Validation checklist

After running this skill:

- [ ] `friction-log.md` file exists and has at least one data row
- [ ] The new row has a valid sequential `#` (no gaps)
- [ ] `Timestamp` is non-empty and matches `YYYY-MM-DD HH:MM:SS ±HH` format
- [ ] `Story` matches the current story ID
- [ ] `Impact` is one of `high`, `medium`, `low`
- [ ] `Description` is ≤ 120 characters and contains no pipe characters

---

## Error recovery

| Error | Cause | Recovery |
|---|---|---|
| `Friction log not found` | `friction-log.md` does not exist at the expected path | Create the template first: run `record-friction-point` only after `friction-log.md` exists |
| `Could not locate the friction log table` | Table header row missing or malformed | Check `friction-log.md` for the `\| # \| Story \| Timestamp \| Description \| Impact \|` header |
| `Module not found: datetime` | `datetime.js` missing | Ensure `Docs/.github/functions/datetime.js` exists |
| `Invalid impact level` | Typo in `--impact` value | Use exactly `high`, `medium`, or `low` |
