<!-- artifact_id: e1s1-implementation-analysis -->
<!-- epic_id: EPIC-1 -->
<!-- story_id: E1-S1 -->
<!-- produced_at: 2026-04-15 18:40:34 +00 -->
<!-- produced_by: project-adaptation-analyst -->

# E1-S1 Implementation Analysis — Feature Flag Filtering

---

## 1 — TASK.md Acceptance Criteria Summary

> Source: `TASK.md` — "Feature Flag Filtering"
> All 11 acceptance criteria are listed verbatim and confirmed with plain-language summaries.

| # | AC (verbatim from TASK.md) | Plain-language confirmation | Layer |
|---|---|---|---|
| AC-1 | Users can filter flags by environment (development, staging, production) | The `GET /api/flags` endpoint must accept an `environment` query parameter and return only flags matching that environment value. Valid values: `development`, `staging`, `production`. | Backend (service + route) + Client (UI + API) |
| AC-2 | Users can filter flags by status (enabled/disabled) | The endpoint must accept a `status` query parameter with values `enabled` or `disabled`. Since `enabled` is stored as INTEGER (0/1) in SQL.js, the service must convert `enabled`→`1` and `disabled`→`0` before building the SQL WHERE clause. | Backend (service + route) + Client (UI + API) |
| AC-3 | Users can filter flags by type (release, experiment, operational, permission) | The endpoint must accept a `type` query parameter and match it against the `type` column. Valid values: `release`, `experiment`, `operational`, `permission`. | Backend (service + route) + Client (UI + API) |
| AC-4 | Users can filter flags by owner | The endpoint must accept an `owner` query parameter and filter flags whose `owner` field matches exactly. | Backend (service + route) + Client (UI + API) |
| AC-5 | Users can search flags by name (partial match) | The endpoint must accept a `name` query parameter and apply a case-insensitive partial-match using `LOWER(name) LIKE ?` with the bound value including `%` wildcards (e.g., bind `%<lowercased input>%`). | Backend (service + route) + Client (UI + API) |
| AC-6 | Filtering should happen in the backend | All filter logic must reside in `server/src/services/flags.ts`. The client sends query params; the server executes the filtered SQL query. No client-side array filtering. | Backend only |
| AC-7 | Multiple filters can be applied simultaneously (e.g., "all enabled release flags in production") | The service must support AND-logic composition: when multiple query params are present, all must match. This requires dynamic SQL WHERE clause construction, combining conditions with AND. | Backend (service) |
| AC-8 | Filters persist while using other features (creating, editing, deleting flags) | Filter state in the React client must be kept in component state (or a parent component) and passed to every refetch triggered by create/edit/delete mutations. After any mutation, the flag list is refetched with the same active filter params. | Client (App.tsx / TanStack Query) |
| AC-9 | There is a way to clear all filters and return to the full list | The UI must include a "Clear all filters" action (button or link) that resets all filter fields to empty and triggers a new unfiltered fetch. | Client (UI component) |
| AC-10 | The UI clearly indicates when filters are active | When one or more filter values are non-empty, the UI must show a visible indicator (e.g., badge, highlighted filter area, or label) so the user knows filtered results are being displayed. | Client (UI component) |
| AC-11 | Filtering should feel responsive, even as the number of flags grows | Filters are applied server-side (not client-side), so the filtered result set is small. TanStack Query's `queryKey` must include the current filter params so that changes in filter state trigger a refetch automatically without debounce delays. | Backend + Client (TanStack Query key strategy) |

**Confirmed: all 11 acceptance criteria have been read, listed, and understood. No criterion is ambiguous.**

---

## 2 — File-Impact Map

The following files are expected to be touched to implement server-side feature flag filtering while preserving the repository data flow (`shared/types.ts` → validation → service → routes → client API → UI).

| # | File | Why it is impacted | Expected change |
|---|---|---|---|
| 1 | [`shared/types.ts`](../../shared/types.ts) | Shared contract is the source of truth for filterable flag fields and request/query typing. | Add or confirm a typed filter shape covering `environment`, `status`, `type`, `owner`, and `name`. |
| 2 | [`server/src/middleware/validation.ts`](../../server/src/middleware/validation.ts) | Query parameters must be validated at the API boundary before service execution. | Add or extend a Zod schema for `GET /api/flags` query validation so only allowed values reach the service layer. |
| 3 | [`server/src/services/flags.ts`](../../server/src/services/flags.ts) | Acceptance criteria require filtering to happen in the backend and support multiple simultaneous filters. | Implement dynamic SQL WHERE-clause construction with parameter binding, status-to-integer conversion, case-insensitive partial name match, and AND composition across all active filters. |
| 4 | [`server/src/routes/flags.ts`](../../server/src/routes/flags.ts) | Routes must pass validated query filters into the service and propagate failures with `next(error)`. | Read validated query params, call the filtering-capable list service, and keep route handlers thin. |
| 5 | [`client/src/api/flags.ts`](../../client/src/api/flags.ts) | The client API is responsible for sending typed query parameters to the backend. | Extend the list-fetch helper to serialize active filters into the request URL without sending empty values. |
| 6 | [`client/src/App.tsx`](../../client/src/App.tsx) | Filter state persistence, active-filter indication, refetch behavior, and clear-all UX live at the app/query orchestration level. | Store filter state, include it in the TanStack Query `queryKey`, pass it to the API call, preserve it after mutations, and expose a clear-all action. |
| 7 | [`server/src/__tests__/flags.test.ts`](../../server/src/__tests__/flags.test.ts) | Backend behavior must be verified for single-filter and multi-filter combinations. | Add tests for each supported filter, AND-combination behavior, status conversion, owner exact match, and name partial-match behavior using `_resetDbForTesting()`. |
| 8 | [`client/src/components/flags-table.tsx`](../../client/src/components/flags-table.tsx) | The filtered list presentation may need to reflect active filter state or empty-result behavior. | Update only if required to display filtered-result feedback or preserve existing list rendering with no behavioral regression. |
| 9 | [`client/src/components/flag-form-modal.tsx`](../../client/src/components/flag-form-modal.tsx) | Create/edit flows trigger refetches that must preserve the active filter set. | Likely no direct filter logic change, but mutation success paths must continue to invalidate/refetch using the current filters managed by the parent. |

**Impact summary:** the highest-risk implementation area is `server/src/services/flags.ts`, because it must combine safe SQL construction, SQL.js parameter binding, and exact acceptance-criteria semantics without moving filtering into the client.

---

## 3 — AND-Logic Decision and Implementation Order

### 3.1 Decision

Multiple filters should be combined with **AND logic** in the backend service. This matches AC-7 directly and keeps the client responsible only for expressing filter state, not for applying business logic. The service should build the query incrementally from a base `SELECT` statement, append one condition per non-empty filter, and join those conditions with `AND`.

### 3.2 Query-construction approach

| Filter | SQL behavior | Notes |
|---|---|---|
| `environment` | `environment = ?` | Exact match against allowed enum values. |
| `status` | `enabled = ?` | Convert `enabled` → `1` and `disabled` → `0` before binding. |
| `type` | `type = ?` | Exact match against allowed enum values. |
| `owner` | `owner = ?` | Exact string match per AC-4. |
| `name` | `LOWER(name) LIKE ?` | Bind `%<lowercased input>%` to support case-insensitive partial matching. |

The SQL must remain parameterized. Conditions should be collected in an array, parameter values collected in the same order, and the final statement prepared only after the full WHERE clause is assembled. This preserves SQL.js safety requirements and keeps the implementation easy to test.

### 3.3 Recommended implementation order

1. **Define or confirm shared filter types** in [`shared/types.ts`](../../shared/types.ts) so both server and client use the same filter contract.
2. **Add boundary validation** in [`server/src/middleware/validation.ts`](../../server/src/middleware/validation.ts) for all supported query params and allowed values.
3. **Implement backend filtering first** in [`server/src/services/flags.ts`](../../server/src/services/flags.ts), including dynamic AND-composed SQL, parameter binding, and `stmt.free()` in `finally`.
4. **Wire the route layer** in [`server/src/routes/flags.ts`](../../server/src/routes/flags.ts) so validated query values reach the service via the existing Express pattern and errors continue to propagate with `next(error)`.
5. **Add backend tests** in [`server/src/__tests__/flags.test.ts`](../../server/src/__tests__/flags.test.ts) covering individual filters and representative combinations such as “enabled + release + production”.
6. **Extend the client API** in [`client/src/api/flags.ts`](../../client/src/api/flags.ts) so active filters are sent as query parameters and empty values are omitted.
7. **Implement UI state and persistence** in [`client/src/App.tsx`](../../client/src/App.tsx) so filters remain active after create/edit/delete flows, the query key includes the full filter state, and a clear-all action resets the list to the unfiltered view.
8. **Add active-filter indication in the UI** so users can tell when results are constrained, satisfying AC-10 without introducing client-side filtering.

### 3.4 Rationale for this order

This order reduces rework. Backend semantics are the source of truth for the feature, so validation, query construction, and tests should be stable before the client is wired to them. Once the service behavior is verified, the UI can focus on state persistence and responsiveness through TanStack Query rather than duplicating filtering logic.

**Implementation conclusion:** use backend-owned AND logic with parameterized dynamic SQL, then layer validation, tests, client query serialization, and UI persistence on top of that foundation.
