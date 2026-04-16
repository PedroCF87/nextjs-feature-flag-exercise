# Task E2-S1-T2 — Create/update CLAUDE.md for Exercise 2 (Step B)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1-T2 |
| **Story** | [E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../stories/story-E2S1-claude-ai-layer-preparation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `rules-bootstrap` |
| **Depends on** | E2-S1-T1 |
| **Blocks** | E2-S1-T3, E2-S1-T7 |
| Created at | 2026-04-16 02:35:49 -03 |
| Last updated | 2026-04-16 03:15:09 -03 |

---

## 1) Task statement

As a `rules-bootstrap` agent, I want to create the `CLAUDE.md` global rules file adapted for Exercise 2 so that the Claude Code agent has accurate project context auto-loaded in every session.

---

## 2) Verifiable expected outcome

- `CLAUDE.md` exists at repository root with 4 Venn diagram categories: Tech Stack & Architecture, Code Styles & Patterns, Testing Requirements, Misconceptions AI Often Has.
- References `exercise-2` branch and PIV Loop methodology.
- Contains validation commands, error classes, and key file reference table.
- Does NOT contain workflow definitions, task-specific content, or universal knowledge.

---

## 3) Detailed execution plan

**Description:** Create or update `CLAUDE.md` adapted for Exercise 2 state. Follow the Excal-4 Venn diagram: Tech Stack & Architecture, Code Styles & Patterns, Testing Requirements, Misconceptions AI Often Has. Reference `exercise-2` branch and PIV Loop methodology. Use the Gold Standard two-document pattern as reference.

**Acceptance criteria:**
- **Given** the codebase analysis from T1
- **When** `CLAUDE.md` is written
- **Then** it contains all 4 required categories, references `exercise-2`, includes validation commands, error classes, key files, and misconceptions; excludes universal knowledge, workflow definitions, task-specific content

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

- Command(s) executed: `replace_string_in_file` on `CLAUDE.md` (full rewrite of content)
- Exit code(s): N/A (file edit, no build commands — this is a documentation task)
- Output summary: CLAUDE.md rewritten with 4 Excal-4 Venn diagram categories: Tech Stack & Architecture, Code Styles & Patterns, Testing Requirements, Misconceptions AI Often Has. References `exercise-2` branch, PIV Loop methodology, clean upstream starting state. Includes validation commands, error classes, SQL.js constraints, key file reference, and on-demand context table.
- Files created/updated: `CLAUDE.md` (updated — full rewrite)
- Risks found / mitigations: None — documentation-only task, no source code changes

### Given / When / Then checks

- **Given** all task dependencies are available and validated,
- **When** this task execution plan is completed and evidence is collected,
- **Then** the task outcome is reproducible, secure, and auditable by another agent.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- Upstream dependencies resolved: E2-S1-T1 (architecture analysis) — Done
- Downstream items unblocked: E2-S1-T3 (setup commands), E2-S1-T7 (PRD)
- Open risks (if any): None
