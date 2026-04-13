# Task E0-S5-T5 — Validate automation with dry-run

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S5-T5 |
| **Story** | [E0-S5 — Execution Automation for Epic 1](../stories/story-E0S5-execution-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer`, `agile-exercise-planner` |
| **Depends on** | E0-S5-T4 |
| **Blocks** | — |
| Created at | 2026-04-13 13:23:32 -03 |
| Last updated | 2026-04-13 13:23:32 -03 |

---

## 1) Task statement

Run an end-to-end dry-run validation of the 4 automation artifacts: invoke `scaffold-stories-from-epic` on Epic 1 to generate one story MD, run `create-story-task-pack` to generate its tasks, and execute `create-github-issue-from-task.js --dry-run` on one generated task. Document all commands, outputs, and exit codes as evidence.

---

## 2) Verifiable expected outcome

1. At least one story MD exists under `Docs/agile/stories/story-E1S*.md`.
2. `node Docs/.github/functions/validate-task-pack.js` confirms the generated story has all required sections.
3. At least one task MD exists under `Docs/agile/tasks/task-E1S*T*.md`.
4. `node create-github-issue-from-task.js <task-file> <repo> --dry-run` exits 0.
5. Dry-run output shows Issue title in format `[E1-S*-T*] <title>` with labels `epic:E1`, `story:E1-S*`, `priority:P*`.
6. Commands, exit codes, and truncated stdout are recorded in section 5 of this file.

---

## 3) Detailed execution plan

**Goal:** test the automation artifacts by generating one story from Epic 1 and one Issue from a task.

**Agent:** `agile-exercise-planner`

**Sub-tasks:**

1. Read [Epic 1 section 7](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md#7-candidate-stories-for-the-epic).
2. Invoke `scaffold-stories-from-epic` skill on Epic 1 to generate **ONE** story MD as a test (e.g., E1-S1).
3. Validate the generated story has all required sections using `validate-task-pack.js` (it can validate stories too).
4. Invoke `create-story-task-pack` skill on the generated story to produce task files.
5. Run `create-github-issue-from-task.js` in dry-run mode on one generated task.
6. Document the dry-run evidence:
   - Generated story file path and key metadata.
   - Generated task file paths.
   - Dry-run Issue content.
7. Commit all generated files as a dry-run package (can be deleted or kept as planning baseline).

**Acceptance:**
- At least one story MD generated from Epic 1.
- At least one task MD generated from the story.
- Dry-run Issue output valid and correctly formatted.
- Evidence documented in the story or preparation friction log.

**depends_on:** T4 completed

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

- **Given** all 4 automation artifacts exist (agent, 2 skills, 1 function),
- **When** I run the dry-run sequence: scaffold Epic 1 story → generate tasks → `--dry-run` one Issue,
- **Then** each step exits 0, the generated story has all required sections, and the dry-run Issue output has valid title, labels, and body.

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
