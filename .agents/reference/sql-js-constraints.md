# SQL.js Constraints — On-Demand Context

> Load this document when working with database operations in this project.
> SQL.js is NOT like node-sqlite3, better-sqlite3, or any ORM.
> All file:line references are from `server/src/`.

---

## 1. Why SQL.js Is Different

SQL.js compiles SQLite to WebAssembly and runs entirely in process memory. There is:

- **No native binary** — no C bindings, no system SQLite installation
- **Synchronous query API** — despite `getDb()` being async (only WASM init is async)
- **No `.all()` or `.get()` methods** — you iterate with `step()` + `getAsObject()`
- **No connection pool** — a single `Database` instance
- **In-process persistence** — `db.export()` returns a `Uint8Array` that you write to disk

**Reference:** `server/src/db/client.ts`, lines 22-52 (initialization with SQL.js)

---

## 2. Statement Lifecycle (Critical)

Every `db.prepare()` allocates WASM memory. **You must call `stmt.free()` in a `finally` block or you leak memory.**

### Correct pattern (from `services/flags.ts`, lines 99-107)

```typescript
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
  stmt.free()   // <-- Always in `finally`
}
```

### Wrong patterns — never do these

```typescript
// ❌ No finally — stmt leaked if error thrown during iteration
const stmt = db.prepare(sql)
stmt.bind(params)
while (stmt.step()) { /* ... */ }
stmt.free()

// ❌ Using db.exec() for SELECT — no parameter binding possible
const rows = db.exec('SELECT * FROM flags WHERE name = ' + name)  // SQL injection!
```

### Statement API summary

| Method | Purpose | Notes |
|---|---|---|
| `db.prepare(sql)` | Create prepared statement | Returns `Statement` object |
| `stmt.bind(params)` | Bind parameters | Array of values: `[val1, val2]` |
| `stmt.step()` | Advance to next row | Returns `true` if row available, `false` at end |
| `stmt.getAsObject()` | Get current row as object | Column names as keys |
| `stmt.run(params)` | Bind + execute non-SELECT | For INSERT, UPDATE, DELETE |
| `stmt.free()` | Release WASM memory | **Mandatory** in `finally` block |
| `db.exec(sql)` | Execute raw SQL | **No parameter binding** — DDL only |

---

## 3. Parameterized Queries

Always use `db.prepare()` + `stmt.bind()` for any query with user input.

### Correct — parameterized (from `services/flags.ts`, line 111)

```typescript
const stmt = db.prepare('SELECT * FROM flags WHERE id = ?')
try {
  stmt.bind([id])
  if (stmt.step()) {
    return stmt.getAsObject() as unknown as DbRow
  }
  return null
} finally {
  stmt.free()
}
```

### Wrong — string interpolation

```typescript
// ❌ SQL injection vulnerability
db.prepare(`SELECT * FROM flags WHERE id = '${id}'`)
```

### Using `stmt.run()` for writes (from `services/flags.ts`, lines 157-163)

```typescript
const stmt = db.prepare(`INSERT INTO flags (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
try {
  stmt.run([id, input.name, input.description, input.enabled ? 1 : 0, ...])
} finally {
  stmt.free()
}
```

`stmt.run()` combines `bind()` + `step()` + `reset()` in one call — use for INSERT/UPDATE/DELETE.

---

## 4. Boolean Handling

SQLite has **no boolean type**. Booleans are stored as `INTEGER 0/1`.

### Schema (`db/schema.ts`, line 9)

```sql
enabled INTEGER NOT NULL DEFAULT 0
```

### Writing booleans (from `services/flags.ts`, line 160)

```typescript
input.enabled ? 1 : 0
```

### Reading booleans (from `services/flags.ts`, line 65)

```typescript
enabled: row.enabled === 1
```

### Filtering by boolean (from `services/flags.ts`, lines 82-84)

```typescript
if (filters.status !== undefined) {
  conditions.push('enabled = ?')
  params.push(filters.status === 'enabled' ? 1 : 0)
}
```

**Note:** The query param is `status` (string `'enabled'` | `'disabled'`), not `enabled` (boolean). The conversion from string to integer happens in the service layer.

---

## 5. db.exec() vs db.prepare() — When to Use Each

### db.exec(sql) — DDL only

```typescript
// ✅ Correct: schema creation (db/schema.ts, lines 4-19)
db.run(`CREATE TABLE IF NOT EXISTS flags (...)`)
```

- Returns `QueryExecResult[]` — harder to work with for data queries
- **Cannot accept bind parameters** — any user input in the SQL string is an injection risk
- Use only for DDL (CREATE TABLE, DROP TABLE, etc.) and fixed seed data

### db.prepare(sql) — All data queries

- Returns a `Statement` with parameter binding support
- **Always** use this for SELECT, INSERT, UPDATE, DELETE with user input
- Must be freed after use

---

## 6. Array/JSON Storage

SQLite has **no ARRAY type**. Tags are stored as JSON text.

### Schema (`db/schema.ts`, line 14)

```sql
tags TEXT NOT NULL DEFAULT '[]'
```

### Writing arrays (from `services/flags.ts`, line 165)

```typescript
JSON.stringify(input.tags)   // ['frontend', 'ux'] → '["frontend","ux"]'
```

### Reading arrays (from `services/flags.ts`, lines 50-57)

```typescript
let tags: string[]
try {
  const parsed = JSON.parse(row.tags)
  if (!Array.isArray(parsed)) {
    throw new Error('Tags must be an array')
  }
  tags = parsed
} catch (error) {
  throw new Error(`Invalid tags JSON in database for flag '${row.name}': ${message}`)
}
```

**Always validate the parsed result** — if the JSON is corrupt, you get a clear error instead of a runtime type mismatch.

---

## 7. Dynamic Query Building

For filtering with optional parameters, build WHERE clauses dynamically.

### Pattern (from `services/flags.ts`, lines 73-98)

```typescript
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

const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''
const sql = `SELECT * FROM flags${whereClause} ORDER BY created_at DESC`
```

**Key rules:**
1. Each filter adds a `?` placeholder to conditions and pushes the value to params
2. `conditions.join(' AND ')` combines them with `AND`
3. If no conditions, the WHERE clause is empty — returns all rows
4. **Never** interpolate filter values into the SQL string

---

## 8. LIKE Search with Escaping

Text search (name filter) uses case-insensitive `LIKE` with proper escaping.

### Implementation (from `services/flags.ts`, lines 93-96)

```typescript
if (filters.name !== undefined) {
  conditions.push("LOWER(name) LIKE ? ESCAPE '\\'")
  const escaped = filters.name.toLowerCase().replace(/[\\%_]/g, '\\$&')
  params.push('%' + escaped + '%')
}
```

**Why escaping matters:**
- `%` and `_` are LIKE wildcards — unescaped user input like `"100%_done"` would match incorrectly
- `\` is the escape character itself — must be escaped first
- `ESCAPE '\\'` tells SQLite what the escape character is
- `replace(/[\\%_]/g, '\\$&')` escapes all three special characters

**Example:** User types `"test_flag"` → escaped to `"test\\_flag"` → SQL: `LOWER(name) LIKE '%test\_flag%' ESCAPE '\'`

---

## 9. Database Persistence

### Save flow (`db/client.ts`, lines 56-65)

```typescript
export function saveDb(): void {
  if (!db) throw new Error('Cannot save database: database not initialized')
  const data = db.export()          // Returns Uint8Array
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer) // Writes to flags.db
}
```

- `saveDb()` is called after every mutation (create, update, delete) in the service layer
- If the server crashes before `saveDb()`, changes are lost (in-memory only)
- `DB_PATH` is `flags.db` in the working directory (`server/src/db/client.ts`, line 7)

### Load flow (`db/client.ts`, lines 26-38)

```typescript
if (fs.existsSync(DB_PATH)) {
  const fileBuffer = fs.readFileSync(DB_PATH)
  db = new SQL.Database(fileBuffer)   // Load from file
} else {
  db = new SQL.Database()             // Fresh in-memory DB
  createTables(db)
  seedFlags(db)
  saveDb()
}
```

---

## 10. Test Isolation

### Reset helper (`db/client.ts`, lines 80-88)

```typescript
export function _resetDbForTesting(testDb: Database | null = null): void {
  if (db && db !== testDb) {
    db.close()
  }
  db = testDb
  initPromise = testDb ? Promise.resolve(testDb) : null
}
```

### Test lifecycle (from `__tests__/flags.test.ts`)

```typescript
let db: Database

beforeEach(async () => {
  const SQL = await initSqlJs()
  db = new SQL.Database()       // Fresh in-memory DB per test
  createTables(db)
  _resetDbForTesting(db)        // Inject into singleton
})

afterEach(() => {
  _resetDbForTesting(null)      // Clear singleton
  db.close()                    // Free WASM memory
})
```

**Pattern:** Each test gets a completely fresh database. No test can affect another. The `_resetDbForTesting()` function replaces the production singleton with the test-specific instance.

---

## 11. Common Mistakes

| Mistake | Consequence | Fix |
|---|---|---|
| Forgetting `stmt.free()` | WASM memory leak | Always use `try/finally` |
| Using `db.exec()` with user input | SQL injection | Use `db.prepare()` + `stmt.bind()` |
| Storing `true`/`false` directly | SQLite stores as string `"true"` | Convert: `enabled ? 1 : 0` |
| Not escaping LIKE wildcards | Incorrect search results | `replace(/[\\%_]/g, '\\$&')` |
| Calling `.all()` or `.get()` | These methods don't exist in SQL.js | Use `while (stmt.step())` loop |
| Not closing test DB in afterEach | Memory leak across tests | `db.close()` in `afterEach` |
| Using `db.exec()` for SELECT values | Returns `QueryExecResult[]`, no params | Use `db.prepare()` instead |
| Not calling `saveDb()` after mutation | Data lost on restart | Call after every create/update/delete |
