# Task E1-S2-T1 — Extend shared/types.ts with FlagFilterParams

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S2-T1 |
| **Story** | [E1-S2 — Server-side filtering implementation](../stories/story-E1S2-server-side-filtering-implementation.md) |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `task-implementer` |
| **Depends on** | E1-S1 |
| **Blocks** | — |
| Created at | 2026-04-14 22:21:37 -03 |
| Last updated | 2026-04-14 22:21:37 -03 |

---

## 1) Task statement

As a `task-implementer`, I want to add the `FlagFilterParams` type to `shared/types.ts` so that both server and client share a single typed filter contract with no duplication.

---

## 2) Verifiable expected outcome

- `shared/types.ts` exports `FlagFilterParams` with 5 optional fields: `environment`, `status`, `type`, `owner`, `name`.
- `cd server && pnpm run build` exits 0.
- `cd client && pnpm run build` exits 0.

---

## 3) Detailed execution plan

**Goal:** add the `FlagFilterParams` type to `shared/types.ts` as the single source of truth for the filter contract, with all 5 optional fields.

**Agent:** `task-implementer` (local VS Code)

**Artifacts to create/modify:**
- `shared/types.ts` — add `FlagFilterParams` type

**Acceptance:** type exists with optional fields `environment`, `status`, `type`, `owner`, `name`; `cd server && pnpm run build` exits 0; `cd client && pnpm run build` exits 0.

**depends_on:** E1-S1

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

- **Given** `shared/types.ts` is the single source of truth,
- **When** `FlagFilterParams` is added with all 5 optional fields,
- **Then** both `pnpm run build` commands exit 0 and the type is importable via `@shared/types`.

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
