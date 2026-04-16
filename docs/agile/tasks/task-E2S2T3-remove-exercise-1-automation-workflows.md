# Task E2-S2-T3 — Clean up Exercise 1 automation workflows

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T3 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `git-ops` |
| **Depends on** | E2-S2-T2 |
| **Blocks** | E2-S2-T4 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 12:20:22 -03 |

---

## 1) Task statement

As a delivery agent, I want to execute E2-S2-T3 with complete traceability and explicit validation so that the parent story can progress without ambiguity.

---

## 2) Verifiable expected outcome

- A concrete deliverable exists for this task and is linked in this document.
- All required sections from the task definition are fully populated (no placeholders).
- Validation evidence is attached with command outputs and/or file references.

---

## 3) Detailed execution plan

**Description:** After T2 copies `.github/` from the exercise-1 backup, the workflows directory will contain Exercise 1 automation files that are not needed for Exercise 2. Remove them and keep only `claude.yml` (which came from upstream).

**Files to remove (if present):**
- `.github/workflows/auto-copilot-fix.yml`
- `.github/workflows/auto-merge-on-clean-review.yml`
- `.github/workflows/auto-ready-for-review.yml`
- `.github/workflows/auto-validate-copilot-fix.yml`
- `.github/workflows/copilot-push-signal.yml`
- `.github/workflows/copilot-setup-steps.yml`

**Execution steps:**
1. List current workflows: `ls .github/workflows/`
2. Remove Exercise 1 files (skip any that don't exist):
   ```bash
   cd .github/workflows/
   rm -f auto-copilot-fix.yml auto-merge-on-clean-review.yml auto-ready-for-review.yml auto-validate-copilot-fix.yml copilot-push-signal.yml copilot-setup-steps.yml
   ```
3. Verify only `claude.yml` remains: `ls .github/workflows/`
4. Stage and commit:
   ```bash
   git add -A .github/workflows/
   git commit -m "ci: remove Exercise 1 automation workflows from exercise-2 [E2-S2-T3]"
   ```

**Acceptance criteria:**
- **Given** T2 has copied `.github/` from the exercise-1 backup
- **When** the cleanup is performed
- **Then** only `claude.yml` remains in `.github/workflows/`; all 6 Exercise 1 automation files are absent

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
