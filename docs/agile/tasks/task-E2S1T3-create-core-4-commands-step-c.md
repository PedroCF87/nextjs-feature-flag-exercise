# Task E2-S1-T3 — Create Core 4 commands (Step C)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1-T3 |
| **Story** | [E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../stories/story-E2S1-claude-ai-layer-preparation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | E2-S1-T2 |
| **Blocks** | E2-S1-T4, E2-S1-T5 |
| Created at | 2026-04-16 02:35:49 -03 |
| Last updated | 2026-04-16 03:20:25 -03 |

---

## 1) Task statement

As a `prompt-engineer`, I want to create the 4 Core PIV Loop commands (`prime.md`, `plan.md`, `implement.md`, `commit.md`) so that Claude Code has structured workflows for context loading, planning, implementation, and committing.

---

## 2) Verifiable expected outcome

- `.claude/commands/prime.md` exists with I→P→O structure and YAML front matter.
- `.claude/commands/plan.md` exists with I→P→O structure and YAML front matter.
- `.claude/commands/implement.md` exists with I→P→O structure and YAML front matter.
- `.claude/commands/commit.md` exists with I→P→O structure and YAML front matter.
- Each command accepts `$ARGUMENTS` where applicable.

---

## 3) Detailed execution plan

**Description:** Create `.claude/commands/prime.md`, `plan.md`, `implement.md`, `commit.md`. Each follows Input → Process → Output structure. Base on workshop reference (`resident-health-workshop-resources/.claude/commands/`).

**Acceptance criteria:**
- **Given** `CLAUDE.md` is complete
- **When** Core 4 commands are created
- **Then** all 4 files exist, each has I→P→O structure, each accepts `$ARGUMENTS` where applicable

---

## 4) Architecture and security requirements

- Preserve existing architecture boundaries (no cross-layer shortcuts).
- Validate all external inputs before processing.
- Never hardcode secrets, tokens, or credentials in files.
- Document any security-sensitive decision and fallback/rollback path.
- For data-layer operations, use parameterized queries and explicit resource cleanup.

---

## 5) Validation evidence

- **Command(s) executed:** `ls -la .claude/commands/` + `head -5` on each file
- **Exit code(s):** 0
- **Output summary:** All 4 files exist with correct YAML front matter (`description` + `argument-hint`)
- **Files created:**
  - `.claude/commands/prime.md` — I→P→O structure, `$ARGUMENTS` for optional file/area
  - `.claude/commands/plan.md` — I→P→O structure, `$ARGUMENTS` for feature/PRD
  - `.claude/commands/implement.md` — I→P→O structure, `$ARGUMENTS` for plan path
  - `.claude/commands/commit.md` — I→P→O structure, `$ARGUMENTS` for optional message
- **Risks found / mitigations:** None — commands are prompt templates, no executable code

### Given / When / Then checks

- **Given** `CLAUDE.md` is complete (E2-S1-T2 Done) and workshop references are available,
- **When** Core 4 commands are created in `.claude/commands/`,
- **Then** all 4 files exist, each has YAML front matter with `description` and `argument-hint`, each follows I→P→O structure, each accepts `$ARGUMENTS`, no references to MCP/Supabase/Drizzle/Bun.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E2-S1-T2 (CLAUDE.md) is Done
- **Downstream items unblocked:** E2-S1-T4 (extended commands), E2-S1-T5 (skills directory)
- **Open risks (if any):** None
