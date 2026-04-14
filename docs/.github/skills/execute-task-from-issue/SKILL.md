---
name: execute-task-from-issue
description: >
  Orchestrates the full workflow from GitHub Issue to merged PR for a single task.
  Reads the task context from the Issue body, prepares a feature branch, executes the plan,
  commits, creates a PR, and enforces a manual checkpoint for story-final tasks.
  Use this skill whenever a task is started from its corresponding GitHub Issue.
---

# Skill: execute-task-from-issue

## Purpose

Execute a single task from its corresponding GitHub Issue, producing a feature branch and a PR with
all artifacts committed. The agent **never self-merges** — merge is always a human or automated
pipeline action.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| Issue number | GitHub Issue | The Issue created from a task file by `create-github-issue-from-task.js` |
| Repository | GitHub | `owner/repo` where the Issue lives |
| Task file path | Issue body `## Task File` section | Absolute or repo-relative path |

---

## Process

### Phase 1 — Read task context

1. Read the Issue body to extract the **task file path** from the `## Task File` section.
2. Read the task file. Extract:
   - Task ID (e.g., `E1-S2-T3`) — used for branch naming.
   - `Responsible agent` field — the agent that will execute the plan.
   - `Depends on` field — the preceding tasks that must be merged before this one starts.
   - `## 2) Verifiable expected outcome` — the completion criteria.
   - `## 3) Detailed execution plan` — the step-by-step plan.
3. Read all input files explicitly listed in the execution plan.

**🛑 STOP guard — dependency check:**
Before proceeding to Phase 2, verify that every task listed in `Depends on` has a merged PR.
- Check: `gh pr list --repo <repo> --state merged --search "<depends-on-task-id>"`.
- If any dependency is **not merged**, post a comment on the Issue:
  ```
  ⛔ Dependency not met: <task-id> must be merged before this task can start.
  Blocking execution until dependency is resolved.
  ```
  Then **STOP**. Do not proceed to Phase 2.

---

### Phase 2 — Prepare branch

1. Confirm working directory is clean: `git status --short`. If untracked or modified files exist, **STOP** and report.
2. Check out the base branch: `git checkout exercise-1`.
3. Pull latest changes: `git pull origin exercise-1`.
4. Create the feature branch: `git checkout -b task/<task-id-lowercase>`.
   - Branch name convention: `task/` prefix + task ID in **lowercase with hyphens**, no underscores.
   - Example: task ID `E1-S2-T3` → branch `task/e1-s2-t3`.

---

### Phase 3 — Execute task

1. Invoke the task's `Responsible agent` with the task statement and execution plan as context.
2. Follow the execution plan **step by step**. Do not skip steps.
3. After each step that produces or modifies a file, run the applicable validation command:
   - Backend file changes: `cd server && pnpm run build`
   - Frontend file changes: `cd client && pnpm run build`
   - Agile artifact changes: `node "docs/.github/functions/validate-task-pack.js" "docs/agile"`
4. **Stop on first validation failure.** Do not proceed to Phase 4 with broken state.
5. If blocked, comment on the Issue with the error and resolution attempted.

---

### Phase 4 — Commit and push

1. Stage all relevant changes: `git add <files>`.
2. Commit using [Conventional Commits](https://www.conventionalcommits.org/) format:
   ```
   <type>(<scope>): <description>

   Closes #<issue-number>
   ```
   - `type`: `feat` | `fix` | `docs` | `style` | `refactor` | `test` | `chore`
   - `scope`: affected module or layer (e.g., `flags`, `validation`, `backlog`)
   - `description`: imperative present tense, ≤ 72 characters
3. Push the feature branch: `git push origin task/<task-id-lowercase>`.

---

### Phase 5 — Create PR

Open a PR via `gh pr create` with the following parameters (use `--` array arg form to avoid shell injection):

| Parameter | Value |
|---|---|
| `--repo` | `<owner/repo>` |
| `--title` | `[<task-id>] <task-title>` |
| `--base` | `exercise-1` |
| `--head` | `task/<task-id-lowercase>` |
| `--body` | See template below |

**PR body template:**

```markdown
## Summary
<!-- One paragraph summarizing what was implemented. -->

## Related issue
Closes #<issue-number>

## Checklist
- [ ] Validation commands pass (build / lint / test)
- [ ] No hardcoded secrets or credentials
- [ ] Conventional Commit format used
```

---

### Phase 6 — Manual checkpoint (story-final tasks only)

A task is **story-final** when its ID is the highest-numbered task in its story (e.g., if the story has T1–T5, T5 is story-final).

1. Determine if this task is story-final by reading `backlog-index.json` and checking whether this is the last task under the story.
2. If story-final, post the following comment on the PR **before stopping**:
   ```
   ⏸️ **Manual validation checkpoint** — this is the last task of story <story-id>.
   Please review all story deliverables before merging.
   Checklist:
   - [ ] All story ACs verified
   - [ ] All previous PRs in this story are merged
   - [ ] Evidence documented in task section 5
   ```
3. **🛑 STOP. Do not merge the PR.** Merge is the human's (or pipeline's) responsibility.

---

## Error handling

| Error | When it occurs | Action |
|---|---|---|
| Dependency not merged | Phase 1 dependency check fails | Post comment on Issue. **STOP.** |
| Dirty working directory | Phase 2 `git status` is non-empty | Report untracked/modified files. **STOP.** |
| Build failure | Phase 3 validation command exits non-zero | Post error output on Issue. **STOP.** |
| `gh pr create` fails | Phase 5 | Retry once. If still fails, post error on Issue. **STOP.** |
| Branch already exists | Phase 2 `git checkout -b` fails | Check if branch has uncommitted work. Ask for human decision. **STOP.** |

---

## Constraints

1. **Never merge the PR automatically.** Merge is always a human or pipeline action. The agent's job ends after Phase 5 (or Phase 6 for story-final tasks).
2. **Never combine multiple tasks in one PR.** Each PR must correspond to exactly one task and one Issue.
3. **Never skip the dependency check in Phase 1.** Starting a task with unmet dependencies causes downstream conflicts.
4. **Never proceed with broken state.** If a validation command fails, STOP and report — do not commit failing code.
5. **Never hardcode secrets, tokens, or credentials** in committed files.
6. **Always use the `task/<id>` branch naming convention.** No custom branch names.
7. **Always reference the Issue with `Closes #<number>`** in the commit message body and the PR body.
