# Task E0-S1-T3 — Conduct Codebase Audit

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S1-T3 |
| **Story** | [E0-S1 — Repository Diagnosis and Readiness](../stories/story-E0S1-repository-diagnosis.md) |
| **Priority** | P1 |
| **Status** | Draft |
| **Responsible agent** | `project-adaptation-analyst` |
| **Depends on** | [E0-S1-T2 — Validate local execution environment](task-E0S1T2-validate-environment.md) |
| **Blocks** | E0-S1-T4 |
| Created at | 2026-04-10 17:45:54 -03 |
| Last updated | 2026-04-12 14:20:54 -03 |

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
  stmt.bind([...values])
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

- [ ] `shared/types.ts` — all interfaces recorded
- [ ] `server/src/db/client.ts` — `getDb`, `saveDb`, `_resetDbForTesting` confirmed
- [ ] `server/src/db/schema.ts` — `CREATE TABLE` DDL recorded verbatim
- [ ] `server/src/middleware/validation.ts` — Zod schemas recorded
- [ ] `server/src/middleware/error.ts` — error classes and HTTP codes recorded
- [ ] `server/src/services/flags.ts` — all 6 functions mapped
- [ ] `server/src/routes/flags.ts` — 5 handlers mapped; workshop marker line recorded
- [ ] `server/src/__tests__/flags.test.ts` — `_resetDbForTesting` usage confirmed
- [ ] `client/src/api/flags.ts` — fetch wrappers mapped
- [ ] `client/src/App.tsx` — `useQuery`/`useMutation` hooks mapped
- [ ] `client/src/components/flags-table.tsx` — props recorded
- [ ] `client/src/components/flag-form-modal.tsx` — props recorded
- [ ] `TASK.md` — all 11 ACs copied verbatim
- [ ] `AGENTS.md` — architecture guide read

---

## 6) Definition of Done

- [ ] All 14 source files read and mapped (see checklist above).
- [ ] `getAllFlags()` SQL documented verbatim.
- [ ] Workshop marker comment line number recorded in `routes/flags.ts`.
- [ ] SQL.js Patterns A, B, and C documented.
- [ ] `_resetDbForTesting()` call confirmed in `flags.test.ts`.
- [ ] All 5 filterable `FeatureFlag` fields confirmed: `environment`, `enabled`, `type`, `owner`, `name`.
- [ ] 6-row filtering gap analysis table complete.
- [ ] Risk register contains R1–R4 with mitigations.
- [ ] All 11 TASK.md acceptance criteria copied verbatim into audit notes.
- [ ] No changes made to any file in `nextjs-feature-flag-exercise`.
- [ ] `## 7) Audit Findings` section appended to this task file with all structured outputs.
- [ ] Feature branch `exercise-1/codebase-audit` pushed to fork.
- [ ] PR opened against `exercise-1` and **merged** before T4 starts.
- [ ] Timeline entry appended to `docs/agile/timeline.jsonl`.
