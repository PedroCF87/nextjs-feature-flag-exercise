# Task E1-S2-T4 — Update GET /api/flags route handler

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S2-T4 |
| **Story** | [E1-S2 — Server-side filtering implementation](../stories/story-E1S2-server-side-filtering-implementation.md) |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `task-implementer` |
| **Depends on** | E1-S2-T3 |
| **Blocks** | — |
| Created at | 2026-04-14 22:21:37 -03 |
| Last updated | 2026-04-15 18:17:59 -03 |

---

## 1) Task statement

As a `task-implementer`, I want to update the `GET /api/flags` route handler to extract validated filter params from `req.query` and forward them to `FlagsService.getAll()` so that the full server filtering pipeline is connected end to end.

---

## 2) Verifiable expected outcome

- `server/src/routes/flags.ts` GET handler extracts filter params and calls `FlagsService.getAll(filterParams)`.
- All errors are propagated via `next(error)`.
- `pnpm run build && pnpm run lint && pnpm test` exit 0.

---

## 3) Detailed execution plan

**Goal:** update the `GET /api/flags` route handler to extract validated filter params from `req.query` and forward them to `FlagsService.getAll()`.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `server/src/routes/flags.ts` — update GET handler to extract and forward filter params

**Acceptance:** handler reads filter params after Zod validation; calls `FlagsService.getAll(filterParams)`; all errors propagated via `next(error)`; `pnpm run build && pnpm run lint && pnpm test` exit 0.

**depends_on:** E1-S2-T3

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
- Output summary: server tsc clean; server lint clean; 16 tests passed (0 failed); client build clean; client lint clean
- Files created/updated: `server/src/routes/flags.ts`
- Risks found / mitigations: `res.locals.filters` cast as `FlagFilterParams` is safe — `validateFlagFilters` always sets it or throws before the handler runs

### Given / When / Then checks

- **Given** the Zod filter middleware runs before the handler,
- **When** `GET /api/flags?environment=production&status=enabled` is called,
- **Then** the handler passes `{ environment: 'production', status: 'enabled' }` to `FlagsService.getAll()` and returns the filtered list.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved: E1-S2-T3 (Done) — `getAllFlags(filters)` accepts `FlagFilterParams`
- Downstream items unblocked: E1-S3 (client-side filtering UI) — full server pipeline is now operational end-to-end
- Open risks (if any): none
