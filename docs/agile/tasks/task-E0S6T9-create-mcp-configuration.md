# Task E0-S6-T9 — Create MCP configuration

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T9 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S2-T4](task-E0S2T4-create-copilot-setup-steps-yml-and-configure-governance.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-14 00:00:00 -03 |

---

## 1) Task statement

Create `.github/copilot-mcp.json` in the fork with the minimum GitHub API MCP server configuration required for this exercise, aligned with `docs/references/mcp-servers.md`.

---

## 2) Verifiable expected outcome

1. File `.github/copilot-mcp.json` exists in the fork root.
2. JSON is valid and contains only the required GitHub MCP server entry.
3. `command` is `npx`, `args` contains `-y` and `@modelcontextprotocol/server-github`.
4. Env mapping includes `GITHUB_PERSONAL_ACCESS_TOKEN: ${GITHUB_TOKEN}`.
5. No Directus or Playwright MCP servers are included in this baseline task scope.

---

## 3) Detailed execution plan

**Goal:** deploy the GitHub API MCP server configuration to the fork.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `nextjs-feature-flag-exercise/.github/copilot-mcp.json`

**Sub-tasks:**

1. Read `docs/references/mcp-servers.md` for the minimum exercise configuration.
2. Create `.github/copilot-mcp.json`:
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-github"],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
         }
       }
     }
   }
   ```
3. Commit: `feat(ci): add GitHub API MCP server configuration`.

**Acceptance:** `copilot-mcp.json` exists at `.github/copilot-mcp.json` in the fork, JSON is valid, references `${GITHUB_TOKEN}`.

**depends_on:** E0-S2-T4 completed

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
  ```bash
  node -e "JSON.parse + field validation" .github/copilot-mcp.json
  ```
- Exit code(s): `0`
- Output summary: `Valid: true` — `command=npx`, `args=[-y, @modelcontextprotocol/server-github]`, `env.GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_TOKEN}`
- Files created/updated: `.github/copilot-mcp.json` (new file, 10 lines)
- Risks found / mitigations: Token never hardcoded — uses `${GITHUB_TOKEN}` environment substitution injected automatically by GitHub Actions in Copilot agent sessions.

### Given / When / Then checks

- **Given** E0-S2-T4 (`copilot-setup-steps.yml`) is Done and `.github/` AI Layer is deployed,
- **When** `.github/copilot-mcp.json` is created with the GitHub API MCP server entry,
- **Then** `node` JSON validation exits `0`, `Valid: true`; file exists at `.github/copilot-mcp.json` with no hardcoded secrets.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved: E0-S2-T4 (`copilot-setup-steps.yml`) ✅
- Downstream items unblocked: E0-S6-T10 (E2E structural validation) can proceed.
- Open risks (if any): MCP configuration in GitHub Settings → Copilot → Coding agent must also be pasted manually by the user (Settings UI step). The file alone is sufficient for local VS Code agent context.
