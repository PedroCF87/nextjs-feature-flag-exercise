---
applyTo: ".github/copilot-instructions.md,.github/instructions/**,.github/agents/**,.github/skills/**"
---

# Copilot Configuration Governance

## Objective

Ensure all AI Layer artifacts in `.github/` are correctly scoped, maintain cross-reference integrity, and never expose secrets or carry context from a different repository.

## Mandatory rules

1. **Always read before editing** — use `read` to inspect the current content of any artifact before applying changes. Never overwrite blindly.

2. **Scope `applyTo` to the target repository** — when deploying an instruction file from a source (e.g., `docs/.github/`) to a target (e.g., fork `.github/`), verify the `applyTo` front matter applies to file patterns that exist in the target. Remove or update workspace-level paths that do not apply.

3. **Never deploy workspace-level global rules verbatim** — `docs/.github/copilot-instructions.md` is a workspace management file. The fork's `.github/copilot-instructions.md` must be generated specifically for that repository using the `global-rules-bootstrap` skill.

4. **Always update `Last updated` metadata** — every artifact that has a `Last updated` field in its metadata must have it refreshed on every edit. Format: `YYYY-MM-DD HH:MM:SS -HH`.

5. **Maintain cross-reference consistency**:
   - Every `.agent.md` body must reference each of its companion skills by name.
   - Every `SKILL.md` must have both `## Purpose` and `## Process` sections.
   - Every `.instructions.md` must begin with a valid YAML front matter block containing `applyTo:`.

6. **Never declare secrets inline** — `copilot-instructions.md` and all `.agent.md` / `SKILL.md` files must reference credential names only (e.g., `COPILOT_MCP_ANTHROPIC_API_KEY`). Actual values must never appear in any committed file.

7. **Never carry context from a different repository** — when adapting agents or skills originally written for another codebase, strip all references to foreign repo names, service names, ports, technology stacks, and file paths. Scope every artifact to the repository where it will be used.

## Do not

- Do not add `applyTo: "**"` to instructions that are meant for a specific layer — over-broad patterns dilute the instruction's signal.
- Do not create `.agent.md` files that lack a `description` field — Copilot uses the description to decide when to invoke the agent.
- Do not create circular skill references (skill A references skill B which references skill A).
