---
name: global-rules-bootstrap
description: Generates a copilot-instructions.md for a repository from its existing documentation (AGENTS.md, CLAUDE.md, README.md, TASK.md). Use this skill when you need to produce or update a global rules file that accurately reflects a repository's tech stack, architecture, validation commands, branch rules, and commit conventions.
---

## Purpose

Produce a complete, accurate `copilot-instructions.md` for a target repository by extracting facts from existing documentation. Every section must be filled with actual project data — never with generic placeholders.

## Input sources (read in this order)

1. `AGENTS.md` — primary source: tech stack table, commands, architecture section, key files table, error patterns
2. `CLAUDE.md` — secondary validation: confirms tech stack and commands (often mirrors AGENTS.md)
3. `README.md` — project overview, purpose, contributing notes
4. `TASK.md` — current exercise/feature scope and acceptance criteria

Stop if all 4 files are absent. At minimum, `AGENTS.md` or `CLAUDE.md` must be present.

## Process

1. **Read all input sources** — use `read` on each file listed above. Do not write output until all available files have been read.

2. **Extract the 7 required facts** — for each required section below, identify the authoritative source lines from the files read in step 1:

   | Section | Primary source | What to extract |
   |---|---|---|
   | Repository purpose | `README.md`, `TASK.md` | 2–3 sentence scope description, working branch name, current feature task |
   | Tech stack | `AGENTS.md` tech stack table | All rows: layer / technology / version / purpose |
   | Architecture / data flow | `AGENTS.md` architecture section | Data flow chain from types → validation → service → route → client → UI |
   | Validation commands | `AGENTS.md` commands section | Exact shell commands per sub-project, grouped |
   | Branch rules | `AGENTS.md` branch rules | Base branch name and never-push targets |
   | Commit convention | `AGENTS.md` code style or `CLAUDE.md` | Conventional Commits format with type list and examples |
   | Key file reference | `AGENTS.md` key files table | All rows: purpose → file path |

3. **Draft each section** — write each of the 7 sections using only facts extracted in step 2. If a fact is not in the source docs, omit it rather than invent it.

4. **Validate completeness** — confirm all 7 sections are present and non-empty. Stop and report any missing section before writing the file.

5. **Return the output content** — produce the final `copilot-instructions.md` content using the template below. This skill is read-only: return the generated content to the invoking agent. The invoking agent is responsible for writing the file using the `edit` tool.

## Required output template

```markdown
# Copilot Instructions — <Repository Name>

## Repository Purpose

<2–3 sentences: what this repository is, its exercise/task goal, working branch.>

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| <layer> | <technology> | <version> | <purpose> |

## Architecture

**Data flow:** `<exact repository-specific flow extracted from AGENTS.md / CLAUDE.md / README.md>`

<Describe each step briefly and reference key files named in the docs. Derive this line from the documentation. If the docs define an explicit flow, reproduce it verbatim. If they do not, use repository-specific placeholders such as `<source-of-truth types>` → `<validation layer>` → `<business logic>` → `<transport layer>` → `<client data access>` → `<UI>` and replace them with actual terms before finalising. Do not reuse `shared/types.ts` or any other sample path unless it is explicitly documented in the target repository.>

## Validation Commands

<!-- Replace each command below with the exact commands extracted from AGENTS.md / CLAUDE.md for this repository -->

### Server (`<sub-project>/`)
```bash
<package-manager> run build   # type check command from AGENTS.md
<package-manager> run lint    # lint command from AGENTS.md
<package-manager> test        # test command from AGENTS.md
```

### Client (`<sub-project>/`)
```bash
<package-manager> run build   # build command from AGENTS.md
<package-manager> run lint    # lint command from AGENTS.md
```

## Branch Rules

- **Working base:** `<branch-name>`
- **Never push to:** `<exact branch and/or remote targets from AGENTS.md or CLAUDE.md>`

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat | fix | docs | style | refactor | test | chore
```

### Examples
```
feat(flags): add server-side filtering by environment and status
fix(db): free SQL.js statement in finally block
docs(agents): update copilot-instructions with data flow
```

## Key File Reference

| Purpose | File |
|---|---|
| <purpose> | <file-path> |
```

## Constraints

- Do not fabricate commands, file paths, or package names.
- Do not include workspace-level or monorepo context that does not apply to this repository.
- Validation commands must be exact and copy-paste ready.
- The output file path is `.github/copilot-instructions.md` in the target repository.
- Do not commit the file — leave that to the designated git-ops step.
