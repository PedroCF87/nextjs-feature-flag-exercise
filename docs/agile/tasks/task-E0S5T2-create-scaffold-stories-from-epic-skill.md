# Task E0-S5-T2 — Create `scaffold-stories-from-epic` skill

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S5-T2 |
| **Story** | [E0-S5 — Execution Automation for Epic 1](../stories/story-E0S5-execution-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `agile-exercise-planner` |
| **Depends on** | E0-S5-T1 |
| **Blocks** | — |
| Created at | 2026-04-13 13:23:32 -03 |
| Last updated | 2026-04-13 20:59:09 -03 |

---

## 1) Task statement

Create `docs/.github/skills/scaffold-stories-from-epic/SKILL.md` — a skill that parses an epic's section 7 (Candidate stories) outlines and generates detailed story MD files with all required sections, writing them to `docs/agile/stories/` and updating the epic file with markdown links.

---

## 2) Verifiable expected outcome

1. File `docs/.github/skills/scaffold-stories-from-epic/SKILL.md` exists and is readable.
2. Skill includes a `## Process` section with ordered phases: Read epic → Parse section 7 → Generate story files → Update epic links → Run `sync-backlog-index.js`.
3. Skill includes a full story template in a code block (`story-E<epic>S<n>-<slug>.md` format).
4. Skill defines a `Constraints` section with: never generate without ID, always `Status: Draft`, always include `## 4) Tasks` placeholder.
5. Skill defines an `Outputs` table listing: story MD files + updated epic file.
6. Template structure matches existing stories (metadata table, user story, scope, ACs, tasks sections).

---

## 3) Detailed execution plan

**Goal:** create a skill that parses an epic's section 7 and generates detailed story MD files.

**Agent:** `agile-exercise-planner` | **Skill:** `create-exercise-backlog`

**Artifacts to create:**
- `docs/.github/skills/scaffold-stories-from-epic/SKILL.md`

**Sub-tasks:**

1. Read `docs/.github/skills/create-exercise-backlog/SKILL.md` for backlog structure patterns.
2. Read `docs/.github/skills/create-story-task-pack/SKILL.md` for file naming conventions.
3. Read `docs/agile/stories/story-E0S1-repository-diagnosis.md` as the template for generated stories.
4. Create `scaffold-stories-from-epic/SKILL.md` with:
   - **Purpose:** generate story MD files from epic section 7 outlines.
   - **Inputs:** `EPIC_FILE` (absolute path to epic markdown).
   - **Process:**
     1. Read the epic file.
     2. Parse section 7 to extract story outlines (heading + description + key outputs).
     3. For each story outline:
        - Generate story ID: `E<epic>-S<n>` (sequential).
        - Generate file name: `story-E<epic>S<n>-<slug>.md` (slug from title).
        - Fill template sections: metadata, user story, scope (derived from description), ACs (placeholder or derived), tasks placeholder.
        - Write to `docs/agile/stories/`.
     4. Update the epic file: convert plain-text story headings to markdown links.
     5. Log all generated files.
   - **Outputs:** story MD files, updated epic file.
   - **Template:** include the full story template as a code block.
   - **Constraints:**
     - Never generate a story without at least: ID, Priority, Status, Responsible agent (placeholder OK).
     - Always set `Status: Draft` for new stories.
     - Always include a `## 4) Tasks` section header (even if empty).
5. Commit the skill file.

**Acceptance:** skill file exists with process, template, and constraints; template matches existing story structure.

**depends_on:** T1 completed

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

- **Given** `create-exercise-backlog/SKILL.md` and an existing story file as reference are readable,
- **When** `scaffold-stories-from-epic/SKILL.md` is created following the process phases,
- **Then** the skill file exists with a parseable story template, ordered process phases, and constraints that prevent malformed story generation.

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
