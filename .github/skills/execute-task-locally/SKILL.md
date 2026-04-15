---
name: execute-task-locally
description: >
  Orchestrates the full local workflow for executing a single task from its task file:
  read context, implement changes, run the validation loop (validate → fix → re-validate),
  mark the task as Done, and commit to exercise-1.
  Use this skill whenever a task needs to be executed locally in VS Code instead of via GitHub Issues.
---

# Skill: execute-task-locally

## Purpose

Execute a single task from its task file using a local agent in VS Code.
This is the local equivalent of `execute-task-from-issue`, used when the
GitHub Issue-driven workflow is not available or not needed.

The core discipline is the **validation loop**:
implement → validate → fix → re-validate, repeated until all checks pass.

---

## Inputs

| Input | Source | Notes |
|---|---|---|
| Task file path | `docs/agile/tasks/task-<id>.md` | Repo-relative or absolute |
| Repository root | Working directory | e.g., project root |

---

## Process

### Phase 1 — Read task context

1. Read the task file. Extract:
   - **Task ID** (e.g., `E1-S2-T3`) — used for commit messages.
   - **Depends on** — preceding tasks that must be Done before this one starts.
   - **Verifiable expected outcome** (section 2) — completion criteria.
   - **Detailed execution plan** (section 3) — step-by-step implementation plan.
   - **Artifacts to create/modify** — the files that will change.
2. Read all source files listed in the execution plan to understand current state.
3. Confirm the working directory is clean: `git status --short`.

**🛑 STOP guard — dependency check:**
Before proceeding, verify that every task in `Depends on` has `Status: Done` in its task file.
If any dependency is not Done, **STOP** and report the blocker.

---

### Phase 2 — Implement with validation loop

For **each step** in the execution plan:

```
┌───────────────────────────┐
│ 1. IMPLEMENT              │ ← Make the code change for this step
│                           │
│ 2. VALIDATE               │ ← Run validation commands
│    ┌─────────────────┐    │    (build / lint / test)
│    │ All pass?        │    │
│    │  YES → next step │    │
│    │  NO  ↓           │    │
│    └─────────────────┘    │
│                           │
│ 3. FIX                    │ ← Diagnose and fix the error
│                           │
│ 4. RE-VALIDATE            │ ← Run validation again
│    └─ Still failing? → 3  │    (loop until zero errors)
└───────────────────────────┘
```

**Validation commands by file scope:**

| Changed file scope | Commands |
|---|---|
| `shared/types.ts` | `cd server && pnpm run build` + `cd client && pnpm run build` |
| `server/**` (code) | `cd server && pnpm run build && pnpm run lint && pnpm test` |
| `server/**` (tests only) | `cd server && pnpm test` |
| `client/**` | `cd client && pnpm run build && pnpm run lint` |
| Agile artifacts | `node "docs/.github/functions/validate-task-pack.js" "docs/agile"` |

**Rules during the loop:**
- **Never proceed to the next step with a failing validation.** Fix first.
- **Never accumulate more than one step of unvalidated changes.**
- If a fix introduces a new error, treat it as a new loop iteration.
- If stuck after 3 fix attempts on the same error, record a friction point using `record-friction-point` skill and reassess the approach.

---

### Phase 3 — Final validation

Run the **full** validation suite across both server and client:

```bash
cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
```

**All commands must exit with code 0.** If any fails, return to Phase 2 loop.

---

### Phase 4 — Mark task as Done

1. **Update task file metadata:**
   - Set `**Status**` → `Done`.
   - Set `Last updated` → current timestamp (use `node docs/.github/functions/datetime.js`).

2. **Fill task file sections:**
   - **Section 5 (Validation evidence):**
     ```
     - Command(s) executed: cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
     - Exit code(s): 0
     - Output summary: <brief summary of passing output>
     - Files created/updated: <list of files>
     - Risks found / mitigations: <any issues encountered and how they were resolved>
     ```
   - **Section 6 (Definition of Done):** check all boxes `[x]`.
   - **Section 7 (Notes for handoff):** fill upstream resolved, downstream unblocked, open risks.

3. **Update parent story file:**
   - Find the task heading in `## 4) Tasks`.
   - Prepend `✅ ` before the `[`: `### ✅ [Task E1-S2-T3 — Title](...)`.

---

### Phase 5 — Commit

1. Stage all changes: `git add <files>`.
2. Commit using Conventional Commits format with task ID:
   ```bash
   git commit -m "<type>(<scope>): <description> [<task-id>]"
   ```
   - `type`: `feat` | `fix` | `docs` | `test` | `chore` | `refactor`
   - `scope`: affected module (e.g., `flags`, `validation`, `types`)
   - Include task ID in square brackets at the end.
   - Example: `feat(flags): add FlagFilterParams type to shared contract [E1-S2-T1]`
3. Do **not** push automatically — accumulate commits per story and push at manual checkpoint.

---

### Phase 6 — Story checkpoint (story-final tasks only)

A task is **story-final** when it's the last task in its story (highest T number).

If story-final:
1. Push all accumulated commits: `git push origin exercise-1`.
2. Report to the user:
   ```
   ⏸️ Manual validation checkpoint — last task of story <story-id>.
   Please review all story deliverables before proceeding to the next story.
   Checklist:
   - [ ] All story ACs verified
   - [ ] All tasks in this story are Done
   - [ ] Validation evidence documented
   ```
3. **STOP.** Wait for user confirmation before starting the next story.

---

## Error handling

| Error | When | Action |
|---|---|---|
| Dependency not Done | Phase 1 | Report which task is blocking. **STOP.** |
| Dirty working directory | Phase 1 | Report untracked/modified files. **STOP.** |
| Build/lint/test failure | Phase 2 | Enter fix → re-validate loop. Max 3 attempts before friction log. |
| 3 failed fix attempts | Phase 2 | Record friction point. Reassess approach or ask user. |
| Full validation fails | Phase 3 | Return to Phase 2 for the failing step. |

---

## Constraints

1. **Never commit code that doesn't pass validation.** Every commit must be green.
2. **Never combine multiple tasks in one commit.** One task = one commit.
3. **Never skip the dependency check.** Starting with unmet dependencies causes cascading failures.
4. **Never push to main.** All work goes to `exercise-1`.
5. **Never skip reading the task file.** The task file IS the specification.
6. **Always run validation after every code change.** No exceptions.
