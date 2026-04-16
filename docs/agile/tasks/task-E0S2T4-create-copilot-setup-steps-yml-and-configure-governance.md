# Task E0-S2-T4 — Create copilot-setup-steps.yml and configure governance

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S2-T4 |
| **Story** | [E0-S2 — Minimum AI Layer Configuration](../stories/story-E0S2-minimum-ai-layer.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `copilot-env-specialist` |
| **Skill** | `copilot-env-setup` |
| **Depends on** | [E0-S2-T0 — Bootstrap AI Layer management artifacts](task-E0S2T0-bootstrap-ai-layer-management-artifacts.md) |
| **Blocks** | E0-S2-T5 |
| Created at | 2026-04-11 15:14:45 -03 |
| Last updated | 2026-04-14 00:00:00 -03 |

---

## 1) Task statement

> **Execution context:** T4 runs **locally in VS Code** (Epic 0 local execution model — no PR required).
> T0 artifacts must exist before this task starts
> (T4 may run in parallel with T1, T2, T3).
> Define `REPO_ROOT` once at the start of any shell session:
> ```bash
> REPO_ROOT="$(git rev-parse --show-toplevel)"
> ```
> T4 ends with a direct commit and push to `exercise-1`.

Enable the GitHub Copilot cloud agent environment in the personal fork of `nextjs-feature-flag-exercise` by:
1. Creating `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` with the mandatory structure required by GitHub Copilot.
2. Validating the file structure with `validate-workflow-file.js` — stop if any check fails.
3. Producing the governance checklist document covering: `copilot` environment creation, secrets, token permissions, and branch protection policy.

All files must be committed in this task — the execution plan ends with a commit and push to the fork.

---

## 2) Verifiable expected outcome

1. `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` exists.
2. `validate-workflow-file.js` exits `0` with all 4 structural checks passing:
   - Job name is exactly `copilot-setup-steps`.
   - `environment: copilot` declared at the job level.
   - `timeout-minutes` value is ≤ 59.
   - `workflow_dispatch` trigger is present.
3. Workflow contains steps for: checkout (ref `exercise-1`), Node.js setup, pnpm setup, server install, client install, server validate (`build + test`), client validate (`build`).
4. Governance checklist document exists at `nextjs-feature-flag-exercise/.agents/governance/copilot-environment-checklist.md` (or equivalent path under `.agents/`).

---

## 3) Detailed execution plan

### Step 0 — Confirm T0 outputs exist (hard dependency)

Before executing T4, confirm required artifacts created in T0 exist:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/skills/copilot-env-setup/SKILL.md" \
  ".github/functions/validate-workflow-file.js"
```

🔴 **Stop if any item shows `❌`**. Return to T0 and complete missing artifacts first.

### Step 1 — Read existing workflow files for context

Read `nextjs-feature-flag-exercise/.github/workflows/claude.yml` using `read_file` to understand:
- Current permissions block (contents, pull-requests, issues, id-token).
- Which secrets are referenced (`ANTHROPIC_API_KEY`).
- Existing job structure.

This context informs the governance checklist in Step 4.

**Stop condition:** `claude.yml` read in full. Do not create `copilot-setup-steps.yml` from memory.

### Step 2 — Read the copilot-env-setup skill

Read `docs/.github/skills/copilot-env-setup/SKILL.md` (created in T0) using `read_file`. Follow its mandatory rules exactly:
- Job name = `copilot-setup-steps` (exact — this is what GitHub Copilot looks for).
- `environment: copilot` at the job level.
- `timeout-minutes` ≤ 59.
- `workflow_dispatch` trigger.

### Step 3 — Create `copilot-setup-steps.yml`

Write `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` with the following content:

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place.

```yaml
name: Copilot Setup Steps

on:
  workflow_dispatch:

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    environment: copilot
    timeout-minutes: 15
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: exercise-1

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install server dependencies
        working-directory: server
        run: pnpm install --frozen-lockfile

      - name: Install client dependencies
        working-directory: client
        run: pnpm install --frozen-lockfile

      - name: Validate server (build + test)
        working-directory: server
        run: pnpm run build && pnpm test

      - name: Validate client (build)
        working-directory: client
        run: pnpm run build
```

**Node.js version note:** use `'22'` to match the confirmed local environment (Node.js v22.18.0, validated in E0-S1-T2). The pnpm version must match `pnpm-lock.yaml` lockfile format — use `10` (matching pnpm 10.28.2 from E0-S1 validation).

### Step 4 — Validate the workflow file

Run `validate-workflow-file.js` immediately after writing:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/validate-workflow-file.js" \
  "$REPO_ROOT/.github/workflows/copilot-setup-steps.yml"
```

**Expected:** exit code `0`, all 4 checks pass.

🔴 **Stop if any check fails.** Fix the YAML before proceeding to Step 5.

### Step 5 — Produce the governance checklist document

Write `nextjs-feature-flag-exercise/.agents/governance/copilot-environment-checklist.md` with the following governance checklist:

- If the file does not exist yet: create it.
- If the file already exists (partial run or rework): update it in place.

**Title:** GitHub Actions `copilot` Environment Configuration Checklist

**GitHub UI configuration steps (to be completed manually via browser):**

| # | Item | Type | How to configure | Status |
|---|---|---|---|---|
| 1 | Create `copilot` environment in fork | Setup | Fork → Settings → Environments → New environment → name: `copilot` | [ ] |
| 2 | Add `ANTHROPIC_API_KEY` to `copilot` environment secrets | Secret | Settings → Environments → `copilot` → Add secret | [ ] |
| 3 | Confirm default `GITHUB_TOKEN` permissions: `contents: write`, `pull-requests: write`, `issues: write`, `id-token: write` | Permission | Settings → Actions → General → Workflow permissions → Read and write | [ ] |
| 4 | Add branch protection for `main` (prevent direct push) | Policy | Settings → Branches → Add branch ruleset → `main` | [ ] |

**MCP secrets (for future use — not required for Exercise 1):**

| Secret name | Purpose | When needed |
|---|---|---|
| `COPILOT_MCP_JIRA_TOKEN` | Atlassian Jira access | E0-S2+ (if MCP configured) |
| `COPILOT_MCP_CONFLUENCE_TOKEN` | Atlassian Confluence access | E0-S2+ (if MCP configured) |

**Branch protection policy statement:**
- `main` is protected from direct pushes.
- All exercise work is derived from `exercise-1`.
- If branch protection rules are unavailable (free-tier fork), a written commitment applies: never push directly to `main` during exercise sessions.

### Step 6 — Verify the governance document exists

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
ls -la "$REPO_ROOT/.agents/governance/copilot-environment-checklist.md"
```

Expected: file listed with size > 0.

### Step 7 — Commit and push

Commit and push `copilot-setup-steps.yml` directly to `exercise-1`. The governance
checklist is a local reference document used for GitHub UI manual steps — commit it too so
it's preserved in the fork:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
git add .github/workflows/copilot-setup-steps.yml .agents/governance/copilot-environment-checklist.md
git status  # confirm only these 2 files are staged
git commit -m "feat(ai-layer): add copilot-setup-steps workflow and governance checklist"
git push origin exercise-1
```

**Stop condition:** push succeeds. If `origin` is `dynamous-business/nextjs-feature-flag-exercise`, block — return to E0-S1-T1.

---

## 4) Architecture and security requirements

**Input validation:**
- Read `claude.yml` with `read_file` before writing `copilot-setup-steps.yml` — do not assume the current permissions structure.
- Run `validate-workflow-file.js` immediately after writing — do not skip this check under any circumstance.

**Secrets handling:**
- `copilot-setup-steps.yml` must not contain hardcoded secrets or API keys.
- Secrets are referenced by name only (e.g., `${{ secrets.ANTHROPIC_API_KEY }}`); they are stored in the GitHub `copilot` environment.
- The governance checklist file must not contain actual secret values — only secret names and configuration instructions.

**Rollback/fallback:**
- If `validate-workflow-file.js` fails any check: fix and rewrite the file in place; if irrecoverably malformed, delete and recreate.
- Common YAML pitfalls: `timeout-minutes` must be a number (not quoted); `environment:` must be at the job level (not step level); job name must be exactly `copilot-setup-steps` (hyphenated, lowercase).
- These files live in `nextjs-feature-flag-exercise/` — outside `docs/agile/` — the VS Code Agent Hook does not cover them.

**Architecture boundary:**
- The workflow uses `actions/checkout@v4`, `actions/setup-node@v4`, and `pnpm/action-setup@v4` — standard public GitHub Actions. Do not pin to personal forks or non-official action sources.
- `workflow_dispatch` trigger is required for dry-run validation — do not remove it even if other triggers are added later.

---

## 5) Validation evidence

### Command 1 — Workflow file structural check

```bash
node "docs/.github/functions/validate-workflow-file.js" \
  "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml"
```

**Expected exit code:** `0`
**Expected output:** all 4 checks show ✅ (job name, environment, timeout-minutes, workflow_dispatch).

### Command 2 — Governance document existence

```bash
ls -la "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/.agents/governance/copilot-environment-checklist.md"
```

**Expected exit code:** `0`

### BDD verification signal

**Given** `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` does not exist
**When** I read `claude.yml`, apply the `copilot-env-setup` skill rules, and create the workflow file with job name `copilot-setup-steps`, `environment: copilot`, `timeout-minutes: 15`, and `workflow_dispatch` trigger
**Then** `validate-workflow-file.js` exits `0` with all 4 structural checks passing
**And** the governance checklist document exists at `.agents/governance/copilot-environment-checklist.md`
**And** the checklist contains entries for `ANTHROPIC_API_KEY` secret, `copilot` environment creation, token permissions, and branch protection policy

**Affected files:**

| File | Action |
|---|---|
| `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` | Created and committed |
| `nextjs-feature-flag-exercise/.agents/governance/copilot-environment-checklist.md` | Created (not committed in E0-S2 bundle — this is a reference document for manual setup) |

---

## 6) Definition of Done

- [x] `copilot-setup-steps.yml` exists at the correct path.
- [x] `validate-workflow-file.js` exits `0` — all 4 checks pass.
- [x] Job name is exactly `copilot-setup-steps`.
- [x] `environment: copilot` declared at the job level.
- [x] `timeout-minutes` value is ≤ 59.
- [x] `workflow_dispatch` trigger is present.
- [x] Workflow steps cover: checkout (ref `exercise-1`), Node.js (v22), pnpm (v10), server install, client install, server validate, client validate.
- [x] Governance checklist document exists with entries for: `copilot` environment, `ANTHROPIC_API_KEY`, token permissions, and branch protection.
- [x] Files committed directly to `exercise-1` (Epic 0 local execution — no PR required).
