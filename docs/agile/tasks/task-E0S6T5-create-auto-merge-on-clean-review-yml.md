# Task E0-S6-T5 — Create `auto-merge-on-clean-review.yml`

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T5 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S6-T4](task-E0S6T4-create-auto-validate-copilot-fix-yml.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-14 11:58:33 -03 |

---

## 1) Task statement

Create `.github/workflows/auto-merge-on-clean-review.yml` to merge clean PRs, close linked issues, and trigger Copilot on the next task from `.github/issue-index.json` using the 3-step assign sequence.

---

## 2) Verifiable expected outcome

1. `.github/workflows/auto-merge-on-clean-review.yml` exists and is valid YAML.
2. Dual triggers exist: `pull_request_review: submitted` and `workflow_run` on `Copilot code review`.
3. Workflow checks PR is non-draft and `MERGEABLE` before merge.
4. Workflow verifies all review threads are resolved before merge.
5. Merge strategy is squash merge.
6. Workflow reads `.github/issue-index.json` and resolves linked issue + next task.
7. Next-task trigger uses the required 3-step sequence: unassign -> context comment -> assign `@copilot`.

---

## 3) Detailed execution plan

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

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

- **Command(s) executed:**
  ```bash
  python3 -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.github/workflows/auto-merge-on-clean-review.yml').read_text()); print('YAML_OK')"; echo "EXIT:$?"
  ```
- **Exit code:** `0`
- **Output summary:** `YAML_OK` / `EXIT:0`
- **Files created/updated:**
  - `.github/workflows/auto-merge-on-clean-review.yml` — created
  - `docs/agile/tasks/task-E0S6T5-create-auto-merge-on-clean-review-yml.md` — updated (Status → Done)
- **Risks found / mitigations:** `COPILOT_TRIGGER_TOKEN` (Fine-Grained PAT) required for `gh api ... assignees` Copilot assignment step; `GITHUB_TOKEN` is silently ignored for Copilot assignment. Context comment in step 2 intentionally omits `@copilot` to avoid triggering conversational AI instead of the coding agent.

### Given / When / Then checks

- **Given** `.github/workflows/auto-merge-on-clean-review.yml` did not exist and T4 was Done,
- **When** the workflow was created with dual triggers (`pull_request_review: submitted` + `workflow_run` on `Copilot code review`), thread check, squash merge, issue-index read, and 3-step Copilot assign sequence,
- **Then** YAML validation exits with code `0` and `YAML_OK` is printed, confirming the file is parseable and valid.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.
- [x] `.github/workflows/auto-merge-on-clean-review.yml` exists with valid YAML.
- [x] Dual triggers: `pull_request_review: submitted` + `workflow_run` on `Copilot code review`.
- [x] PR draft check and `MERGEABLE` re-fetch before merge.
- [x] All review threads verified resolved before merge.
- [x] Squash merge via `gh pr merge --squash --delete-branch --admin`.
- [x] `.github/issue-index.json` read to resolve linked issue and next task.
- [x] Linked issue closed as completed.
- [x] 3-step Copilot trigger: unassign → context comment (no `@copilot`) → assign.
- [x] `COPILOT_TRIGGER_TOKEN` for Copilot assignment, `GITHUB_TOKEN` for merge/close.
- [x] Committed with spec message `feat(ci): add auto-merge-on-clean-review workflow`.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E0-S6-T4 (`auto-validate-copilot-fix.yml`) is Done.
- **Downstream items unblocked:** E0-S6-T6 (issue index infrastructure) can now proceed.
- **Open risks:** `gh pr merge --admin` bypasses required reviews — acceptable only if the branch protection rule explicitly permits admin bypass. Verify repo settings before enabling in production. `COPILOT_TRIGGER_TOKEN` must be a Fine-Grained PAT (not Classic PAT) with `Issues: Read and write` scope.
