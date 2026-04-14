# Task E0-S6-T7 — Create PR tag system documentation

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S6-T7 |
| **Story** | [E0-S6 — CI/CD Pipeline for Issue-Driven Execution](../stories/story-E0S6-ci-cd-pipeline-automation.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | [E0-S6-T1](task-E0S6T1-create-copilot-push-signal-yml.md) |
| **Blocks** | — |
| Created at | 2026-04-13 23:11:22 -03 |
| Last updated | 2026-04-13 23:15:02 -03 |

---

## 1) Task statement

Create `docs/.github/instructions/pr-comment-tags.instructions.md` documenting the `[EX:...]` tag protocol used by automation workflows, including dictionary, placement rules, and examples for clean review, fix request, fix applied, and fix incomplete loops.

---

## 2) Verifiable expected outcome

1. `docs/.github/instructions/pr-comment-tags.instructions.md` exists.
2. File includes `applyTo` front matter scoped to workflow files.
3. Tag dictionary includes all 5 mandatory tags: `[EX:REVIEW-HAS-SUGGESTIONS]`, `[EX:REVIEW-CLEAN]`, `[EX:FIX-APPLIED]`, `[EX:TRIGGER-FIX-REQUEST]`, `[EX:FIX-INCOMPLETE]`.
4. Placement rules require tags at the start of comment body, each on its own line.
5. Examples section includes at least one example for each tag usage class.

---

## 3) Detailed execution plan

**Goal:** document the `[EX:...]` PR comment tag system as an instruction file.

**Agent:** `prompt-engineer`

**Artifacts to create:**
- `docs/.github/instructions/pr-comment-tags.instructions.md`

**Sub-tasks:**

1. Read `docs/references/github-workflow-system.md` §3 for the tag dictionary.
2. Create `pr-comment-tags.instructions.md`:
   - Front matter: `applyTo: ".github/workflows/**"`
   - Tag dictionary table: tag, posted by, when.
   - Placement rules: tags at start of comment body, own line, before other content.
   - Examples for each tag (clean review, fix request, fix applied, fix incomplete).
3. Commit: `docs(ci): add PR comment tag system instructions`.

**Acceptance:** instruction file exists with all 5 tags documented, placement rules, and examples.

**depends_on:** T1 completed (so the tag context exists)

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
