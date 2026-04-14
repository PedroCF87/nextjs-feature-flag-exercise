---
name: copilot-layer-diff
description: Produces a structured diff table comparing AI Layer artifacts between a source directory and a target directory. Use this skill when you need to know which agents, skills, instructions, or workflows are missing, outdated, or already current in a target repository before deploying or migrating AI Layer configuration.
allowed-tools: ["read", "search"]
---

## Purpose

Produce a structured diff table that accurately reflects the status of every AI Layer artifact across source and target directories. The diff drives the migration plan — every row where `Status ≠ current` requires an action.

## Process

Follow these steps in order:

1. **Enumerate source artifacts** — list all files recursively under:
   - `<source>/.github/agents/` → type `agent`
   - `<source>/.github/skills/*/SKILL.md` → type `skill`
   - `<source>/.github/instructions/*.instructions.md` → type `instruction`
   - `<source>/.github/workflows/*.yml` → type `workflow`

2. **Enumerate target artifacts** — repeat the same listing for the target directory. Record absent directories as empty.

3. **Compare each source artifact to target** — apply these rules per artifact type:

   | Artifact type | Condition | Status |
   |---|---|---|
   | any | File absent in target | `missing` |
   | `instruction` | File present AND `applyTo` pattern matches source scope | `current` |
   | `instruction` | File present BUT `applyTo` pattern mismatched or references a different repository scope | `outdated` |
   | `agent` / `skill` | File present AND `description` front-matter matches source scope | `current` |
   | `agent` / `skill` | File present BUT `description` references a different repository scope | `outdated` |
   | `workflow` | File present AND job names, trigger events, and `environment:` value match source | `current` |
   | `workflow` | File present BUT any job name, trigger, or `environment:` value differs from source | `outdated` |
   | `global-rules` (`copilot-instructions.md`) | File present AND the technology stack section matches source | `current` |
   | `global-rules` (`copilot-instructions.md`) | File present BUT technology stack section differs or references a different project | `outdated` |

4. **Produce the diff table** — output one row per source artifact:

   | Artifact | Type | Source path | Target path | Status | Recommended action |
   |---|---|---|---|---|---|
   | `copilot-instructions.md` | global-rules | `docs/.github/copilot-instructions.md` | `.github/copilot-instructions.md` | `missing` | Create via `rules-bootstrap` |
   | `coding-agent.instructions.md` | instruction | `docs/.github/instructions/coding-agent.instructions.md` | `.github/instructions/coding-agent.instructions.md` | `missing` | Adapt scope and create |
   | (continue per artifact) | | | | | |

5. **Summary counts** — after the table, emit:
   ```
   Total: N artifacts  |  Missing: N  |  Outdated: N  |  Current: N
   ```

## Constraints

- Do not modify any files — this skill is read-only.
- Do not assume a file is absent without actually listing the directory.
- Scope comparison rules differ by artifact type — see the per-type table in step 3. Never apply a single rule to all types.
- If the target directory does not exist yet, all source artifacts are `missing`.
- This skill does not produce the migration plan — that is the responsibility of `config-migration-plan`.

## Output format

Plain Markdown table followed by a summary counts line. The table must be sorted: `missing` rows first, then `outdated`, then `current`.
