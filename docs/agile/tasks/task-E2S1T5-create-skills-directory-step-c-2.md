# Task E2-S1-T5 — Create skills directory (Step C.2)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1-T5 |
| **Story** | [E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../stories/story-E2S1-claude-ai-layer-preparation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | E2-S1-T3 |
| **Blocks** | E2-S1-T8 |
| Created at | 2026-04-16 02:35:49 -03 |
| Last updated | 2026-04-16 03:30:58 -03 |

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

- **Command(s) executed:** `ls -la .claude/skills/agent-browser/` + `head -5` + `grep -c` for key references
- **Exit code(s):** 0
- **Output summary:** SKILL.md exists (10,367 bytes), has YAML front matter with `name`, `description`, `allowed-tools`; 13 references to `localhost:3000`; 8 project-specific recipes covering smoke test, filter testing, CRUD operations, and combined filters
- **Files created:**
  - `.claude/skills/agent-browser/SKILL.md` — purpose, prerequisites, commands reference, 8 project-specific recipes, integration with `/validate` and `/implement`, constraints
- **Risks found / mitigations:** Playwright must be installed separately (`npx playwright install chromium`) — documented in Prerequisites section

### Given / When / Then checks

- **Given** Core 4 commands are in place (E2-S1-T3 Done) and commands may need browser automation,
- **When** the agent-browser skill is created in `.claude/skills/agent-browser/SKILL.md`,
- **Then** the skill exists with clear purpose, prerequisites, process, constraints; references this project's UI (localhost:3000, flags table, filter controls); defines integration with `/validate` and `/implement` commands.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E2-S1-T3 (Core 4 commands) is Done
- **Downstream items unblocked:** E2-S1-T8 (final validation)
- **Open risks (if any):** Playwright runtime dependency — not bundled, requires separate install
