---
applyTo: ".github/copilot-instructions.md,.github/instructions/**,.github/agents/**,.github/skills/**"
---

# Copilot Configuration Governance

## Objective

Ensure all AI Layer artifacts in `.github/` are correctly scoped, maintain cross-reference integrity, and never expose secrets or carry context from a different repository.

> **Single source of truth:** `.github/` at the repository root is the **live AI Layer** read by GitHub Copilot.
> `docs/.github/` is a legacy reference/template area — it is NOT read by Copilot and must NOT be used as the target for new AI Layer artifacts.
> All agents, skills, instructions, and workflows must be created and maintained in `.github/` (root).

## Mandatory rules

1. **Always read before editing** — use `read` to inspect the current content of any artifact before applying changes. Never overwrite blindly.

2. **Scope `applyTo` to the target repository** — verify the `applyTo` front matter applies to file patterns that exist in this repository. Remove or update any workspace-level paths that do not apply.

3. **Never copy workspace-level global rules verbatim** — the workspace `copilot-instructions.md` contains multi-repo context. Any `copilot-instructions.md` for a specific repository must be generated or adapted specifically for that repository's scope.

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
- Do not create or modify AI Layer artifacts in `docs/.github/` — that directory is a legacy reference area. The live AI Layer is `.github/` (root).
- Do not open PRs for Epic 0 tasks — commit directly to `exercise-1`.
