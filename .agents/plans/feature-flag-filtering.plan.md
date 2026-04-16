# Plan: Feature Flag Filtering

## Summary

Add server-side filtering to `GET /api/flags` via 5 query parameters (`name`, `status`,
`environment`, `type`, `owner`), validated by a Zod middleware that stores parsed params
in `res.locals.filters`. The service builds a dynamic `WHERE` clause using a `conditions[]`
array (AND logic) with fully parameterized SQL.js queries. On the client, a new
`FlagsFilterControls` component provides selects and debounced text inputs; filter state
lives in `App.tsx` and drives a compound TanStack Query key `['flags', filters]` so
mutations auto-refetch the filtered list.

## User Story

As a software engineer managing feature flags,
I want to filter the flag list by environment, status, type, owner, and name,
So that I can find the exact flags I need without scrolling through the full list.

## Metadata

| Field | Value |
|-------|-------|
| Type | NEW_CAPABILITY |
| Complexity | MEDIUM |
| Systems Affected | shared, server, client, tests |

---

## Patterns to Follow

### Naming

```typescript
// SOURCE: server/src/services/flags.ts:92-108
// Single-record lookup — prepare/bind/step/getAsObject/free
export async function getFlagById(id: string): Promise<FeatureFlag | null> {
  const db = await getDb()
  const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')
  try {
    stmt.bind([id])
    if (stmt.step()) {
      const row = stmt.getAsObject() as unknown as DbRow
      return rowToFlag(row)
    }
    return null
  } finally {
    stmt.free()
  }
}
```

### Dynamic SQL builder pattern

```typescript
// SOURCE: server/src/services/flags.ts:190-234 (updateFlag)
// Build conditions array → join → embed in SQL
const updates: string[] = []
const values: (string | number | null)[] = []

if (input.name !== undefined) { updates.push('name = ?'); values.push(input.name) }
// ...
const stmt = db.prepare(`UPDATE flags SET ${updates.join(', ')} WHERE id = ?`)
try { stmt.run(values) } finally { stmt.free() }
```

### Zod schema pattern

```typescript
// SOURCE: server/src/middleware/validation.ts:3-13
export const createFlagSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  type: z.enum(['release', 'experiment', 'operational', 'permission']),
  // ...
})
```

### Route middleware + error propagation

```typescript
// SOURCE: server/src/routes/flags.ts:34-42
flagsRouter.post('/', async (req, res, next) => {
  try {
    const input = createFlagSchema.parse(req.body)
    const flag = await createFlag(input)
    res.status(201).json(flag)
  } catch (error) {
    next(error)
  }
})
```

### TanStack Query — compound key + invalidation

```typescript
// SOURCE: client/src/App.tsx:19-22 and 27
const { data: flags = [], isLoading, error } = useQuery({
  queryKey: ['flags'],          // → change to ['flags', filters]
  queryFn: getFlags,
})
qc.invalidateQueries({ queryKey: ['flags'] })  // still matches compound key
```

### Select dropdown pattern

```typescript
// SOURCE: client/src/components/flag-form-modal.tsx:164-181
<Select value={formData.environment} onValueChange={(value: Environment) => ...}>
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    {environments.map((env) => (
      <SelectItem key={env} value={env}>{env}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Test structure

```typescript
// SOURCE: server/src/__tests__/flags.test.ts:28-54
describe('Flag Service', () => {
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
  describe('getAllFlags', () => {
    it('returns empty array when no flags exist', async () => { ... })
    it('returns all flags', async () => { ... })
  })
})
```

---

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `shared/types.ts` | UPDATE | Add `FlagFilterParams` interface |
| `server/src/middleware/validation.ts` | UPDATE | Add `flagFilterQuerySchema` + `validateFlagFilters` middleware |
| `server/src/services/flags.ts` | UPDATE | Update `getAllFlags()` to accept `FlagFilterParams` and build dynamic WHERE |
| `server/src/routes/flags.ts` | UPDATE | Wire `validateFlagFilters` middleware to `GET /`, pass `res.locals.filters` to service |
| `client/src/api/flags.ts` | UPDATE | Add `FlagFilterParams` param to `getFlags()`, build URLSearchParams |
| `client/src/components/flags-filter-controls.tsx` | CREATE | New filter UI component |
| `client/src/App.tsx` | UPDATE | Add `filters` state, compound query key, render filter controls |
| `server/src/__tests__/flags.test.ts` | UPDATE | Add `describe('filtering')` block with 9 test cases |

---

## Tasks

Execute in order. Each task is atomic and verifiable.

---

### Task 1: Add `FlagFilterParams` to shared types

- **File**: `shared/types.ts`
- **Action**: UPDATE
- **Implement**: Append `FlagFilterParams` export after `UpdateFlagInput`. All fields optional.
  ```typescript
  export interface FlagFilterParams {
    environment?: Environment
    status?: 'enabled' | 'disabled'
    type?: FlagType
    owner?: string
    name?: string
  }
  ```
- **Mirror**: `shared/types.ts:32-42` — same optional-field interface pattern as `UpdateFlagInput`
- **Validate**: `cd server && pnpm run build`

---

### Task 2: Add Zod query-param schema + `validateFlagFilters` middleware

- **File**: `server/src/middleware/validation.ts`
- **Action**: UPDATE
- **Implement**: Add Express type imports and two new exports after the existing schemas:
  ```typescript
  import type { Request, Response, NextFunction } from 'express'

  export const flagFilterQuerySchema = z.object({
    environment: z.enum(['development', 'staging', 'production']).optional(),
    status: z.enum(['enabled', 'disabled']).optional(),
    type: z.enum(['release', 'experiment', 'operational', 'permission']).optional(),
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
- **Mirror**: `server/src/middleware/validation.ts:3-13` — same `z.enum(...)` pattern
- **Note**: ZodError thrown here is caught by `errorHandler` middleware
  (`server/src/middleware/error.ts:37-64`) which returns `{ error: 'VALIDATION_ERROR', statusCode: 400 }`
- **Validate**: `cd server && pnpm run build`

---

### Task 3: Update `getAllFlags()` to accept and apply filters

- **File**: `server/src/services/flags.ts`
- **Action**: UPDATE
- **Implement**: Replace lines 86-90 (the current `db.exec()` implementation) with:
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
      if (params.length > 0) stmt.bind(params)
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
- Also add `FlagFilterParams` to the import line at the top (line 4):
  ```typescript
  import type { FeatureFlag, CreateFlagInput, UpdateFlagInput, FlagFilterParams, Environment, FlagType } from '../../../shared/types.js'
  ```
- **Mirror**: `server/src/services/flags.ts:92-108` — prepare/bind/step/getAsObject/free pattern
- **Mirror**: `server/src/services/flags.ts:190-234` — dynamic conditions array → join
- **Critical**: `status === 'enabled' ? 1 : 0` converts string → INTEGER (DB stores 0/1, not boolean)
- **Critical**: LIKE escapes `%`, `_`, `\` before binding — prevents wildcard injection
- **Critical**: `stmt.bind()` only called when `params.length > 0` — SQL.js errors on empty bind
- **Validate**: `cd server && pnpm run build`

---

### Task 4: Wire `validateFlagFilters` middleware into `GET /` route

- **File**: `server/src/routes/flags.ts`
- **Action**: UPDATE
- **Implement**: Update the import line (line 3) and the `GET /` handler (lines 8-18):
  ```typescript
  // Line 3 — add validateFlagFilters import
  import { createFlagSchema, updateFlagSchema, validateFlagFilters } from '../middleware/validation.js'
  // Add FlagFilterParams type import after the Router import
  import type { FlagFilterParams } from '../../../shared/types.js'

  // Replace lines 8-18
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
- Remove the two TODO comment lines (lines 9-10)
- **Mirror**: `server/src/routes/flags.ts:34-42` — try/catch/next(error) pattern
- **Validate**: `cd server && pnpm run build && pnpm test`

---

### Task 5: Update `getFlags()` client API to pass filters as query params

- **File**: `client/src/api/flags.ts`
- **Action**: UPDATE
- **Implement**: Add `FlagFilterParams` to imports (line 1) and replace `getFlags()` (lines 35-45):
  ```typescript
  // Line 1 — add FlagFilterParams to import
  import type { FeatureFlag, CreateFlagInput, UpdateFlagInput, ApiError, FlagFilterParams } from '@shared/types'

  // Replace lines 35-45
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
- **Mirror**: `client/src/api/flags.ts:35-45` — same try/catch/TypeError pattern
- **Validate**: `cd client && pnpm run build`

---

### Task 6: Create `FlagsFilterControls` component

- **File**: `client/src/components/flags-filter-controls.tsx`
- **Action**: CREATE
- **Implement**: New component with selects for enum fields and debounced text inputs for string fields:
  ```typescript
  import { useState, useEffect } from 'react'
  import type { FlagFilterParams, Environment, FlagType } from '@shared/types'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Badge } from '@/components/ui/badge'
  import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  } from '@/components/ui/select'

  interface FlagsFilterControlsProps {
    filters: FlagFilterParams
    onChange: (filters: FlagFilterParams) => void
  }

  export function FlagsFilterControls({ filters, onChange }: FlagsFilterControlsProps) {
    const [nameInput, setNameInput] = useState(filters.name ?? '')
    const [ownerInput, setOwnerInput] = useState(filters.owner ?? '')

    // Sync local text inputs when filters are externally cleared
    useEffect(() => {
      setNameInput(filters.name ?? '')
      setOwnerInput(filters.owner ?? '')
    }, [filters.name, filters.owner])

    // 300ms debounce for text inputs
    useEffect(() => {
      const timer = setTimeout(() => {
        onChange({ ...filters, name: nameInput || undefined })
      }, 300)
      return () => clearTimeout(timer)
    }, [nameInput])    // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      const timer = setTimeout(() => {
        onChange({ ...filters, owner: ownerInput || undefined })
      }, 300)
      return () => clearTimeout(timer)
    }, [ownerInput])   // eslint-disable-line react-hooks/exhaustive-deps

    const activeCount = Object.values(filters).filter(v => v !== undefined).length

    const handleClear = () => {
      setNameInput('')
      setOwnerInput('')
      onChange({})
    }

    return (
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select
          value={filters.environment ?? ''}
          onValueChange={(v) =>
            onChange({ ...filters, environment: v ? (v as Environment) : undefined })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All environments</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status ?? ''}
          onValueChange={(v) =>
            onChange({ ...filters, status: v ? (v as 'enabled' | 'disabled') : undefined })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All statuses</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.type ?? ''}
          onValueChange={(v) =>
            onChange({ ...filters, type: v ? (v as FlagType) : undefined })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            <SelectItem value="release">Release</SelectItem>
            <SelectItem value="experiment">Experiment</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="permission">Permission</SelectItem>
          </SelectContent>
        </Select>

        <Input
          className="w-[160px]"
          placeholder="Search by name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />

        <Input
          className="w-[160px]"
          placeholder="Filter by owner"
          value={ownerInput}
          onChange={(e) => setOwnerInput(e.target.value)}
        />

        {activeCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeCount} active</Badge>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    )
  }
  ```
- **Mirror**: `client/src/components/flag-form-modal.tsx:164-181` — Select/SelectContent/SelectItem pattern
- **Mirror**: `client/src/components/flag-form-modal.tsx:128-136` — Input onChange pattern
- **Note**: Debounce via `setTimeout` in `useEffect` with cleanup (`clearTimeout`) — standard React pattern
- **Note**: `value=""` for "All" option — Radix Select uses empty string to represent cleared state;
  convert back to `undefined` before setting filter so URLSearchParams skips it
- **Validate**: `cd client && pnpm run build`

---

### Task 7: Add filter state and `FlagsFilterControls` to `App.tsx`

- **File**: `client/src/App.tsx`
- **Action**: UPDATE
- **Implement** three changes:

  **A) Imports** — add `FlagFilterParams` type and `FlagsFilterControls` component:
  ```typescript
  import type { FeatureFlag, CreateFlagInput, UpdateFlagInput, FlagFilterParams } from '@shared/types'
  import { FlagsFilterControls } from '@/components/flags-filter-controls'
  ```

  **B) Filter state + compound query key** (inside `FlagsApp`, after existing `useState` hooks):
  ```typescript
  const [filters, setFilters] = useState<FlagFilterParams>({})

  const { data: flags = [], isLoading, error } = useQuery({
    queryKey: ['flags', filters],         // compound key: refetches when filters change
    queryFn: () => getFlags(filters),
  })
  ```
  Replace the existing `useQuery` at lines 19-22.

  **C) Render filter controls** — inside the JSX, between the header div and the loading conditional (between lines 113 and 115):
  ```tsx
  <FlagsFilterControls filters={filters} onChange={setFilters} />
  ```

- **Mirror**: `client/src/App.tsx:15-17` — `useState` declaration pattern
- **Mirror**: `client/src/App.tsx:27` — `qc.invalidateQueries({ queryKey: ['flags'] })` still
  matches prefix `['flags']` so mutations continue to invalidate correctly
- **Validate**: `cd client && pnpm run build && pnpm run lint`

---

### Task 8: Add filter tests to the server test suite

- **File**: `server/src/__tests__/flags.test.ts`
- **Action**: UPDATE
- **Implement**: Add a new `describe('filtering', ...)` block after the `deleteFlag` describe block
  (after line 289). Also add `getAllFlags` import (already imported at line 6).
  ```typescript
  describe('filtering', () => {
    beforeEach(async () => {
      // Seed flags covering all filter dimensions
      await createFlag({ name: 'prod-release', description: 'D', enabled: true,
        environment: 'production', type: 'release', rolloutPercentage: 100,
        owner: 'team-a', tags: [] })
      await createFlag({ name: 'dev-experiment', description: 'D', enabled: false,
        environment: 'development', type: 'experiment', rolloutPercentage: 0,
        owner: 'team-b', tags: [] })
      await createFlag({ name: 'staging-ops', description: 'D', enabled: true,
        environment: 'staging', type: 'operational', rolloutPercentage: 50,
        owner: 'team-a', tags: [] })
      await createFlag({ name: 'dark-mode-feature', description: 'D', enabled: true,
        environment: 'production', type: 'permission', rolloutPercentage: 100,
        owner: 'team-c', tags: [] })
    })

    it('returns all flags when no filters provided', async () => {
      const flags = await getAllFlags()
      expect(flags).toHaveLength(4)
    })

    it('filters by environment', async () => {
      const flags = await getAllFlags({ environment: 'production' })
      expect(flags).toHaveLength(2)
      expect(flags.every(f => f.environment === 'production')).toBe(true)
    })

    it('filters by status enabled', async () => {
      const flags = await getAllFlags({ status: 'enabled' })
      expect(flags).toHaveLength(3)
      expect(flags.every(f => f.enabled === true)).toBe(true)
    })

    it('filters by status disabled', async () => {
      const flags = await getAllFlags({ status: 'disabled' })
      expect(flags).toHaveLength(1)
      expect(flags[0].enabled).toBe(false)
    })

    it('filters by type', async () => {
      const flags = await getAllFlags({ type: 'release' })
      expect(flags).toHaveLength(1)
      expect(flags[0].type).toBe('release')
    })

    it('filters by owner', async () => {
      const flags = await getAllFlags({ owner: 'team-a' })
      expect(flags).toHaveLength(2)
      expect(flags.every(f => f.owner === 'team-a')).toBe(true)
    })

    it('filters by name partial match (case-insensitive)', async () => {
      const flags = await getAllFlags({ name: 'dark' })
      expect(flags).toHaveLength(1)
      expect(flags[0].name).toBe('dark-mode-feature')
    })

    it('filters by name case-insensitively', async () => {
      const flags = await getAllFlags({ name: 'PROD' })
      expect(flags).toHaveLength(1)
      expect(flags[0].name).toBe('prod-release')
    })

    it('combines multiple filters with AND logic', async () => {
      const flags = await getAllFlags({ environment: 'production', status: 'enabled' })
      expect(flags).toHaveLength(2)
      expect(flags.every(f => f.environment === 'production' && f.enabled)).toBe(true)
    })

    it('returns empty array when no flags match', async () => {
      const flags = await getAllFlags({ owner: 'team-nonexistent' })
      expect(flags).toEqual([])
    })
  })
  ```
- **Mirror**: `server/src/__tests__/flags.test.ts:28-54` — describe/beforeEach/_resetDbForTesting pattern
- **Note**: The `beforeEach` at the outer describe level already resets the DB, so inner `beforeEach`
  runs on a clean DB and just seeds the filter-test data
- **Validate**: `cd server && pnpm run build && pnpm run lint && pnpm test`

---

## Validation

### Server
```bash
cd server && pnpm run build && pnpm run lint && pnpm test
```

### Client
```bash
cd client && pnpm run build && pnpm run lint
```

### All at once
```bash
cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
```

---

## End-to-End Verification

- [ ] Start server: `cd server && pnpm dev`
- [ ] Start client: `cd client && pnpm dev`
- [ ] Open `http://localhost:3000` — filter controls visible above the flags table
- [ ] Select "production" environment → table shows only production flags
- [ ] Select "enabled" status → table narrows further
- [ ] Type "dark" in name input → after 300ms, only matching flags appear
- [ ] Active filter badge shows count (e.g., "3 active")
- [ ] Click "Clear all filters" → full list returns, badge disappears
- [ ] Create a new flag → new flag appears in filtered results (filter state preserved)
- [ ] Delete a flag → list updates without losing filter state
- [ ] Verify no console errors in browser DevTools

---

## Acceptance Criteria

- [ ] All 11 TASK.md acceptance criteria satisfied
- [ ] `environment`, `status`, `type` each filter independently
- [ ] `owner` filters by exact match
- [ ] `name` filters by case-insensitive partial match (LIKE with escaping)
- [ ] Multiple filters combine with AND logic
- [ ] Invalid enum value returns 400 with Zod error message
- [ ] Empty result returns `[]` (not 404 or error)
- [ ] Filter state persists across create/edit/delete mutations
- [ ] "Clear all filters" resets to full list in one click
- [ ] Active filter badge shows count when filters are active
- [ ] `cd server && pnpm run build` — exit 0
- [ ] `cd server && pnpm run lint` — exit 0
- [ ] `cd server && pnpm test` — exit 0
- [ ] `cd client && pnpm run build` — exit 0
- [ ] `cd client && pnpm run lint` — exit 0

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| SQL injection via query params | Zod validates enums; string params go through parameterized `stmt.bind()` |
| LIKE wildcard injection | Escape `%`, `_`, `\` with `replace(/[\\%_]/g, '\\$&')` before binding |
| Boolean mismatch | `status === 'enabled' ? 1 : 0` converts string → INTEGER; `row.enabled === 1` on read |
| `stmt.free()` leak | `try/finally` in every `getAllFlags` path regardless of params length |
| `stmt.bind([])` on no-filter case | Guard: `if (params.length > 0) stmt.bind(params)` |
| Filter state lost on mutation | TanStack Query key `['flags', filters]` — `invalidateQueries(['flags'])` prefix-matches |
| Radix Select empty-string vs undefined | Empty string `""` in Select value → `undefined` before setting filter |
| Debounce closure stale | `useEffect` deps include `nameInput`/`ownerInput`; `filters` spread inside with fresh ref |
