# Story E2-S2 — Repository configuration and workflow activation

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S2 |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `git-ops`, `copilot-env-specialist` |
| **Skills** | `fork-and-configure-remotes`, `copilot-env-setup` |
| **Instructions** | `git-operations.instructions.md`, `feature-flag-exercise.instructions.md` |
| **Depends on** | E2-S0 |
| **Blocks** | E2-S1 |
| Created at | 2026-04-16 02:31:41 -03 |
| Last updated | 2026-04-16 02:31:41 -03 |

---

## 1) User story

**As an** engineer preparing the exercise repository,
**I want** the `exercise-2` branch and Claude Code CI workflows fully configured,
**so that** the PIV Loop implementation can leverage automated PR reviews and `@claude` interactions.

---

## 2) Scope

### In scope

1. Create `exercise-2` branch from `f73979ed~1` (parent of first fork commit — upstream original state).
2. Cherry-pick documentation/agile/AI Layer artifacts from `exercise-1`.
3. Remove Exercise 1 automation workflows (5 files: `auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml`, `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml`, `copilot-push-signal.yml`).
4. Move Claude Code workflows from `exercise-2-docs/` to `.github/workflows/` (3 files: `claude.yml`, `pr-review.yml`, `security-review.yml`).
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

### AC-2 — Documentation artifacts cherry-picked

- **Given** `exercise-1` contains documentation/agile/AI Layer artifacts
- **When** relevant commits are cherry-picked to `exercise-2`
- **Then** `docs/`, `.agents/`, and `.github/` directories contain the planning and AI Layer infrastructure (not implementation code)

### AC-3 — Exercise 1 automation workflows removed

- **Given** Exercise 2 uses Claude Code instead of Copilot-driven automation
- **When** the workflow directory is updated
- **Then** `auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml`, `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml`, and `copilot-push-signal.yml` are absent from `.github/workflows/` on `exercise-2`

### AC-4 — Claude Code workflows activated

- **Given** Claude Code workflows exist in `exercise-2-docs/`
- **When** they are moved to `.github/workflows/`
- **Then** `claude.yml`, `pr-review.yml`, and `security-review.yml` are present and active in `.github/workflows/` on `exercise-2`

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

### Task E2-S2-T1 — Create exercise-2 branch from upstream state

**Description:** Create `exercise-2` branch from `f73979ed~1` (parent of first fork commit). This ensures the implementation starts from the original upstream state with zero Exercise 1 implementation code.

**Acceptance criteria:**
- **Given** the fork history is available
- **When** `exercise-2` is created from `f73979ed~1`
- **Then** the branch exists; `git log --oneline -1` shows the correct parent commit; no filtering code is present

---

### Task E2-S2-T2 — Cherry-pick documentation and agile artifacts

**Description:** Identify and cherry-pick commits from `exercise-1` that contain documentation, agile planning, and AI Layer infrastructure artifacts — excluding any implementation code.

**Acceptance criteria:**
- **Given** `exercise-1` has documentation commits
- **When** the relevant commits are cherry-picked
- **Then** `docs/`, `.agents/`, `.github/instructions/`, `.github/skills/`, `.github/agents/` directories are populated with planning artifacts on `exercise-2`

---

### Task E2-S2-T3 — Remove Exercise 1 automation workflows

**Description:** Remove the 5 Exercise 1 automation workflow files from `.github/workflows/` on `exercise-2`.

**Acceptance criteria:**
- **Given** the cherry-pick may have brought Exercise 1 workflows
- **When** the cleanup is done
- **Then** `auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml`, `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml`, `copilot-push-signal.yml` are gone; `copilot-setup-steps.yml` remains

---

### Task E2-S2-T4 — Activate Claude Code workflows

**Description:** Move `claude.yml`, `pr-review.yml`, `security-review.yml` from `exercise-2-docs/` to `.github/workflows/`.

**Acceptance criteria:**
- **Given** the workflow source files exist in `exercise-2-docs/`
- **When** they are moved to `.github/workflows/`
- **Then** all 3 files are in `.github/workflows/`; YAML syntax is valid

---

### Task E2-S2-T5 — Install Claude GitHub App and configure secret

**Description:** Install the Claude GitHub App on the fork and configure `ANTHROPIC_API_KEY` as a repository secret.

**Acceptance criteria:**
- **Given** the fork needs Claude Code integration
- **When** the app is installed and secret is set
- **Then** the Claude GitHub App appears in installed apps; `ANTHROPIC_API_KEY` is visible as a repository secret (manual verification)

---

### Task E2-S2-T6 — Push and validate with draft PR

**Description:** Push `exercise-2` branch, create a draft PR, and confirm Claude workflows trigger correctly.

**Acceptance criteria:**
- **Given** all configuration is in place
- **When** a draft PR is created
- **Then** at least `pr-review.yml` and `security-review.yml` appear in the PR's checks/actions

---

### Task E2-S2-T7 — Run full validation suite on exercise-2

**Description:** Run `pnpm run build && pnpm run lint && pnpm test` on server and `pnpm run build && pnpm run lint` on client to confirm the branch is clean.

**Acceptance criteria:**
- **Given** the branch has no filtering code
- **When** the validation suite runs
- **Then** server shows 16 passing tests; all build/lint checks pass with zero errors for both server and client

---
