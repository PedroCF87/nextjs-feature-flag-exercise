# Codebase Audit — nextjs-feature-flag-exercise

**Date:** 2026-04-14 12:59:00 -03
**Branch:** exercise-1 @ af4ed3e
**Auditor:** `project-adaptation-analyst`
**Story:** E0-S1-T4

---

## 1. Environment State

> Source: T2 validation report (`docs/agile/tasks/task-E0S1T2-validate-environment.md` §5)

| Item | Value |
|---|---|
| Branch (baseline) | `exercise-1 @ 77c8d73` |
| Branch (T2 run) | `copilot/e0-s1-t2-validate-local-execution-environment @ 0638867` |
| Node.js | v24.14.1 |
| pnpm | 10.33.0 |
| Date of validation | 2026-04-13 18:28:55 +00 |

### Validation commands summary

| # | Command | Working dir | Exit code | Status |
|---|---|---|---|---|
| 1 | `pnpm install` | `server/` | 0 | ✅ |
| 2 | `pnpm install` | `client/` | 0 | ✅ |
| 3 | `pnpm run build` | `server/` | 0 | ✅ |
| 4 | `pnpm run lint` | `server/` | 0 | ✅ |
| 5 | `pnpm test` | `server/` | 0 | ✅ (16/16 tests pass) |
| 6 | `pnpm run build` | `client/` | 0 | ✅ |
| 7 | `pnpm run lint` | `client/` | 0 | ✅ (after async wrapper fix) |

> **Remediation note:** Step 7 initially failed (`react-hooks/set-state-in-effect`, exit code 1). Fixed by wrapping synchronous `setState` calls in an async helper inside `useEffect` in `client/src/components/flag-form-modal.tsx`. No functional change.

**Overall: PASS — all 7 commands exit 0.**

---

## 2. Architecture Map

> Source: T3 audit findings (`docs/agile/tasks/task-E0S1T3-codebase-audit.md` §7.2–7.3)

### Layer overview

| Layer | File | Responsibility |
|---|---|---|
| Shared types | `shared/types.ts` | `FeatureFlag`, `CreateFlagInput`, `UpdateFlagInput`, `Environment`, `FlagType`, `ApiError` |
| DB schema | `server/src/db/schema.ts` | `CREATE TABLE flags` DDL |
| DB client | `server/src/db/client.ts` | `getDb()`, `saveDb()`, `closeDb()`, `_resetDbForTesting()` |
| DB seed | `server/src/db/seed.ts` | 25 seed flags for development |
| Validation middleware | `server/src/middleware/validation.ts` | Zod schemas: `createFlagSchema`, `updateFlagSchema` (no filter schema yet) |
| Error classes | `server/src/middleware/error.ts` | `NotFoundError` (404), `ConflictError` (409), `ValidationError` (400) |
| Service layer | `server/src/services/flags.ts` | `getAllFlags`, `getFlagById`, `getFlagByName`, `createFlag`, `updateFlag`, `deleteFlag` |
| Route handlers | `server/src/routes/flags.ts` | 5 Express handlers; Workshop filter marker at line 9 |
| Tests | `server/src/__tests__/flags.test.ts` | 16 Vitest tests across 6 describe groups |
| API client | `client/src/api/flags.ts` | Fetch wrappers for all 5 endpoints |
| Main UI | `client/src/App.tsx` | TanStack Query hooks; no filter state |
| Table component | `client/src/components/flags-table.tsx` | Flag list view; no filter UI |
| Form modal | `client/src/components/flag-form-modal.tsx` | Create/edit dialog; not filter-related |

### CREATE TABLE DDL (verbatim — `server/src/db/schema.ts`)

```sql
CREATE TABLE IF NOT EXISTS flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  environment TEXT NOT NULL,
  type TEXT NOT NULL,
  rollout_percentage INTEGER NOT NULL DEFAULT 100,
  owner TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT,
  last_evaluated_at TEXT
)
```

### FeatureFlag filterable fields

| Field (TS) | SQL column | TS type | SQL type | Filter param name |
|---|---|---|---|---|
| `environment` | `environment` | `Environment` (union) | TEXT | `environment` |
| `enabled` | `enabled` | `boolean` | INTEGER (0/1) | `status` (`enabled`/`disabled`) |
| `type` | `type` | `FlagType` (union) | TEXT | `type` |
| `owner` | `owner` | `string` | TEXT | `owner` |
| `name` | `name` | `string` | TEXT | `name` (partial, case-insensitive) |

> **Critical:** `enabled` is stored as `INTEGER 0/1`. A query param of `status=enabled` must be converted to `WHERE enabled = 1` in the service layer before binding.

---

## 3. Data Flow — GET /api/flags

> Source: T3 audit findings §7.2 (services), §7.3 (client)

### Current state (no filtering)

```
App.tsx
  useQuery({ queryKey: ['flags'], queryFn: getFlags })
    │
    ▼
client/src/api/flags.ts  →  getFlags()
  fetch('http://localhost:3001/api/flags')            ← no query params
    │
    ▼
server/src/routes/flags.ts  →  GET /
  getAllFlags()                                        ← no params passed
    │
    ▼
server/src/services/flags.ts  →  getAllFlags()
  const db = await getDb()
  const result = db.exec('SELECT * FROM flags ORDER BY created_at DESC')
  return resultToRows(result).map(rowToFlag)           ← Pattern A: no WHERE clause
    │
    ▼
  FeatureFlag[]  ←  JSON response  ←  React Query cache update  ←  FlagsTable re-render
```

### Target state after Epic 1 (with filtering)

```
App.tsx
  filterState: FlagFilters                             ← NEW: filter useState
  useQuery({ queryKey: ['flags', filterState], queryFn: () => getFlags(filterState) })
    │
    ▼
client/src/api/flags.ts  →  getFlags(filters: FlagFilters)
  const params = new URLSearchParams(nonEmptyFilters)
  fetch(`http://localhost:3001/api/flags?${params}`)  ← NEW: appends query string
    │
    ▼
server/src/routes/flags.ts  →  GET /
  const filters = flagsQuerySchema.parse(req.query)   ← NEW: validate query params
  const flags = await getFilteredFlags(filters)        ← NEW: call new service fn
    │
    ▼
server/src/services/flags.ts  →  getFilteredFlags(filters: FlagFilters)
  Dynamic WHERE clause built with array push           ← NEW: Pattern C
  db.prepare(`SELECT * FROM flags WHERE ... ORDER BY created_at DESC`)
  stmt.bind(values)
  → return rows                                        ← Pattern C: parameterized
    │
    ▼
  FeatureFlag[]  ←  JSON response  ←  React Query cache update  ←  FlagsTable re-render
```

---

## 4. Filtering Gap Analysis

> Source: T3 audit findings §7.7

| Layer | File | Current state | Required change for Epic 1 |
|---|---|---|---|
| Shared types | `shared/types.ts` | No filter interface exists | Add `FlagFilters` with 5 optional fields: `environment?`, `status?`, `type?`, `owner?`, `name?` |
| Server validation | `server/src/middleware/validation.ts` | No query param schema | Add `flagsQuerySchema`: `z.object({ environment: z.enum([...]).optional(), status: z.enum(['enabled','disabled']).optional(), type: z.enum([...]).optional(), owner: z.string().optional(), name: z.string().optional() })` |
| Server service | `server/src/services/flags.ts` | `getAllFlags()` uses `db.exec()` (Pattern A); no params | Add `getFilteredFlags(filters: FlagFilters): Promise<FeatureFlag[]>` using Pattern C (dynamic WHERE + `db.prepare()` + `stmt.bind()`) |
| Server routes | `server/src/routes/flags.ts` | `GET /` calls `getAllFlags()` with no param processing; Workshop marker at line 9 | Parse `req.query`, validate with `flagsQuerySchema`, call `getFilteredFlags()` |
| Client API | `client/src/api/flags.ts` | `getFlags()` hardcodes `fetch('http://localhost:3001/api/flags')` — no query params | Accept `FlagFilters?` param; build `URLSearchParams` from active (non-empty) filters; append to URL |
| Client UI | `client/src/App.tsx` | `useQuery` key is `['flags']`; no filter `useState` | Add `filterState: FlagFilters`; update `queryKey` to `['flags', filterState]`; add filter bar + clear action + active-filter indicator |

---

## 5. SQL.js Constraints

> Source: T3 audit findings §7.4–7.5

### Constraint table

| Constraint | SQL impact | Code mitigation |
|---|---|---|
| **Booleans stored as INTEGER** | `enabled` = `0` or `1`; filter `status=enabled` must use `WHERE enabled = 1` | In service: `filters.status === 'enabled' ? 1 : 0` before `stmt.bind()` |
| **No native parameterized arrays** | Cannot pass `['development','staging']` to a single `?`; multi-value IN requires dynamic SQL | Build `WHERE environment IN (?,?,?)` via `Array(n).fill('?').join(',')` |
| **Statement lifecycle (`stmt.free()`)** | Memory leak if `stmt.free()` not called — especially under concurrent requests | Always `try { ... } finally { stmt.free() }` — required for ALL Pattern B and C queries |
| **Case-insensitive LIKE** | SQLite LIKE is case-sensitive for non-ASCII; `name LIKE '%flag%'` misses `FLAG` | Use `LOWER(name) LIKE LOWER(?)` with `%` wildcards on both ends |
| **`db.exec()` vs `db.prepare()`** | `db.exec()` is parameterless — safe only for static SQL; filtering MUST use `db.prepare()` | `getAllFlags` uses `db.exec()` (Pattern A). EPIC-1 filter queries MUST use Pattern C |

### Pattern A — Parameterless bulk read (current `getAllFlags`)

```typescript
// server/src/services/flags.ts — getAllFlags()
const result = db.exec('SELECT * FROM flags ORDER BY created_at DESC')
// result: QueryExecResult[] — { columns: string[], values: any[][] }
return resultToRows(result).map(rowToFlag)
```

Safe only for static queries with no user-controlled inputs.

### Pattern B — Parameterized single-row read (current `getFlagById`, `getFlagByName`)

```typescript
// server/src/services/flags.ts — getFlagById(id)
const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')
try {
  stmt.bind([id])
  if (stmt.step()) return rowToFlag(stmt.getAsObject() as unknown as DbRow)
  return null   // service returns null; route handler throws NotFoundError
} finally {
  stmt.free()   // MANDATORY — memory leak if omitted
}
```

### Pattern C — Parameterized filtered bulk read (to implement in Epic 1)

```typescript
// server/src/services/flags.ts — getFilteredFlags(filters)
const conditions: string[] = []
const values: (string | number)[] = []

if (filters.environment) {
  conditions.push('environment = ?')
  values.push(filters.environment)
}
if (filters.status !== undefined) {
  conditions.push('enabled = ?')
  values.push(filters.status === 'enabled' ? 1 : 0)  // boolean conversion
}
if (filters.type) {
  conditions.push('type = ?')
  values.push(filters.type)
}
if (filters.owner) {
  conditions.push('owner = ?')
  values.push(filters.owner)
}
if (filters.name) {
  conditions.push('LOWER(name) LIKE LOWER(?)')
  values.push(`%${filters.name}%`)                    // case-insensitive partial
}

const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
const stmt = db.prepare(`SELECT * FROM flags ${where} ORDER BY created_at DESC`)
try {
  if (values.length > 0) stmt.bind(values)
  const rows: FeatureFlag[] = []
  while (stmt.step()) rows.push(rowToFlag(stmt.getAsObject() as unknown as DbRow))
  return rows
} finally {
  stmt.free()
}
```

> **Security note:** All user-provided filter values are bound via `stmt.bind()`. The column names and SQL keywords in the WHERE clause are hardcoded — no user input is ever interpolated into the SQL string. This eliminates SQL injection risk.

---

## 6. Integration Points for Epic 1

> Source: T3 audit findings §7.7; ordered by implementation dependency

| # | File | Function / Type | Change type | Risk |
|---|---|---|---|---|
| 1 | `shared/types.ts` | Add `FlagFilters` interface | New type | Low — additive only |
| 2 | `server/src/middleware/validation.ts` | Add `flagsQuerySchema` Zod object | New schema | Low — all fields optional |
| 3 | `server/src/services/flags.ts` | Add `getFilteredFlags(filters: FlagFilters)` | New function (Pattern C) | High — SQL construction, boolean conversion, stmt lifecycle |
| 4 | `server/src/routes/flags.ts` | Modify `GET /` handler (Workshop marker line 9) | Modify existing | Medium — validation + service delegation |
| 5 | `client/src/api/flags.ts` | Modify `getFlags()` to accept and forward `FlagFilters` | Modify existing | Low — URLSearchParams construction |
| 6 | `client/src/App.tsx` | Add `filterState`, update `queryKey`, wire filter bar | Modify existing | Medium — state management, query invalidation |
| 7 | `client/src/App.tsx` + components | Filter bar UI + active-filter indicator + clear all | New UI | Medium — UX consistency, controlled inputs |

**Implementation order is mandatory** — each step depends on the types/schemas defined in the step above.

---

## 7. Risk Register

> Source: T3 audit findings §7.8

| ID | Description | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Dynamic SQL injection** — WHERE clause built via string interpolation instead of parameterized binding | Low | Critical | Enforce Pattern C: all user values go through `stmt.bind(values)`; column names and SQL keywords are hardcoded strings — never user-provided |
| R2 | **Client state sync** — stale TanStack Query cache when filters change | High | Medium | Include `filterState` in `queryKey`: `['flags', filterState]` — React Query refetches on every filter change automatically |
| R3 | **Test isolation** — filter combination tests leak state between cases | Medium | Medium | Replicate exact `beforeEach(createTables + _resetDbForTesting)` / `afterEach(_resetDbForTesting(null) + db.close())` pattern; insert own fixture data per test |
| R4 | **Boolean conversion** — `enabled` arrives as string `'true'`/`'false'` from query param, but DB stores `INTEGER 0/1` | High | High | Zod schema validates `status` as `z.enum(['enabled','disabled'])`; service converts: `filters.status === 'enabled' ? 1 : 0` |

---

## 8. TASK.md Acceptance Criteria Checklist

> Source: `nextjs-feature-flag-exercise/TASK.md` — all 11 ACs verbatim

| # | AC (verbatim) | Layer |
|---|---|---|
| AC-1 | Users can filter flags by environment (development, staging, production) | Server + Client |
| AC-2 | Users can filter flags by status (enabled/disabled) | Server + Client |
| AC-3 | Users can filter flags by type (release, experiment, operational, permission) | Server + Client |
| AC-4 | Users can filter flags by owner | Server + Client |
| AC-5 | Users can search flags by name (partial match) | Server + Client |
| AC-6 | Filtering should happen in the backend | Server |
| AC-7 | Multiple filters can be applied simultaneously (e.g., "all enabled release flags in production") | Server — AND semantics |
| AC-8 | Filters persist while using other features (creating, editing, deleting flags) | Client state |
| AC-9 | There is a way to clear all filters and return to the full list | Client UI |
| AC-10 | The UI clearly indicates when filters are active | Client UI |
| AC-11 | Filtering should feel responsive, even as the number of flags grows | Server (backend filtering avoids client-side loops) |

**Filter logic notes:**
- Multiple filters use **AND semantics** (AC-7).
- "Clear all filters" resets all active filter fields simultaneously (AC-9).
- Filter controls should update the list immediately — no explicit submit button required (AC-11 implication).
- `status` query param maps to `enabled` DB column via boolean conversion (AC-2 + SQL.js constraint).
