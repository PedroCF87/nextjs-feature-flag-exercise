# Task E0-S1-T0 — Bootstrap AI Layer Artifacts for E0-S1

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S1-T0 |
| **Story** | [E0-S1 — Repository Diagnosis and Readiness](../stories/story-E0S1-repository-diagnosis.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `agile-exercise-planner` |
| **Depends on** | — (first task in story) |
| **Blocks** | E0-S1-T1 |
| Created at | 2026-04-10 17:45:54 -03 |
| Last updated | 2026-04-13 14:02:29 -03 |

---

## 1) Task statement

Create all AI Layer artifacts — agents, skills, instructions, and utility functions — that are referenced in Story E0-S1's metadata but do not yet exist. These artifacts are prerequisites for every subsequent task in this story. No E0-S1 task can begin until these files exist and are readable.

> **Execution context — local VS Code only, no GitHub Issue:**
> T0 is executed by the `agile-exercise-planner` agent directly in the VS Code workspace, before the
> personal fork exists. It does **not** produce a GitHub Issue and does **not** require a git commit.
> The files created here live in `Docs/.github/` and will enter version control automatically when
> `Docs/` is moved into the fork as `docs/` in E0-S1-T1 Step 8. They will be committed to the fork
> in E0-S2 (when the AI Layer artifacts are adapted and deployed).

**Artifacts to create:**

| Type | Path | Purpose |
|---|---|---|
| Agent | `Docs/.github/agents/project-adaptation-analyst.agent.md` | Audit specialist for `nextjs-feature-flag-exercise` |
| Agent | `Docs/.github/agents/git-ops.agent.md` | Git operations specialist with exercise guardrails |
| Agent | `Docs/.github/agents/environment-validator.agent.md` | Validates local dev environment and produces evidence report |
| Skill | `Docs/.github/skills/project-context-audit/SKILL.md` | 8-step systematic codebase audit process |
| Skill | `Docs/.github/skills/fork-and-configure-remotes/SKILL.md` | Fork creation, clone, remote setup, branch verification |
| Skill | `Docs/.github/skills/validate-exercise-environment/SKILL.md` | Full pnpm validation suite with exit-code capture |
| Skill | `Docs/.github/skills/produce-diagnosis-document/SKILL.md` | 8-section codebase audit document template |
| Instruction | `Docs/.github/instructions/project-adaptation.instructions.md` | Behavioral constraints and SQL.js checklist |
| Instruction | `Docs/.github/instructions/git-operations.instructions.md` | Always-on git safety guardrails |
| Function | `Docs/.github/functions/git-info.js` | Returns branch name, short SHA, and remote URLs |
| Function | `Docs/.github/functions/check-prereqs.js` | Verifies Node.js ≥ 18, pnpm, git, and active branch |

---

## 2) Verifiable expected outcome

1. All 11 artifact files exist and are readable via `ls -la`.
2. `project-adaptation-analyst.agent.md` explicitly references `project-context-audit` skill.
3. `git-ops.agent.md` explicitly references `fork-and-configure-remotes` skill.
4. `environment-validator.agent.md` explicitly references `validate-exercise-environment` skill.
5. `git-info.js` exits with code `0` when run with a valid repo path and prints branch + SHA.
6. `check-prereqs.js` exits with code `0` on a correctly configured environment.
7. Each skill's `SKILL.md` contains an `## Inputs`, `## Outputs`, and `## Process` section.
8. Each instruction file contains an `applyTo` front-matter key targeting the correct glob.

---

## 3) Detailed execution plan

> **⚠️ Retroactive context notice:** All 11 artifacts listed in Section 1 were created before this task file was written (file `mtime` predates `Created at: 2026-04-10 17:45:54`). The steps below are the intended execution process — use them as verification guidance and as reference for re-execution if any artifact is missing or corrupted. **The execution entry point for a pre-existing environment is Phase 6 (validate and log).**

### Phase 1 — Read reference material
1. Read `Docs/.github/agents/codebase-gap-analyst.agent.md` (if it exists) to understand the existing agent format and depth used in this workspace.
2. Read `Docs/.github/skills/gap-analysis/SKILL.md` to understand the existing skill format.
3. Read `nextjs-feature-flag-exercise/AGENTS.md` and `nextjs-feature-flag-exercise/TASK.md` to pre-load exercise codebase knowledge into the agent definitions.
4. Read `shared/types.ts` to confirm the 5 filterable fields.

### Phase 2 — Create instruction files
5. Create `Docs/.github/instructions/project-adaptation.instructions.md` with:
   - `applyTo: agile/stories/story-E0S1*.md,agile/tasks/task-E0S1*.md`
   - Mandatory rules: audit before action, TASK.md as source of truth, SQL.js constraints table, timestamps via `fs.statSync()`, timeline entry required
   - Integration point checklist table (6 layers)
   - What NOT to do section (no implementation in E0-S1, no Gold Standard audit, no stack migration)
6. Create `Docs/.github/instructions/git-operations.instructions.md` with:
   - `applyTo: **/*.sh,**/.github/workflows/**,**/scripts/**`
   - Branch safety: never push to `main` or `upstream`; always branch from `exercise-1`
   - Conventional Commits table
   - Remote configuration rules
   - Staging rules (explicit `git add <file>`, never `git add .`)
   - Upstream sync procedure
   - Evidence requirements per operation type
   - Forbidden operations list

### Phase 3 — Create utility functions
7. Create `Docs/.github/functions/git-info.js`:
   - JSDoc: `@param {string} repoPath - Absolute path to the git repo` and `@param {boolean} branchRef - If true, outputs "<branch> @ <sha>"`
   - Uses `child_process.execSync` to run `git rev-parse --short HEAD`, `git branch --show-current`, `git remote get-url origin`, `git remote get-url upstream`
   - CLI entry point: `if (require.main === module)` reads `process.argv[2]` as repo path, `process.argv[3] === '--branch-ref'` flag
   - `module.exports` for programmatic use
8. Create `Docs/.github/functions/check-prereqs.js`:
   - Checks: `node --version` ≥ 18, `pnpm --version` exists, `git --version` exists, active branch matches expected (default `exercise-1`)
   - Prints ✅ or 🔴 per check; exits with code `1` if any check fails
   - CLI: `process.argv[2]` = expected branch, `process.argv[3]` = repo absolute path

### Phase 4 — Create skill files
9. Create `Docs/.github/skills/fork-and-configure-remotes/SKILL.md` with:
   - Inputs table, Outputs table
   - 6-step process: fork on GitHub → clone → add upstream → fetch → checkout + tracking → verify
   - Validation checklist (6 items)
   - Error recovery table (5 failure modes)
10. Create `Docs/.github/skills/validate-exercise-environment/SKILL.md` with:
    - 6-phase process: prerequisites → server install → client install → server suite → client suite → evidence report
    - SQL.js WASM note and pnpm workspace note
    - Blocker triage table (7 failure modes)
    - Quality checklist (8 items)
11. Create `Docs/.github/skills/produce-diagnosis-document/SKILL.md` with:
    - 8-section template (env state, architecture map, data flow, filtering gap, SQL.js constraints, integration points, risk register, TASK.md ACs)
    - Step-by-step process linking each section to its source task
    - Quality checklist (10 items)
12. Create `Docs/.github/skills/project-context-audit/SKILL.md` with:
    - 8-step audit process: types → server → client → TASK.md ACs → SQL.js → integration points → risk register → diagnosis
    - Quality checklist (10 items)
    - Output format and section headers

### Phase 5 — Create agent files
13. Create `Docs/.github/agents/project-adaptation-analyst.agent.md` with:
    - Pre-loaded layer architecture of `nextjs-feature-flag-exercise`
    - SQL.js constraint table (5 constraints with mitigations)
    - 5 filterable fields confirmed from `shared/types.ts`
    - Methodology for audit execution (T3) and diagnosis production (T4)
    - Anti-patterns section
14. Create `Docs/.github/agents/git-ops.agent.md` with:
    - Methodology: read state → confirm safe context → execute → verify → report evidence
    - Exercise git context table
    - `fork-and-configure-remotes` skill reference
    - Git command reference table
    - Anti-patterns section
15. Create `Docs/.github/agents/environment-validator.agent.md` with:
    - Step-by-step methodology
    - SQL.js WASM note
    - `validate-exercise-environment` skill reference
    - Blocker triage table
    - Output format: structured validation report

### Phase 6 — Validate and log
16. Run `ls -la` on each expected path to confirm existence.
17. Run `node Docs/.github/functions/git-info.js <repo-path>` and confirm exit 0.
18. Run `node Docs/.github/functions/check-prereqs.js` and confirm exit 0.
19. Confirm timeline entries exist in `Docs/agile/timeline.jsonl` for the created artifacts (hook automation writes these automatically via PostToolUse; use manual fallback per `timeline-tracker` skill only if hooks are unavailable).

**Stop condition:** all 11 files confirmed readable via `ls`. If any creation fails, resolve before proceeding.

> **No git commit in this task.** `Docs/` is not a git repository at T0 execution time and the
> personal fork does not yet exist. These files will enter git when `Docs/` is moved into the fork
> as `docs/` in E0-S1-T1 Step 8 and first committed in E0-S2.

---

## 4) Architecture and security requirements

### Input validation
- `git-info.js` must validate that `process.argv[2]` is a non-empty string; print error and exit `1` if missing.
- `check-prereqs.js` must not throw uncaught exceptions; wrap all `execSync` calls in `try/catch`.

### Secrets handling
- No secrets in any of these artifacts; no `.env` reads.
- Agent files must never hardcode repository URLs — use placeholder `<your-fork>` or `<original-owner>`.

### Rollback / fallback
- If a skill or agent file is created with incorrect content, overwrite it — no append-only restriction applies to these files (they are not JSONL logs).
- If `check-prereqs.js` itself fails to run (syntax error), fix before marking T0 done.

### Architecture boundary rules
- Utility functions in `Docs/.github/functions/` must not import anything outside Node.js built-ins (`fs`, `child_process`, `path`, `os`) — no npm installs allowed.
- Agent files belong in `Docs/.github/agents/` — never in `nextjs-feature-flag-exercise/` or root.
- Instruction front-matter `applyTo` must target only the intended scope — never `**/*`.

---

## 5) Validation evidence

### BDD verification

**Given** the `agile-exercise-planner` agent has executed all 11 creation steps (steps 5–15),  
**When** I run `ls -la Docs/.github/agents/ Docs/.github/skills/*/SKILL.md Docs/.github/instructions/ Docs/.github/functions/git-info.js Docs/.github/functions/check-prereqs.js`,  
**Then** every file is listed with a non-zero size.

**Given** `git-info.js` is created,  
**When** I run `node "Docs/.github/functions/git-info.js" "<repo-path>"`,  
**Then** the script exits with code `0` and prints the active branch and short SHA.

**Given** `check-prereqs.js` is created on a machine with Node.js ≥ 18, pnpm, and git installed,  
**When** I run `node "Docs/.github/functions/check-prereqs.js" exercise-1 "<repo-path>"`,  
**Then** the script exits with code `0` and prints ✅ for each check.

### Commands and expected outputs

```bash
# Confirm all artifact files exist
ls -la \
  "Docs/.github/agents/project-adaptation-analyst.agent.md" \
  "Docs/.github/agents/git-ops.agent.md" \
  "Docs/.github/agents/environment-validator.agent.md" \
  "Docs/.github/skills/project-context-audit/SKILL.md" \
  "Docs/.github/skills/fork-and-configure-remotes/SKILL.md" \
  "Docs/.github/skills/validate-exercise-environment/SKILL.md" \
  "Docs/.github/skills/produce-diagnosis-document/SKILL.md" \
  "Docs/.github/instructions/project-adaptation.instructions.md" \
  "Docs/.github/instructions/git-operations.instructions.md" \
  "Docs/.github/functions/git-info.js" \
  "Docs/.github/functions/check-prereqs.js"
# Expected: exit code 0, each line shows file size > 0

# Smoke-test git-info.js
node "Docs/.github/functions/git-info.js" "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise"
# Expected: prints branch name, short SHA, origin URL
# Note: upstream shows "(not set)" at T0 — the fork remote is configured in T1

# Smoke-test check-prereqs.js
node "Docs/.github/functions/check-prereqs.js" "exercise-1" "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise"
# Expected: exit code 0, ✅ for Node.js ≥ 18, pnpm, git, correct branch
```

**Exit code:** `0` for all commands above.  
**Affected files:** 11 new files under `Docs/.github/`.

---

## 6) Definition of Done

- [x] All 11 artifact files exist and are readable.
- [x] `project-adaptation-analyst.agent.md` references `project-context-audit` skill by name.
- [x] `git-ops.agent.md` references `fork-and-configure-remotes` skill by name.
- [x] `environment-validator.agent.md` references `validate-exercise-environment` skill by name.
- [x] `git-info.js` exits 0 with a valid repo path and prints branch + SHA.
- [x] `check-prereqs.js` exits 0 on a properly configured environment.
- [x] Both instruction files have valid `applyTo` front-matter.
- [x] All 4 skill files contain `## Inputs`, `## Outputs`, and `## Process` sections.
- [x] No unfilled stub values, incomplete sections, or temporary markers left in any artifact.
- [x] Timeline entries for all 11 artifacts confirmed present in `Docs/agile/timeline.jsonl` (verified: 155 matching lines via `grep -c`).
- [x] Story section `## 4) Tasks` updated to link `### Task E0-S1-T0` to this file.
