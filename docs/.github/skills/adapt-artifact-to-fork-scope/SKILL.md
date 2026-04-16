---
name: adapt-artifact-to-fork-scope
description: Adapt workspace-level AI Layer artifacts for fork-scoped deployment by fixing applyTo paths and removing workspace-only references.
---

# Skill — Adapt Artifact to Fork Scope

## Metadata

- **Created at:** 2026-04-09 22:14:39 -03
- **Last updated:** 2026-04-09 22:14:39 -03

---

## Description

Adapt a workspace-level AI Layer artifact (agent, skill, or instruction) for deployment to a fork-scoped `.github/` directory. Replaces workspace-relative references with fork-relative equivalents, updates `applyTo` headers, and produces a diff summary of changes.

Use this skill when migrating any `.github/` artifact from a multi-repo workspace (e.g., `Docs/.github/`) to a single-repo fork (e.g., `nextjs-feature-flag-exercise/.github/`) without manual, error-prone find-and-replace.

---

## Inputs

| Parameter | Type | Required | Description |
|---|---|---|---|
| `source_path` | string | ✅ | Absolute path to the source artifact file |
| `target_path` | string | ✅ | Absolute path where the adapted artifact will be written |
| `artifact_type` | enum | ✅ | `instruction`, `agent`, or `skill` |
| `substitution_map` | list | optional | Additional pattern→replacement pairs beyond the default set |

---

## Default substitution patterns

| Pattern to detect | Replacement |
|---|---|
| `applyTo: ../nextjs-feature-flag-exercise/**` | `applyTo: **` |
| `applyTo: ../nextjs-feature-flag-exercise/` | `applyTo: ` |
| Multi-repo workspace description (e.g., "This workspace contains 3 companion repositories") | `This repository is the exercise codebase for the RDH Agentic Engineering Workshop.` |
| Any absolute path starting with `/delfos/Projetos/` | Remove (workspace-absolute paths must not leak into fork artifacts) |
| References to `Docs/.github/` workspace directory | Replace with `.github/` (fork-local reference) |

---

## Process

1. **Read** source artifact at `source_path`.
2. **Detect** all workspace-specific patterns in the content:
   - `applyTo` headers containing workspace-relative paths (e.g., `../nextjs-feature-flag-exercise/**`) → replace with `**`
   - Multi-repo workspace context sentences → replace with exercise-scoped context from `AGENTS.md` or `CLAUDE.md`
   - Absolute workspace paths (e.g., `/delfos/Projetos/...`) → remove
   - Agent or skill names that exist only in the workspace but not in the fork → flag for review (do not silently remove)
3. **Apply** substitution map: process default patterns first, then any entries from `substitution_map` input.
4. **Write** adapted content to `target_path` (create parent directories if needed).
5. **Validate** the adapted file:
   - `applyTo` header is present and contains a valid fork-root glob pattern (must not start with `../`)
   - No lines containing `/delfos/Projetos/` or `ITBC - Desafio RDH`
   - Exercise stack is mentioned (at minimum one of: Node.js ESM, React 19, SQL.js) if relevant to the artifact type
   - No workspace-only agent names in `Uses skills:` or `Methodology:` sections (if agent file)
6. **Produce** a diff summary: list each substitution applied as `before → after` pairs.

---

## Output

- Adapted artifact file written at `target_path`.
- Diff summary (markdown table or list) of all substitutions applied.
- Validation result: **✅ PASS** or **❌ FAIL** with a list of remaining issues.

---

## Quality checklist

- [ ] `applyTo` header present and uses a fork-valid glob pattern.
- [ ] No workspace-relative paths remain (no `../nextjs-feature-flag-exercise/`, no `/delfos/`, no multi-repo context).
- [ ] Exercise stack context is present when expected by the artifact type.
- [ ] No workspace-only agent or skill names remain in the artifact body.
- [ ] Diff summary produced and includes at least one entry (or explicitly states "no substitutions needed").
- [ ] Target file is syntactically valid markdown.
- [ ] Target directory created if it did not exist.

---

## Do not

- Do not modify the artifact's core methodology, rules, or process steps.
- Do not remove `applyTo` headers — only update their scope.
- Do not invent exercise context — only replace workspace-level context with exercise-scoped equivalents drawn from `AGENTS.md` or `CLAUDE.md`.
- Do not skip validation — a missing or broken `applyTo` header in an instruction file prevents it from activating in the fork.
- Do not silently drop agent/skill name references — flag them as a gap instead so the fork operator can decide whether to create the missing artifact.
