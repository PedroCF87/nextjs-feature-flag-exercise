# Story E2-S3 — Server-side filtering re-implementation (PIV Loop)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S3 |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | Claude Code (`/plan` + `/implement`) |
| **Skills** | Workshop commands: `plan.md`, `implement.md`, `validate.md` |
| **Instructions** | `CLAUDE.md`, `coding-agent.instructions.md` |
| **Depends on** | E2-S1 |
| **Blocks** | E2-S4, E2-S5 |
| Created at | 2026-04-16 02:31:41 -03 |
| Last updated | 2026-04-16 02:31:41 -03 |

---

## 1) User story

**As a** software engineer using the PIV Loop,
**I want** the server-side filtering pipeline re-implemented,
**so that** the API supports filtering by environment, status, type, owner, and name — with per-task build validation ensuring zero broken state accumulation.

---

## 2) Scope

### In scope

1. Execute `/plan` from the PRD — generate `.agents/plans/feature-flag-filtering.plan.md`.
2. Extend `shared/types.ts` with `FlagFilterParams` type.
3. Add Zod filter query schema to `server/src/middleware/validation.ts`.
4. Implement server-side filtering in `server/src/services/flags.ts`.
5. Update `server/src/routes/flags.ts` to extract and forward filter params.
6. Add server-side filtering test cases to `server/src/__tests__/flags.test.ts`.
7. Execute `/validate` — full server validation suite.

### Out of scope

1. Client-side filtering UI (belongs to E2-S4).
2. AI Layer preparation (already done in E2-S1).
3. Metrics capture and closure (belongs to E2-S5).

---

## 3) Acceptance criteria

### AC-1 — Implementation plan generated

- **Given** the PRD exists at `.agents/PRDs/feature-flag-filtering-e2.prd.md`
- **When** `/plan` is executed
- **Then** `.agents/plans/feature-flag-filtering.plan.md` is created with ordered tasks, validation checkpoints, and references to on-demand context docs

### AC-2 — FlagFilterParams type defined

- **Given** `shared/types.ts` is the single source of truth
- **When** `FlagFilterParams` is added
- **Then** it covers `environment`, `status`, `type`, `owner`, `name`; all optional; server and client import from `@shared/types`

### AC-3 — Zod schema validates filter query params

- **Given** a `GET /api/flags` request with query parameters
- **When** the validation middleware runs
- **Then** valid params are parsed; invalid values return 400 via `next(error)`

### AC-4 — Server-side filtering with AND logic

- **Given** multiple filter parameters are provided
- **When** the service applies them
- **Then** all active filters compose with AND logic; parameterized queries only (no string interpolation); `stmt.free()` in `try/finally`

### AC-5 — Route handler extracts and forwards filters

- **Given** validated filter params from middleware
- **When** the route handler calls the service
- **Then** filters are correctly passed; errors propagate via `next(error)`

### AC-6 — Filter tests pass

- **Given** new filter test cases exist
- **When** `pnpm test` runs
- **Then** all tests pass including new filter scenarios (single filter, combined, empty results)

### AC-7 — Server validation suite passes

- **Given** all server-side changes are complete
- **When** `pnpm run build && pnpm run lint && pnpm test` runs
- **Then** zero errors

---

## 4) Tasks

> **PIV Loop execution note:** No separate agile task files are generated for this story. The actual task breakdown, ordering, and dependencies are managed by the `/plan` command, which generates `.agents/plans/feature-flag-filtering.plan.md` from the PRD. The **plan.md artifact is the single source of truth** for implementation task management during the PIV Loop.

**Key tasks (guidance — actual execution driven by plan.md):**
1. Execute `/plan` from the PRD.
2. Extend `shared/types.ts` with `FlagFilterParams` → `pnpm run build`.
3. Add Zod filter query schema → `pnpm run build`.
4. Implement server-side filtering in service → `pnpm run build`.
5. Update route handler → `pnpm run build && pnpm test`.
6. Add filter test cases → `pnpm test`.
7. Execute `/validate` — full server validation suite.

**Manual checkpoint:** run API filtering test via curl before E2-S4.

---
