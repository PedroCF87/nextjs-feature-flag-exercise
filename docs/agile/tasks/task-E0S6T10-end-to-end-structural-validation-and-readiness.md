# Task E0-S6-T10 — End-to-end structural validation and readiness

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T10 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist`, `git-ops` |
| **Depends on** | [E0-S6-T6](task-E0S6T6-create-issue-index-infrastructure.md), [E0-S6-T7](task-E0S6T7-create-pr-tag-system-documentation.md), [E0-S6-T8](task-E0S6T8-configure-secrets-and-self-hosted-runner.md), [E0-S6-T9](task-E0S6T9-create-mcp-configuration.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:15:02 -03 |

---

## 1) Task statement

Run structural end-to-end validation of the complete E0-S6 pipeline setup (workflows, issue-index, tag instruction, MCP config, secrets checklist, runner readiness), then sign the CI/CD readiness checklist with objective evidence.

---

## 2) Verifiable expected outcome

1. All 6 expected workflow files exist and pass syntax validation (`actionlint` or equivalent).
2. Supporting artifacts exist: `.github/issue-index.json`, `.github/copilot-mcp.json`, `docs/.github/instructions/pr-comment-tags.instructions.md`, `docs/.github/functions/generate-issue-index.js`, `.agents/governance/workflow-secrets-checklist.md`.
3. `generate-issue-index.js --dry-run` outputs valid JSON with expected schema.
4. Manual trigger of `Copilot Push Signal` completes on self-hosted runner and run ID is recorded.
5. CI/CD readiness checklist (11 items) is fully signed with evidence links and timestamps.

---

## 3) Detailed execution plan

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
