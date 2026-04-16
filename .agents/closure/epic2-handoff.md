# EPIC-2 Handoff Document

<!-- artifact_id: epic2-handoff -->
<!-- epic_id: EPIC-2 -->
<!-- produced_at: 2026-04-15 21:18:03 -03 -->
<!-- produced_by: agile-exercise-planner -->

---

## 1 — Starting State

| Field | Value |
|---|---|
| Branch + SHA | `exercise-1 @ 603e09f` |
| Last upstream sync | Initial fork from `dynamous-business/nextjs-feature-flag-exercise` (E0-S1) |
| Server validation | `cd server && pnpm run build && pnpm run lint && pnpm test` — ✅ (24 tests, 0 errors) |
| Client validation | `cd client && pnpm run build && pnpm run lint` — ✅ (1839 modules, 0 errors) |

---

## 2 — AI Layer Coverage

| File | Status |
|---|---|
| `.github/copilot-instructions.md` | ✅ present |
| `.github/workflows/copilot-setup-steps.yml` | ✅ present |
| `.github/instructions/feature-flag-exercise.instructions.md` | ✅ present |
| `.github/instructions/coding-agent.instructions.md` | ✅ present |
| `.github/agents/task-implementer.agent.md` | ✅ present |
| `.github/agents/agile-exercise-planner.agent.md` | ✅ present |
| `.github/skills/execute-task-locally/SKILL.md` | ✅ present |
| `.github/skills/produce-epic-closure-report/SKILL.md` | ✅ present |
| `.github/skills/produce-epic-handoff/SKILL.md` | ✅ present |
| `.github/skills/record-friction-point/SKILL.md` | ✅ present |

---

## 3 — Task Reference

**Task file:** [`nextjs-feature-flag-exercise/TASK.md`](../../TASK.md)

### Key acceptance criteria

- [ ] Users can filter flags by environment (development, staging, production)
- [ ] Users can filter flags by status (enabled/disabled)
- [ ] Users can filter flags by type (release, experiment, operational, permission)
- [ ] Users can filter flags by owner
- [ ] Users can search flags by name (partial match)
- [ ] Filtering should happen in the backend
- [ ] Multiple filters can be applied simultaneously (e.g., "all enabled release flags in production")
- [ ] Filters persist while using other features (creating, editing, deleting flags)
- [ ] There is a way to clear all filters and return to the full list
- [ ] The UI clearly indicates when filters are active
- [ ] Filtering should feel responsive, even as the number of flags grows

---

## 4 — First Story to Execute

**Story:** E2-S1 (story file pending — will be created during Epic 2 planning)

**Objective in one sentence:** Re-implement the same feature flag filtering task using a structured AI-assisted validation workflow, producing comparable metrics for before/after analysis.

---

## 5 — Known Risks

Top 3 risks from codebase audit to monitor during implementation:

| # | Risk | Monitoring Action |
|---|---|---|
| 1 | **Dynamic SQL injection** — WHERE clause built via string interpolation instead of parameterized binding | Verify all user-provided filter values pass through `stmt.bind(values)` only; no string interpolation in any SQL query. Run `grep -r "string interpolation\|template literal" server/src/services/` after implementation. |
| 2 | **Client state sync** — stale TanStack Query cache when filters change during mutations | Confirm `filterState` is included in `queryKey: ['flags', filterState]`; test that filter state persists after each mutation type (create, edit, delete). |
| 3 | **Boolean conversion** — `enabled` arrives as string from query param but DB stores INTEGER 0/1 | Verify Zod schema validates `status` as `z.enum(['enabled','disabled'])` and service converts via `filters.status === 'enabled' ? 1 : 0` before `stmt.bind()`. Run boundary tests with raw string values. |

---

## 6 — Go / No-Go

> **READY — EPIC-2 may begin.**

Signed: `agile-exercise-planner` at `2026-04-15 21:18:03 -03`.

All EPIC-1 DoD items resolved. See [`epic1-closure-report.md`](./epic1-closure-report.md).
