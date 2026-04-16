# Task E2-S2-T4 — Activate Claude Code workflows

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T4 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | E2-S2-T3 |
| **Blocks** | E2-S2-T5, E2-S2-T6 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 12:20:22 -03 |

---

## 1) Task statement

As a CI/CD engineer, I want to add `pr-review.yml` and `security-review.yml` Claude Code workflows to `.github/workflows/` on `exercise-2` so that automated PR reviews are active for Exercise 2 implementation.

---

## 2) Verifiable expected outcome

- `.github/workflows/` contains exactly 3 files: `claude.yml`, `pr-review.yml`, `security-review.yml`.
- All 3 pass YAML syntax validation.
- A commit exists on `exercise-2` with the message containing `[E2-S2-T4]`.

---

## 3) Detailed execution plan

**Description:** Add the 2 missing Claude Code workflow files (`pr-review.yml`, `security-review.yml`) to `.github/workflows/` on `exercise-2`. The `claude.yml` file already exists at the upstream base commit and does not need to be copied.

**Source:** Extract files from `exercise-1` branch using `git show`:
```bash
git show exercise-1:exercise-2-docs/pr-review.yml > .github/workflows/pr-review.yml
git show exercise-1:exercise-2-docs/security-review.yml > .github/workflows/security-review.yml
```

**Execution steps:**
1. Ensure `exercise-2` branch is checked out.
2. Verify `claude.yml` already exists: `ls .github/workflows/claude.yml`.
3. Extract the 2 workflow files from `exercise-1` branch (commands above).
4. Validate YAML syntax: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pr-review.yml'))"` (repeat for security-review.yml), or use `yq` if available.
5. Stage and commit:
   ```bash
   git add .github/workflows/pr-review.yml .github/workflows/security-review.yml
   git commit -m "ci: activate Claude Code PR review and security review workflows [E2-S2-T4]"
   ```

**Acceptance criteria:**
- **Given** `exercise-1` branch contains the workflow source files in `exercise-2-docs/`
- **When** `pr-review.yml` and `security-review.yml` are extracted and placed in `.github/workflows/`
- **Then** `.github/workflows/` contains `claude.yml` (from upstream), `pr-review.yml`, and `security-review.yml`; all 3 have valid YAML syntax

---

## 4) Architecture and security requirements

- Workflow files must not contain hardcoded secrets — they should reference `${{ secrets.ANTHROPIC_API_KEY }}`.
- The `git show` extraction must come from a trusted source branch (`exercise-1`).
- Validate YAML syntax before committing to prevent broken CI.
- Rollback: `git rm` the 2 files + commit, or `git reset --hard HEAD~1`.

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
