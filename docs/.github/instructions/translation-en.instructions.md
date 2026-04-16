---
applyTo: docs/**/*.md,manuals/**/*.md,translations/**/*.md
---

# Translation — Always-On Instructions (pt-BR → EN)

## Objective

Standardize technical translations into English while preserving semantic precision and operational intent.

## Scope

Applies to:

- technical documentation
- manuals
- operational guides
- agent/skill instructions when requested

## Mandatory rules

1. Preserve markdown structure (headings, lists, tables, checklists).
2. Do not translate commands, code, paths, env vars, JSON keys, API names.
3. Preserve normative strength:
   - `deve` → `must`
   - `deveria` / `recomendado` → `should`
   - `nunca` → `never`
4. Keep terminology consistent across the full document.
5. Prefer natural technical English over literal translation.

## Base glossary (preferred)

- `critérios de aceite` → `acceptance criteria`
- `dependências` → `dependencies`
- `escopo` → `scope`
- `backlog` → `backlog`
- `workflow` → `workflow`
- `issue` → `issue`
- `pull request` → `pull request`
- `revisão` → `review`
- `rollback` → `rollback`

## Quality checklist

- [ ] Markdown structure preserved
- [ ] Code/commands intact
- [ ] No requirement-level semantic loss
- [ ] Terminology consistency ensured
- [ ] Natural technical English

## Do not

- Do not change technical meaning while translating.
- Do not summarize unless explicitly requested.
- Do not rename files, endpoints, or identifiers.
