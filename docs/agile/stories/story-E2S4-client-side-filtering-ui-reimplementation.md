# Story E2-S4 — Client-side filtering UI re-implementation (PIV Loop)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S4 |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | Claude Code (`/implement` continuation) |
| **Skills** | Workshop commands: `implement.md`, `validate.md`, `review.md` |
| **Instructions** | `CLAUDE.md`, `coding-agent.instructions.md` |
| **Depends on** | E2-S3 |
| **Blocks** | E2-S5 |
| Created at | 2026-04-16 02:31:41 -03 |
| Last updated | 2026-04-16 02:31:41 -03 |

---

## 1) User story

**As a** software engineer using the PIV Loop,
**I want** the client-side filtering UI re-implemented,
**so that** users can visually filter flags by all criteria — with per-task build validation after each UI change.

---

## 2) Scope

### In scope

1. Update `client/src/api/flags.ts` to serialize filter params.
2. Add filter state management in `client/src/App.tsx`.
3. Create/update filter controls component (`flags-filter-controls.tsx`).
4. Implement "clear all filters" action.
5. Add active-filter indicator to the UI.
6. Ensure filter state persists across mutations (create/edit/delete).
7. Execute `/validate` — full client+server validation suite.

### Out of scope

1. Server-side filtering logic (already done in E2-S3).
2. AI Layer preparation (already done in E2-S1).
3. Metrics capture and closure (belongs to E2-S5).

---

## 3) Acceptance criteria

### AC-1 — Client API serializes filter params

- **Given** the user applies filters in the UI
- **When** the API client constructs the request
- **Then** filter params are serialized as query parameters in the `GET /api/flags` request

### AC-2 — Filter state management works

- **Given** `App.tsx` manages filter state
- **When** filters are changed
- **Then** `queryKey` includes filter state so TanStack Query re-fetches; state updates trigger re-renders

### AC-3 — Filter controls component exists

- **Given** users need visual controls for filtering
- **When** the filter controls component renders
- **Then** it provides controls for environment, status, type, owner, and name search; uses Radix UI primitives and `cn()` for styling

### AC-4 — Clear all filters action

- **Given** one or more filters are active
- **When** the user clicks "Clear all filters"
- **Then** all filters reset to their default (empty) values; the flag list shows all flags

### AC-5 — Active filter indicator

- **Given** at least one filter is active
- **When** the UI renders
- **Then** a visible indicator shows that filters are active (badge, highlight, or text)

### AC-6 — Filter persistence across mutations

- **Given** filters are active
- **When** the user creates, edits, or deletes a flag
- **Then** the active filters persist; the flag list refreshes with the mutation result and current filters applied

### AC-7 — Full validation suite passes

- **Given** all client-side changes are complete
- **When** `pnpm run build && pnpm run lint` runs for client and `pnpm run build && pnpm run lint && pnpm test` for server
- **Then** zero errors

---

## 4) Tasks

> **PIV Loop execution note:** No separate agile task files are generated for this story. This story is a continuation of the `/implement` execution started in E2-S3, working from the same plan.md artifact.

**Key tasks (guidance — actual execution driven by plan.md):**
1. Update `client/src/api/flags.ts` → `pnpm run build`.
2. Add filter state management in `client/src/App.tsx` → `pnpm run build`.
3. Create/update filter controls component → `pnpm run build`.
4. Implement "clear all filters" → `pnpm run build`.
5. Add active-filter indicator → `pnpm run build`.
6. Ensure filter persistence across mutations → `pnpm run build`.
7. Execute `/validate` — full client+server validation suite.

**Manual checkpoint:** test full UI flow in browser — all 11 TASK.md ACs verified.

---
