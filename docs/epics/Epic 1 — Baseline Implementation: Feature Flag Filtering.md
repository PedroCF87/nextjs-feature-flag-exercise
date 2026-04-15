# Epic 1 — Baseline Implementation: Feature Flag Filtering

## Metadata

- **ID:** EPIC-1
- **Priority:** P0
- **Related exercise:** Exercise 1 — Baseline
- **Depends on:** EPIC-0 (environment fully prepared)
- **Target repository (local clone):** `/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise`
- **Base branch:** `exercise-1`
- **Execution model:** Local (VS Code agent, sequential tasks, commits to `exercise-1`)
- **Status:** In Progress
- **Created at:** 2026-04-09 16:39:45 -03
- **Last updated:** 2026-04-15 00:00:00 -03

---

## 1) Business objective

Execute the Feature Flag Filtering task and produce a measurable baseline of effort, friction, and quality.

Expected value:
- deliver a functional implementation of the filtering task as defined in `TASK.md`;
- produce concrete initial metrics (time, number of prompts, rework cycles, confidence level);
- document friction points encountered during execution, as the raw material for comparison with Epic 2 (AI-assisted run);
- establish a personal productivity benchmark that will be referenced in the workshop interview debrief.

---

## 2) Scope

### In Scope

**Planning automation (E1-S0):**
1. Generate detailed story MD files from this epic’s section 7 using `scaffold-stories-from-epic`.
2. Generate task packs for each story using `create-story-task-pack`.
3. Code-review all generated documents with `story-task-reviewer` agent (inline suggestions via PR).
4. Create GitHub Issues for each task using `create-github-issue-from-task`.

**Implementation (E1-S1 to E1-S4):**
5. Read, internalize, and confirm understanding of the task acceptance criteria in `TASK.md`.
6. Map the files that must be created or modified to implement the full filtering feature (server and client).
7. Update `shared/types.ts` to introduce the filter query contract as the single source of truth.
8. Extend the Zod validation middleware to parse and validate filter query parameters.
9. Implement server-side filtering logic in the flags service (`server/src/services/flags.ts`).
10. Update the Express route handler (`server/src/routes/flags.ts`) to extract and forward filter params.
11. Implement client-side filter UI:
   - filter controls for environment, status, type, owner, and name search;
   - "clear all filters" action;
   - active-filter indicator in the UI.
12. Wire the client API call (`client/src/api/flags.ts`) to pass filter query parameters.
13. Ensure filter state persists across flag creation, editing, and deletion operations.
14. Run all validation commands after implementation:
    - `cd server && pnpm run build && pnpm run lint && pnpm test`
    - `cd client && pnpm run build && pnpm run lint`
15. Record baseline metrics in real time during implementation (time elapsed, prompt count, rework cycles, confidence).
16. Document observed friction points and decisions made during the Baseline run.

**Execution model:**
17. Execute each task locally in VS Code, reading the task file directly from `docs/agile/tasks/`.
18. After each task completes, validate and commit changes to `exercise-1`.
19. Manual validation checkpoint at the end of each story before proceeding to the next.

### Out of Scope

1. Applying a structured AI-assisted validation workflow (this belongs to Epic 2).
2. Migrating the stack to Gold Standard (Bun/Next.js 16/Drizzle/Biome) — this belongs to Epic 4.
3. Adding pagination or sorting to the flags list.
4. Implementing server-side tests beyond what already exists in the exercise (test coverage improvement is not the Baseline goal).
5. Automated CI/CD orchestration — the exercise uses local validation only.
6. Architectural changes to the layered pattern already established in the repo.

---

## 3) Definition of Done (DoD)

This epic is considered complete when **all** items below are true:

**Planning phase (E1-S0):**
1. All story MD files generated from this epic and reviewed by `story-task-reviewer`.
2. All task packs generated from stories and validated with `validate-task-pack.js`.
3. All GitHub Issues created for tasks (one Issue per task).

**Implementation phase (E1-S1 to E1-S4):**
4. All 11 acceptance criteria in `TASK.md` are met and verifiable:
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
5. `shared/types.ts` is the single source of truth for the filter query contract — server and client both derive from it.
6. All server validation commands pass with zero errors: `pnpm run build`, `pnpm run lint`, `pnpm test`.
7. All client validation commands pass with zero errors: `pnpm run build`, `pnpm run lint`.
8. Baseline metrics document created with data collected during implementation (time, prompts, rework, confidence).
9. Friction log created with at least 3 meaningful observations from the Baseline run.
10. No direct commits to `main` — all changes on a branch derived from `exercise-1`.
11. Implementation follows the existing layered architecture without introducing architectural drift.
12. All tasks executed locally with commits to `exercise-1` (task file Status updated on completion).
13. Manual validation completed at the end of each story (E1-S1 to E1-S4).
14. Code is committed to the personal fork (`origin`) with conventional commit messages.

---

## 4) Risks

1. **Risk:** starting implementation before fully understanding the acceptance criteria.
   - **Impact:** missed requirements and rework cycles that inflate the Baseline metrics artificially.
   - **Mitigation:** spend dedicated time mapping each acceptance criterion to an affected file before writing code.

2. **Risk:** confusing AND/OR logic for multiple filters.
   - **Impact:** incorrect filtering results that fail automated tests.
   - **Mitigation:** confirm that all filters compose with AND logic (aligned with the task's example: "all enabled release flags in production"); document this decision in the friction log.

3. **Risk:** SQL.js query composition for optional filters introduces runtime errors.
   - **Impact:** server crashes or silent incorrect results.
   - **Mitigation:** follow the existing SQL.js `try-finally` / `stmt.free()` pattern; build filter clauses incrementally with Zod-validated inputs only.

4. **Risk:** `shared/types.ts` change breaks existing type contracts.
   - **Impact:** compilation failures on both server and client.
   - **Mitigation:** add new filter types as optional additions; run `pnpm run build` on both sides after each type change.

5. **Risk:** client filter state is not preserved across mutations (create/edit/delete).
   - **Impact:** acceptance criterion 8 fails ("Filters persist while using other features").
   - **Mitigation:** hold filter state at the top-level React Query context / `useState` above the mutation scope; test explicitly after each mutation type.

6. **Risk:** not recording metrics in real time.
   - **Impact:** unreliable Baseline data; comparison with Epic 2 becomes qualitative only.
   - **Mitigation:** open the metrics document before writing code and log entries as they happen.

7. **Risk:** implementing with Gold Standard patterns (Bun, Drizzle, Biome) instead of the exercise stack.
   - **Impact:** scope expansion, loss of Baseline validity for the existing codebase context.
   - **Mitigation:** keep the exercise stack (Node.js ESM, Express v5, SQL.js, Zod, Vitest, React 19, Vite, TanStack Query, Tailwind v4) strictly; resist optimizing architecture during this phase.

8. **Risk:** local execution loses traceability from the Issue-driven model.
   - **Impact:** weaker audit trail for task-level execution history.
   - **Mitigation:** update task file `Status` field on completion; commit with descriptive conventional commit messages referencing task IDs.

9. **Risk:** accumulating uncommitted changes across multiple tasks.
   - **Impact:** harder to isolate failures; risk of losing work.
   - **Mitigation:** commit after each task validation passes; push to `origin exercise-1` after each story.

---

## 5) Dependencies

### Input dependencies

1. **EPIC-0 fully completed** — local environment validated, fork ready, AI Layer baseline applied.
2. `exercise-1` branch checked out and clean.
3. `shared/types.ts` baseline understood (current type contracts must not be broken).
4. Baseline metrics template from EPIC-0 (Story E0-S3) available and ready to fill.

### Output dependencies (items blocked by this epic)

1. **EPIC-2 (AI-assisted run):** requires the same task to be re-implemented with a structured AI-assisted validation workflow; depends on Baseline metrics existing for comparison.
2. **Post-exercise debrief:** depends on the friction log and metrics produced by this epic.

---

## 6) Success metrics

1. **Functional completeness:** 11/11 acceptance criteria from `TASK.md` verified.
2. **Validation gate:** 0 errors from server and client build/lint/test commands.
3. **Baseline captured:** time-per-phase, total prompt count, rework cycle count, and self-reported confidence score documented.
4. **Friction log:** ≥ 3 meaningful friction points recorded with context and impact.
5. **Branch hygiene:** 0 direct commits to `main`.
6. **Type contract integrity:** shared/types.ts extended without breaking existing types.

---

## 7) Candidate stories for the epic

### ✅ [Story E1-S0 — Planning automation](../agile/stories/story-E1S0-planning-automation.md)

**Priority:** P0 | **Depends on:** EPIC-0 (specifically E0-S5 — Execution automation + E0-S6 — CI/CD pipeline)

**Description:** generate all detailed story MDs and task files for Epic 1 using the automation artifacts created in E0-S5, then create GitHub Issues for automated execution.

**Execution:**
1. Invoke `scaffold-stories-from-epic` on this epic to generate detailed story MDs (E1-S1 to E1-S4).
2. For each generated story, invoke `create-story-task-pack` to generate task files.
3. Submit all generated documents to `story-task-reviewer` agent for code review (creates PR with inline suggestions).
4. Address any review comments and merge the planning PR.
5. Invoke `create-github-issue-from-task` for each task to create execution Issues in the fork.

**Key outputs:**
- 4 detailed story MDs: `story-E1S1-*.md`, `story-E1S2-*.md`, `story-E1S3-*.md`, `story-E1S4-*.md`.
- Task files for all stories in `Docs/agile/tasks/`.
- GitHub Issues created in the fork (one per task).
- Code review evidence (approved PR or resolved suggestions).

**Manual checkpoint:** verify all Issues are created before E1-S1 begins.

---

### [Story E1-S1 — Task analysis and implementation mapping](../agile/stories/story-E1S1-task-analysis-and-implementation-mapping.md)

**Priority:** P0 | **Depends on:** E1-S0

**Execution model:** Local VS Code agent → commit to `exercise-1` → manual validation at story end.

**Description:** read `TASK.md` acceptance criteria in full; map each criterion to the files that must change (server and client); define the AND-logic filter contract; document the implementation approach before writing code.

**Key outputs:**
- annotated file-impact map (which file changes and why);
- confirmed AND logic decision for multi-filter composition;
- implementation order defined.

**Manual checkpoint:** review the file-impact map and implementation order before E1-S2.

---

### [Story E1-S2 — Server-side filtering implementation](../agile/stories/story-E1S2-server-side-filtering-implementation.md)

**Priority:** P0 | **Depends on:** E1-S1

**Execution model:** Local VS Code agent → commit to `exercise-1` → manual validation at story end.

**Description:** implement the complete server-side filtering pipeline:
1. Extend `shared/types.ts` with `FlagFilterParams` type.
2. Add Zod filter query schema to `server/src/middleware/validation.ts`.
3. Update `FlagsService.getAll()` in `server/src/services/flags.ts` to accept and apply filter params.
4. Update the `GET /api/flags` route handler in `server/src/routes/flags.ts` to extract and forward filter params.
5. Validate with `pnpm run build && pnpm run lint && pnpm test` (zero errors required).

**Manual checkpoint:** run server locally and test filtering via curl/Postman before E1-S3.

---

### [Story E1-S3 — Client-side filtering UI implementation](../agile/stories/story-E1S3-client-side-filtering-ui-implementation.md)

**Priority:** P0 | **Depends on:** E1-S2

**Execution model:** Local VS Code agent → commit to `exercise-1` → manual validation at story end.

**Description:** implement the client filtering experience:
1. Update `client/src/api/flags.ts` to serialize filter params in the API call.
2. Add filter state management in `App.tsx` (or appropriate component).
3. Build filter controls (environment, status, type, owner, name search) using existing Radix UI primitives.
4. Implement "clear all filters" action.
5. Add active-filter indicator to the UI.
6. Ensure filter state is preserved across flag creation, editing, and deletion.
7. Validate with `pnpm run build && pnpm run lint` (zero errors required).

**Manual checkpoint:** test full UI flow in browser — all 11 TASK.md ACs verified.

---

### [Story E1-S4 — Baseline measurement and closure](../agile/stories/story-E1S4-baseline-measurement-and-closure.md)

**Priority:** P0 | **Depends on:** E1-S2, E1-S3

**Execution model:** Local VS Code agent → commit to `exercise-1` → manual validation at story end.

**Description:** finalize the Baseline run:
1. Execute full validation suite (server + client) and confirm all criteria pass.
2. Complete the baseline metrics document with all collected data.
3. Write the friction log with observations from this run.
4. Commit all changes to the personal fork with conventional commit.
5. Write a brief summary comparing expected vs actual implementation effort.

**Manual checkpoint:** sign off on baseline metrics and friction log before Epic 1 closure.

---

## 8) AI Layer execution map

Which catalog agents and skills are active during each story of this epic, per `ai-development-environment-catalog.md`.

| Story | Responsible agent(s) | Skills | Instructions |
|---|---|---|---|
| E1-S0 — Planning automation | `agile-exercise-planner`, `story-task-reviewer` | `scaffold-stories-from-epic`, `create-story-task-pack`, `create-github-issue-from-task` | `agile-planning.instructions.md` |
| E1-S1 — Task analysis and mapping | `project-adaptation-analyst` | `project-context-audit`, `execute-task-locally` | `coding-agent.instructions.md`, `documentation.instructions.md` |
| E1-S2 — Server-side filtering | `task-implementer` (local VS Code) | `execute-task-locally` | `coding-agent.instructions.md`, `feature-flag-exercise.instructions.md` |
| E1-S3 — Client-side filtering UI | `task-implementer` (local VS Code) | `execute-task-locally` | `coding-agent.instructions.md`, `feature-flag-exercise.instructions.md` |
| E1-S4 — Measurement and closure | `agile-exercise-planner` | `execute-task-locally`, `record-friction-point`, `record-time-zero-snapshot` | `documentation.instructions.md`, `measurement-baseline.instructions.md` |

---

## 9) Technical reference

### Affected files (expected)

| File | Change type | Reason |
|---|---|---|
| `shared/types.ts` | Extend | Add `FlagFilterParams` type — single source of truth for filter contract |
| `server/src/middleware/validation.ts` | Extend | Add Zod schema for filter query params |
| `server/src/services/flags.ts` | Modify | Accept and apply `FlagFilterParams` in `getAll()` |
| `server/src/routes/flags.ts` | Modify | Extract filter params and pass to service |
| `server/src/__tests__/flags.test.ts` | Extend | Add test cases for each filter dimension |
| `client/src/api/flags.ts` | Modify | Serialize filter params in `GET /api/flags` call |
| `client/src/App.tsx` | Modify | Add filter state, pass to API and UI |
| `client/src/components/flags-table.tsx` | Possibly extend | Render active-filter indicator |
| New filter UI component | Create | Filter controls panel (environment, status, type, owner, name) |

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

### Key patterns to follow (from `AGENTS.md`)

- `shared/types.ts` is the single source of truth — server and client both import from it.
- SQL.js statements: always use `try-finally` with `stmt.free()`.
- Route handlers must use `next(error)` for error propagation.
- Filters compose with AND logic (all active filters must match simultaneously).
- React Query: filter params should be part of the `queryKey` so the query re-runs when filters change.

---

## 10) Execution model

This epic follows a **local execution model** (switched from the Issue-driven model due to Copilot cloud environment issues after E1-S0 and E1-S1-T1):

### Planning phase (E1-S0)

```
Epic document
    │
    ▼  scaffold-stories-from-epic
Story MDs (E1-S1 to E1-S4)
    │
    ▼  create-story-task-pack
Task MDs (T1, T2, T3, ...)
    │
    ▼  story-task-reviewer (PR review with inline suggestions)
Approved planning PR
    │
    ▼  create-github-issue-from-task
GitHub Issues (1 per task)
```

### Execution phase (E1-S1 to E1-S4)

```
For each story:
    For each task:
        1. Agent reads task file from docs/agile/tasks/
        2. Agent executes task following the detailed execution plan
        3. Agent validates with build/lint/test commands
        4. Agent commits changes to exercise-1 with conventional commit message
    
    Manual validation checkpoint:
        - Human reviews story outputs
        - Signs off before next story begins
```

### Key principles

| Principle | Rationale |
|---|---|
| 1 task file = 1 unit of work | Clear scope, traceable execution via Status field and commits |
| Sequential execution | Each task builds on previous; no parallel drift |
| Commit per task | Atomic commits with task ID in message, local validation per change |
| Manual checkpoint per story | Quality gate before cross-cutting changes |
| Direct to exercise-1 | No feature branches or PRs needed — follows Epic 0 pattern |

---

## 11) Expected evidence

1. Implementation branch created from `exercise-1` with a clear naming convention.
2. Commits on the personal fork with conventional commit messages covering each story.
3. `shared/types.ts` diff showing the new `FlagFilterParams` type.
4. Passing output of all server validation commands (screenshot or terminal log).
5. Passing output of all client validation commands (screenshot or terminal log).
6. Baseline metrics document (time-per-phase, total prompts, rework cycles, confidence score).
7. Friction log with ≥ 3 observations and their context/impact.
8. Brief summary of expected vs actual effort for the Baseline run.
9. Git log showing conventional commit messages with task IDs on `exercise-1`.
10. All task files updated with `Status: Done` upon completion.

---

## 12) References

- [nextjs-feature-flag-exercise/TASK.md](../../nextjs-feature-flag-exercise/TASK.md) — full task description and 11 acceptance criteria
- [nextjs-feature-flag-exercise/AGENTS.md](../../nextjs-feature-flag-exercise/AGENTS.md) — architecture, data flow, validation commands, code patterns
- [Docs/manuals/interview-4-exercises-overview.md](../manuals/interview-4-exercises-overview.md#L29-L46) — Exercise 1 macro tasks and success criteria
- [Docs/manuals/interview-5-current-ai-workflow.md](../manuals/interview-5-current-ai-workflow.md) — 22-step AI workflow (current AI process — Phases A–D)
- [Docs/ai-development-environment-catalog.md](../ai-development-environment-catalog.md#L136-L147) — agent/skill coverage map for implementation phases
- [Docs/epics/Epic 0.md](../epics/Epic%200.md) — environment preparation (required input for this epic)
- [Docs/agile/stories/story-E0S5-execution-automation.md](../agile/stories/story-E0S5-execution-automation.md) — execution automation artifacts (E0-S5)
- [Docs/.github/copilot-instructions.md — Task Execution Model](../.github/copilot-instructions.md#task-execution-model) — one-Issue-per-task workflow rules
