# Task E0-S4-T1 — Verify EPIC-0 DoD evidence

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S4-T1 |
| **Story** | [E0-S4 — Preparation Closure and Handoff to EPIC-1](../stories/story-E0S4-preparation-closure.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Draft |
| **Responsible agent** | `project-adaptation-analyst` |
| **Depends on** | [E0-S4-T0 — Bootstrap AI Layer artifacts](../tasks/task-E0S4T0-bootstrap-ai-layer-artifacts.md) |
| **Blocks** | E0-S4-T2, E0-S4-T3 |
| Created at | 2026-04-11 20:50:15 -03 |
| Last updated | 2026-04-12 15:13:58 -03 |

---

## 1) Task statement

As a delivery agent, I want to systematically verify all 13 EPIC-0 DoD items against evidence from E0-S1, E0-S2, and E0-S3 so that the closure report in T2 is grounded in objective, traceable evidence rather than assumptions.

> **Execution context:** T1 runs **locally in VS Code** under the Epic 0 local execution rule — no GitHub Issue, no PR, no feature branch. All commits go directly to `exercise-1`. Define
> `REPO_ROOT="$(git rev-parse --show-toplevel)"` once and use it for all commands.
> This task writes exactly one file: `.agents/closure/dod-status-draft.md`.

---

## 2) Verifiable expected outcome

- A `dod-status-draft.md` file is written to `nextjs-feature-flag-exercise/.agents/closure/`, with all 13 EPIC-0 DoD items rated ✅, ⚠️, or ❌ and at least one file reference each.
- No ❌ item is left without a mitigation note.
- 5 critical AI Layer artifacts are verified present via `check-ai-layer-files.js --table`.
- Top 3 friction points (from the canonical friction log) are included in the draft file and ready to be copied into the closure report (T2).

---

## 3) Detailed execution plan

### Step 0 — Verify environment state

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-prereqs.js" exercise-1 "$REPO_ROOT"
```

**Expected:** all checks pass (Node.js version, pnpm version, branch = `exercise-1`). If branch is wrong, stop and resolve first.

### Step 1 — Check critical artifact presence

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".github/copilot-instructions.md" \
  ".github/workflows/copilot-setup-steps.yml" \
  ".agents/diagnosis/codebase-audit.md" \
  ".agents/validation/ai-layer-coverage-report.md" \
  ".agents/baseline/measurement-baseline.md" \
  --table
```

**Expected:** all 5 show `✅`. Record table output — paste it into T2's closure report Section 1. Any `❌` must be addressed before proceeding.

### Step 2 — Read E0-S1 evidence

Read `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md`.

Note these DoD signals:
- [ ] Fork created
- [ ] Remotes configured (origin = personal fork, upstream = dynamous-business)
- [ ] Codebase audit documented with architecture findings
- [ ] `check-prereqs.js` pass documented

Check the current remote configuration:

```bash
git -C "$REPO_ROOT" remote get-url origin
```

**If output is** `git@github.com:dynamous-business/nextjs-feature-flag-exercise.git` **(upstream, not a personal fork):** mark DoD item 2 "Remotes configured and validated" as ⚠️ with note: "Remote safety issue — origin = upstream (see E0-S1-T1 blocker)."  
**If output is a personal fork URL:** mark DoD item 2 as ✅.

### Step 3 — Read E0-S2 evidence

Read `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md`.

Note these DoD signals:
- [ ] `copilot-instructions.md` present and correct
- [ ] `copilot-setup-steps.yml` present and valid
- [ ] AI Layer coverage ≥ minimum threshold
- [ ] Validation report signed with timestamp

### Step 4 — Read E0-S3 evidence

Read `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md`.

Note these DoD signals:
- [ ] 4 measurement dimensions defined (with scale anchors 1/3/5)
- [ ] Time-zero snapshot captured with `git-info.js` SHA
- [ ] Go/No-Go checklist visibly signed (all ✅)
- [ ] `READY — Exercise 1 may begin.` declaration present

### Step 5 — Build EPIC-0 DoD status map

Read Section 3 (Definition of Done) from `docs/epics/Epic 0 — Environment Preparation for Exercise 1.md`.

For each of the 13 EPIC-0 DoD items, assign:
- ✅ confirmed by evidence (add file reference)
- ⚠️ partial (note limitation)
- ❌ missing (add mitigation note — required before T2)

Keep the map in memory — it will be persisted to a file in Step 7.

### Step 6 — Identify top 3 friction points

Read the canonical friction log:

```
nextjs-feature-flag-exercise/.agents/templates/friction-log.md
```

From the `## Log` table, select the 3 entries with the highest impact (`high` first, then `medium`, then `low`). If fewer than 3 entries exist, include all.

For each friction point record:
- Phase (E0-S1 / E0-S2 / E0-S3 — from the `Story` column)
- Description (from the `Description` column)
- Impact (`high` / `medium` / `low`)
- Source: `nextjs-feature-flag-exercise/.agents/templates/friction-log.md`

### Step 7 — Write `dod-status-draft.md` and verify

This is the only file this task writes.

Create the output directory if absent:

```bash
mkdir -p "$REPO_ROOT/.agents/closure"
```

Write `$REPO_ROOT/.agents/closure/dod-status-draft.md` with this structure:

```markdown
# EPIC-0 DoD Status Draft

<!-- artifact_id: epic0-dod-status-draft -->
<!-- epic_id: EPIC-0 -->
<!-- story_id: E0-S4 -->
<!-- produced_at: <datetime.js output> -->
<!-- produced_by: project-adaptation-analyst -->

## DoD Checklist

| # | DoD Item | Status | Evidence |
|---|---|---|---|
| 1 | Personal fork created and linked to local workspace, with `exercise-1` confirmed as baseline branch. | ✅/⚠️/❌ | <file ref> |
| 2 | Remotes configured and validated (`origin` = fork, `upstream` = original repository). | ✅/⚠️/❌ | <file ref> |
| 3 | Codebase audit completed and findings documented. | ✅/⚠️/❌ | <file ref> |
| 4 | Task and acceptance criteria understood and recorded. | ✅/⚠️/❌ | <file ref> |
| 5 | AI Layer artifacts adapted and applied with versioned commits. | ✅/⚠️/❌ | <file ref> |
| 6 | Required fork settings configured. | ✅/⚠️/❌ | <file ref> |
| 7 | Server and client validation commands successfully executed in the local environment. | ✅/⚠️/❌ | <file ref> |
| 8 | Baseline metrics template defined and ready for collection during implementation. | ✅/⚠️/❌ | <file ref> |
| 9 | Preparation friction points and decisions recorded. | ✅/⚠️/❌ | <file ref> |
| 10 | At least one workflow dry-run executed successfully. | ✅/⚠️/❌ | <file ref> |
| 11 | Branch safety confirmed. | ✅/⚠️/❌ | <file ref> |
| 12 | All items from Checklist mínimo de prontidão satisfied. | ✅/⚠️/❌ | <file ref> |
| 13 | Documented evidence of preparation exists. | ✅/⚠️/❌ | <file ref> |

## Top 3 Friction Points

| Phase | Description | Impact | Source |
|---|---|---|---|
| E0-S? | <description> | high/medium/low | `.agents/templates/friction-log.md` |
| E0-S? | <description> | high/medium/low | `.agents/templates/friction-log.md` |
| E0-S? | <description> | high/medium/low | `.agents/templates/friction-log.md` |
```

Fill all placeholders from evidence gathered in Steps 1–6.

Verify output exists:

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".agents/closure/dod-status-draft.md"
```

Expected: `✅`.

### Step 8 — Commit and push DoD draft

```bash
cd "$REPO_ROOT"
git checkout -b exercise-1/epic0-dod-status-draft
git add .agents/closure/dod-status-draft.md
git status  # confirm only this file is staged
git commit -m "docs(epic0): add EPIC-0 DoD status draft"
git push origin exercise-1/epic0-dod-status-draft
```

Open a PR against `exercise-1` and merge before T2 starts.

---

## 4) Architecture and security requirements

- **Single-write task** — this task reads existing artifacts and writes only `.agents/closure/dod-status-draft.md`.
- **No assumptions** — every DoD status must cite a specific file path or command output. "Assumed done" is not acceptable.
- **Remote safety awareness** — if the fork remote issue (origin = upstream) is detected, flag it as ⚠️ and include it as a residual risk in the DoD map. Do not mark it ✅.
- **Rollback** — if any critical artifact from Step 1 is missing, stop and return to the producing story (E0-S1, E0-S2, or E0-S3) to fix it before continuing.

---

## 5) Validation evidence

| Check | Command | Expected output |
|---|---|---|
| Environment valid | `node "$REPO_ROOT/docs/.github/functions/check-prereqs.js" exercise-1 "$REPO_ROOT"` | All checks pass, exit code 0 |
| All 5 artifacts present | `node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" ".github/copilot-instructions.md" ".github/workflows/copilot-setup-steps.yml" ".agents/diagnosis/codebase-audit.md" ".agents/validation/ai-layer-coverage-report.md" ".agents/baseline/measurement-baseline.md" --table` | All 5 rows show `✅` |
| Baseline READY signed | `grep -l "READY" "$REPO_ROOT/.agents/baseline/measurement-baseline.md"` | Path echoed (non-empty) |
| DoD status map built | `node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" ".agents/closure/dod-status-draft.md"` | `✅ .agents/closure/dod-status-draft.md` |

### BDD verification signal

**Given** E0-S1, E0-S2, and E0-S3 artifacts exist and T0 is complete,  
**When** Steps 0–8 are executed in order,  
**Then** a 13-item DoD status map with evidence references and top-3 friction list is ready for T2's closure report.

---

## 6) Definition of Done

- [ ] `check-prereqs.js exercise-1` exits 0.
- [ ] `check-ai-layer-files.js --table` shows `✅` for all 5 critical artifacts.
- [ ] `measurement-baseline.md` contains `READY — Exercise 1 may begin.` declaration.
- [ ] 13-item EPIC-0 DoD status map is built with no empty status cells.
- [ ] Every ❌ item has a mitigation note.
- [ ] Top 3 friction points are identified with phase, description, impact, and source reference.
- [ ] `dod-status-draft.md` exists in `.agents/closure/` and is ready for T2 consumption.
- [ ] Branch `exercise-1/epic0-dod-status-draft` pushed and PR merged into `exercise-1`.
