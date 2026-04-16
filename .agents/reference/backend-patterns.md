# Backend Patterns — On-Demand Context

> Load this document when you need deep understanding of server-side patterns.
> All file:line references are from the `server/` and `shared/` directories.

---

## 1. Express v5 Route Pattern

**File:** `server/src/routes/flags.ts`

Routes are thin handlers that delegate to services and propagate errors via `next(error)`.

### Router setup (line 7)

```typescript
export const flagsRouter = Router()
```

### GET handler with filter middleware (lines 10-18)

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

**Pattern:** `validateFlagFilters` middleware runs first (validates query params with Zod), stores validated filters in `res.locals.filters`, then the handler reads them.

### POST handler with inline Zod parsing (lines 34-43)

```typescript
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

**Pattern:** Zod `.parse()` at route boundary, before service call. If parse fails, `ZodError` is thrown and caught by the centralized `errorHandler`.

### Key rules

- **Always** use `try/catch` + `next(error)` — never `res.status(code).json(...)` for errors
- Validation happens at route boundary (Zod parse or middleware)
- Routes import from services, never from db/ directly
- File uses `.js` import extensions for ESM: `'../services/flags.js'`

### App wiring (`server/src/index.ts`, lines 14-22)

```typescript
app.use(cors())
app.use(express.json())
app.use('/api/flags', flagsRouter)
app.use(errorHandler)
```

**Order matters:** routes registered before `errorHandler` so errors propagate to it.

---

## 2. Service Layer Pattern

**File:** `server/src/services/flags.ts`

Services contain business logic and SQL.js queries. They throw custom errors.

### getAllFlags with dynamic filtering (lines 73-107)

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
  // ... type, owner filters follow same pattern

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

**Key patterns:**
- Dynamic WHERE built from conditions array + params array (safe parameterization)
- LIKE search with `ESCAPE '\\'` and user input escaping (`replace(/[\\%_]/g, '\\$&')`)
- `stmt.free()` in `finally` block — always

### getFlagById — single row query (lines 109-124)

```typescript
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

### createFlag — conflict check + insert (lines 140-177)

```typescript
export async function createFlag(input: CreateFlagInput): Promise<FeatureFlag> {
  const existing = await getFlagByName(input.name)
  if (existing) {
    throw new ConflictError(`Flag with name '${input.name}' already exists`)
  }
  const db = await getDb()
  const id = uuidv4()
  const now = new Date().toISOString()

  const stmt = db.prepare(`INSERT INTO flags (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  try {
    stmt.run([id, input.name, ..., input.enabled ? 1 : 0, ..., JSON.stringify(input.tags), ...])
  } finally {
    stmt.free()
  }
  saveDb()
  // ...
}
```

**Pattern:** Check for conflict first → throw `ConflictError` if exists → insert → `saveDb()` to persist to disk.

### rowToFlag — DB→TypeScript mapper (lines 35-69)

```typescript
function rowToFlag(row: DbRow): FeatureFlag {
  if (!isEnvironment(row.environment)) {
    throw new Error(`Invalid environment value in database: ${row.environment}`)
  }
  if (!isFlagType(row.type)) {
    throw new Error(`Invalid flag type value in database: ${row.type}`)
  }
  let tags: string[]
  try {
    const parsed = JSON.parse(row.tags)
    tags = parsed
  } catch (error) { /* ... */ }

  return {
    id: row.id,
    enabled: row.enabled === 1,   // INTEGER → boolean
    tags,                          // JSON string → array
    rolloutPercentage: row.rollout_percentage,  // snake_case → camelCase
    // ...
  }
}
```

**Critical conversions in rowToFlag:**
- `row.enabled === 1` → `boolean` (line 65)
- `JSON.parse(row.tags)` → `string[]` (lines 50-57)
- `row.rollout_percentage` → `rolloutPercentage` (snake_case → camelCase, line 67)
- Enum validation for `environment` and `type` (lines 37-43)

---

## 3. Zod Validation Pattern

**File:** `server/src/middleware/validation.ts`

### Schema definitions (lines 8-21)

```typescript
export const createFlagSchema = z.object({
  name: z.string().min(1, 'Name is required')
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1, 'Description is required'),
  enabled: z.boolean(),
  environment: z.enum(environmentValues),
  type: z.enum(flagTypeValues),
  rolloutPercentage: z.number().min(0).max(100),
  owner: z.string().min(1, 'Owner is required'),
  tags: z.array(z.string()),
  expiresAt: z.string().datetime().nullable().optional(),
})

export const updateFlagSchema = createFlagSchema.partial()
```

### Filter query schema (lines 23-29)

```typescript
export const flagFilterQuerySchema = z.object({
  environment: z.enum(environmentValues).optional(),
  status: z.enum(['enabled', 'disabled']).optional(),
  type: z.enum(flagTypeValues).optional(),
  owner: z.string().optional(),
  name: z.string().optional(),
})
```

### Middleware function (lines 31-38)

```typescript
export function validateFlagFilters(req: Request, res: Response, next: NextFunction): void {
  try {
    res.locals.filters = flagFilterQuerySchema.parse(req.query)
    next()
  } catch (error) {
    next(error)
  }
}
```

**Two validation styles:**
1. **Middleware** (`validateFlagFilters`) — validates query params, stores result in `res.locals`
2. **Inline** (`createFlagSchema.parse(req.body)`) — validates body directly in route handler

Both throw `ZodError` on failure, caught by the centralized `errorHandler`.

---

## 4. Error Handling Chain

**File:** `server/src/middleware/error.ts`

### Error class hierarchy (lines 4-35)

```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly error: string,
    message: string
  ) { super(message) }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, 'CONFLICT', message)
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(400, 'VALIDATION_ERROR', message)
  }
}
```

### Error handler middleware (lines 38-63)

```typescript
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    res.status(400).json({ error: 'VALIDATION_ERROR', message: messages, statusCode: 400 })
    return
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
      statusCode: err.statusCode,
    })
    return
  }
  // Unknown errors → generic 500 (no internal details leaked)
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  })
}
```

**Error flow:** Service throws → route catches → `next(error)` → `errorHandler` → JSON response.

**Response shape** (always consistent):
```json
{ "error": "NOT_FOUND", "message": "Flag with id 'x' not found", "statusCode": 404 }
```

---

## 5. Database Initialization

### Client (`server/src/db/client.ts`)

- `getDb()` (line 12) — async singleton, initializes SQL.js on first call
- Loads from `flags.db` file if exists (line 28), else creates in-memory + seeds (lines 35-38)
- `saveDb()` (line 56) — exports WASM DB to file buffer, writes to disk
- `_resetDbForTesting()` (line 82) — injects in-memory DB for test isolation

### Schema (`server/src/db/schema.ts`)

```typescript
export const createTables = (db: Database): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS flags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,    -- boolean as 0/1
      environment TEXT NOT NULL,
      type TEXT NOT NULL,
      rollout_percentage INTEGER NOT NULL DEFAULT 100,
      owner TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',        -- JSON string
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT,
      last_evaluated_at TEXT
    )
  `)
}
```

**Column notes:**
- `enabled` is `INTEGER` not `BOOLEAN` — SQLite has no boolean type
- `tags` is `TEXT` with JSON array string — no ARRAY type in SQLite
- `rollout_percentage` uses snake_case — converted to camelCase by `rowToFlag()`
- All timestamps are `TEXT` with ISO 8601 strings

### Seed (`server/src/db/seed.ts`)

- `MOCK_FLAGS` array (lines 4-41) — 20 flags across 3 environments, 4 types, multiple owners
- `isSeeded()` (line 43) — checks `COUNT(*)` to avoid re-seeding
- `seedFlags()` (line 48) — uses prepared statement in a loop, converts booleans and tags
