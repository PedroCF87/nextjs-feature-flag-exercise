# Copilot Instructions — nextjs-feature-flag-exercise

## Repository Purpose

Single-repo exercise for the Agentic Engineering Workshop. The goal is to implement
server-side feature flag filtering (see `TASK.md`). All exercise work happens on
branch `exercise-1`. **Never** commit or push to `main`.

**Epic 0 rule:** all preparation tasks (E0) run locally — commit directly to `exercise-1`,
no PRs, no feature branches. AI Layer artifacts live in `.github/` (root).

**Epic 1 rule:** all implementation tasks (E1) run locally — use the `task-implementer` agent
with the `execute-task-locally` skill. Commit directly to `exercise-1`, no PRs.
See `docs/.agents/decisions/adr-001-local-execution-model.md`.

---

## Tech Stack

### Backend (`server/`)

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js (ESM) | Strict ES Modules — no `require()` |
| Framework | Express v5 | `next(error)` for all error propagation in routes |
| Database | SQL.js (SQLite/WASM) | In-memory + file persistence; always `stmt.free()` in `try/finally` |
| Validation | Zod | Schema-first — validate at middleware boundary before service call |
| Testing | Vitest | `_resetDbForTesting()` in `beforeEach` + `afterEach` for DB isolation |
| Language | TypeScript (strict) | No `any`; `import type` for type-only imports |

### Frontend (`client/`)

| Layer | Technology | Notes |
|---|---|---|
| Framework | React 19 | — |
| Build tool | Vite | Dev server on port 3000 |
| Styling | Tailwind CSS v4 | Always use `cn()` for class composition |
| UI primitives | Radix UI | Headless accessible components from `components/ui/` |
| State management | TanStack Query v5 | `useQuery` for reads; `useMutation` for writes |
| Language | TypeScript (strict) | No `any`; PascalCase components; kebab-case filenames |

### Shared

- **`shared/types.ts`** — Single source of truth for all data contracts
- Path alias: `@shared/*` maps to `shared/*`

---

## Architecture

**Data flow:**

```
shared/types.ts
  → server/src/middleware/validation.ts   (Zod schemas — validate at boundary)
  → server/src/services/flags.ts          (business logic, SQL.js queries)
  → server/src/routes/flags.ts            (Express handlers — use next(error))
  → client/src/api/flags.ts              (typed fetch wrappers)
  → TanStack Query (useQuery / useMutation)
  → client/src/App.tsx                   (UI)
```

**API endpoints:**

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/flags` | List all flags (filtering via query params — see TASK.md) |
| GET | `/api/flags/:id` | Get single flag |
| POST | `/api/flags` | Create flag |
| PUT | `/api/flags/:id` | Update flag |
| DELETE | `/api/flags/:id` | Delete flag |

**SQL.js constraints (critical):**
- Booleans stored as INTEGER (0/1) — convert with `status === 'enabled' ? 1 : 0`
- Use `db.prepare()` + `stmt.bind()` for parameterized queries — never string interpolation
- Always `stmt.free()` in `try/finally`
- `db.exec()` is parameterless — use only for DDL

**Error classes:**
```typescript
throw new NotFoundError(`Flag with id '${id}' not found`)         // 404
throw new ConflictError(`Flag with name '${name}' already exists`) // 409
throw new ValidationError('Invalid input')                         // 400
```

---

## Validation Commands

Run these after every implementation phase. **All must pass with zero errors.**

```bash
# Server (from server/)
pnpm run build   # TypeScript type check (tsc)
pnpm run lint    # ESLint
pnpm test        # Vitest

# Client (from client/)
pnpm run build   # tsc + vite build
pnpm run lint    # ESLint
```

Full combined check (copy-paste ready):
```bash
cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
```

---

## Branch Rules

- **Working base:** `exercise-1`
- **Never** commit or push to `main`
- **Epic 0 tasks:** commit directly to `exercise-1` — no PRs, no feature branches
- **Epic 1+ tasks:** feature branches off `exercise-1`, opened as PRs

```bash
# Correct push command
git push origin exercise-1
```

---

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) in English:

```
<type>(<scope>): <description>

Types: feat | fix | docs | style | refactor | test | chore
```

**Examples:**
```
feat(flags): add server-side filtering by environment and status
fix(flags): free SQL.js statement in finally block after getById
test(flags): add Vitest cases for multi-filter combination
docs(ai-layer): update copilot-instructions with data flow
chore(deps): install pnpm dependencies for server and client
```

---

## Active Workflows

Only one workflow is active during Exercise 1:

| File | Purpose | Status |
|---|---|---|
| `.github/workflows/copilot-setup-steps.yml` | Installs dependencies and validates build + tests for the Copilot cloud agent | ✅ Active |

> **Note — `claude.yml` intentionally absent from `.github/workflows/`:**
> The `claude.yml` workflow (Claude AI flow) was moved to `exercise-2-docs/`
> to prevent it from running during Exercise 1. Exercise 1 uses the personal Copilot AI
> workflow exclusively. Do **not** move `claude.yml` back to `.github/workflows/` until
> Exercise 2 starts. Do not reference it as an active workflow file.

---

## Key File Reference

| Purpose | File |
|---|---|
| Shared types (source of truth) | `shared/types.ts` |
| Zod validation schemas | `server/src/middleware/validation.ts` |
| Custom error classes | `server/src/middleware/error.ts` |
| Flag service (business logic) | `server/src/services/flags.ts` |
| Flag routes (Express handlers) | `server/src/routes/flags.ts` |
| API client (fetch wrappers) | `client/src/api/flags.ts` |
| Main UI | `client/src/App.tsx` |
| Flag table component | `client/src/components/flags-table.tsx` |
| Flag form modal | `client/src/components/flag-form-modal.tsx` |
| Backend tests | `server/src/__tests__/flags.test.ts` |
