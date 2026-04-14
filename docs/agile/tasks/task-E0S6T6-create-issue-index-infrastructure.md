# Task E0-S6-T6 — Create issue index infrastructure

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T6 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | [E0-S5-T3](task-E0S5T3-create-create-github-issue-from-task-function.md), [E0-S6-T5](task-E0S6T5-create-auto-merge-on-clean-review-yml.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:15:02 -03 |

---

## 1) Task statement

Create the issue-index infrastructure: `.github/issue-index.json` schema + `docs/.github/functions/generate-issue-index.js`, and update `create-github-issue-from-task.js` so every new issue is appended and sorted by epic/story/task.

---

## 2) Verifiable expected outcome

1. `docs/.github/functions/generate-issue-index.js` exists and exports a CLI entrypoint.
2. CLI supports `node generate-issue-index.js <agile-dir> <owner/repo> [--dry-run]`.
3. `.github/issue-index.json` template exists with shape `{ "tasks": [] }`.
4. `create-github-issue-from-task.js` appends new issue entries to `.github/issue-index.json` and preserves sorted order.
5. Dry-run generation outputs valid JSON matching schema keys: `epic`, `story`, `task`, `issue`, `title`, `status`, `agent`.
6. Existing E0/E1 task files are parsed without crashes.

---

## 3) Detailed execution plan

**Goal:** create the `.github/issue-index.json` schema, the generator function, and update `create-github-issue-from-task.js` to maintain the index.

**Agent:** `copilot-env-specialist`

**Artifacts to create:**
- `docs/.github/functions/generate-issue-index.js`
- Update to `docs/.github/functions/create-github-issue-from-task.js` (from E0-S5-T3)
- `.github/issue-index.json` template file

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §5 for the issue index schema.
2. Create `generate-issue-index.js`:
   - Reads all task files from `docs/agile/tasks/`.
   - Cross-references with `gh issue list --json number,title,state` to resolve Issue numbers.
   - Produces `.github/issue-index.json` with the following schema per entry:
     ```json
     { "epic": 1, "story": 1, "task": 1, "issue": 42, "title": "...", "status": "open", "agent": "task-implementer" }
     ```
   - Supports `--dry-run` mode.
   - CLI: `node generate-issue-index.js <agile-dir> <owner/repo> [--dry-run]`.
3. Update `create-github-issue-from-task.js`:
   - After creating an Issue, append an entry to `.github/issue-index.json`.
   - If the file does not exist, create it with the first entry.
   - Maintain sorted order by epic → story → task.
4. Create `.github/issue-index.json` template (empty `{ "tasks": [] }`).
5. Test `generate-issue-index.js --dry-run` with existing task files.
6. Commit: `feat(ci): add issue index generator and update task-to-issue function`.

**Acceptance:** `generate-issue-index.js` exists, dry-run produces valid JSON, `create-github-issue-from-task.js` appends to index, template file present.

**depends_on:** E0-S5-T3 completed, T5 completed

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
