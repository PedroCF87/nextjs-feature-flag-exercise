# Task E0-S6-T8 — Configure secrets and self-hosted runner

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T8 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist`, `git-ops` |
| **Depends on** | [E0-S6-T5](task-E0S6T5-create-auto-merge-on-clean-review-yml.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:15:02 -03 |

---

## 1) Task statement

Document and execute the manual setup for workflow PAT secrets and self-hosted runner readiness, producing a reproducible checklist that proves `COPILOT_CLASSIC_PAT`, `COPILOT_TRIGGER_TOKEN`, and runner health are configured for the fork.

---

## 2) Verifiable expected outcome

1. `.agents/governance/workflow-secrets-checklist.md` exists with table columns: secret, token type, scope, required by, configured status.
2. Checklist explicitly differentiates `COPILOT_CLASSIC_PAT` (Classic PAT, `repo`) and `COPILOT_TRIGGER_TOKEN` (Fine-Grained PAT, `Issues: Read and write`).
3. Checklist includes manual configuration steps for repository secrets and `copilot` environment secrets.
4. Runner setup section includes Docker Compose, registration, and "runner appears Idle" verification.
5. Checklist includes a validation step for `gh auth status` and manual trigger of `Copilot Push Signal`.

---

## 3) Detailed execution plan

**Goal:** configure the two workflow-specific PATs in the fork and set up the self-hosted runner.

**Agent:** `copilot-env-specialist` (documentation), human (manual GitHub UI configuration)

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.agents/governance/workflow-secrets-checklist.md`
- Self-hosted runner operational

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §4 for the secrets specification.
2. Read `docs/references/self-hosted-runner.md` for runner setup.
3. Create `workflow-secrets-checklist.md`:
   - Table: secret name, type, scope, required by, configured status.
   - `COPILOT_CLASSIC_PAT`: Classic PAT, `repo` scope → Repository secrets + `copilot` environment.
   - `COPILOT_TRIGGER_TOKEN`: Fine-Grained PAT, `Issues: Read and write` → Repository secrets + `copilot` environment.
   - Why two PAT types (GraphQL mutation restrictions, Copilot agent assignment).
   - Validation command: `gh auth status`.
   - Runner setup checklist: Docker Compose, registration, health check.
4. **Manual steps** (human):
   - Create PATs via GitHub → Settings → Developer settings → Personal access tokens.
   - Add secrets to fork: Settings → Secrets and variables → Actions.
   - Add secrets to `copilot` environment: Settings → Environments → copilot.
   - Register and start the self-hosted runner per reference guide.
5. Verify runner appears as "Idle" in fork settings.
6. Trigger `copilot-push-signal.yml` via `workflow_dispatch` to validate runner processes jobs.
7. Commit the checklist: `docs(ci): add workflow secrets and runner configuration checklist`.

**Acceptance:** secrets checklist exists, runner online (visible in Settings), manual trigger of push-signal workflow completes on runner.

**depends_on:** T5 completed

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
