# PRD — Feature Flag Filtering (Exercise 2)

> **Layer 2 — Task Planning Document for PIV Loop**
>
> This PRD follows the Prompt Structure 5-step: Context Reference → Installation
> Commands → Implementation Instructions → Testing & Validation → Commit & Summary.
>
> Self-contained: `/plan` can generate an implementation plan directly from this document.

---

## 1. Executive Summary

Implement server-side filtering for `GET /api/flags` with 5 query parameters:
`name` (partial match, case-insensitive), `status` (enabled/disabled), `environment`
(development/staging/production), `type` (release/experiment/operational/permission),
and `owner` (exact match). Add client-side filter UI controls with debounced text
inputs, select dropdowns, active-filter indicators, and a "Clear all" action.

**Starting state:** The `GET /api/flags` endpoint returns all flags with no query
parameter support. `getAllFlags()` uses a simple `SELECT *` with no WHERE clause.
The client has no filter UI — just a flat list.

**End state:** All 11 acceptance criteria from `TASK.md` satisfied. Server-side
filtering via parameterized SQL.js queries. Client filter controls with 300ms
debounce on text inputs. Filter state persists across CRUD mutations.

**Reference:** Full acceptance criteria in [`TASK.md`](../../TASK.md).

---

## 2. Mission

Enable efficient feature flag management through server-side filtering that:
- Reduces data transfer by returning only matching flags
- Improves UX by letting engineers find flags in seconds, not by scrolling
- Supports combining multiple filters with AND logic
- Maintains responsiveness as the flag count grows

---

## 3. Target Users

**Primary:** Software engineers managing feature flags across development, staging,
and production environments — particularly during deployments, A/B testing, and
incident response.

**Job to be done:** When I need to find a specific flag or group of flags (e.g.,
"all enabled release flags in production"), I want to apply filters and see results
instantly, so I can make changes confidently without hunting through a long list.

---

## 4. MVP Scope

### In scope

| Priority | Capability | Rationale |
|---|---|---|
| Must | Server-side filtering by `environment` | Exact match against union type |
| Must | Server-side filtering by `status` | Maps `enabled`/`disabled` string to INTEGER 0/1 |
| Must | Server-side filtering by `type` | Exact match against union type |
| Must | Server-side filtering by `owner` | Exact match string comparison |
| Must | Server-side filtering by `name` | Case-insensitive partial match via LIKE |
| Must | Zod validation of all query params | Reject invalid enum values at boundary |
| Must | Updated client API (`getFlags(filters)`) | URLSearchParams construction |
| Must | Filter UI controls (selects + inputs) | Environment, status, type dropdowns; owner, name text inputs |
| Must | Active-filter indicator + clear action | Badge count + "Clear all filters" button |
| Must | Combine multiple filters (AND logic) | Dynamic WHERE with conditions array |
| Must | Filters persist across CRUD operations | TanStack Query key includes filters |

### Out of scope

| Item | Reason |
|---|---|
| Pagination | Small dataset (20 flags) — unnecessary complexity |
| Sorting | Not in TASK.md acceptance criteria |
| Full-text search | LIKE with wildcards is sufficient for name search |
| Audit log | Deferred to future version |
| Date range filtering | Not required by acceptance criteria |
| Tag-based filtering | Not required by acceptance criteria |

---

## 5. User Stories

### US-1: Filter by status

**As a** software engineer,
**I want to** filter flags by enabled/disabled status,
**so that I** can quickly see which flags are active in any environment.

**Acceptance criteria:**
- Given I select "enabled" in the status dropdown
- When the filter is applied
- Then only flags with `enabled = true` are shown

### US-2: Filter by environment

**As a** software engineer,
**I want to** filter flags by environment (development, staging, production),
**so that I** can focus on flags relevant to the environment I'm working with.

**Acceptance criteria:**
- Given I select "production" in the environment dropdown
- When the filter is applied
- Then only flags with `environment = 'production'` are shown

### US-3: Search by name

**As a** software engineer,
**I want to** search for flags by name using partial text,
**so that I** can quickly locate a flag when I know part of its name.

**Acceptance criteria:**
- Given I type "dark" in the name search input
- When 300ms debounce completes
- Then only flags whose name contains "dark" (case-insensitive) are shown

### US-4: Combine multiple filters

**As a** software engineer,
**I want to** apply multiple filters simultaneously,
**so that I** can narrow down to exactly the flags I need (e.g., "all enabled release flags in production").

**Acceptance criteria:**
- Given I select environment="production", status="enabled", type="release"
- When all filters are applied
- Then only flags matching ALL criteria are shown (AND logic)

### US-5: Clear all filters

**As a** software engineer,
**I want to** clear all active filters with one action,
**so that I** can return to the full list without resetting each filter individually.

**Acceptance criteria:**
- Given filters are active (badge shows count)
- When I click "Clear all filters"
- Then all filters are reset and the full flag list is displayed

### US-6: Filter by type

**As a** software engineer,
**I want to** filter flags by type (release, experiment, operational, permission),
**so that I** can focus on a specific category of flags.

### US-7: Filter by owner

**As a** software engineer,
**I want to** filter flags by owner,
**so that I** can see all flags owned by a specific team.

---

## 6. Core Architecture & Patterns

### Data flow (from CLAUDE.md)

```
shared/types.ts  →  Zod validation (middleware)  →  Service (SQL.js queries)  →  Routes (Express handlers)
    →  Client API (fetch wrappers)  →  TanStack Query (useQuery/useMutation)  →  React UI
```

### Where each change fits

| Layer | File | Change |
|---|---|---|
| **Types** | `shared/types.ts` | Add `FlagFilterParams` interface (already exists) |
| **Validation** | `server/src/middleware/validation.ts` | Add `flagFilterQuerySchema` + `validateFlagFilters` middleware |
| **Service** | `server/src/services/flags.ts` | Update `getAllFlags()` to accept `FlagFilterParams`, build dynamic WHERE |
| **Routes** | `server/src/routes/flags.ts` | Add `validateFlagFilters` middleware to `GET /`, read `res.locals.filters` |
| **Client API** | `client/src/api/flags.ts` | Update `getFlags()` to build URLSearchParams from filters |
| **UI State** | `client/src/App.tsx` | Add `filters` state, pass to `useQuery` key and `getFlags()` |
| **Filter UI** | `client/src/components/flags-filter-controls.tsx` | New component: selects, inputs, badge, clear button |
| **Tests** | `server/src/__tests__/flags.test.ts` | Add filter test suite: single filter, combined, LIKE, empty result |

### Architecture constraints

- **Layered architecture:** Routes → Services → Database. No cross-layer shortcuts.
- **Error propagation:** Always `next(error)` in routes — never `res.status().json()` for errors.
- **Single source of truth:** All types in `shared/types.ts` — never duplicate interfaces.
- **SQL.js lifecycle:** Every `db.prepare()` has a matching `stmt.free()` in `finally`.

**Deep context:** See [`.agents/reference/backend-patterns.md`](../reference/backend-patterns.md) for full route/service/error patterns with file:line references.

---

## 7. Tools/Features — Filter Parameter Specification

### 7.1 `name` — Partial text search

| Attribute | Value |
|---|---|
| Query param | `?name=<string>` |
| SQL operation | `LOWER(name) LIKE ? ESCAPE '\'` |
| Case sensitivity | Case-insensitive (LOWER on both sides) |
| Match type | Contains — `%<escaped_input>%` |
| Escaping | `replace(/[\\%_]/g, '\\$&')` before wrapping with `%` |
| UI control | Text input with 300ms debounce |

### 7.2 `status` — Enabled/disabled filter

| Attribute | Value |
|---|---|
| Query param | `?status=enabled` or `?status=disabled` |
| Zod validation | `z.enum(['enabled', 'disabled']).optional()` |
| SQL mapping | `enabled = ?` with `status === 'enabled' ? 1 : 0` |
| UI control | Select dropdown: "All" / "Enabled" / "Disabled" |

**Critical note:** The query param is `status` (string), not `enabled` (boolean).
The conversion to INTEGER 0/1 happens in the service layer, not the route.

### 7.3 `environment` — Environment filter

| Attribute | Value |
|---|---|
| Query param | `?environment=development\|staging\|production` |
| Zod validation | `z.enum(['development', 'staging', 'production']).optional()` |
| SQL operation | `environment = ?` (exact match) |
| UI control | Select dropdown: "All" / "Development" / "Staging" / "Production" |

### 7.4 `type` — Flag type filter

| Attribute | Value |
|---|---|
| Query param | `?type=release\|experiment\|operational\|permission` |
| Zod validation | `z.enum(['release', 'experiment', 'operational', 'permission']).optional()` |
| SQL operation | `type = ?` (exact match) |
| UI control | Select dropdown: "All" / "Release" / "Experiment" / "Operational" / "Permission" |

### 7.5 `owner` — Owner filter

| Attribute | Value |
|---|---|
| Query param | `?owner=<string>` |
| Zod validation | `z.string().optional()` |
| SQL operation | `owner = ?` (exact match) |
| UI control | Text input with 300ms debounce |

### Filter combination

All filters use **AND logic**. The service builds a `conditions[]` array and joins
with `AND`:

```typescript
const whereClause = conditions.length > 0
  ? ' WHERE ' + conditions.join(' AND ')
  : ''
```

When no filters are provided, all flags are returned (no WHERE clause).

---

## 8. Technology Stack

**Reference:** Full stack details in [`CLAUDE.md`](../../CLAUDE.md) § 1.

| Layer | Technology | Relevant for filtering |
|---|---|---|
| Shared types | `shared/types.ts` | `FlagFilterParams` interface |
| Validation | Zod | `flagFilterQuerySchema` for query params |
| Backend | Express v5 + SQL.js | Dynamic WHERE, parameterized queries, `stmt.free()` |
| Frontend | React 19 + TanStack Query v5 | `useQuery` with `['flags', filters]` compound key |
| UI | Tailwind CSS v4 + Radix UI (shadcn) | Select, Input, Badge, Button primitives |
| Testing | Vitest | In-memory DB isolation via `_resetDbForTesting()` |

---

## 9. Security & Configuration

### Input validation

- All 5 query parameters validated by Zod at the middleware boundary (`validateFlagFilters`)
- Enum params reject invalid values with a 400 ZodError response
- String params (`name`, `owner`) pass through as-is to parameterized queries
- No raw user input ever interpolated into SQL strings

### SQL injection prevention

- All queries use `db.prepare(sql)` + `stmt.bind(params)` — parameterized
- LIKE search escapes `%`, `_`, `\` characters before binding
- `db.exec()` is never used for queries with user input
- **Reference:** [`.agents/reference/sql-js-constraints.md`](../reference/sql-js-constraints.md) § 3

### Configuration

- No new environment variables required
- No new secrets or tokens needed
- Server runs on port 3001, client on port 3000 (unchanged)
- CORS already configured for cross-origin requests

### Error response shape (consistent)

```json
{ "error": "VALIDATION_ERROR", "message": "environment: Invalid enum value", "statusCode": 400 }
```

---

## 10. API Specification

### GET /api/flags

**Query parameters** (all optional, combinable with AND logic):

| Param | Type | Validation | Example |
|---|---|---|---|
| `name` | string | Any string | `?name=dark` |
| `status` | enum | `enabled` \| `disabled` | `?status=enabled` |
| `environment` | enum | `development` \| `staging` \| `production` | `?environment=production` |
| `type` | enum | `release` \| `experiment` \| `operational` \| `permission` | `?type=release` |
| `owner` | string | Any string | `?owner=team-frontend` |

### Request examples

```bash
# No filters — returns all flags
GET /api/flags

# Single filter — enabled flags only
GET /api/flags?status=enabled

# Combined filters — enabled release flags in production
GET /api/flags?status=enabled&type=release&environment=production

# Name search — partial match, case-insensitive
GET /api/flags?name=dark

# All 5 filters combined
GET /api/flags?name=dark&status=enabled&environment=production&type=release&owner=team-frontend
```

### Response (200 OK)

```json
[
  {
    "id": "uuid-here",
    "name": "dark-mode",
    "description": "Enable dark mode theme for users",
    "enabled": true,
    "environment": "production",
    "type": "release",
    "rolloutPercentage": 100,
    "owner": "team-frontend",
    "tags": ["frontend", "ux"],
    "createdAt": "2026-04-01T10:00:00.000Z",
    "updatedAt": "2026-04-10T15:30:00.000Z",
    "expiresAt": null,
    "lastEvaluatedAt": "2026-04-15T12:00:00.000Z"
  }
]
```

### Error responses

| Status | Cause | Example message |
|---|---|---|
| 400 | Invalid enum value | `environment: Invalid enum value. Expected 'development' \| 'staging' \| 'production'` |
| 400 | Invalid query param format | `status: Invalid enum value. Expected 'enabled' \| 'disabled'` |
| 500 | Internal server error | `An unexpected error occurred` |

---

## 11. Success Criteria

### Functional

- [ ] All 11 acceptance criteria from `TASK.md` satisfied
- [ ] Each filter works independently (5 single-filter tests)
- [ ] Filters combine with AND logic (multi-filter test)
- [ ] Name search is case-insensitive and partial-match
- [ ] Invalid enum values return 400 with clear message
- [ ] Empty result set returns `[]` (not an error)
- [ ] Filter state persists across create/edit/delete mutations
- [ ] "Clear all filters" resets to full list

### Technical

- [ ] `cd server && pnpm run build` — exit 0 (TypeScript clean)
- [ ] `cd server && pnpm run lint` — exit 0 (ESLint clean)
- [ ] `cd server && pnpm test` — exit 0 (all tests pass)
- [ ] `cd client && pnpm run build` — exit 0 (tsc + vite build clean)
- [ ] `cd client && pnpm run lint` — exit 0 (ESLint clean)

### Validation command (copy-paste ready)

```bash
cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
```

---

## 12. Implementation Phases

### Context Reference (Step 1)

Before implementing, load context:
1. Read `CLAUDE.md` for global rules and architecture
2. Read `TASK.md` for acceptance criteria
3. Read `.agents/reference/backend-patterns.md` for route/service patterns
4. Read `.agents/reference/sql-js-constraints.md` for SQL.js constraints
5. Read `.agents/reference/frontend-patterns.md` for TanStack Query and component patterns
6. Read `shared/types.ts` for current type definitions

### Phase 1 — Types + Validation

**Goal:** Define the filter contract and validate query parameters at the boundary.

**Files to modify:**
- `shared/types.ts` — Add `FlagFilterParams` interface (if not already present)
- `server/src/middleware/validation.ts` — Add `flagFilterQuerySchema` (Zod) and `validateFlagFilters` middleware

**Implementation details:**
```typescript
// shared/types.ts
export interface FlagFilterParams {
  environment?: Environment
  status?: 'enabled' | 'disabled'
  type?: FlagType
  owner?: string
  name?: string
}

// server/src/middleware/validation.ts
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

**Validate:** `cd server && pnpm run build`

### Phase 2 — Service + Routes

**Goal:** Add dynamic WHERE clause to `getAllFlags()` and wire middleware to route.

**Files to modify:**
- `server/src/services/flags.ts` — Update `getAllFlags(filters?: FlagFilterParams)` with dynamic SQL
- `server/src/routes/flags.ts` — Add `validateFlagFilters` middleware to `GET /`

**Service implementation (dynamic WHERE):**
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

**Route update:**
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

**Validate:** `cd server && pnpm run build && pnpm test`

### Phase 3 — Client API + UI

**Goal:** Pass filters to API, add filter controls to dashboard.

**Files to modify:**
- `client/src/api/flags.ts` — Update `getFlags()` to accept `FlagFilterParams` and build URLSearchParams
- `client/src/App.tsx` — Add `filters` state, compound query key `['flags', filters]`, render filter controls
- `client/src/components/flags-filter-controls.tsx` — New component with selects, debounced inputs, active badge, clear button

**API client update:**
```typescript
export async function getFlags(filters?: FlagFilterParams): Promise<FeatureFlag[]> {
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
  // ...
}
```

**App state update:**
```typescript
const [filters, setFilters] = useState<FlagFilterParams>({})

const { data: flags = [], isLoading, error } = useQuery({
  queryKey: ['flags', filters],   // Auto-refetch when filters change
  queryFn: () => getFlags(filters),
})
```

**Filter controls pattern:**
- Select dropdowns for `environment`, `status`, `type` — immediate onChange
- Text inputs for `owner`, `name` — 300ms debounce via `setTimeout` + `useEffect`
- Active filter count badge
- "Clear all filters" button that resets to `{}`

**Validate:** `cd client && pnpm run build && pnpm run lint`

### Phase 4 — Tests

**Goal:** Add server-side filter tests and verify end-to-end.

**Files to modify:**
- `server/src/__tests__/flags.test.ts` — Add `describe('filtering')` block

**Test cases:**
```typescript
describe('filtering', () => {
  it('filters by environment')
  it('filters by status (enabled)')
  it('filters by status (disabled)')
  it('filters by type')
  it('filters by owner')
  it('filters by name (partial, case-insensitive)')
  it('combines multiple filters (AND logic)')
  it('returns empty array when no flags match')
  it('returns all flags when no filters provided')
  it('rejects invalid environment value with 400')
  it('rejects invalid status value with 400')
})
```

**Validate:** `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint`

### Commit & Summary (Step 5)

After all phases pass validation:
```bash
git add -A
git commit -m "feat(flags): add server-side filtering by environment, status, type, owner, name [E2-S2]"
git push origin exercise-2
```

---

## 13. Future Considerations

| Feature | Priority | Notes |
|---|---|---|
| Pagination | P2 | `?page=1&limit=20` — needed if flag count exceeds ~100 |
| Sorting | P2 | `?sort=name&order=asc` — column header click |
| Date range filtering | P3 | Filter by `createdAt` or `updatedAt` range |
| Tag-based filtering | P3 | Filter by tags (requires JSON query or join table) |
| Saved filter presets | P3 | Store named filter combinations in localStorage |
| Filter URL persistence | P2 | Sync filter state to URL query string for shareable links |

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| SQL injection via query params | Low | Critical | All queries use parameterized `db.prepare()` + `stmt.bind()`. LIKE input escaped. Zod validates enum params. See [sql-js-constraints.md](../reference/sql-js-constraints.md) § 3 |
| Type drift between client and server | Medium | High | Single source of truth in `shared/types.ts`. Both sides import `FlagFilterParams` from `@shared/types` |
| Statement memory leak | Medium | Medium | Every `db.prepare()` has matching `stmt.free()` in `finally`. See [sql-js-constraints.md](../reference/sql-js-constraints.md) § 2 |
| Filter performance on large datasets | Low | Low | 20 seed flags — no performance concern. Future: add index on `environment`, `enabled` columns |
| LIKE wildcard injection | Low | Medium | Escape `%`, `_`, `\` in name input before binding. See [sql-js-constraints.md](../reference/sql-js-constraints.md) § 8 |
| Boolean storage confusion | Medium | Medium | `enabled` column is INTEGER 0/1, not boolean. Service converts `status` string → integer. See [sql-js-constraints.md](../reference/sql-js-constraints.md) § 4 |

---

## 15. Appendix

### Key file references

| Purpose | Path |
|---|---|
| Exercise requirements | [`TASK.md`](../../TASK.md) |
| Global rules (Claude Code) | [`CLAUDE.md`](../../CLAUDE.md) |
| Type contract (source of truth) | [`shared/types.ts`](../../shared/types.ts) |
| Backend patterns (on-demand) | [`.agents/reference/backend-patterns.md`](../reference/backend-patterns.md) |
| Frontend patterns (on-demand) | [`.agents/reference/frontend-patterns.md`](../reference/frontend-patterns.md) |
| SQL.js constraints (on-demand) | [`.agents/reference/sql-js-constraints.md`](../reference/sql-js-constraints.md) |
| Zod validation schemas | [`server/src/middleware/validation.ts`](../../server/src/middleware/validation.ts) |
| Error classes + handler | [`server/src/middleware/error.ts`](../../server/src/middleware/error.ts) |
| Flag service (business logic) | [`server/src/services/flags.ts`](../../server/src/services/flags.ts) |
| Flag routes (Express handlers) | [`server/src/routes/flags.ts`](../../server/src/routes/flags.ts) |
| DB client + reset helper | [`server/src/db/client.ts`](../../server/src/db/client.ts) |
| API client (fetch wrappers) | [`client/src/api/flags.ts`](../../client/src/api/flags.ts) |
| Main UI + state management | [`client/src/App.tsx`](../../client/src/App.tsx) |
| Flags table component | [`client/src/components/flags-table.tsx`](../../client/src/components/flags-table.tsx) |
| Filter controls component | [`client/src/components/flags-filter-controls.tsx`](../../client/src/components/flags-filter-controls.tsx) |
| Backend tests | [`server/src/__tests__/flags.test.ts`](../../server/src/__tests__/flags.test.ts) |

### Prompt Structure 5-step mapping

| Step | PRD Section |
|---|---|
| 1. Context Reference | § 12 — Context Reference (Step 1) |
| 2. Installation Commands | N/A — no new dependencies needed |
| 3. Implementation Instructions | § 12 — Phases 1-4 |
| 4. Testing & Validation | § 11 — Success Criteria + § 12 Phase 4 |
| 5. Commit & Summary | § 12 — Commit & Summary (Step 5) |

### FlagFilterParams type (from shared/types.ts)

```typescript
export interface FlagFilterParams {
  environment?: Environment        // 'development' | 'staging' | 'production'
  status?: 'enabled' | 'disabled'  // maps to enabled INTEGER 0/1
  type?: FlagType                  // 'release' | 'experiment' | 'operational' | 'permission'
  owner?: string                   // exact match
  name?: string                    // partial match via LIKE
}
```
