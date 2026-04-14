# GitHub Actions `copilot` Environment Configuration Checklist

This document lists the manual steps required in the GitHub web UI to enable the
Copilot cloud agent environment for this fork of `nextjs-feature-flag-exercise`.

---

## GitHub UI Configuration Steps

| # | Item | Type | How to configure | Status |
|---|---|---|---|---|
| 1 | Create `copilot` environment in fork | Setup | Fork → Settings → Environments → New environment → name: `copilot` | [ ] |
| 2 | Add `ANTHROPIC_API_KEY` to `copilot` environment secrets | Secret | Settings → Environments → `copilot` → Environment secrets → Add secret | [ ] |
| 3 | Confirm `GITHUB_TOKEN` default permissions: `contents: write`, `pull-requests: write`, `issues: write`, `id-token: write` | Permission | Settings → Actions → General → Workflow permissions → **Read and write permissions** | [ ] |
| 4 | Add branch protection for `main` (prevent direct push) | Policy | Settings → Branches → Add branch ruleset → target: `main` → block direct commits | [ ] |

---

## Workflow Dry-Run Validation

After completing the items above, trigger a dry-run to confirm the environment resolves correctly:

1. Go to **Actions** → **Copilot Setup Steps** → **Run workflow** → select branch `exercise-1` → **Run workflow**.
2. Monitor the run. All steps should pass with exit code `0`.
3. If any step fails, check the error log and verify the secret name matches exactly.

---

## MCP Secrets (for future use — not required for Exercise 1)

No MCP servers are configured for the current exercise scope. The table below lists
names reserved for future MCP integration, should it be needed in later exercises:

| Secret name | Purpose | When needed |
|---|---|---|
| `COPILOT_MCP_JIRA_TOKEN` | Atlassian Jira access via MCP | E2+ (if MCP configured) |
| `COPILOT_MCP_CONFLUENCE_TOKEN` | Atlassian Confluence access via MCP | E2+ (if MCP configured) |

All MCP secrets **must** be placed in the `copilot` environment, not at repository level.
Secret names **must** start with `COPILOT_MCP_`.

---

## Branch Protection Policy Statement

- `main` is protected from direct pushes.
- All exercise work is derived from branch `exercise-1`.
- If branch protection rules are unavailable on the free-tier fork, this written
  commitment applies: **never push directly to `main` during exercise sessions**.
- The working branch for all E0–E4 tasks is `exercise-1`.

---

## Active Workflows in Exercise 1

| File | Status | Notes |
|---|---|---|
| `.github/workflows/copilot-setup-steps.yml` | ✅ Active | Copilot cloud agent environment setup |
| `exercise-2-docs/claude.yml` | ⏸ Inactive | RDH Claude AI workflow — moved out of `.github/workflows/` intentionally |

> `claude.yml` was moved to `exercise-2-docs/` to prevent the RDH workflow from triggering
> during Exercise 1. It will be restored to `.github/workflows/` when Exercise 2 begins.
> Do not move it back prematurely.

---

## Reference

- Workflow file: `.github/workflows/copilot-setup-steps.yml`
- Validator: `docs/.github/functions/validate-workflow-file.js`
- Skill: `.github/skills/copilot-env-setup/SKILL.md`
