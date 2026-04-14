# Task E0-S6-T2 — Create `auto-ready-for-review.yml`

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T2 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S6-T1](task-E0S6T1-create-copilot-push-signal-yml.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:15:02 -03 |

---

## 1) Task statement

Create `.github/workflows/auto-ready-for-review.yml` to convert Copilot draft PRs to ready-for-review after `Copilot Push Signal` completes, with strict bot/repo security guards and GraphQL mutation authentication via `COPILOT_CLASSIC_PAT`.

---

## 2) Verifiable expected outcome

1. `.github/workflows/auto-ready-for-review.yml` exists and is valid YAML.
2. Trigger is `workflow_run: completed` for workflow `Copilot Push Signal`.
3. Workflow includes all 4 security guards: success conclusion, Bot actor type, exact actor login `Copilot`, and same-repo check.
4. Polling logic is present (18 attempts x 10s) before running mutation.
5. Mutation `markPullRequestReadyForReview` is present and uses `COPILOT_CLASSIC_PAT`.
6. Optional issue-index update step is guarded so it runs only when `.github/issue-index.json` exists.

---

## 3) Detailed execution plan

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

- **Given** all task dependencies are available and validated,
- **When** this task execution plan is completed and evidence is collected,
- **Then** the task outcome is reproducible, secure, and auditable by another agent.

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
