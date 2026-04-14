---
applyTo: "nextjs-feature-flag-exercise/.agents/templates/friction-log.md"
---
# Friction Log — Always-On Instructions

## 1. What counts as a friction point

A friction point is any event during story execution that caused one or more of
the following:

| Category | Examples |
|---|---|
| **Blocker** | A tool failed (build error, missing dependency, wrong Node version). Story had to wait or be restarted. |
| **Rework** | An artifact was created and then had to be substantially changed because requirements were misunderstood. |
| **Ambiguity** | A task description was unclear and required clarification before work could continue. |
| **Tool failure** | A CLI command produced unexpected output, timed out, or was unavailable. |
| **Environment issue** | A config file, secret, port, or path was wrong and blocked execution. |

Do **not** record:
- Minor typo corrections in a file.
- Routine decisions (choosing between two valid approaches).
- Events that resolved in under 2 minutes without blocking progress.

---

## 2. When to record

Record a friction point **at the moment you encounter it**, not retroactively.

> If you find yourself writing "this turned out to be harder than expected" in a
> story's notes — that is a friction point. Stop and record it now.

One entry per friction event. If the same issue recurs in a later story, record
a new entry for that story.

---

## 3. Entry format rules

Each entry is a single row in the friction log table:

```
| # | Story | Timestamp | Description | Impact |
```

- **#** — Sequential integer, auto-assigned by `append-friction-log.js`. Never edit manually.
- **Story** — The ID of the story where the friction occurred (e.g. `E0-S1`).
- **Timestamp** — Set by `append-friction-log.js` via `datetime.js`. Never set manually.
- **Description** — One sentence (max 120 characters). No markdown links, no newlines, no pipe characters.
- **Impact** — One of: `high` | `medium` | `low` (see §4).

**Never edit the `#` or `Timestamp` columns directly.** Use `append-friction-log.js` for all additions.

---

## 4. Impact levels

| Level | Meaning | Examples |
|---|---|---|
| `high` | Blocked story progress for > 30 min or required reverting completed work | Build suite failure, wrong base branch, broken migration |
| `medium` | Delayed progress 10–30 min or required consulting external docs | Ambiguous AC, unexpected API response shape, config mismatch |
| `low` | Minor inconvenience resolved in < 10 min | Typo in a command, missing `--` flag, wrong argument order |

---

## 5. How E0-S4 consumes the log

During **E0-S4 T0 (AI Layer coverage audit)**, the `project-adaptation-analyst`
agent reads `friction-log.md` and:

1. Counts entries by impact level to produce the friction summary table in the
   Epic 0 closure report.
2. Identifies any `high`-impact entries that suggest a systemic risk to carry
   forward into the EPIC-1 risk register.
3. Checks that no story is missing a friction entry when its DoD notes mention
   unexpected blockers.

The log is **read-only** during E0-S4. Do not add or edit entries at closure
time — the record must reflect what happened during execution, not after.

---

## 6. Tooling

Always use `append-friction-log.js` to add entries. Never edit the table rows
manually.

```bash
node "Docs/.github/functions/append-friction-log.js" \
  "<abs-repo-path>" "<story-id>" "<one-sentence description>" \
  [--impact high|medium|low]
```

Example:

```bash
node "Docs/.github/functions/append-friction-log.js" \
  "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" \
  "E0-S1" \
  "pnpm install failed: engine incompatibility with Node 22" \
  --impact high
```
