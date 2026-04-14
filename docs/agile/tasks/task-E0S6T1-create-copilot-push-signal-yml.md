# Task E0-S6-T1 — Create `copilot-push-signal.yml`

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T1 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S2-T4](task-E0S2T4-create-copilot-setup-steps-yml-and-configure-governance.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:15:02 -03 |

---

## 1) Task statement

Create `.github/workflows/copilot-push-signal.yml` — the anchor workflow that fires on Copilot's pushes to `copilot/**` branches and provides a `workflow_run` trigger source (via its completion event) for all downstream automation workflows, bypassing GitHub's Actions approval gate for bot-authored push events.

---

## 2) Verifiable expected outcome

1. File `.github/workflows/copilot-push-signal.yml` exists in the fork.
2. Workflow `name` is exactly `"Copilot Push Signal"` (downstream triggers depend on this exact string).
3. Triggers include `push` on `copilot/**` and `workflow_dispatch`.
4. `runs-on: self-hosted`.
5. `permissions: {}` (empty — no write access).
6. Contains exactly one step that echoes a message including `${{ github.ref }}`.
7. `yamllint` or `actionlint` exits 0 on the file.

---

## 3) Detailed execution plan

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `.github/workflows/copilot-push-signal.yml` (in the fork root, not in `docs/`)

**Steps:**

1. Read `docs/references/github-workflow-system.md` §2.1.
2. Verify prerequisite: confirm `.github/workflows/copilot-setup-steps.yml` exists (E0-S2-T4 output). **STOP** if missing — dependency not met.
3. Create `.github/workflows/copilot-push-signal.yml` with exactly:
   ```yaml
   name: "Copilot Push Signal"

   on:
     push:
       branches:
         - 'copilot/**'
     workflow_dispatch:

   permissions: {}

   jobs:
     push-signal:
       runs-on: self-hosted
       steps:
         - name: Echo push signal
           run: echo "Copilot push signal received for ${{ github.ref }}"
   ```
4. Validate YAML syntax: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/copilot-push-signal.yml'))"` — must exit 0.
5. Commit: `feat(ci): add copilot-push-signal anchor workflow`.

**Stop conditions:**
- `copilot-setup-steps.yml` does not exist → STOP, unblock E0-S2-T4 first.
- YAML validation fails → fix before committing.

---

## 4) Architecture and security requirements

- **No secrets:** this workflow intentionally uses zero secrets and zero permissions. `permissions: {}` is mandatory.
- **Side-effect-free design:** the anchor workflow must not write files, post comments, or make API calls. Its only purpose is to complete successfully and emit a `workflow_run` completion event.
- **Exact workflow name:** `"Copilot Push Signal"` must be byte-for-byte identical to the string used in downstream `workflow_run` trigger matchers. Any difference silently breaks the downstream chain.
- **Branch filter:** `copilot/**` is a glob pattern — Copilot creates branches like `copilot/fix-123`. Verify the pattern is correct for your GitHub runner version.
- **Rollback:** delete the file and recommit if the workflow causes unintended triggers.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/copilot-push-signal.yml'))"`, `cat .github/workflows/copilot-push-signal.yml`
- Exit code(s): expected `0` for YAML parse, then visual confirmation of `name`, triggers, `permissions`, and step.
- Output summary: YAML parses without error. File content shows `name: "Copilot Push Signal"`, `push.branches: ['copilot/**']`, `workflow_dispatch`, `permissions: {}`, `runs-on: self-hosted`.
- Files created/updated: `.github/workflows/copilot-push-signal.yml`
- Risks found / mitigations: workflow name typo → verify with `grep 'name:' .github/workflows/copilot-push-signal.yml`

### Given / When / Then checks

- **Given** `.github/workflows/copilot-setup-steps.yml` exists from E0-S2-T4,
- **When** `copilot-push-signal.yml` is created with the spec above and YAML is validated,
- **Then** `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/copilot-push-signal.yml'))"` exits 0, the file contains `name: "Copilot Push Signal"`, and `permissions: {}` is present.

---

## 6) Definition of Done

- [ ] `.github/workflows/copilot-push-signal.yml` exists in the fork.
- [ ] Workflow name is exactly `"Copilot Push Signal"`.
- [ ] `permissions: {}` present (no write access).
- [ ] `runs-on: self-hosted` set.
- [ ] Triggers: `push` on `copilot/**` and `workflow_dispatch`.
- [ ] YAML validation exits 0.
- [ ] Committed with message `feat(ci): add copilot-push-signal anchor workflow`.
- [ ] Story AC-1 satisfied.

---

## 7) Notes for handoff

- Upstream dependencies resolved:
- Downstream items unblocked:
- Open risks (if any):
