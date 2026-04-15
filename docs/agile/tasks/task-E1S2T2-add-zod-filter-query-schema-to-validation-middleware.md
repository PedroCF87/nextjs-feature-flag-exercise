# Task E1-S2-T2 — Add Zod filter query schema to validation middleware

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S2-T2 |
| **Story** | [E1-S2 — Server-side filtering implementation](../stories/story-E1S2-server-side-filtering-implementation.md) |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `task-implementer` |
| **Depends on** | E1-S2-T1 |
| **Blocks** | — |
| Created at | 2026-04-14 22:21:37 -03 |
| Last updated | 2026-04-14 22:21:37 -03 |

---

## 1) Task statement

As a `task-implementer`, I want to add a Zod filter query schema to `server/src/middleware/validation.ts` so that `GET /api/flags` validates incoming filter parameters and returns 400 for invalid values.

---

## 2) Verifiable expected outcome

- `server/src/middleware/validation.ts` exports a Zod schema for `FlagFilterParams` query params.
- Invalid enum values trigger a 400 response via `next(error)`.
- `pnpm run build` and `pnpm run lint` exit 0.

---

## 3) Detailed execution plan

**Goal:** add a Zod schema that validates the `GET /api/flags` query parameters against `FlagFilterParams`, returning 400 for invalid values via `next(error)`.

**Agent:** `task-implementer` | **Skill:** `execute-task-from-issue`

**Artifacts to create/modify:**
- `server/src/middleware/validation.ts` — add `flagFilterQuerySchema` and `validateFlagFilter` middleware

**Acceptance:** middleware validates all filter fields; invalid enum values return 400; `pnpm run build` and `pnpm run lint` exit 0.

**depends_on:** E1-S2-T1

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

- **Given** `FlagFilterParams` is defined in `shared/types.ts`,
- **When** a `GET /api/flags` request includes an invalid filter value,
- **Then** the Zod middleware rejects it with a 400 via `next(error)`; valid params pass through to the handler.

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
