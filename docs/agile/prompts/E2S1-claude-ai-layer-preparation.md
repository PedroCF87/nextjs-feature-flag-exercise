# Execution Prompts — Story E2-S1: Claude AI Layer Preparation

> **Purpose:** Ready-to-use prompts for executing each of the 8 tasks in Story E2-S1.
> Each prompt is designed to be pasted directly into the chat with the responsible agent.
> Execute tasks in order (T1 → T8) — each builds on the output of the previous.

---

## Task E2-S1-T1 — Analyze codebase and map architecture (Step A)

**Agent:** `project-adaptation-analyst`

```
Execute task E2-S1-T1: Analyze the nextjs-feature-flag-exercise codebase and produce a structured architecture summary.

Context: This is Step A of the Brownfield Workflow (Understand Code → Extract Rules → Setup Commands → Document Codebase) for preparing the Claude Code AI Layer for Exercise 2.

Read these files in order:
1. `.agents/closure/codebase-audit.md` — existing audit from Epic 0/1
2. `AGENTS.md` — agent conventions and architecture reference
3. `CLAUDE.md` — current global rules
4. `shared/types.ts` — data contracts (FeatureFlag, CreateFlagInput, etc.)
5. `server/src/services/flags.ts` — business logic and SQL.js queries
6. `server/src/routes/flags.ts` — Express v5 route handlers
7. `server/src/middleware/validation.ts` — Zod schemas
8. `server/src/middleware/error.ts` — custom error classes (NotFoundError, ConflictError, ValidationError)
9. `server/src/db/` — database client, schema, seeding
10. `client/src/api/flags.ts` — fetch wrappers
11. `client/src/App.tsx` — React Query hooks and main UI
12. `client/src/components/flags-table.tsx` and `flag-form-modal.tsx` — key UI components
13. `server/src/__tests__/flags.test.ts` — test patterns

Produce a summary document at `.agents/closure/e2-architecture-analysis.md` with these sections:

1. **Architecture layers** — server (Express v5 + SQL.js + Zod), client (React 19 + Vite + TanStack Query + Tailwind v4), shared types
2. **Data flow** — shared/types.ts → Zod validation → service → routes → client API → TanStack Query → UI
3. **Naming conventions** — camelCase functions, PascalCase types/components, kebab-case files, snake_case DB columns
4. **Error handling patterns** — custom error classes → next(error) → error middleware → JSON response
5. **SQL.js constraints** — booleans as INTEGER 0/1, db.prepare() + stmt.bind() for parameterized queries, always stmt.free() in try/finally, db.exec() for DDL only
6. **Test strategy** — Vitest, _resetDbForTesting() per test, in-memory database isolation
7. **Integration points** — where filtering code needs to touch (GET /api/flags route, flags service, client API, UI filter controls)
8. **Key patterns to preserve** — import type for type-only imports, strict TypeScript, no `any`

This summary will feed directly into T2 (CLAUDE.md), T6 (on-demand context), and T7 (PRD).
Do NOT create or modify any source code files — this is an analysis-only task.
```

---

## Task E2-S1-T2 — Create/update CLAUDE.md for Exercise 2 (Step B)

**Agent:** `rules-bootstrap`

```
Execute task E2-S1-T2: Create the CLAUDE.md file adapted for Exercise 2 of the Feature Flag exercise.

Context: This is Step B of the Brownfield Workflow — Extract Rules (Global Rules). The CLAUDE.md must follow the Excal-4 Venn diagram structure with exactly 4 categories. Use the analysis from `.agents/closure/e2-architecture-analysis.md` as input.

Reference patterns:
- Gold Standard: `nextjs-ai-optimized-codebase/CLAUDE.md` (two-document pattern with CODEBASE-GUIDE.md)
- Workshop template: `resident-health-workshop-resources/.claude/CLAUDE-template.md`
- Current repo: `CLAUDE.md` (existing Exercise 1 version — use as base but adapt for Exercise 2 state)

Create `CLAUDE.md` at the repository root with these mandatory sections, organized by the 4 Venn diagram categories:

### Category 1 — Tech Stack & Architecture
- Backend: Node.js ESM + Express v5 + SQL.js + Zod + Vitest
- Frontend: React 19 + Vite + TanStack Query v5 + Tailwind CSS v4 + Radix UI
- Shared: `shared/types.ts` as single source of truth
- Data flow diagram: types → validation → service → routes → client API → UI
- API endpoints table (GET/POST/PUT/DELETE /api/flags)
- Key file reference table

### Category 2 — Code Styles & Patterns
- TypeScript strict mode, no `any`, `import type` for type-only imports
- Backend: layered architecture (routes → services → DB), next(error) propagation, custom error classes
- Frontend: TanStack Query for async state, controlled components, cn() for Tailwind, Radix UI primitives
- SQL.js: parameterized queries with stmt.bind(), always stmt.free() in try/finally, booleans as INTEGER 0/1
- Naming: camelCase vars/functions, PascalCase types/components, kebab-case files

### Category 3 — Testing Requirements
- Vitest for backend, `_resetDbForTesting()` per test for DB isolation
- describe/it blocks, expect().toBe()/toEqual()/toThrow()
- Validation commands: `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint`

### Category 4 — Misconceptions AI Often Has
- SQL.js has no async API — all calls are synchronous
- `db.exec()` does NOT accept parameters — use `db.prepare()` + `stmt.bind()` instead
- Booleans are stored as INTEGER 0/1, not true/false — convert explicitly
- Express v5 requires `next(error)` — do not catch and manually respond with res.status().json()
- `shared/types.ts` is the contract — never define duplicate types in server or client
- Use `import type` for type-only imports — TypeScript strict mode enforces this

Critical rules to include:
- Branch: `exercise-2` (never commit to `main` or `exercise-1`)
- Methodology: PIV Loop (Plan → Implement → Validate)
- Exercise state: starts from clean upstream (no filtering code exists)
- Never migrate to Bun, never replace SQL.js with Postgres within this exercise

Do NOT include:
- Universal knowledge (what Express is, what React is)
- Workflow/command definitions (that goes in .claude/commands/)
- Task-specific content (that goes in PRD)
```

---

## Task E2-S1-T3 — Create Core 4 commands (Step C)

**Agent:** `prompt-engineer`

```
Execute task E2-S1-T3: Create the Core 4 Claude Code slash commands for the PIV Loop.

Context: This is Step C of the Brownfield Workflow — Setup Commands. Each command follows the Input → Process → Output (I→P→O) structure. Use the workshop reference commands in `resident-health-workshop-resources/.claude/commands/` as the template basis, but adapt every reference to this project's specific architecture (Express v5 + SQL.js + React 19, NOT FastAPI/Supabase/Drizzle).

Create these 4 files in `.claude/commands/`:

### 1. `prime.md` — Load project context
- **Input:** $ARGUMENTS (optional file path or feature area)
- **Process:**
  1. Read `CLAUDE.md` for project rules
  2. Read `shared/types.ts` for data contracts
  3. Study server architecture: `server/src/services/flags.ts`, `server/src/routes/flags.ts`, `server/src/middleware/`
  4. Study client architecture: `client/src/api/flags.ts`, `client/src/App.tsx`, `client/src/components/`
  5. Check recent git state: `git log --oneline -5 && git status`
  6. If $ARGUMENTS points to a PRD, read it for task context
- **Output:** Scannable summary of architecture, data flow, key patterns, and current state

### 2. `plan.md` — Create implementation plan
- **Input:** $ARGUMENTS (feature description or path to PRD file)
- **Process:**
  1. Parse input (PRD file, .md file, or free-form text)
  2. Explore codebase for similar patterns with file:line references
  3. Identify files to CREATE vs UPDATE
  4. Order tasks by data flow: types → validation → service → routes → client API → UI → tests
  5. Define validation checkpoints per task
- **Output:** Plan markdown file saved to `.agents/plans/` with: Summary, Pattern References, File Change List, Task Breakdown, Validation Commands
- **Key rule:** PLAN ONLY — no code written. The plan enables one-pass implementation.

### 3. `implement.md` — Execute implementation plan
- **Input:** $ARGUMENTS (path to plan.md file)
- **Process:**
  1. Load plan, extract tasks and validation commands
  2. For each task: implement → validate → fix if needed → next task
  3. Validation after each file change: `cd server && pnpm run build && pnpm test` (for server changes) or `cd client && pnpm run build` (for client changes)
  4. Never accumulate broken state — fix before moving on
- **Output:** Summary of changes made, validation results, files modified
- **Golden rule:** If validation fails, fix it before moving to the next task.

### 4. `commit.md` — Commit with Conventional Commits
- **Input:** $ARGUMENTS (optional custom message override)
- **Process:**
  1. Run full validation: `cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint`
  2. If validation fails, report errors and STOP — do not commit broken code
  3. Show `git diff --stat` for review
  4. Generate commit message following Conventional Commits: `<type>(<scope>): <description>`
  5. Stage and commit: `git add -A && git commit -m "<message>"`
- **Output:** Commit hash and message summary
- **Types:** feat | fix | docs | style | refactor | test | chore

Each command must have YAML front matter with `description` and `argument-hint` fields.
Do NOT reference MCP tools (Jira, Confluence, Atlassian) — this exercise has no MCP integrations.
Do NOT reference Supabase, Drizzle, Bun, or any tech not in this repo's stack.
```

---

## Task E2-S1-T4 — Create extended commands (Step C continued)

**Agent:** `prompt-engineer`

```
Execute task E2-S1-T4: Create 5 extended Claude Code slash commands that complement the Core 4.

Context: Continues Step C of the Brownfield Workflow. Same I→P→O structure as Core 4. Use `resident-health-workshop-resources/.claude/commands/` as reference but adapt to this project's stack (Express v5 + SQL.js + React 19).

Create these 5 files in `.claude/commands/`:

### 1. `prime-endpoint.md` — Learn the full endpoint pattern
- **Input:** $ARGUMENTS (optional endpoint name or feature area)
- **Process:** Study the complete data flow for a single endpoint: `shared/types.ts` → `server/src/middleware/validation.ts` (Zod) → `server/src/services/flags.ts` → `server/src/routes/flags.ts` → `server/src/middleware/error.ts` → `client/src/api/flags.ts` → `client/src/App.tsx`
- **Output:** Scannable summary of: Type Flow, Validation Pattern, Service Pattern, Route Pattern, Client Pattern, Error Handling Chain

### 2. `validate.md` — Run full validation suite
- **Input:** (no arguments)
- **Process:**
  1. Server: `cd server && pnpm run lint && pnpm run build && pnpm test`
  2. Client: `cd client && pnpm run lint && pnpm run build`
  3. Collect all results
- **Output:** Table with Check | Result | Details for each validation step. If all pass: "✅ All checks pass". If failures: list each with details.

### 3. `create-prd.md` — Generate a Product Requirements Document
- **Input:** $ARGUMENTS (output filename, defaults to PRD.md)
- **Process:**
  1. Extract requirements from conversation context
  2. Ask clarifying questions if critical info is missing
  3. Generate PRD with 15 sections: Executive Summary, Mission, Target Users, MVP Scope, User Stories, Core Architecture, Tools/Features, Technology Stack, Security & Configuration, API Specification, Success Criteria, Implementation Phases, Future Considerations, Risks & Mitigations, Appendix
- **Output:** PRD saved to `.agents/PRDs/$ARGUMENTS`

### 4. `review.md` — Code review
- **Input:** $ARGUMENTS (file path, folder, or scope description)
- **Process:**
  1. Determine scope (file, folder, git diff, or PR)
  2. Check code against project patterns from CLAUDE.md
  3. Run validation (build + lint + test)
  4. Identify issues by severity (Critical/High/Medium/Low)
- **Output:** Review report with: File:Line, Issue, Suggestion, Priority per finding

### 5. `security-review.md` — Security-focused code review
- **Input:** $ARGUMENTS (file or directory; defaults to staged changes)
- **Process:**
  1. Determine scope (file, directory, or git diff)
  2. Check against OWASP Top 10 categories relevant to this stack
  3. Focus areas: SQL injection (SQL.js parameterized queries), input validation (Zod schemas), error information leakage, CORS configuration, dependency vulnerabilities
- **Output:** Security findings table with: Category, Severity, File:Line, Finding, Remediation

Each command must have YAML front matter with `description` and `argument-hint` (where applicable).
Do NOT reference MCP tools, Jira, Confluence, Supabase, Drizzle, or Bun.
```

---

## Task E2-S1-T5 — Create skills directory (Step C.2)

**Agent:** `prompt-engineer`

```
Execute task E2-S1-T5: Create the agent-browser skill for Playwright browser automation.

Context: This is Step C.2 of the Brownfield Workflow — creating reusable subroutines (skills) that commands can invoke. Skills are longer-form instructions that would bloat a command if included inline.

Use the existing skill in this workspace as a reference pattern:
`resident-health-workshop-resources/.claude/skills/agent-browser/SKILL.md`

Create `.claude/skills/agent-browser/SKILL.md` with this structure:

1. **Purpose:** Automate browser interactions for testing the feature flag UI — navigating pages, filling forms, taking screenshots, clicking buttons, verifying DOM state.

2. **When to use:** When a command or the user needs to:
   - Test the feature flag UI at http://localhost:3000
   - Verify filter controls work correctly
   - Take screenshots of UI state for validation evidence
   - Fill and submit the flag creation/edit form
   - Verify table rendering after filtering

3. **Prerequisites:**
   - Playwright installed (provide install command: `npx playwright install chromium`)
   - Dev servers running: server on port 3001, client on port 3000

4. **Process (step-by-step):**
   - Launch browser with Playwright
   - Navigate to target URL
   - Execute interaction sequence (click, type, select, screenshot)
   - Assert expected DOM state
   - Close browser and report results

5. **Integration with commands:**
   - `/validate` can invoke this skill for visual regression checks
   - `/implement` can invoke this skill for end-to-end validation after UI changes

6. **Constraints:**
   - Headless mode by default
   - Screenshots saved to `.agents/screenshots/`
   - Max timeout 30 seconds per interaction
   - Always close browser in finally block

Read the reference file first: `resident-health-workshop-resources/.claude/skills/agent-browser/SKILL.md`
Adapt it to this project's specific UI (feature flags table, filter dropdowns, form modals).
```

---

## Task E2-S1-T6 — Create on-demand context documents (Step D)

**Agent:** `prompt-engineer`

```
Execute task E2-S1-T6: Create 3 on-demand context documents with deep file:line references.

Context: This is Step D of the Brownfield Workflow — Document Codebase. These documents provide Layer 2 context that commands like /prime and /plan can load on demand. They must contain concrete file:line references, not generic descriptions.

Use the analysis from `.agents/closure/e2-architecture-analysis.md` as the primary input.
Read the actual source files to extract real line numbers and code patterns.

Create these 3 files in `.agents/reference/`:

### 1. `backend-patterns.md`
Sections:
- **Express v5 route pattern** — how handlers are structured in `server/src/routes/flags.ts` (async handler, try/catch, next(error)). Include actual code snippets with file:line.
- **Service layer pattern** — how `server/src/services/flags.ts` structures business logic (getAllFlags, getFlagById, createFlag, updateFlag, deleteFlag). Show the db.prepare → bind → step/getAsObject → free pattern.
- **Zod validation pattern** — how `server/src/middleware/validation.ts` defines schemas and how they're used in routes. Show the validateBody/validateQuery middleware pattern.
- **Error handling chain** — `server/src/middleware/error.ts` classes → thrown in service → caught by Express error handler → JSON response. Show error class hierarchy.
- **Database initialization** — how `server/src/db/` initializes SQL.js, creates schema, seeds data.

### 2. `frontend-patterns.md`
Sections:
- **TanStack Query pattern** — how `client/src/App.tsx` uses useQuery/useMutation with queryClient invalidation. Show actual hook usage with file:line.
- **API client pattern** — how `client/src/api/flags.ts` wraps fetch calls with typed responses. Show the request/response typing pattern.
- **Component structure** — how `client/src/components/flags-table.tsx` renders the flags list and `flag-form-modal.tsx` handles create/edit. Show prop interfaces and state management.
- **Tailwind + Radix UI pattern** — how `cn()` from `client/src/lib/utils.ts` composes Tailwind classes. How Radix primitives from `components/ui/` are used.
- **Vite dev setup** — proxy configuration for API calls to port 3001.

### 3. `sql-js-constraints.md`
Sections:
- **Why SQL.js is different** — in-memory SQLite compiled to WASM, synchronous API (no async/await), file persistence optional
- **Statement lifecycle** — `db.prepare(sql)` → `stmt.bind(params)` → `stmt.step()`/`stmt.getAsObject()` → `stmt.free()` — MUST free in try/finally
- **Parameterized queries** — always use `?` placeholders with `stmt.bind([...values])`, NEVER string interpolation (SQL injection risk)
- **Boolean handling** — SQLite has no BOOLEAN type; use INTEGER 0/1. Convert: `status === 'enabled' ? 1 : 0` on write, `row.is_enabled === 1` on read
- **db.exec() limitation** — accepts SQL string but NO parameters. Use ONLY for DDL (CREATE TABLE, etc.), never for DML with user input
- **Array storage** — no ARRAY type; use JSON string with JSON.stringify/JSON.parse or comma-separated values
- **Dynamic query building** — for filtering, build WHERE clauses with conditions array and params array, join with AND. Show the safe pattern vs dangerous pattern.
- **Common mistakes** — forgetting stmt.free() (memory leak), using db.exec() with user input (injection), treating booleans as true/false (returns 0/1)

Each document must have actual file:line references from the codebase, not hypothetical ones.
Read the source files to extract the correct line numbers.
```

---

## Task E2-S1-T7 — Create PRD with 15-section structure (Step E)

**Agent:** `prompt-engineer`

```
Execute task E2-S1-T7: Create the Product Requirements Document for Exercise 2 feature flag filtering.

Context: This is Step E of the Brownfield Workflow — Layer 2 Task Planning. The PRD follows the Prompt Structure 5-step from Excal-6: (1) Context Reference, (2) Installation Commands, (3) Implementation Instructions, (4) Testing & Validation, (5) Commit & Summary.

Read these files before writing:
- `TASK.md` — the exercise requirements (what filtering must do)
- `CLAUDE.md` — global rules (just created in T2)
- `.agents/reference/backend-patterns.md` — backend patterns (created in T6)
- `.agents/reference/frontend-patterns.md` — frontend patterns (created in T6)
- `.agents/reference/sql-js-constraints.md` — SQL.js constraints (created in T6)
- `shared/types.ts` — current type definitions

Create `.agents/PRDs/feature-flag-filtering-e2.prd.md` with all 15 sections:

1. **Executive Summary** — Implement server-side filtering for GET /api/flags with query parameters for name (partial match), status (enabled/disabled), and environment (development/staging/production). Include client-side filter UI controls.

2. **Mission** — Enable efficient feature flag management through server-side filtering that reduces data transfer and improves UX.

3. **Target Users** — Engineers managing feature flags across multiple environments.

4. **MVP Scope** — In: server-side filtering by name/status/environment, query parameter validation, updated API client, filter UI controls. Out: pagination, sorting, full-text search, audit log.

5. **User Stories** — Cover: filter by status, filter by environment, search by name, combine multiple filters, clear filters.

6. **Core Architecture & Patterns** — Reference the data flow from CLAUDE.md. Explain where each change fits.

7. **Tools/Features** — Detailed spec for each filter parameter: name (LIKE query, case-insensitive), status (exact match: enabled/disabled), environment (exact match: development/staging/production).

8. **Technology Stack** — Reference from CLAUDE.md (Express v5, SQL.js, Zod, React 19, TanStack Query, etc.)

9. **Security & Configuration** — Input validation via Zod for all query params. SQL injection prevention via parameterized queries. No new secrets needed.

10. **API Specification** — GET /api/flags with query params: `?name=<string>&status=<enabled|disabled>&environment=<development|staging|production>`. Show request/response examples. Document that all params are optional and combinable.

11. **Success Criteria** — All existing tests pass + new filter tests pass. Build + lint + test green for both server and client.

12. **Implementation Phases** —
    Phase 1: Types + Validation (shared/types.ts + validation.ts)
    Phase 2: Service + Routes (flags.ts service filtering + route query params)
    Phase 3: Client API + UI (api/flags.ts query params + filter controls)
    Phase 4: Tests (server filtering tests + optional e2e)

13. **Future Considerations** — Pagination, sorting, date range filtering, flag tags.

14. **Risks & Mitigations** — SQL injection (use parameterized queries), type drift (shared types), filter performance (indexes unnecessary for small dataset).

15. **Appendix** — Links to CLAUDE.md, on-demand context docs, TASK.md, shared/types.ts.

The PRD must be self-contained enough for `/plan` to generate an implementation plan directly from it.
```

---

## Task E2-S1-T8 — Validate AI Layer structural consistency (Step F)

**Agent:** `prompt-engineer`

```
Execute task E2-S1-T8: Validate the complete Claude AI Layer for structural consistency.

Context: This is Step F of the Brownfield Workflow — the final verification before AI Layer is ready for the PIV Loop. All artifacts from T1–T7 must exist and be internally consistent.

Run this validation checklist:

### Tier 1 — Global Rules (CLAUDE.md)
- [ ] `CLAUDE.md` exists at repository root
- [ ] Contains 4 Venn diagram categories: Tech Stack, Code Style, Testing, Misconceptions
- [ ] References `exercise-2` branch
- [ ] Contains validation commands section
- [ ] Contains error classes section
- [ ] Contains key files reference table
- [ ] Does NOT contain workflow/command definitions
- [ ] Does NOT contain task-specific content

### Tier 2 — Commands (.claude/commands/)
- [ ] `prime.md` exists with I→P→O structure and YAML front matter
- [ ] `plan.md` exists with I→P→O structure and YAML front matter
- [ ] `implement.md` exists with I→P→O structure and YAML front matter
- [ ] `commit.md` exists with I→P→O structure and YAML front matter
- [ ] `prime-endpoint.md` exists with I→P→O structure
- [ ] `validate.md` exists with I→P→O structure
- [ ] `create-prd.md` exists with I→P→O structure
- [ ] `review.md` exists with I→P→O structure
- [ ] `security-review.md` exists with I→P→O structure
- [ ] Total: 9 commands
- [ ] No command references MCP tools, Jira, Confluence, Supabase, Drizzle, or Bun
- [ ] All $ARGUMENTS parameters are documented in YAML `argument-hint`

### Tier 3 — Skills (.claude/skills/)
- [ ] `agent-browser/SKILL.md` exists
- [ ] Skill has clear purpose, process, and constraints sections
- [ ] Skill references this project's UI (localhost:3000, flags table, etc.)

### On-Demand Context (.agents/reference/)
- [ ] `backend-patterns.md` exists with file:line references
- [ ] `frontend-patterns.md` exists with file:line references
- [ ] `sql-js-constraints.md` exists with deep SQL.js documentation
- [ ] Total: ≥ 3 reference docs (minimum 2 required, we have 3)
- [ ] No orphan references (commands that reference non-existent context files)

### Layer 2 — PRD (.agents/PRDs/)
- [ ] `feature-flag-filtering-e2.prd.md` exists
- [ ] Contains all 15 required sections
- [ ] References CLAUDE.md
- [ ] References on-demand context docs
- [ ] References TASK.md
- [ ] API spec section matches the endpoint pattern in CLAUDE.md

### Cross-reference checks
- [ ] CLAUDE.md key files table includes paths that actually exist
- [ ] Commands that reference `.agents/reference/` files point to files that exist
- [ ] PRD technology stack matches CLAUDE.md tech stack
- [ ] Validation commands in CLAUDE.md match those in `validate.md` command
- [ ] Error classes in CLAUDE.md match those in `server/src/middleware/error.ts`

Output: A validation report with ✅/❌ per check and a list of items to fix (if any).
If all checks pass, produce a signed statement: "AI Layer validation passed — ready for PIV Loop."
If any check fails, list the fix needed and do NOT sign.
```

---

## Execution Notes

| Task | Agent | Depends on | Key output |
|---|---|---|---|
| T1 | `project-adaptation-analyst` | — | `.agents/closure/e2-architecture-analysis.md` |
| T2 | `rules-bootstrap` | T1 | `CLAUDE.md` (Exercise 2 version) |
| T3 | `prompt-engineer` | T2 | `.claude/commands/{prime,plan,implement,commit}.md` |
| T4 | `prompt-engineer` | T3 | `.claude/commands/{prime-endpoint,validate,create-prd,review,security-review}.md` |
| T5 | `prompt-engineer` | T3 | `.claude/skills/agent-browser/SKILL.md` |
| T6 | `prompt-engineer` | T1 | `.agents/reference/{backend,frontend}-patterns.md`, `sql-js-constraints.md` |
| T7 | `prompt-engineer` | T2, T6 | `.agents/PRDs/feature-flag-filtering-e2.prd.md` |
| T8 | `prompt-engineer` | T1–T7 | Validation report (all tiers consistent) |

**Parallelization:** T3+T5+T6 can run in parallel after T2. T4 depends on T3. T7 depends on T2+T6. T8 runs last.
