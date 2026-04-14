# Story E0-S1 — Repository Diagnosis and Readiness

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S1 |
| **Epic** | EPIC-0 — Environment Preparation for Exercise 1 |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `project-adaptation-analyst`, `git-ops`, `environment-validator` |
| **Skills** | `project-context-audit`, `fork-and-configure-remotes`, `validate-exercise-environment`, `produce-diagnosis-document` |
| **Instructions** | `project-adaptation.instructions.md`, `git-operations.instructions.md` |
| **Depends on** | — (first story in EPIC-0) |
| **Blocks** | E0-S2, E0-S3, E0-S4, EPIC-1 |
| Created at | 2026-04-09 18:08:58 -03 |
| Last updated | 2026-04-10 17:45:54 -03 |

---

## 1) User story

**As a** candidate preparing for the RDH interview exercise,
**I want to** create a validated personal fork of `nextjs-feature-flag-exercise`, confirm the base branch and remotes, execute all critical validation commands, and conduct a codebase audit,
**so that** I can start Exercise 1 implementation from a known-good baseline — with no environment ambiguity, no broken commands, and a clear understanding of the existing architecture and integration points.

---

## 2) Scope

### In scope

1. Fork `nextjs-feature-flag-exercise` to a personal GitHub account and clone it locally.
2. Configure remotes: `origin` = personal fork, `upstream` = original exercise repository.
3. Check out and confirm `exercise-1` as the working base branch.
4. Install all server and client dependencies (`pnpm install`).
5. Execute and confirm all critical validation commands:
   - `cd server && pnpm run build && pnpm run lint && pnpm test`
   - `cd client && pnpm run build && pnpm run lint`
6. Conduct a codebase audit covering:
   - Directory structure and architectural layer mapping.
   - Data flow from `shared/types.ts` through services, routes, and React Query to the UI.
   - All existing API endpoints and their handler signatures.
   - Current state of the `GET /api/flags` endpoint (no filtering implemented — `TODO` comment visible in route).
   - `getAllFlags()` service implementation: plain `SELECT * FROM flags ORDER BY created_at DESC`, no filtering parameters.
   - SQL.js (WASM SQLite) constraints affecting query construction and test isolation.
   - Existing test file (`server/src/__tests__/flags.test.ts`) and its `_resetDbForTesting()` isolation pattern.
   - Key shared types: `FeatureFlag`, `CreateFlagInput`, `UpdateFlagInput`, `Environment`, `FlagType`, `ApiError`.
   - Risk map for the filtering implementation task.
7. Read and internalize `TASK.md` acceptance criteria — record them as a checklist for Exercise 1 delivery.
8. Produce a brief diagnosis document as evidence.

### Out of scope

- Implementation of any filtering logic (belongs to EPIC-1).
- AI Layer configuration (belongs to E0-S2).
- Metrics baseline definition (belongs to E0-S3).
- Fork governance / secrets / workflow setup (belongs to E0-S2).

---

## 3) Acceptance criteria

### AC-1 — Fork and remotes

- **Given** I have a personal GitHub account
- **When** I create a fork of `nextjs-feature-flag-exercise` and clone it locally
- **Then** `git remote -v` shows `origin` pointing to my fork and `upstream` pointing to the original repository

### AC-2 — Base branch

- **Given** the fork is cloned locally
- **When** I check the active branch and branch list
- **Then** `exercise-1` is the checked-out branch and `main` has no direct commits from me

### AC-3 — Dependency installation

- **Given** the `exercise-1` branch is active
- **When** I run `pnpm install` in both `server/` and `client/`
- **Then** both complete successfully with no unresolved peer dependency errors

### AC-4 — All validation commands pass

- **Given** dependencies are installed
- **When** I run the full validation suite:
  ```
  cd server && pnpm run build && pnpm run lint && pnpm test
  cd client && pnpm run build && pnpm run lint
  ```
- **Then** all commands exit with code 0 and zero errors reported

### AC-5 — Codebase audit completed

- **Given** I have read `AGENTS.md`, `TASK.md`, and the key source files
- **When** I inspect the codebase architecture
- **Then** a diagnosis document exists recording all of the following:
  - Layer map: `shared/types.ts` → `validation.ts` (Zod) → `services/flags.ts` → `routes/flags.ts` → `client/src/api/flags.ts` → React Query → `App.tsx`
  - The `getAllFlags()` function has no query parameters and returns all rows via `SELECT * FROM flags ORDER BY created_at DESC`
  - The `GET /api/flags` route has a `// TODO (Workshop)` comment marking the exact insertion point for filtering
  - SQL.js constraint: queries must use `stmt.bind()` + `stmt.step()` with `try-finally { stmt.free() }`; `db.exec()` is used only for parameterless bulk reads
  - Test isolation pattern: `_resetDbForTesting()` must be called in `beforeEach` for new filter tests
  - All 5 `FeatureFlag` filterable fields confirmed: `environment`, `enabled`, `type`, `owner`, `name`
  - Identified integration points for Epic 1: `shared/types.ts` (add filter types), `services/flags.ts` (add `getFlagsFiltered()`), `routes/flags.ts` (parse query params), `client/src/api/flags.ts` (pass filter params), `App.tsx` (filter state + UI)
  - At least 3 risks recorded with mitigations

### AC-6 — TASK.md acceptance criteria internalized

- **Given** the diagnosis document is complete
- **When** I review `TASK.md`
- **Then** the document includes a verbatim checklist of all 11 acceptance criteria from `TASK.md`, plus notes on filter logic (AND semantics confirmed), UI responsiveness expectations, and "clear all filters" requirement

---

## 4) Tasks

### ✅ [Task E0-S1-T0 — Bootstrap AI Layer artifacts for this story](../tasks/task-E0S1T0-bootstrap-ai-layer.md)

**Goal:** create the three AI Layer artifacts referenced in this story's metadata, ensuring they exist before any subsequent task is executed.

**Context:** This story references `project-adaptation-analyst`, `project-context-audit`, and `project-adaptation.instructions.md` in its metadata — but none of these existed when the story was first written. T0 is a bootstrap task executed by the `agile-exercise-planner` agent at the very start of E0-S1, before fork setup begins.

**Artifacts to create:**

| Artifact | Path | Purpose |
|---|---|---|
| Agent | `Docs/.github/agents/project-adaptation-analyst.agent.md` | Audit specialist with pre-loaded exercise codebase knowledge |
| Agent | `Docs/.github/agents/git-ops.agent.md` | Git operations specialist with exercise guardrails (remotes, branches, commits, push) |
| Agent | `Docs/.github/agents/environment-validator.agent.md` | Validates local dev environment: install deps, run full validation suite, produce evidence report |
| Skill | `Docs/.github/skills/project-context-audit/SKILL.md` | 8-step systematic codebase audit process |
| Skill | `Docs/.github/skills/fork-and-configure-remotes/SKILL.md` | Step-by-step GitHub fork creation, clone, remote setup, and branch verification |
| Skill | `Docs/.github/skills/validate-exercise-environment/SKILL.md` | Full pnpm validation suite with individual exit-code capture and evidence report |
| Skill | `Docs/.github/skills/produce-diagnosis-document/SKILL.md` | Fills the 8-section codebase audit template from T2/T3 findings |
| Instruction | `Docs/.github/instructions/project-adaptation.instructions.md` | Behavioral constraints: scope guards, SQL.js checklist, timeline rules |
| Instruction | `Docs/.github/instructions/git-operations.instructions.md` | Always-on guardrails for git operations: branch safety, commit convention, remote rules, forbidden ops |
| Function | `Docs/.github/functions/git-info.js` | Returns branch name, short SHA, and remote URLs from a git repo — used in T2 (report header) and T4 (document header) |
| Function | `Docs/.github/functions/check-prereqs.js` | Verifies Node.js ≥ 18, pnpm, git, and active branch — used as gate in T2 sub-task 0 |

**Sub-tasks:**

1. Read `codebase-gap-analyst.agent.md` to understand existing agent structure and depth.
2. Create `project-adaptation-analyst.agent.md` with:
   - Pre-loaded layer architecture of `nextjs-feature-flag-exercise`
   - SQL.js constraint table (5 constraints with mitigations)
   - 5 filterable fields confirmed from `shared/types.ts`
   - Methodology for audit execution (T3) and diagnosis document production (T4)
   - Anti-patterns to avoid (no implementation, no Gold Standard audit, no stack migration)
3. Create `project-context-audit/SKILL.md` with:
   - 8-step audit process (types → server → client → TASK.md ACs → SQL.js → integration points → risk register → diagnosis document)
   - Quality checklist (10 items covering all required diagnosis sections)
   - Diagnosis document output format and header template
4. Create `project-adaptation.instructions.md` with:
   - Behavioral rules: audit before action, TASK.md as source of truth, SQL.js constraints mandatory, timestamps via `fs.statSync()`, timeline entry required
   - Integration point checklist for 6 architecture layers
   - What NOT to do guards (no implementation, no Gold Standard audit, no stack migration)
5. Create `git-ops.agent.md` with:
   - Methodology: (1) read state → (2) confirm safe context → (3) execute → (4) verify → (5) report evidence
   - Exercise git context table (branch rules, remote names, commit convention)
   - `fork-and-configure-remotes` as companion skill reference
   - Git command reference (state inspection, remote setup, commit+push, upstream sync)
   - Anti-patterns: never push to main or upstream; never commit without `git status`; never `--force` on `exercise-1`
6. Create `environment-validator.agent.md` with:
   - Step-by-step methodology: prerequisites → server install → client install → server suite → client suite → report
   - SQL.js WASM note and pnpm workspace note
   - `validate-exercise-environment` as companion skill reference
   - Blocker triage table (7 known failure modes with resolutions)
   - Output format: structured validation report table with 7 commands
7. Create `fork-and-configure-remotes/SKILL.md` with:
   - 6-step process: fork on GitHub → clone → add upstream → fetch → checkout + tracking → verify
   - Inputs/outputs tables
   - Validation checklist (6 items: fork URL, origin, upstream, branch tracking, active branch, main commits)
   - Error recovery table (5 known failure modes)
8. Create `validate-exercise-environment/SKILL.md` with:
   - 6-phase process: prerequisites → server install → client install → server suite → client suite → evidence report
   - SQL.js test note and pnpm workspace note
   - Blocker triage table
   - Quality checklist (7 items)
9. Create `produce-diagnosis-document/SKILL.md` with:
   - 8-section document template (environment state, architecture map, data flow, filtering gap, SQL.js constraints, integration points, risk register, TASK.md ACs)
   - Step-by-step process linking each section to its source (T2 or T3 sub-task)
   - Quality checklist (10 items, one per required content element)
10. Create `git-operations.instructions.md` with:
    - Branch safety rules (never push to main or upstream; always branch from exercise-1)
    - Conventional Commits convention with examples
    - Remote configuration rules
    - Staging rules
    - Upstream sync procedure
    - Evidence requirements per operation type
    - Forbidden operations list
11. Append one timeline entry per artifact created (agent: `agile-exercise-planner`).

**Acceptance:** all 9 files exist and are readable; `project-adaptation-analyst` references `project-context-audit`; `git-ops` references `fork-and-configure-remotes`; `environment-validator` references `validate-exercise-environment`.

**depends_on:** — (first task in the story)

---

### ✅ [Task E0-S1-T1 — Fork repository and configure remotes](../tasks/task-E0S1T1-fork-configure-remotes.md)

**Goal:** establish the authoritative personal fork as the execution source of truth.

**Agent:** `git-ops` | **Skill:** `fork-and-configure-remotes`

**Sub-tasks:**

1. Navigate to `https://github.com/<original-owner>/nextjs-feature-flag-exercise` and click **Fork**.
2. Clone the fork locally into `/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise` (or adjust to your workspace path).
3. Add `upstream` remote:
   ```bash
   git remote add upstream https://github.com/<original-owner>/nextjs-feature-flag-exercise.git
   ```
4. Verify remotes:
   ```bash
   git remote -v
   # origin    https://github.com/<your-fork>/nextjs-feature-flag-exercise.git (fetch)
   # origin    https://github.com/<your-fork>/nextjs-feature-flag-exercise.git (push)
   # upstream  https://github.com/<original-owner>/nextjs-feature-flag-exercise.git (fetch)
   # upstream  https://github.com/<original-owner>/nextjs-feature-flag-exercise.git (push)
   ```
5. Fetch upstream branches:
   ```bash
   git fetch upstream
   ```
6. Check out `exercise-1`:
   ```bash
   git checkout exercise-1
   ```
7. Confirm `exercise-1` tracks `upstream/exercise-1`:
   ```bash
   git branch -vv
   ```

**Acceptance:** `git remote -v` and `git branch -vv` output matches expected values above.

---

### ✅ [Task E0-S1-T2 — Validate local execution environment](../tasks/task-E0S1T2-validate-environment.md)

**Goal:** confirm all validation commands pass from a clean dependency state.

**Agent:** `environment-validator` | **Skill:** `validate-exercise-environment`

**Sub-tasks:**

0. Run prerequisites check:
   ```bash
   node "Docs/.github/functions/check-prereqs.js" exercise-1 /path/to/nextjs-feature-flag-exercise
   ```
   🔴 **Stop immediately if any check fails** — do not proceed to install until all prerequisites pass.

1. Install server dependencies:
   ```bash
   cd server && pnpm install
   ```
2. Install client dependencies:
   ```bash
   cd client && pnpm install
   ```
3. Run server validation suite:
   ```bash
   cd server && pnpm run build && pnpm run lint && pnpm test
   ```
4. Run client validation suite:
   ```bash
   cd client && pnpm run build && pnpm run lint
   ```
5. Capture branch/SHA for the evidence report, then record all exit codes and warnings:
   ```bash
   # Produces: "exercise-1 @ <sha>" for the report header
   node "Docs/.github/functions/git-info.js" /path/to/nextjs-feature-flag-exercise --branch-ref
   ```
   Paste the output into the `**Branch:**` line of the validation report in the diagnosis document.

**Acceptance:** all 5 commands exit with code `0`. Any non-zero exit is a blocker — must be resolved before proceeding.

**Known risks:**
- SQL.js requires a WASM binary at runtime; the test environment resolves it via the package, but network-restricted environments may fail to fetch the binary on first install.
- pnpm workspace protocol: ensure `pnpm-workspace.yaml` (if present) or individual installs are used — do NOT run `pnpm install` from the repo root unless a workspace file exists.

---

### ✅ [Task E0-S1-T3 — Conduct codebase audit](../tasks/task-E0S1T3-codebase-audit.md)

**Goal:** produce a concrete architectural map and identify all integration points for the filtering task.

**Sub-tasks:**

1. **Directory and layer map** — read and record:
   - `shared/types.ts`: `FeatureFlag`, `CreateFlagInput`, `UpdateFlagInput`, `Environment`, `FlagType`, `ApiError`
   - `server/src/db/`: `client.ts` (getDb/saveDb), `schema.ts` (CREATE TABLE DDL), `seed.ts`
   - `server/src/middleware/`: `validation.ts` (Zod schemas — `createFlagSchema`, `updateFlagSchema`), `error.ts` (`NotFoundError`, `ConflictError`, `ValidationError`)
   - `server/src/services/flags.ts`: `getAllFlags`, `getFlagById`, `getFlagByName`, `createFlag`, `updateFlag`, `deleteFlag`
   - `server/src/routes/flags.ts`: 5 route handlers; note the `// TODO (Workshop)` on `GET /`
   - `client/src/api/flags.ts`: fetch wrappers
   - `client/src/App.tsx`: TanStack Query `useQuery` / `useMutation` hooks
   - `client/src/components/flags-table.tsx` and `flag-form-modal.tsx`

2. **Data flow trace** — document the end-to-end path for a flag list read:
   ```
   App.tsx (useQuery)
   → client/src/api/flags.ts (fetch GET /api/flags)
   → server routes/flags.ts GET /
   → services/flags.ts getAllFlags()
   → db/client.ts getDb()
   → SQL.js db.exec('SELECT * FROM flags ORDER BY created_at DESC')
   → rowToFlag() × N
   → FeatureFlag[]
   ```

3. **Filtering gap analysis** — record the exact gap between current state and TASK.md requirements:
   | Layer | Current state | Required change |
   |---|---|---|
   | `shared/types.ts` | No filter types | Add `FlagFilters` interface |
   | `services/flags.ts` | `getAllFlags()` — no params | Add `getFilteredFlags(filters)` |
   | `routes/flags.ts` | No query param parsing | Parse `?environment=&enabled=&type=&owner=&name=` |
   | `client/src/api/flags.ts` | `GET /api/flags` — no params | Pass `URLSearchParams` from filters |
   | `client/src/App.tsx` | No filter state | Add filter state + query key |
   | UI | No filter controls | Add filter bar with active indicator + clear action |

4. **SQL.js constraint map** — document the two query patterns:
   - **Parameterless bulk read:** `db.exec('SELECT ...')` → `resultToRows()` → `rowToFlag()`
   - **Parameterized single read:** `db.prepare('SELECT ... WHERE id = ?')` → `stmt.bind([id])` → `stmt.step()` → `stmt.getAsObject()` → `try-finally { stmt.free() }`
   - **Filtered bulk read (to implement):** must use `db.prepare()` with dynamic `WHERE` clause and `stmt.bind()`, wrapped in `try-finally { stmt.free() }`.

5. **Test isolation pattern** — document `_resetDbForTesting()` call in `beforeEach`, confirm it exists in `flags.test.ts`.

6. **Risk identification** — record at minimum:
   - `R1`: SQL.js WASM loading failure in CI (mitigation: `copilot-setup-steps.yml` installs dependencies before runner firewall locks down npm)
   - `R2`: Dynamic `WHERE` clause construction for multi-filter queries — SQL injection risk if not using `stmt.bind()` (mitigation: always parameterize)
   - `R3`: `enabled` stored as `0`/`1` INTEGER in SQL.js — filter query must compare as integer, not boolean (mitigation: convert `enabled` query param to `0`/`1` in service layer)
   - `R4`: Tag filtering not in TASK.md scope — but `tags` is a JSON blob; attempting to filter by tag would require `LIKE '%tag%'` or JSON parsing (out of scope for Exercise 1)

---

### ✅ [Task E0-S1-T4 — Record diagnosis findings document](../tasks/task-E0S1T4-diagnosis-document.md)

**Goal:** produce a concise, structured evidence artifact that can be referenced by E0-S2, E0-S4, and EPIC-1.

**Agent:** `project-adaptation-analyst` | **Skill:** `produce-diagnosis-document`

**Format (minimum sections):**

```markdown
# Codebase Audit — nextjs-feature-flag-exercise

## Environment state
<!-- Run before filling this section:
     node "Docs/.github/functions/check-prereqs.js" exercise-1
     node "Docs/.github/functions/git-info.js" /path/to/nextjs-feature-flag-exercise
-->
- Node.js version: ...     ← from check-prereqs.js output
- pnpm version: ...        ← from check-prereqs.js output
- Branch: exercise-1 @ <sha>  ← from git-info.js output
- Validation commands: all pass ✅ / failures: ...

## Architecture map
(layer diagram + key file table)

## Data flow — GET /api/flags
(trace from useQuery to SQL.js and back)

## Filtering gap analysis
(table: layer → current state → required change)

## SQL.js constraints
(two patterns documented)

## Integration points for Epic 1
(ordered list of files to touch)

## Risk register
(R1–R4 minimum)

## TASK.md acceptance criteria checklist
(verbatim + notes)
```

**Acceptance:** document exists, all 8 sections filled, all 11 TASK.md acceptance criteria listed.

---

## 5) Dependencies

| Type | Item |
|---|---|
| **Input** | Personal GitHub account with fork permissions |
| **Input** | Local workspace with Node.js, pnpm, and git installed |
| **Input** | `nextjs-feature-flag-exercise` remote repository accessible |
| **Input** | `TASK.md` and `AGENTS.md` readable |
| **Blocks** | E0-S2 — AI Layer configuration (needs fork URL and confirmed base branch) |
| **Blocks** | E0-S3 — Measurement baseline (needs validation command results) |
| **Blocks** | E0-S4 — Closure and handoff (needs codebase audit) |
| **Blocks** | EPIC-1 — Baseline implementation (needs all of the above) |

---

## 6) Definition of Done

This story is done when **all** of the following are true:

- [ ] Personal fork created and linked to `upstream` remote; `git remote -v` output verified.
- [ ] `exercise-1` branch checked out and confirmed as working base.
- [ ] All 5 validation commands exit with code `0` (server: build + lint + test; client: build + lint).
- [ ] Codebase audit document produced with all 8 required sections.
- [ ] All 11 `TASK.md` acceptance criteria listed as a checklist in the audit document.
- [ ] Filtering gap analysis table completed for all 6 architectural layers.
- [ ] SQL.js constraint patterns documented (parameterless vs. parameterized).
- [ ] Risk register contains at minimum R1–R4.
- [ ] All findings committed to the fork repository (`.agents/diagnosis/codebase-audit.md`).
- [ ] All 9 AI Layer bootstrap artifacts exist in `Docs/.github/` (agents: `git-ops`, `environment-validator`, `project-adaptation-analyst`; skills: `fork-and-configure-remotes`, `validate-exercise-environment`, `produce-diagnosis-document`, `project-context-audit`; instructions: `git-operations.instructions.md`, `project-adaptation.instructions.md`).
- [ ] `git-ops` agent confirms fork remotes via `git remote -v` and `git branch -vv` evidence output.
- [ ] `environment-validator` report produced with all 7 commands listed with exit codes; included in diagnosis document Section 1.
- [ ] No critical blockers remain open.

---

## 7) Key file reference

| Purpose | Path |
|---|---|
| Shared types (filterable fields) | `shared/types.ts` |
| Service layer (filtering gap) | `server/src/services/flags.ts` |
| Route handler (TODO comment) | `server/src/routes/flags.ts` |
| Zod validation schemas | `server/src/middleware/validation.ts` |
| Error classes | `server/src/middleware/error.ts` |
| DB client (SQL.js) | `server/src/db/client.ts` |
| DB schema (table DDL) | `server/src/db/schema.ts` |
| Test file | `server/src/__tests__/flags.test.ts` |
| Client API wrapper | `client/src/api/flags.ts` |
| Main UI + React Query hooks | `client/src/App.tsx` |
| Exercise task | `nextjs-feature-flag-exercise/TASK.md` |
| Architecture guide | `nextjs-feature-flag-exercise/AGENTS.md` |

---

## 8) References

- [nextjs-feature-flag-exercise/TASK.md](../../../nextjs-feature-flag-exercise/TASK.md)
- [nextjs-feature-flag-exercise/AGENTS.md](../../../nextjs-feature-flag-exercise/AGENTS.md)
- [Docs/epics/Epic 0 — Environment Preparation for Exercise 1.md](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md)
- [Docs/manuals/interview-4-exercises-overview.md](../../manuals/interview-4-exercises-overview.md)
- [Docs/ai-development-environment-catalog.md](../../ai-development-environment-catalog.md)
