# Story E0-S6 — CI/CD Pipeline for Issue-Driven Execution

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6 |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist`, `prompt-engineer` |
| **Skills** | `create-specialist-agent`, `copilot-env-setup` |
| **Instructions** | `coding-agent.instructions.md`, `git-operations.instructions.md` |
| **Depends on** | [E0-S5 — Execution Automation for Epic 1](story-E0S5-execution-automation.md), [E0-S2-T4 — Create copilot-setup-steps.yml](../tasks/task-E0S2T4-create-copilot-setup-steps-yml-and-configure-governance.md) |
| **Blocks** | EPIC-1 execution (full automation loop) |
| Created at | 2026-04-13 21:49:02 -03 |
| Last updated | 2026-04-13 23:15:02 -03 |

---

## 1) User story

**As a** candidate executing the RDH interview exercises via an Issue-driven workflow,
**I want to** have GitHub Actions workflows that automatically convert Copilot's draft PRs to ready-for-review, request fixes after code review, validate fix completeness, merge clean PRs, close linked Issues, and trigger the next task in sequence,
**so that** Epic 1 tasks execute in a fully automated loop — from Issue assignment through merge — with minimal manual intervention beyond story-end validation checkpoints.

---

## 2) Scope

### In scope

1. **5 GitHub Actions workflow files** adapted from the DéjàVu reference (`docs/references/github-workflow-system.md`):
   - `copilot-push-signal.yml` — anchor workflow; fires on `push` to `copilot/**` branches.
   - `auto-ready-for-review.yml` — converts Copilot's draft PR to ready-for-review.
   - `auto-copilot-fix.yml` — posts `@copilot` fix request after review with suggestions.
   - `auto-validate-copilot-fix.yml` — evaluates whether Copilot's fixes are complete.
   - `auto-merge-on-clean-review.yml` — merges PR, closes Issue, triggers next task.

2. **Issue index** infrastructure:
   - Define `.github/issue-index.json` schema.
   - Create `docs/.github/functions/generate-issue-index.js` — generates the index from backlog task files + `gh issue list` output.
   - Update `create-github-issue-from-task.js` (from E0-S5-T3) to append entries to the issue index after creating each Issue.

3. **PR comment tag system** documentation:
   - Create `docs/.github/instructions/pr-comment-tags.instructions.md` — documents the `[EX:...]` tag dictionary, placement rules, and examples.

4. **Workflow-specific secrets** documentation and validation:
   - `COPILOT_CLASSIC_PAT` (Classic PAT, `repo` scope) — for `markPullRequestReadyForReview`, `resolveReviewThread`, `gh pr edit --add-reviewer @copilot`.
   - `COPILOT_TRIGGER_TOKEN` (Fine-Grained PAT, `Issues: Read and write`) — for assigning `@copilot` to Issues and posting trigger comments.
   - Create a secrets validation script or checklist to confirm configuration.

5. **Self-hosted runner** setup guide and validation:
   - Adapt `docs/references/self-hosted-runner.md` into an actionable setup task.
   - Create a runner health-check script or validation step.

6. **MCP server configuration**:
   - Create `.github/copilot-mcp.json` with the GitHub API MCP server (per `docs/references/mcp-servers.md`).

7. **End-to-end dry-run** of the full pipeline.

### Out of scope

1. `copilot-setup-steps.yml` — already created in [E0-S2-T4](../tasks/task-E0S2T4-create-copilot-setup-steps-yml-and-configure-governance.md).
2. Basic `copilot` environment and `ANTHROPIC_API_KEY` secret — already configured in E0-S2-AC-5.
3. Branch protection rules — already documented in E0-S2-AC-6.
4. Actual execution of Epic 1 tasks — this story only creates the pipeline infrastructure.
5. Full E2E test with real Copilot Coding Agent execution (only structural dry-run and workflow syntax validation are in scope).

---

## 3) Acceptance criteria

### AC-1 — Anchor workflow created

- **Given** the fork has `copilot-setup-steps.yml` from E0-S2-T4
- **When** I create `copilot-push-signal.yml`
- **Then** it:
  - Triggers on `push` to `copilot/**` branches.
  - Runs on `self-hosted`.
  - Has `permissions: {}` (no permissions needed).
  - Contains a single step that echoes a completion message (intentionally side-effect-free).
  - `workflow_dispatch` trigger is present for manual testing.

### AC-2 — Draft-to-ready workflow created

- **Given** `copilot-push-signal.yml` exists and can complete
- **When** I create `auto-ready-for-review.yml`
- **Then** it:
  - Triggers on `workflow_run: completed` of `"Copilot Push Signal"`.
  - Runs on `self-hosted`.
  - Includes security guards: `workflow_run.conclusion == 'success'`, `actor.type == 'Bot'`, `actor.login == 'Copilot'`, same-repo guard.
  - Polls for Copilot's review request (up to ~3 min).
  - Calls `markPullRequestReadyForReview` GraphQL mutation.
  - Uses `COPILOT_CLASSIC_PAT` secret.

### AC-3 — Fix-request workflow created

- **Given** Copilot code review can produce suggestions
- **When** I create `auto-copilot-fix.yml`
- **Then** it:
  - Triggers on `workflow_run: completed` of `"Copilot code review"` AND `pull_request_review: submitted`.
  - Runs on `self-hosted`.
  - Queries unresolved review threads via GraphQL.
  - Posts `@copilot` fix comment with `[EX:TRIGGER-FIX-REQUEST]` tag and idempotency guard (`<!-- review-id: {id} -->`).
  - Uses `COPILOT_TRIGGER_TOKEN` secret.

### AC-4 — Fix-validation workflow created

- **Given** Copilot pushes fix commits after a fix request
- **When** I create `auto-validate-copilot-fix.yml`
- **Then** it:
  - Triggers on `workflow_run: completed` of `"Copilot Push Signal"`.
  - Runs on `self-hosted`.
  - Detects Copilot's `[EX:FIX-APPLIED]` signal in PR comments.
  - Uses GitHub Models (`gpt-4o-mini`) to evaluate fix completeness, with keyword heuristic fallback.
  - If resolved: resolves review threads + re-requests Copilot review.
  - If incomplete: posts `[EX:FIX-INCOMPLETE]` + `[EX:TRIGGER-FIX-REQUEST]` comment.
  - Uses `COPILOT_CLASSIC_PAT` secret.
  - Includes same security guards as AC-2.

### AC-5 — Auto-merge workflow created

- **Given** Copilot code review is clean (zero unresolved threads)
- **When** I create `auto-merge-on-clean-review.yml`
- **Then** it:
  - Triggers on `pull_request_review: submitted` AND `workflow_run: completed` of `"Copilot code review"`.
  - Runs on `self-hosted`.
  - Verifies PR is not draft and is `MERGEABLE`.
  - Checks all review threads are resolved.
  - Merges via squash merge.
  - Closes linked Issues as completed.
  - Reads `.github/issue-index.json` to find the next task.
  - Assigns `@copilot` to the next task's Issue (3-step: unassign → context comment → assign).
  - Uses `COPILOT_TRIGGER_TOKEN` for assignment and `GITHUB_TOKEN` for merge.

### AC-6 — Issue index infrastructure created

- **Given** `create-github-issue-from-task.js` exists from E0-S5-T3
- **When** I create the issue index generator and update the task-to-issue function
- **Then**:
  - `.github/issue-index.json` schema is documented (fields: `epic`, `story`, `task`, `issue`, `title`, `status`, `agent`).
  - `docs/.github/functions/generate-issue-index.js` exists and can produce the index from task files + `gh issue list` output.
  - `create-github-issue-from-task.js` is updated to append to the issue index after each Issue creation.
  - Dry-run of `generate-issue-index.js` produces valid JSON matching the schema.

### AC-7 — PR tag system documented

- **Given** the workflows use `[EX:...]` tags for event identification
- **When** I create the PR tag instructions
- **Then** `docs/.github/instructions/pr-comment-tags.instructions.md` exists with:
  - `applyTo` header scoped to workflow files.
  - Tag dictionary: `[EX:REVIEW-HAS-SUGGESTIONS]`, `[EX:REVIEW-CLEAN]`, `[EX:FIX-APPLIED]`, `[EX:TRIGGER-FIX-REQUEST]`, `[EX:FIX-INCOMPLETE]`.
  - Placement rules (tag at start of comment body, on its own line).
  - Examples for each tag usage.

### AC-8 — Secrets documented and validated

- **Given** the workflows require `COPILOT_CLASSIC_PAT` and `COPILOT_TRIGGER_TOKEN`
- **When** I document the secrets configuration
- **Then** a secrets checklist exists confirming:
  - `COPILOT_CLASSIC_PAT`: Classic PAT with `repo` scope, added to repository secrets AND `copilot` environment.
  - `COPILOT_TRIGGER_TOKEN`: Fine-Grained PAT with `Issues: Read and write`, added to repository secrets AND `copilot` environment.
  - Why two PAT types are needed (documented per `github-workflow-system.md` §4).
  - `gh auth status` validation step documented.

### AC-9 — Self-hosted runner operational

- **Given** the workflows run on `self-hosted` runners
- **When** I set up the runner following the reference guide
- **Then**:
  - Docker Compose file exists locally at `~/exercise-runner/docker-compose.yml` (or equivalent).
  - Runner is registered with the fork repository.
  - Runner appears as "Idle" in fork Settings → Actions → Runners.
  - A manual trigger of `copilot-push-signal.yml` completes successfully on the self-hosted runner.

### AC-10 — MCP config created

- **Given** the Copilot Coding Agent benefits from GitHub API MCP tools
- **When** I create the MCP configuration
- **Then** `.github/copilot-mcp.json` exists in the fork with the GitHub API server configured per `docs/references/mcp-servers.md`.

### AC-11 — End-to-end structural validation

- **Given** all workflows, secrets, runner, and issue index are configured
- **When** I run the structural validation
- **Then**:
  - All 6 workflow files pass `actionlint` (or equivalent syntax check).
  - `copilot-push-signal.yml` can be triggered manually via `workflow_dispatch` and completes on the self-hosted runner.
  - `generate-issue-index.js --dry-run` produces valid JSON.
  - All required secrets are confirmed present via the checklist.
  - Runner is online and processes jobs.

---

## 4) Tasks

### ✅ [Task E0-S6-T1 — Create `copilot-push-signal.yml`](../tasks/task-E0S6T1-create-copilot-push-signal-yml.md)

**Goal:** create the anchor workflow that fires on Copilot's pushes and provides a `workflow_run` trigger source for downstream workflows.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.github/workflows/copilot-push-signal.yml`

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §2.1 for the anchor workflow spec.
2. Create `copilot-push-signal.yml`:
   - `name: "Copilot Push Signal"`
   - Triggers: `push` on `copilot/**` branches, `workflow_dispatch` for manual testing.
   - `runs-on: self-hosted`
   - `permissions: {}`
   - Single step: `echo "Copilot push signal received for ${{ github.ref }}"`
3. Validate YAML syntax.
4. Commit: `feat(ci): add copilot-push-signal anchor workflow`.

**Acceptance:** workflow file exists, YAML is valid, triggers are correct, permissions are locked to `{}`.

**depends_on:** E0-S2-T4 completed (copilot-setup-steps.yml exists)

---

### ✅ [Task E0-S6-T2 — Create `auto-ready-for-review.yml`](../tasks/task-E0S6T2-create-auto-ready-for-review-yml.md)

**Goal:** create the workflow that converts Copilot's draft PRs to ready-for-review.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.github/workflows/auto-ready-for-review.yml`

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §2.2 for the full spec.
2. Create `auto-ready-for-review.yml`:
   - `name: "Auto Ready for Review"`
   - Trigger: `workflow_run: completed` on `"Copilot Push Signal"`.
   - `runs-on: self-hosted`
   - Security guards: check `conclusion`, `actor.type`, `actor.login`, and `repository.full_name`.
   - Main logic: resolve open PR → poll for review request (18 attempts × 10s) → verify draft → call `markPullRequestReadyForReview` GraphQL mutation.
   - Optionally update `.github/issue-index.json` to mark task as `in_progress`.
   - Uses `COPILOT_CLASSIC_PAT` secret.
3. Validate YAML syntax.
4. Commit: `feat(ci): add auto-ready-for-review workflow`.

**Acceptance:** workflow exists, security guards present, GraphQL mutation uses Classic PAT, polling logic implemented.

**depends_on:** T1 completed

---

### ✅ [Task E0-S6-T3 — Create `auto-copilot-fix.yml`](../tasks/task-E0S6T3-create-auto-copilot-fix-yml.md)

**Goal:** create the workflow that posts `@copilot` fix requests after code reviews with suggestions.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.github/workflows/auto-copilot-fix.yml`

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §2.3 for the full spec.
2. Create `auto-copilot-fix.yml`:
   - `name: "Auto Copilot Fix"`
   - Triggers: `workflow_run: completed` on `"Copilot code review"` (primary), `pull_request_review: submitted` (fallback with `[EX:REVIEW-HAS-SUGGESTIONS]` detection).
   - `runs-on: self-hosted`
   - Logic: resolve PR → query unresolved review threads via GraphQL → post `@copilot` comment listing threads with `[EX:TRIGGER-FIX-REQUEST]` tag and idempotency guard `<!-- review-id: {id} -->`.
   - For summary-only reviews (no inline threads): forward full review body.
   - Uses `COPILOT_TRIGGER_TOKEN` secret.
3. Validate YAML syntax.
4. Commit: `feat(ci): add auto-copilot-fix workflow`.

**Acceptance:** workflow exists, dual trigger configured, idempotency guard present, uses `COPILOT_TRIGGER_TOKEN`.

**depends_on:** T2 completed

---

### ✅ [Task E0-S6-T4 — Create `auto-validate-copilot-fix.yml`](../tasks/task-E0S6T4-create-auto-validate-copilot-fix-yml.md)

**Goal:** create the workflow that evaluates whether Copilot applied all requested fixes.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.github/workflows/auto-validate-copilot-fix.yml`

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §2.4 for the full spec.
2. Create `auto-validate-copilot-fix.yml`:
   - `name: "Auto Validate Copilot Fix"`
   - Trigger: `workflow_run: completed` on `"Copilot Push Signal"`.
   - `runs-on: self-hosted`
   - Security guards: same as `auto-ready-for-review.yml`.
   - Logic:
     - Resolve open PR for pushed branch.
     - Search for `[EX:FIX-APPLIED]` signal in recent comments (retry 6 × 10s).
     - Verify it responds to a preceding `[EX:TRIGGER-FIX-REQUEST]`.
     - Guard against duplicate processing.
     - Call GitHub Models (`gpt-4o-mini`) for evaluation; fall back to keyword heuristic.
     - If resolved: `resolveReviewThread` mutation + re-request review via `gh pr edit --add-reviewer @copilot`.
     - If incomplete: post `[EX:FIX-INCOMPLETE]` + `[EX:TRIGGER-FIX-REQUEST]` comment.
   - Uses `COPILOT_CLASSIC_PAT` secret.
3. Validate YAML syntax.
4. Commit: `feat(ci): add auto-validate-copilot-fix workflow`.

**Acceptance:** workflow exists, dual evaluation path (AI + heuristic), security guards present, uses Classic PAT for GraphQL mutations.

**depends_on:** T3 completed

---

### ✅ [Task E0-S6-T5 — Create `auto-merge-on-clean-review.yml`](../tasks/task-E0S6T5-create-auto-merge-on-clean-review-yml.md)

**Goal:** create the workflow that merges clean PRs, closes Issues, and triggers the next task.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.github/workflows/auto-merge-on-clean-review.yml`

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §2.5 for the full spec.
2. Create `auto-merge-on-clean-review.yml`:
   - `name: "Auto Merge on Clean Review"`
   - Triggers: `pull_request_review: submitted` (primary), `workflow_run: completed` on `"Copilot code review"` (fallback).
   - `runs-on: self-hosted`
   - Logic:
     - Verify PR is not draft and `MERGEABLE`.
     - Query all review threads; skip if any unresolved.
     - Squash merge.
     - Load `.github/issue-index.json` → find linked Issue → close as completed.
     - Find next task in sequence.
     - 3-step Copilot trigger: unassign → context comment (no `@copilot` mention) → assign.
   - Uses `GITHUB_TOKEN` for merge and `COPILOT_TRIGGER_TOKEN` for Issue assignment.
3. Validate YAML syntax.
4. Commit: `feat(ci): add auto-merge-on-clean-review workflow`.

**Acceptance:** workflow exists, dual trigger configured, issue-index.json read logic present, 3-step Copilot assignment implemented.

**depends_on:** T4 completed

---

### ✅ [Task E0-S6-T6 — Create issue index infrastructure](../tasks/task-E0S6T6-create-issue-index-infrastructure.md)

**Goal:** create the `.github/issue-index.json` schema, the generator function, and update `create-github-issue-from-task.js` to maintain the index.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `docs/.github/functions/generate-issue-index.js`
- Update to `docs/.github/functions/create-github-issue-from-task.js` (from E0-S5-T3)
- `.github/issue-index.json` template file

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §5 for the issue index schema.
2. Create `generate-issue-index.js`:
   - Reads all task files from `docs/agile/tasks/`.
   - Cross-references with `gh issue list --json number,title,state` to resolve Issue numbers.
   - Produces `.github/issue-index.json` with the following schema per entry:
     ```json
     { "epic": 1, "story": 1, "task": 1, "issue": 42, "title": "...", "status": "open", "agent": "task-implementer" }
     ```
   - Supports `--dry-run` mode.
   - CLI: `node generate-issue-index.js <agile-dir> <owner/repo> [--dry-run]`.
3. Update `create-github-issue-from-task.js`:
   - After creating an Issue, append an entry to `.github/issue-index.json`.
   - If the file does not exist, create it with the first entry.
   - Maintain sorted order by epic → story → task.
4. Create `.github/issue-index.json` template (empty `{ "tasks": [] }`).
5. Test `generate-issue-index.js --dry-run` with existing task files.
6. Commit: `feat(ci): add issue index generator and update task-to-issue function`.

**Acceptance:** `generate-issue-index.js` exists, dry-run produces valid JSON, `create-github-issue-from-task.js` appends to index, template file present.

**depends_on:** E0-S5-T3 completed, T5 completed

---

### ✅ [Task E0-S6-T7 — Create PR tag system documentation](../tasks/task-E0S6T7-create-pr-tag-system-documentation.md)

**Goal:** document the `[EX:...]` PR comment tag system as an instruction file.

**Agent:** `prompt-engineer`

**Artifacts to create:**
- `docs/.github/instructions/pr-comment-tags.instructions.md`

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §3 for the tag dictionary.
2. Create `pr-comment-tags.instructions.md`:
   - Front matter: `applyTo: ".github/workflows/**"`
   - Tag dictionary table: tag, posted by, when.
   - Placement rules: tags at start of comment body, own line, before other content.
   - Examples for each tag (clean review, fix request, fix applied, fix incomplete).
3. Commit: `docs(ci): add PR comment tag system instructions`.

**Acceptance:** instruction file exists with all 5 tags documented, placement rules, and examples.

**depends_on:** T1 completed (so the tag context exists)

---

### ✅ [Task E0-S6-T8 — Configure secrets and self-hosted runner](../tasks/task-E0S6T8-configure-secrets-and-self-hosted-runner.md)

**Goal:** configure the two workflow-specific PATs in the fork and set up the self-hosted runner.

**Agent:** `copilot-env-specialist` (documentation), human (manual GitHub UI configuration)

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.agents/governance/workflow-secrets-checklist.md`
- Self-hosted runner operational

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §4 for the secrets specification.
2. Read `docs/references/self-hosted-runner.md` for runner setup.
3. Create `workflow-secrets-checklist.md`:
   - Table: secret name, type, scope, required by, configured status.
   - `COPILOT_CLASSIC_PAT`: Classic PAT, `repo` scope → Repository secrets + `copilot` environment.
   - `COPILOT_TRIGGER_TOKEN`: Fine-Grained PAT, `Issues: Read and write` → Repository secrets + `copilot` environment.
   - Why two PAT types (GraphQL mutation restrictions, Copilot agent assignment).
   - Validation command: `gh auth status`.
   - Runner setup checklist: Docker Compose, registration, health check.
4. **Manual steps** (human):
   - Create PATs via GitHub → Settings → Developer settings → Personal access tokens.
   - Add secrets to fork: Settings → Secrets and variables → Actions.
   - Add secrets to `copilot` environment: Settings → Environments → copilot.
   - Register and start the self-hosted runner per reference guide.
5. Verify runner appears as "Idle" in fork settings.
6. Trigger `copilot-push-signal.yml` via `workflow_dispatch` to validate runner processes jobs.
7. Commit the checklist: `docs(ci): add workflow secrets and runner configuration checklist`.

**Acceptance:** secrets checklist exists, runner online (visible in Settings), manual trigger of push-signal workflow completes on runner.

**depends_on:** T5 completed

---

### [Task E0-S6-T9 — Create MCP configuration](../tasks/task-E0S6T9-create-mcp-configuration.md)

**Goal:** deploy the GitHub API MCP server configuration to the fork.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.github/copilot-mcp.json`

**Sub-tasks:**

1. Read `docs/references/mcp-servers.md` for the minimum exercise configuration.
2. Create `.github/copilot-mcp.json`:
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
         }
       }
     }
   }
   ```
3. Commit: `feat(ci): add GitHub API MCP server configuration`.

**Acceptance:** `copilot-mcp.json` exists at `.github/copilot-mcp.json` in the fork, JSON is valid, references `${GITHUB_TOKEN}`.

**depends_on:** E0-S2-T4 completed

---

### [Task E0-S6-T10 — End-to-end structural validation and readiness](../tasks/task-E0S6T10-end-to-end-structural-validation-and-readiness.md)

**Goal:** validate the full pipeline structurally and sign the CI/CD readiness checklist.

**Agent:** `copilot-env-specialist`, `git-ops`

**Sub-tasks:**

1. Verify all 6 workflow files exist in `.github/workflows/`:
   - [ ] `copilot-setup-steps.yml` (from E0-S2-T4)
   - [ ] `copilot-push-signal.yml` (T1)
   - [ ] `auto-ready-for-review.yml` (T2)
   - [ ] `auto-copilot-fix.yml` (T3)
   - [ ] `auto-validate-copilot-fix.yml` (T4)
   - [ ] `auto-merge-on-clean-review.yml` (T5)
2. Verify supporting artifacts:
   - [ ] `.github/issue-index.json` (T6)
   - [ ] `.github/copilot-mcp.json` (T9)
   - [ ] `docs/.github/instructions/pr-comment-tags.instructions.md` (T7)
   - [ ] `docs/.github/functions/generate-issue-index.js` (T6)
   - [ ] `.agents/governance/workflow-secrets-checklist.md` (T8)
3. Verify secrets configured (checklist from T8).
4. Verify runner online: manually check Settings → Actions → Runners.
5. Trigger `copilot-push-signal.yml` via `gh workflow run "Copilot Push Signal"` — confirm it completes on the self-hosted runner.
6. Run `generate-issue-index.js --dry-run` — confirm valid JSON output.
7. Sign the CI/CD readiness checklist:
   ```
   ## E0-S6 CI/CD Pipeline Readiness Checklist

   | # | Item | Status | Evidence |
   |---|---|---|---|
   | 1 | `copilot-push-signal.yml` created | [ ] | `.github/workflows/copilot-push-signal.yml` |
   | 2 | `auto-ready-for-review.yml` created | [ ] | `.github/workflows/auto-ready-for-review.yml` |
   | 3 | `auto-copilot-fix.yml` created | [ ] | `.github/workflows/auto-copilot-fix.yml` |
   | 4 | `auto-validate-copilot-fix.yml` created | [ ] | `.github/workflows/auto-validate-copilot-fix.yml` |
   | 5 | `auto-merge-on-clean-review.yml` created | [ ] | `.github/workflows/auto-merge-on-clean-review.yml` |
   | 6 | Issue index infrastructure created | [ ] | `.github/issue-index.json` + `generate-issue-index.js` |
   | 7 | PR tag instructions created | [ ] | `pr-comment-tags.instructions.md` |
   | 8 | Secrets configured | [ ] | `workflow-secrets-checklist.md` |
   | 9 | Self-hosted runner operational | [ ] | Runner ID + `copilot-push-signal` run ID |
   | 10 | MCP config created | [ ] | `.github/copilot-mcp.json` |
   | 11 | Structural dry-run passed | [ ] | Push-signal run ID + issue-index dry-run output |

   **Signed by:** `copilot-env-specialist`
   **Date:** `<timestamp>`
   ```
8. Commit: `feat(ci): sign CI/CD pipeline readiness checklist`.

**Acceptance:** all 11 checklist items checked, push-signal run completed on self-hosted runner, issue index dry-run produced valid JSON.

**depends_on:** T6, T7, T8, T9 completed

---

## 5) Technical notes

### Relationship with E0-S5

E0-S5 creates the **planning-side** automation (scaffold stories, create Issues, describe task execution). E0-S6 creates the **CI/CD-side** automation (the GitHub Actions engine that drives the PR lifecycle after Copilot opens a draft PR). Together they form the complete pipeline:

```
[E0-S5 artifacts]                    [E0-S6 artifacts]
                                          
scaffold-stories-from-epic           copilot-push-signal.yml
        ↓                                    ↓
create-story-task-pack               auto-ready-for-review.yml
        ↓                                    ↓
create-github-issue-from-task        auto-copilot-fix.yml
        ↓                                    ↓
execute-task-from-issue    ───→      auto-validate-copilot-fix.yml
  (agent opens draft PR)                     ↓
                                     auto-merge-on-clean-review.yml
                                       (merge + next task trigger)
```

### Self-hosted runner requirement

All 5 pipeline workflows use `runs-on: self-hosted` because:
- `workflow_run` triggers from bot-authored push events require this to bypass GitHub's Actions approval gate on personal repos.
- Classic PATs and GraphQL mutations are needed for operations that `GITHUB_TOKEN` cannot perform.

### Security considerations

- **Token scope minimization:** `COPILOT_CLASSIC_PAT` has `repo` scope (minimum for GraphQL mutations); `COPILOT_TRIGGER_TOKEN` has only `Issues: Read and write`.
- **Security guards in every workflow:** verify bot actor, exact login match, and same-repo check to prevent cross-repo trigger abuse.
- **No hardcoded secrets:** all PATs are referenced via `${{ secrets.SECRET_NAME }}`.
- **Idempotency guards:** prevent duplicate trigger comments via HTML comment markers.

### `issue-index.json` lifecycle

```
create-github-issue-from-task.js (E0-S5-T3, updated in E0-S6-T6)
        ↓ appends entry
.github/issue-index.json
        ↓ read by
auto-ready-for-review.yml (mark in_progress)
auto-merge-on-clean-review.yml (find next task, mark done)
```

---

## 6) References

- [docs/references/github-workflow-system.md](../../references/github-workflow-system.md) — full pipeline reference
- [docs/references/self-hosted-runner.md](../../references/self-hosted-runner.md) — runner setup guide
- [docs/references/mcp-servers.md](../../references/mcp-servers.md) — MCP configuration reference
- [E0-S5 — Execution Automation](story-E0S5-execution-automation.md) — planning-side automation
- [E0-S2-T4 — copilot-setup-steps.yml](../tasks/task-E0S2T4-create-copilot-setup-steps-yml-and-configure-governance.md) — prerequisite workflow
