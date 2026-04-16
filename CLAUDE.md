# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Feature flag management dashboard for the Agentic Engineering Workshop. The task is to implement server-side feature flag filtering with 5 filter dimensions (environment, status, type, owner, name). See `TASK.md` for acceptance criteria.

**Branch:** `exercise-2` — never commit or push to `main` or `exercise-1`.

**Methodology:** PIV Loop (Plan → Implement → Validate). After every code change, run the full validation suite before moving on.

**Exercise state:** Starts from clean upstream — no filtering code exists. The `GET /api/flags` endpoint returns all flags without query parameters, `getAllFlags()` uses `db.exec()` with no WHERE clause, and the client has no filter UI.

---

## 1. Tech Stack & Architecture

### Backend (`server/`, port 3001)

| Technology | Purpose |
|---|---|
| Node.js ESM | Runtime — strict ES Modules, no `require()` |
| Express v5 | HTTP framework — `next(error)` for all error propagation |
| SQL.js | SQLite compiled to WASM — in-memory with file persistence (`flags.db`) |
| Zod | Schema validation at request boundary |
| Vitest | Test runner with in-memory DB isolation |
| TypeScript (strict) | No `any`, no implicit `null` |

### Frontend (`client/`, port 3000)

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool and dev server |
| TanStack Query v5 | Server state — `useQuery` for reads, `useMutation` for writes |
| Tailwind CSS v4 | Utility-first styling via `cn()` helper |
| Radix UI (shadcn) | Headless accessible component primitives |
| Lucide React | Icons |
| TypeScript (strict) | No `any`, PascalCase components, kebab-case files |

### Shared contract

`shared/types.ts` is the **single source of truth** for all data types:
- `FeatureFlag` — 15 fields including `id`, `name`, `enabled`, `environment`, `type`, `owner`, `tags`, timestamps
- `CreateFlagInput`, `UpdateFlagInput` — mutation contracts
- `FlagFilterParams` — filter contract: `environment?`, `status?`, `type?`, `owner?`, `name?`
- `Environment` — `'development' | 'staging' | 'production'`
- `FlagType` — `'release' | 'experiment' | 'operational' | 'permission'`
- `ApiError` — `{ error: string, message: string, statusCode: number }`
- Path alias: `@shared/*` maps to `shared/*`

### Data flow

```
shared/types.ts → Zod validation (middleware) → Service (SQL.js queries) → Routes (Express handlers)
  → Client API (fetch wrappers) → TanStack Query (useQuery/useMutation) → React UI
```

1. **Types** — `shared/types.ts` defines contracts
2. **Validation** — `server/src/middleware/validation.ts` validates with Zod schemas at the boundary
3. **Service** — `server/src/services/flags.ts` executes business logic and SQL.js queries
4. **Routes** — `server/src/routes/flags.ts` thin handlers that delegate to services, propagate errors with `next(error)`
5. **Client API** — `client/src/api/flags.ts` typed fetch wrappers
6. **UI** — `client/src/App.tsx` TanStack Query hooks + component tree

### API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/flags` | List all flags (add query params for filtering) |
| GET | `/api/flags/:id` | Get single flag |
| POST | `/api/flags` | Create flag |
| PUT | `/api/flags/:id` | Update flag |
| DELETE | `/api/flags/:id` | Delete flag |

### Project structure

```
shared/types.ts           # Type contracts (source of truth)
server/src/
  index.ts                # Express app setup, CORS, routes, error handler
  db/client.ts            # getDb(), saveDb(), closeDb(), _resetDbForTesting()
  db/schema.ts            # CREATE TABLE flags DDL
  db/seed.ts              # 20 seed flags across environments
  middleware/validation.ts # Zod schemas: createFlagSchema, updateFlagSchema
  middleware/error.ts      # AppError, NotFoundError, ConflictError, ValidationError, errorHandler
  services/flags.ts        # getAllFlags, getFlagById, createFlag, updateFlag, deleteFlag
  routes/flags.ts          # Express Router — 5 handlers
  __tests__/flags.test.ts  # Vitest test suite
client/src/
  api/flags.ts            # getFlags, getFlag, createFlag, updateFlag, deleteFlag
  App.tsx                 # QueryClientProvider, main app with CRUD + state
  components/             # flags-table.tsx, flag-form-modal.tsx, delete-confirm-dialog.tsx
  components/ui/          # Radix/shadcn primitives (Button, Dialog, Select, Table, etc.)
  lib/utils.ts            # cn() utility for Tailwind class merging
```

---

## 2. Code Styles & Patterns

### TypeScript conventions

- **Strict mode** — no `any`, no implicit `null`, no unchecked index access
- **`import type`** for type-only imports: `import type { FeatureFlag } from '@shared/types'`
- **Union types** over enums: `'development' | 'staging' | 'production'`
- **Props interfaces** for components: `interface FlagsTableProps { ... }`

### Naming conventions

| Context | Convention | Examples |
|---|---|---|
| Functions/variables | camelCase | `getAllFlags`, `rowToFlag`, `handleCreate` |
| Types/interfaces | PascalCase | `FeatureFlag`, `FlagFilterParams` |
| React components | PascalCase | `FlagsTable`, `FlagFormModal` |
| Files | kebab-case | `flags-table.tsx`, `flag-form-modal.tsx` |
| DB columns | snake_case | `rollout_percentage`, `created_at` |
| Zod schemas | camelCase | `createFlagSchema`, `updateFlagSchema` |

### Backend patterns

- **Layered architecture:** Routes → Services → Database (no cross-layer shortcuts)
- **Error propagation:** All route handlers use `try/catch` with `next(error)` — never `res.status().json()` for errors
- **Custom error classes** in `server/src/middleware/error.ts`:
  ```typescript
  throw new NotFoundError(`Flag with id '${id}' not found`)   // 404
  throw new ConflictError(`Flag with name '${name}' already exists`) // 409
  throw new ValidationError('Invalid input')                   // 400
  ```
- **Error response format:** `{ error: string, message: string, statusCode: number }`
- **Zod validation at boundary:** `createFlagSchema.parse(req.body)` in route, before service call
- **Error middleware** (`errorHandler`) catches ZodError → 400, AppError → statusCode, unknown → 500

### SQL.js patterns

- **Parameterized queries:** `db.prepare(sql)` + `stmt.bind([...params])` + `stmt.step()` — never string interpolation
- **Statement cleanup:** Always `stmt.free()` in `try/finally` — memory leak if omitted
- **Boolean conversion:** `enabled` column is `INTEGER 0/1`; convert: `enabled ? 1 : 0` (write), `row.enabled === 1` (read)
- **Tags as JSON string:** `tags TEXT DEFAULT '[]'`; parse with `JSON.parse(row.tags)` in `rowToFlag()`
- **`db.exec()` is parameterless** — use only for DDL, never for queries with user input
- **Case-insensitive LIKE:** Use `LOWER(name) LIKE ? ESCAPE '\\'` with `filters.name.toLowerCase()` + `%` wildcards
- **LIKE special chars:** Escape `%`, `_`, `\` in user input before binding: `.replace(/[\\%_]/g, '\\$&')`
- **`rowToFlag()`** centralizes DB row → TypeScript object mapping with enum validation

### Frontend patterns

- **TanStack Query** for all async state: `useQuery` with compound key `['flags', filters]` for auto-refetch on filter change
- **`useMutation`** with `onSuccess: () => qc.invalidateQueries({ queryKey: ['flags'] })`
- **Controlled components:** `useState` + `onChange` for form inputs
- **`cn()` utility** for Tailwind class composition — never raw string concatenation
- **Radix UI primitives** from `components/ui/` — Dialog, Select, Table, Badge, Button, Input, Switch
- **Named exports** for components — avoid default exports

### Client API patterns

- **Centralized `handleResponse<T>()`** in `client/src/api/flags.ts` — Content-Type check, error extraction
- **Network error wrapping:** `TypeError` → `'Unable to connect to server...'`
- **`URLSearchParams`** for query string construction — skip `undefined` and empty string values

---

## 3. Testing Requirements

### Framework

- **Vitest** for backend tests in `server/src/__tests__/flags.test.ts`
- **DB isolation:** Fresh in-memory SQL.js database per test via `_resetDbForTesting()`

### Test lifecycle

```typescript
let db: Database

beforeEach(async () => {
  const SQL = await initSqlJs()
  db = new SQL.Database()
  createTables(db)
  _resetDbForTesting(db)
})

afterEach(() => {
  _resetDbForTesting(null)
  db.close()
})
```

### Test organization

- `describe` blocks by feature: `getAllFlags`, `createFlag`, `getFlagById`, `updateFlag`, `deleteFlag`, `filtering`
- `it` blocks for specific scenarios
- Assertions: `expect().toBe()`, `expect().toEqual()`, `expect().toThrow()`

### Validation commands (run after every change)

```bash
# Server (from server/)
pnpm run build   # TypeScript type check (tsc)
pnpm run lint    # ESLint
pnpm test        # Vitest

# Client (from client/)
pnpm run build   # tsc + vite build
pnpm run lint    # ESLint
```

**Full combined check (copy-paste ready):**
```bash
cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
```

**All commands must exit 0. Fix any errors before proceeding.**

---

## 4. Misconceptions AI Often Has

### SQL.js is NOT like node-sqlite3

- SQL.js has a **synchronous API** despite `getDb()` being async (only initialization is async). The `db.prepare()`, `stmt.bind()`, `stmt.step()`, `stmt.getAsObject()` calls are all synchronous.
- `db.exec(sql)` does **NOT** accept bind parameters — it runs raw SQL. Use `db.prepare(sql)` + `stmt.bind(params)` for any query with user input.
- There is no `.all()` or `.get()` method — iterate with `while (stmt.step()) { stmt.getAsObject() }`.

### Boolean storage

- Booleans are stored as `INTEGER 0/1`, not `true`/`false`. The `enabled` column requires explicit conversion:
  - Write: `input.enabled ? 1 : 0`
  - Read: `row.enabled === 1`
  - Filter: `filters.status === 'enabled' ? 1 : 0` (the query param is `status`, not `enabled`)

### Express v5 error handling

- **Always** use `next(error)` in route catch blocks — do not manually respond with `res.status(code).json(...)` for errors.
- The centralized `errorHandler` in `middleware/error.ts` handles all error-to-response mapping.
- ZodError thrown by `.parse()` is caught by `errorHandler` and converted to a 400 response automatically.

### Type contract

- `shared/types.ts` is the **single** contract between server and client — never define duplicate interfaces in `server/` or `client/`.
- `FlagFilterParams` already exists in `shared/types.ts` — use it directly, do not reinvent.
- Use `import type` for type-only imports — TypeScript strict mode enforces `verbatimModuleSyntax`.

### SQL.js statement lifecycle

- Every `db.prepare()` call **must** have a matching `stmt.free()` in a `finally` block. Forgetting this causes memory leaks.
- Do not use `db.exec()` for SELECT queries — it returns `QueryExecResult[]` which is harder to work with and cannot accept parameters.

### Exercise scope

- Do **not** migrate to Bun, Postgres, Drizzle, or any other runtime/database within this exercise.
- Do **not** replace Vitest with another test runner.
- Do **not** replace SQL.js with a different database.
- Do **not** break the `shared/types.ts` contract.

---

## On-Demand Context

For deeper context on specific areas, read these files:

| Topic | File |
|---|---|
| Full task + acceptance criteria | `TASK.md` |
| Architecture analysis (detailed) | `.agents/closure/e2-architecture-analysis.md` |
| Project requirements (PRD) | `.agents/PRDs/feature-flag-manager.prd.md` |
| Frontend patterns (detailed) | `.agents/reference/frontend.md` |
| Backend patterns (detailed) | `.agents/reference/backend.md` |

---

## Key Files

| Purpose | File |
|---|---|
| Type contract (source of truth) | `shared/types.ts` |
| Zod validation schemas | `server/src/middleware/validation.ts` |
| Custom error classes + handler | `server/src/middleware/error.ts` |
| Flag service (business logic) | `server/src/services/flags.ts` |
| Flag routes (Express handlers) | `server/src/routes/flags.ts` |
| DB client + reset helper | `server/src/db/client.ts` |
| DB schema (DDL) | `server/src/db/schema.ts` |
| Seed data (20 flags) | `server/src/db/seed.ts` |
| Backend tests | `server/src/__tests__/flags.test.ts` |
| API client (fetch wrappers) | `client/src/api/flags.ts` |
| Main UI + state management | `client/src/App.tsx` |
| Flags table component | `client/src/components/flags-table.tsx` |
| Flag form modal | `client/src/components/flag-form-modal.tsx` |
| Tailwind class utility | `client/src/lib/utils.ts` |
