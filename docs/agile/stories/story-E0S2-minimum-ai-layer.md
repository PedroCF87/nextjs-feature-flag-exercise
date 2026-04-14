# Story E0-S2 — Minimum AI Layer Configuration

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S2 |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `copilot-config-refactor`, `rules-bootstrap`, `copilot-env-specialist`, `git-ops` |
| **Skills** | `copilot-layer-diff`, `config-migration-plan`, `global-rules-bootstrap`, `copilot-env-setup`, `adapt-artifact-to-fork-scope`, `validate-ai-layer-coverage` |
| **Instructions** | `copilot-config-governance.instructions.md`, `coding-agent.instructions.md`, `git-operations.instructions.md` |
| **Depends on** | [E0-S1 — Repository Diagnosis and Readiness](story-E0S1-repository-diagnosis.md) |
| **Blocks** | E0-S3, E0-S4, EPIC-1 |
| Created at | 2026-04-09 18:56:38 -03 |
| Last updated | 2026-04-12 16:19:17 -03 |

---

## 1) User story

**As a** candidate preparing for the RDH interview exercise,
**I want to** adapt and apply the minimum AI Layer artifacts from `Docs/.github/` to my personal fork of `nextjs-feature-flag-exercise`, configure fork governance (Actions, environment, secrets), and validate the setup with a dry-run workflow,
**so that** AI agents (GitHub Copilot, Claude Code) can operate in the fork with accurate context, consistent instructions, and required access — without manual re-configuration before each exercise session.

---

## 2) Scope

### In scope

1. Bootstrap all AI Layer management artifacts referenced in this story's metadata that do not yet exist in `Docs/.github/` (agents, skills, instructions for executing E0-S2 itself).
2. Adapt the workspace-level `Docs/.github/copilot-instructions.md` into a fork-scoped version and deploy it to `nextjs-feature-flag-exercise/.github/copilot-instructions.md`.
3. Select and adapt relevant instructions from `Docs/.github/instructions/` for the fork and deploy them to `nextjs-feature-flag-exercise/.github/instructions/`.
4. Adapt and deploy agents from `Docs/.github/agents/` to `nextjs-feature-flag-exercise/.github/agents/`:
   - `rdh-workflow-analyst.agent.md`
   - `codebase-gap-analyst.agent.md`
   - `technical-manual-writer.agent.md`
5. Adapt and deploy skills from `Docs/.github/skills/` to `nextjs-feature-flag-exercise/.github/skills/`:
   - `analyze-rdh-workflow/SKILL.md`
   - `gap-analysis/SKILL.md`
   - `write-technical-manual/SKILL.md`
   - `system-evolution-retro/SKILL.md`
6. Create `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` to enable the Copilot cloud agent environment.
7. Document the GitHub Actions `copilot` environment secrets checklist for the fork (including `ANTHROPIC_API_KEY` and any other required secrets).
8. Confirm and document branch protection policy for the fork (no direct commits to `main`; `exercise-1` as working base).
9. Commit all deployed artifacts with a traceable commit message.
10. Validate AI Layer coverage using the minimum readiness checklist (6 items per `ai-development-environment-catalog.md §6`).

### Out of scope

1. Full creation of all catalog agents, skills, and instructions beyond those needed for this story.
2. Functional implementation of filtering logic (belongs to EPIC-1).
3. Upgrade of the exercise tech stack (Bun, Drizzle, Biome — belongs to Epic 3 or later).
4. MCP server setup in the fork (scope: only if `copilot-env-setup` skill identifies it as blocking; otherwise deferred to a later story).
5. Creation of Claude Code commands (`.claude/commands/`) in the fork — deferred to E0-S4.

---

## 3) Acceptance criteria

### AC-1 — Global rules deployed

- **Given** the fork's `.github/` directory has no `copilot-instructions.md`
- **When** I adapt the workspace-level global rules and commit them to the fork
- **Then** `nextjs-feature-flag-exercise/.github/copilot-instructions.md` exists and contains:
  - Exercise-scoped stack context (Node.js ESM, Express v5, SQL.js, Zod, Vitest, React 19, Vite, Tailwind v4, TanStack Query v5)
  - Data flow architecture summary matching `AGENTS.md`
  - Validation commands (build/lint/test) for server and client
  - Branch rules (`exercise-1` as base, never push to `main`)
  - Commit convention (Conventional Commits in English)
  - Key file reference table (at minimum the 7 files from `AGENTS.md §Key Files Reference`)

### AC-2 — Instructions deployed

- **Given** the fork's `.github/instructions/` directory does not exist
- **When** I create the directory and deploy adapted instructions
- **Then** the following files exist in `nextjs-feature-flag-exercise/.github/instructions/`:
  - `feature-flag-exercise.instructions.md` (adapted from `Docs/.github/instructions/`)
  - `coding-agent.instructions.md` (exercise-specific behavioral rules for the implementation agent)
- **And** each file contains a valid `applyTo` front matter header

### AC-3 — Agents and skills deployed

- **Given** the fork's `.github/agents/` and `.github/skills/` directories do not exist
- **When** I create the directories and deploy adapted artifacts
- **Then** the following files exist in the fork:
  - `.github/agents/rdh-workflow-analyst.agent.md`
  - `.github/agents/codebase-gap-analyst.agent.md`
  - `.github/agents/technical-manual-writer.agent.md`
  - `.github/skills/analyze-rdh-workflow/SKILL.md`
  - `.github/skills/gap-analysis/SKILL.md`
  - `.github/skills/write-technical-manual/SKILL.md`
  - `.github/skills/system-evolution-retro/SKILL.md`
- **And** each adapted artifact contains a reference to the exercise repository context (not the workspace-level multi-repo context)

### AC-4 — `copilot-setup-steps.yml` created and dry-run succeeds

- **Given** the fork's `.github/workflows/` directory already has `claude.yml`, `pr-review.yml`, `security-review.yml`
- **When** I create `copilot-setup-steps.yml` following the `copilot-env-setup` skill process
- **Then** the workflow file exists at `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` with:
  - `jobs.copilot-setup-steps` as the exact job name (required by GitHub Copilot)
  - `environment: copilot` declared at job level
  - Steps to install Node.js, pnpm, and both `server/` and `client/` dependencies
  - A step that runs `cd server && pnpm run build && pnpm test` as a smoke test
  - `timeout-minutes` set to a value ≤ 59
- **And** a manual trigger (`workflow_dispatch`) is present for dry-run validation
- **And** at least one successful dry-run execution is documented (run ID or screenshot)

### AC-5 — Fork `copilot` environment and secrets configured

- **Given** the fork settings are accessible via GitHub repository settings
- **When** I follow the environment and secrets checklist from the `copilot-env-setup` skill
- **Then** a documented checklist exists confirming:
  - GitHub Actions environment named `copilot` created in the fork
  - `ANTHROPIC_API_KEY` secret added to the `copilot` environment (required by `claude.yml`)
  - All additional `COPILOT_MCP_*` secrets documented (even if not yet created — must be listed for later)
  - `GITHUB_TOKEN` permissions confirmed: `contents: write`, `pull-requests: write`, `issues: write`, `id-token: write`

### AC-6 — Branch protection confirmed

- **Given** the fork is the execution source of truth
- **When** I verify and document branch policies
- **Then** a documented policy statement exists confirming:
  - `main` is protected from direct pushes (branch protection rule in fork settings, or a written policy commitment if free-tier fork does not support branch protection rules)
  - `exercise-1` is the declared working base branch
  - All exercise work starts from `exercise-1` via feature branches or direct commits (never `main`)

### AC-7 — All artifacts committed with traceability

- **Given** all AI Layer artifacts have been created or adapted and each committed via its individual task PR
- **When** T5 verifies the fork state
- **Then** all 11 AI Layer artifact paths are present in the fork (each committed by T1–T4)
- **And** each commit on the fork follows Conventional Commits format
- **And** all commits are on a branch derived from `exercise-1` (not `main`)
- **And** the AI Layer coverage checklist (6 items) is fully signed in T5

---

## 4) Tasks

### [Task E0-S2-T0 — Bootstrap AI Layer management artifacts](../tasks/task-E0S2T0-bootstrap-ai-layer-management-artifacts.md)

**Goal:** create the management agents, skills, and instructions referenced in this story's metadata that do not yet exist in `Docs/.github/`. These artifacts are the tools used to *execute* E0-S2 itself.

**Context:** The catalog (`ai-development-environment-catalog.md`) lists `copilot-config-refactor`, `rules-bootstrap`, `copilot-env-specialist` as the responsible agents for this story, and `copilot-layer-diff`, `config-migration-plan`, `global-rules-bootstrap`, `copilot-env-setup` as the executing skills. `copilot-env-specialist` already exists and requires scope cleanup for the exercise. `adapt-artifact-to-fork-scope`, `validate-ai-layer-coverage`, `validate-workflow-file.js`, and `check-ai-layer-files.js` already exist and should be reused.

**Current state vs target:**

| Artifact | Path | Exists? | Action |
|---|---|---|---|
| Agent | `Docs/.github/agents/copilot-config-refactor.agent.md` | ❌ | Create |
| Agent | `Docs/.github/agents/rules-bootstrap.agent.md` | ❌ | Create |
| Agent | `Docs/.github/agents/copilot-env-specialist.agent.md` | ⚠️ | Update scope to exercise context |
| Skill | `Docs/.github/skills/copilot-layer-diff/SKILL.md` | ❌ | Create |
| Skill | `Docs/.github/skills/config-migration-plan/SKILL.md` | ❌ | Create |
| Skill | `Docs/.github/skills/global-rules-bootstrap/SKILL.md` | ❌ | Create |
| Skill | `Docs/.github/skills/copilot-env-setup/SKILL.md` | ❌ | Create |
| Skill | `Docs/.github/skills/adapt-artifact-to-fork-scope/SKILL.md` | ✅ | No action — already created |
| Skill | `Docs/.github/skills/validate-ai-layer-coverage/SKILL.md` | ✅ | No action — already created |
| Instruction | `Docs/.github/instructions/coding-agent.instructions.md` | ❌ | Create |
| Instruction | `Docs/.github/instructions/copilot-config-governance.instructions.md` | ❌ | Create |
| Function | `Docs/.github/functions/validate-workflow-file.js` | ✅ | No action — already created |
| Function | `Docs/.github/functions/check-ai-layer-files.js` | ✅ | No action — already created |

**Sub-tasks:**

1. Read `copilot-env-specialist.agent.md` to extract structure, methodology pattern, and anti-patterns format — use as baseline for new agents.
2. Create `copilot-config-refactor.agent.md`:
   - Responsibility: apply diffs of AI Layer artifacts to a target repository with traceability (reads existing files before writing, maintains a change log, validates consistency between agents/skills/instructions after each edit).
   - Methodology: (1) read existing target artifacts → (2) compute delta vs source → (3) apply changes file by file → (4) validate cross-references → (5) commit with traceable message.
   - Anti-patterns: never overwrite without reading the current state; never deploy workspace-level artifacts verbatim without scope adaptation; never skip the post-deploy consistency check.
3. Create `rules-bootstrap.agent.md`:
   - Responsibility: generate or update a `copilot-instructions.md` global rules file for a target repository by synthesizing tech stack, architecture patterns, validation commands, branch rules, and commit conventions from existing documentation.
   - Methodology: (1) read `AGENTS.md` / `CLAUDE.md` / `README.md` → (2) extract tech stack, data flow, commands, key files → (3) produce a `copilot-instructions.md` draft → (4) validate completeness against the 7-section checklist → (5) commit.
   - Anti-patterns: never include workspace-level context that does not apply to the target repo; never omit validation commands; never omit the validation commands section.
4. Create `copilot-layer-diff/SKILL.md`:
   - Purpose: produce a structured diff table comparing AI Layer artifacts between a source directory and a target directory.
   - Output format: `| Artifact | Source path | Target path | Status (missing/outdated/current) | Recommended action |`
   - Process: (1) list source artifacts → (2) list target artifacts → (3) compare by filename and frontmatter `applyTo` scope → (4) output diff table.
5. Create `global-rules-bootstrap/SKILL.md`:
   - Purpose: generate a `copilot-instructions.md` for a repository from available documentation.
   - Required sections: (1) Repository purpose, (2) Tech stack table, (3) Architecture / data flow, (4) Validation commands (build/lint/test), (5) Branch rules, (6) Commit convention, (7) Key file reference.
   - Input sources: `AGENTS.md`, `CLAUDE.md`, `README.md`, `TASK.md`.
6. Create `copilot-env-setup/SKILL.md`:
   - Purpose: create a `copilot-setup-steps.yml` and the companion `copilot` environment/secrets checklist for a target repository.
   - Mandatory rules: job name must be `copilot-setup-steps`; `environment: copilot` required when any env secret is used; `timeout-minutes ≤ 59`; manual trigger (`workflow_dispatch`) required for dry-run validation; MCP secrets must be named `COPILOT_MCP_*` and placed in the `copilot` environment.
   - Checklist output: numbered list of secrets/variables to configure, with name, source, and secret vs variable classification.
7. Create `config-migration-plan/SKILL.md`:
   - Purpose: produce an ordered migration plan for deploying AI Layer artifacts from a source (e.g., `Docs/.github/`) to a target repository (e.g., fork `.github/`).
   - Plan format: ordered table of steps with artifact name, source path, target path, adaptation notes, and dependency on prior steps.
   - Includes rollback strategy: what to do if a step fails (revert commit, restore previous file, re-run from checkpoint).
8. Create `coding-agent.instructions.md` in `Docs/.github/instructions/`:
   - `applyTo: **/*.ts, **/*.tsx, **/routes/**, **/services/**`
   - Rules: strict TypeScript only; never `any`; always use `next(error)` in Express routes; always free SQL.js statements in `try/finally`; always call `_resetDbForTesting()` in `beforeEach`; define new domain fields in `shared/types.ts` before implementing; run validation commands after every implementation phase; never accumulate broken state.
9. Create `copilot-config-governance.instructions.md` in `Docs/.github/instructions/`:
   - `applyTo: .github/copilot-instructions.md, .github/instructions/**, .github/agents/**, .github/skills/**`
   - Rules: always read existing artifact before editing; always scope `applyTo` headers correctly; never deploy workspace-level global rules verbatim to a specific-project repo; always update `Last updated` on edit; always append a `timeline.jsonl` entry on create/update; maintain cross-reference consistency (agents reference skills by name; skills reference instructions by name).
10. Create `adapt-artifact-to-fork-scope/SKILL.md` in `Docs/.github/skills/`:
   - **Purpose:** adapt workspace-level AI Layer artifacts (agents, skills, instructions) for deployment to a fork-scoped `.github/` directory by replacing workspace references with fork-relative equivalents.
   - **Process:** (1) read source artifact → (2) detect workspace-specific patterns (`applyTo` workspace paths, multi-repo context sentences, workspace folder references) → (3) apply substitution map (pattern → replacement) → (4) write to target path → (5) validate: no workspace paths remain; `applyTo` is fork-valid; exercise context present.
   - **Inputs:** `source_path`, `target_path`, optional `substitution_map`.
   - **Output:** adapted artifact at `target_path` + diff summary of changes applied.
   - **Quality checklist:** `applyTo` header valid; no workspace-relative paths; exercise stack context present; no workspace-only agent names; diff summary produced.
11. Create `validate-ai-layer-coverage/SKILL.md` in `Docs/.github/skills/`:
   - **Purpose:** run the 6-item minimum readiness checklist from `ai-development-environment-catalog.md §6` against a target fork and produce a pass/fail coverage report.
   - **Process:** (1) check codebase audit evidence → (2) check migration plan evidence → (3) verify agent files for each macro phase → (4) verify skill directories per phase → (5) verify instruction files → (6) check dry-run run ID documentation → (7) produce coverage report table.
   - **Output format:** `| Item | Expected evidence path | Found | Status |` — plus a gap action plan for any ❌ items.
   - **Report saved to:** `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md`.
   - **Quality checklist:** all 6 items checked; evidence paths documented; gap plan produced if any ❌; report file written.
12. Append one timeline entry per artifact created (agent: `agile-exercise-planner`).

**Acceptance:** all 11 new artifacts exist and are readable; `copilot-config-refactor` references `copilot-layer-diff`, `config-migration-plan`, and `adapt-artifact-to-fork-scope` skills; `rules-bootstrap` references `global-rules-bootstrap` skill; `copilot-env-specialist` references `copilot-env-setup` skill (add reference if missing).

**depends_on:** E0-S1 completed (fork URL confirmed, base branch validated).

---

### [Task E0-S2-T1 — Adapt and deploy global rules to fork](../tasks/task-E0S2T1-adapt-and-deploy-global-rules-to-fork.md)

**Goal:** produce a fork-scoped `copilot-instructions.md` and commit it to the fork, replacing the workspace-level multi-repo context with exercise-specific context.

**Agent:** `rules-bootstrap` | **Skill:** `global-rules-bootstrap`

**Sub-tasks:**

1. Read `Docs/.github/copilot-instructions.md` and `nextjs-feature-flag-exercise/AGENTS.md` and `nextjs-feature-flag-exercise/CLAUDE.md`.
2. Using the `global-rules-bootstrap` skill, produce a fork-scoped `copilot-instructions.md` containing:
   - **Repository purpose:** single-repo exercise; `exercise-1` as base branch; task = feature flag filtering.
   - **Tech stack table:** Node.js ESM, Express v5, SQL.js, Zod, Vitest, React 19, Vite, Tailwind v4, Radix UI, TanStack Query v5, TypeScript strict.
   - **Architecture / data flow:** `shared/types.ts` → `validation.ts` → `services/flags.ts` → `routes/flags.ts` → `client/src/api/flags.ts` → React Query → `App.tsx`.
   - **Validation commands:** server (`build + lint + test`) and client (`build + lint`).
   - **Branch rules:** `exercise-1` as working base; never commit directly to `main`.
   - **Commit convention:** Conventional Commits in English.
   - **Key file reference:** table with all 7 entries from `AGENTS.md §Key Files Reference`.
3. Write the file to `nextjs-feature-flag-exercise/.github/copilot-instructions.md`.
5. Commit and push: `git commit -m "feat(ai-layer): deploy fork-scoped global copilot rules"`.

**Acceptance:** file exists with all 7 required sections and references exercise-specific (not workspace-level) context.

**depends_on:** T0

---

### [Task E0-S2-T2 — Adapt and deploy instructions to fork](../tasks/task-E0S2T2-adapt-and-deploy-instructions-to-fork.md)

**Goal:** create `nextjs-feature-flag-exercise/.github/instructions/` and deploy adapted instruction files.

**Agent:** `copilot-config-refactor` | **Skill:** `adapt-artifact-to-fork-scope`

**Sub-tasks:**

1. Create directory `nextjs-feature-flag-exercise/.github/instructions/`.
2. Read `Docs/.github/instructions/feature-flag-exercise.instructions.md`.
3. Adapt it for fork deployment:
   - Update `applyTo` header: change from `../nextjs-feature-flag-exercise/**` to `**` (fork root applies to all files).
   - Remove any workspace-relative path references.
   - Confirm all SQL.js constraints are present.
4. Write to `nextjs-feature-flag-exercise/.github/instructions/feature-flag-exercise.instructions.md`.
5. Using the `coding-agent.instructions.md` created in T0, copy it to `nextjs-feature-flag-exercise/.github/instructions/coding-agent.instructions.md` (no adaptation needed — it was written for the exercise scope).
6. Commit and push both files: `git commit -m "feat(ai-layer): deploy adapted instructions to fork"`.

**Acceptance:** both instruction files exist in the fork's `.github/instructions/` with valid `applyTo` headers; no workspace-relative paths remain.

**depends_on:** T0

---

### [Task E0-S2-T3 — Adapt and deploy agents and skills to fork](../tasks/task-E0S2T3-adapt-and-deploy-agents-and-skills-to-fork.md)

**Goal:** create `.github/agents/` and `.github/skills/` in the fork and deploy adapted artifacts.

**Agent:** `copilot-config-refactor` | **Skill:** `adapt-artifact-to-fork-scope`

**Agents to deploy:**

| Agent | Source | Adaptation needed |
|---|---|---|
| `rdh-workflow-analyst.agent.md` | `Docs/.github/agents/` | Remove workspace context; focus on `resident-health-workshop-resources` for methodology reference |
| `codebase-gap-analyst.agent.md` | `Docs/.github/agents/` | Scope to `nextjs-feature-flag-exercise` vs Gold Standard comparison only |
| `technical-manual-writer.agent.md` | `Docs/.github/agents/` | Scope to generating exercise-specific technical manuals |

**Skills to deploy:**

| Skill | Source | Adaptation needed |
|---|---|---|
| `analyze-rdh-workflow/SKILL.md` | `Docs/.github/skills/` | None (methodology-agnostic) |
| `gap-analysis/SKILL.md` | `Docs/.github/skills/` | None (methodology-agnostic) |
| `write-technical-manual/SKILL.md` | `Docs/.github/skills/` | None (methodology-agnostic) |
| `system-evolution-retro/SKILL.md` | `Docs/.github/skills/` | None (methodology-agnostic) |

**Sub-tasks:**

1. Create directory `nextjs-feature-flag-exercise/.github/agents/`.
2. For each agent in the table: read source → apply adaptations listed → write to fork path.
3. Create directory `nextjs-feature-flag-exercise/.github/skills/analyze-rdh-workflow/` (and parallel directories for the other 3 skills).
4. Copy each skill's `SKILL.md` to the corresponding fork path.
5. Commit and push all 7 files: `git commit -m "feat(ai-layer): deploy adapted agents and skills to fork"`.

**Acceptance:** all 7 artifacts exist in the fork; each agent file contains a reference to the exercise stack or exercise-scoped context; no workspace-relative paths remain.

**depends_on:** T0

---

### [Task E0-S2-T4 — Create `copilot-setup-steps.yml` and configure governance](../tasks/task-E0S2T4-create-copilot-setup-steps-yml-and-configure-governance.md)

**Goal:** enable the Copilot cloud agent environment in the fork and document the governance checklist.

**Agent:** `copilot-env-specialist` | **Skill:** `copilot-env-setup`

**Sub-tasks:**

1. Read existing `nextjs-feature-flag-exercise/.github/workflows/claude.yml` to understand current permissions and secrets in use.
2. Read `Docs/.github/agents/copilot-env-specialist.agent.md` and, once available, the `copilot-env-setup/SKILL.md` created in T0.
3. Create `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` with the following structure:

```yaml
name: Copilot Setup Steps

on:
  workflow_dispatch:

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    environment: copilot
    timeout-minutes: 15
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          ref: exercise-1

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install server dependencies
        working-directory: server
        run: pnpm install --frozen-lockfile

      - name: Install client dependencies
        working-directory: client
        run: pnpm install --frozen-lockfile

      - name: Validate server (build + test)
        working-directory: server
        run: pnpm run build && pnpm test

      - name: Validate client (build)
        working-directory: client
        run: pnpm run build
```

4. Validate the file structure before staging:
   ```bash
   node "Docs/.github/functions/validate-workflow-file.js" \
     /path/to/nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml
   ```
   🔴 **Stop if any check fails** — fix the YAML before proceeding to step 5.
5. Stage the file.
6. Produce the governance checklist document (can be a section in the preparation friction log or a standalone note in `.agents/`):

**GitHub Actions `copilot` environment checklist:**

| # | Item | Type | How to configure | Status |
|---|---|---|---|---|
| 1 | Create `copilot` environment in fork repo → Settings → Environments → New environment | Setup | GitHub UI | [ ] |
| 2 | Add `ANTHROPIC_API_KEY` to `copilot` environment secrets | Secret | GitHub UI → Environment secrets | [ ] |
| 3 | Confirm `GITHUB_TOKEN` default permissions: `contents: write`, `pull-requests: write`, `issues: write`, `id-token: write` | Permission | Settings → Actions → General → Workflow permissions | [ ] |
| 4 | Add branch protection for `main` (prevent direct push) | Policy | Settings → Branches → Add rule → `main` | [ ] |

6. Document branch protection policy (confirm or set):
   - If free-tier fork supports branch protection rules: add a rule for `main` requiring PRs.
   - If not available: write a policy commitment statement in the preparation friction log.

**Acceptance:** `copilot-setup-steps.yml` exists with correct job name and all 7 steps; governance checklist produced; branch protection status documented.

**depends_on:** T0

---

### [Task E0-S2-T5 — Validate, commit, and sign readiness checklist](../tasks/task-E0S2T5-validate-commit-and-sign-readiness-checklist.md)

**Goal:** verify all T1–T4 AI Layer artifacts are committed in the fork, trigger the `copilot-setup-steps.yml` dry-run, and produce and commit the AI Layer coverage report.

**Agent:** `git-ops` | **Skills:** `validate-ai-layer-coverage` (sub-tasks 1 + 6 — AI Layer checklist), `copilot-env-setup` (sub-task 4 — dry-run trigger)

**Sub-tasks:**

1. Verify all T1–T4 AI Layer artifacts are committed in the fork using `check-ai-layer-files.js`:
   - [ ] Codebase audit completed for the exercise repository (E0-S1).
   - [ ] Migration plan produced (via `config-migration-plan` skill output).
   - [ ] Responsible agent and skill files exist for all macro phases — verify with:
     ```bash
     node "Docs/.github/functions/check-ai-layer-files.js" \
       /path/to/nextjs-feature-flag-exercise \
       .github/agents/rdh-workflow-analyst.agent.md \
       .github/agents/codebase-gap-analyst.agent.md \
       .github/agents/technical-manual-writer.agent.md \
       .github/skills/analyze-rdh-workflow/SKILL.md \
       .github/skills/gap-analysis/SKILL.md \
       .github/skills/write-technical-manual/SKILL.md \
       .github/skills/system-evolution-retro/SKILL.md \
       .github/instructions/feature-flag-exercise.instructions.md \
       .github/instructions/coding-agent.instructions.md \
       .github/copilot-instructions.md \
       .github/workflows/copilot-setup-steps.yml
     ```
     🔴 All 11 items must show ✅. Any ❌ is a blocker — return to the relevant task.
   - [ ] Copilot setup validated by `copilot-setup-steps.yml` dry-run (see sub-task 4).
2. Confirm the workflow file is structurally valid before triggering:
   ```bash
   node "Docs/.github/functions/validate-workflow-file.js" \
     /path/to/nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml
   ```
   Only proceed to the dry-run if all 4 checks pass ✅. Then go to fork → Actions → `Copilot Setup Steps` → Run workflow → confirm all 7 steps pass.
3. Record the run ID and pass/fail status in the preparation friction log.
4. Produce the AI Layer coverage report at `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` using `validate-ai-layer-coverage` skill.
5. Commit and push the coverage report: `git commit -m "chore(ai-layer): add AI Layer coverage report"`.
6. Confirm all 6 items in the minimum readiness checklist are satisfied.

**Acceptance:** all 11 AI Layer paths confirmed present in the fork (each committed by T1–T4); dry-run workflow run ID documented; AI Layer coverage report committed; all 6 checklist items marked complete.

**depends_on:** T1, T2, T3, T4 (all individual PRs must be merged before T5 starts)

---








## 5) Dependencies

| Type | Item |
|---|---|
| **Input** | E0-S1 completed — fork URL confirmed, `exercise-1` validated, all commands passing |
| **Input** | `Docs/.github/agents/copilot-env-specialist.agent.md` (existing — used as agent structure reference) |
| **Input** | `Docs/.github/copilot-instructions.md` (source for fork-scoped adaptation) |
| **Input** | `Docs/.github/instructions/feature-flag-exercise.instructions.md` (source for fork deployment) |
| **Input** | `Docs/.github/agents/rdh-workflow-analyst.agent.md`, `codebase-gap-analyst.agent.md`, `technical-manual-writer.agent.md` (sources) |
| **Input** | `Docs/.github/skills/analyze-rdh-workflow/`, `gap-analysis/`, `write-technical-manual/`, `system-evolution-retro/` (sources) |
| **Input** | GitHub account with fork admin access (to configure environments and secrets) |
| **Blocks** | E0-S3 — Measurement baseline (requires confirmed AI Layer so baseline metrics are AI-assisted) |
| **Blocks** | E0-S4 — Closure and handoff (requires AI Layer coverage checklist signed) |
| **Blocks** | EPIC-1 — Baseline implementation (requires all AI Layer artifacts active in fork) |

---

## 6) Definition of Done

This story is done when **all** of the following are true:

- [ ] All 11 management artifacts from T0 exist in `Docs/.github/` and are readable.
- [ ] `nextjs-feature-flag-exercise/.github/copilot-instructions.md` exists with all 7 required sections.
- [ ] `nextjs-feature-flag-exercise/.github/instructions/` contains `feature-flag-exercise.instructions.md` and `coding-agent.instructions.md`.
- [ ] `nextjs-feature-flag-exercise/.github/agents/` contains all 3 adapted agent files.
- [ ] `nextjs-feature-flag-exercise/.github/skills/` contains all 4 adapted skill directories with `SKILL.md`.
- [ ] `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` exists with job name `copilot-setup-steps` and `environment: copilot`.
- [ ] Governance checklist produced (environment, secrets, permissions, branch protection).
- [ ] `copilot-setup-steps.yml` dry-run executed successfully (run ID documented).
- [ ] All 11 deployed artifacts committed in one commit following Conventional Commits on a branch from `exercise-1`.
- [ ] All 6 items of `ai-development-environment-catalog.md §6` minimum readiness checklist satisfied for this exercise scope.
- [ ] No workspace-relative paths remaining in any fork-deployed artifact.
- [ ] `git-ops` agent used for T5 commit and push operations (verified with `git log --oneline -1` output as evidence).
- [ ] `validate-ai-layer-coverage` skill coverage report exists at `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` with all 6 items ✅.

---

## 7) Key file reference

| Purpose | Path |
|---|---|
| Source — Global rules | `Docs/.github/copilot-instructions.md` |
| Source — Exercise instructions | `Docs/.github/instructions/feature-flag-exercise.instructions.md` |
| Source — Agents | `Docs/.github/agents/rdh-workflow-analyst.agent.md`, `codebase-gap-analyst.agent.md`, `technical-manual-writer.agent.md` |
| Source — Skills | `Docs/.github/skills/analyze-rdh-workflow/`, `gap-analysis/`, `write-technical-manual/`, `system-evolution-retro/` |
| Source — Env specialist agent | `Docs/.github/agents/copilot-env-specialist.agent.md` |
| Source — Environment catalog | `Docs/ai-development-environment-catalog.md` |
| Target — Global rules (fork) | `nextjs-feature-flag-exercise/.github/copilot-instructions.md` |
| Target — Instructions (fork) | `nextjs-feature-flag-exercise/.github/instructions/` |
| Target — Agents (fork) | `nextjs-feature-flag-exercise/.github/agents/` |
| Target — Skills (fork) | `nextjs-feature-flag-exercise/.github/skills/` |
| Target — Setup workflow | `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml` |
| Architecture reference | `nextjs-feature-flag-exercise/AGENTS.md` |
| AI context reference | `nextjs-feature-flag-exercise/CLAUDE.md` |

---

## 8) References

- [nextjs-feature-flag-exercise/AGENTS.md](../../../nextjs-feature-flag-exercise/AGENTS.md)
- [nextjs-feature-flag-exercise/CLAUDE.md](../../../nextjs-feature-flag-exercise/CLAUDE.md)
- [Docs/epics/Epic 0 — Environment Preparation for Exercise 1.md](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md)
- [Docs/ai-development-environment-catalog.md](../../ai-development-environment-catalog.md)
- [Docs/agile/stories/story-E0S1-repository-diagnosis.md](story-E0S1-repository-diagnosis.md)
- [Docs/manuals/interview-4-exercises-overview.md](../../manuals/interview-4-exercises-overview.md)
