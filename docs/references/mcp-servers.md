# MCP Servers — RDH Exercise Reference

| Field | Value |
|---|---|
| Status | Reference |
| Source project | `dejavu-rio-planing` (`.github/mcp-servers/`) |
| Applies to | `nextjs-feature-flag-exercise` fork |
| Stack note | DéjàVu stack (Directus + PostgreSQL + Playwright) does **not** apply to this exercise. |
| Created at | 2026-04-09 17:57:57 -03 |
| Last updated | 2026-04-09 17:58:17 -03 |

---

## Purpose

Model Context Protocol (MCP) servers extend the Copilot Coding Agent's capabilities during GitHub Actions sessions. This document describes the MCP server pattern used in DéjàVu and defines what applies to the exercise fork.

---

## DéjàVu MCP configuration (reference)

DéjàVu configures three MCP servers in `.github/copilot-mcp.json`:

| Server | Package | Purpose |
|---|---|---|
| GitHub API | `@modelcontextprotocol/server-github` | Create/manage issues, PRs, labels, branches via API |
| Playwright | `@executeautomation/playwright-mcp-server` | E2E browser testing, screenshots, accessibility |
| Directus custom | `.github/mcp-servers/directus-server.js` | Direct access to Directus CMS collections (6 tools) |

Full documentation: [DéjàVu — .github/mcp-servers/README.md](../../../Dejavu/dejavu-rio-planing/.github/mcp-servers/README.md)

---

## Exercise scope

The exercise stack (`Express v5 + SQL.js + React 19 + Vite`) does not use Directus, PostgreSQL, or a browser-based UI that requires Playwright in CI. Therefore:

| Server | Exercise | Reason |
|---|---|---|
| **GitHub API** | ✅ Applicable | Same purpose — issue/PR management works identically regardless of application stack. |
| Playwright | ⚠️ Optional | The exercise has a React client but no dedicated E2E test suite. Can be added if needed. |
| Directus custom | ❌ Not applicable | Exercise uses SQL.js, not Directus. A custom server would need to be built for SQL.js if needed — not required for Exercise 1. |

---

## Minimum configuration for the exercise

Only the GitHub API MCP server is required. Add the following to `.github/copilot-mcp.json` in the fork:

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

**How it is enabled:**
1. Go to the fork repository: **Settings → Copilot → Coding agent**
2. Scroll to "Model Context Protocol (MCP)"
3. Click "Edit" on the MCP configuration
4. Paste the JSON above
5. Save

**Token note:** In a GitHub Actions environment (Copilot coding agent session), `${GITHUB_TOKEN}` is automatically injected — no manual secret creation needed. For local development, export a PAT with `repo` scope as `GITHUB_TOKEN` in your shell.

---

## `copilot-setup-steps.yml` adaptation

DéjàVu's setup workflow includes a step to install the custom MCP server's Node.js dependencies:

```yaml
- name: Install MCP server dependencies
  working-directory: .github/mcp-servers
  run: npm install
```

The exercise's `copilot-setup-steps.yml` **does not need this step** since the GitHub API MCP server is installed on demand by `npx` (no local `node_modules` directory required).

---

## Future: custom MCP server for the exercise (optional)

If the exercise later requires direct SQL.js database inspection, a lightweight custom MCP server could be added at `.github/mcp-servers/sqljs-server.js`. It would provide tools analogous to the Directus tools:

| Tool | Purpose |
|---|---|
| `db_query` | Execute a SELECT query and return rows |
| `db_schema` | Return the current table schema |
| `db_seed_status` | Check whether the in-memory DB is seeded |

This is out of scope for Exercise 1 (Baseline). The standard REST API endpoints (`GET /api/flags`, etc.) provide sufficient access for the agent during implementation.

---

## References

- [DéjàVu — .github/mcp-servers/README.md](../../../Dejavu/dejavu-rio-planing/.github/mcp-servers/README.md)
- [DéjàVu — .github/mcp-servers/directus-server.js](../../../Dejavu/dejavu-rio-planing/.github/mcp-servers/directus-server.js)
- [MCP specification](https://modelcontextprotocol.io/introduction)
- [GitHub MCP Server (npm)](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [GitHub Workflow Automation System](github-workflow-system.md)
