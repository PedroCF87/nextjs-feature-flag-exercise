# Task E2-S1-T5 — Create skills directory (Step C.2)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1-T5 |
| **Story** | [E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../stories/story-E2S1-claude-ai-layer-preparation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | E2-S1-T3 |
| **Blocks** | E2-S1-T8 |
| Created at | 2026-04-16 02:35:49 -03 |
| Last updated | 2026-04-16 02:54:23 -03 |

---

## 1) Task statement

As a `prompt-engineer`, I want to create the `agent-browser` skill for Playwright browser automation so that commands can invoke a reusable subroutine for UI testing and visual validation.

---

## 2) Verifiable expected outcome

- `.claude/skills/agent-browser/SKILL.md` exists with clear purpose, prerequisites, process, and constraints sections.
- Skill references this project’s UI (localhost:3000, flags table, filter controls).
- Skill defines integration points with `/validate` and `/implement` commands.

---

## 3) Detailed execution plan

**Description:** Create `.claude/skills/agent-browser/SKILL.md` for Playwright browser automation.

**Acceptance criteria:**
- **Given** commands may need browser automation
- **When** the skill is created
- **Then** `.claude/skills/agent-browser/SKILL.md` exists with clear purpose, inputs, process, and outputs

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
