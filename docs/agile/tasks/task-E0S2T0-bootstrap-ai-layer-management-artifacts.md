# Task E0-S2-T0 — Bootstrap AI Layer management artifacts

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S2-T0 |
| **Story** | [E0-S2 — Minimum AI Layer Configuration](../stories/story-E0S2-minimum-ai-layer.md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer` |
| **Depends on** | [E0-S1 — Repository Diagnosis and Readiness](../stories/story-E0S1-repository-diagnosis.md) |
| **Blocks** | E0-S2-T1, E0-S2-T2, E0-S2-T3, E0-S2-T4 |
| Created at | 2026-04-11 15:14:45 -03 |
| Last updated | 2026-04-14 13:30:00 -03 |

---

## 1) Task statement

> **Execution context:** T0 runs **locally in VS Code** — no GitHub Issue.
> After E0-S1-T1 (Step 8), the `Docs/` folder was moved to `docs/` inside the fork.
> Define `REPO_ROOT` once in any terminal session used for this task:
> ```bash
> REPO_ROOT="$(git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" rev-parse --show-toplevel)"
> ```
> T0 ends with a feature branch commit + push so that T1–T4 cloud agents can find the
> new artifacts committed in the fork.

Create the 8 missing AI Layer management artifacts in `docs/.github/` that serve as the execution tooling for Story E0-S2 itself. These artifacts must exist before tasks T1–T4 begin so that the responsible agents (`rules-bootstrap`, `copilot-config-refactor`, `copilot-env-specialist`) have the skills and instructions they need to operate.

**Updated current state (verified 2026-04-11):**

| Artifact | Path | Exists? | Action |
|---|---|---|---|
| Agent | `docs/.github/agents/copilot-config-refactor.agent.md` | ❌ | Create |
| Agent | `docs/.github/agents/rules-bootstrap.agent.md` | ❌ | Create |
| Agent | `docs/.github/agents/copilot-env-specialist.agent.md` | ⚠️ | Update — strip Delfos Connect monorepo context (Methodology Step 3 sub-project list; Project Context table); scope to exercise workspace; verify `copilot-env-setup` skill reference is present |
| Skill | `docs/.github/skills/copilot-layer-diff/SKILL.md` | ❌ | Create |
| Skill | `docs/.github/skills/config-migration-plan/SKILL.md` | ❌ | Create |
| Skill | `docs/.github/skills/global-rules-bootstrap/SKILL.md` | ❌ | Create |
| Skill | `docs/.github/skills/copilot-env-setup/SKILL.md` | ❌ | Create |
| Skill | `docs/.github/skills/adapt-artifact-to-fork-scope/SKILL.md` | ✅ | No action — already created |
| Skill | `docs/.github/skills/validate-ai-layer-coverage/SKILL.md` | ✅ | No action — already created |
| Instruction | `docs/.github/instructions/coding-agent.instructions.md` | ❌ | Create |
| Instruction | `docs/.github/instructions/copilot-config-governance.instructions.md` | ❌ | Create |
| Function | `docs/.github/functions/validate-workflow-file.js` | ✅ | No action — already created |
| Function | `docs/.github/functions/check-ai-layer-files.js` | ✅ | No action — already created |

**Net actions: 8 new files to create + 1 existing file to update (`copilot-env-specialist.agent.md`).**

---

## 2) Verifiable expected outcome

1. `docs/.github/agents/copilot-config-refactor.agent.md` exists, is readable, and references skills `copilot-layer-diff`, `config-migration-plan`, and `adapt-artifact-to-fork-scope`.
2. `docs/.github/agents/rules-bootstrap.agent.md` exists, is readable, and references skill `global-rules-bootstrap`.
3. `docs/.github/skills/copilot-layer-diff/SKILL.md` exists with a diff-table output format.
4. `docs/.github/skills/config-migration-plan/SKILL.md` exists with an ordered migration plan table and rollback strategy.
5. `docs/.github/skills/global-rules-bootstrap/SKILL.md` exists with all 7 required section definitions.
6. `docs/.github/skills/copilot-env-setup/SKILL.md` exists with job name, environment, timeout rules, and checklist output format.
7. `docs/.github/instructions/coding-agent.instructions.md` exists with valid `applyTo` header.
8. `docs/.github/instructions/copilot-config-governance.instructions.md` exists with valid `applyTo` header.

Command that confirms all 8 exist with exit code `0`:
```bash
REPO_ROOT="$(git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/agents/copilot-config-refactor.agent.md" \
  ".github/agents/rules-bootstrap.agent.md" \
  ".github/skills/copilot-layer-diff/SKILL.md" \
  ".github/skills/config-migration-plan/SKILL.md" \
  ".github/skills/global-rules-bootstrap/SKILL.md" \
  ".github/skills/copilot-env-setup/SKILL.md" \
  ".github/instructions/coding-agent.instructions.md" \
  ".github/instructions/copilot-config-governance.instructions.md"
```

Expected: all 8 lines show `✅`.

---

## 3) Detailed execution plan

### Step 1 — Read the baseline agent for structure reference

Read `docs/.github/agents/copilot-env-specialist.agent.md` using `read_file` to extract:
- Metadata structure (description, mode, skills references)
- Methodology pattern (numbered phases)
- Anti-patterns format

Use this as the **structural template** for the two new agents.

⚠️ **Important:** the existing `copilot-env-specialist.agent.md` has **Delfos Connect monorepo context** embedded in its Methodology Step 3 (`delfos-connect/`, `delfos-bot/`) and Project Context table (Directus CMS, Redis, Delfos Bot port 3001). When using it as a template, strip all Delfos-specific content — do not carry it into the new agents. This agent itself will be updated in Step 10.

**Stop condition:** template structure understood; do not proceed without reading it.

### Step 2 — Create `copilot-config-refactor.agent.md`

Create `docs/.github/agents/copilot-config-refactor.agent.md`:
- **Responsibility:** apply diffs of AI Layer artifacts to a target repository with traceability — reads existing files before writing, maintains a change log, validates consistency between agents/skills/instructions after each edit.
- **Methodology phases:**
  1. Read existing target artifacts.
  2. Compute delta vs source.
  3. Apply changes file by file using `read_file` + `replace_string_in_file` / `create_file`.
  4. Validate cross-references (agents reference their skills; instructions have valid `applyTo`).
  5. Commit with traceable message via `git-ops`.
- **Skills referenced:** `copilot-layer-diff`, `config-migration-plan`, `adapt-artifact-to-fork-scope`.
- **Anti-patterns:** never overwrite without reading current state; never deploy workspace-level artifacts verbatim without scope adaptation; never skip post-deploy consistency check.

### Step 3 — Create `rules-bootstrap.agent.md`

Create `docs/.github/agents/rules-bootstrap.agent.md`:
- **Responsibility:** generate or update a `copilot-instructions.md` global rules file for a target repository by synthesizing tech stack, architecture patterns, validation commands, branch rules, and commit conventions from existing documentation.
- **Methodology phases:**
  1. Read `AGENTS.md` / `CLAUDE.md` / `README.md` / `TASK.md` of target repo.
  2. Extract tech stack, data flow, commands, key files.
  3. Produce `copilot-instructions.md` draft with all 7 required sections.
  4. Validate completeness against the 7-section checklist.
  5. Stage file (do not commit — bundled with other T1–T4 artifacts in T5).
- **Skills referenced:** `global-rules-bootstrap`.
- **Anti-patterns:** never include workspace-level context inapplicable to target repo; never omit validation commands section; never omit key file reference table.

### Step 4 — Create `copilot-layer-diff/SKILL.md`

Create directory `docs/.github/skills/copilot-layer-diff/` and write `SKILL.md`:
- **Purpose:** produce a structured diff table comparing AI Layer artifacts between a source directory and a target directory.
- **Output format:** `| Artifact | Source path | Target path | Status (missing/outdated/current) | Recommended action |`
- **Process:**
  1. List source artifacts (agents, skills, instructions, workflows).
  2. List target artifacts.
  3. Compare by filename and frontmatter `applyTo` scope — file present in target with matching `applyTo` = `current`; file missing = `missing`; file present but `applyTo` mismatched = `outdated`.
  4. Output diff table with recommended action per row.

### Step 5 — Create `global-rules-bootstrap/SKILL.md`

Create directory `docs/.github/skills/global-rules-bootstrap/` and write `SKILL.md`:
- **Purpose:** generate a `copilot-instructions.md` for a repository from available documentation.
- **Required sections (7):**
  1. Repository purpose (scope, working branch, exercise task)
  2. Tech stack table (language, framework, runtime, testing, styling)
  3. Architecture / data flow (source-of-truth types → validation → service → route → client → UI)
  4. Validation commands (build / lint / test per sub-project)
  5. Branch rules (working base, never-push policy)
  6. Commit convention (Conventional Commits with examples)
  7. Key file reference table (file purpose → path)
- **Input sources:** `AGENTS.md`, `CLAUDE.md`, `README.md`, `TASK.md`.

### Step 6 — Create `copilot-env-setup/SKILL.md`

Create directory `docs/.github/skills/copilot-env-setup/` and write `SKILL.md`:
- **Purpose:** create a `copilot-setup-steps.yml` and the companion `copilot` environment/secrets checklist for a target repository.
- **Mandatory rules:**
  - Job name must be exactly `copilot-setup-steps`.
  - `environment: copilot` required at the job level when any env secret is used.
  - `timeout-minutes` ≤ 59.
  - `workflow_dispatch` trigger required for dry-run validation.
  - MCP secrets must be named `COPILOT_MCP_*` and placed in the `copilot` environment.
- **Validation step:** run `validate-workflow-file.js` after writing — stop if any check fails.
- **Checklist output:** numbered list of secrets/variables with name, source, and `secret` vs `variable` classification.

### Step 7 — Create `config-migration-plan/SKILL.md`

Create directory `docs/.github/skills/config-migration-plan/` and write `SKILL.md`:
- **Purpose:** produce an ordered migration plan for deploying AI Layer artifacts from a source (e.g., `docs/.github/`) to a target repository (e.g., fork `.github/`).
- **Plan format:** ordered table `| Step | Artifact | Source path | Target path | Adaptation notes | Depends on step |`
- **Rollback strategy:** (a) if file write fails → `git checkout -- <file>` in target; (b) if post-deploy validation fails → `git reset HEAD <file>` + revert; (c) always checkpoint via `git stash` before batch writes.

### Step 8 — Create `coding-agent.instructions.md`

Create `docs/.github/instructions/coding-agent.instructions.md`:

```
---
applyTo: "**/*.ts,**/*.tsx,**/routes/**,**/services/**"
---
```

Rules:
- Strict TypeScript only — never use `any` or implicit null.
- Always use `next(error)` in Express route handlers; never `throw` directly in a route.
- Always free SQL.js prepared statements in `try/finally stmt.free()`.
- Always call `_resetDbForTesting()` in `beforeEach` and `afterEach` for database test isolation.
- Define new domain fields in `shared/types.ts` before implementing service or route changes.
- Run validation commands (`pnpm run build && pnpm run lint && pnpm test`) after every implementation phase.
- Never accumulate broken state — fix lint/type errors before proceeding.
- Use `import type` for type-only imports.

### Step 9 — Create `copilot-config-governance.instructions.md`

Create `docs/.github/instructions/copilot-config-governance.instructions.md`:

```
---
applyTo: ".github/copilot-instructions.md,.github/instructions/**,.github/agents/**,.github/skills/**"
---
```

Rules:
- Always read the existing artifact with `read_file` before editing.
- Always scope `applyTo` front matter headers correctly for the target repository — never copy workspace-level `applyTo` patterns to a fork.
- Never deploy workspace-level global rules verbatim to a specific-project repository.
- Always update `Last updated` metadata on every edit.
- Maintain cross-reference consistency: agents must reference their skills by name; skills must reference any required instructions by name.
- Never declare secrets inline in `copilot-instructions.md` — always reference environment variable names only.

### Step 10 — Update `copilot-env-specialist.agent.md`

Edit `docs/.github/agents/copilot-env-specialist.agent.md` to scope it to the exercise workspace:

1. **Methodology Step 3** — replace the sub-project list (`delfos-connect/`, `delfos-bot/`, Root) with:
   - `nextjs-feature-flag-exercise/server/` — Express v5, Node.js ESM, SQL.js
   - `nextjs-feature-flag-exercise/client/` — React 19, Vite, TanStack Query v5
   - `nextjs-feature-flag-exercise/` — root (shared types, workflows)
2. **Methodology Step 1** — update the file search targets to `nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml`.
3. **Project Context section** — replace the Delfos Connect service table with the exercise stack context (Node.js v22 / Express v5 / SQL.js / pnpm 10 / Vitest).
4. **Verify** `## Core Responsibilities` references `.github/skills/copilot-env-setup/SKILL.md` as the companion skill — add the reference in Methodology Step 2 if it is not scoped to the exercise repo path.

**Stop condition:** all Delfos Connect references removed; project context updated.

### Step 11 — Verify all 8 new artifacts + 1 update

Run the existence check command from Section 2. All 8 lines must show `✅`. Then confirm `copilot-env-specialist.agent.md` no longer contains `delfos-connect` or `delfos-bot` strings:

```bash
grep -c "delfos-connect\|delfos-bot\|Directus\|Redis" \
  "$REPO_ROOT/docs/.github/agents/copilot-env-specialist.agent.md"
```

Expected: `0`.

### Step 12 — Commit and push all new artifacts

All 8 new files + the updated `copilot-env-specialist.agent.md` must be committed to the fork
so that T1–T4 cloud agents can access them during their GitHub Issue sessions.

```bash
REPO_ROOT="$(git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" rev-parse --show-toplevel)"
cd "$REPO_ROOT"
git checkout -b exercise-1/bootstrap-ai-layer-management
git add \
  docs/.github/agents/copilot-config-refactor.agent.md \
  docs/.github/agents/rules-bootstrap.agent.md \
  docs/.github/agents/copilot-env-specialist.agent.md \
  docs/.github/skills/copilot-layer-diff/SKILL.md \
  docs/.github/skills/config-migration-plan/SKILL.md \
  docs/.github/skills/global-rules-bootstrap/SKILL.md \
  docs/.github/skills/copilot-env-setup/SKILL.md \
  docs/.github/instructions/coding-agent.instructions.md \
  docs/.github/instructions/copilot-config-governance.instructions.md
git status  # confirm only these 9 files are staged
git commit -m "feat(docs): add E0-S2 management agents, skills, and instructions"
git push origin exercise-1/bootstrap-ai-layer-management
```

Open a Pull Request against `exercise-1` in the personal fork.

> **Stop condition:** PR merged before T1 starts. T1–T4 cloud agents will `git clone` or
> `checkout` a fresh state — if T0's artifacts are not merged, the Step 0 pre-check will fail.

---

## 4) Architecture and security requirements

**Input validation:**
- Read `copilot-env-specialist.agent.md` using `read_file` tool only — never assume its structure from memory.
- Validate each new SKILL.md has a `## Purpose` section and a `## Process` section before saving.

**Secrets handling:**
- Agent and skill files must not contain hardcoded secrets, tokens, or API keys.
- All references to credentials in `copilot-env-setup/SKILL.md` must use placeholder names (e.g., `ANTHROPIC_API_KEY`, `COPILOT_MCP_*`) — never actual values.

**Rollback/fallback:**
- All 8 files are new creations in `docs/.github/` (workspace repo) — they do not affect the exercise fork.
- If a file is created with wrong content, delete it and recreate using `create_file` (files must not exist before using `create_file`).
- Timeline entries for these file creations are handled by the VS Code Agent Hook (`auto-log-agile-artifact.js`) only for files under `docs/agile/**/*.md`. Files in `docs/.github/` do NOT trigger the hook — no manual timeline append is needed.

**Architecture boundary:**
- These artifacts belong to the `docs/.github/` management layer — they must never import or reference application code from `nextjs-feature-flag-exercise/`.
- Skills must not have side effects (no terminal commands embedded in SKILL.md prose as executable blocks — only document them as instructions for the executing agent).

---

## 5) Validation evidence

### Command 1 — Existence check

```bash
REPO_ROOT="$(git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/agents/copilot-config-refactor.agent.md" \
  ".github/agents/rules-bootstrap.agent.md" \
  ".github/skills/copilot-layer-diff/SKILL.md" \
  ".github/skills/config-migration-plan/SKILL.md" \
  ".github/skills/global-rules-bootstrap/SKILL.md" \
  ".github/skills/copilot-env-setup/SKILL.md" \
  ".github/instructions/coding-agent.instructions.md" \
  ".github/instructions/copilot-config-governance.instructions.md"
```

**Expected exit code:** `0`
**Expected output:** all 8 lines show `✅`

### BDD verification signal

**Given** the 8 management artifacts listed in the T0 current-state table do not exist in `docs/.github/`
**When** I follow steps 1–9 of this task's execution plan and create each artifact
**Then** running `check-ai-layer-files.js` with the 8 paths above exits with code `0` and all lines show `✅`
**And** `copilot-config-refactor.agent.md` contains links to skills `copilot-layer-diff`, `config-migration-plan`, and `adapt-artifact-to-fork-scope`
**And** `rules-bootstrap.agent.md` contains a link to skill `global-rules-bootstrap`
**And** both instruction files contain a valid `applyTo:` front matter header

**Affected files:**

| File | Action |
|---|---|
| `docs/.github/agents/copilot-config-refactor.agent.md` | Created |
| `docs/.github/agents/rules-bootstrap.agent.md` | Created |
| `docs/.github/skills/copilot-layer-diff/SKILL.md` | Created |
| `docs/.github/skills/config-migration-plan/SKILL.md` | Created |
| `docs/.github/skills/global-rules-bootstrap/SKILL.md` | Created |
| `docs/.github/skills/copilot-env-setup/SKILL.md` | Created |
| `docs/.github/instructions/coding-agent.instructions.md` | Created |
| `docs/.github/instructions/copilot-config-governance.instructions.md` | Created |

---

## 6) Definition of Done

- [ ] `check-ai-layer-files.js` check with all 8 paths exits `0` and shows `✅` for every path.
- [ ] `copilot-config-refactor.agent.md` references `copilot-layer-diff`, `config-migration-plan`, `adapt-artifact-to-fork-scope`.
- [ ] `rules-bootstrap.agent.md` references `global-rules-bootstrap`.
- [ ] `copilot-env-specialist.agent.md` updated: Delfos Connect context removed; Methodology Steps 1+3 and Project Context scoped to `nextjs-feature-flag-exercise`; `copilot-env-setup` skill reference present.
- [ ] All 4 new SKILL.md files contain `## Purpose` and `## Process` sections.
- [ ] Both instruction files have a valid `applyTo` front matter header as the first block.
- [ ] No file contains hardcoded secrets, tokens, or actual credential values.
- [ ] No file contains unfilled stubs or incomplete content markers.
- [ ] All 9 files staged and committed: `check-ai-layer-files.js` exits `0`.
- [ ] Feature branch `exercise-1/bootstrap-ai-layer-management` pushed to fork.
- [ ] PR opened against `exercise-1` and **merged** before T1 starts.
