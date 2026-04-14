---
name: copilot-env-setup
description: Creates a copilot-setup-steps.yml workflow and its companion secrets/variables checklist for a target repository. Use this skill when asked to set up the GitHub Copilot cloud agent environment from scratch, add a new MCP server configuration, or validate an existing setup-steps workflow for compliance.
allowed-tools: ["read", "edit", "execute"]
---

## Purpose

Produce a compliant `copilot-setup-steps.yml` workflow file and the accompanying secrets checklist. Every output must pass the `validate-workflow-file.js` check before it is considered complete.

## Mandatory rules (validate before and after writing)

These rules are enforced by `validate-workflow-file.js`. A workflow that violates any of them will be silently ignored by the GitHub Copilot cloud agent:

| Rule | Required value | Why |
|---|---|---|
| Job name | Exactly `copilot-setup-steps` | Copilot identifies the setup job by this exact string |
| `environment:` | `copilot` (at job level, when secrets are used) | Environment-scoped secrets resolve to empty string without this |
| `timeout-minutes` | ≤ 59 | GitHub Actions enforces a hard cap for setup steps |
| Trigger | Must include `workflow_dispatch` | Required for dry-run testing without a Copilot session |
| MCP secret names | Must start with `COPILOT_MCP_` | Naming convention for Copilot MCP injection |
| MCP secrets scope | Must be in `copilot` environment, not repository secrets | Repository secrets are not injected into the agent context |

## Process

1. **Read existing workflow** — search for `.github/workflows/copilot-setup-steps.yml` in the target repository. If it exists, read it with `read_file` and identify which rules above it already satisfies before making any changes.

2. **Identify required setup steps** — determine what the Copilot agent needs installed to run tasks in this repository:
   - Node.js version (check `package.json` `engines` field or `.nvmrc`)
   - Package manager (pnpm / npm / bun) and version
   - Any native dependencies (e.g., Chromium, build tools)
   - MCP servers required (names + configuration)

3. **Produce the workflow file** — use the template below. Fill all `<FILL>` placeholders. Do not add steps beyond what is strictly required.

4. **Validate the output** — run:
   ```bash
   REPO_ROOT="$(git rev-parse --show-toplevel)"
   node "$REPO_ROOT/docs/.github/functions/validate-workflow-file.js" \
     "<path-to-workflow-file>"
   ```
   Stop and fix any reported violation before proceeding. Do not skip this step.

5. **Produce the secrets checklist** — emit a numbered list for every secret or variable that must be added to the `copilot` GitHub Actions environment.

## Workflow template

```yaml
name: Copilot Setup Steps

on:
  workflow_dispatch:

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    environment: copilot
    timeout-minutes: 59

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '<FILL: e.g. 22>'

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '<FILL: e.g. 10>'

      - name: Install server dependencies
        working-directory: server
        run: pnpm install --frozen-lockfile

      - name: Install client dependencies
        working-directory: client
        run: pnpm install --frozen-lockfile

      # Add MCP server steps here if required:
      # - name: Configure <MCP Server Name>
      #   env:
      #     COPILOT_MCP_<KEY>: ${{ secrets.COPILOT_MCP_<KEY> }}
      #   run: |
      #     echo "MCP configured"
```

## Secrets checklist output format

After producing the workflow, always emit:

```
## Secrets and Variables for `copilot` Environment

| # | Name | Type | Source | Notes |
|---|---|---|---|---|
| 1 | COPILOT_MCP_<NAME> | secret | <where to obtain> | <usage note> |
```

If no MCP secrets are needed, state: "No environment secrets required for this configuration."

## Anti-Patterns to Avoid

- **Never** name the job anything other than `copilot-setup-steps` — even a typo silently breaks Copilot.
- **Never** add MCP secrets to repository-level (not environment-level) secrets.
- **Never** set `timeout-minutes` above 59.
- **Never** use `tools: ["*"]` for MCP servers with write access without an explicit security review.
- **Never** store actual API keys or tokens as literal strings — always use `${{ secrets.COPILOT_MCP_* }}`.
- **Never** skip the `validate-workflow-file.js` check before marking the task done.
- **Never** omit `environment: copilot` from the job definition when any step uses an environment secret.
