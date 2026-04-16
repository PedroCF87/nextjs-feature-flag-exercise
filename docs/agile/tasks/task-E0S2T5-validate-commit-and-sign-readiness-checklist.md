# Task E0-S2-T5 — Validate, commit, and sign readiness checklist

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S2-T5 |
| **Story** | [E0-S2 — Minimum AI Layer Configuration](../stories/story-E0S2-minimum-ai-layer.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `git-ops` |
| **Skills** | `validate-ai-layer-coverage`, `copilot-env-setup` |
| **Depends on** | [E0-S2-T1](task-E0S2T1-adapt-and-deploy-global-rules-to-fork.md), [E0-S2-T2](task-E0S2T2-adapt-and-deploy-instructions-to-fork.md), [E0-S2-T3](task-E0S2T3-adapt-and-deploy-agents-and-skills-to-fork.md), [E0-S2-T4](task-E0S2T4-create-copilot-setup-steps-yml-and-configure-governance.md) |
| **Blocks** | E0-S3, E0-S4, EPIC-1 |
| Created at | 2026-04-11 15:14:45 -03 |
| Last updated | 2026-04-14 12:00:00 -03 |

---

## 1) Task statement

> **Execution context:** T5 runs **locally in VS Code** (Epic 0 local execution model — no PR required).
> T1–T4 must all be committed to `exercise-1` before this task starts.
> Define `REPO_ROOT` once at the start of any shell session:
> ```bash
> REPO_ROOT="$(git rev-parse --show-toplevel)"
> ```
> **T5 does NOT make a bundle commit.** T1–T4 each committed their own artifacts directly to
> `exercise-1`. T5 scope: (1) verify all 11 artifacts exist, (2) trigger the dry-run,
> (3) create the AI Layer coverage report, (4) commit the coverage report directly to `exercise-1`.

Verify all T1–T4 AI Layer artifacts exist in the fork (each committed directly to `exercise-1`), trigger the `copilot-setup-steps.yml` dry-run via GitHub Actions, document the run ID, and produce and commit the AI Layer coverage report.

This task is the Story E0-S2 exit gate — it does not proceed until every prior task's artifacts are confirmed present and the dry-run passes.

---

## 2) Verifiable expected outcome

1. `check-ai-layer-files.js` with all 11 deployed artifact paths exits `0` — all paths show `✅`.
2. Commit `chore(ai-layer): deploy minimum AI Layer baseline for Exercise 1` exists on the fork branch (derived from `exercise-1`).
3. `git log --oneline -1` in the fork shows this commit hash and subject.
4. `copilot-setup-steps.yml` dry-run executed in GitHub Actions with a documented run ID and `✅` status for all 7 steps.
5. AI Layer coverage report exists at `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` with all 6 checklist items marked `✅`.

---

## 3) Detailed execution plan


### Step 0 — Hard dependency pre-check (T0 artifacts + remotes)

Before any operation, confirm:

1. Required skills/functions exist in `docs/.github/`:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/skills/validate-ai-layer-coverage/SKILL.md" \
  ".github/skills/copilot-env-setup/SKILL.md" \
  ".github/functions/check-ai-layer-files.js" \
  ".github/functions/validate-workflow-file.js"
```

2. `origin` is a personal fork (not the upstream/original repository):

```bash
cd "$REPO_ROOT"
git remote get-url origin
```

🔴 **Stop conditions:**
- Any `❌` in the dependency check → return to T0/T4 and create missing artifacts.
- `origin` URL contains `dynamous-business/nextjs-feature-flag-exercise` → return to E0-S1-T1 and reconfigure remotes before proceeding.

### Step 1 — Pre-commit: verify all 11 deployed artifacts

Before proceeding, run the full existence check:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".github/copilot-instructions.md" \
  ".github/instructions/feature-flag-exercise.instructions.md" \
  ".github/instructions/coding-agent.instructions.md" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".github/skills/analyze-rdh-workflow/SKILL.md" \
  ".github/skills/gap-analysis/SKILL.md" \
  ".github/skills/write-technical-manual/SKILL.md" \
  ".github/skills/system-evolution-retro/SKILL.md" \
  ".github/workflows/copilot-setup-steps.yml"
```

🔴 **All 11 lines must show `✅`.** Any `❌` is a blocker — return to the responsible task (T1 for global rules, T2 for instructions, T3 for agents/skills, T4 for workflow).

**Stop condition:** all 11 lines `✅`. Do not proceed to Step 2 until this check passes.

### Step 2 — Pre-commit: validate workflow file structure

Run `validate-workflow-file.js` one final time:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/validate-workflow-file.js" \
  "$REPO_ROOT/.github/workflows/copilot-setup-steps.yml"
```

**Expected:** exit code `0`, all 4 checks `✅`.

🔴 **Stop if any check fails.** Fix the workflow YAML and re-run T4 Step 4 before proceeding.

### Step 3 — Verify T1–T4 artifacts are committed in the fork

Each of T1, T2, T3, T4 committed its own artifacts directly to `exercise-1`.
Confirm their commits are visible in the branch history:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
git -C "$REPO_ROOT" log --oneline -10
```

Expected: the log shows at minimum these 4 commit messages (order may vary):
- `feat(ai-layer): deploy fork-scoped global copilot rules` (T1)
- `feat(ai-layer): deploy adapted instructions to fork` (T2)
- `feat(ai-layer): deploy adapted agents and skills to fork` (T3)
- `feat(ai-layer): add copilot-setup-steps workflow and governance checklist` (T4)

**Stop condition:** all 11 paths from Step 1 show `✅`. If any path is `❌`, the responsible task's commit is missing — block and return to that task.

### Step 4 — Verify remote is a personal fork

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
git -C "$REPO_ROOT" remote get-url origin
```

**Stop condition:** URL must NOT be `dynamous-business/nextjs-feature-flag-exercise`. If it is, block — return to E0-S1-T1 and configure a personal fork first.

### Step 5 — Trigger the dry-run workflow

Go to the fork on GitHub: `https://github.com/<your-username>/nextjs-feature-flag-exercise/actions/workflows/copilot-setup-steps.yml`

1. Click "Run workflow".
2. Select branch: `exercise-1`.
3. Click "Run workflow" to confirm.
4. Wait for the run to complete.
5. Record the run ID (visible in the URL: `runs/<run-id>`).

**Expected:** all 7 steps pass:
- ✅ Checkout repository
- ✅ Set up Node.js
- ✅ Install pnpm
- ✅ Install server dependencies
- ✅ Install client dependencies
- ✅ Validate server (build + test)
- ✅ Validate client (build)

### Step 6 — Sign the AI Layer coverage report

Using the `validate-ai-layer-coverage` skill, produce the coverage report at `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md`:

**6-item minimum readiness checklist (from `ai-development-environment-catalog.md §6`):**

| # | Item | Evidence path | Status |
|---|---|---|---|
| 1 | Codebase audit completed for the exercise repository | `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` | ✅ (E0-S1-T4) |
| 2 | Migration plan produced (config-migration-plan skill or equivalent) | `nextjs-feature-flag-exercise/.agents/governance/copilot-environment-checklist.md` | ✅ (E0-S2-T4) |
| 3 | Responsible agent and skill files exist for all macro phases | T5 check-ai-layer-files.js output | ✅ (E0-S2-T3) |
| 4 | Copilot setup validated by `copilot-setup-steps.yml` dry-run | GitHub Actions run ID: `<RECORD_ID>` | ✅ (E0-S2-T5 Step 5) |
| 5 | All AI Layer artifacts committed with traceability | `git log --oneline -1` output | ✅ (E0-S2-T5 Step 3) |
| 6 | Coverage report produced and saved | `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` | ✅ (E0-S2-T5 Step 6) |

Replace `<RECORD_ID>` with the actual GitHub Actions run ID recorded in Step 5.

### Step 7 — Commit coverage report

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
mkdir -p .agents/validation
git add .agents/validation/ai-layer-coverage-report.md
git status  # confirm only the coverage report is staged
git commit -m "docs(ai-layer): add E0-S2 AI Layer coverage report with dry-run evidence"
git push origin exercise-1
```

After committing, update `docs/agile/stories/story-E0S2-minimum-ai-layer.md`:
change `**Status**` from `In Progress` to `Done`.

```bash
node "$REPO_ROOT/docs/.github/functions/sync-backlog-index.js" "$REPO_ROOT/docs/agile"
```

---

## 4) Architecture and security requirements

**Input validation:**
- Run `check-ai-layer-files.js` (Step 1) and `validate-workflow-file.js` (Step 2) before any git commit. Never skip pre-commit checks.
- Verify `git remote -v` shows origin pointing to the personal fork before `git push`.

**Secrets handling:**
- The commit must not include `.env`, `*.pem`, API keys, or credential files. Run `git status` before `git add .github/` to confirm only AI Layer files are staged.
- The GitHub Actions dry-run uses the `ANTHROPIC_API_KEY` from the `copilot` environment secret — it is never committed to the repository.

**Rollback/fallback:**
- If the dry-run fails: fix the failing step (e.g., pnpm version mismatch, build error) and retrigger via `workflow_dispatch`. Do not mark this task Done until at least one clean dry-run run ID is documented.
- If the push fails due to fork not configured: block story completion; return to E0-S1-T1. Document the blocker in the preparation friction log.
- If `check-ai-layer-files.js` shows any `❌`: do not commit — return to the responsible task.

**Architecture boundary:**
- This task operates only on `nextjs-feature-flag-exercise/` (fork) and `docs/.github/functions/` (validation scripts). It does not modify `docs/agile/` artifacts — the hook will not fire for these operations.
- The coverage report at `.agents/validation/ai-layer-coverage-report.md` is a fork-side artifact — it is committed in a follow-on commit (not the E0-S2 bundle commit) since it contains the dry-run run ID which is only known after Step 5.

---

## 5) Validation evidence

### Command 1 — Full pre-commit existence check

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".github/copilot-instructions.md" \
  ".github/instructions/feature-flag-exercise.instructions.md" \
  ".github/instructions/coding-agent.instructions.md" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".github/skills/analyze-rdh-workflow/SKILL.md" \
  ".github/skills/gap-analysis/SKILL.md" \
  ".github/skills/write-technical-manual/SKILL.md" \
  ".github/skills/system-evolution-retro/SKILL.md" \
  ".github/workflows/copilot-setup-steps.yml"
```

**Expected:** exit code `0`, all 11 lines `✅`.

### Command 2 — Commit verification

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
git -C "$REPO_ROOT" log --oneline -5
```

**Expected:** output shows the 4 T1–T4 commit subjects (no single bundle commit expected from T5).

### Command 3 — Coverage report existence

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
ls -la "$REPO_ROOT/.agents/validation/ai-layer-coverage-report.md"
```

**Expected:** exit code `0`, file listed with size > 0.

### BDD verification signal

**Given** all AI Layer artifacts from T1, T2, T3, T4 are committed in the fork (each via its own direct commit to `exercise-1`)
**When** I run `check-ai-layer-files.js` with all 11 paths and all show `✅`, verify the 4 individual commit messages exist in the branch history, and trigger the `copilot-setup-steps.yml` `workflow_dispatch` dry-run
**Then** the dry-run workflow in GitHub Actions completes with all 7 steps passing
**And** the coverage report at `.agents/validation/ai-layer-coverage-report.md` exists with all 6 readiness items marked `✅`
**And** the dry-run GitHub Actions run ID is documented in the coverage report
**And** the coverage report is committed directly to `exercise-1`

**Affected files:**

| File | Action |
|---|---|
| `nextjs-feature-flag-exercise/.github/copilot-instructions.md` | Committed |
| `nextjs-feature-flag-exercise/.github/instructions/feature-flag-exercise.instructions.md` | Committed |
| `nextjs-feature-flag-exercise/.github/instructions/coding-agent.instructions.md` | Committed |
| `nextjs-feature-flag-exercise/.github/agents/rdh-workflow-analyst.agent.md` | Committed |
| `nextjs-feature-flag-exercise/.github/agents/codebase-gap-analyst.agent.md` | Committed |
| `nextjs-feature-flag-exercise/.github/agents/technical-manual-writer.agent.md` | Committed |
| `nextjs-feature-flag-exercise/.github/skills/analyze-rdh-workflow/SKILL.md` | Committed |
| `nextjs-feature-flag-exercise/.github/skills/gap-analysis/SKILL.md` | Committed |
| `nextjs-feature-flag-exercise/.github/skills/write-technical-manual/SKILL.md` | Committed |
| `nextjs-feature-flag-exercise/.github/skills/system-evolution-retro/SKILL.md` | Committed |
| `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` | Committed |
| `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` | Created (separate follow-on commit after dry-run) |

---

## 6) Definition of Done

- [x] `check-ai-layer-files.js` with all 11 paths exits `0` — all lines `✅`.
- [x] `validate-workflow-file.js` exits `0` — all 4 structural checks `✅`.
- [x] T1–T4 individual commit messages are present in `git log --oneline -10` output.
- [x] `copilot-setup-steps.yml` dry-run triggered and all 7 steps passed. Run ID: `24424611417`.
- [x] GitHub Actions run ID documented in the coverage report.
- [x] Coverage report exists at `.agents/validation/ai-layer-coverage-report.md` with all 6 items `✅`.
- [x] Coverage report committed directly to `exercise-1` (commit `c580537`).
- [x] Story E0-S2 status updated to `Done`.
