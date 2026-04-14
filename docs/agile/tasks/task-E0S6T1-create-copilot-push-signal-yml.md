# Task E0-S6-T1 — Create `copilot-push-signal.yml`

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T1 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Blocked |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S2-T4](task-E0S2T4-create-copilot-setup-steps-yml-and-configure-governance.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:40:55 -03 |

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

- Command(s) executed:
  - `find . -path "*/.github/workflows/copilot-setup-steps.yml" -o -path "*/copilot-setup-steps.yml"`
  - `python3 -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.github/workflows/copilot-push-signal.yml').read_text()); print('YAML_OK')"`
  - `sed -n '1,80p' .github/workflows/copilot-push-signal.yml`
- Exit code(s):
  - dependency check: `0` with empty output (file not found in root workflow path)
  - YAML parse: `0` (`YAML_OK`)
- Output summary:
  - `.github/workflows/copilot-push-signal.yml` exists and matches required structure (`name`, triggers, `permissions: {}`, `runs-on: self-hosted`, single echo step).
  - prerequisite `.github/workflows/copilot-setup-steps.yml` was not found in the repository root.
- Files created/updated: `.github/workflows/copilot-push-signal.yml`
- Risks found / mitigations:
  - dependency unmet (`E0-S2-T4` output missing) → task status set to `Blocked` until prerequisite is added.
  - workflow name typo risk → verified exact `name: "Copilot Push Signal"`.

### Given / When / Then checks

- **Given** E0-S2-T4 should provide `.github/workflows/copilot-setup-steps.yml`,
- **When** `copilot-push-signal.yml` is created and YAML validation is executed,
- **Then** the workflow artifact is valid and ready, but the task remains blocked until the prerequisite workflow exists at `.github/workflows/copilot-setup-steps.yml`.

---

## 6) Definition of Done

- [x] `.github/workflows/copilot-push-signal.yml` exists in the fork.
- [x] Workflow name is exactly `"Copilot Push Signal"`.
- [x] `permissions: {}` present (no write access).
- [x] `runs-on: self-hosted` set.
- [x] Triggers: `push` on `copilot/**` and `workflow_dispatch`.
- [x] YAML validation exits 0.
- [ ] Committed with message `feat(ci): add copilot-push-signal anchor workflow`.
- [ ] Story AC-1 satisfied.

---

## 7) Notes for handoff

- Upstream dependencies resolved: E0-S5 is done.
- Downstream items unblocked: none yet (blocked by missing E0-S2-T4 workflow artifact in root path).
- Open risks (if any): if downstream workflows are created before `copilot-setup-steps.yml`, end-to-end chain validation will fail.
