# Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop

## Metadata

- **ID:** EPIC-2
- **Priority:** P0
- **Related exercise:** Exercise 2 — AI-Assisted Run (PIV Loop)
- **Depends on:** EPIC-1 (baseline implementation complete, metrics captured)
- **Target repository (local clone):** `/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise`
- **Base branch:** `exercise-2` (created from upstream original state, pre-fork)
- **Execution model:** Hybrid — Phase 1 with Copilot (Claude Opus 4.6 in VS Code), Phase 2 with Claude Code (GitHub workflows + PIV Loop)
- **Status:** Not started
- **Created at:** 2026-04-16 00:20:45 -03
- **Last updated:** 2026-04-16 22:15:00 -03

---

## 1) Business objective

Close the **System Gap** (Excal-2) between Developer A (without system) and Developer B (with system) by re-implementing the same Feature Flag Filtering task (`TASK.md`) using a complete AI coding system and the full PIV Loop methodology (**Plan → Implement → Validate → Iterate**), then produce comparable metrics that demonstrate measurable improvement over the Exercise 1 Baseline.

**Workshop framing — The AI Coding System Gap (Excal-2):**
- **Exercise 1 (Baseline) = Developer A** — AI-assisted but without a structured system: no global rules file, no reusable commands, no formal plan artifact, no on-demand context documents, validation only at the end of implementation. Result: hallucinations, missing context, rework cycles (3), lower initial confidence (3/5).
- **Exercise 2 (PIV Loop) = Developer B** — AI-assisted **with a structured system**: global rules (`CLAUDE.md` auto-loaded every session), reusable commands (`/plan`, `/implement`, `/validate`, `/commit`), on-demand context documents, formal PRD, per-task build validation, and a system evolution feedback loop. Expected result: less rework, higher confidence, faster implementation.

**Workshop approach — Brownfield Workflow (Excal-1):**
This exercise follows the **Brownfield Workflow** because the codebase already exists with established patterns:
1. **Understand the code** — use `/prime` to load full project context, then `/prime-endpoint` to analyze the endpoint-specific data flow and integration points.
2. **Extract rules** — create `CLAUDE.md` global rules from the discovered conventions (the "day 1 employee onboarding" for the AI).
3. **Set up commands** — create the Core 4 commands (`/prime`, `/plan`, `/implement`, `/commit`) plus extended commands (`/prime-endpoint`, `/validate`, `/create-prd`, `/review`, `/security-review`).
4. **Document codebase** — create on-demand context documents (backend patterns, SQL.js constraints, frontend patterns) as "department training" references loaded by commands when needed (Layer 2).

> **Confidence scale note:** The workshop (Excal-2) uses a 1–10 scale for confidence. Exercise 1 used a 1–5 scale (recorded: 3→4→5). For comparability, Exercise 2 **continues using the 1–5 scale** so that the delta analysis is apples-to-apples. This divergence from the workshop standard is documented here and in the metrics template.

Expected value:
- validate that the full PIV Loop (4 phases: Plan → Implement → Validate → **Iterate**) reduces rework cycles, time, and friction compared to the Baseline run;
- produce a quantitative before/after comparison (time, prompts, rework cycles, confidence on 1–5 scale);
- demonstrate that **Context Engineering** (Excal-3) — the structured integration of its 4 pillars: **RAG** (on-demand context docs), **Memory** (global rules auto-loaded every session), **Task Management** (structured plans with per-task validation), and **Prompt Engineering** (commands with Input → Process → Output) — produces measurably better results than unstructured AI-assisted development;
- demonstrate the value of **front-loading context** (Excal-4): investing ~30–60 min once in AI Layer setup eliminates the "context loading tax" (~5–10 min per session, repeated) — the system pays for itself across sessions;
- demonstrate the value of creating a complete Claude AI Layer (CLAUDE.md, commands, skills, on-demand context, PRD) before implementation;
- document the preparation overhead (AI Layer creation + repo configuration) as a separate cost from implementation;
- demonstrate the **System Evolution** feedback loop (4th phase of the PIV Loop): when implementation reveals friction, the system itself (commands, rules, context) is improved — "don't just fix the bug, fix the system that allowed the bug" (Excal-1);
- demonstrate the **Compounding Quality Effect** (Excal-6): each verified foundation layer (testing → logging → infrastructure → database → monitoring → shared patterns) improves the quality of subsequent layers — "production-ready + built for AI from start";
- establish the PIV Loop as a repeatable engineering practice for AI-assisted development.

---

## 2) Scope

### In Scope

**Phase 1 — AI Layer preparation for Claude (Brownfield Workflow, using Copilot with Claude Opus 4.6 in VS Code):**

This phase follows the **Brownfield Workflow** from the workshop (Excal-1): Understand Code → Extract Rules → Setup Commands → Document Codebase. All artifacts created here constitute **Layer 1 — Project Planning** (Excal-4): stable project knowledge, done once, auto-loaded into every Claude session. The PRD constitutes **Layer 2 — Task Planning**: task-specific context created for this feature.

**Step A — Understand the code (Exploration/Research phase):**

1. Analyze the existing codebase architecture, patterns, naming conventions, error handling, and test strategy using the Exercise 1 diagnosis document (`.agents/closure/codebase-audit.md`), `AGENTS.md`, and existing `CLAUDE.md`. This is the Brownfield equivalent of the Greenfield "research & scope" phase.

**Step B — Extract rules (Global Rules = `CLAUDE.md`):**

2. Create/adapt `CLAUDE.md` for Exercise 2 context — global rules tuned for: the `exercise-2` branch, PIV Loop workflow, Brownfield Workflow reference, current branch state (no filtering implementation), validation commands, code patterns with `file:line` references. This is the **"day 1 employee onboarding"** for Claude (Excal-4) — auto-loaded in every session, covering tech stack, architecture, code style, testing, and common AI misconceptions about this project.

   **What to include in Global Rules (Excal-4 Venn diagram):**
   - Tech Stack & Architecture (Node.js ESM, Express v5, SQL.js, React 19, Vite, TanStack Query v5, Tailwind v4)
   - Code Styles & Patterns (layered architecture, `next(error)`, `stmt.free()` in finally, `cn()` for class composition, kebab-case files)
   - Testing Requirements (Vitest, `_resetDbForTesting()`, isolation patterns)
   - **Misconceptions AI Often Has With Your Project** (SQL.js is not PostgreSQL — no boolean type, no array type; Express v5 not v4 — different error handling; Tailwind v4 not v3 — different config format)

   **What NOT to include (Excal-4):**
   - Universal knowledge not specific to this project (general TypeScript, general React)
   - Workflows/commands (those go in `.claude/commands/`, not in global rules)
   - Anything very specific to a single task (that goes in the PRD = Layer 2)
   - Anything that seriously bloats the rules (keep it concise — the AI reads it every session)

**Step C — Setup commands (Core 4 + Extended):**

The workshop (Excal-1, Excal-5) defines **Core 4** mandatory commands. Exercise 2 also includes extended commands for review and PRD generation. Every command follows the **Input → Process → Output** structure (Excal-5):

> **Input → Process → Output golden nuggets (Excal-5):**
> - **Input** — Context Engineering pillars: **Memory + Prompt Engineering**. What does the agent need to SEE? Context around the process, context specific to right now (dynamic parameters!), the persona for the agent, which parts of the conversation to focus on, how to make assumptions. **Golden nugget:** this is where you specify the Layer 1 "on demand" context to pull.
> - **Process** — Context Engineering pillars: **RAG + Tasks + Prompt Engineering**. What should the agent DO? Step-by-step workflow, what to research/analyze, how to manage tasks, what tools to use, what code changes to make. **Golden nugget:** commands are the core of your system — you can chain them together.
> - **Output** — Context Engineering pillar: **Prompt Engineering**. What should the agent SHARE? Code analysis, architecture recommendations, implementation plans, structured documents (markdown preferred), summary of changes. **Golden nugget:** output format determines how well the command fits with the rest of the system (command chaining compatibility).

> **Dynamic parameters (Excal-5):** commands can accept arguments that make them flexible across invocations. In Claude Code, `$ARGUMENTS` receives the full argument string, and positional `$1`, `$2`, `$3` receive individual values. Example: `/plan feature-flag-filtering` passes `$ARGUMENTS = 'feature-flag-filtering'`, which the `/plan` command uses as the plan name for the output file `.agents/plans/feature-flag-filtering.plan.md`. Design commands to accept parameters for: target feature name, scope (server/client/both), priority level, or specific file paths.

| # | Command | Workshop Core 4 | Exercise 2 file | Purpose |
|---|---|---|---|---|
| 1 | `/prime` | ✅ Core 4 | `.claude/commands/prime.md` | Load full project context — codebase structure, recent commits, shared types |
| 2 | `/plan` | ✅ Core 4 | `.claude/commands/plan.md` | 5-phase planning engine (Parse → Explore → Design → Generate → Output) |
| 3 | `/implement` | ✅ Core 4 (`/execute`) | `.claude/commands/implement.md` | 7-phase execution engine with per-task build validation |
| 4 | `/commit` | ✅ Core 4 | `.claude/commands/commit.md` | Structured commit with conventional message and summary |
| 5 | `/prime-endpoint` | Extended | `.claude/commands/prime-endpoint.md` | Learn end-to-end endpoint pattern — 7-file data flow sequence |
| 6 | `/validate` | Extended | `.claude/commands/validate.md` | Single-pass validation reporter (lint + build + test) |
| 7 | `/create-prd` | Extended | `.claude/commands/create-prd.md` | PRD generator with 15-section structure |
| 8 | `/review` | Extended | `.claude/commands/review.md` | Code review engine with severity categorization |
| 9 | `/security-review` | Extended | `.claude/commands/security-review.md` | OWASP security scan (6 categories) |

> **Nomenclature note:** The workshop uses `/execute` for the implementation command. This exercise uses `/implement` to align with the `rdh-workflow-analyst` reference and the PIV Loop naming convention (Plan → **Implement** → Validate → Iterate). Both names refer to the same 7-phase execution engine.

> **Command chaining teaser (Excal-5):** commands follow a composable Input → Process → Output pattern where the Output of one command becomes the Input of the next: `/create-prd` → outputs PRD → `/plan` reads PRD → outputs plan → `/implement` reads plan → outputs code → `/validate` checks code → `/commit` packages result. This is **command chaining** — each command in the system is designed to produce artifacts that the next command consumes. When creating commands, design their Output format to be compatible with downstream commands' expected Input.

3. Create `.claude/commands/` — all 9 commands listed above, each following the **Input → Process → Output** structure.
4. Create `.claude/skills/` — reusable subroutines invoked **by commands** (never directly by the user): `agent-browser` (Playwright for UI validation), and any other skills required by the commands.

**Step D — Document codebase (On-Demand Context = "As Needed" documents):**

On-demand context documents are the **"department training"** layer (Excal-4) — more specific than global rules, loaded by commands when needed for specific task types. These constitute **Loading Strategy #2 — As Needed** (project knowledge, changes rarely, loaded for specific task types):

5. Create `.agents/reference/backend-patterns.md` — SQL.js constraints (try/finally + `stmt.free()`, boolean as INTEGER 0/1, parameterized queries only, `db.exec()` vs `db.prepare()`), Express v5 patterns (`next(error)`, layered architecture Routes → Services → DB), Zod validation-first approach with `file:line` references.
6. Create `.agents/reference/frontend-patterns.md` — React 19 + TanStack Query v5 patterns (`queryKey` composition, `useMutation` invalidation), Tailwind v4 + `cn()` for class composition, Radix UI component primitives from `components/ui/`, controlled components, kebab-case file naming.
7. Create `.agents/reference/sql-js-constraints.md` — deep reference on SQL.js-specific limitations: no boolean type (INTEGER 0/1), no array type (JSON string), `db.exec()` is parameterless (DDL only), `db.prepare()` + `stmt.bind()` for parameterized queries, `stmt.free()` in finally block, safe dynamic WHERE clause construction for optional filters.

**Step E — Create PRD (Layer 2 — Task Planning):**

8. Create PRD — `.agents/PRDs/feature-flag-filtering-e2.prd.md` with the 15-section structure from the workshop methodology. The PRD follows the **Prompt Structure 5-step** from Excal-6: **(1) Context Reference** — point to `CLAUDE.md`, on-demand context docs in `.agents/reference/`, and `TASK.md` as primary sources; **(2) Installation Commands** — `pnpm install` for server and client, any dev dependencies; **(3) Implementation Instructions** — file-by-file breakdown following the data flow (`shared/types.ts` → validation → service → routes → client API → UI); **(4) Testing & Validation** — `pnpm test`, `pnpm run build`, `pnpm run lint` with multiple validation layers (Zod runtime + TypeScript compile-time + ESLint static analysis + Vitest behavioral); **(5) Commit & Summary** — `/commit` when all green, structured output with conventional commit message. The PRD references on-demand context docs from Step D.

**Step F — Validate AI Layer:**

9. Validate that the Claude AI Layer is complete and consistent with the workshop's **three-tier architecture** (Excal-1, Excal-4):
    - **Tier 1 — Global Rules (auto-loaded):** `CLAUDE.md` contains tech stack, architecture, code style, testing, validation commands, common AI misconceptions.
    - **Tier 2 — Commands (invoked by user):** `.claude/commands/*.md` — Core 4 present, each with Input → Process → Output structure, phase logic matches workshop reference.
    - **Tier 3 — Skills (invoked by commands):** `.claude/skills/*/SKILL.md` — subroutines, never direct entry points.
    - **On-Demand Context (loaded by commands):** `.agents/reference/*.md` — loaded as needed for backend, frontend, and SQL.js task types.
    - **Layer 2 — Task Context:** PRD exists with all 15 sections, references on-demand context docs.

**Phase 2 — Repository configuration:**

10. Create `exercise-2` branch from the parent commit of the first fork commit (`f73979ed~1`) — upstream original state with zero implementation.
11. Cherry-pick documentation/agile artifacts from `exercise-1`.
12. Remove Exercise 1 automation workflows (`auto-copilot-fix.yml`, `auto-merge-on-clean-review.yml`, `auto-ready-for-review.yml`, `auto-validate-copilot-fix.yml`, `copilot-push-signal.yml`).
13. Activate Claude Code workflows — move `exercise-2-docs/claude.yml`, `pr-review.yml`, `security-review.yml` to `.github/workflows/`.
14. Install the Claude GitHub App on the fork.
15. Configure `ANTHROPIC_API_KEY` secret in the GitHub fork.
16. Validate workflow activation with a draft PR test.

**Phase 3 — PIV Loop implementation (using Claude Code — full 4 phases: Plan → Implement → Validate → Iterate):**

> **"Trust but verify" (Excal-1):** during implementation with Claude Code, monitor that the agent: uses your tools correctly, is reading/editing the right files, manages its tasks properly, and produces "thinking" tokens that show it understands the plan of attack. Let the agent run, but intervene if any of these signals break down.

17. Execute `/plan` — generate a formal implementation plan (`.agents/plans/feature-flag-filtering.plan.md`) from the PRD. The plan is structured using the **Context Engineering pillars** (Excal-3): **RAG** (references on-demand context docs for backend/frontend/SQL.js patterns), **Memory** (builds on `CLAUDE.md` global rules auto-loaded in session), **Task Management** (ordered task list with dependencies and validation checkpoints), **Prompt Engineering** (clear input/output for each task). The plan includes: goals, success criteria, documentation to reference, task list, validation strategy, and desired codebase structure. This step follows the **Vibe Planning: The Meta-Loop** (Excal-6): **Human** provides the plan direction ("implement feature flag filtering per TASK.md") → **AI** finds docs & sources (reads PRD, on-demand context, CLAUDE.md) → **AI** structures into steps (produces ordered task list with validation checkpoints) → **Result** is Code + Docs (the plan artifact itself, ready for `/implement`).
18. Execute `/implement` — implement filtering following the plan, with per-task `pnpm run build` validation (no broken state accumulation).
19. Update `shared/types.ts` to introduce `FlagFilterParams` type (single source of truth).
20. Extend Zod validation middleware to parse and validate filter query parameters.
21. Implement server-side filtering logic in `server/src/services/flags.ts`.
22. Update the Express route handler in `server/src/routes/flags.ts` to extract and forward filter params.
23. Implement client-side filter UI — filter controls for environment, status, type, owner, and name search; "clear all filters" action; active-filter indicator.
24. Wire `client/src/api/flags.ts` to pass filter query parameters.
25. Ensure filter state persists across flag creation, editing, and deletion operations.
26. Execute `/validate` — full validation suite as the final gate before PR. Validation follows the **dual-role model** (Excal-3):
    - **Human Validation:** performs code review (architecture decisions, naming quality, edge cases) and runs manual tests (browser UI flow, curl API spot checks).
    - **AI Coding Assistant Validation:** runs unit tests (`pnpm test`), integration checks (`pnpm run build` + `pnpm run lint`), and automated PR review (`pr-review.yml` + `security-review.yml`).
    The two roles are complementary: the AI catches mechanical errors (type mismatches, lint violations, test failures) while the human catches semantic errors (wrong business logic, poor UX, architectural drift).
27. **Iterate — System Evolution (4th PIV phase, Excal-1):** if the PIV Loop revealed recurring issues during implementation (same error type repeating, commands producing suboptimal output, missing context causing hallucinations, patterns not followed), update the responsible artifact **before** proceeding to PR:
    - **Command issue → update** `.claude/commands/*.md` (fix phase logic, add missing step, improve process instructions).
    - **Global rules issue → update** `CLAUDE.md` (add missing convention, clarify ambiguous pattern, fix incorrect constraint).
    - **On-demand context issue → update or create** `.agents/reference/*.md` (add missing pattern, document discovered constraint, add `file:line` example).
    - **Plan issue → update** `.agents/plans/feature-flag-filtering.plan.md` (add missed task, reorder steps, add risk).
    - **"3+ times = make it a command" heuristic (Excal-5):** if during implementation you typed the same instruction 3+ times (e.g., "run build then lint then test", "check the SQL.js statement lifecycle", "format the commit message like this"), that repeated prompt should become a new command or an extension of an existing one. This eliminates the **re-prompting tax** — the hidden costs of one-off prompting: **time waste** (1 min to type × many sessions = hours), **inconsistency** (sometimes you forget part of the prompt), **no improvement** (no opportunity to refine the workflow), **knowledge not shared** (the prompt lives in your head, not in the system).
    - Document each system evolution action in the friction log with label `[SYSTEM-EVOLUTION]`.
    - **Decision rule:** "Don't just fix the bug. Fix the system that allowed the bug." (Excal-1)

**Phase 4 — Measurement and closure:**

28. Record metrics in real time during implementation (time, prompts, rework cycles, confidence on 1–5 scale).
29. Document friction points, PIV Loop observations, and System Evolution retrospective (Pattern A/B classification) — including any `[SYSTEM-EVOLUTION]` actions taken during Phase 3.
30. Create comparative metrics document (Exercise 1 vs Exercise 2 delta analysis).
31. PR review cycle using Claude Code automated reviews (`pr-review.yml` + `security-review.yml`).
32. Produce EPIC-2 closure report and EPIC-3 handoff.

### Out of Scope

1. Migrating the runtime stack to Bun, Next.js 16, Drizzle, or Biome (this belongs to Epic 4 — Gold Standard migration).
2. Replacing SQL.js with PostgreSQL/Supabase.
3. Replacing Vitest with another test runner.
4. Adding pagination, sorting, or new features beyond what `TASK.md` specifies.
5. Implementing the filtering on top of the Exercise 1 code — the exercise requires a clean re-implementation from the original upstream state (i.e., the `exercise-1` branch's existing filter implementation is not carried over).
6. Using the Copilot Issue-driven execution model (Epic 1's automation workflows are removed for Exercise 2).
7. Creating Jira tickets via MCP (optional, not required for exercise completion).

---

## 3) Definition of Done (DoD)

This epic is considered complete when **all** items below are true:

**Phase 1 — AI Layer preparation:**
1. `CLAUDE.md` exists and is adapted for Exercise 2 (branch `exercise-2`, PIV Loop workflow, Brownfield Workflow reference, no filtering references in starting code). Covers: tech stack, architecture, code style, testing, validation commands, and common AI misconceptions about this project (Excal-4). **Includes the 4 required categories** (Excal-4 Venn diagram): Tech Stack & Architecture, Code Styles & Patterns, Testing Requirements, Misconceptions AI Often Has. **Does NOT include** universal knowledge, workflow/command definitions, task-specific content, or bloating content.
2. `.claude/commands/` contains **all 4 Core 4** commands (`prime.md`, `plan.md`, `implement.md`, `commit.md`) **plus at least 1 extended** (`prime-endpoint.md`, `validate.md`, `create-prd.md`, `review.md`, or `security-review.md`).
3. Every command file follows the **Input → Process → Output** structure (Excal-5): Input defines what the agent needs to SEE (with CE pillars: Memory + Prompt Engineering), Process defines what it must DO (with CE pillars: RAG + Tasks + Prompt Engineering), Output defines what it must SHARE (with CE pillar: Prompt Engineering). Commands that accept arguments use `$ARGUMENTS` or positional `$1`/`$2`/`$3` for dynamic parameterization.
4. `.claude/skills/` contains at least one reusable skill used by the commands (subroutine, never a direct entry point).
5. **On-demand context documents** exist in `.agents/reference/`: at least `backend-patterns.md` and `frontend-patterns.md` (the "department training" layer, Excal-4 Loading Strategy #2).
6. PRD exists at `.agents/PRDs/feature-flag-filtering-e2.prd.md` with all 15 sections. PRD references on-demand context docs.
7. AI Layer structural validation passes: **Tier 1** (Global Rules: `CLAUDE.md`) → **Tier 2** (Commands: `.claude/commands/`) → **Tier 3** (Skills: `.claude/skills/`) → **On-Demand Context** (`.agents/reference/`) → **Layer 2 Task Context** (PRD) — hierarchy is consistent and complete.

**Phase 2 — Repository configuration:**
8. `exercise-2` branch exists, created from upstream original state (parent of first fork commit).
9. Exercise 1 automation workflows are **not** present in `.github/workflows/` on `exercise-2`.
10. Claude Code workflows (`claude.yml`, `pr-review.yml`, `security-review.yml`) are active in `.github/workflows/` on `exercise-2`.
11. `ANTHROPIC_API_KEY` secret is configured in the GitHub fork.
12. Claude GitHub App is installed on the fork.
13. At least one draft PR confirms that `pr-review.yml` and `security-review.yml` trigger correctly.

**Phase 3 — Implementation (PIV Loop — 4 phases):**
14. Formal implementation plan exists at `.agents/plans/feature-flag-filtering.plan.md`.
15. All 11 acceptance criteria in `TASK.md` are met and verifiable:
    - Filter by environment (development, staging, production).
    - Filter by status (enabled/disabled).
    - Filter by type (release, experiment, operational, permission).
    - Filter by owner.
    - Name search (partial match, case-insensitive).
    - Filtering is executed in the backend.
    - Multiple simultaneous filters work (AND logic).
    - Filters persist while creating, editing, and deleting flags.
    - "Clear all filters" action is available and functional.
    - UI clearly indicates when filters are active.
    - Filtering feels responsive.
16. `shared/types.ts` is the single source of truth for the filter query contract.
17. All server validation commands pass with zero errors: `pnpm run build`, `pnpm run lint`, `pnpm test`.
18. All client validation commands pass with zero errors: `pnpm run build`, `pnpm run lint`.
19. Per-task build validation was enforced during implementation (no broken state accumulation — PIV Loop discipline).
20. **Validation follows the dual-role model (Excal-3):** human validation (code review + manual browser/curl tests) and AI validation (unit tests + integration checks + automated PR review) were both performed. Neither role alone is sufficient — the human catches semantic/architectural issues, the AI catches mechanical/consistency issues.
21. **System Evolution (Iterate phase) was applied** when applicable: if recurring issues were detected during the PIV Loop, the responsible artifact (command, global rule, on-demand context, or plan) was updated before PR. Each action is documented in the friction log with `[SYSTEM-EVOLUTION]` label.

**Phase 4 — Measurement and closure:**
22. Metrics document created with data collected during implementation (time, prompts, rework, confidence on 1–5 scale).
23. Comparative analysis document produced (Exercise 1 vs Exercise 2 delta: time, prompts, rework cycles, confidence).
24. Friction log created with observations specific to the PIV Loop experience — including `[SYSTEM-EVOLUTION]` entries.
25. At least one PR created and reviewed via Claude Code automated review workflows.
26. EPIC-2 closure report produced.
27. EPIC-3 handoff document produced.
28. No direct commits to `main` — all changes on `exercise-2` (or PRs into `exercise-2`).

---

## 4) Risks

1. **Risk:** over-investing in AI Layer preparation, delaying the actual implementation.
   - **Impact:** total time (prep + implementation) exceeds Baseline, making PIV Loop appear less efficient.
   - **Mitigation:** track prep time separately from implementation time. Set a time-box of ~90 min for AI Layer + PRD creation. Accept "good enough" over "perfect" for first-pass commands/skills.

2. **Risk:** Claude Code workflows fail due to misconfigured secrets or missing GitHub App.
   - **Impact:** no automated PR review, no `@claude` interaction — key differentiator of Exercise 2 is lost.
   - **Mitigation:** validate all 3 workflows with a draft PR **before** starting implementation. Follow the preparation guide checklist (Section 7 of `manuals/epic2-preparation-guide.md`).

3. **Risk:** PIV Loop per-task build validation introduces excessive overhead.
   - **Impact:** total implementation time increases due to frequent build checks.
   - **Mitigation:** measure and compare rework cycles. If per-task validation catches errors early, total time should decrease despite more build runs.

4. **Risk:** dynamic SQL injection — WHERE clause built via string interpolation instead of parameterized binding.
   - **Impact:** security vulnerability (OWASP A03:2021 — Injection).
   - **Mitigation:** verify all user-provided filter values pass through `stmt.bind(values)` only; no string interpolation in any SQL query. Security review workflow provides automated detection.

5. **Risk:** client state sync — stale TanStack Query cache when filters change during mutations.
   - **Impact:** acceptance criterion 8 fails ("Filters persist while using other features").
   - **Mitigation:** include `filterState` in `queryKey: ['flags', filterState]`; test that filter state persists after each mutation type (create, edit, delete).

6. **Risk:** boolean conversion — `enabled` arrives as string from query param but DB stores INTEGER 0/1.
   - **Impact:** incorrect filtering results or runtime errors.
   - **Mitigation:** Zod schema validates `status` as `z.enum(['enabled','disabled'])`; service converts via `filters.status === 'enabled' ? 1 : 0` before `stmt.bind()`.

7. **Risk:** commands/skills created for Claude do not work correctly — hallucinated phase logic or incorrect artifact paths.
   - **Impact:** `/plan` and `/implement` produce incorrect plans or fail mid-execution.
   - **Mitigation:** base all commands on the workshop reference (`resident-health-workshop-resources/.claude/commands/`). Validate by dry-running `/plan` before implementation.

8. **Risk:** branch `exercise-2` starts from wrong commit, including residual Exercise 1 implementation code.
   - **Impact:** re-implementation not clean — invalid comparison with Baseline.
   - **Mitigation:** create branch from `f73979ed~1` (parent of first fork commit). Run server tests — expect 16 tests (CRUD only, no filtering tests).

9. **Risk:** not recording metrics in real time.
   - **Impact:** unreliable comparison with Baseline; delta analysis becomes qualitative only.
   - **Mitigation:** open the metrics document before writing code and log entries as they happen.

---

## 5) Dependencies

### Input dependencies

1. **EPIC-1 fully completed** — baseline metrics captured, closure report signed, handoff READY.
2. `exercise-1` branch with all documentation/agile artifacts available for cherry-pick.
3. Workshop reference repository (`resident-health-workshop-resources`) accessible for command/skill templates.
4. `ANTHROPIC_API_KEY` available (confirmed in local `.env` and needed as GitHub secret).
5. GitHub account with admin access to fork `PedroCF87/nextjs-feature-flag-exercise`.
6. Baseline metrics from EPIC-1 (time: 212 min, prompts: 25, rework: 3, confidence: 3→4→5) as comparison reference.

### Output dependencies (items blocked by this epic)

1. **EPIC-3 (methodology comparison and debrief):** depends on Exercise 2 metrics and comparative analysis for the workshop interview.
2. **Post-exercise debrief:** depends on the friction logs, comparative metrics, and observations from both Exercise 1 and Exercise 2.

---

## 6) Success metrics

1. **Functional completeness:** 11/11 acceptance criteria from `TASK.md` verified on `exercise-2`.
2. **Validation gate:** 0 errors from server and client build/lint/test commands.
3. **PIV Loop discipline:** 0 tasks where broken state was carried forward (every build failure was fixed before the next task).
4. **Rework reduction:** rework cycles ≤ Baseline (Exercise 1: 3 cycles).
5. **Time efficiency:** implementation time (Phase 3 only, excluding prep) ≤ Baseline (Exercise 1: 212 min) — or comparable with documented justification.
6. **Prep overhead documented:** AI Layer creation + repo configuration time tracked separately. Used to calculate total cost of the "front-loading context" investment (Excal-4).
7. **Confidence score:** final confidence ≥ Exercise 1 (5) on the **1–5 scale** (note: workshop uses 1–10; exercise standardized on 1–5 for baseline comparability).
8. **Automated review evidence:** ≥ 1 PR reviewed by Claude Code workflows (`pr-review.yml` and/or `security-review.yml`).
9. **AI Layer completeness:** CLAUDE.md + all 4 Core 4 commands + extended commands + ≥ 1 skill + ≥ 2 on-demand context docs + PRD all present on `exercise-2`.
10. **Comparative analysis produced:** delta document with Exercise 1 vs Exercise 2 metrics.
11. **System Evolution applied:** ≥ 0 system evolution actions documented with `[SYSTEM-EVOLUTION]` label in friction log (0 is acceptable if no recurring issues were detected; the metric tracks whether the practice was applied, not a minimum count).

---

## 7) Candidate stories for the epic

### Story E2-S0 — Planning automation

**Priority:** P0 | **Depends on:** EPIC-1 closure

**Description:** generate detailed story MDs for all Epic 2 stories and task files only for Copilot-executed stories, respecting that PIV Loop stories (E2-S3, E2-S4) are driven by the PRD + `/plan` artifact — not by agile task files.

> **PIV Loop alignment:** In the PIV Loop methodology, the _planning_ phase is executed by the `/plan` command, which reads the PRD and generates a structured plan artifact (`.agents/plans/feature-flag-filtering.plan.md`). That plan artifact replaces the role of detailed agile task files for implementation stories. Creating task files for PIV Loop stories would introduce two competing sources of truth and contradict the methodology being validated.

**Execution:**
1. Invoke `scaffold-stories-from-epic` on this epic to generate detailed story MDs (E2-S1 to E2-S5).
2. For **Copilot-executed stories** (E2-S1, E2-S2, E2-S5), invoke `create-story-task-pack` to generate task files.
3. For **PIV Loop stories** (E2-S3, E2-S4), generate story MDs only — no task files. Their execution is driven by the PRD + plan.md.
4. Review generated documents with `story-task-reviewer` agent.
5. Sync backlog index with `sync-backlog-index`.

**Key outputs:**
- 5 detailed story MDs: `story-E2S1-*.md`, `story-E2S2-*.md`, `story-E2S3-*.md`, `story-E2S4-*.md`, `story-E2S5-*.md`.
- Task files for Copilot-executed stories (E2-S1, E2-S2, E2-S5) in `docs/agile/tasks/`.
- **No task files** for PIV Loop stories (E2-S3, E2-S4) — the `/plan` artifact serves as the task management layer.
- Updated `backlog-index.json`.

| Story | Execution model | Task files? | Task source of truth |
|---|---|---|---|
| E2-S1 (AI Layer prep) | Copilot (VS Code) | ✅ Yes | Agile task files |
| E2-S2 (Repo config) | Copilot + manual | ✅ Yes | Agile task files |
| E2-S3 (Server filtering) | Claude Code (PIV Loop) | ❌ No | PRD + plan.md |
| E2-S4 (Client filtering) | Claude Code (PIV Loop) | ❌ No | PRD + plan.md |
| E2-S5 (Measurement/closure) | Copilot (VS Code) | ✅ Yes | Agile task files |

---

### ✅ [Story E2-S1 — Claude AI Layer preparation (Brownfield Workflow)](../agile/stories/story-E2S1-claude-ai-layer-preparation.md)

**Priority:** P0 | **Depends on:** E2-S2

**Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) → commit to `exercise-2`.

**Description:** as an engineer preparing for an AI-assisted implementation run, I want a complete Claude AI Layer (CLAUDE.md, commands, skills, on-demand context, PRD) built following the **Brownfield Workflow** (Excal-1: Understand Code → Extract Rules → Setup Commands → Document Codebase) so that the Claude Code agent can execute the PIV Loop with full project context and structured workflows.

> **Layer 1 vs Layer 2 (Excal-3, Excal-4):** Tasks 1–15 produce **Layer 1 — Project Planning** artifacts (stable, auto-loaded or loaded by commands — including on-demand context docs). Task 16 produces **Layer 2 — Task Planning** (feature-specific PRD, references Layer 1 docs). Task 17 validates the full AI Layer.

**Key tasks (Brownfield Workflow sequence):**

**Step A — Understand the code (Exploration/Research):**
1. Analyze codebase using `.agents/closure/codebase-audit.md`, `AGENTS.md`, and existing `CLAUDE.md`. Map: architecture layers, data flow, naming conventions, error handling patterns, SQL.js constraints, test strategy, integration points.

**Step B — Extract rules (Global Rules):**
2. Create/update `CLAUDE.md` adapted for Exercise 2 state (no filtering, `exercise-2` branch, PIV Loop methodology). Must include: tech stack table, architecture/data flow, code patterns, testing strategy, validation commands, error handling classes, key files, **and common AI misconceptions** about this project (Excal-4: "Misconceptions AI Often Has With Your Project"). Follow the **Excal-4 Venn diagram categories**: Tech Stack & Architecture, Code Styles & Patterns, Testing Requirements, Misconceptions. **Exclude** (Excal-4): universal knowledge not specific to this project, workflow/command definitions (those go in `.claude/commands/`), task-specific content (that goes in the PRD), content that bloats the file. Reference the **Foundation-first setup order** (Excal-6: 1.Testing → 2.Logging → 3.Infrastructure → 4.Database → 5.Monitoring → 6.Shared Patterns) as a quality principle in the testing section. Use the Gold Standard's two-document pattern as reference: `CLAUDE.md` (auto-loaded operational rules, ~377 lines) vs `CODEBASE-GUIDE.md` (deep walkthrough, on-demand, ~1992 lines). See [`docs/references/gold-standard-patterns.md`](../references/gold-standard-patterns.md) §2 for details.

**Step C — Setup commands (Core 4 + Extended, each with Input → Process → Output):**
3. Create `.claude/commands/prime.md` — **Core 4** — Full project context loader. Reads codebase structure, recent commits, shared types, and conventions. Provides the broad understanding needed before any planning or implementation.
4. Create `.claude/commands/prime-endpoint.md` — **Extended** — 7-file endpoint context loader (shared/types.ts → validation → service → routes → error middleware → client API → App.tsx). Accepts `$ARGUMENTS` as endpoint name (e.g., `/prime-endpoint flags`).
5. Create `.claude/commands/plan.md` — **Core 4** — 5-phase planning engine (Parse → Explore → Design → Generate → Output). Output: `.agents/plans/{name}.plan.md`. Accepts `$ARGUMENTS` as feature name for output file naming.
6. Create `.claude/commands/implement.md` — **Core 4** (`/execute` in workshop) — 7-phase execution engine with per-task `pnpm run build` validation. Phase 3.3 is the hard gate: fix before moving to next task. Accepts `$ARGUMENTS` as plan file path or feature name.
7. Create `.claude/commands/commit.md` — **Core 4** — structured conventional commit with summary. Accepts `$ARGUMENTS` as optional scope override (e.g., `/commit flags`).
8. Create `.claude/commands/validate.md` — **Extended** — single-pass validation reporter (lint → build → test, server + client). Accepts `$ARGUMENTS` as scope (`server`, `client`, or `all`).
9. Create `.claude/commands/create-prd.md` — **Extended** — PRD generator with 15-section structure following the **Prompt Structure 5-step** (Excal-6): Context Reference → Installation → Implementation → Testing/Validation → Commit. Accepts `$ARGUMENTS` as feature name.
10. Create `.claude/commands/review.md` — **Extended** — code review engine with severity categorization (Critical/High/Medium/Low). Accepts `$ARGUMENTS` as file paths or PR number.
11. Create `.claude/commands/security-review.md` — **Extended** — OWASP security scan (6 categories: Injection, Auth, Data Exposure, Dependencies, Cryptography, Error Handling). Accepts `$ARGUMENTS` as scope or file paths.

**Step C.2 — Skills (subroutines invoked by commands):**
12. Create `.claude/skills/agent-browser/SKILL.md` — Playwright browser automation subroutine (if needed by `/review` or `/validate` for UI testing).

**Step D — Document codebase (On-Demand Context = Layer 1, Loading Strategy #2):**
13. Create `.agents/reference/backend-patterns.md` — Express v5 layered architecture, SQL.js constraints, Zod validation-first, error classes, `file:line` references. Use [`docs/references/gold-standard-patterns.md`](../references/gold-standard-patterns.md) as MIRROR template for pattern depth (adjust for exercise's Express/SQL.js stack).
14. Create `.agents/reference/frontend-patterns.md` — React 19 + TanStack Query v5, Tailwind v4 + `cn()`, Radix UI composition, `file:line` references.
15. Create `.agents/reference/sql-js-constraints.md` — deep reference: boolean as INTEGER, `db.prepare()` + `stmt.bind()`, `stmt.free()` in finally, safe WHERE clause construction.

**Step E — Create PRD (Layer 2 — Task Planning):**
16. Generate PRD: `.agents/PRDs/feature-flag-filtering-e2.prd.md` with all 15 sections (Executive Summary, Problem Statement, User Research, Solution Overview, MVP Scope, Feature Specifications, Technical Requirements, Data Model, API Contract, UI/UX, Security, Performance, Testing, Rollout, Appendix). Must follow the **Prompt Structure 5-step** (Excal-6): **(1) Context Reference** — point to CLAUDE.md + on-demand context docs + TASK.md; **(2) Installation Commands** — pnpm install steps; **(3) Implementation Instructions** — file-by-file breakdown per data flow; **(4) Testing & Validation** — multi-layer validation (Zod + TypeScript + ESLint + Vitest); **(5) Commit & Summary** — /commit when green. References on-demand context docs from Step D.

**Step F — Validate AI Layer:**
17. Validate AI Layer three-tier architecture consistency: Tier 1 (CLAUDE.md) → Tier 2 (9 commands, each with I→P→O) → Tier 3 (skills) → On-Demand Context (≥2 reference docs) → Layer 2 (PRD with 15 sections).

**Manual checkpoint:** review all AI Layer artifacts for completeness, internal consistency, and alignment with workshop reference (`resident-health-workshop-resources/.claude/commands/`) before proceeding.

---

### ✅ [Story E2-S2 — Repository configuration and workflow activation](../agile/stories/story-E2S2-repository-configuration-workflow-activation.md)

**Priority:** P0 | **Depends on:** E2-S0

**Execution model:** Local Copilot + manual GitHub configuration → commit to `exercise-2`.

**Description:** as an engineer preparing the exercise repository, I want the `exercise-2` branch and Claude Code CI workflows fully configured so that the PIV Loop implementation can leverage automated PR reviews and `@claude` interactions.

**Key tasks:**
1. Create `exercise-2` branch from `f73979ed~1` (parent of first fork commit — upstream original state).
2. Cherry-pick documentation/agile/AI Layer artifacts from `exercise-1`.
3. Remove Exercise 1 automation workflows (5 files).
4. Move Claude Code workflows from `exercise-2-docs/` to `.github/workflows/` (3 files).
5. Install the Claude GitHub App on the fork.
6. Configure `ANTHROPIC_API_KEY` secret in the GitHub fork.
7. Push `exercise-2` and create a draft PR to validate workflows trigger correctly.
8. Run full validation suite on `exercise-2` — confirm server (16 tests, CRUD only) and client pass.

**Manual checkpoint:** confirm all 3 Claude workflows trigger on the draft PR before starting implementation.

---

### [Story E2-S3 — Server-side filtering re-implementation (PIV Loop)](../agile/stories/story-E2S3-server-side-filtering-reimplementation.md)

**Priority:** P0 | **Depends on:** E2-S2

**Execution model:** Claude Code (via `/plan` + `/implement`) → PR to `exercise-2` → automated review.

**Description:** as a software engineer using the PIV Loop, I want the server-side filtering pipeline re-implemented so that the API supports filtering by environment, status, type, owner, and name — with per-task build validation ensuring zero broken state accumulation.

> **PIV Loop execution note:** The "Key tasks" below outline the expected implementation flow for **tracking and checkpoint purposes only**. No separate agile task files are generated for this story. The actual task breakdown, ordering, and dependencies are managed by the `/plan` command, which generates `.agents/plans/feature-flag-filtering.plan.md` from the PRD. The **plan.md artifact is the single source of truth** for implementation task management during the PIV Loop.

**Key tasks (guidance — actual execution driven by plan.md):**
1. Execute `/plan` from the PRD — generate `.agents/plans/feature-flag-filtering.plan.md`. The plan leverages all **4 Context Engineering pillars** (Excal-3): RAG (references on-demand context docs), Memory (builds on CLAUDE.md), Task Management (ordered tasks with validation checkpoints), Prompt Engineering (clear I→P→O for each task). Follows the **Vibe Planning Meta-Loop** (Excal-6): Human provides direction (“implement filtering per TASK.md”) → AI finds docs & sources (PRD, on-demand context, CLAUDE.md) → AI structures into steps (task list with validation gates) → Result is the plan artifact ready for `/implement`.
2. Extend `shared/types.ts` with `FlagFilterParams` type → `pnpm run build` (server + client).
3. Add Zod filter query schema to `server/src/middleware/validation.ts` → `pnpm run build` (server).
4. Implement server-side filtering in `server/src/services/flags.ts` → `pnpm run build` (server).
5. Update `server/src/routes/flags.ts` to extract and forward filter params → `pnpm run build && pnpm test` (server).
6. Add server-side filtering test cases to `server/src/__tests__/flags.test.ts` → `pnpm test` (server).
7. Execute `/validate` — full server validation suite.

**Manual checkpoint:** run API filtering test via curl before E2-S4. This is the **Human Validation** role (Excal-3) — manual tests that complement the AI’s automated unit/integration tests. Verify: single filter, combined filters, empty result set, special characters in name search.

---

### [Story E2-S4 — Client-side filtering UI re-implementation (PIV Loop)](../agile/stories/story-E2S4-client-side-filtering-ui-reimplementation.md)

**Priority:** P0 | **Depends on:** E2-S3

**Execution model:** Claude Code (via `/implement` continuation) → PR to `exercise-2` → automated review.

**Description:** as a software engineer using the PIV Loop, I want the client-side filtering UI re-implemented so that users can visually filter flags by all criteria — with per-task build validation after each UI change.

> **PIV Loop execution note:** The "Key tasks" below outline the expected implementation flow for **tracking and checkpoint purposes only**. No separate agile task files are generated for this story. This story is a continuation of the `/implement` execution started in E2-S3, working from the same plan.md artifact.

**Key tasks (guidance — actual execution driven by plan.md):**
1. Update `client/src/api/flags.ts` to serialize filter params → `pnpm run build` (client).
2. Add filter state management in `client/src/App.tsx` → `pnpm run build` (client).
3. Create/update filter controls component (`flags-filter-controls.tsx`) → `pnpm run build` (client).
4. Implement "clear all filters" action → `pnpm run build` (client).
5. Add active-filter indicator to the UI → `pnpm run build` (client).
6. Ensure filter state is preserved across mutations (create/edit/delete) → `pnpm run build` (client).
7. Execute `/validate` — full client+server validation suite.

**Manual checkpoint:** test full UI flow in browser — all 11 TASK.md ACs verified. This is the **Human Validation** role (Excal-3): perform code review (architecture decisions, component structure, accessibility) and run manual tests (visual filter interaction, clear-all behavior, filter persistence across create/edit/delete). The **AI Validation** role (automated tests + PR review) runs in parallel via CI workflows.

---

### [Story E2-S5 — Measurement, comparison, and closure](../agile/stories/story-E2S5-measurement-comparison-closure.md)

**Priority:** P0 | **Depends on:** E2-S3, E2-S4

**Execution model:** Local Copilot → commit to `exercise-2`.

**Description:** as an engineer completing the AI-assisted exercise run, I want a comprehensive comparative analysis of Exercise 1 vs Exercise 2 so that the PIV Loop's impact on productivity, quality, and confidence can be quantitatively assessed for the workshop debrief.

**Key tasks:**
1. Execute full validation suite (server + client) and confirm all 11 criteria pass.
2. Complete metrics document (`.agents/baseline/measurement-exercise2.md`) with all collected data (time, prompts, rework cycles, confidence on **1–5 scale**).
3. Produce comparative analysis document — delta table (time, prompts, rework, confidence) with explanatory notes. Include: prep overhead as separate line item, total cost (prep + implementation) vs baseline.
4. Write friction log with PIV Loop-specific observations — **including all `[SYSTEM-EVOLUTION]` entries** from Phase 3 (what was changed, why, and the impact).
5. **System Evolution retrospective:** review all `[SYSTEM-EVOLUTION]` entries and classify them:
    - **Pattern A — Preventable:** the issue would have been avoided if the original command/rule/context had been better. Record the root cause for future AI Layer creation.
    - **Pattern B — Emergent:** the issue could only be discovered during implementation. Record as a known constraint for future exercises.
    - **"3+ times = command" audit (Excal-5):** check if any prompt was repeated 3+ times during implementation without being extracted into a command. If so, record it as a missed System Evolution opportunity and create the command retroactively. Calculate the **re-prompting tax** saved: `(repeats × ~1 min) × (expected future sessions)` = time saved by creating the command.
    - This retrospective feeds directly into the workshop interview debrief ("What did you learn about the system you built?").
6. Create PR → exercise-2 and confirm automated Claude reviews complete.
7. Produce EPIC-2 closure report.
8. Produce EPIC-3 handoff document.

**Manual checkpoint:** sign off on comparative metrics, friction log (with system evolution entries), and retrospective. Confirm all evidence is committed.

---

## 8) AI Layer execution map

Which agents and skills are responsible for executing each story in this epic.

| Story | Responsible agent(s) | Skills | Instructions |
|---|---|---|---|
| E2-S0 — Planning automation | `agile-exercise-planner` | `scaffold-stories-from-epic`, `create-story-task-pack`, `sync-backlog-index` | `agile-planning.instructions.md` |
| E2-S1 — Claude AI Layer prep | `prompt-engineer`, `rules-bootstrap` | `create-specialist-agent`, `global-rules-bootstrap`, `analyze-rdh-workflow` | `copilot-config-governance.instructions.md`, `workshop-resources.instructions.md` |
| E2-S2 — Repo configuration | `git-ops`, `copilot-env-specialist` | `fork-and-configure-remotes`, `copilot-env-setup` | `git-operations.instructions.md`, `feature-flag-exercise.instructions.md` |
| E2-S3 — Server-side filtering | Claude Code (`/plan` + `/implement`) | Workshop commands: `plan.md`, `implement.md`, `validate.md` | `CLAUDE.md`, `coding-agent.instructions.md` |
| E2-S4 — Client-side filtering UI | Claude Code (`/implement` continuation) | Workshop commands: `implement.md`, `validate.md`, `review.md` | `CLAUDE.md`, `coding-agent.instructions.md` |
| E2-S5 — Measurement & closure | `agile-exercise-planner` | `produce-epic-closure-report`, `produce-epic-handoff`, `record-friction-point` | `documentation.instructions.md`, `measurement-baseline.instructions.md` |

---

## 9) Technical reference

### Affected files (expected — same as Exercise 1)

| File | Change type | Reason |
|---|---|---|
| `CLAUDE.md` | Update | Adapt for Exercise 2 context and PIV Loop rules |
| `.claude/commands/*.md` | Create | Slash commands for the PIV Loop workflow |
| `.claude/skills/*/SKILL.md` | Create | Reusable subroutines for commands |
| `.agents/PRDs/feature-flag-filtering-e2.prd.md` | Create | PRD with 15-section structure |
| `.agents/plans/feature-flag-filtering.plan.md` | Create | Formal implementation plan (generated by `/plan`) |
| `.agents/reference/backend-patterns.md` | Create | On-demand context: Express v5, SQL.js, Zod patterns |
| `.agents/reference/frontend-patterns.md` | Create | On-demand context: React 19, TanStack Query, Tailwind v4 |
| `.agents/reference/sql-js-constraints.md` | Create | On-demand context: SQL.js-specific limitations deep reference |
| `shared/types.ts` | Extend | Add `FlagFilterParams` type |
| `server/src/middleware/validation.ts` | Extend | Add Zod schema for filter query params |
| `server/src/services/flags.ts` | Modify | Accept and apply `FlagFilterParams` in `getAll()` |
| `server/src/routes/flags.ts` | Modify | Extract filter params and pass to service |
| `server/src/__tests__/flags.test.ts` | Extend | Add test cases for each filter dimension |
| `client/src/api/flags.ts` | Modify | Serialize filter params in `GET /api/flags` call |
| `client/src/App.tsx` | Modify | Add filter state, pass to API and UI |
| `client/src/components/flags-filter-controls.tsx` | Create | Filter controls panel |
| `.github/workflows/claude.yml` | Create (move) | Activate Claude Code workflow |
| `.github/workflows/pr-review.yml` | Create (move) | Activate PR review workflow |
| `.github/workflows/security-review.yml` | Create (move) | Activate security review workflow |

### Layer 1 vs Layer 2 artifact mapping (Excal-3, Excal-4)

| Artifact | Layer | Loading strategy | When loaded | Persistence |
|---|---|---|---|---|
| `CLAUDE.md` | Layer 1 — Global Rules | **#1 — Always** (auto-loaded every session) | Every Claude session | Permanent — rarely changes |
| `.claude/commands/*.md` | Layer 1 — Commands | **#1 — Always** (available every session, loaded on invocation) | When user invokes the command | Permanent — evolves via System Evolution |
| `.claude/skills/*/SKILL.md` | Layer 1 — Skills | **#1 — Always** (available every session) | When a command invokes the skill | Permanent |
| `.agents/reference/backend-patterns.md` | Layer 1 — On-Demand Context | **#2 — As Needed** (loaded for backend tasks) | When `/implement` or `/plan` processes a backend task | Permanent — updated via System Evolution if gaps found |
| `.agents/reference/frontend-patterns.md` | Layer 1 — On-Demand Context | **#2 — As Needed** (loaded for frontend tasks) | When `/implement` or `/plan` processes a frontend task | Permanent — updated via System Evolution if gaps found |
| `.agents/reference/sql-js-constraints.md` | Layer 1 — On-Demand Context | **#2 — As Needed** (loaded for database tasks) | When `/implement` or `/plan` processes a SQL.js task | Permanent — updated via System Evolution if gaps found |
| `.agents/PRDs/feature-flag-filtering-e2.prd.md` | Layer 2 — Task Context | **#3 — Task-specific** (loaded for this feature) | When `/plan` or `/implement` is invoked for this feature | Feature-scoped — new PRD for each feature |
| `.agents/plans/feature-flag-filtering.plan.md` | Layer 2 — Task Context | **#3 — Task-specific** (generated from PRD) | When `/implement` executes the plan | Feature-scoped — new plan for each feature |

### Validation commands

```bash
# Server (from server/)
pnpm run build   # TypeScript type check — must pass
pnpm run lint    # ESLint — must pass
pnpm test        # Vitest — all tests must pass

# Client (from client/)
pnpm run build   # tsc + vite build — must pass
pnpm run lint    # ESLint — must pass
```

### Foundation-first setup order (Excal-6 reference)

The Gold Standard codebase (`nextjs-ai-optimized-codebase`) was built following this foundation-first order. While Exercise 2 works with an existing codebase (Brownfield), understanding this order helps assess AI Layer quality and validates that the existing codebase already has these foundations in place:

| Order | Foundation layer | Exercise 2 codebase status | Why it matters for AI |
|---|---|---|---|
| 1 | **Testing & Validation** | ✅ Vitest + ESLint + tsc strict mode | AI needs guardrails from day one — automated feedback loops catch errors immediately |
| 2 | **Logging** | ⚠️ Minimal (console-based) | In Gold Standard: JSON structured logs with `domain.component.action_state` pattern. Exercise 2 has basic logging — sufficient for exercise scope |
| 3 | **Infrastructure** | ✅ Express v5 + Vite + ESM | Framework is in place before data layer |
| 4 | **Database** | ✅ SQL.js (in-memory + file persistence) | Persistence needs foundation. SQL.js has specific constraints documented in on-demand context |
| 5 | **Monitoring & Health** | ⚠️ No health endpoints | Gold Standard has `/health`, `/health/db`, `/health/ready`. Not required for exercise scope |
| 6 | **Shared Patterns** | ✅ `shared/types.ts` + error classes + `cn()` | Prevents duplication in features — extract after infrastructure is solid |

> **Compounding Quality Effect (Excal-6):** ✔ Tests validate logging → ✔ Logging enables infrastructure debugging → ✔ Infrastructure supports database operations → ✔ Everything builds on the foundation. The same principle applies to AI Layer artifacts: validated `CLAUDE.md` (Layer 1) improves command quality → validated commands improve plan quality (Layer 2) → validated plans improve implementation quality → **"Production-ready + built for AI from start."**

### Prompt Structure 5-step reference (Excal-6)

The workshop defines a standard structure for PRDs and implementation prompts. All structured artifacts (PRD, plan, implementation instructions) should follow this 5-step sequence:

| Step | Purpose | Exercise 2 mapping |
|---|---|---|
| 1. **Context Reference** | Point to external docs the AI should read | `CLAUDE.md`, `.agents/reference/*.md`, `TASK.md` |
| 2. **Installation Commands** | Package/dependency setup | `pnpm install` for server and client |
| 3. **Implementation Instructions** | File-by-file breakdown of changes | Data flow order: `shared/types.ts` → `validation.ts` → `flags.ts` (service) → `flags.ts` (routes) → `flags.ts` (client API) → `App.tsx` |
| 4. **Testing & Validation** | Multiple validation layers | Zod (runtime) + TypeScript (compile) + ESLint (static) + Vitest (behavioral) |
| 5. **Commit & Summary** | `/commit` when green | Conventional commit with task ID, structured summary of changes |

### Vibe Planning: The Meta-Loop (Excal-6 reference)

The `/plan` command internally follows this meta-loop pattern:

```
Human: provides plan direction ("implement feature flag filtering per TASK.md")
    │
    ▼
AI: finds docs & sources (reads PRD, on-demand context, CLAUDE.md, TASK.md)
    │
    ▼
AI: structures into steps (ordered task list with validation checkpoints)
    │
    ▼
Result: Code + Docs (the .plan.md artifact, ready for /implement)
```

This is distinct from the full PIV Loop — Vibe Planning is the *internal workflow of the Plan phase*, while the PIV Loop is the *outer lifecycle* (Plan → Implement → Validate → Iterate).

### Human vs AI Validation roles (Excal-3 reference)

| Role | Performed by | What it catches | Exercise 2 tools |
|---|---|---|---|
| **Human Validation** | Engineer (you) | Semantic errors: wrong business logic, poor UX, architectural drift, naming quality, edge cases | Code review (manual), browser testing (manual UI flow), curl API spot checks |
| **AI Validation** | Claude Code + CI | Mechanical errors: type mismatches, lint violations, test failures, security vulnerabilities | `pnpm test` (Vitest), `pnpm run build` (tsc), `pnpm run lint` (ESLint), `pr-review.yml` + `security-review.yml` (automated PR review) |

> The two roles are complementary, never redundant. The AI catches errors at machine speed with perfect consistency; the human catches errors that require understanding intent, context, and user experience. **Both roles must be applied at every validation checkpoint.**

### Key patterns to follow

- `shared/types.ts` is the single source of truth — server and client both import from it.
- SQL.js statements: always use `try-finally` with `stmt.free()`.
- Route handlers must use `next(error)` for error propagation.
- Filters compose with AND logic (all active filters must match simultaneously).
- React Query: filter params should be part of the `queryKey` so the query re-runs when filters change.
- **PIV Loop discipline:** `pnpm run build` after every task — fix before moving on.
- **"3+ times = make it a command" (Excal-5):** if you find yourself typing the same instruction 3 or more times during implementation, extract it into a command file in `.claude/commands/`. This is both a creation heuristic (when building the AI Layer) and a System Evolution trigger (when iterating during implementation).
- **Command chaining (Excal-5):** design command Outputs to be compatible with downstream commands' expected Inputs. The full exercise chain: `/create-prd` → PRD → `/plan` → plan → `/implement` → code → `/validate` → report → `/commit` → commit summary.
- **Compounding Quality Effect (Excal-6):** each verified layer improves the quality of subsequent layers. Tests validate logging → Logging enables infrastructure debugging → Infrastructure supports database operations → Everything builds on the foundation. Apply the same principle to AI Layer artifacts: validated `CLAUDE.md` improves command quality → validated commands improve plan quality → validated plans improve implementation quality.
- **Context Engineering pillars (Excal-3):** every structured interaction with the AI should leverage all 4 pillars: **RAG** (on-demand context), **Memory** (global rules), **Task Management** (structured plans), **Prompt Engineering** (I→P→O commands). Incomplete pillar coverage leads to hallucinations or suboptimal output.
- **Human vs AI Validation (Excal-3 dual-role model):** validation has two complementary roles. **Human Validation:** code review (architecture, naming, edge cases) + manual tests (browser UI flow, curl API checks). **AI Validation:** unit tests (`pnpm test`) + integration checks (`pnpm run build` + `pnpm run lint`) + automated PR review. Neither role alone is sufficient — always apply both.
- **Dynamic command parameters (Excal-5):** commands accept `$ARGUMENTS` (full string) or positional `$1`/`$2`/`$3` for flexibility. Example: `/plan feature-flag-filtering` → `$ARGUMENTS = 'feature-flag-filtering'` → plan output named `.agents/plans/feature-flag-filtering.plan.md`. Design commands to accept common overrides (feature name, scope, file paths).
- **Vibe Planning Meta-Loop (Excal-6):** the planning phase follows: Human provides direction → AI finds docs & sources → AI structures into steps → Result is Code + Docs. This is the `/plan` command’s internal workflow.
- **Prompt Structure 5-step (Excal-6):** PRDs and implementation instructions follow: **(1)** Context Reference (point to docs) → **(2)** Installation Commands → **(3)** Implementation Instructions (file-by-file) → **(4)** Testing & Validation (multiple layers) → **(5)** Commit & Summary (`/commit` when green).

---

## 10) Execution model

This epic uses a **hybrid execution model** with two distinct phases:

### Phase 1 — Preparation (Copilot with Claude Opus 4.6 in VS Code)

```
Workshop reference (resident-health-workshop-resources)
    │
    ▼  analyze-rdh-workflow + create-specialist-agent
Claude AI Layer artifacts (Layer 1 — Context Engineering 4 pillars)
    │  CLAUDE.md (Memory pillar — auto-loaded every session)
    │  .claude/commands/ (Prompt Engineering pillar — I→P→O)
    │  .claude/skills/ (subroutines invoked by commands)
    │  .agents/reference/ (RAG pillar — on-demand context)
    │
    ▼  create-prd (manual or via /create-prd)
PRD (.agents/PRDs/feature-flag-filtering-e2.prd.md)
    │  Layer 2 — Task Planning (Task Management pillar)
    │
    ▼  git-ops + copilot-env-setup
Repository configured (exercise-2 branch, workflows, secrets)
    │
    ▼  Workflow validation (draft PR test)
READY for implementation
```

> **Compounding Quality Effect (Excal-6):** validate each layer before building the next. Validated `CLAUDE.md` → better commands → better plan → better code.

### Phase 2 — Implementation (Claude Code via GitHub workflows + PIV Loop — 4 phases)

```
PRD (from Phase 1) — command chaining starts here
    │
    ▼  /plan (Vibe Planning Meta-Loop: Human direction → AI finds docs → AI structures steps → plan artifact)
       (Input: PRD + CLAUDE.md + on-demand context | $ARGUMENTS = feature name)
       (CE pillars: RAG + Memory + Task Management + Prompt Engineering)
Implementation plan (.agents/plans/feature-flag-filtering.plan.md)
    │
    ▼  /implement (Input: plan + on-demand context | $ARGUMENTS = plan path | per-task build validation)
Server + Client filtering implemented
    │
    ▼  /validate (Input: codebase | $ARGUMENTS = scope | full suite)
       ┌─────────────────────────────────────────┐
       │  AI Validation (automated):              │
       │    pnpm test → pnpm run build → lint     │
       │    pr-review.yml + security-review.yml    │
       ├─────────────────────────────────────────┤
       │  Human Validation (manual):              │
       │    Code review (architecture, naming)     │
       │    Browser test (UI flow)                 │
       │    curl API spot checks (filters)         │
       └─────────────────────────────────────────┘
All green (both roles satisfied)
    │
    ▼  Iterate — System Evolution (4th PIV phase)
    │  Did the loop reveal recurring issues?
    │  YES → update commands/rules/context/plan → log [SYSTEM-EVOLUTION]
    │       (check: "3+ times = command" heuristic)
    │  NO  → proceed to PR
    │
    ▼  /commit (Input: staged changes | $ARGUMENTS = optional scope | Output: conventional commit)
    │
    ▼  PR → automated reviews (pr-review.yml + security-review.yml)
Reviewed and merged
    │
    ▼  Metrics + comparative analysis + System Evolution retrospective
EPIC-2 closed
```

> **"Trust but verify" monitoring (Excal-1):** during `/implement`, monitor that Claude Code: uses your tools correctly, reads/edits the right files, manages its tasks properly, and its "thinking" tokens show it understands the plan. Let the agent run, but intervene if signals break down.

### Key principles

| Principle | Rationale |
|---|---|
| Prep and implementation tracked separately | Enables fair comparison: prep overhead is a one-time "front-loading context" investment (Excal-4: ~30-60 min once), implementation time is the comparable metric |
| PIV Loop per-task build validation | Catches errors early — no broken state accumulation (key differentiator from Baseline) |
| System Evolution after /validate | 4th PIV phase: if recurring issues detected, fix the system (commands, rules, context), not just the symptom |
| "3+ times = command" heuristic | If a prompt is repeated 3+ times during implementation, extract it as a command. Eliminates re-prompting tax (Excal-5) |
| Command chaining design | Each command's Output is designed to be the next command's Input. Enables end-to-end automation (Excal-5) |
| Compounding Quality Effect | Each verified AI Layer artifact improves the next: CLAUDE.md → commands → plan → code. "Production-ready + built for AI from start" (Excal-6) |
| Context Engineering 4 pillars | Every structured AI interaction uses RAG + Memory + Task Management + Prompt Engineering. Incomplete coverage → hallucinations (Excal-3) |
| Automated PR reviews | Adds a structured review layer that Exercise 1 lacked |
| Same TASK.md, same acceptance criteria | Ensures apples-to-apples metric comparison |
| Clean branch from upstream state | Implementation starts from the same starting point as Exercise 1 |
| Trust but verify | Monitor agent signals during /implement — let it run, intervene if thinking/file-editing signals break down (Excal-1) |
| Human + AI validation | Both roles at every checkpoint: AI catches mechanical errors at machine speed, human catches semantic/architectural errors (Excal-3) |
| Dynamic command parameters | Commands accept `$ARGUMENTS`/`$1`/`$2`/`$3` for flexibility — same command serves multiple features/contexts (Excal-5) |
| Vibe Planning Meta-Loop | `/plan` follows: Human direction → AI finds docs → AI structures steps → Result is code+docs (Excal-6) |
| Prompt Structure 5-step | Structured artifacts follow: Context Reference → Installation → Implementation → Testing/Validation → Commit (Excal-6) |

---

## 11) Expected evidence

**Phase 1 — AI Layer preparation:**
1. `CLAUDE.md` adapted for Exercise 2 on `exercise-2` branch.
2. `.claude/commands/` with all Core 4 commands + at least 1 extended command.
3. `.claude/skills/` with at least 1 skill.
4. PRD at `.agents/PRDs/feature-flag-filtering-e2.prd.md`.
5. On-demand context docs at `.agents/reference/` (at least `backend-patterns.md` and `frontend-patterns.md`).
6. Timestamp log of AI Layer creation time (prep overhead metric).

**Phase 2 — Repository configuration:**
7. `exercise-2` branch created from correct commit (pre-fork state).
8. Exercise 1 automation workflows absent from `.github/workflows/`.
9. Claude Code workflows present and active in `.github/workflows/`.
10. Draft PR screenshot/log showing Claude workflows triggered.
11. `ANTHROPIC_API_KEY` secret configured (confirmed by workflow success).

**Phase 3 — Implementation:**
12. Implementation plan at `.agents/plans/feature-flag-filtering.plan.md`.
13. Passing output of all server validation commands.
14. Passing output of all client validation commands.
15. Git log showing per-task commits with task IDs.
16. PR with automated Claude Code reviews (comments from `pr-review.yml`).

**Phase 4 — Measurement and closure:**
17. Metrics document at `.agents/baseline/measurement-exercise2.md` (with confidence on 1-5 scale).
18. Comparative analysis document (Exercise 1 vs Exercise 2 delta table — including prep overhead as separate line).
19. Friction log with PIV Loop-specific observations — including all `[SYSTEM-EVOLUTION]` entries.
20. System Evolution retrospective (Pattern A: Preventable vs Pattern B: Emergent classification).
21. EPIC-2 closure report.
22. EPIC-3 handoff document.

---

## 12) References

- [TASK.md](../../TASK.md) — full task description and 11 acceptance criteria
- [AGENTS.md](../../AGENTS.md) — architecture, data flow, validation commands, code patterns
- [CLAUDE.md](../../CLAUDE.md) — global rules for Claude Code (current state — to be adapted)
- [.agents/closure/epic2-handoff.md](../../.agents/closure/epic2-handoff.md) — starting state, known risks, READY declaration
- [.agents/baseline/measurement-baseline.md](../../.agents/baseline/measurement-baseline.md) — Exercise 1 baseline metrics
- [manuals/epic2-preparation-guide.md](../../manuals/epic2-preparation-guide.md) — step-by-step preparation guide with checklist
- [docs/epics/Epic 1 — Baseline Implementation: Feature Flag Filtering.md](Epic%201%20—%20Baseline%20Implementation:%20Feature%20Flag%20Filtering.md) — Exercise 1 epic (for comparison)
- [exercise-2-docs/claude.yml](../../exercise-2-docs/claude.yml) — Claude Code workflow (source)
- [exercise-2-docs/pr-review.yml](../../exercise-2-docs/pr-review.yml) — PR Review workflow (source)
- [exercise-2-docs/security-review.yml](../../exercise-2-docs/security-review.yml) — Security Review workflow (source)
- [.github/agents/rdh-workflow-analyst.agent.md](../../.github/agents/rdh-workflow-analyst.agent.md) — PIV Loop reference and command documentation
- [Excal-1-Workshop-Guide.md](../../../resident-health-workshop-resources/ai-context/Excal-1-Workshop-Guide.md) — Greenfield vs Brownfield workflow, PIV Loop, System Evolution, Trust but verify
- [Excal-2-SystemGap.md](../../../resident-health-workshop-resources/ai-context/Excal-2-SystemGap.md) — Developer A vs B, System Gap, confidence scale, baseline exercise
- [Excal-3-PIVLoop.md](../../../resident-health-workshop-resources/ai-context/Excal-3-PIVLoop.md) — 4-phase PIV model, Layer 1 vs Layer 2, Context Engineering
- [Excal-4-GlobalRules.md](../../../resident-health-workshop-resources/ai-context/Excal-4-GlobalRules.md) — Global rules purpose, Layer 1/L2 distinction, front-loading context, Loading Strategies
- [Excal-5-ReusablePrompts.md](../../../resident-health-workshop-resources/ai-context/Excal-5-ReusablePrompts.md) — Commands as Input→Process→Output, Core 4 pattern
- [Excal-6-AI-Optimized-Codebases.md](../../../resident-health-workshop-resources/ai-context/Excal-6-AI-Optimized-Codebases.md) — Foundation-first setup, Prompt Structure, Compounding Quality
- [docs/references/gold-standard-patterns.md](../references/gold-standard-patterns.md) — Gold Standard codebase patterns reference (VSA, Pino logging, env validation, error handling, Biome rules, testing mocks, health endpoints)
- `nextjs-ai-optimized-codebase/CODEBASE-GUIDE.md` — Gold Standard deep walkthrough (1992 lines): AI-optimized principles, VSA examples, type safety chain, structured logging, error handling 3-layer, testing strategy, fast tooling comparison