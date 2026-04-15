# Task E1-S3-T1 — Update client API to pass filter params

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S3-T1 |
| **Story** | [E1-S3 — Client-side filtering UI implementation](../stories/story-E1S3-client-side-filtering-ui-implementation.md) |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `task-implementer` |
| **Depends on** | E1-S2 |
| **Blocks** | — |
| Created at | 2026-04-14 22:21:41 -03 |
| Last updated | 2026-04-14 22:21:41 -03 |

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

- Command(s) executed:
- Exit code(s):
- Output summary:
- Files created/updated:
- Risks found / mitigations:

### Given / When / Then checks

- **Given** `FlagFilterParams` is importable from `@shared/types`,
- **When** `getFlags({ environment: 'production' })` is called,
- **Then** the fetch URL includes `?environment=production`; when no filters are passed the URL has no query string.

---

## 6) Definition of Done

- [ ] Expected outcome is objectively verifiable.
- [ ] Dependencies are explicit and valid.
- [ ] Security and architecture checks were performed.
- [ ] Validation evidence is attached.
- [ ] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved:
- Downstream items unblocked:
- Open risks (if any):
