# Task E2-S1-T6 — Create on-demand context documents (Step D)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1-T6 |
| **Story** | [E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../stories/story-E2S1-claude-ai-layer-preparation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | — |
| **Blocks** | — |
| Created at | 2026-04-16 02:35:49 -03 |
| Last updated | 2026-04-16 02:35:49 -03 |

---

## 1) Task statement

As a delivery agent, I want to execute E2-S1-T6 with complete traceability and explicit validation so that the parent story can progress without ambiguity.

---

## 2) Verifiable expected outcome

- A concrete deliverable exists for this task and is linked in this document.
- All required sections from the task definition are fully populated (no placeholders).
- Validation evidence is attached with command outputs and/or file references.

---

## 3) Detailed execution plan

**Description:** Create `.agents/reference/backend-patterns.md`, `frontend-patterns.md`, and `sql-js-constraints.md` with `file:line` references and deep pattern documentation.

**Acceptance criteria:**
- **Given** the codebase analysis and architecture mapping
- **When** on-demand context documents are created
- **Then** all 3 files exist; `backend-patterns.md` covers Express v5, SQL.js, Zod, error classes; `frontend-patterns.md` covers React 19, TanStack Query, Tailwind v4, Radix UI; `sql-js-constraints.md` covers SQL.js-specific limitations in depth

---

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

- **Given** all task dependencies are available and validated,
- **When** this task execution plan is completed and evidence is collected,
- **Then** the task outcome is reproducible, secure, and auditable by another agent.

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
