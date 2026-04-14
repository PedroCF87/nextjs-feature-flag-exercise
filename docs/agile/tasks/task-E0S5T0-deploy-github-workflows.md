# Task E0-S5-T0 — Deploy GitHub Workflow Automation System

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S5-T0 |
| **Story** | [E0-S5 — Execution Automation for Epic 1](../stories/story-E0S5-execution-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `git-ops` |
| **Depends on** | E0-S1-T2 |
| **Blocks** | E0-S5-T1 |
| Created at | 2026-04-14 00:37:39 -03 |
| Last updated | 2026-04-14 00:37:39 -03 |

---

## 1) Task statement

Create all 6 GitHub Actions workflow files and the `.github/issue-index.json` file as described in `docs/references/github-workflow-system.md`. These workflows form the complete automation pipeline that drives the Copilot SWE coding agent cycle: **code → review → fix → re-review → merge → next task**.

---

## 2) Verifiable expected outcome

1. `.github/workflows/copilot-push-signal.yml` exists — triggers on `push` to `copilot/**`.
2. `.github/workflows/auto-ready-for-review.yml` exists — converts draft PRs to ready for review.
3. `.github/workflows/auto-copilot-fix.yml` exists — posts `@copilot` fix requests on reviews with suggestions.
4. `.github/workflows/auto-validate-copilot-fix.yml` exists — evaluates fix completeness and re-requests review or asks for more.
5. `.github/workflows/auto-merge-on-clean-review.yml` exists — merges PR on clean review and triggers the next task.
6. `.github/workflows/copilot-setup-steps.yml` exists — sets up the exercise environment before Copilot coding sessions.
7. `.github/issue-index.json` exists — task/issue mapping file consumed by `auto-ready-for-review.yml` and `auto-merge-on-clean-review.yml`.
8. All workflow files pass YAML syntax validation.

---

## 3) Detailed execution plan

**Goal:** deploy the full GitHub Workflow Automation System described in the reference document.

**Reference:** `docs/references/github-workflow-system.md`

### Sub-tasks

1. Create `.github/workflows/copilot-push-signal.yml`:
   - Trigger: `push` on `copilot/**`
   - Permissions: `{}`  (no secrets, no writes — intentionally side-effect-free)
   - Job: single `signal` step that echoes completion

2. Create `.github/workflows/auto-ready-for-review.yml`:
   - Trigger: `workflow_run: completed` on `"Copilot Push Signal"`
   - Security guards: `conclusion == 'success'`, `actor.type == 'Bot'`, `actor.login == 'Copilot'`/`'copilot[bot]'`, same-repo check
   - Step 1: poll for Copilot review request (18 × 10 s), convert draft → ready for review via `markPullRequestReadyForReview` GraphQL (requires `COPILOT_CLASSIC_PAT`)
   - Step 2: update `.github/issue-index.json` task status → `in_progress`

3. Create `.github/workflows/auto-copilot-fix.yml`:
   - Two triggers: `workflow_run` on `"Copilot code review"` + `pull_request_review: submitted`
   - Logic: query unresolved threads → post `[EX:TRIGGER-FIX-REQUEST]` comment with thread list
   - Idempotency guard via `<!-- review-id: {id} -->` in comment
   - Requires `COPILOT_TRIGGER_TOKEN` for `@copilot` comments

4. Create `.github/workflows/auto-validate-copilot-fix.yml`:
   - Trigger: `workflow_run: completed` on `"Copilot Push Signal"`
   - Same security guards as `auto-ready-for-review.yml`
   - Search for `[EX:FIX-APPLIED]` / fix signal after `[EX:TRIGGER-FIX-REQUEST]` (6 × 10 s polling)
   - Evaluate via GitHub Models (`gpt-4o-mini`), fallback to keyword heuristic
   - If all fixed: resolve threads + `gh pr edit --add-reviewer @copilot`
   - If incomplete: post `[EX:FIX-INCOMPLETE]` + new `[EX:TRIGGER-FIX-REQUEST]`
   - Requires `COPILOT_CLASSIC_PAT`

5. Create `.github/workflows/auto-merge-on-clean-review.yml`:
   - Two triggers: `pull_request_review: submitted` + `workflow_run` on `"Copilot code review"`
   - Guards: no unresolved threads, PR not a draft, PR is MERGEABLE
   - Squash merge → close linked issues → load `issue-index.json` → trigger next task via 3-step:
     a. Remove `@copilot` assignment
     b. Post context comment (NO `@copilot` mention)
     c. Assign `@copilot` via `COPILOT_TRIGGER_TOKEN`

6. Create `.github/workflows/copilot-setup-steps.yml`:
   - Trigger: `workflow_dispatch` (and auto-invoked by Copilot at session start)
   - Job name MUST be `copilot-setup-steps` (Copilot uses this exact name)
   - Steps: checkout → Node.js 22 → pnpm → install server deps → install client deps → validate builds → run tests → print env info

7. Create `.github/issue-index.json`:
   - Empty `tasks` array with schema documentation
   - To be populated as GitHub Issues are created for Epic 1 tasks

8. Configure required secrets in repository settings (manual step for repository owner):
   - `COPILOT_CLASSIC_PAT` — Classic PAT, `repo` scope
   - `COPILOT_TRIGGER_TOKEN` — Fine-Grained PAT, `Issues: Read and write`
   - Add both to the `copilot` GitHub Environment as well

---

## 4) Architecture and security requirements

### Security constraints

- `copilot-push-signal.yml` must have `permissions: {}` — no writes, no secrets.
- All workflow files with secrets must include same-repo guard (`workflow_run.repository.full_name == github.repository`) to prevent injection from forks.
- `COPILOT_CLASSIC_PAT` is required for GraphQL mutations rejected by Fine-Grained PATs when the PR was created by the Copilot GitHub App:
  - `markPullRequestReadyForReview`
  - `resolveReviewThread`
  - `gh pr edit --add-reviewer @copilot`
- `COPILOT_TRIGGER_TOKEN` (Fine-Grained PAT) is required for issue assignment — `GITHUB_TOKEN` (bot) is silently ignored.
- Post `@copilot` context comment BEFORE assigning to avoid conversational AI being invoked before context is loaded.

### Token type rationale (from reference document)

| Operation | Token type | Reason |
|---|---|---|
| `markPullRequestReadyForReview` | Classic PAT | Fine-Grained PATs rejected when PR created by GitHub App |
| `resolveReviewThread` | Classic PAT | Same restriction |
| `gh pr edit --add-reviewer @copilot` | Classic PAT | gh CLI auth requirement |
| Assign `@copilot` to issue | Fine-Grained PAT | Must be real user token; bot token silently ignored |
| Post `@copilot` comment | Fine-Grained PAT | Copilot responds to user comments, not bot comments |

### Architecture boundaries

- Workflows read `.github/issue-index.json` for task chaining — never hardcode issue numbers.
- All tag comparisons use the `[EX:...]` prefix (not `[DJVR:...]` from DéjàVu source).
- Runner: `ubuntu-latest` (GitHub-hosted) — consistent with existing repo workflows.

### Rollback

To disable the pipeline: delete or rename the 5 automation workflows. `copilot-setup-steps.yml` is independent and safe to keep.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed: `ls .github/workflows/ && node -e "require('fs').readdirSync('.github/workflows').forEach(f=>console.log(f))"`
- Exit code(s): 0
- Output summary: all 6 workflow files listed
- Files created/updated:
  - `.github/workflows/copilot-push-signal.yml`
  - `.github/workflows/auto-ready-for-review.yml`
  - `.github/workflows/auto-copilot-fix.yml`
  - `.github/workflows/auto-validate-copilot-fix.yml`
  - `.github/workflows/auto-merge-on-clean-review.yml`
  - `.github/workflows/copilot-setup-steps.yml`
  - `.github/issue-index.json`

### Given / When / Then checks

**Given** the repository has a `copilot/**` branch with a push event
**When** the `copilot-push-signal.yml` workflow runs
**Then** it completes with conclusion `success` and triggers downstream `workflow_run` workflows.

**Given** Copilot opens a draft PR and pushes commits
**When** `auto-ready-for-review.yml` detects the completed push signal
**Then** the PR is converted from draft to ready for review within 3 minutes.

**Given** a code review with unresolved threads is submitted on a Copilot PR
**When** `auto-copilot-fix.yml` triggers
**Then** a `[EX:TRIGGER-FIX-REQUEST]` comment listing each unresolved thread is posted on the PR.

**Given** Copilot posts a fix-applied response and pushes a new commit
**When** `auto-validate-copilot-fix.yml` runs
**Then** either all threads are resolved and review is re-requested, OR a `[EX:FIX-INCOMPLETE]` comment is posted.

**Given** the Copilot code review contains `[EX:REVIEW-CLEAN]` with zero unresolved threads
**When** `auto-merge-on-clean-review.yml` triggers
**Then** the PR is squash-merged, the linked issue is closed, and `@copilot` is assigned to the next task in `issue-index.json`.

---

## 6) Definition of Done

- [ ] All 6 workflow files exist in `.github/workflows/`.
- [ ] `.github/issue-index.json` exists with valid JSON structure.
- [ ] YAML syntax is valid for all workflow files (verified by `yamllint` or GitHub Actions parser).
- [ ] Security guards are present in all workflows that use secrets.
- [ ] `copilot-setup-steps.yml` job is named exactly `copilot-setup-steps`.
- [ ] All `[DJVR:...]` tags replaced with `[EX:...]` in comment templates.
- [ ] Required secrets documented in task section 3 (for manual configuration by repo owner).
- [ ] Task committed and PR merged to `exercise-1`.
