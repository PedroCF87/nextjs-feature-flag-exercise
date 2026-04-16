# Task E2-S2-T4 — Activate Claude Code workflows

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2-T4 |
| **Story** | [E2-S2 — Repository configuration and workflow activation](../stories/story-E2S2-repository-configuration-workflow-activation.md) |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `copilot-env-specialist` |
| **Depends on** | E2-S2-T3 |
| **Blocks** | E2-S2-T5, E2-S2-T6 |
| Created at | 2026-04-16 02:36:01 -03 |
| Last updated | 2026-04-16 13:26:08 -03 |

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

- **Command(s) executed:**
  1. `ls .github/workflows/` → `claude.yml` only (precondition confirmed)
  2. `git show exercise-1:exercise-2-docs/pr-review.yml > .github/workflows/pr-review.yml`
  3. `git show exercise-1:exercise-2-docs/security-review.yml > .github/workflows/security-review.yml`
  4. `ls -la .github/workflows/` → 3 files: `claude.yml` (1537B), `pr-review.yml` (1109B), `security-review.yml` (528B)
  5. YAML validation via `python3 -c "import yaml; yaml.safe_load(...)"` → all 3 valid
  6. Secret reference check: all 3 use `${{ secrets.ANTHROPIC_API_KEY }}`, zero hardcoded keys
  7. `git add .github/workflows/pr-review.yml .github/workflows/security-review.yml && git commit -m "ci: activate Claude Code PR review and security review workflows [E2-S2-T4]"`
- **Exit code(s):** All 0
- **Output summary:**
  - Commit `d5ad823`: 2 files changed, 59 insertions(+)
  - `pr-review.yml` triggers on `pull_request` events (opened, synchronize, reopened)
  - `security-review.yml` triggers on `pull_request` events for security-focused review
  - All 3 workflows reference `${{ secrets.ANTHROPIC_API_KEY }}` — no hardcoded secrets
- **Files created/updated:** `.github/workflows/pr-review.yml`, `.github/workflows/security-review.yml` (created); `claude.yml` untouched
- **Risks found / mitigations:** None — YAML valid, secrets properly referenced, source branch (`exercise-1`) trusted

### Given / When / Then checks

- **Given** `exercise-2` has only `claude.yml` in `.github/workflows/` (T3 cleanup done) and `exercise-1` branch contains source files in `exercise-2-docs/`,
- **When** `pr-review.yml` and `security-review.yml` are extracted via `git show` and committed as `d5ad823`,
- **Then** `.github/workflows/` contains exactly 3 valid YAML files (`claude.yml`, `pr-review.yml`, `security-review.yml`), all referencing secrets properly.

---

## 6) Definition of Done

- [x] Expected outcome is objectively verifiable.
- [x] Dependencies are explicit and valid.
- [x] Security and architecture checks were performed.
- [x] Validation evidence is attached.
- [x] Parent story acceptance criteria impact is documented.

---

## 7) Notes for handoff

- **Upstream dependencies resolved:** E2-S2-T3 (Exercise 1 workflows removed, only `claude.yml` remained)
- **Downstream items unblocked:** E2-S2-T5 (install Claude GitHub App + configure `ANTHROPIC_API_KEY` secret), E2-S2-T6 (push + draft PR to trigger workflows)
- **Open risks (if any):** Workflows will not trigger until T5 configures the secret and T6 pushes the branch + opens a PR
