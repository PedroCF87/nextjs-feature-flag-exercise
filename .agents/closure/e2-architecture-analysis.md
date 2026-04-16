# Architecture Analysis — nextjs-feature-flag-exercise

**Task:** E2-S1-T1 — Analyze codebase and map architecture (Step A)

**Date:** 2026-04-16

**Branch:** exercise-1

**Analyst:** `project-adaptation-analyst`

**Purpose:** Feed E2-S1-T2 (CLAUDE.md), E2-S1-T6 (on-demand context), E2-S1-T7 (PRD)

---

## 1. Architecture Layers

### Server (`server/`)

| Layer | Technology | Key files |
|---|---|---|
| Runtime | Node.js ESM (strict — no `require()`) | `server/src/index.ts` |
| Framework | Express v5 | `server/src/index.ts:1` — `import express from 'express'` |
| Database | SQL.js (SQLite/WASM, in-memory + file persistence) | `server/src/db/client.ts`, `server/src/db/schema.ts` |
| Validation | Zod | `server/src/middleware/validation.ts` |
| Error handling | Custom error classes + centralized middleware | `server/src/middleware/error.ts` |
| Business logic | Service layer (SQL.js queries) | `server/src/services/flags.ts` |
| Routes | Express Router (thin handlers) | `server/src/routes/flags.ts` |
| Testing | Vitest (in-memory DB isolation) | `server/src/__tests__/flags.test.ts` |
| Language | TypeScript strict mode | `server/tsconfig.json` |

### Client (`client/`)

| Layer | Technology | Key files |
|---|---|---|
| Framework | React 19 | `client/src/App.tsx` |
| Build tool | Vite (dev server port 3000) | `client/vite.config.ts` |
| Styling | Tailwind CSS v4 | `client/src/index.css` |
| UI primitives | Radix UI (shadcn) | `client/src/components/ui/` |
| State management | TanStack Query v5 | `client/src/App.tsx:2` — `useQuery`, `useMutation` |
| API client | Typed fetch wrappers | `client/src/api/flags.ts` |
| Language | TypeScript strict mode | `client/tsconfig.json` |

### Shared

| Item | File | Description |
|---|---|---|
| Type contract | `shared/types.ts` | Single source of truth: `FeatureFlag`, `CreateFlagInput`, `UpdateFlagInput`, `FlagFilterParams`, `Environment`, `FlagType`, `ApiError` |
| Path alias | `@shared/*` → `shared/*` | Used in both server and client imports |

---

## 2. Data Flow

### Request lifecycle: GET /api/flags

```
shared/types.ts          → Defines FeatureFlag, FlagFilterParams, Environment, FlagType
  │
  ▼
validation.ts:31-40      → flagFilterQuerySchema (Zod): validates req.query
  │                         environment: z.enum(['development','staging','production']).optional()
  │                         status: z.enum(['enabled','disabled']).optional()
  │                         type: z.enum(['release','experiment','operational','permission']).optional()
  │                         owner: z.string().optional()
  │                         name: z.string().optional()
  │
  ▼
validation.ts:42-48      → validateFlagFilters middleware: parses req.query, stores in res.locals.filters
  │
  ▼
routes/flags.ts:10-17    → GET / handler: reads res.locals.filters, calls getAllFlags(filters)
  │
  ▼
services/flags.ts:75-106 → getAllFlags(filters): builds dynamic WHERE clause with conditions[],
  │                         params[]; uses db.prepare() + stmt.bind() + stmt.step(); returns
  │                         rows.map(rowToFlag)
  │
  ▼
client/api/flags.ts:35-49 → getFlags(filters?): builds URLSearchParams from non-empty filter
  │                          entries, appends to URL; fetches and returns FeatureFlag[]
  │
  ▼
App.tsx:24-27            → useQuery({ queryKey: ['flags', filters], queryFn: () => getFlags(filters) })
  │                        Filter state: useState<FlagFilterParams>({})
  │
  ▼
flags-filter-controls.tsx → FlagsFilterControls: 5 filter controls (environment select, status
  │                          select, type select, owner text input, name text input); debounced
  │                          text inputs (300ms); "Clear all filters" button + active filter
  │                          count badge
  │
  ▼
flags-table.tsx          → FlagsTable: renders filtered FeatureFlag[] in a Radix Table with
                           badges for status, environment, type, tags; edit/delete action buttons
```

### Mutation lifecycle: POST/PUT/DELETE

```
FlagFormModal → onSubmit(CreateFlagInput)
  │
  ▼
App.tsx → createMutation / updateMutation → calls createFlag / updateFlag from api/flags.ts
  │
  ▼
routes/flags.ts → POST/PUT handler → createFlagSchema.parse(req.body) → createFlag/updateFlag service
  │
  ▼
onSuccess → qc.invalidateQueries({ queryKey: ['flags'] }) → refetches with current filters
```

---

## 3. Naming Conventions

| Context | Convention | Examples |
|---|---|---|
| Functions/variables | camelCase | `getAllFlags`, `rowToFlag`, `handleCreate`, `filterState` |
| Types/Interfaces | PascalCase | `FeatureFlag`, `CreateFlagInput`, `FlagFilterParams`, `Environment` |
| React components | PascalCase | `FlagsTable`, `FlagFormModal`, `FlagsFilterControls` |
| File names | kebab-case | `flags-table.tsx`, `flag-form-modal.tsx`, `flags-filter-controls.tsx` |
| DB columns | snake_case | `rollout_percentage`, `created_at`, `last_evaluated_at` |
| API endpoints | kebab-case paths | `/api/flags`, `/api/flags/:id` |
| Zod schemas | camelCase | `createFlagSchema`, `updateFlagSchema`, `flagFilterQuerySchema` |
| Error classes | PascalCase | `NotFoundError`, `ConflictError`, `ValidationError`, `AppError` |
| CSS/Tailwind | utility classes via `cn()` | `cn('flex items-center', conditional && 'class')` |
| Type imports | `import type` | `import type { FeatureFlag } from '@shared/types'` |

---

## 4. Error Handling Patterns

### Error class hierarchy (`server/src/middleware/error.ts`)

```
AppError (base)
  ├── NotFoundError    → statusCode: 404, error: 'NOT_FOUND'
  ├── ConflictError    → statusCode: 409, error: 'CONFLICT'
  └── ValidationError  → statusCode: 400, error: 'VALIDATION_ERROR'
```

### Error flow chain

```
Service layer  →  throws NotFoundError / ConflictError
                    │
Route handler  →  catches in try/catch → next(error)
                    │
Zod parse      →  throws ZodError on invalid input → next(error)
                    │
errorHandler   →  middleware/error.ts:42-63
                    ├── ZodError → 400 JSON { error: 'VALIDATION_ERROR', message: joined paths }
                    ├── AppError → statusCode JSON { error, message, statusCode }
                    └── Unknown  → 500 JSON { error: 'INTERNAL_SERVER_ERROR' }
```

### Client-side error handling (`client/src/api/flags.ts`)

```
handleResponse<T>()
  ├── !response.ok + JSON body → throw new Error(error.message)
  ├── !response.ok + no JSON   → throw new Error(`Server error: ${status} ${statusText}`)
  └── TypeError (network)      → throw new Error('Unable to connect to server...')
```

### Mutation error handling (`client/src/App.tsx`)

- `onError` callbacks log to console; modal/dialog stays open for retry.
- `onSuccess` invalidates `['flags']` query key → automatic refetch with current filters.

---

## 5. SQL.js Constraints

| # | Constraint | Impact | Evidence | Mitigation in codebase |
|---|---|---|---|---|
| 1 | **Booleans as INTEGER** | `enabled` stored as `0`/`1`, not `true`/`false` | `schema.ts:6` — `enabled INTEGER NOT NULL DEFAULT 0` | `services/flags.ts:84` — `filters.status === 'enabled' ? 1 : 0` |
| 2 | **`db.prepare()` + `stmt.bind()` for parameterized queries** | User input must never be interpolated into SQL strings | `services/flags.ts:94-106` — Pattern C with dynamic conditions/params arrays | All filter values go through `stmt.bind(params)` — column names hardcoded |
| 3 | **`stmt.free()` in try/finally** | Memory leak if statement not freed | `services/flags.ts:96-105` — `try { ... } finally { stmt.free() }` | Applied in `getAllFlags`, `getFlagById`, `getFlagByName`, `createFlag`, `updateFlag`, `deleteFlag` |
| 4 | **`db.exec()` for DDL only** | `db.exec()` is parameterless — unsafe for user-controlled queries | `schema.ts:4` — `db.run()` for DDL; `seed.ts` uses `db.prepare()` for inserts | Filtering uses `db.prepare()` exclusively |
| 5 | **Case-insensitive LIKE** | SQLite LIKE is case-sensitive for non-ASCII by default | `services/flags.ts:89-91` — `LOWER(name) LIKE ? ESCAPE '\\'` with lowered input | `filters.name.toLowerCase()` + `%` wildcards + special char escaping (`\%`, `\_`, `\\`) |
| 6 | **Tags as JSON string** | `tags TEXT NOT NULL DEFAULT '[]'` — array serialized as JSON | `services/flags.ts:55-63` — `JSON.parse(row.tags)` with error handling | `rowToFlag()` parses and validates array structure |
| 7 | **File persistence** | In-memory DB saved to `flags.db` file via `saveDb()` | `client.ts:68-74` — `db.export()` → `Buffer.from(data)` → `fs.writeFileSync()` | `saveDb()` called after create/update/delete; not after reads |
| 8 | **Init race condition guard** | Concurrent `getDb()` calls during startup could create multiple DBs | `client.ts:12-17` — singleton `initPromise` prevents re-init | Single `initPromise` with error reset on failure |

---

## 6. Test Strategy

### Framework and isolation

| Item | Value |
|---|---|
| Runner | Vitest |
| Location | `server/src/__tests__/flags.test.ts` |
| Total tests | 24 (6 describe groups: `getAllFlags`, `createFlag`, `getFlagById`, `getFlagByName`, `updateFlag`, `deleteFlag`, `filtering`) |
| Isolation | Fresh in-memory `sql.js` Database per test via `_resetDbForTesting(db)` |

### Test lifecycle pattern

```typescript
// server/src/__tests__/flags.test.ts
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

### Existing filter tests (8 tests in `describe('filtering')`)

| Test | Filter params | Assertion |
|---|---|---|
| filters by environment | `{ environment: 'production' }` | Returns only production flags |
| filters by status enabled | `{ status: 'enabled' }` | Returns only enabled flags |
| filters by status disabled | `{ status: 'disabled' }` | Returns only disabled flags |
| filters by type | `{ type: 'experiment' }` | Returns only experiment flags |
| filters by owner | `{ owner: 'team-alpha' }` | Returns only team-alpha flags |
| filters by name partial match (case-insensitive) | `{ name: 'PAYMENT' }` | Returns flags containing "payment" (2 results) |
| applies AND logic for multiple filters | `{ environment: 'production', status: 'enabled', type: 'release' }` | Returns single matching flag |
| returns all flags when no filters provided | `{}` | Returns all 3 flags |

---

## 7. Integration Points

### Current state (post-Epic 1 — filtering already implemented)

All filtering integration points are **already wired**. The codebase is in a complete post-implementation state:

| # | Layer | File | Function/Component | Status |
|---|---|---|---|---|
| 1 | Shared types | `shared/types.ts:45-51` | `FlagFilterParams` interface | ✅ Implemented |
| 2 | Validation | `server/src/middleware/validation.ts:23-40` | `flagFilterQuerySchema` + `validateFlagFilters` middleware | ✅ Implemented |
| 3 | Service | `server/src/services/flags.ts:75-106` | `getAllFlags(filters)` with dynamic WHERE | ✅ Implemented |
| 4 | Routes | `server/src/routes/flags.ts:10-17` | `GET /` uses `validateFlagFilters` middleware + `res.locals.filters` | ✅ Implemented |
| 5 | Client API | `client/src/api/flags.ts:35-49` | `getFlags(filters?)` with `URLSearchParams` | ✅ Implemented |
| 6 | UI state | `client/src/App.tsx:21` | `useState<FlagFilterParams>({})` + `queryKey: ['flags', filters]` | ✅ Implemented |
| 7 | Filter UI | `client/src/components/flags-filter-controls.tsx` | `FlagsFilterControls` — 5 controls, debounce, clear all, active count badge | ✅ Implemented |
| 8 | Tests | `server/src/__tests__/flags.test.ts` | 8 filter-specific tests in `describe('filtering')` | ✅ Implemented |

### Key integration seams for Exercise 2 (Claude Code re-implementation)

If Exercise 2 requires re-implementing from scratch on a clean branch:

| Seam | What to touch | Why |
|---|---|---|
| `shared/types.ts` | `FlagFilterParams` interface | Defines the contract between server query params and client state |
| `validation.ts` | `flagFilterQuerySchema` + `validateFlagFilters` | Boundary validation — all query params validated before reaching service |
| `services/flags.ts` | `getAllFlags(filters)` | Dynamic SQL construction with parameterized binding |
| `routes/flags.ts` | `GET /` handler | Middleware chain: `validateFlagFilters` → service call |
| `api/flags.ts` | `getFlags(filters?)` | URL construction with `URLSearchParams` |
| `App.tsx` | Filter state + query key | `useState` + `useQuery` key must include filter state |
| `flags-filter-controls.tsx` | New component | Filter UI with debounced inputs and clear-all action |

---

## 8. Key Patterns to Preserve

### TypeScript strictness

- **No `any`** — use `unknown` with type guards when needed (`stmt.getAsObject() as unknown as DbRow`)
- **`import type`** for type-only imports: `import type { FeatureFlag } from '@shared/types'`
- **Readonly markers** on immutable fields: `readonly id: string`, `readonly createdAt: string`
- **Union types** over enums: `'development' | 'staging' | 'production'`

### Express v5 patterns

- **All route handlers use `try/catch` with `next(error)`** — never `res.status().json()` directly for errors
- **Middleware pipeline**: validation → handler → service → `next(error)` on failure
- **`res.locals`** for passing validated data between middleware and handler (e.g., `res.locals.filters`)

### SQL.js patterns

- **Always `try/finally` with `stmt.free()`** — no exceptions
- **`db.prepare()` + `stmt.bind([...params])` + `stmt.step()`** for all parameterized queries
- **Boolean conversion** at service boundary: `enabled ? 1 : 0` (write), `row.enabled === 1` (read)
- **`rowToFlag()`** centralizes DB row → TypeScript object mapping with validation

### React / TanStack Query patterns

- **`useQuery` with compound key**: `queryKey: ['flags', filters]` — auto-refetches on filter change
- **`useMutation` with `onSuccess`**: calls `qc.invalidateQueries({ queryKey: ['flags'] })` to refetch
- **Mutation error pattern**: `onError` logs to console, keeps modal/dialog open for retry
- **Controlled form state**: `useState` + `onChange` for all form inputs
- **`cn()` utility** for Tailwind class composition (never raw string concatenation)

### Client API patterns

- **Centralized `handleResponse<T>()`**: uniform error handling with Content-Type check
- **Network error wrapping**: `TypeError` → user-friendly connection error message
- **`URLSearchParams`** for query string construction — skips `undefined` and empty string values

### Validation patterns

- **Zod schemas at boundary** — validate before service call, not inside service
- **`createFlagSchema.parse(req.body)`** inline in route handler for create/update
- **`validateFlagFilters` middleware** for query params — separates concern from route handler

### Component patterns

- **Props interfaces**: `FlagsTableProps`, `FlagFormModalProps`, `FlagsFilterControlsProps`
- **Named exports**: `export function FlagsTable(...)` — avoid default exports in components
- **File naming**: kebab-case files, PascalCase components
- **Debounced text inputs**: `useEffect` + `setTimeout` with ref-based latest-value access
