# Task E2-S1-T6 — Create on-demand context documents (Step D)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1-T6 |
| **Story** | [E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../stories/story-E2S1-claude-ai-layer-preparation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | E2-S1-T1 |
| **Blocks** | E2-S1-T7 |
| Created at | 2026-04-16 02:35:49 -03 |
| Last updated | 2026-04-16 03:40:50 -03 |

---

## 1) Task statement

As a `prompt-engineer`, I want to create 3 on-demand context documents with `file:line` references so that commands like `/prime` and `/plan` can load deep codebase knowledge on demand.

---

## 2) Verifiable expected outcome

- `.agents/reference/backend-patterns.md` exists covering Express v5, SQL.js, Zod, and error classes with `file:line` references.
- `.agents/reference/frontend-patterns.md` exists covering React 19, TanStack Query, Tailwind v4, and Radix UI with `file:line` references.
- `.agents/reference/sql-js-constraints.md` exists with deep SQL.js-specific documentation (statement lifecycle, boolean handling, parameterized queries, common mistakes).

---

## 3) Detailed execution plan

**Description:** Create `.agents/reference/backend-patterns.md`, `frontend-patterns.md`, and `sql-js-constraints.md` with `file:line` references and deep pattern documentation.

**Acceptance criteria:**
- **Given** the codebase analysis and architecture mapping
- **When** on-demand context documents are created
- **Then** all 3 files exist; `backend-patterns.md` covers Express v5, SQL.js, Zod, error classes; `frontend-patterns.md` covers React 19, TanStack Query, Tailwind v4, Radix UI; `sql-js-constraints.md` covers SQL.js-specific limitations in depth

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

- **Command(s) executed:** `ls -la .agents/reference/`
- **Exit code(s):** 0
- **Output summary:** 3 new files confirmed:
  - `.agents/reference/backend-patterns.md` (10,775 bytes) — Express v5 routes, service layer, Zod validation, error handling chain, DB initialization with file:line references
  - `.agents/reference/frontend-patterns.md` (10,316 bytes) — TanStack Query, API client, component architecture, UI primitives, Vite config, shared types with file:line references
  - `.agents/reference/sql-js-constraints.md` (10,134 bytes) — Statement lifecycle, parameterized queries, boolean handling, LIKE escaping, array storage, dynamic query building, test isolation, common mistakes with file:line references
- **Files created/updated:** `.agents/reference/backend-patterns.md`, `.agents/reference/frontend-patterns.md`, `.agents/reference/sql-js-constraints.md`
- **Risks found / mitigations:** None — all documents reference real source with verified line numbers

### Given / When / Then checks

- **Given** codebase analysis (E2-S1-T1) produced the architecture mapping,
- **When** 3 on-demand context documents were created with real file:line references from 12+ source files,
- **Then** all 3 files exist in `.agents/reference/`, each covering its domain in depth with traceable references.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- **Upstream resolved:** E2-S1-T1 (architecture analysis) provided the source material.
- **Downstream unblocked:** E2-S1-T7 (PRD creation) can now reference these on-demand context documents.
- **Files delivered:** `.agents/reference/backend-patterns.md`, `.agents/reference/frontend-patterns.md`, `.agents/reference/sql-js-constraints.md`
- **Note:** These documents complement the existing `.agents/reference/backend.md` and `.agents/reference/frontend.md` (from Epic 1). The new documents are more detailed with file:line traceability, optimized for Claude Code's `/prime` and `/plan` commands.
