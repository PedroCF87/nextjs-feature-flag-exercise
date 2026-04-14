---
name: record-time-zero-snapshot
description: Capture and sign the pre-implementation time-zero baseline snapshot, including validations, AI Layer checks, and go/no-go status.
---

# Skill — Record Time-Zero Snapshot

## Metadata

- **Created at:** 2026-04-09 23:01:57 -03
- **Last updated:** 2026-04-09 23:01:57 -03

---

## Description

Execute the time-zero pre-implementation snapshot for an exercise baseline: run all validation commands, capture their output, verify AI Layer file presence, fill all template placeholders, evaluate the go/no-go checklist, and produce the signed declaration — then commit the completed document to the fork.

Use this skill for **Task E0-S3-T3**. Reuse it at the start of any subsequent exercise to re-lock the baseline before implementation begins.

---

## Prerequisites

- `generate-measurement-template` skill has already produced the template at `{fork_root}/.agents/baseline/measurement-baseline.md`.
- `validate-exercise-environment` skill has been run at least once and the environment is known to pass (E0-S1 evidence exists).
- E0-S1 and E0-S2 stories are in **Done** state.
- `git-ops` agent is available for the final commit.

---

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `fork_root` | string | ✅ | Absolute path to the fork's root directory |
| `template_path` | string | optional | Defaults to `{fork_root}/.agents/baseline/measurement-baseline.md` |
| `branch` | string | optional | Defaults to `exercise-1` |

---

## Process

### Phase 1 — Confirm prerequisite stories

1. Open `Docs/agile/stories/story-E0S1-repository-diagnosis.md` and confirm `Status: Done`.
2. Open `Docs/agile/stories/story-E0S2-minimum-ai-layer.md` and confirm `Status: Done`.
3. If either is not Done: **stop**, record the blocking gap in the template's friction log, and do not proceed to Phase 2.

### Phase 2 — Capture environment state

4. Run the validation suite via the `validate-exercise-environment` skill (or execute the 7 commands individually) from the `{fork_root}` directory:
   ```bash
   cd server && pnpm run build
   cd server && pnpm run lint
   cd server && pnpm test
   cd client && pnpm run build
   cd client && pnpm run lint
   node --version
   pnpm --version
   ```
5. Record each command's exit code and a one-line output snippet (first meaningful output line).
6. Run `git log --oneline -1` on `{branch}` to obtain the last commit SHA.
7. Run `git branch --show-current` to confirm the active branch.
8. Run `node "Docs/.github/functions/datetime.js"` to obtain the snapshot timestamp.

### Phase 3 — Verify AI Layer file presence

9. For each file in the default AI Layer checklist, run `ls` or `test -f` to confirm existence:
   ```bash
   test -f "{fork_root}/.github/copilot-instructions.md" && echo "✅" || echo "❌"
   test -f "{fork_root}/.github/instructions/feature-flag-exercise.instructions.md" && echo "✅" || echo "❌"
   test -f "{fork_root}/.github/instructions/coding-agent.instructions.md" && echo "✅" || echo "❌"
   ls "{fork_root}/.github/agents/" | wc -l   # expect ≥ 3
   ls "{fork_root}/.github/skills/" | wc -l   # expect ≥ 4 directories
   test -f "{fork_root}/.github/workflows/copilot-setup-steps.yml" && echo "✅" || echo "❌"
   ```
10. Record ✅ or ❌ for each item.

### Phase 4 — Fill template placeholders

11. Open `{template_path}` and fill every `[FILL IN]` in Sections 1 and 3:
    - **Section 1 metadata:** date (today), branch, last commit SHA, Node.js version, pnpm version, Created at (use `file-stats.js` mtime after edit).
    - **Section 3 pre-implementation table:** one row per validation command with exit code, output snippet, and ✅/❌.
    - **Section 3 AI Layer sub-table:** one row per artifact with ✅/❌.
12. Leave Sections 5–8 (time, prompts, rework, confidence) as `[FILL IN]` — these are captured during EPIC-1 execution, not now.

### Phase 5 — Evaluate and sign go/no-go checklist

13. For each of the 9 go/no-go items in Section 9, evaluate based on collected evidence:
    | Item | Evidence source |
    |---|---|
    | Fork created, remotes configured | `git remote -v` output shows `origin` + `upstream` |
    | `exercise-1` confirmed as working base | `git branch --show-current` output |
    | All 7 validation commands pass | Phase 2 outputs all exit 0 |
    | Codebase audit completed | `{fork_root}/.agents/diagnosis/codebase-audit.md` exists |
    | AI Layer baseline deployed | `validate-ai-layer-coverage` skill report — all ✅ |
    | `copilot-setup-steps.yml` dry-run successful | Friction log or `.agents/` note with run ID |
    | Template filled to time zero | Phase 4 complete — no `[FILL IN]` in Sections 1 + 3 |
    | Capture method documented | Section 2 of template contains the method |
    | No critical blockers open | No ❌ in validation suite; no ❌ in AI Layer checklist |
14. Mark each item ✅ or ❌.
15. If all 9 are ✅: set **Status** to `READY` and **Signed at** to current timestamp from `datetime.js`.
16. If any ❌: set **Status** to `NOT READY`, list blocking items under a "Blockers" heading, and do **not** sign.

### Phase 6 — Commit (only if Status = READY)

17. Stage the completed template:
    ```bash
    git add .agents/baseline/measurement-baseline.md
    ```
18. Commit via `git-ops` agent with the exact message:
    ```
    chore(baseline): record measurement baseline and sign EPIC-1 go/no-go checklist
    ```
19. Push to the fork branch (not `main`).
20. Record the commit SHA in the story friction log or in a note under `{fork_root}/.agents/baseline/`.

---

## Output

- `{template_path}` with Sections 1 and 3 fully populated and Section 9 signed.
- Console summary:
  ```
  Validation suite: 7/7 pass
  AI Layer: 11/11 present
  Go/no-go: 9/9 ✅
  Status: READY
  Signed at: YYYY-MM-DD HH:MM:SS ±HH
  Commit: <SHA>
  ```
- If NOT READY: blockers list printed; no commit made.

---

## Quality checklist

- [ ] Phase 1 confirmed both prerequisite stories are Done before proceeding.
- [ ] All 7 validation commands run and exit codes recorded (not assumed).
- [ ] All AI Layer file presence checks run with real `test -f` or `ls` (not assumed).
- [ ] No `[FILL IN]` remains in Sections 1 and 3 of the template.
- [ ] Sections 5–8 still contain `[FILL IN]` (not pre-filled).
- [ ] Go/no-go checklist evaluated against real evidence paths (not assumed).
- [ ] If READY: signed with timestamp from `datetime.js`; commit exists on fork branch.
- [ ] If NOT READY: blockers documented; no commit made.

---

## Do not

- Do not sign the checklist if any validation command exits non-zero.
- Do not sign the checklist if any AI Layer file is ❌.
- Do not commit if Status is NOT READY.
- Do not fill Sections 5–8 — those are captured during EPIC-1 execution.
- Do not run this skill before the `generate-measurement-template` skill has created the template.
- Do not push to `main` — always use a branch derived from `exercise-1`.
