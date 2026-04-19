# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Constraints

### Branch Rules

- **Base commit**: `04ea0ba24f64f50e6e0cda0238e10be2a02d1ca0`
- You may create new branches from these
- **Never** commit or push to `main`

---

## Tech Stack

### Backend (`server/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ES Modules | Runtime with native ESM |
| Express.js | v5 | HTTP framework |
| SQL.js | - | SQLite compiled to WASM (in-memory with file persistence) |
| Zod | - | Schema validation |
| Vitest | - | Testing framework |
| TypeScript | Strict mode | Type safety |

### Frontend (`client/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | - | Build tool and dev server |
| Tailwind CSS | v4 | Utility-first styling |
| Radix UI | - | Headless accessible components |
| TanStack Query | v5 | Server state management |
| Lucide React | - | Icons |
| TypeScript | Strict mode | Type safety |

### Shared

- **`shared/types.ts`** - Single source of truth for data contracts
- Path aliases: `@shared/*` maps to `shared/*`

---

## Architecture

### Project Structure

```
shared/types.ts         # Shared TypeScript types (FeatureFlag, CreateFlagInput, etc.)
server/                 # Express backend (port 3001)
  src/
    db/                 # Database client, schema, seeding
    middleware/         # Validation (Zod), error handling
    services/           # Business logic layer
    routes/             # Express route handlers
    __tests__/          # Vitest tests
client/                 # React frontend (port 3000)
  src/
    api/                # API client functions
    components/         # Feature components
    components/ui/      # Radix UI primitives (shadcn)
    lib/                # Utilities (cn function)
.agents/                # AI context
  PRDs/                 # Product Requirements Documents
  reference/            # On-demand context docs
```

### Data Flow

1. **Types** (`shared/types.ts`) - Define data contracts first
2. **Validation** (`server/src/middleware/validation.ts`) - Zod schemas validate requests
3. **Services** (`server/src/services/flags.ts`) - Business logic and database operations
4. **Routes** (`server/src/routes/flags.ts`) - Express handlers call services, use `next(error)` for errors
5. **Client API** (`client/src/api/flags.ts`) - Fetch wrappers with typed responses
6. **UI** (`client/src/App.tsx`) - React Query for state management

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/flags` | List all flags |
| GET | `/api/flags/:id` | Get single flag |
| POST | `/api/flags` | Create flag |
| PUT | `/api/flags/:id` | Update flag |
| DELETE | `/api/flags/:id` | Delete flag |

---

## Workflow / PIV Loop

The AI layer follows the PIV Loop: Planning → Implementing → Validating.

```
/prime → /plan → /implement → /commit → /create-pr → Human review
            ↑                     ↑
     /prd-interactive       /validate (optional)
     /create-stories        /review-pr (optional)
```

**Planning phase**: `/prime` (orient) → `/prd-interactive` (define feature, optional) → `/create-stories` (decompose, optional) → `/plan` (task plan)

**Implementing phase**: `/implement <plan-file>`

**Validating phase**: `/validate` → `/review-pr` (optional) → `/commit` → `/create-pr`

**Sideways loops** (invoked on failure or special condition):
- `/rca <symptom>` — root cause analysis when a failure is non-obvious
- `/security-review` — OWASP security review when sensitive surfaces change
- `/check-ignores` — audit suppression comments (on-demand)
- `/create-rules` — regenerate CLAUDE.md from codebase analysis (on-demand)

---

## Code Style & Patterns

### TypeScript

- **Strict mode enabled** - No `any`, no implicit `null`
- **Use `type` imports** - `import type { FeatureFlag } from '@shared/types'`
- **Props interfaces** - Define `ComponentNameProps` for all components
- **Union types for enums** - `'development' | 'staging' | 'production'`

### Backend Patterns

- **Layered architecture**: Routes → Services → Database
- **Error propagation**: Always use `next(error)` in route handlers
- **Custom errors**: Use `NotFoundError`, `ConflictError`, `ValidationError`
- **SQL.js statements**: Always use `try-finally` with `stmt.free()`
- **Validation first**: Parse with Zod before business logic

### Frontend Patterns

- **React Query for async state** - `useQuery` for fetches, `useMutation` for side effects
- **Controlled components** - State via `useState`, update via `onChange`
- **Tailwind with cn()** - Always use `cn()` for class composition
- **Radix UI primitives** - Compose from `components/ui/`
- **File naming**: kebab-case for files, PascalCase for components

---

## Testing Strategy

### Backend Tests (Vitest)

- **Location**: `server/src/__tests__/`
- **Isolation**: Fresh in-memory database per test via `_resetDbForTesting()`
- **Pattern**: `describe` blocks by feature, `it` blocks for specific cases
- **Assertions**: `expect().toBe()`, `expect().toThrow()`, `expect().toEqual()`

**All checks must pass with zero errors.**

---

## AI Gotchas

Project-specific patterns where AI assistants commonly make mistakes:

- **Express v5 error propagation**: In route handlers, ALWAYS use `next(error)` in catch blocks. NEVER call `res.status().json()` inside a catch — it bypasses the centralized error middleware silently.
- **SQL.js resource leak**: ALWAYS call `stmt.free()` in a `finally` block after every prepared statement. NEVER skip it — WASM does not garbage-collect statements.
- **Validation order**: ALWAYS parse request data with Zod BEFORE passing to service layer. NEVER call a service method with unvalidated input.
- **Type imports**: ALWAYS use `import type { Foo }` for type-only imports. Never `import { Foo }` when Foo is only used as a type.
- **Custom errors only**: NEVER `throw new Error(...)`. Use `NotFoundError`, `ConflictError`, or `ValidationError` so the error middleware formats the response correctly.

---

## On-Demand Context

Reference guides for deeper context on specific areas. Load only what your task needs.

| Topic | File | Load when |
|-------|------|-----------|
| Project requirements | `.agents/PRDs/feature-flag-manager.prd.md` | Planning a new feature; starting a new PR |
| Backend narrative | `.agents/reference/backend.md` | Starting in an unfamiliar backend area |
| Backend patterns (rules) | `.agents/reference/backend-patterns.md` | Reviewing, implementing, or simplifying backend code |
| Frontend narrative | `.agents/reference/frontend.md` | Starting in an unfamiliar frontend area |
| Frontend patterns (rules) | `.agents/reference/frontend-patterns.md` | Reviewing, implementing, or simplifying frontend code |
| SQL.js constraints | `.agents/reference/sql-js-constraints.md` | Any database operation; security review |

See `.agents/reference/README.md` for the full producer/consumer map and loading conventions.

---

## Error Handling

### Backend Error Classes

```typescript
// 404 - Resource not found
throw new NotFoundError(`Flag with id '${id}' not found`)

// 409 - Duplicate/conflict
throw new ConflictError(`Flag with name '${name}' already exists`)

// 400 - Validation error
throw new ValidationError('Invalid input')
```

---

## Key Files Reference

| Purpose | File |
|---------|------|
| Types | `shared/types.ts` |
| Zod schemas | `server/src/middleware/validation.ts` |
| Error classes | `server/src/middleware/error.ts` |
| Flag service | `server/src/services/flags.ts` |
| Flag routes | `server/src/routes/flags.ts` |
| API client | `client/src/api/flags.ts` |
| Main UI | `client/src/App.tsx` |
| Table component | `client/src/components/flags-table.tsx` |
| Form modal | `client/src/components/flag-form-modal.tsx` |
