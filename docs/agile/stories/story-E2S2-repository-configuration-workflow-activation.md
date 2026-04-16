# Story E2-S2 — Repository configuration and workflow activation

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2 |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `git-ops` |
| **Skills** | `fork-and-configure-remotes`, `copilot-env-setup` |
| **Instructions** | `git-operations.instructions.md`, `feature-flag-exercise.instructions.md` |
| **Depends on** | E2-S0 |
| **Blocks** | E2-S1 |
| Created at | 2026-04-16 02:31:41 -03 |
| Last updated | 2026-04-16 12:20:22 -03 |

---

## 1) User story

**As an** engineer preparing the exercise repository,
**I want** the `exercise-2` branch and Claude Code CI workflows fully configured,
**so that** the PIV Loop implementation can leverage automated PR reviews and `@claude` interactions.

---

## 2) Scope

### In scope

1. Create `exercise-2` branch from `f73979ed~1` (parent of first fork commit — upstream original state).
2. Copy `docs/`, `manuals/`, and `.github/` folders from a pre-saved backup of `exercise-1` into `exercise-2` (replaces cherry-pick approach to avoid artifact loss).
3. Clean up Exercise 1 automation workflows brought by the `.github/` copy (6 files: `auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml`, `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml`, `copilot-push-signal.yml`, `copilot-setup-steps.yml`).
4. Add `pr-review.yml` and `security-review.yml` Claude Code workflows from `exercise-1` branch (`exercise-2-docs/` directory); `claude.yml` already exists at upstream.
5. Install the Claude GitHub App on the fork.
6. Configure `ANTHROPIC_API_KEY` secret in the GitHub fork.
7. Push `exercise-2` and create a draft PR to validate workflows trigger correctly.
8. Run full validation suite on `exercise-2` — confirm server (16 tests, CRUD only) and client pass.

### Out of scope

1. AI Layer artifact creation (belongs to E2-S1).
2. Feature flag filtering implementation (belongs to E2-S3 and E2-S4).
3. Metrics capture and closure (belongs to E2-S5).

---

## 3) Acceptance criteria

### AC-1 — exercise-2 branch created from correct commit

- **Given** the upstream original state is at `f73979ed~1`
- **When** `exercise-2` branch is created
- **Then** it starts from the parent commit of the first fork commit (no Exercise 1 implementation code); server tests show 16 tests (CRUD only, no filtering tests)

### AC-2 — Documentation and AI Layer artifacts restored

- **Given** `exercise-1` artifacts have been saved to a backup location outside the repository
- **When** the `docs/`, `manuals/`, and `.github/` folders are copied into `exercise-2`
- **Then** `docs/`, `manuals/`, and `.github/` directories contain planning, agile, documentation, and AI Layer infrastructure artifacts (not implementation code); AI Layer review is deferred to E2-S1

### AC-3 — Exercise 1 automation workflows cleaned up

- **Given** the `.github/` copy from `exercise-1` includes Exercise 1 automation workflows
- **When** the cleanup is performed
- **Then** `auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml`, `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml`, `copilot-push-signal.yml`, and `copilot-setup-steps.yml` are absent from `.github/workflows/` on `exercise-2`; only `claude.yml` remains

### AC-4 — Claude Code workflows activated

- **Given** `claude.yml` already exists at upstream and `pr-review.yml` / `security-review.yml` exist on `exercise-1` branch in `exercise-2-docs/`
- **When** the 2 missing workflow files are extracted and placed in `.github/workflows/`
- **Then** `claude.yml`, `pr-review.yml`, and `security-review.yml` are all present and active in `.github/workflows/` on `exercise-2`

### AC-5 — Claude GitHub App installed and secret configured

- **Given** Claude Code workflows require authentication
- **When** the app and secret are configured
- **Then** the Claude GitHub App is installed on the fork; `ANTHROPIC_API_KEY` secret is configured in the GitHub fork settings

### AC-6 — Workflow validation via draft PR

- **Given** all 3 Claude workflows are in `.github/workflows/`
- **When** a draft PR is created
- **Then** at least `pr-review.yml` and `security-review.yml` trigger correctly on the draft PR

### AC-7 — Full validation suite passes on exercise-2

- **Given** the branch is clean (no filtering code)
- **When** the full validation suite runs
- **Then** `pnpm run build`, `pnpm run lint`, and `pnpm test` pass for server (16 tests); `pnpm run build` and `pnpm run lint` pass for client; zero errors

---

## 4) Tasks

### ✅ [Task E2-S2-T1 — Create exercise-2 branch from upstream state](../tasks/task-E2S2T1-create-exercise-2-branch-from-upstream-state.md)

**Description:** Create `exercise-2` branch from `f73979ed~1` (parent of first fork commit). This ensures the implementation starts from the original upstream state with zero Exercise 1 implementation code.

**Acceptance criteria:**
- **Given** the fork history is available
- **When** `exercise-2` is created from `f73979ed~1`
- **Then** the branch exists; `git log --oneline -1` shows the correct parent commit; no filtering code is present

---

### [Task E2-S2-T2 — Copy documentation, manuals, and AI Layer artifacts](../tasks/task-E2S2T2-cherry-pick-documentation-and-agile-artifacts.md)

**Description:** Copy pre-saved `docs/`, `manuals/`, and `.github/` folders from the backup location outside the repository into `exercise-2`. Replaces cherry-pick approach. AI Layer artifacts will be reviewed in E2-S1.

**Acceptance criteria:**
- **Given** the backup folders exist at the specified paths
- **When** the folders are copied into the `exercise-2` branch and committed
- **Then** `docs/`, `manuals/`, and `.github/` directories are fully populated with planning, agile, documentation, and AI Layer artifacts from `exercise-1`

---

### [Task E2-S2-T3 — Clean up Exercise 1 automation workflows](../tasks/task-E2S2T3-remove-exercise-1-automation-workflows.md)

**Description:** Remove the 6 Exercise 1 automation workflow files from `.github/workflows/` that were brought in by the T2 copy. Keep only `claude.yml` (from upstream).

**Acceptance criteria:**
- **Given** T2 copied `.github/` from exercise-1 backup
- **When** the cleanup is performed
- **Then** only `claude.yml` remains in `.github/workflows/`; all 6 Exercise 1 automation files are absent

---

### [Task E2-S2-T4 — Activate Claude Code workflows](../tasks/task-E2S2T4-activate-claude-code-workflows.md)

**Description:** Add `pr-review.yml` and `security-review.yml` to `.github/workflows/` by extracting them from `exercise-1` branch (`exercise-2-docs/` directory). `claude.yml` already exists at upstream.

**Acceptance criteria:**
- **Given** `exercise-1` branch contains the workflow source files in `exercise-2-docs/`
- **When** the 2 files are extracted and placed in `.github/workflows/`
- **Then** `.github/workflows/` contains all 3 Claude workflows; YAML syntax is valid

---

### [Task E2-S2-T5 — Install Claude GitHub App and configure secret](../tasks/task-E2S2T5-install-claude-github-app-and-configure-secret.md)

**Description:** Install the Claude GitHub App on the fork and configure `ANTHROPIC_API_KEY` as a repository secret.

**Acceptance criteria:**
- **Given** the fork needs Claude Code integration
- **When** the app is installed and secret is set
- **Then** the Claude GitHub App appears in installed apps; `ANTHROPIC_API_KEY` is visible as a repository secret (manual verification)

---

### [Task E2-S2-T6 — Push and validate with draft PR](../tasks/task-E2S2T6-push-and-validate-with-draft-pr.md)

**Description:** Push `exercise-2` branch, create a draft PR, and confirm Claude workflows trigger correctly.

**Acceptance criteria:**
- **Given** all configuration is in place
- **When** a draft PR is created
- **Then** at least `pr-review.yml` and `security-review.yml` appear in the PR's checks/actions

---

### [Task E2-S2-T7 — Run full validation suite on exercise-2](../tasks/task-E2S2T7-run-full-validation-suite-on-exercise-2.md)

**Description:** Run `pnpm run build && pnpm run lint && pnpm test` on server and `pnpm run build && pnpm run lint` on client to confirm the branch is clean.

**Acceptance criteria:**
- **Given** the branch has no filtering code
- **When** the validation suite runs
- **Then** server shows 16 passing tests; all build/lint checks pass with zero errors for both server and client

---
