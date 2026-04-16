# Task E0-S4-T3 — Produce epic1-handoff.md

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S4-T3 |
| **Story** | [E0-S4 — Preparation Closure and Handoff to EPIC-1](../stories/story-E0S4-preparation-closure.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Done |
| **Responsible agent** | `project-adaptation-analyst` |
| **Depends on** | [E0-S4-T0 — Bootstrap AI Layer artifacts](../tasks/task-E0S4T0-bootstrap-ai-layer-artifacts.md), [E0-S4-T1 — Verify EPIC-0 DoD evidence](../tasks/task-E0S4T1-verify-epic-0-dod-evidence.md), [E0-S4-T2 — Produce epic0-closure-report.md](../tasks/task-E0S4T2-produce-epic0-closure-report-md.md) |
| **Blocks** | E0-S4-T4 |
| Created at | 2026-04-11 20:50:15 -03 |
| Last updated | 2026-04-14 20:29:04 -03 |

---

## 1) Task statement

As a delivery agent, I want to produce `epic1-handoff.md` with live branch state, AI Layer coverage, TASK.md key criteria, known risks, and a signed Go/No-Go statement so that the EPIC-1 implementation agent can begin immediately with zero preparation research.

> **Execution context:** T3 runs **locally in VS Code** under the Epic 0 local execution rule — no GitHub Issue, no PR, no feature branch. All commits go directly to `exercise-1`.
> Define `REPO_ROOT="$(git rev-parse --show-toplevel)"` first and use it for all commands.
> T3 writes one artifact (`.agents/closure/epic1-handoff.md`) and must finish with a
> commit to `exercise-1` before T4 starts.

---

## 2) Verifiable expected outcome

- `nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md` exists.
- The file has HTML comment front-matter (as per `documentation.instructions.md` §2) and all 6 required sections (`## 1 —` through `## 6 —` headings).
- Section 1 shows a Field/Value table with branch + SHA matching live `git-info.js --branch-ref` output.
- Section 6 contains `> **READY — EPIC-1 may begin.**` blockquote with a valid timestamp.

---

## 3) Detailed execution plan

### Step 0 — Capture live branch + SHA

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/git-info.js" \
  "$REPO_ROOT" \
  --branch-ref
```

Record output (e.g. `exercise-1 @ abc1234`). Use it in Section 1.

### Step 1 — Capture AI Layer coverage table

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".github/copilot-instructions.md" \
  ".github/workflows/copilot-setup-steps.yml" \
  ".github/instructions/feature-flag-exercise.instructions.md" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".github/skills/analyze-rdh-workflow/SKILL.md" \
  ".github/skills/gap-analysis/SKILL.md" \
  ".github/skills/write-technical-manual/SKILL.md" \
  ".github/skills/system-evolution-retro/SKILL.md" \
  --table
```

Record the full table output. Paste it into Section 2. Items showing `❌` are coverage gaps — note them in Section 5 (Known Risks).

### Step 2 — Get timestamp for front matter and Go/No-Go

```bash
node "$REPO_ROOT/docs/.github/functions/datetime.js"
```

Record as `<produced_at>`.

### Step 3 — Read TASK.md acceptance criteria (exact quotes)

Read `nextjs-feature-flag-exercise/TASK.md` and copy the acceptance criteria **verbatim** into Section 3. Do not paraphrase. If TASK.md lists criteria as bullet points, paste them as-is.

### Step 4 — Create `epic1-handoff.md`

Create `nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md` with this exact structure:

```markdown
# EPIC-1 Handoff Document — Baseline Implementation: Feature Flag Filtering

<!-- artifact_id: epic1-handoff -->
<!-- epic_id: EPIC-1 -->
<!-- produced_at: <produced_at> -->
<!-- produced_by: project-adaptation-analyst -->

---

## 1 — Starting State

| Field | Value |
|---|---|
| Branch + SHA | `<output from git-info.js --branch-ref>` |
| Last upstream sync | <date or commit from git log, or "not yet synced"> |
| Server validation | `cd server && pnpm run build && pnpm run lint && pnpm test` — ✅ (from E0-S1 baseline) |
| Client validation | `cd client && pnpm run build && pnpm run lint` — ✅ (from E0-S1 baseline) |

---

## 2 — AI Layer Coverage

<paste check-ai-layer-files.js --table output here>

---

## 3 — Task Reference

**Task file:** [`nextjs-feature-flag-exercise/TASK.md`](../../TASK.md)

### Key acceptance criteria

<paste verbatim from TASK.md — do not paraphrase>

---

## 4 — First Story to Execute

**Story:** `E1-S1` — [link once story file exists]

**Objective in one sentence:** Implement server-side filtering logic — add query parameter parsing and SQL `WHERE` clause generation to the `GET /api/flags` endpoint so all 5 filtering dimensions work server-side.

---

## 5 — Known Risks

Top 3 risks from codebase audit to monitor during implementation:

| # | Risk | Monitoring Action |
|---|---|---|
| 1 | SQL.js `stmt.free()` leak if filter branch throws | Add `try-finally` in `flagsService.ts`; run test coverage for filter error paths |
| 2 | Zod schema divergence between `shared/types.ts` and `server/middleware/validation.ts` | Validate filter params against shared types in middleware, not ad hoc |
| 3 | `origin` = upstream remote (fork not configured) — blocks any push in T4 | Verify with `git -C <repo> remote get-url origin` before committing; resolve before T4 |

---

## 6 — Go / No-Go

> **READY — EPIC-1 may begin.**

Signed: `project-adaptation-analyst` at `<produced_at>`.

All EPIC-0 DoD items resolved. See [`epic0-closure-report.md`](./epic0-closure-report.md).
```

Replace `<produced_at>` with Step 2 output and the Branch+SHA field with Step 0 output. Paste the AI Layer table from Step 1. Do not leave any `<placeholder>` text.

### Step 5 — Verify file

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".agents/closure/epic1-handoff.md"
```

**Expected:** `✅ .agents/closure/epic1-handoff.md`

### Step 6 — Commit and push

```bash
cd "$REPO_ROOT"
git checkout -b exercise-1/epic1-handoff
git add .agents/closure/epic1-handoff.md
git status  # confirm only this file is staged
git commit -m "docs(epic0): produce EPIC-1 handoff document"
git push origin exercise-1/epic1-handoff
```

Open a PR against `exercise-1` and merge before T4 starts.

**Stop condition:** push succeeds. If `origin` is `dynamous-business/nextjs-feature-flag-exercise`, block — verify personal fork is configured (see remote safety note below).

---

## 4) Architecture and security requirements

- **Skill-driven** — follow the `produce-epic-handoff` skill from `docs/.github/skills/produce-epic-handoff/SKILL.md` for section structure and signing conventions.
- **No secrets** — the handoff document contains only branch state, file paths, and governance text. No tokens, credentials, or env var values.
- **Live SHA required** — the SHA in Section 1 must come from a real `git-info.js` execution at the time of writing, not from memory.
- **Remote safety note** — if `git-info.js` shows `origin = dynamous-business`, add a risk row in Section 5 stating this blocks T4 (push). Section 6 Go/No-Go can still be `READY` for Epic 1 planning purposes, but T4 must note the blocker.
- **Rollback** — if the file is created incorrectly, delete and recreate. This task owns its own commit; T4 does not re-commit this file.

---

## 5) Validation evidence

| Check | Command | Expected output |
|---|---|---|
| File created | `node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" ".agents/closure/epic1-handoff.md"` | `✅ .agents/closure/epic1-handoff.md` |
| Exactly 6 sections | `grep -c "^## [0-9]" "$REPO_ROOT/.agents/closure/epic1-handoff.md"` | `6` |
| READY statement present | `grep "READY — EPIC-1 may begin" "$REPO_ROOT/.agents/closure/epic1-handoff.md"` | Non-empty match |
| Live SHA in Section 1 | compare `git-info.js` SHA with SHA grep from file | Match |
| No placeholders | `grep -c "<placeholder>\|<sha from\|<produced_at>" "$REPO_ROOT/.agents/closure/epic1-handoff.md"` | `0` |

### BDD verification signal

**Given** T1's evidence map, T2's closure report, and live branch state are available,  
**When** Steps 0–6 are executed in order,  
**Then** `epic1-handoff.md` exists with 6 `## N —` sections, HTML comment front-matter, a Field/Value table in Section 1 with live SHA, and the exact signed `> **READY — EPIC-1 may begin.**` blockquote in Section 6.

---

## 6) Definition of Done

- [x] `nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md` exists.
- [x] File has HTML comment front-matter (`<!-- artifact_id: epic1-handoff -->`), not YAML `---` blocks.
- [x] Exactly 6 `## N —` headings are present (`grep -c "^## [0-9]"` → `6`).
- [x] Section 1 is a Field/Value table with branch + SHA matching live `git-info.js --branch-ref` output (`exercise-1 @ 02d8b6c`).
- [x] Section 2 shows AI Layer coverage table from `check-ai-layer-files.js --table` (10/10 ✅).
- [x] Section 3 contains verbatim acceptance criteria from `TASK.md` (11 items).
- [x] Section 6 contains `> **READY — EPIC-1 may begin.**` blockquote with backtick-wrapped agent name and timestamp.
- [x] No `<placeholder>` text remains in the file (`grep -c` → `0`).
- [x] Committed directly to `exercise-1` under Epic 0 local execution rule (no branch/PR required).
