# Task E0-S6-T2 — Create `auto-ready-for-review.yml`

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T2 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S6-T1](task-E0S6T1-create-copilot-push-signal-yml.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:49:29 -03 |

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
   - `python3 -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.github/workflows/auto-ready-for-review.yml').read_text()); print('YAML_OK')"; echo EXIT:$?`
   - `sed -n '1,220p' .github/workflows/auto-ready-for-review.yml`
- Exit code(s):
   - YAML parse: `0` (`YAML_OK`)
- Output summary:
   - Workflow file exists and is valid YAML.
   - Trigger: `workflow_run` on `Copilot Push Signal` (`completed`).
   - Runner: `self-hosted`.
   - Security guards present: success conclusion, Bot actor type, exact `Copilot` login, same-repo check.
   - Polling logic present: 18 attempts with 10s interval.
   - GraphQL mutation `markPullRequestReadyForReview` present and authenticated with `COPILOT_CLASSIC_PAT`.
   - Optional issue-index step guarded by `hashFiles('.github/issue-index.json') != ''`.
- Files created/updated:
   - `.github/workflows/auto-ready-for-review.yml`
- Risks found / mitigations:
   - Missing `COPILOT_CLASSIC_PAT` at runtime will fail API calls. Mitigation: configure secret before enabling automation run.
   - Potential duplicate conversions mitigated by `is_draft == 'true'` guard.

### Given / When / Then checks

- **Given** T1 artifact exists and workflow reference rules are defined,
- **When** `auto-ready-for-review.yml` is created with guards, polling, and GraphQL conversion,
- **Then** YAML validation exits `0`, all AC-2 criteria are present in file content, and the task is implementation-complete.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved: E0-S6-T1 implemented.
- Downstream items unblocked: E0-S6-T3 (`auto-copilot-fix.yml`) can start.
- Open risks (if any): runtime secret `COPILOT_CLASSIC_PAT` must be configured before workflow execution.
