# Task E0-S6-T9 — Create MCP configuration

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T9 |
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
