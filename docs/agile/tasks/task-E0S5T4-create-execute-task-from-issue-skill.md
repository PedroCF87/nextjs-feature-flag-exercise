# Task E0-S5-T4 — Create `execute-task-from-issue` skill

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S5-T4 |
| **Story** | [E0-S5 — Execution Automation for Epic 1](../stories/story-E0S5-execution-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer`, `agile-exercise-planner` |
| **Depends on** | E0-S5-T3 |
| **Blocks** | — |
| Created at | 2026-04-13 13:23:32 -03 |
| Last updated | 2026-04-13 13:23:32 -03 |

---

## 1) Task statement

Create `Docs/.github/skills/execute-task-from-issue/SKILL.md` — a skill that defines the 6-phase workflow for executing a single task from a GitHub Issue: read context → prepare branch → execute plan → commit/push → create PR → manual checkpoint.

---

## 2) Verifiable expected outcome

1. File `Docs/.github/skills/execute-task-from-issue/SKILL.md` exists and is readable.
2. Skill defines exactly 6 numbered phases with ordered steps.
3. Phase 1 includes a dependency check with an explicit STOP guard (if dependencies are not met, the agent must not proceed).
4. Phase 2 defines branch naming convention: `task/<task-id-lowercase>`.
5. Phase 5 includes a PR body template with `Closes #<issue-number>` link.
6. Phase 6 includes a manual checkpoint comment template and an explicit `STOP` instruction — the agent must never self-merge.
7. Skill defines an `Error Handling` table with STOP conditions for each error type.
8. Skill defines a `Constraints` section with at least: "Never merge the PR automatically" and "Never combine multiple tasks in one PR".

---

## 3) Detailed execution plan

**Goal:** create a skill that orchestrates the full Issue → agent execution → PR → merge workflow.

**Agent:** `agile-exercise-planner`

**Artifacts to create:**
- `Docs/.github/skills/execute-task-from-issue/SKILL.md`

**Sub-tasks:**

1. Read `Docs/.github/copilot-instructions.md` section "Task Execution Model" for the one-Issue-per-task workflow.
2. Create `execute-task-from-issue/SKILL.md`:

```markdown
---
name: execute-task-from-issue
description: Orchestrates the full workflow from GitHub Issue to merged PR for a single task.
---

# Skill: execute-task-from-issue

## Purpose

Execute a single task from its corresponding GitHub Issue, producing a merged PR with all artifacts committed.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| Issue number | GitHub Issue | The Issue created from a task file |
| Repository | GitHub | `owner/repo` where the Issue was created |
| Task file path | From Issue body | Extracted from the "Task File" section |

---

## Process

### Phase 1 — Read task context

1. Read the Issue body to extract the task file path.
2. Read the task file to extract:
   - Task ID (for branch naming)
   - Responsible agent(s)
   - Input files (from Depends on + execution plan)
   - Expected outcome (for validation)
3. Read all input files mentioned in the task.

### Phase 2 — Prepare branch

1. Ensure working directory is clean (`git status`).
2. Checkout the base branch (`exercise-1`).
3. Pull latest changes.
4. Create feature branch: `task/<task-id>` (e.g., `task/E1-S1-T1`).

### Phase 3 — Execute task

1. Invoke the task's `Responsible agent` with the task statement and execution plan.
2. Follow the execution plan step by step.
3. After each step, run validation commands if applicable.
4. Stop on first validation failure — do not accumulate broken state.

### Phase 4 — Commit and push

1. Stage all relevant changes.
2. Commit with Conventional Commits format:
   ```
   <type>(<scope>): <description>
   
   Closes #<issue-number>
   ```
3. Push the feature branch to origin.

### Phase 5 — Create PR

1. Create a PR with:
   - Title: `[<task-id>] <task-title>`
   - Body: Reference to the Issue (`Closes #<issue-number>`)
   - Base: `exercise-1`
   - Head: `task/<task-id>`
2. If this is the last task in a story, add a comment requesting manual validation.

### Phase 6 — Manual checkpoint (for story-final tasks)

For tasks that are the last in a story (e.g., E1-S1-T5 if the story has 5 tasks):

1. Add a PR comment: "⏸️ Manual validation checkpoint — please review before merge."
2. Wait for human approval (do not auto-merge).

---

## Outputs

| Output | Location |
|---|---|
| Feature branch | `origin/task/<task-id>` |
| PR | GitHub PR linked to Issue |
| Committed artifacts | All files created/modified by the task |

---

## Error handling

| Error | Recovery |
|---|---|
| Validation failure | Stop execution, update Issue with failure details, do not create PR |
| Git conflict | Stop execution, update Issue requesting manual resolution |
| Agent failure | Log error to Issue, allow retry from same point |

---

## Constraints

- Never merge without at least one successful CI check (if CI is configured).
- Never skip Phase 6 checkpoint for story-final tasks.
- Never commit partial work — each PR must represent a complete task.
```

3. Commit the skill file.

**Acceptance:** skill file exists with all 6 phases, error handling, and constraints documented.

**depends_on:** T3 completed

---

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed:
- Exit code(s):
- Output summary:
- Files created/updated:
- Risks found / mitigations:

### Given / When / Then checks

- **Given** the `execute-task-from-issue/SKILL.md` exists and is loaded by an agent executing a task from an Issue,
- **When** the agent follows all 6 phases,
- **Then** a branch `task/<id>` is created, changes are committed and pushed, a PR is opened with `Closes #<N>`, and the agent stops at Phase 6 awaiting human review — without self-merging.

---

## 6) Definition of Done

- [ ] Expected outcome is objectively verifiable.
- [ ] Dependencies are explicit and valid.
- [ ] Security and architecture checks were performed.
- [ ] Validation evidence is attached.
- [ ] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved:
- Downstream items unblocked:
- Open risks (if any):
