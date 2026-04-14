# Task E0-S1-T3 — Conduct Codebase Audit

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S1-T3 |
| **Story** | [E0-S1 — Repository Diagnosis and Readiness](../stories/story-E0S1-repository-diagnosis.md) |
| **Priority** | P1 |
| **Status** | Done |
| **Responsible agent** | `project-adaptation-analyst` |
| **Depends on** | [E0-S1-T2 — Validate local execution environment](task-E0S1T2-validate-environment.md) |
| **Blocks** | E0-S1-T4 |
| Created at | 2026-04-10 17:45:54 -03 |
| Last updated | 2026-04-14 12:59:00 -03 |

---

## 1) Task statement

> **Execution context:** T3 runs as a **GitHub Copilot cloud agent**, invoked via a GitHub Issue
> in the personal fork. The session is stateless — the T2 PR must be merged before this task starts.
> Use `REPO_ROOT="$(git rev-parse --show-toplevel)"` for all path references.
>
> **Output artifact:** T3 fills in the `## 5) Validation evidence` checklist and appends a
> `## 7) Audit Findings` section to this task file (`docs/agile/tasks/task-E0S1T3-codebase-audit.md`).
> That updated file is committed and pushed in Step 9. T4 reads it as its primary input.

Read and map the full architecture of `nextjs-feature-flag-exercise`: directory structure, all source files across every layer, data flow, SQL.js query patterns, test isolation strategy, and the gap between the current implementation and `TASK.md` requirements. Identify all integration points that must be touched for EPIC-1 and record at least 4 risks with mitigations. The output of this task feeds directly into T4 (diagnosis document production).

**Companion skill:** [`project-context-audit`](../../.github/skills/project-context-audit/SKILL.md)

> ⚠️ **Scope guard:** This task is **read-only**. Do not implement any filtering logic, modify any source file, or add any new files to `nextjs-feature-flag-exercise`. All changes are deferred to EPIC-1.

---

## 2) Verifiable expected outcome

1. A complete layer map exists, listing every key file and its role from `shared/types.ts` through to `App.tsx`.
2. The `getAllFlags()` function signature and SQL query are documented verbatim.
3. The workshop task marker comment in `routes/flags.ts` is located and its line number recorded.
4. Both SQL.js query patterns are documented: parameterless bulk read (`db.exec`) and parameterized single read (`db.prepare` + `stmt.bind` + `try-finally { stmt.free() }`).
5. A 6-row filtering gap analysis table exists covering all architectural layers.
6. `_resetDbForTesting()` usage in `flags.test.ts` is confirmed and documented.
7. Risk register contains R1–R4 with mitigations.
8. All 5 filterable `FeatureFlag` fields confirmed: `environment`, `enabled`, `type`, `owner`, `name`.
9. All 11 `TASK.md` acceptance criteria copied verbatim into the audit notes.

---

## 3) Detailed execution plan

### Step 1 — Read orientation documents first

```
nextjs-feature-flag-exercise/AGENTS.md
nextjs-feature-flag-exercise/TASK.md
```

Copy all 11 acceptance criteria from `TASK.md` verbatim into the audit notes. Do not paraphrase.

### Step 2 — Map shared types layer

Read `shared/types.ts` in full. Record:
- `FeatureFlag` interface: every field name, TypeScript type, and whether it is filterable in TASK.md scope.
- `CreateFlagInput` and `UpdateFlagInput`: list all fields.
- `Environment` union type: list all literal values.
- `FlagType` union type: list all literal values.
- `ApiError` interface.
- `enabled` field type in `FeatureFlag`: note that it is `boolean` in TypeScript but stored as `INTEGER (0/1)` in SQL.js — this is a critical conversion point.

### Step 3 — Map server layer

#### 3a — Database layer (`server/src/db/`)

Read `client.ts`, `schema.ts`, `seed.ts`:
- Record the `CREATE TABLE flags` DDL verbatim from `schema.ts`.
- Confirm the `enabled` column type in DDL (INTEGER).
- Note `getDb()` and `saveDb()` signatures.
- Confirm whether `_resetDbForTesting()` is exported from `client.ts` or `schema.ts`.

#### 3b — Middleware layer (`server/src/middleware/`)

Read `validation.ts` and `error.ts`:
- Record the Zod schemas: `createFlagSchema` and `updateFlagSchema` — note all fields and their validators.
- Record the error classes: `NotFoundError`, `ConflictError`, `ValidationError` — note their HTTP status codes.

#### 3c — Services layer (`server/src/services/flags.ts`)

Read the full file. For each function, record:
- Function name and TypeScript signature.
- SQL query string used (exact text).
- Whether it uses `db.exec()` or `db.prepare()`.
- Return type.

Pay special attention to `getAllFlags()`:
- Confirm it takes no parameters.
- Record the exact SQL: `SELECT * FROM flags ORDER BY created_at DESC`.
- Note that this is the target function for the `getFilteredFlags(filters)` addition in EPIC-1.

#### 3d — Routes layer (`server/src/routes/flags.ts`)

Read the full file:
- List all 5 route handlers with their HTTP method, path, and the service function they call.
- Locate the workshop task marker comment in the `GET /` handler — record its exact line number and full surrounding context (it marks the filtering insertion point).
- Confirm the `GET /api/flags` route currently calls `getAllFlags()` with no query parameter processing.

### Step 4 — Map client layer

#### 4a — API client (`client/src/api/flags.ts`)

Read the full file:
- List all exported fetch wrapper functions.
- Record the URL construction for `GET /api/flags` — confirm no query params are appended currently.

#### 4b — Main UI (`client/src/App.tsx`)

Read the full file:
- Locate the `useQuery` call for flag listing — record its `queryKey` and `queryFn`.
- Locate the `useMutation` calls for CRUD operations.
- Note the absence of filter state (no `useState` for filter values).

#### 4c — Component files

Read `client/src/components/flags-table.tsx` and `flag-form-modal.tsx`:
- Note the props accepted by each component.
- Confirm no filter UI exists currently (no filter inputs, no active-filter badge, no clear button).

### Step 5 — SQL.js constraint mapping

Document the two existing patterns side by side:

**Pattern A — Parameterless bulk read (current `getAllFlags`):**
```
db.exec('SELECT * FROM flags ORDER BY created_at DESC')
→ results[0].values → resultToRows() → rowToFlag()
```
- When to use: no WHERE clause, reading all rows.
- `db.exec()` does NOT support bound parameters.

**Pattern B — Parameterized single-row read (current `getFlagById`):**
```
const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')
try {
  stmt.bind([id])
  if (stmt.step()) {
    const row = stmt.getAsObject() as unknown as DbRow
    return rowToFlag(row)
  }
  return null          // ← service returns null; route handler throws NotFoundError
} finally {
  stmt.free()
}
```
- When to use: any query with user-supplied values.
- `stmt.free()` MUST be called in `finally` to prevent memory leaks.
- **Important:** the service itself returns `null` when the row is not found. The `NotFoundError` is thrown by the **route handler** (`if (!flag) throw new NotFoundError(...)`) — not inside the service. Do NOT move error-throwing into Pattern C bulk reads.

**Pattern C — Parameterized filtered bulk read (to implement in EPIC-1):**
```
const stmt = db.prepare('SELECT * FROM flags WHERE <dynamic-clause> ORDER BY created_at DESC')
try {
  stmt.bind(values)
  const rows: FeatureFlag[] = []
  while (stmt.step()) rows.push(rowToFlag(stmt.getAsObject()))
  return rows
} finally {
  stmt.free()
}
```
- Dynamic WHERE clause must be built using array push + `AND` join — never string interpolation with user values.
- `enabled` filter: convert `'true'`/`'false'` string query param → `1`/`0` integer before binding.
- `name` filter: use `LOWER(name) LIKE LOWER(?)` with `%` wildcards for case-insensitive partial match.

### Step 6 — Test isolation pattern

Read `server/src/__tests__/flags.test.ts` in full:
- Confirm `_resetDbForTesting()` is called in `beforeEach` **and** `afterEach`.
  - `beforeEach` creates a fresh in-memory database and sets it up for testing:
    ```typescript
    beforeEach(async () => {
      const SQL = await initSqlJs()
      db = new SQL.Database()
      createTables(db)          // ← REQUIRED: creates the flags table schema
      _resetDbForTesting(db)    // ← injects the fresh DB into the service layer
    })
    ```
    Note: `createTables(db)` must be called before `_resetDbForTesting(db)`. EPIC-1 filter tests must replicate this exact sequence.
  - `afterEach` tears down cleanly:
    ```typescript
    afterEach(() => {
      _resetDbForTesting(null)  // ← de-references the test DB in the service layer
      db.close()               // ← closes and frees the in-memory SQLite DB
    })
    ```
    Note: `db.close()` must come after `_resetDbForTesting(null)` — not before.
- Record the import statement for `_resetDbForTesting` (imported from `../db/client.js`).
- Count the existing test cases (currently **16** `it()` blocks) — note any tests that will need `_resetDbForTesting` extended for filter tests.
- Note whether test cases currently seed specific data — this determines whether filter tests can rely on the seeded data or must insert their own.

### Step 7 — Produce filtering gap analysis table

| Layer | Current state | Required change for EPIC-1 |
|---|---|---|
| `shared/types.ts` | No filter types exist | Add `FlagFilters` interface with 5 optional fields |
| `server/src/middleware/validation.ts` | No query param schema | Add Zod schema for query params (`environment?`, `enabled?`, `type?`, `owner?`, `name?`) |
| `server/src/services/flags.ts` | `getAllFlags()` — no params, returns all rows | Add `getFilteredFlags(filters: FlagFilters): FeatureFlag[]` |
| `server/src/routes/flags.ts` | `GET /` calls `getAllFlags()` — no query param parsing | Parse query params, validate with Zod, pass to `getFilteredFlags()` |
| `client/src/api/flags.ts` | `GET /api/flags` — no query string | Append `URLSearchParams` built from active filters |
| `client/src/App.tsx` | No filter state or UI | Add `filterState`, update `queryKey`, add filter bar + clear action |

### Step 8 — Build risk register

Record at minimum:

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | SQL.js WASM binary fails to load in CI runner | Medium | High | Ensure `copilot-setup-steps.yml` runs `pnpm install` before firewall activates; add to E0-S2 scope |
| R2 | Dynamic WHERE clause injection if not using `stmt.bind()` | Low | Critical | Enforce Pattern C: only use `stmt.bind()` for all user-supplied filter values; never interpolate into SQL string |
| R3 | `enabled` stored as INTEGER 0/1 but arrives as string `'true'`/`'false'` from query params | High | High | Service layer must convert: `enabled === 'true' ? 1 : 0` before binding |
| R4 | Multiple simultaneous filters require AND semantics — incorrect OR would silently return wrong results | Medium | High | Build WHERE clause with explicit AND between all present filter conditions; add a multi-filter test case |

### Step 9 — Commit findings and open PR

After all 8 steps are complete and all §5 checklist items are checked, append the `## 7) Audit Findings` section to this task file with the full structured output (layer map, gap analysis table, SQL.js constraints, risk register, verbatim TASK.md ACs), then commit and push:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"

# Append timeline entry
TIMELINE="$REPO_ROOT/docs/agile/timeline.jsonl"
ID=$(node "$REPO_ROOT/docs/.github/functions/timeline-id.js" "$TIMELINE")
TS=$(node "$REPO_ROOT/docs/.github/functions/datetime.js")
echo "{\"id\":$ID,\"action\":\"updated\",\"artifact_type\":\"task\",\"artifact_id\":\"E0-S1-T3\",\"file\":\"docs/agile/tasks/task-E0S1T3-codebase-audit.md\",\"timestamp\":\"$TS\",\"epic\":\"EPIC-0\",\"story\":\"E0-S1\",\"note\":\"T3 completed: codebase audit findings recorded\"}" >> "$TIMELINE"

# Create feature branch, commit, push
cd "$REPO_ROOT"
git checkout -b exercise-1/codebase-audit
git add docs/agile/tasks/task-E0S1T3-codebase-audit.md docs/agile/timeline.jsonl
git commit -m "docs(E0-S1-T3): add codebase audit findings"
git push origin exercise-1/codebase-audit
```

Open a Pull Request against `exercise-1`. Wait for the PR to be **merged** before T4 starts, since T4 reads the `## 7) Audit Findings` section of this file.

---

## 4) Architecture and security requirements

### Input validation
- This task is read-only — do not write, stage, or commit any changes to `nextjs-feature-flag-exercise`.
- If a source file is ambiguous, read it again — do not infer from variable names.

### Secrets handling
- No secrets involved in audit tasks; do not read `.env` files or connection strings.

### Rollback / fallback
- If a file cannot be read (permissions, encoding), note it in the audit findings and proceed.
- If `TASK.md` acceptance criteria count differs from 11, recount before recording — document the discrepancy.

### Architecture boundary rules
- Do not cross into `nextjs-ai-optimized-codebase` for this audit — E0-S1 scope is strictly `nextjs-feature-flag-exercise`.
- Do not recommend migrating SQL.js to PostgreSQL, Vitest to Jest, or any other stack change within this story.
- Do not create any implementation files (no `FlagFilters` type, no `getFilteredFlags` stub) — that belongs to EPIC-1.

---

## 5) Validation evidence

### BDD verification

**Given** the codebase audit is complete,  
**When** I review the audit notes produced in this task,  
**Then** the following are all present: layer map with 8 key files, `getAllFlags()` signature and SQL, workshop marker line number in routes, both SQL.js patterns documented, 6-row gap analysis table, `_resetDbForTesting()` usage confirmed, R1–R4 risks with mitigations, and 11 TASK.md ACs copied verbatim.

**Given** `routes/flags.ts` is read,  
**When** I search for the workshop marker comment,
**Then** the workshop marker comment is found at a specific line and its context confirms it marks the filtering insertion point.

**Given** `services/flags.ts` is read,  
**When** I inspect `getAllFlags()`,  
**Then** it takes no parameters and executes `SELECT * FROM flags ORDER BY created_at DESC`.

### Key readings checklist

- [x] `shared/types.ts` — all interfaces recorded
- [x] `server/src/db/client.ts` — `getDb`, `saveDb`, `_resetDbForTesting` confirmed
- [x] `server/src/db/schema.ts` — `CREATE TABLE` DDL recorded verbatim
- [x] `server/src/middleware/validation.ts` — Zod schemas recorded
- [x] `server/src/middleware/error.ts` — error classes and HTTP codes recorded
- [x] `server/src/services/flags.ts` — all 6 functions mapped
- [x] `server/src/routes/flags.ts` — 5 handlers mapped; workshop marker line recorded
- [x] `server/src/__tests__/flags.test.ts` — `_resetDbForTesting` usage confirmed
- [x] `client/src/api/flags.ts` — fetch wrappers mapped
- [x] `client/src/App.tsx` — `useQuery`/`useMutation` hooks mapped
- [x] `client/src/components/flags-table.tsx` — props recorded
- [x] `client/src/components/flag-form-modal.tsx` — props recorded
- [x] `TASK.md` — all 11 ACs copied verbatim
- [x] `AGENTS.md` — architecture guide read

---

## 6) Definition of Done

- [x] All 14 source files read and mapped (see checklist above).
- [x] `getAllFlags()` SQL documented verbatim.
- [x] Workshop marker comment line number recorded in `routes/flags.ts`.
- [x] SQL.js Patterns A, B, and C documented.
- [x] `_resetDbForTesting()` call confirmed in `flags.test.ts`.
- [x] All 5 filterable `FeatureFlag` fields confirmed: `environment`, `enabled`, `type`, `owner`, `name`.
- [x] 6-row filtering gap analysis table complete.
- [x] Risk register contains R1–R4 with mitigations.
- [x] All 11 TASK.md acceptance criteria copied verbatim into audit notes.
- [x] No changes made to any file in `nextjs-feature-flag-exercise`.
- [x] `## 7) Audit Findings` section appended to this task file with all structured outputs.
- [x] Committed and pushed to `exercise-1`.

---

## 7) Audit Findings

> Produced: 2026-04-14 12:59:00 -03. Read-only — no source files were modified.

---

### 7.1 — Shared Type Contract (`shared/types.ts`)

**`FeatureFlag` interface — all fields:**

| Field | TypeScript type | Filterable | Notes |
|---|---|---|---|
| `id` | `string` (readonly) | — | UUID |
| `name` | `string` | ✅ partial/case-insensitive | |
| `description` | `string` | — | |
| `enabled` | `boolean` | ✅ as `status` | Stored as `INTEGER 0/1` in SQL |
| `environment` | `Environment` | ✅ | `'development' \| 'staging' \| 'production'` |
| `type` | `FlagType` | ✅ | `'release' \| 'experiment' \| 'operational' \| 'permission'` |
| `rolloutPercentage` | `number` | — | |
| `owner` | `string` | ✅ exact match | |
| `tags` | `string[]` | — | Stored as JSON string in DB |
| `createdAt` | `string` (readonly) | — | ISO timestamp |
| `updatedAt` | `string` | — | |
| `expiresAt` | `string \| null` | — | |
| `lastEvaluatedAt` | `string \| null` | — | |

**`Environment`:** `'development' | 'staging' | 'production'`  
**`FlagType`:** `'release' | 'experiment' | 'operational' | 'permission'`

**`CreateFlagInput`:** `name, description, enabled, environment, type, rolloutPercentage, owner, tags, expiresAt?`  
**`UpdateFlagInput`:** all fields from `CreateFlagInput` as `Partial`  
**`ApiError`:** `{ error: string; message: string; statusCode: number }`

**No `FlagFilters` interface exists** — must be added in EPIC-1.

---

### 7.2 — Server Layer Map

#### Database layer (`server/src/db/`)

**`schema.ts` — `CREATE TABLE` DDL (verbatim):**
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
- `enabled` is `INTEGER` (0/1) — **boolean conversion required in filter**.
- `tags` is `TEXT` (JSON string) — parsed by `rowToFlag()`.
- Column `rollout_percentage` maps to TS field `rolloutPercentage` (snake_case → camelCase).

**`client.ts` — exported functions:**
- `getDb(): Promise<Database>` — lazy-init singleton; loads from `flags.db` file or creates new.
- `saveDb(): void` — persists in-memory DB to `flags.db`.
- `closeDb(): void` — saves and frees DB.
- `_resetDbForTesting(testDb: Database | null): void` — injects or clears the test DB reference.

#### Middleware layer (`server/src/middleware/`)

**`validation.ts` — Zod schemas:**
```typescript
createFlagSchema: z.object({
  name: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().min(1),
  enabled: z.boolean(),
  environment: z.enum(['development', 'staging', 'production']),
  type: z.enum(['release', 'experiment', 'operational', 'permission']),
  rolloutPercentage: z.number().min(0).max(100),
  owner: z.string().min(1),
  tags: z.array(z.string()),
  expiresAt: z.string().datetime().nullable().optional(),
})
updateFlagSchema: createFlagSchema.partial()
```
**No query param filter schema exists** — must be added in EPIC-1.

**`error.ts` — error classes:**

| Class | HTTP status | `error` code |
|---|---|---|
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| `ValidationError` | 400 | `VALIDATION_ERROR` |

All extend `AppError`. ZodError caught by `errorHandler` middleware → 400.

#### Services layer (`server/src/services/flags.ts`)

| Function | Signature | SQL pattern | SQL (verbatim or summary) |
|---|---|---|---|
| `getAllFlags` | `(): Promise<FeatureFlag[]>` | `db.exec` (Pattern A) | `SELECT * FROM flags ORDER BY created_at DESC` |
| `getFlagById` | `(id: string): Promise<FeatureFlag \| null>` | `db.prepare` (Pattern B) | `SELECT * FROM flags WHERE id = ?` |
| `getFlagByName` | `(name: string): Promise<FeatureFlag \| null>` | `db.prepare` (Pattern B) | `SELECT * FROM flags WHERE name = ?` |
| `createFlag` | `(input: CreateFlagInput): Promise<FeatureFlag>` | `db.prepare` (Pattern B) | `INSERT INTO flags (...) VALUES (?, ...)` |
| `updateFlag` | `(id: string, input: UpdateFlagInput): Promise<FeatureFlag>` | `db.prepare` dynamic | Dynamic `SET col = ?` assembled via array push |
| `deleteFlag` | `(id: string): Promise<void>` | `db.prepare` (Pattern B) | `DELETE FROM flags WHERE id = ?` |

**`getAllFlags()` exact SQL:** `SELECT * FROM flags ORDER BY created_at DESC`  
**No Workshop marker** found in `services/flags.ts`.

#### Routes layer (`server/src/routes/flags.ts`)

**Workshop marker — line 9 (verbatim):**
```
// Workshop: Add query params for filtering
// e.g., ?environment=production&enabled=true&type=release
```
> Source: `routes/flags.ts:9` — the comment in the actual file uses a Workshop marker prefix (`//` followed by the workshop tag and a colon).

**5 route handlers:**

| Method | Path | Service call | Notes |
|---|---|---|---|
| `GET` | `/` | `getAllFlags()` | **Filtering insertion point** — line 9 comment |
| `GET` | `/:id` | `getFlagById(req.params.id)` | Throws `NotFoundError` if null |
| `POST` | `/` | `createFlag(input)` | `createFlagSchema.parse(req.body)` |
| `PUT` | `/:id` | `updateFlag(req.params.id, input)` | `updateFlagSchema.parse(req.body)` |
| `DELETE` | `/:id` | `deleteFlag(req.params.id)` | |

All handlers use `next(error)` for error propagation.

---

### 7.3 — Client Layer Map

**`client/src/api/flags.ts`:**

| Function | Endpoint | Query params | Notes |
|---|---|---|---|
| `getFlags()` | `GET /api/flags` | ❌ none | **Must add `URLSearchParams` in EPIC-1** |
| `getFlag(id)` | `GET /api/flags/:id` | — | |
| `createFlag(input)` | `POST /api/flags` | — | |
| `updateFlag(id, input)` | `PUT /api/flags/:id` | — | |
| `deleteFlag(id)` | `DELETE /api/flags/:id` | — | |

API base URL: `http://localhost:3001/api` (hardcoded).

**`client/src/App.tsx`:**
- `useQuery({ queryKey: ['flags'], queryFn: getFlags })` — **no filter params in queryKey or queryFn**.
- `useMutation` calls: `createFlag`, `updateFlag`, `deleteFlag`.
- All mutations invalidate `['flags']` on success.
- **No filter `useState`** — no `filterState`, no `clearFilters`, no active-filter indicator.

**`client/src/components/flags-table.tsx`:**
- Props: `{ flags: FeatureFlag[], onEdit: (flag) => void, onDelete: (flag) => void }`
- No filter UI. No active-filter badge. No clear button.

**`client/src/components/flag-form-modal.tsx`:**
- Props: `{ open, onOpenChange, flag?, onSubmit, isLoading? }`
- Create/Edit modal — no filtering relevance.

---

### 7.4 — SQL.js Constraint Table

| Constraint | SQL Impact | Code Mitigation |
|---|---|---|
| **Booleans stored as INTEGER** | `enabled` = `0` or `1`; filter `enabled=true` must use `WHERE enabled = 1` | In service: `enabled === 'true' ? 1 : 0` before `stmt.bind()` |
| **No native parameterized arrays** | Cannot pass `['development','staging']` to a single `?`; multi-value IN queries require dynamic SQL | Build `WHERE environment IN (?,?,?)` via `Array(n).fill('?').join(',')` |
| **Statement lifecycle (`stmt.free()`)** | Memory leak if `stmt.free()` not called, especially under concurrent requests | Always use `try { ... } finally { stmt.free() }` — verified in all existing Pattern B queries |
| **Case-insensitive LIKE** | SQLite LIKE is case-sensitive for non-ASCII; `name LIKE '%flag%'` misses `FLAG` | Use `LOWER(name) LIKE LOWER(?)` with `%` wildcards |
| **`db.exec()` vs `db.prepare()`** | `db.exec()` does NOT support bound parameters — safe only for static queries | `getAllFlags` uses `db.exec()` which is safe. EPIC-1 filtering MUST use `db.prepare()` (Pattern C) |

---

### 7.5 — SQL.js Query Patterns

**Pattern A — Parameterless bulk read (current `getAllFlags`):**
```typescript
const result = db.exec('SELECT * FROM flags ORDER BY created_at DESC')
return resultToRows(result).map(rowToFlag)
```
Safe for static queries, but cannot accept bound values.

**Pattern B — Parameterized single-row read (current `getFlagById`, `getFlagByName`):**
```typescript
const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')
try {
  stmt.bind([id])
  if (stmt.step()) return rowToFlag(stmt.getAsObject() as unknown as DbRow)
  return null  // service returns null; route throws NotFoundError
} finally {
  stmt.free()
}
```

**Pattern C — Parameterized filtered bulk read (to implement in EPIC-1):**
```typescript
const stmt = db.prepare(`SELECT * FROM flags WHERE ${clause} ORDER BY created_at DESC`)
try {
  stmt.bind(values)
  const rows: FeatureFlag[] = []
  while (stmt.step()) rows.push(rowToFlag(stmt.getAsObject() as unknown as DbRow))
  return rows
} finally {
  stmt.free()
}
```
Where `clause` is built by pushing conditions + params into arrays (`conditions.push('enabled = ?'); values.push(1)`) and joining with `AND`.

---

### 7.6 — Test Isolation Pattern

**`server/src/__tests__/flags.test.ts`:**

```typescript
// Imports
import initSqlJs, { Database } from 'sql.js'
import { createTables } from '../db/schema.js'
import { _resetDbForTesting } from '../db/client.js'

let db: Database

beforeEach(async () => {
  const SQL = await initSqlJs()
  db = new SQL.Database()
  createTables(db)           // ← creates schema FIRST
  _resetDbForTesting(db)     // ← injects fresh DB into service layer
})

afterEach(() => {
  _resetDbForTesting(null)   // ← de-references test DB
  db.close()                 // ← frees memory AFTER de-reference
})
```

- **16 `it()` blocks** across 6 `describe` groups: `getAllFlags` (2), `createFlag` (4), `getFlagById` (2), `getFlagByName` (2), `updateFlag` (4), `deleteFlag` (2).
- Tests do **not** use seed data — they insert their own fixtures via `createFlag(validFlagInput)`.
- **EPIC-1 filter tests** must replicate this exact `beforeEach`/`afterEach` pattern and insert specific fixture data covering multiple environments, types, owners, and enabled states to validate filter combinations.

---

### 7.7 — Filtering Gap Analysis Table

| Layer | File | Current state | Required change for EPIC-1 |
|---|---|---|---|
| Shared types | `shared/types.ts` | No filter interface | Add `FlagFilters` with 5 optional fields |
| Server validation | `server/src/middleware/validation.ts` | No query param schema | Add `flagsQuerySchema`: `environment?`, `status?`, `type?`, `owner?`, `name?` |
| Server service | `server/src/services/flags.ts` | `getAllFlags()` — no params | Add `getFilteredFlags(filters: FlagFilters): Promise<FeatureFlag[]>` using Pattern C |
| Server routes | `server/src/routes/flags.ts` | Calls `getAllFlags()` at line 9 (Workshop marker) | Parse `req.query`, validate with `flagsQuerySchema`, pass to `getFilteredFlags()` |
| Client API | `client/src/api/flags.ts` | `getFlags()` — no query params | Accept `FlagFilters` param; append `URLSearchParams` to fetch URL |
| Client UI | `client/src/App.tsx` | No filter state or UI | Add `filterState: FlagFilters`, include in `queryKey`, add filter bar + clear action + active-filter indicator |

---

### 7.8 — Risk Register

| ID | Description | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Dynamic SQL injection** if WHERE clause is built via string interpolation | Low | Critical | Enforce Pattern C: build clause from `conditions[]`/`values[]` arrays; all user values go through `stmt.bind()` — never interpolated into the SQL string |
| R2 | **Client state sync**: stale TanStack Query cache when filters change | High | Medium | Include `filterState` in `queryKey` — e.g., `['flags', filters]` — so React Query refetches on every filter change |
| R3 | **Test isolation**: filter combination tests may leak state between cases | Medium | Medium | Replicate exact `beforeEach(createTables + _resetDbForTesting)` / `afterEach(_resetDbForTesting(null) + db.close())` — insert own fixture data per test, never rely on seed |
| R4 | **Boolean conversion**: `enabled` arrives as string `'true'`/'false'` from query param | High | High | Service layer converts: `filters.status === 'enabled' ? 1 : 0` before binding; Zod schema validates `status` as `z.enum(['enabled','disabled']).optional()` |

---

### 7.9 — TASK.md Acceptance Criteria (verbatim)

11 ACs total. 7 server-side, 4 client UI:

| # | AC (verbatim from TASK.md) | Layer |
|---|---|---|
| 1 | Users can filter flags by environment (development, staging, production) | Server + Client |
| 2 | Users can filter flags by status (enabled/disabled) | Server + Client |
| 3 | Users can filter flags by type (release, experiment, operational, permission) | Server + Client |
| 4 | Users can filter flags by owner | Server + Client |
| 5 | Users can search flags by name (partial match) | Server + Client |
| 6 | Filtering should happen in the backend | Server |
| 7 | Multiple filters can be applied simultaneously (e.g., "all enabled release flags in production") | Server (AND semantics) |
| 8 | Filters persist while using other features (creating, editing, deleting flags) | Client state |
| 9 | There is a way to clear all filters and return to the full list | Client UI |
| 10 | The UI clearly indicates when filters are active | Client UI |
| 11 | Filtering should feel responsive, even as the number of flags grows | Server (backend filtering) |

**AND semantics confirmed** by AC-7 example: all three conditions active simultaneously.
