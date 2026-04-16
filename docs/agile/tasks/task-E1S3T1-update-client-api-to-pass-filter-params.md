# Task E1-S3-T1 — Update client API to pass filter params

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S3-T1 |
| **Story** | [E1-S3 — Client-side filtering UI implementation](../stories/story-E1S3-client-side-filtering-ui-implementation.md) |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `task-implementer` |
| **Depends on** | E1-S2 |
| **Blocks** | — |
| Created at | 2026-04-14 22:21:41 -03 |
| Last updated | 2026-04-15 19:02:10 -03 |

---

## 1) Task statement

As a `task-implementer`, I want to update `client/src/api/flags.ts` to accept and serialize `FlagFilterParams` as query string parameters so that the client correctly communicates active filters to the server.

---

## 2) Verifiable expected outcome

- `getFlags()` accepts an optional `FlagFilterParams` argument; filter params are serialized as query string params.
- Empty/undefined fields are omitted from the URL.
- `pnpm run build` exits 0.

---

## 3) Detailed execution plan

**Goal:** update `client/src/api/flags.ts` to accept `FlagFilterParams` and serialize them as query string parameters in the `GET /api/flags` fetch call.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `client/src/api/flags.ts` — update `getFlags()` to accept and serialize `FlagFilterParams`

**Acceptance:** filter params are serialized correctly; empty/undefined fields are omitted from the query string; `pnpm run build` exits 0.

**depends_on:** E1-S2

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

- Command(s) executed: cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint
- Exit code(s): 0 (all 5 commands)
- Output summary: server build OK, lint OK, 24/24 tests pass; client build OK (1838 modules, 2.55s), lint OK
- Files created/updated: client/src/api/flags.ts, client/src/App.tsx
- Risks found / mitigations: Changing getFlags() signature broke App.tsx queryFn direct reference; fixed by wrapping in arrow function () => getFlags()

### Given / When / Then checks

- **Given** `FlagFilterParams` is importable from `@shared/types`,
- **When** `getFlags({ environment: 'production' })` is called,
- **Then** the fetch URL includes `?environment=production`; when no filters are passed the URL has no query string.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved: E1-S2 (server-side filtering) is Done
- Downstream items unblocked: E1-S3-T2 (filter state management in App.tsx)
- Open risks (if any): None
