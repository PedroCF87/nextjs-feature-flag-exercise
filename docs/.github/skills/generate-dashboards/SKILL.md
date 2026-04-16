---
name: generate-dashboards
description: Generate and refresh timeline, backlog, and friction HTML dashboards from AI Layer log sources.
---

# Skill: generate-dashboards

## Purpose

Generate and refresh the HTML dashboards that visualize the three AI Layer log
systems:

- `Docs/agile/timeline.jsonl` → `Docs/dashboard/timeline.html`
- `Docs/agile/backlog-index.json` → `Docs/dashboard/backlog.html`
- `nextjs-feature-flag-exercise/.agents/templates/friction-log.md` → `Docs/dashboard/friction-log.html`

Use this skill whenever timeline/backlog/friction data changes and you need an
updated visual dashboard for analysis, handoff, or closure support.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| `WORKSPACE_ROOT` | Absolute path | Root path that contains `Docs/` and `nextjs-feature-flag-exercise/` |
| `generate-dashboards.js` | `Docs/.github/functions/` | Required function |
| Timeline JSONL | `Docs/agile/timeline.jsonl` | Must be valid JSONL |
| Backlog JSON | `Docs/agile/backlog-index.json` | Must be valid JSON |
| Friction Log | `nextjs-feature-flag-exercise/.agents/templates/friction-log.md` | Default markdown table source |
| Optional custom friction log | CLI arg | `--friction-log <abs-path>` |

---

## Process

### Step 1 — Validate prerequisites

```bash
ls "Docs/.github/functions/generate-dashboards.js"
ls "Docs/agile/timeline.jsonl"
ls "Docs/agile/backlog-index.json"
```

Optional (if custom friction log path will be used):

```bash
ls "<abs-path-to-friction-log.md>"
```

---

### Step 2 — Run dashboard generation

Default source path for friction log:

```bash
node "Docs/.github/functions/generate-dashboards.js"
```

With custom friction log file:

```bash
node "Docs/.github/functions/generate-dashboards.js" --friction-log "<abs-path-to-friction-log.md>"
```

Expected output includes:

- timeline/backlog/friction item counts
- creation (if needed) of `Docs/dashboard/`
- write confirmation for the 3 HTML files

---

### Step 3 — Validate generated files

```bash
ls "Docs/dashboard/timeline.html"
ls "Docs/dashboard/backlog.html"
ls "Docs/dashboard/friction-log.html"
```

Optional quick size check:

```bash
node "Docs/.github/functions/file-stats.js" \
  "Docs/dashboard/timeline.html" \
  "Docs/dashboard/backlog.html" \
  "Docs/dashboard/friction-log.html"
```

---

### Step 4 — Manual visual verification

Open each file and confirm:

1. Navbar links navigate correctly among all dashboards.
2. Filters reduce/restore result counts.
3. Timeline notes can expand and collapse.
4. Backlog dependency badges filter by target ID.
5. Friction impact summaries match visible rows.

---

## Outputs

| Output | Path | Notes |
|---|---|---|
| Timeline dashboard | `Docs/dashboard/timeline.html` | Bootstrap table + filters + search |
| Backlog dashboard | `Docs/dashboard/backlog.html` | Bootstrap table + dependency click-filter |
| Friction dashboard | `Docs/dashboard/friction-log.html` | Impact summary + filterable table |

---

## Validation checklist

After running this skill:

- [ ] `Docs/dashboard/` exists
- [ ] `timeline.html` opens and shows timeline entries
- [ ] `backlog.html` opens and shows backlog items
- [ ] `friction-log.html` opens and shows friction rows
- [ ] Filter controls update visible rows and count badges
- [ ] No JavaScript errors appear in browser console

---

## Error recovery

| Error | Cause | Recovery |
|---|---|---|
| `timeline line N is invalid JSON — skipped` | Corrupt line in `timeline.jsonl` | Fix invalid JSON line and rerun generation |
| `ENOENT` for backlog file | Missing `backlog-index.json` | Regenerate with `sync-backlog-index.js` and rerun |
| `friction-log not found ... empty data used` | Wrong friction log path | Use correct `--friction-log <abs-path>` or create template file |
| Dashboard not updated | Generation not rerun after data change | Rerun `generate-dashboards.js` manually |
