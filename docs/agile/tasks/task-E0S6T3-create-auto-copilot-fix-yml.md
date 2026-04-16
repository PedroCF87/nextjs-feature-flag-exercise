# Task E0-S6-T3 — Create `auto-copilot-fix.yml`

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T3 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S6-T2](task-E0S6T2-create-auto-ready-for-review-yml.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-14 11:24:21 -03 |

---

## 1) Task statement

Create `.github/workflows/auto-copilot-fix.yml` to request fixes from `@copilot` whenever the code review reports suggestions, using unresolved thread discovery and an idempotent trigger-comment strategy.

---

## 2) Verifiable expected outcome

1. `.github/workflows/auto-copilot-fix.yml` exists and is valid YAML.
2. Dual triggers exist: `workflow_run` on `Copilot code review` and fallback `pull_request_review: submitted`.
3. Workflow queries unresolved review threads via GraphQL and filters unresolved entries.
4. Trigger comment contains `[EX:TRIGGER-FIX-REQUEST]` and idempotency marker `<!-- review-id: {id} -->`.
5. Summary-only review fallback forwards full review body when no inline threads exist.
6. Workflow uses `COPILOT_TRIGGER_TOKEN` to post Copilot-trigger comments.

---

## 3) Detailed execution plan

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
  python3 -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.github/workflows/auto-copilot-fix.yml').read_text()); print('YAML_OK')"; echo "EXIT:$?"
  ```
- **Exit code:** `0`
- **Output summary:** `YAML_OK` / `EXIT:0`
- **Files created/updated:**
  - `.github/workflows/auto-copilot-fix.yml` — created
  - `docs/agile/tasks/task-E0S6T3-create-auto-copilot-fix-yml.md` — updated (Status → Done)
- **Risks found / mitigations:** YAML heredoc with `[EX:TRIGGER-FIX-REQUEST]` on a bare line was misinterpreted by the YAML parser as a flow sequence key. Fixed by replacing the heredoc with ANSI `$'\n'` string concatenation in shell.

### Given / When / Then checks

- **Given** `.github/workflows/auto-copilot-fix.yml` did not exist and T2 was Done,
- **When** the workflow file was created with dual trigger (`workflow_run` on `Copilot code review` + fallback `pull_request_review`) and YAML validated with `python3 yaml.safe_load`,
- **Then** exit code is `0` and `YAML_OK` is printed, confirming the file is parseable and valid.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.
- [x] `.github/workflows/auto-copilot-fix.yml` exists with valid YAML.
- [x] Dual trigger configured (`workflow_run` + `pull_request_review`).
- [x] Idempotency guard `<!-- review-id: {id} -->` present.
- [x] Uses `COPILOT_TRIGGER_TOKEN` (no hardcoded secrets).
- [x] Committed with spec message `feat(ci): add auto-copilot-fix workflow`.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E0-S6-T2 (`auto-ready-for-review.yml`) is Done.
- **Downstream items unblocked:** E0-S6-T4 (`auto-validate-copilot-fix.yml`) can now proceed.
- **Open risks:** None. YAML heredoc issue resolved via ANSI `$'\n'` concatenation.
