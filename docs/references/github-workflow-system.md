# GitHub Workflow Automation System — RDH Exercise Reference

| Field | Value |
|---|---|
| Status | Reference |
| Source project | `dejavu-rio-planing` |
| Applies to | `nextjs-feature-flag-exercise` fork |
| Created at | 2026-04-09 17:56:53 -03 |
| Last updated | 2026-04-09 17:58:13 -03 |

---

## Purpose

This document describes the full GitHub workflow automation system used in the DéjàVu Rio project and how it applies to the RDH exercise fork of `nextjs-feature-flag-exercise`. The system automates the Copilot SWE coding agent cycle: **code → review → fix → re-review → merge → next task**.

---

## 1) Full Pipeline

```
[Copilot opens PR as draft]
         │
         ▼
[Copilot pushes commits to copilot/** branch]
         │  push event
         ▼
[copilot-push-signal.yml]  ← side-effect-free; just completes
         │  workflow_run: completed
         ├──────────────────────────────────────────────────────────────────┐
         ▼                                                                  ▼
[auto-ready-for-review.yml]                             [auto-validate-copilot-fix.yml]
  Polls for review request;                               Evaluates Copilot's fix response
  converts draft → ready for review                       via GitHub Models (gpt-4o-mini)
         │                                                        │
         ▼                                              ┌─────────┴──────────────┐
[Copilot code review runs]                             ALL fixed?           NOT all fixed?
         │                                                  │                     │
         ├── [DJVR:REVIEW-HAS-SUGGESTIONS] ──┐             ▼                     ▼
         │                                   │   [gh pr edit --add-reviewer]   [EX:FIX-INCOMPLETE]
         └── [DJVR:REVIEW-CLEAN] ────────┐  │    re-requests Copilot review   [EX:TRIGGER-FIX-REQUEST]
                                         │  ▼                                  (loops back to fix)
                                         │  [auto-copilot-fix.yml]
                                         │   Posts @copilot comment listing
                                         │   unresolved threads + fix request
                                         │
                                         ▼
                              [auto-merge-on-clean-review.yml]
                               1. Merges PR (squash)
                               2. Closes linked issue
                               3. Assigns @copilot to next task
```

---

## 2) Workflows

### 2.1 `copilot-push-signal.yml`

**Purpose:** Anchor workflow. Provides a `workflow_run` trigger source that bypasses GitHub's Actions approval gate for bot-authored push events.

**Why it exists:** In personal GitHub repositories, `pull_request_target` events triggered by the Copilot SWE bot require a human to click "Approve and run". `push` events on same-repo branches are not subject to this gate. This workflow fires on Copilot's pushes and does nothing except complete — its completion then triggers the secret-backed downstream workflows via `workflow_run`.

**Trigger:** `push` on `copilot/**` branches.

**Runner:** `self-hosted`

**Permissions:** none (explicitly locked to `{}`)

**Security:** No secrets, no writes. Intentionally side-effect-free.

**Adaptation from DéjàVu:** None required. Identical logic applies to the exercise fork.

---

### 2.2 `auto-ready-for-review.yml`

**Purpose:** Converts Copilot's draft PR to "ready for review" once Copilot finishes its initial work session, enabling the code review cycle to start.

**Trigger:** `workflow_run: completed` on `"Copilot Push Signal"`.

**Runner:** `self-hosted`

**Key logic:**
1. Resolves the open PR for the pushed branch via the GitHub REST API.
2. Polls for Copilot's pending review request (up to ~3 min / 18 attempts × 10 s) — Copilot requests a review slightly after pushing, so polling is necessary.
3. Verifies the PR is still a draft.
4. Calls `markPullRequestReadyForReview` via GraphQL to convert draft → ready.
5. Optionally updates `.github/issue-index.json` to mark the linked task as `in_progress`.

**Required secrets:**
- `COPILOT_CLASSIC_PAT` — Classic PAT with `repo` scope. Fine-Grained PATs **cannot** be used for the `markPullRequestReadyForReview` GraphQL mutation when the PR was created by a GitHub App.

**Security guards:**
- `workflow_run.conclusion == 'success'`
- `workflow_run.actor.type == 'Bot'`
- `workflow_run.actor.login == 'Copilot'` (exact match)
- `workflow_run.repository.full_name == github.repository` (same-repo guard)

**Adaptation from DéjàVu:**
- Replace `arc-runner-set` with `self-hosted` on the `runs-on` field.
- The issue-index update step applies if `.github/issue-index.json` is present in the fork.

---

### 2.3 `auto-copilot-fix.yml`

**Purpose:** Automatically posts a `@copilot` PR comment requesting fixes after a code review that contains suggestions, so Copilot applies the changes without manual intervention.

**Triggers:**
- `workflow_run: completed` on `"Copilot code review"` — **primary path** for Copilot bot reviews. Reliable even for summary-only reviews.
- `pull_request_review: submitted` — **fallback/secondary path** for:
  - Non-Copilot reviews (Code Review agent, human reviewers) with `[EX:REVIEW-HAS-SUGGESTIONS]` in the body.
  - Copilot bot reviews where `workflow_run` did not fire.

**Runner:** `self-hosted`

**Key logic:**
1. Resolves the review and PR from the event payload.
2. Queries all review threads via GraphQL (`reviewThreads { isResolved }`).
3. Filters to unresolved threads belonging to the current review.
4. Posts a `@copilot` comment listing each unresolved thread with file, line, and link.
5. If no inline threads exist (summary-only review), forwards the full review body.
6. Uses an idempotency guard (`<!-- review-id: {id} -->`) to prevent duplicate trigger comments.

**Required secrets:**
- `COPILOT_TRIGGER_TOKEN` — Fine-Grained PAT with `pull-requests: read and write`. Used to post the `@copilot` comment. If absent, falls back to `GITHUB_TOKEN` (Copilot may not react to bot-token comments).

**PR tag used:**
```
`[EX:TRIGGER-FIX-REQUEST]`
<!-- review-id: {review_id} -->
@copilot Please apply fixes for the following unresolved review threads:
...
```

**Adaptation from DéjàVu:**
- Replace `arc-runner-set` with `self-hosted`.
- Replace `[DJVR:REVIEW-HAS-SUGGESTIONS]` / `[DJVR:REVIEW-CLEAN]` tags with `[EX:REVIEW-HAS-SUGGESTIONS]` / `[EX:REVIEW-CLEAN]` throughout the workflow's `if:` conditions and comment templates.
- Replace `[DJVR:TRIGGER-FIX-REQUEST]` with `[EX:TRIGGER-FIX-REQUEST]`.

---

### 2.4 `auto-validate-copilot-fix.yml`

**Purpose:** After Copilot pushes fix commits, evaluates whether all code-review suggestions were addressed. If complete, re-requests the Copilot code review. If incomplete, asks Copilot to finish.

**Trigger:** `workflow_run: completed` on `"Copilot Push Signal"`.

**Runner:** `self-hosted`

**Key logic:**
1. Resolves the open PR for the pushed branch.
2. Searches recent comments for a Copilot fix-applied signal (`[EX:FIX-APPLIED]`, "addressed in", "applied in"). Retries up to 6 × 10 s.
3. Verifies the fix is a response to a preceding `[EX:TRIGGER-FIX-REQUEST]` comment.
4. Guards against re-processing the same fix on multiple pushes.
5. Calls GitHub Models (`gpt-4o-mini`) to evaluate whether all changes were resolved. Falls back to a keyword heuristic if the API fails.
6. **If resolved:** resolves open review threads via `resolveReviewThread` GraphQL mutation, then re-requests Copilot code review via `gh pr edit --add-reviewer @copilot` (requires gh ≥ 2.88.0).
7. **If incomplete:** posts `[EX:FIX-INCOMPLETE]` + `[EX:TRIGGER-FIX-REQUEST]` comment asking Copilot to finish.

**Required secrets:**
- `COPILOT_CLASSIC_PAT` — Classic PAT with `repo` scope. Required for `resolveReviewThread` mutation and `gh pr edit --add-reviewer @copilot`. Fine-Grained PATs are **forbidden** for both operations when the PR was created by the Copilot GitHub App.

**Security guards:** Same as `auto-ready-for-review.yml` (Bot actor, exact login match, same-repo guard, `conclusion == 'success'`).

**Adaptation from DéjàVu:**
- Replace `arc-runner-set` with `self-hosted`.
- Replace all `[DJVR:...]` tags with `[EX:...]` counterparts in comment templates.

---

### 2.5 `auto-merge-on-clean-review.yml`

**Purpose:** When the Copilot code review is clean (zero unresolved threads), merges the PR, closes linked issues, and triggers Copilot on the next task in sequence.

**Triggers:**
- `pull_request_review: submitted` — primary path.
- `workflow_run: completed` on `"Copilot code review"` — fallback for "no new comments" reviews that GitHub does not deliver as `pull_request_review` events to external workflows.

**Runner:** `self-hosted`

**Key logic:**
1. Resolves the PR and verifies it is not a draft and is `MERGEABLE`.
2. Queries all review threads; skips if any are unresolved.
3. Merges the PR via squash merge.
4. Loads `.github/issue-index.json` to find the linked issue and determine the next task in sequence.
5. Closes linked issues as "completed".
6. Triggers Copilot on the next task via three-step sequence:
   - Remove existing `@copilot` assignment (idempotent).
   - Post a context comment (agent name + task description) — does NOT mention `@copilot` to avoid invoking conversational AI.
   - Assign `@copilot` — this starts the coding agent session.

**Required secrets:**
- `GITHUB_TOKEN` (auto-provided) — for merge and issue close.
- `COPILOT_TRIGGER_TOKEN` — Fine-Grained PAT with `Issues: Read and write`. Required to assign `@copilot`. `GITHUB_TOKEN` (bot token) is silently ignored for Copilot assignment.

**Issue index (`.github/issue-index.json`):**
```json
{
  "tasks": [
    {
      "epic": 1,
      "story": 1,
      "task": 1,
      "issue": 42,
      "title": "Add server-side filtering",
      "status": "open",
      "agent": "task-implementer"
    },
    ...
  ]
}
```

**Adaptation from DéjàVu:**
- Replace `arc-runner-set` with `self-hosted`.
- Replace `[DJVR:REVIEW-CLEAN]` / `[DJVR:REVIEW-HAS-SUGGESTIONS]` with `[EX:REVIEW-CLEAN]` / `[EX:REVIEW-HAS-SUGGESTIONS]` in the `if:` condition.
- The next-task agent name (`task-implementer`, etc.) maps to whatever custom agents are defined in the fork's `.github/agents/`.
- Remove DéjàVu-specific title patterns (`Epico N - Historia N - Tarefa N`) and adapt to the exercise issue naming convention.

---

### 2.6 `copilot-setup-steps.yml`

**Purpose:** Runs the environment setup before Copilot starts a coding session. The Copilot Coding Agent calls this job automatically before its first step. Also runnable manually via `workflow_dispatch` for validation.

**Trigger:** `workflow_dispatch` (manual). Copilot also invokes it automatically at session start.

**Runner:** `ubuntu-latest` (GitHub-hosted) — or `self-hosted` if the fork uses a self-hosted runner for setup too.

**DéjàVu version** sets up PostgreSQL + Redis + Directus services, applies database snapshots and seeds, and installs MCP server dependencies.

**Exercise version** must be adapted for the `nextjs-feature-flag-exercise` stack:

```yaml
name: "Copilot Setup Steps"

on:
  workflow_dispatch:

jobs:
  # MUST be named `copilot-setup-steps` — Copilot looks for this exact job name.
  copilot-setup-steps:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    environment: copilot

    permissions:
      contents: read

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: latest

      - name: Install server dependencies
        working-directory: server
        run: pnpm install

      - name: Install client dependencies
        working-directory: client
        run: pnpm install

      - name: Validate server build
        working-directory: server
        run: pnpm run build

      - name: Validate client build
        working-directory: client
        run: pnpm run build

      - name: Run server tests
        working-directory: server
        run: pnpm test

      - name: Display environment info
        run: |
          echo "============================================"
          echo "Exercise Environment Setup Complete"
          echo "============================================"
          echo "Node: $(node --version)"
          echo "pnpm: $(pnpm --version)"
          echo "Server port: 3001"
          echo "Client port: 3000"
          echo "============================================"
```

**Key constraint:** The job **must** be named `copilot-setup-steps` — the Copilot Coding Agent uses this exact name to locate the setup job.

---

## 3) PR Comment Tag System

The tag system allows GitHub Actions workflows to identify PR events unambiguously, regardless of comment wording. Tags are rendered as inline code badges in the GitHub UI.

### Tag dictionary (exercise prefix: `EX`)

| Tag | Posted by | When |
|---|---|---|
| `` `[EX:REVIEW-HAS-SUGGESTIONS]` `` | Copilot Code Review / Code Review agent | Review body — when suggestions or changes are present |
| `` `[EX:REVIEW-CLEAN]` `` | Copilot Code Review / Code Review agent | Review body — when no issues found |
| `` `[EX:FIX-APPLIED]` `` | Copilot Coding Agent | PR comment — when reporting that fixes were applied to commits |
| `` `[EX:TRIGGER-FIX-REQUEST]` `` | `auto-copilot-fix.yml` / `auto-validate-copilot-fix.yml` | Added to comments that request Copilot to apply pending fixes |
| `` `[EX:FIX-INCOMPLETE]` `` | `auto-validate-copilot-fix.yml` | Added when not all review suggestions were addressed |

### Placement rules

1. Tags must appear at the **very beginning** of the comment body, on their own line, before any other content.
2. A comment serving two purposes may include both tags on consecutive lines at the start.

**Examples:**

Clean review:
```
`[EX:REVIEW-CLEAN]`
## Pull request overview

No issues found. The implementation follows all exercise conventions.
```

Fix request trigger (posted by `auto-copilot-fix.yml`):
```
`[EX:TRIGGER-FIX-REQUEST]`
<!-- review-id: 123456789 -->
@copilot Please apply fixes for the following unresolved review threads:

- **`server/src/services/flags.ts`** (line 42): use `const` instead of `let` [→ view](url)
```

Fix applied response (posted by Copilot):
```
`[EX:FIX-APPLIED]`
Applied in commit abc1234. All suggested changes have been addressed:
- Replaced `let` with `const` in `server/src/services/flags.ts`.
```

---

## 4) Required Secrets

Configure these in the fork repository: **Settings → Secrets and variables → Actions → New repository secret**.

For workflows that use `self-hosted` runners and the `copilot` GitHub environment, also add them to: **Settings → Environments → copilot → Add secret**.

| Secret | Type | Required by | Purpose |
|---|---|---|---|
| `COPILOT_CLASSIC_PAT` | Classic PAT (`repo` scope) | `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml` | GraphQL mutations that reject Fine-Grained PATs when the PR was created by a GitHub App (Copilot). Also used for `gh pr edit --add-reviewer @copilot`. |
| `COPILOT_TRIGGER_TOKEN` | Fine-Grained PAT (`Issues: Read and write`) | `auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml` | Post `@copilot` trigger comments; assign `@copilot` to issues. `GITHUB_TOKEN` is silently ignored for Copilot agent assignment. |
| `GITHUB_TOKEN` | Auto-provided | All workflows | PR merge, issue close, list reviews. No manual creation needed. |

### Why two PAT types?

| Operation | Token type | Reason |
|---|---|---|
| `markPullRequestReadyForReview` (GraphQL mutation) | Classic PAT | Fine-Grained PATs rejected by this mutation when PR was created by a GitHub App |
| `resolveReviewThread` (GraphQL mutation) | Classic PAT | Same restriction |
| `gh pr edit --add-reviewer @copilot` | Classic PAT | `gh` CLI auth with Classic PAT for bot review request |
| Assign `@copilot` to issue (REST `addAssignees`) | Fine-Grained PAT | Must be a real user token; `GITHUB_TOKEN` (bot) is silently ignored |
| Post `@copilot` comment (REST `createComment`) | Fine-Grained PAT | Copilot responds to user comments, not bot comments |

---

## 5) Issue Index (`.github/issue-index.json`)

The `auto-ready-for-review.yml` and `auto-merge-on-clean-review.yml` workflows use this file to:
- Mark a task as `in_progress` when its PR is opened.
- Find the next task in sequence and trigger Copilot on it after merge.

**Schema:**
```json
{
  "tasks": [
    {
      "epic":    1,
      "story":   1,
      "task":    1,
      "issue":   42,
      "title":   "Add server-side query parameters for filtering",
      "status":  "open",
      "agent":   "task-implementer"
    }
  ]
}
```

**`status` values:** `open` → `in_progress` → `done`

If the file does not exist, both workflows fall back to text-based issue lookup from PR titles and closing-keyword references in the PR body (`closes #42`, `fixes #42`, etc.).

---

## 6) Adaptation Summary: DéjàVu → Exercise

| Aspect | DéjàVu value | Exercise value |
|---|---|---|
| Runner label | `arc-runner-set` | `self-hosted` |
| PR tag prefix | `DJVR` | `EX` |
| `copilot-setup-steps` services | PostgreSQL, Redis, Directus | Node.js 22 + pnpm (server + client) |
| Stack | Next.js / Directus / PostgreSQL / PostGIS | Express v5 + SQL.js + React 19 + Vite |
| MCP servers | GitHub API + Playwright + Directus custom | GitHub API only (see `mcp-servers.md`) |
| Issue title pattern | `Epico N - Historia N - Tarefa N` | Adapt to exercise issue naming convention |
| Self-hosted runners | 2 runners (docker-compose `runner-1`, `runner-2`) | 1 runner (see `self-hosted-runner.md`) |

---

## 7) References

- [DéjàVu — copilot-push-signal.yml](../../../Dejavu/dejavu-rio-planing/.github/workflows/copilot-push-signal.yml)
- [DéjàVu — auto-ready-for-review.yml](../../../Dejavu/dejavu-rio-planing/.github/workflows/auto-ready-for-review.yml)
- [DéjàVu — auto-copilot-fix.yml](../../../Dejavu/dejavu-rio-planing/.github/workflows/auto-copilot-fix.yml)
- [DéjàVu — auto-validate-copilot-fix.yml](../../../Dejavu/dejavu-rio-planing/.github/workflows/auto-validate-copilot-fix.yml)
- [DéjàVu — auto-merge-on-clean-review.yml](../../../Dejavu/dejavu-rio-planing/.github/workflows/auto-merge-on-clean-review.yml)
- [DéjàVu — copilot-setup-steps.yml](../../../Dejavu/dejavu-rio-planing/.github/workflows/copilot-setup-steps.yml)
- [DéjàVu — PR comment tag dictionary](.github/instructions/pr-comment-tags.instructions.md)
- [Self-hosted runner setup](self-hosted-runner.md)
- [MCP servers reference](mcp-servers.md)
