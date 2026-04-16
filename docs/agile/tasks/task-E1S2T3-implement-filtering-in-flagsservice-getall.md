# Task E1-S2-T3 — Implement filtering in FlagsService.getAll()

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S2-T3 |
| **Story** | [E1-S2 — Server-side filtering implementation](../stories/story-E1S2-server-side-filtering-implementation.md) |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `task-implementer` |
| **Depends on** | E1-S2-T2 |
| **Blocks** | — |
| Created at | 2026-04-14 22:21:37 -03 |
| Last updated | 2026-04-15 18:13:07 -03 |

---

## 1) Task statement

As a `task-implementer`, I want to update `FlagsService.getAll()` to accept and apply `FlagFilterParams` with parameterized SQL.js queries so that filtering is performed at the database layer with AND logic and no SQL injection risk.

---

## 2) Verifiable expected outcome

- `server/src/services/flags.ts` `getAll()` accepts `FlagFilterParams`; SQL query applies all present filters as AND conditions.
- `stmt.free()` is always called in `try/finally`.
- `pnpm test` exits 0 with all existing tests passing.

---

## 3) Detailed execution plan

**Goal:** update `FlagsService.getAll()` to accept `FlagFilterParams` and build a parameterized SQL query that applies all provided filters as AND conditions.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `server/src/services/flags.ts` — update `getAll()` signature and SQL query logic

**Acceptance:** SQL query applies AND conditions for each present filter; omitted fields are ignored; `stmt.free()` called in `try/finally`; `pnpm test` exits 0 with all existing tests passing.

**depends_on:** E1-S2-T2

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- Command(s) executed: `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint`
- Exit code(s): all 0
- Output summary: server tsc clean; server lint clean; 16 tests passed (0 failed); client vite build clean; client lint clean
- Files created/updated: `server/src/services/flags.ts`
- Risks found / mitigations: removed unused `resultToRows` helper (replaced by `stmt.step()` loop) — `noUnusedLocals: true` would have rejected it; SQL string built dynamically but never via interpolation of user values — all user values go through `stmt.bind(params)` only

### Given / When / Then checks

- **Given** `FlagFilterParams` is validated at the middleware level,
- **When** `FlagsService.getAll({ environment: 'production', status: 'enabled' })` is called,
- **Then** only flags matching both conditions are returned; omitted fields are ignored; `pnpm test` exits 0.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved: E1-S2-T2 (Done) — `flagFilterQuerySchema` and `validateFlagFilters` available
- Downstream items unblocked: E1-S2-T4 (update `GET /api/flags` route to wire `validateFlagFilters` and pass filters to `getAllFlags()`)
- Open risks (if any): none — `conditions[]` only appended with hardcoded column names; only `params[]` carry user values via `stmt.bind()`
