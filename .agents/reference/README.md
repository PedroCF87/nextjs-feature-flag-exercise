# On-Demand Context — Reference Docs

These documents provide deep, file:line-referenced patterns for specific layers of the project.
They are **loaded on demand** — not globally. Load only the doc whose scope matches the task.

## Naming Convention

| Pattern | When to Use |
|---------|-------------|
| `{layer}.md` | Narrative guide for a layer — read when arriving in an unfamiliar area |
| `{layer}-patterns.md` | Rule list with file:line examples — load when reviewing, implementing, or simplifying code in that layer |
| `{topic}-constraints.md` | Cross-cutting constraint catalog — load when working with that technology regardless of layer |

## Document Map

| File | Lines | Summary | Load when... | Loaded by |
|------|-------|---------|--------------|-----------|
| `backend.md` | 601 | Narrative: layered architecture, Express v5 route pattern, error flow, Zod boundary, SQL.js query lifecycle, test patterns | Starting a new backend feature or reviewing backend code | `/prime`, `/plan` (backend scope), `/implement` (backend scope), `silent-failure-hunter` |
| `backend-patterns.md` | 372 | Rule list: Express v5 `next(error)`, custom errors, `stmt.free()` in finally, Zod parse-before-logic, parameterized queries — all with file:line examples | Reviewing code for pattern compliance; simplifying code | `code-reviewer`, `code-simplifier`, `silent-failure-hunter`, `/review-pr` (backend changes), `/security-review`, `/rca`, `/check-ignores` |
| `frontend.md` | 454 | Narrative: component hierarchy, TanStack Query hooks, state management, Radix UI primitives, Tailwind v4 | Starting a new frontend feature or reviewing frontend code | `/prime`, `/plan` (frontend scope), `/implement` (frontend scope) |
| `frontend-patterns.md` | 342 | Rule list: `useQuery`/`useMutation` patterns, `cn()` composition, `ComponentNameProps` interfaces, kebab-case files, `import type` — all with file:line examples | Reviewing or simplifying frontend code | `code-reviewer`, `code-simplifier`, `/review-pr` (frontend changes) |
| `sql-js-constraints.md` | 347 | Constraint catalog: SQL.js vs other SQLite libs, synchronous API, `step()`+`getAsObject()`, WASM init, INTEGER booleans, `stmt.free()` lifecycle | Working with any database operation; security review | `silent-failure-hunter`, `type-design-analyzer`, `/security-review`, `/rca` |

## How to Load (in commands)

In a command's `<context>` block:
```
Backend reference: !`test -f .agents/reference/backend.md && cat .agents/reference/backend.md || echo "(no backend reference)"`
Backend patterns: !`test -f .agents/reference/backend-patterns.md && cat .agents/reference/backend-patterns.md || echo "(no backend patterns)"`
```

## How to Load (in agents)

In the agent's Pre-Step LOAD CONTEXT:
```
Read `.agents/reference/backend-patterns.md` if present (canonical rules; prefer over this agent's embedded knowledge on conflict).
```

## Maintenance

When a pattern in this project evolves (e.g., a new error class, a new SQL.js usage convention):
1. Update the relevant `.agents/reference/*.md` doc first
2. Update CLAUDE.md §Backend Patterns / §Code Style if the change affects global rules
3. Run `/check-ignores` and `/review-pr` — they will now use the updated pattern
