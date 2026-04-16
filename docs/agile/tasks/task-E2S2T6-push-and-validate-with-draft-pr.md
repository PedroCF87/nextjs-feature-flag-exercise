# Task E2-S2-T6 — Push and validate with draft PR

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T6 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `git-ops` |
| **Depends on** | E2-S2-T2, E2-S2-T4, E2-S2-T5 |
| **Blocks** | E2-S2-T7 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 12:20:22 -03 |

---

## 1) Task statement

As a repository engineer, I want to push the `exercise-2` branch to origin and create a draft PR so that Claude Code workflows can be validated against the PR trigger.

---

## 2) Verifiable expected outcome

- The `exercise-2` branch is pushed to `origin` (`PedroCF87/nextjs-feature-flag-exercise`).
- A draft PR is open from `exercise-2` to `exercise-1` (or `main`).
- At least `pr-review.yml` and `security-review.yml` appear in the PR’s checks/actions tab.

---

## 3) Detailed execution plan

**Description:** Push `exercise-2` branch to origin, create a draft PR, and confirm Claude workflows trigger correctly.

**Execution steps:**
1. Ensure `exercise-2` branch is checked out and all T1–T4 commits are present:
   ```bash
   git branch --show-current   # → exercise-2
   git log --oneline -6
   ```
2. Push the branch to origin:
   ```bash
   git push origin exercise-2
   ```
3. Create a draft PR (via GitHub CLI or web UI):
   ```bash
   gh pr create --base exercise-1 --head exercise-2 --title "feat: exercise-2 branch setup [E2-S2]" --body "Sets up exercise-2 branch with docs, AI Layer, and Claude Code workflows." --draft
   ```
   If `gh` is not available, create the PR manually at `https://github.com/PedroCF87/nextjs-feature-flag-exercise/compare/exercise-1...exercise-2`.
4. Verify workflow triggers:
   - Go to the PR’s "Checks" or "Actions" tab
   - Confirm `pr-review.yml` and `security-review.yml` appear (may show as pending, running, or completed)
   - If workflows don’t trigger, check: (a) `.github/workflows/` files are on the PR branch, (b) ANTHROPIC_API_KEY secret exists

**Acceptance criteria:**
- **Given** all configuration is in place (T1–T5 completed)
- **When** a draft PR is created
- **Then** at least `pr-review.yml` and `security-review.yml` appear in the PR's checks/actions

---

## 4) Architecture and security requirements

- Push only to the personal fork (`origin`), never to `upstream`.
- The draft PR should target `exercise-1` as the base branch.
- No secrets should appear in commit messages or PR description.
- Rollback: close the PR and delete the remote branch with `git push origin --delete exercise-2`.

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
