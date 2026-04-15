# Story E1-S3 — Client-side filtering UI implementation

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S3 |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `task-implementer` (local VS Code) |
| **Skills** | `execute-task-locally` |
| **Instructions** | `coding-agent.instructions.md`, `feature-flag-exercise.instructions.md` |
| **Depends on** | E1-S2 |
| **Blocks** | E1-S4 |
| Created at | 2026-04-14 21:29:36 -03 |
| Last updated | 2026-04-15 00:00:00 -03 |

---

## 1) User story

**As a** candidate executing the workshop interview exercises,
**I want to** implement the complete client-side filtering experience (API wiring → filter state → filter controls → clear action → active-filter indicator),
**so that** users can filter feature flags by environment, status, type, owner, and name from the UI, filter state persists across mutations, and all 11 TASK.md acceptance criteria are met.

---

## 2) Scope

### In scope

1. Update `client/src/api/flags.ts` to serialize `FlagFilterParams` as query string parameters in the `GET /api/flags` call.
2. Add filter state management in `client/src/App.tsx` using `useState` above the mutation scope.
3. Build filter controls (environment, status, type, owner, name search) using existing Radix UI primitives and `cn()` for class composition.
4. Implement "clear all filters" action that resets all filter fields to empty.
5. Add an active-filter indicator to the UI so users can tell when filters are applied.
6. Ensure filter state is preserved across flag creation, editing, and deletion operations.
7. Validate with `cd client && pnpm run build && pnpm run lint` (zero errors required).

### Out of scope

1. Server-side filtering logic (belongs to E1-S2).
2. Baseline metrics capture (belongs to E1-S4).
3. Pagination or sorting of the flags list.

---

## 3) Acceptance criteria

### AC-1 — API call serializes filter params

- **Given** the client calls `GET /api/flags`
- **When** filter state contains one or more active filters
- **Then** filter params are serialized as query string parameters matching the `FlagFilterParams` type from `shared/types.ts`

### AC-2 — Filter controls rendered for all dimensions

- **Given** the flags page is loaded
- **When** the user views the filter controls
- **Then** controls exist for: environment (development/staging/production), status (enabled/disabled), type (release/experiment/operational/permission), owner (text input), and name search (partial, case-insensitive)

### AC-3 — Clear all filters works

- **Given** one or more filters are active
- **When** the user clicks "clear all filters"
- **Then** all filter fields are reset to empty and the full unfiltered list is fetched

### AC-4 — Active-filter indicator visible

- **Given** one or more filters are active
- **When** the user views the UI
- **Then** a visible indicator (badge, label, or highlight) shows that filters are currently applied

### AC-5 — Filter state persists across mutations

- **Given** active filters are set
- **When** the user creates, edits, or deletes a flag
- **Then** filter state is unchanged after the mutation, and the refetched list respects the active filters

### AC-6 — All client validation commands pass

- **Given** the full implementation is in place
- **When** `cd client && pnpm run build && pnpm run lint` is run
- **Then** all commands exit with code 0 and zero errors

---

## 4) Tasks

### [Task E1-S3-T1 — Update client API to pass filter params](../tasks/task-E1S3T1-update-client-api-to-pass-filter-params.md)

**Goal:** update `client/src/api/flags.ts` to accept `FlagFilterParams` and serialize them as query string parameters in the `GET /api/flags` fetch call.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `client/src/api/flags.ts` — update `getFlags()` to accept and serialize `FlagFilterParams`

**Acceptance:** filter params are serialized correctly; empty/undefined fields are omitted from the query string; `pnpm run build` exits 0.

**depends_on:** E1-S2 completed

---

### [Task E1-S3-T2 — Add filter state management in App.tsx](../tasks/task-E1S3T2-add-filter-state-management-in-app-tsx.md)

**Goal:** add `useState<FlagFilterParams>` in `App.tsx` above the mutation scope and pass filter state to the `useQuery` call and to the filter controls component.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `client/src/App.tsx` — add filter state, thread to API call and filter controls

**Acceptance:** filter state is initialized as empty; mutations do not reset filter state; `pnpm run build` exits 0.

**depends_on:** E1-S3-T1

---

### [Task E1-S3-T3 — Build filter controls component](../tasks/task-E1S3T3-build-filter-controls-component.md)

**Goal:** create a filter controls panel component with selects/inputs for environment, status, type, owner, and name search using Radix UI primitives and `cn()` for class composition.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `client/src/components/flags-filter-controls.tsx` — new filter panel component

**Acceptance:** controls for all 5 dimensions rendered; component accepts current filter state and an `onChange` callback; `pnpm run build && pnpm run lint` exit 0.

**depends_on:** E1-S3-T2

---

### [Task E1-S3-T4 — Implement clear-all-filters and active-filter indicator](../tasks/task-E1S3T4-implement-clear-all-filters-and-active-filter-indicator.md)

**Goal:** add a "clear all filters" button that resets all filter fields, and an active-filter indicator (badge or label) that shows when at least one filter is active.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `client/src/components/flags-filter-controls.tsx` — add clear button and active-filter indicator
- `client/src/App.tsx` — wire clear handler to filter state reset

**Acceptance:** clear button resets all fields and refetches without filters; indicator is visible when any filter is active and hidden when no filters are active; `pnpm run build && pnpm run lint` exit 0.

**depends_on:** E1-S3-T3
