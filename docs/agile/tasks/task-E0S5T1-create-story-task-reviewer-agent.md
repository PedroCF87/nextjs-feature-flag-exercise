# Task E0-S5-T1 — Create `story-task-reviewer` agent

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S5-T1 |
| **Story** | [E0-S5 — Execution Automation for Epic 1](../stories/story-E0S5-execution-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer`, `agile-exercise-planner` |
| **Depends on** | E0-S2 |
| **Blocks** | — |
| Created at | 2026-04-13 13:23:32 -03 |
| Last updated | 2026-04-13 13:23:32 -03 |

---

## 1) Task statement

Create `Docs/.github/agents/story-task-reviewer.agent.md` — an agent specialized in reviewing agile story and task markdown files, running script-based validation gates, and producing inline PR review suggestions with a verdict of `approve` or `request-changes`.

---

## 2) Verifiable expected outcome

1. File `Docs/.github/agents/story-task-reviewer.agent.md` exists and is readable.
2. YAML frontmatter contains: `name: story-task-reviewer`, `description`, `tools: ["read", "search", "execute", "edit"]`.
3. Markdown body includes all 5 sections: `Core Responsibilities`, `Methodology`, `Conventions to Follow`, `Output Standards`, `Anti-Patterns to Avoid`.
4. `Output Standards` defines the PR review comment format (verdict `approve`/`request-changes` + inline suggestion structure).
5. `Anti-Patterns` explicitly states: "Never approve without running script-based validation" and "Never review artifacts you just authored in the same session".
6. `Methodology` step 3 references `validate-task-pack.js` and `sync-backlog-index.js --dry-run` as mandatory quality gates.

---

## 3) Detailed execution plan

**Goal:** create an agent specialized in reviewing agile documents (stories and tasks) and producing inline suggestions via PR review comments.

**Agent:** `prompt-engineer` | **Skill:** `create-specialist-agent`

**Artifacts to create:**
- `Docs/.github/agents/story-task-reviewer.agent.md`

**Sub-tasks:**

1. Read `Docs/.github/agents/agile-quality-auditor.agent.md` as the reference for review methodology.
2. Read `Docs/.github/skills/audit-agile-artifacts/SKILL.md` to understand the validation gates.
3. Create `story-task-reviewer.agent.md` with:
   - **Purpose:** independent review of agile documents with inline suggestions.
   - **Core responsibilities:**
     - Validate story/task structure against `backlog-governance.instructions.md`.
     - Check metadata completeness (ID, Priority, Status, Responsible agent, Depends on, Blocks).
     - Verify acceptance criteria format (Given/When/Then).
     - Run `validate-task-pack.js` and `sync-backlog-index.js --dry-run`.
     - Create inline suggestions as PR review comments.
   - **Output format:** PR review with inline suggestions + verdict (approve/request-changes).
   - **Anti-patterns:**
     - Never approve without running script-based validation.
     - Never create suggestions without evidence paths.
     - Never review artifacts you just authored in the same session.
4. Commit the agent file.

**Acceptance:** agent file exists with review methodology, validation gates, inline suggestion format, and anti-patterns.

**depends_on:** E0-S2 completed

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

- **Given** `agile-quality-auditor.agent.md` and `audit-agile-artifacts/SKILL.md` are readable in the workspace,
- **When** `story-task-reviewer.agent.md` is created following the `create-specialist-agent` skill,
- **Then** the file exists with validation gate methodology, inline suggestion output format, and the two mandatory anti-patterns — verified by `ls` and `cat`.

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
