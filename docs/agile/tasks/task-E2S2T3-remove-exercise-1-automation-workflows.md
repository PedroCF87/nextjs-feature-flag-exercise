# Task E2-S2-T3 — Clean up Exercise 1 automation workflows

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T3 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `git-ops` |
| **Depends on** | E2-S2-T2 |
| **Blocks** | E2-S2-T4 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 13:18:02 -03 |

---

## 1) Task statement

As a repository engineer, I want to remove the 6 Exercise 1 automation workflow files from `.github/workflows/` on `exercise-2` so that only `claude.yml` remains before adding Exercise 2 workflows in T4.

---

## 2) Verifiable expected outcome

- Only `claude.yml` remains in `.github/workflows/` on `exercise-2`.
- The 6 Exercise 1 automation files (`auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml`, `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml`, `copilot-push-signal.yml`, `copilot-setup-steps.yml`) are absent.
- A commit exists on `exercise-2` with the message containing `[E2-S2-T3]`.

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

## 4) Architecture and security requirements

- Only remove workflow files listed in the execution plan — never delete `claude.yml`.
- Verify listing before and after removal to prevent accidental deletion of needed files.
- No secrets or credentials are involved in this task.
- Rollback: `git reset --hard HEAD~1` to restore removed files if needed.

---

## 5) Validation evidence

Record evidence with exact commands and outputs:

- **Command(s) executed:**
  1. `ls -la .github/workflows/` → 7 files listed (6 E1 + claude.yml)
  2. `rm -f .github/workflows/auto-copilot-fix.yml .github/workflows/auto-merge-on-clean-review.yml .github/workflows/auto-ready-for-review.yml .github/workflows/auto-validate-copilot-fix.yml .github/workflows/copilot-push-signal.yml .github/workflows/copilot-setup-steps.yml`
  3. `ls -la .github/workflows/` → only claude.yml (1537 bytes)
  4. `git add -A .github/workflows/ && git commit -m "ci: remove Exercise 1 automation workflows from exercise-2 [E2-S2-T3]"`
  5. `git log --oneline -3`
- **Exit code(s):** All 0
- **Output summary:**
  - Before: 7 workflow files (6 E1 automation + claude.yml)
  - After: 1 workflow file (claude.yml only, 1537 bytes, unchanged)
  - Commit `a341a92`: 6 files changed, 913 deletions(-), all 6 E1 files deleted
- **Files created/updated:** 6 files deleted from `.github/workflows/`; `claude.yml` untouched
- **Risks found / mitigations:** `claude.yml` content verified identical to upstream base `04ea0ba` — not affected by removal

### Given / When / Then checks

- **Given** T2 copied `.github/` from exercise-1 backup, resulting in 7 workflow files on exercise-2,
- **When** the 6 Exercise 1 automation files are removed and committed as `a341a92`,
- **Then** only `claude.yml` remains in `.github/workflows/`, confirming no exercise-1 automation workflows will trigger on exercise-2.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E2-S2-T2 (`.github/` restored on exercise-2 with all artifacts)
- **Downstream items unblocked:** E2-S2-T4 (add `pr-review.yml` and `security-review.yml` — workflows directory is now clean)
- **Open risks (if any):** None — `claude.yml` preserved, 6 E1 files removed, branch committed at `a341a92`
