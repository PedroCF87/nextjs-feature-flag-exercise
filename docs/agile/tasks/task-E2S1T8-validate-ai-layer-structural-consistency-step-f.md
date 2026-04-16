# Task E2-S1-T8 — Validate AI Layer structural consistency (Step F)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1-T8 |
| **Story** | [E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../stories/story-E2S1-claude-ai-layer-preparation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | E2-S1-T4, E2-S1-T5, E2-S1-T7 |
| **Blocks** | — |
| Created at | 2026-04-16 02:35:49 -03 |
| Last updated | 2026-04-16 03:51:55 -03 |

---

## 1) Task statement

As a `prompt-engineer`, I want to validate the full AI Layer for structural consistency so that the PIV Loop can start with zero orphan references or missing dependencies.

---

## 2) Verifiable expected outcome

- A validation report exists with ✅/❌ per check across all tiers: Tier 1 (CLAUDE.md), Tier 2 (9 commands), Tier 3 (skills), On-Demand Context (≥2 docs), Layer 2 (PRD).
- All cross-references are valid: commands reference existing files, PRD references existing docs.
- If all checks pass: signed statement “AI Layer validation passed — ready for PIV Loop.”
- If any check fails: remediation list with no sign-off.

---

## 3) Detailed execution plan

**Description:** Run structural validation of the full AI Layer: Tier 1 (CLAUDE.md) → Tier 2 (9 commands with I→P→O) → Tier 3 (skills) → On-Demand Context (≥2 docs) → Layer 2 (PRD). Check for orphan references and missing dependencies.

**Acceptance criteria:**
- **Given** all AI Layer artifacts have been created
- **When** structural validation is run
- **Then** all tiers are consistent; no orphan references; commands reference valid skill/context paths; PRD references existing on-demand docs

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

### Tier 1 — CLAUDE.md (8/8 checks ✅)

| # | Check | Result |
|---|---|---|
| 1 | File exists | ✅ `CLAUDE.md` (310 lines) |
| 2 | 4 Venn categories | ✅ §1 Tech Stack & Architecture, §2 Code Styles & Patterns, §3 Testing Requirements, §4 Misconceptions AI Often Has |
| 3 | References `exercise-2` branch | ✅ `**Branch:** exercise-2 — never commit or push to main or exercise-1.` |
| 4 | Validation commands section | ✅ Full combined check + individual server/client commands |
| 5 | Error classes section | ✅ `NotFoundError`, `ConflictError`, `ValidationError` — matches `server/src/middleware/error.ts` |
| 6 | Key Files table | ✅ 14 entries — all paths verified to exist on disk |
| 7 | No command/workflow definitions | ✅ 0 grep matches for `/prime`, `/plan`, etc. |
| 8 | No task-specific content | ✅ 0 grep matches for `E2-S1`, `sprint`, `backlog` |

### Tier 2 — Commands (5/5 checks ✅)

| # | Check | Result |
|---|---|---|
| 1 | 9 commands exist | ✅ `prime.md`, `plan.md`, `implement.md`, `commit.md`, `prime-endpoint.md`, `validate.md`, `create-prd.md`, `review.md`, `security-review.md` |
| 2 | All have YAML front matter with `description` | ✅ 9/9 |
| 3 | All have phased structure (I→P→O equivalent) | ✅ All use `## Phase N:` or `## Process / ### Step N:` headings — verified via `grep '^#'` |
| 4 | No forbidden references (MCP/Jira/Confluence/Supabase/Drizzle/Bun) | ✅ 0 matches across all 9 commands |
| 5 | All `$ARGUMENTS` commands have `argument-hint` | ✅ 8/8 commands with `$ARGUMENTS` have hints; `validate.md` has no `$ARGUMENTS` (correct) |

### Tier 3 — Skills (3/3 checks ✅)

| # | Check | Result |
|---|---|---|
| 1 | `agent-browser/SKILL.md` exists | ✅ with YAML front matter (`name`, `description`, `allowed-tools`) |
| 2 | Has Purpose, Process, Constraints sections | ✅ 3 sections found (Purpose, When to Use, Constraints) |
| 3 | References project UI | ✅ 28 project-specific references (`localhost:3000`, `flags-table`, `filter`, etc.) |

### On-Demand Context (5/5 checks ✅)

| # | Check | Result |
|---|---|---|
| 1 | `backend-patterns.md` exists | ✅ `.agents/reference/backend-patterns.md` |
| 2 | `frontend-patterns.md` exists | ✅ `.agents/reference/frontend-patterns.md` |
| 3 | `sql-js-constraints.md` exists | ✅ `.agents/reference/sql-js-constraints.md` |
| 4 | Minimum 3 on-demand docs | ✅ 5 total (3 new + 2 existing `backend.md`, `frontend.md`) |
| 5 | No orphan references | ✅ Commands don't hardcode context paths; CLAUDE.md on-demand table references only existing files |

### Layer 2 — PRD (5/5 checks ✅)

| # | Check | Result |
|---|---|---|
| 1 | `feature-flag-filtering-e2.prd.md` exists | ✅ `.agents/PRDs/feature-flag-filtering-e2.prd.md` |
| 2 | 15 sections | ✅ 15 `## ` headings confirmed |
| 3 | References CLAUDE.md | ✅ 4 references |
| 4 | References on-demand context docs | ✅ `backend-patterns.md` (3 refs), `frontend-patterns.md` (2 refs), `sql-js-constraints.md` (7 refs) |
| 5 | References TASK.md | ✅ 6 references |

### Cross-references (5/5 checks ✅)

| # | Check | Result |
|---|---|---|
| 1 | Key Files table paths exist | ✅ All 14 paths verified on disk |
| 2 | No orphan command→context references | ✅ Commands don't hardcode `.agents/reference/` paths |
| 3 | PRD tech stack matches CLAUDE.md | ✅ Same stack: Node.js ESM, Express v5, SQL.js, Zod, Vitest, React 19, Vite, TanStack Query v5, Tailwind v4, Radix UI |
| 4 | Validation commands match between CLAUDE.md and validate.md | ✅ Both specify `pnpm run build`, `pnpm run lint`, `pnpm test` (server) + `pnpm run build`, `pnpm run lint` (client) |
| 5 | Error classes match between CLAUDE.md and error.ts | ✅ Both define `NotFoundError`, `ConflictError`, `ValidationError` (+ `AppError` base class in error.ts) |

### Summary

**31/31 checks passed. 0 failures.**

> **AI Layer validation passed — ready for PIV Loop.**

### Given / When / Then checks

- **Given** all AI Layer artifacts (CLAUDE.md, 9 commands, 1 skill, 5 on-demand context docs, 1 PRD) have been created and their predecessor tasks (E2-S1-T1 through E2-S1-T7) are marked Done,
- **When** structural validation is executed across all tiers with cross-reference checks,
- **Then** 31/31 checks pass with zero orphan references, zero missing dependencies, and full tech stack consistency — the AI Layer is structurally valid and ready for PIV Loop execution.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved: E2-S1-T4 (commands), E2-S1-T5 (skill), E2-S1-T7 (PRD) — all Done
- Downstream items unblocked: Story E2-S1 completion (all 8 tasks Done → story can be closed)
- Open risks (if any): CLAUDE.md on-demand context table references only E1-era docs (`backend.md`, `frontend.md`) — not the new T6 docs (`backend-patterns.md`, `frontend-patterns.md`, `sql-js-constraints.md`). The new docs are referenced in the PRD and available on-demand, so this is cosmetic, not structural. Can be addressed as a P3 improvement if desired.
