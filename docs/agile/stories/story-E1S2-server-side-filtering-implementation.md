# Story E1-S2 — Server-side filtering implementation

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S2 |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `task-implementer` (local VS Code) |
| **Skills** | `execute-task-locally` |
| **Instructions** | `coding-agent.instructions.md`, `feature-flag-exercise.instructions.md` |
| **Depends on** | E1-S1 |
| **Blocks** | E1-S3 |
| Created at | 2026-04-14 21:29:36 -03 |
| Last updated | 2026-04-15 00:00:00 -03 |

---

## 1) User story

**As a** candidate executing the workshop interview exercises,
**I want to** implement the complete server-side filtering pipeline (types → validation → service → route),
**so that** the `GET /api/flags` endpoint accepts and applies filter parameters with AND logic, all existing tests continue to pass, and the server build and lint emit zero errors.

---

## 2) Scope

### In scope

1. Extend `shared/types.ts` with `FlagFilterParams` type as the single source of truth for the filter contract.
2. Add a Zod filter query schema to `server/src/middleware/validation.ts`.
3. Update `FlagsService.getAll()` in `server/src/services/flags.ts` to accept and apply filter params using safe SQL.js parameterized queries.
4. Update the `GET /api/flags` route handler in `server/src/routes/flags.ts` to extract and forward filter params.
5. Validate with `pnpm run build && pnpm run lint && pnpm test` (zero errors required).

### Out of scope

1. Client-side filtering UI (belongs to E1-S3).
2. Baseline metrics capture (belongs to E1-S4).
3. Adding new test cases beyond what is needed to cover the filter logic.

---

## 3) Acceptance criteria

### AC-1 — FlagFilterParams type defined

- **Given** `shared/types.ts` is the single source of truth
- **When** `FlagFilterParams` type is added
- **Then** it covers fields: `environment`, `status`, `type`, `owner`, `name`; all fields are optional; server and client both import from `@shared/types`

### AC-2 — Zod schema validates filter query params

- **Given** a `GET /api/flags` request arrives with query parameters
- **When** the validation middleware runs
- **Then** valid filter params are parsed by the Zod schema; invalid values return a 400 error via `next(error)`

### AC-3 — Service applies filters with AND logic

- **Given** `FlagsService.getAll()` receives a `FlagFilterParams` object
- **When** multiple filter fields are present
- **Then** the SQL query applies all provided filters as AND conditions; omitted fields are ignored; SQL.js statements are freed in `try/finally`

### AC-4 — Route forwards filter params to service

- **Given** the `GET /api/flags` route handler
- **When** validated filter params are available in `req.query`
- **Then** the handler extracts them and passes them directly to `FlagsService.getAll()` using `next(error)` for any failures

### AC-5 — All validation commands pass

- **Given** the full implementation is in place
- **When** `cd server && pnpm run build && pnpm run lint && pnpm test` is run
- **Then** all commands exit with code 0 and zero errors

---

## 4) Tasks

### [Task E1-S2-T1 — Extend shared/types.ts with FlagFilterParams](../tasks/task-E1S2T1-extend-shared-types-ts-with-flagfilterparams.md)

**Goal:** add the `FlagFilterParams` type to `shared/types.ts` as the single source of truth for the filter contract, with all 5 optional fields.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `shared/types.ts` — add `FlagFilterParams` type

**Acceptance:** type exists with optional fields `environment`, `status`, `type`, `owner`, `name`; `cd server && pnpm run build` exits 0; `cd client && pnpm run build` exits 0.

**depends_on:** E1-S1 completed

---

### [Task E1-S2-T2 — Add Zod filter query schema to validation middleware](../tasks/task-E1S2T2-add-zod-filter-query-schema-to-validation-middleware.md)

**Goal:** add a Zod schema that validates the `GET /api/flags` query parameters against `FlagFilterParams`, returning 400 for invalid values via `next(error)`.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `server/src/middleware/validation.ts` — add `flagFilterQuerySchema` and `validateFlagFilter` middleware

**Acceptance:** middleware validates all filter fields; invalid enum values return 400; `pnpm run build` and `pnpm run lint` exit 0.

**depends_on:** E1-S2-T1

---

### [Task E1-S2-T3 — Implement filtering in FlagsService.getAll()](../tasks/task-E1S2T3-implement-filtering-in-flagsservice-getall.md)

**Goal:** update `FlagsService.getAll()` to accept `FlagFilterParams` and build a parameterized SQL query that applies all provided filters as AND conditions.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `server/src/services/flags.ts` — update `getAll()` signature and SQL query logic

**Acceptance:** SQL query applies AND conditions for each present filter; omitted fields are ignored; `stmt.free()` called in `try/finally`; `pnpm test` exits 0 with all existing tests passing.

**depends_on:** E1-S2-T2

---

### [Task E1-S2-T4 — Update GET /api/flags route handler](../tasks/task-E1S2T4-update-get-api-flags-route-handler.md)

**Goal:** update the `GET /api/flags` route handler to extract validated filter params from `req.query` and forward them to `FlagsService.getAll()`.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `server/src/routes/flags.ts` — update GET handler to extract and forward filter params

**Acceptance:** handler reads filter params after Zod validation; calls `FlagsService.getAll(filterParams)`; all errors propagated via `next(error)`; `pnpm run build && pnpm run lint && pnpm test` exit 0.

**depends_on:** E1-S2-T3

---

### [Task E1-S2-T5 — Add Vitest filter test cases](../tasks/task-E1S2T5-add-vitest-filter-test-cases.md)

**Goal:** extend `server/src/__tests__/flags.test.ts` with test cases covering filtering by each dimension and multi-filter AND composition.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `server/src/__tests__/flags.test.ts` — add filter test cases

**Acceptance:** at least one test per filter dimension (environment, status, type, owner, name); at least one test for multi-filter AND; `pnpm test` exits 0 with all tests passing.

**depends_on:** E1-S2-T4
