# Task E0-S3-T3 — Record time-zero snapshot and sign go/no-go checklist

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S3-T3 |
| **Story** | [E0-S3 — Definition of Measurement Baseline](../stories/story-E0S3-measurement-baseline.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Draft |
| **Responsible agent** | `agile-exercise-planner` |
| **Depends on** | [E0-S3-T2 — Create measurement capture template](task-E0S3T2-create-measurement-capture-template.md), [E0-S1 — Repository Diagnosis and Readiness](../stories/story-E0S1-repository-diagnosis.md), [E0-S2 — Minimum AI Layer Configuration](../stories/story-E0S2-minimum-ai-layer.md) |
| **Blocks** | — |
| Created at | 2026-04-11 16:43:15 -03 |
| Last updated | 2026-04-11 17:32:15 -03 |

---

## 1) Task statement

Execute the time-zero snapshot for Exercise 1 by filling the baseline template with real environment/validation evidence, evaluating all go/no-go checklist items, and signing readiness only when all items are green.

> **Execution context:** T3 runs as a cloud agent via GitHub Issue in the exercise fork. `REPO_ROOT` is derived from `git rev-parse --show-toplevel` at runtime. Hard dependency: E0-S3-T2 PR must be merged into `exercise-1` before T3 starts. Commit only when origin is confirmed to be the personal fork (not `dynamous-business`).

---

## 2) Verifiable expected outcome

1. `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` exists and all `[FILL IN]` placeholders relevant to time-zero are filled with real values.
2. Pre-implementation state table contains real outputs for all 7 commands:
   - server build/lint/test
   - client build/lint
   - node --version
   - pnpm --version
3. Branch and commit evidence is recorded (`git branch --show-current`, `git log --oneline -1`).
4. AI Layer presence verification is recorded with pass/fail evidence.
5. Go/no-go checklist has all 9 items evaluated with evidence references.
6. If all items are ✅, checklist is signed with timestamp and `READY — Exercise 1 may begin.`.
7. If any item is ❌, blockers are documented and no READY signature is applied.

---

## 3) Detailed execution plan

**Goal:** fill in the pre-implementation snapshot (AC-4) and sign the go/no-go checklist (AC-5) in the template.

**Agent:** `agile-exercise-planner` | **Skills:** `record-time-zero-snapshot` (primary — orchestrates all 6 capture phases), `validate-exercise-environment` (phase 2 — runs and records the 7 validation commands), `validate-ai-layer-coverage` (phase 3 — verifies AI Layer file presence in fork)

### Step 0 - Hard dependency gate

Before running snapshot capture, define `REPO_ROOT` and confirm all prerequisites:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
```

1. Confirm template exists:

```bash
ls -la "$REPO_ROOT/.agents/baseline/measurement-baseline.md"
```

2. Confirm required skills/functions/instruction exist:

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/skills/record-time-zero-snapshot/SKILL.md" \
  ".github/skills/validate-exercise-environment/SKILL.md" \
  ".github/skills/validate-ai-layer-coverage/SKILL.md" \
  ".github/functions/elapsed-time.js" \
  ".github/instructions/measurement-baseline.instructions.md"
```

3. Confirm remote safety:

```bash
cd "$REPO_ROOT"
git remote get-url origin
```

Stop conditions:

- Missing template -> return to T2.
- Missing required artifact -> return to T0/T2 as applicable.
- `origin` points to `dynamous-business/nextjs-feature-flag-exercise` -> return to E0-S1-T1 and reconfigure remotes before any commit.

### Step 1 - Confirm upstream story status

Read E0-S1 and E0-S2 story files and confirm status readiness for baseline snapshot.

### Step 2 - Run the 7 validation commands and record outputs

Execute and record:

```bash
cd "$REPO_ROOT/server" && pnpm run build
cd "$REPO_ROOT/server" && pnpm run lint
cd "$REPO_ROOT/server" && pnpm test
cd "$REPO_ROOT/client" && pnpm run build
cd "$REPO_ROOT/client" && pnpm run lint
node --version
pnpm --version
```

Populate command, exit code, output snippet, and status in the template.

### Step 3 - Capture branch/commit evidence

Record:

```bash
git branch --show-current
git log --oneline -1
```

### Step 4 - Verify AI Layer presence in fork

Run `check-ai-layer-files.js` for required fork-side artifacts and store output in template evidence.

### Step 5 - Fill template placeholders and evaluate checklist

Replace all relevant `[FILL IN]` placeholders for time-zero snapshot.

Evaluate 9 go/no-go items with explicit evidence references.

### Step 6 - Sign or block

- If all 9 checklist items are ✅: sign with current timestamp and `READY — Exercise 1 may begin.`.
- If any item is ❌: document blockers, do not sign READY.

### Step 7 - Commit evidence artifact via feature branch (only when remote is safe)

Only execute this step if Step 0 remote check confirmed origin is the personal fork. Then:

```bash
cd "$REPO_ROOT"
git checkout -b exercise-1/time-zero-snapshot
git add .agents/baseline/measurement-baseline.md
git status  # confirm only the baseline file is staged
git commit -m "chore(baseline): record measurement baseline and sign EPIC-1 go/no-go checklist"
git push origin exercise-1/time-zero-snapshot
```

Open a Pull Request against `exercise-1` with title: `chore(baseline): record measurement baseline and sign EPIC-1 go/no-go checklist`.

Update story `story-E0S3-measurement-baseline.md` status to `Done` and regenerate the backlog index:

```bash
node "$REPO_ROOT/docs/.github/functions/sync-backlog-index.js" "$REPO_ROOT/docs/agile"
```

Amend the commit to include the updated story and index:

```bash
git add docs/agile/stories/story-E0S3-measurement-baseline.md docs/agile/backlog-index.json
git commit --amend --no-edit
git push --force-with-lease origin exercise-1/time-zero-snapshot
```

---
## 4) Architecture and security requirements

- Scope is baseline evidence capture and documentation only; no feature implementation edits.
- Never hardcode secret values or tokens in the baseline document.
- Ensure command outputs are redacted if they contain sensitive values.
- Do not sign READY while any blocker remains open.
- Commits are allowed only when origin is a personal fork and branch is derived from `exercise-1`.

---

## 5) Validation evidence

### Commands

1. Template existence

```bash
ls -la "$REPO_ROOT/.agents/baseline/measurement-baseline.md"
```

2. Skill/function/instruction dependency check

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
   "$REPO_ROOT/docs" \
   ".github/skills/record-time-zero-snapshot/SKILL.md" \
   ".github/skills/validate-exercise-environment/SKILL.md" \
   ".github/skills/validate-ai-layer-coverage/SKILL.md" \
   ".github/functions/elapsed-time.js" \
   ".github/instructions/measurement-baseline.instructions.md"
```

3. Validation suite commands (7 commands listed in Step 2)

4. Branch/commit/remote checks

```bash
git remote -v
git branch --show-current
git log --oneline -1
```

### Evidence summary template

- Commands executed:
- Exit codes:
- Output summary:
- Files updated:
- Blockers found / mitigations:

### Given / When / Then checks

- **Given** the baseline template exists, dependencies are present, and remote safety is validated,
- **When** I capture all time-zero evidence and evaluate all 9 go/no-go items,
- **Then** readiness is either signed (`READY`) with full traceability or blocked with explicit gap documentation.

---

## 6) Definition of Done

- [ ] Template exists and placeholders are filled for time-zero snapshot.
- [ ] 7-command validation outputs recorded with exit codes.
- [ ] Branch/SHA/remote evidence recorded.
- [ ] AI Layer presence evidence recorded.
- [ ] All 9 go/no-go items evaluated with references.
- [ ] READY signed only if all items ✅; otherwise blockers documented and READY omitted.
- [ ] Feature branch `exercise-1/time-zero-snapshot` pushed and PR merged into `exercise-1`.
- [ ] Story `E0-S3` status updated to `Done` and `backlog-index.json` regenerated.
- [ ] Commit created only when remote/branch safety checks are green.
