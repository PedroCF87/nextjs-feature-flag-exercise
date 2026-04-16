# Task E2-S1-T8 — Validate AI Layer structural consistency (Step F)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1-T8 |
| **Story** | [E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../stories/story-E2S1-claude-ai-layer-preparation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | E2-S1-T4, E2-S1-T5, E2-S1-T7 |
| **Blocks** | — |
| Created at | 2026-04-16 02:35:49 -03 |
| Last updated | 2026-04-16 02:54:23 -03 |

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
