---
applyTo: ../nextjs-feature-flag-exercise/**
---

# Feature Flag Exercise — Always-On Instructions

This context is specific to the `nextjs-feature-flag-exercise` repository (RDH interview Training Ground).

## Objective

Ensure any agent treats this repository as a **methodology-driven transformation target**, respecting exercise scope and prioritizing reliable execution.

## Priority Rules

1. Preserve exercise scope defined in `TASK.md`.
2. Follow the official data flow: `shared/types.ts` → Zod validation → service → routes → client API → UI.
3. Make incremental changes with frequent validation (without accumulating broken state).
4. Treat this repository as a learning baseline (do not require full migration to the Gold Standard stack in Tier 1).

## Current Architecture (Must Be Respected)

- Backend: Node.js ESM + Express v5 + SQL.js + Zod + Vitest
- Frontend: React 19 + Vite + TanStack Query + Tailwind v4
- Contrato compartilhado: `shared/types.ts`
- Server pattern: `routes` delegate to `services`; errors propagate via `next(error)`

## Mandatory Technical Conventions

- Any new domain field starts in `shared/types.ts`.
- Validar inputs no boundary com schemas em `server/src/middleware/validation.ts`.
- In Express routes, propagate failures with `next(error)` (do not manually respond with errors mid-flow).
- In SQL.js, always free statements with `stmt.free()` in `try/finally`.
- In backend tests, keep isolation with `_resetDbForTesting()`.

## Recommended Validation

During incremental implementation:

1. `cd server && pnpm run build`
2. `cd server && pnpm test`
3. `cd client && pnpm run build`

When applicable, include lint:

- `cd server && pnpm run lint`
- `cd client && pnpm run lint`

## What NOT to do

- Do not migrate runtime to Bun inside this exercise as a mandatory step.
- Do not replace SQL.js with Postgres/Supabase within task scope.
- Do not replace Vitest with another runner as a requirement to complete the task.
- Do not ignore SQL.js-specific limitations (booleans in INTEGER, arrays in JSON string, safe dynamic query construction).
- Do not break the client/server contract defined in `shared/types.ts`.

## Key references

- `nextjs-feature-flag-exercise/TASK.md`
- `nextjs-feature-flag-exercise/AGENTS.md`
- `nextjs-feature-flag-exercise/shared/types.ts`
- `nextjs-feature-flag-exercise/server/src/middleware/validation.ts`
- `nextjs-feature-flag-exercise/server/src/middleware/error.ts`
- `nextjs-feature-flag-exercise/server/src/routes/flags.ts`
- `nextjs-feature-flag-exercise/server/src/services/flags.ts`
- `nextjs-feature-flag-exercise/server/src/__tests__/flags.test.ts`
- `nextjs-feature-flag-exercise/client/src/api/flags.ts`
- `nextjs-feature-flag-exercise/client/src/App.tsx`
