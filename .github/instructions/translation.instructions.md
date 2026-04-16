---
applyTo: docs/**/*.md,manuals/**/*.md,translations/**/*.md
---

# Translation — Always-On Instructions (EN → pt-BR)

## Objective

Standardize translations of technical documentation into **Brazilian Portuguese**, preserving technical precision and operational intent.

## Scope

Applies to:

- technical documentation
- manuals
- operational guides
- agent/skill instructions when requested

## Mandatory rules

1. Preservar estrutura markdown (títulos, listas, tabelas, checklists).
2. Do not translate commands, code, paths, env vars, JSON keys, or API names.
3. Preserve normative strength:
   - `must` → `deve`
   - `should` → `deveria` / `recomendado`
   - `never` → `nunca`
4. Keep terminology consistent across the document.
5. Prefer natural pt-BR with semantic fidelity.

## Base glossary (preferred)

- `workflow` → `workflow` (or `fluxo`, depending on context)
- `issue` → `issue`
- `pull request` → `pull request`
- `review` → `review` / `revisão` (depending on context)
- `acceptance criteria` → `critérios de aceite`
- `dependencies` → `dependências`
- `backlog` → `backlog`
- `scope` → `escopo`
- `rollback` → `rollback`

## Quality checklist

- [ ] Markdown structure preserved
- [ ] Code/commands intact
- [ ] No normative requirement loss
- [ ] Terminology consistency
- [ ] Natural pt-BR text

## Do not

- Do not technically adapt content during translation.
- Do not summarize sections without explicit request.
- Do not rename files, endpoints, or identifiers.
