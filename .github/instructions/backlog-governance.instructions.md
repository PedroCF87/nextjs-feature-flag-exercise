---
applyTo: "agile/backlog-index.json,agile/stories/**,agile/tasks/**"
---
# Backlog Governance — Always-On Instructions

## 1. Purpose of backlog-index.json

`Docs/agile/backlog-index.json` is the single source of truth for the current
state of all backlog items (stories and tasks). It is a **derived artifact**: its
contents must always reflect the metadata found in the individual `.md` files
under `Docs/agile/stories/` and `Docs/agile/tasks/`.

Never edit `backlog-index.json` directly. Always regenerate it with
`sync-backlog-index.js` after modifying any story or task file when hook
automation is unavailable.

Hook-first policy: if `Docs/.github/hooks/agile-auto-log.json` is active and
healthy, backlog regeneration is executed automatically after tool-driven edits
to `Docs/agile/**/*.md`.

---

## 2. When to regenerate backlog-index.json

Hook-first behavior:

- When hook automation is active, regeneration is automatic for the triggers below.
- When hook automation is unavailable/disabled/failing, run `sync-backlog-index.js` manually.

Manual fallback command:

`node "Docs/.github/functions/sync-backlog-index.js" "Docs/agile"`

Triggers:

| Trigger | Manual fallback command |
|---|---|
| New story or task file created | `node "Docs/.github/functions/sync-backlog-index.js" "Docs/agile"` |
| Story or task status changed | Same as above |
| `depends_on` or `blocks` updated | Same as above |
| Priority changed | Same as above |
| Responsible agent list changed | Same as above |

To preview changes without writing the file, append `--dry-run`:

```bash
node "Docs/.github/functions/sync-backlog-index.js" "Docs/agile" --dry-run
```

---

## 3. Required metadata fields in story and task files

Every `.md` file under `Docs/agile/stories/` or `Docs/agile/tasks/` **must**
contain the following pipe-table rows (exact key names, pipe-delimited):

| Field | Required | Notes |
|---|---|---|
| `**ID**` | ✅ | Format: `E<epic>-S<n>` for stories, `E<epic>-S<n>-T<n>` for tasks |
| `**Priority**` | ✅ | One of: `P0`, `P1`, `P2`, `P3` |
| `**Status**` | ✅ | One of: `Draft`, `In Progress`, `Done`, `Blocked` |
| `**Responsible agent**` | ✅ | One or more agent names, backtick-wrapped |
| `**Depends on**` | ✅ | `—` if none; comma-separated IDs or markdown links otherwise |
| `**Blocks**` | ✅ | `—` if none; comma-separated IDs otherwise |
| `Created at` | ✅ | Set once at creation. Format: `YYYY-MM-DD HH:MM:SS -HH` |
| `Last updated` | ✅ | Refreshed on every edit. Same format |
| `**Epic**` | ✅ for stories | Format: `EPIC-<N> — <title>` |

If a required field is missing, `sync-backlog-index.js` will still produce an
entry but with empty values — which is a data quality error. Fix the source file.

---

## 4. Dependency representation rules

- Use the exact IDs as defined in the `**ID**` field of each artifact.
- In the `.md` file, `**Depends on**` and `**Blocks**` may use markdown links for
  readability, e.g. `[E0-S1 — Title](story-E0S1-repository-diagnosis.md)`.
- `sync-backlog-index.js` strips link markup and extracts bare IDs automatically.
- Do not create circular dependencies. After regenerating the index, the script
  reports detected cycles — resolve them before committing.

---

## 5. Status lifecycle

Valid status transitions:

```
Draft → In Progress → Done
          ↓
        Blocked → In Progress
```

- A story moves to **In Progress** when its first task begins.
- A story moves to **Blocked** when a hard dependency is not yet `Done`.
- A story is **Done** only when all its tasks are `Done` and its Definition of
  Done checklist is signed.
- Never set a story to `Done` manually in the `.md` file without completing the
  DoD checklist.

---

## 6. Regeneration frequency during active development

- After each story or task creation: regenerate immediately.
- After each status update: regenerate at the end of the work session.
- Before producing any epic closure report or execution guide: regenerate once
  to ensure the index is up to date.

---

## 7. Version field

The `version` field in `backlog-index.json` follows semver. Increment it when:

| Change | Version bump |
|---|---|
| New items added or items removed | Minor (e.g. `1.0.0 → 1.1.0`) |
| Schema changes (new fields) | Major (e.g. `1.1.0 → 2.0.0`) |
| Metadata-only updates (status, dates) | Patch (e.g. `1.0.1`) |

The `sync-backlog-index.js` script does not manage version bumps automatically.
Update the `version` field in the generated JSON by hand (or via a future
`bump-backlog-version.js` function) after regenerating.
