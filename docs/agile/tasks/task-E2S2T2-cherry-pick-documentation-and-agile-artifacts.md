# Task E2-S2-T2 — Copy documentation and agile artifacts to exercise-2

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T2 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `git-ops` |
| **Depends on** | E2-S2-T1 |
| **Blocks** | E2-S2-T6 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 12:20:22 -03 |

---

## 1) Task statement

As a delivery agent, I want to execute E2-S2-T2 with complete traceability and explicit validation so that the parent story can progress without ambiguity.

---

## 2) Verifiable expected outcome

- A concrete deliverable exists for this task and is linked in this document.
- All required sections from the task definition are fully populated (no placeholders).
- Validation evidence is attached with command outputs and/or file references.

---

## 3) Detailed execution plan

**Description:** Copy pre-saved `docs/`, `manuals/`, and `.github/` folders from the backup location outside the repository into the `exercise-2` branch. This replaces the original cherry-pick approach to avoid losing documents that exist on `exercise-1` but might not survive selective cherry-picks. The `.github/` artifacts will be reviewed on the `exercise-2` branch to decide which to keep or adjust.

**Backup source paths (already saved by the user):**
- `/delfos/Projetos/ITBC - Desafio RDH/docs`
- `/delfos/Projetos/ITBC - Desafio RDH/manuals`
- `/delfos/Projetos/ITBC - Desafio RDH/.github`

**Execution steps:**
1. Ensure `exercise-2` branch is checked out and clean (`git status`).
2. Copy the backup folders into the repository root:
   ```bash
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/docs" ./docs
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/manuals" ./manuals
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/.github" ./.github
   ```
3. Stage and verify the copied content:
   ```bash
   git add docs/ manuals/ .github/
   git status
   ```
4. Commit with traceability:
   ```bash
   git commit -m "docs: restore docs, manuals, and .github artifacts from exercise-1 backup [E2-S2-T2]"
   ```

**Note:** The `.github/` copy will bring AI Layer artifacts (instructions, skills, agents, copilot-instructions.md) and workflows from exercise-1. Workflow cleanup happens in T3; AI Layer review is deferred to E2-S1.

**Acceptance criteria:**
- **Given** the backup folders exist at the specified paths outside the repository
- **When** the folders are copied into the `exercise-2` branch and committed
- **Then** `docs/`, `manuals/`, and `.github/` directories are fully populated on `exercise-2` with planning, agile, documentation, and AI Layer artifacts from `exercise-1`

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
