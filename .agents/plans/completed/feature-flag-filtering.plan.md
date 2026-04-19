# Plan: Feature Flag Filtering

## Summary

Add server-side filtering to the feature flag dashboard. Users can narrow the flag list by environment, status, type, owner, and name. Filters are sent as query params to `GET /api/flags`, validated by Zod middleware, dynamically composed into a SQL WHERE clause, and reflected in the React UI via a new `FlagsFilterControls` component. Multiple filters combine with AND logic. Filters persist across create/edit/delete actions because they live in App state and are included in the React Query key.

## User Story

As a software engineer managing feature flags,
I want to filter flags by environment, status, type, owner, and name,
So that I can quickly find the flags relevant to my current task.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | MEDIUM |
| Systems Affected | `shared/`, `server/src/middleware/`, `server/src/services/`, `server/src/routes/`, `server/src/__tests__/`, `client/src/api/`, `client/src/`, `client/src/components/` |

---

## Documentation to Reference

| Doc | Source | Relevance |
|-----|--------|-----------|
| `CLAUDE.md` | Global rules | Tech stack, patterns, AI gotchas |
| `.agents/reference/backend-patterns.md` | On-Demand Context | Filter middleware, dynamic WHERE, service layer |
| `.agents/reference/frontend-patterns.md` | On-Demand Context | Filter controls component, debounce, query key |
| `.agents/reference/sql-js-constraints.md` | On-Demand Context | `db.prepare()` vs `db.exec()`, LIKE escaping, stmt lifecycle |

---

## Patterns to Follow

### TYPES — FlagFilterParams interface
```typescript
// SOURCE: shared/types.ts:20-42 (existing CreateFlagInput/UpdateFlagInput for structure)
export interface FlagFilterParams {
  environment?: Environment
  status?: 'enabled' | 'disabled'
  type?: FlagType
  owner?: string
  name?: string
}
```

### VALIDATION — Zod filter schema + middleware
```typescript
// SOURCE: server/src/middleware/validation.ts:3-15 (existing createFlagSchema)
const environmentValues = ['development', 'staging', 'production'] as const
const flagTypeValues = ['release', 'experiment', 'operational', 'permission'] as const

export const flagFilterQuerySchema = z.object({
  environment: z.enum(environmentValues).optional(),
  status: z.enum(['enabled', 'disabled']).optional(),
  type: z.enum(flagTypeValues).optional(),
  owner: z.string().optional(),
  name: z.string().optional(),
})

export function validateFlagFilters(req: Request, res: Response, next: NextFunction): void {
  try {
    res.locals.filters = flagFilterQuerySchema.parse(req.query)
    next()
  } catch (error) {
    next(error)
  }
}
```

### DATA_ACCESS — Dynamic WHERE with db.prepare() + stmt.free() in finally
```typescript
// SOURCE: server/src/services/flags.ts:92-108 (getFlagById pattern for stmt lifecycle)
// SOURCE: .agents/reference/sql-js-constraints.md §7 (dynamic WHERE building)
const conditions: string[] = []
const params: (string | number)[] = []

if (filters.environment !== undefined) {
  conditions.push('environment = ?')
  params.push(filters.environment)
}
if (filters.status !== undefined) {
  conditions.push('enabled = ?')
  params.push(filters.status === 'enabled' ? 1 : 0)
}
if (filters.type !== undefined) {
  conditions.push('type = ?')
  params.push(filters.type)
}
if (filters.owner !== undefined) {
  conditions.push('owner = ?')
  params.push(filters.owner)
}
if (filters.name !== undefined) {
  conditions.push("LOWER(name) LIKE ? ESCAPE '\\'")
  const escaped = filters.name.toLowerCase().replace(/[\\%_]/g, '\\$&')
  params.push('%' + escaped + '%')
}

const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''
const sql = `SELECT * FROM flags${whereClause} ORDER BY created_at DESC`

const stmt = db.prepare(sql)
try {
  if (params.length > 0) {
    stmt.bind(params)
  }
  const rows: DbRow[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as DbRow)
  }
  return rows.map(rowToFlag)
} finally {
  stmt.free()
}
```

### ERRORS — Route with middleware + next(error)
```typescript
// SOURCE: server/src/routes/flags.ts:34-42 (existing POST route pattern)
flagsRouter.get('/', validateFlagFilters, async (_req, res, next) => {
  try {
    const filters = res.locals.filters as FlagFilterParams
    const flags = await getAllFlags(filters)
    res.json(flags)
  } catch (error) {
    next(error)
  }
})
```

### CLIENT_API — URLSearchParams filter construction
```typescript
// SOURCE: client/src/api/flags.ts:35-45 (existing getFlags for network error pattern)
export async function getFlags(filters?: FlagFilterParams): Promise<FeatureFlag[]> {
  try {
    const params = new URLSearchParams()
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      }
    }
    const query = params.toString()
    const url = query ? `${API_BASE}/flags?${query}` : `${API_BASE}/flags`
    const response = await fetch(url)
    return handleResponse<FeatureFlag[]>(response)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw e
  }
}
```

### REACT — Compound query key triggers auto-refetch on filter change
```typescript
// SOURCE: client/src/App.tsx:19-22 (existing useQuery)
const { data: flags = [], isLoading, error } = useQuery({
  queryKey: ['flags', filters],
  queryFn: () => getFlags(filters),
})
```

### COMPONENT — Debounced inputs + Select sentinel value
```typescript
// SOURCE: client/src/components/flag-form-modal.tsx (controlled form pattern)
// Debounce pattern (300ms via setTimeout + useRef for latest value)
const latestOwner = useRef(localOwner)
latestOwner.current = localOwner
useEffect(() => {
  const id = setTimeout(() => {
    onChange({ ...filters, owner: latestOwner.current || undefined })
  }, 300)
  return () => clearTimeout(id)
}, [localOwner])

// Select sentinel: '__all__' means no filter (Radix Select requires non-empty value)
const SENTINEL = '__all__'
```

### TESTS — describe/it pattern with fresh DB
```typescript
// SOURCE: server/src/__tests__/flags.test.ts:41-53 (existing getAllFlags describe block)
describe('getAllFlags with filters', () => {
  it('filters by environment', async () => {
    await createFlag({ ...validFlagInput, environment: 'production' })
    await createFlag({ ...validFlagInput, name: 'other-flag', environment: 'staging' })

    const flags = await getAllFlags({ environment: 'production' })
    expect(flags).toHaveLength(1)
    expect(flags[0].environment).toBe('production')
  })
})
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `shared/types.ts` | UPDATE | Add `FlagFilterParams` interface |
| `server/src/middleware/validation.ts` | UPDATE | Extract enum arrays, add `flagFilterQuerySchema` + `validateFlagFilters` |
| `server/src/services/flags.ts` | UPDATE | `getAllFlags` accepts filters, use `db.prepare()` dynamic WHERE, remove `resultToRows` |
| `server/src/routes/flags.ts` | UPDATE | Add `validateFlagFilters` middleware and filter pass-through to GET / |
| `client/src/api/flags.ts` | UPDATE | `getFlags` accepts `FlagFilterParams?`, builds URLSearchParams |
| `client/src/App.tsx` | UPDATE | Add `filters` state, update query key, render `FlagsFilterControls` |
| `client/src/components/flags-filter-controls.tsx` | CREATE | Filter UI with selects + debounced inputs + clear button |
| `server/src/__tests__/flags.test.ts` | UPDATE | Add `getAllFlags` filter tests (environment, status, type, owner, name, combined) |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

### Task 1: Add FlagFilterParams to shared types

- **File**: `shared/types.ts`
- **Action**: UPDATE
- **Implement**: Add `FlagFilterParams` interface after `UpdateFlagInput` (line 42). Fields: `environment?: Environment`, `status?: 'enabled' | 'disabled'`, `type?: FlagType`, `owner?: string`, `name?: string`.
- **Mirror**: `shared/types.ts:32-42` — follow the same optional-field interface pattern as `UpdateFlagInput`
- **Validate**: `cd server && npx tsc --noEmit` (types propagate to both server and client)

### Task 2: Add filter schema and middleware to validation.ts

- **File**: `server/src/middleware/validation.ts`
- **Action**: UPDATE
- **Implement**:
  1. Add imports: `import type { Request, Response, NextFunction } from 'express'` at the top (already may not exist — add if missing)
  2. Extract enum values before `createFlagSchema`:
     ```typescript
     const environmentValues = ['development', 'staging', 'production'] as const
     const flagTypeValues = ['release', 'experiment', 'operational', 'permission'] as const
     ```
  3. Update `createFlagSchema` to use `z.enum(environmentValues)` and `z.enum(flagTypeValues)` (same behaviour, now uses named consts)
  4. Add after `updateFlagSchema`:
     ```typescript
     export const flagFilterQuerySchema = z.object({
       environment: z.enum(environmentValues).optional(),
       status: z.enum(['enabled', 'disabled']).optional(),
       type: z.enum(flagTypeValues).optional(),
       owner: z.string().optional(),
       name: z.string().optional(),
     })

     export function validateFlagFilters(req: Request, res: Response, next: NextFunction): void {
       try {
         res.locals.filters = flagFilterQuerySchema.parse(req.query)
         next()
       } catch (error) {
         next(error)
       }
     }
     ```
- **Mirror**: `server/src/middleware/validation.ts:1-15` — existing schema pattern; route `flags.ts:34-42` for next(error) middleware shape
- **Validate**: `cd server && npx tsc --noEmit`

### Task 3: Update getAllFlags service to accept filters

- **File**: `server/src/services/flags.ts`
- **Action**: UPDATE
- **Implement**:
  1. Add `FlagFilterParams` to the import from `'../../../shared/types.js'`
  2. Replace the `resultToRows` helper function (lines 74-84) — it will no longer be needed
  3. Rewrite `getAllFlags` (lines 86-90) to:
     - Accept `filters: FlagFilterParams = {}`
     - Build `conditions: string[]` and `params: (string | number)[]` arrays
     - Add a condition for each defined filter field (environment, status→`enabled`, type, owner, name with LIKE+ESCAPE)
     - Compose `whereClause` from conditions joined with ` AND `
     - Use `db.prepare(sql)` + `try { stmt.bind(params) if params.length > 0; while(stmt.step()) collect rows } finally { stmt.free() }`
     - Map rows with `rowToFlag`
  4. Full implementation (copy exactly):
     ```typescript
     export async function getAllFlags(filters: FlagFilterParams = {}): Promise<FeatureFlag[]> {
       const db = await getDb()
       const conditions: string[] = []
       const params: (string | number)[] = []

       if (filters.environment !== undefined) {
         conditions.push('environment = ?')
         params.push(filters.environment)
       }
       if (filters.status !== undefined) {
         conditions.push('enabled = ?')
         params.push(filters.status === 'enabled' ? 1 : 0)
       }
       if (filters.type !== undefined) {
         conditions.push('type = ?')
         params.push(filters.type)
       }
       if (filters.owner !== undefined) {
         conditions.push('owner = ?')
         params.push(filters.owner)
       }
       if (filters.name !== undefined) {
         conditions.push("LOWER(name) LIKE ? ESCAPE '\\'")
         const escaped = filters.name.toLowerCase().replace(/[\\%_]/g, '\\$&')
         params.push('%' + escaped + '%')
       }

       const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''
       const sql = `SELECT * FROM flags${whereClause} ORDER BY created_at DESC`

       const stmt = db.prepare(sql)
       try {
         if (params.length > 0) {
           stmt.bind(params)
         }
         const rows: DbRow[] = []
         while (stmt.step()) {
           rows.push(stmt.getAsObject() as unknown as DbRow)
         }
         return rows.map(rowToFlag)
       } finally {
         stmt.free()
       }
     }
     ```
- **Mirror**: `server/src/services/flags.ts:92-108` — `getFlagById` for stmt lifecycle; `.agents/reference/sql-js-constraints.md` §7 for WHERE construction
- **Validate**: `cd server && npx tsc --noEmit && pnpm test`

### Task 4: Wire filter middleware into GET /api/flags route

- **File**: `server/src/routes/flags.ts`
- **Action**: UPDATE
- **Implement**:
  1. Add imports:
     - `import { createFlagSchema, updateFlagSchema, validateFlagFilters } from '../middleware/validation.js'`
     - `import type { FlagFilterParams } from '../../../shared/types.js'`
  2. Replace the GET / handler (lines 11-18) with:
     ```typescript
     flagsRouter.get('/', validateFlagFilters, async (_req, res, next) => {
       try {
         const filters = res.locals.filters as FlagFilterParams
         const flags = await getAllFlags(filters)
         res.json(flags)
       } catch (error) {
         next(error)
       }
     })
     ```
  3. Remove the TODO comment (line 9)
- **Mirror**: `server/src/routes/flags.ts:34-42` — POST route for next(error) shape; `.agents/reference/backend-patterns.md` §1 for filter middleware wiring
- **Validate**: `cd server && npx tsc --noEmit && pnpm test`

### Task 5: Update getFlags API client to support filters

- **File**: `client/src/api/flags.ts`
- **Action**: UPDATE
- **Implement**:
  1. Add `FlagFilterParams` to the import: `import type { FeatureFlag, CreateFlagInput, UpdateFlagInput, ApiError, FlagFilterParams } from '@shared/types'`
  2. Replace `getFlags` (lines 35-45) with:
     ```typescript
     export async function getFlags(filters?: FlagFilterParams): Promise<FeatureFlag[]> {
       try {
         const params = new URLSearchParams()
         if (filters) {
           for (const [key, value] of Object.entries(filters)) {
             if (value !== undefined && value !== '') {
               params.append(key, String(value))
             }
           }
         }
         const query = params.toString()
         const url = query ? `${API_BASE}/flags?${query}` : `${API_BASE}/flags`
         const response = await fetch(url)
         return handleResponse<FeatureFlag[]>(response)
       } catch (e) {
         if (e instanceof TypeError) {
           throw new Error('Unable to connect to server. Please check your connection.')
         }
         throw e
       }
     }
     ```
- **Mirror**: `client/src/api/flags.ts:59-73` — `createFlag` for network error wrapping pattern
- **Validate**: `cd client && npx tsc --noEmit`

### Task 6: Update App.tsx to manage filter state

- **File**: `client/src/App.tsx`
- **Action**: UPDATE
- **Implement**:
  1. Add `FlagFilterParams` to shared types import (line 3)
  2. Add `FlagsFilterControls` import after other component imports:
     `import { FlagsFilterControls } from '@/components/flags-filter-controls'`
  3. Add filter state inside `FlagsApp` (after line 17):
     `const [filters, setFilters] = useState<FlagFilterParams>({})`
  4. Update `useQuery` to use compound key and pass filters:
     ```typescript
     const { data: flags = [], isLoading, error } = useQuery({
       queryKey: ['flags', filters],
       queryFn: () => getFlags(filters),
     })
     ```
  5. In the JSX, add `<FlagsFilterControls filters={filters} onChange={setFilters} />` between the header row and the loading/table block. Wrap the filter + table area in a `<div className="space-y-4">`.
- **Mirror**: `client/src/App.tsx:14-22` — existing state + useQuery pattern
- **Validate**: `cd client && npx tsc --noEmit`

### Task 7: Create FlagsFilterControls component

- **File**: `client/src/components/flags-filter-controls.tsx`
- **Action**: CREATE
- **Implement**: Build a controlled filter bar component. Structure:
  ```typescript
  import { useEffect, useRef, useState } from 'react'
  import type { FlagFilterParams, Environment, FlagType } from '@shared/types'
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
  import { Input } from '@/components/ui/input'
  import { Button } from '@/components/ui/button'
  import { cn } from '@/lib/utils'

  const SENTINEL = '__all__'

  interface FlagsFilterControlsProps {
    filters: FlagFilterParams
    onChange: (filters: FlagFilterParams) => void
  }
  ```

  **Internal state**: `localOwner` (string) and `localName` (string) for debounce. Sync them when `filters.owner` / `filters.name` change externally (e.g., on "Clear all"):
  ```typescript
  useEffect(() => { setLocalOwner(filters.owner ?? '') }, [filters.owner])
  useEffect(() => { setLocalName(filters.name ?? '') }, [filters.name])
  ```

  **Debounced owner and name** (300ms):
  ```typescript
  const latestOwner = useRef(localOwner)
  latestOwner.current = localOwner
  useEffect(() => {
    const id = setTimeout(() => {
      onChange({ ...filters, owner: latestOwner.current || undefined })
    }, 300)
    return () => clearTimeout(id)
  }, [localOwner])
  // same pattern for localName
  ```

  **Select handlers** (environment, status, type):
  ```typescript
  const handleEnvironmentChange = (value: string) => {
    onChange({ ...filters, environment: value === SENTINEL ? undefined : value as Environment })
  }
  // same pattern for status and type
  ```

  **Clear all**:
  ```typescript
  const handleClear = () => {
    setLocalOwner('')
    setLocalName('')
    onChange({})
  }
  ```

  **Active filter indicator**: compute `const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '')`

  **JSX layout**: `<div className="flex flex-wrap gap-3 items-center p-4 bg-muted/50 rounded-lg">` containing:
  - Environment Select: options `__all__`, `development`, `staging`, `production`
  - Status Select: options `__all__`, `enabled`, `disabled`
  - Type Select: options `__all__`, `release`, `experiment`, `operational`, `permission`
  - Owner Input: placeholder "Filter by owner…"
  - Name Input: placeholder "Search by name…"
  - "Clear filters" Button (variant="outline", only show when `hasActiveFilters`)
  - Active indicator: when `hasActiveFilters`, show small text "Filters active" with a distinct color

- **Mirror**: `client/src/components/flag-form-modal.tsx` — controlled form with Select/Input/useEffect; `client/src/components/ui/select.tsx` — Select primitive structure
- **Validate**: `cd client && npx tsc --noEmit`

### Task 8: Add filter tests to flags.test.ts

- **File**: `server/src/__tests__/flags.test.ts`
- **Action**: UPDATE
- **Implement**: Add a new `describe('getAllFlags with filters', ...)` block after the existing `getAllFlags` describe (after line 53). Include:
  - `it('filters by environment')` — create two flags with different environments, assert only matching one returned
  - `it('filters by status enabled')` — create enabled + disabled flag, filter by `status: 'enabled'`
  - `it('filters by status disabled')` — same flags, filter by `status: 'disabled'`
  - `it('filters by type')` — create two flags with different types, assert correct one returned
  - `it('filters by owner')` — create two flags with different owners, assert correct one returned
  - `it('filters by name partial match')` — create `search-feature-a` and `unrelated-flag`, filter by `name: 'search-feature'`, only the first should return
  - `it('applies multiple filters simultaneously')` — create three flags: only one matches environment=production AND status=enabled, assert only that one returned
  - `it('returns all flags when no filters provided')` — create two flags, call `getAllFlags()` with no args, get both

  Pattern for each test (follow mirror exactly):
  ```typescript
  it('filters by environment', async () => {
    await createFlag({ ...validFlagInput, environment: 'production' })
    await createFlag({ ...validFlagInput, name: 'staging-flag', environment: 'staging' })

    const flags = await getAllFlags({ environment: 'production' })
    expect(flags).toHaveLength(1)
    expect(flags[0].environment).toBe('production')
  })
  ```
- **Mirror**: `server/src/__tests__/flags.test.ts:41-53` — existing getAllFlags describe block structure
- **Validate**: `cd server && pnpm test`

---

## Validation

```bash
# Backend: typecheck + tests
cd server && npx tsc --noEmit
cd server && pnpm test

# Frontend: typecheck
cd client && npx tsc --noEmit

# Full build verification
cd server && pnpm run build
cd client && pnpm run build
```

---

## End-to-End Verification

- [ ] Start servers: `cd server && pnpm dev` and `cd client && pnpm dev`
- [ ] Open http://localhost:3000 — flags table loads with no filters
- [ ] Select "production" in environment filter — table updates to show only production flags
- [ ] Select "enabled" in status filter — table narrows further
- [ ] Type "auth" in name search — table shows only flags whose name contains "auth"
- [ ] Click "Clear filters" — all flags return, indicator disappears
- [ ] Create a new flag — filters persist, table refreshes filtered
- [ ] Edit an existing flag — filters persist after save
- [ ] Delete a flag — filters persist after delete
- [ ] Verify no console errors throughout

---

## Acceptance Criteria

- [ ] Filter by environment (development / staging / production)
- [ ] Filter by status (enabled / disabled)
- [ ] Filter by type (release / experiment / operational / permission)
- [ ] Filter by owner (exact text)
- [ ] Search by name (partial match, case-insensitive)
- [ ] Filtering happens in the backend (query params sent to server)
- [ ] Multiple filters combine with AND logic simultaneously
- [ ] Filters persist while creating, editing, and deleting flags
- [ ] "Clear filters" button resets all filters
- [ ] UI indicates when filters are active
- [ ] All TypeScript checks pass with zero errors
- [ ] All Vitest tests pass
- [ ] Build passes for both server and client
