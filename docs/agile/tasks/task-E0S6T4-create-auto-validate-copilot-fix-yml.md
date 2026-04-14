# Task E0-S6-T4 — Create `auto-validate-copilot-fix.yml`

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T4 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S6-T3](task-E0S6T3-create-auto-copilot-fix-yml.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:15:02 -03 |

---

## 1) Task statement

Create `.github/workflows/auto-validate-copilot-fix.yml` to evaluate whether Copilot actually resolved requested review fixes, re-requesting review when complete or posting an incomplete-fix loop comment when incomplete.

---

## 2) Verifiable expected outcome

1. `.github/workflows/auto-validate-copilot-fix.yml` exists and is valid YAML.
2. Trigger is `workflow_run: completed` on `Copilot Push Signal`.
3. Security guards match AC-2 requirements (success, Bot actor, exact `Copilot`, same repo).
4. Workflow searches for `[EX:FIX-APPLIED]` comment signal with retry loop (6 x 10s).
5. Evaluation path includes GitHub Models (`gpt-4o-mini`) with heuristic fallback.
6. Resolved path performs thread resolution and re-requests Copilot review.
7. Incomplete path posts `[EX:FIX-INCOMPLETE]` + `[EX:TRIGGER-FIX-REQUEST]` comment.

---

## 3) Detailed execution plan

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
