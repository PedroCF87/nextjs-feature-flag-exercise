# Epic 4 — AI-Optimized: Feature Implementation on the Gold Standard Codebase

## Metadata

- **ID:** EPIC-4
- **Priority:** P1
- **Related exercise:** Exercise 4 — AI-Optimized
- **Depends on:** EPIC-3 (Build a Skill complete, methodology progression documented)
- **Target repository:** `/delfos/Projetos/ITBC - Desafio RDH/nextjs-ai-optimized-codebase`
- **Exercise repository (reference):** `/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise`
- **Execution model:** Local development with AI-assisted workflow (Copilot / Claude Code) — implement a new feature respecting the Gold Standard's Vertical Slice Architecture and self-correction workflow
- **Status:** Not started
- **Created at:** 2026-04-16 17:24:08 -03
- **Last updated:** 2026-04-16 17:24:08 -03

---

## 1) Business objective

Demonstrate **fluency in an AI-optimized codebase** by implementing or extending a feature in the Gold Standard repository (`nextjs-ai-optimized-codebase`) that follows its Vertical Slice Architecture (VSA), strict TypeScript, structured logging, and self-correction workflow — then compare the experience against the brownfield exercises (1 and 2) to quantify the architectural advantage.

**Workshop framing — The AI-Optimized Codebase (Excal-6):**
- The Gold Standard codebase embodies the workshop's culminating concept: a codebase **built for AI agents from the ground up**.
- Its 5 Core Principles — **Machine-Readable Feedback**, **One Source of Truth**, **Fail Fast**, **Clear Boundaries**, **Consistent Patterns** — create an environment where AI agents can self-correct with minimal human intervention.
- The **Foundation-First Setup Order** (Testing → Logging → Infrastructure → Database → Monitoring → Shared Patterns) ensures each layer improves the quality of subsequent layers — the **Compounding Quality Effect**.
- Exercise 4 is the capstone: the architect works in this optimized environment and experiences firsthand how architecture-level AI readiness differs from the brownfield exercises.

**Workshop framing — Progression across all 4 exercises:**

| Exercise | Variable tested | Environment |
|---|---|---|
| 1 — Baseline | Current workflow (no system) | Brownfield (exercise repo) |
| 2 — PIV Loop | Methodology (Plan → Implement → Validate → Iterate) | Brownfield (exercise repo) |
| 3 — Build a Skill | Reuse (systematized workflow) | Exercise repo (skill artifact) |
| **4 — AI-Optimized** | **Architecture (codebase designed for AI)** | **Gold Standard repo** |

Expected value:
- experience the difference between coding in a brownfield vs. an AI-optimized codebase with real implementation work;
- demonstrate **reduced ambiguity** — the VSA structure, strict types, and machine-readable feedback loops guide the AI agent with less human intervention;
- demonstrate **higher velocity with quality** — fast tooling (Bun 10x, Biome 25x), strict TypeScript guardrails, and co-located tests enable rapid iteration;
- produce a comparative analysis: brownfield experience (Exercises 1/2) vs. AI-optimized experience (Exercise 4), measuring time, rework, confidence, and friction;
- articulate the **Compounding Quality Effect** (Excal-6) from personal experience — validated foundations improve everything built on top;
- validate that skills built in Exercise 3 (`context-package-builder`) transfer to a different codebase architecture.

---

## 2) Scope

### In Scope

**Phase 1 — Understand the Gold Standard codebase:**

1. Study the Gold Standard architecture using `CLAUDE.md` (377 lines — operational rules, auto-loaded) and `CODEBASE-GUIDE.md` (1992 lines — deep walkthrough, on-demand reference).
2. Understand the **Vertical Slice Architecture** pattern: `src/features/{feature}/` with the 7-file standard structure (`models.ts`, `schemas.ts`, `repository.ts`, `service.ts`, `errors.ts`, `index.ts`, `tests/`).
3. Understand the **AI self-correction workflow**: Write Code → Run Checks (`bun run lint && npx tsc --noEmit`) → Read Errors (structured, file:line:column) → Fix Issues → Repeat.
4. Study the existing `projects` feature slice as the reference implementation: data flow from API route through service → repository → database, with structured logging, Zod validation, Drizzle ORM queries, and co-located tests.
5. Study the **core infrastructure**: `core/config/env.ts` (validated env vars), `core/database/` (Drizzle client + schema), `core/logging/` (Pino + getLogger + action-state pattern), `core/supabase/` (server + client + proxy), `core/api/errors.ts` (API error handler).
6. Map the architectural differences between the exercise repo (layered Express/SQL.js) and the Gold Standard (VSA Next.js/Drizzle/Supabase) using [`docs/references/gold-standard-patterns.md`](../references/gold-standard-patterns.md).

**Phase 2 — Choose and plan the feature:**

7. Select a feature to implement that exercises the full VSA stack. Candidate features (choose one):
   - **Option A — Communities:** a new vertical slice (`src/features/communities/`) with CRUD for user-created communities (name, description, slug, isPublic, ownerId). Exercises: schema definition, Drizzle migration, repository, service with access control, API routes, Zod validation, error classes, co-located tests.
   - **Option B — Project Tags:** extend the existing `projects` feature with a tags system (many-to-many relation: projects ↔ tags). Exercises: schema extension, migration, repository extension, service logic for tag operations, API routes for tag CRUD, Zod schemas, tests.
   - **Option C — Feature Flags (VSA):** re-implement the feature flag CRUD from the exercise repo, but using the Gold Standard's VSA, Drizzle, Supabase, Pino, and strict TypeScript patterns. Exercises: full VSA slice creation mirroring the brownfield task, enabling direct comparison.
8. Create a brief implementation plan following the PIV Loop (Plan → Implement → Validate): target files, implementation order, validation checkpoints, and expected data flow.

**Phase 3 — Implement the feature following VSA patterns:**

9. **Define the database schema:** add the table definition in `src/core/database/schema.ts` using Drizzle's `pgTable`, with `timestamps` spread, proper types, and foreign key references. Run `bun run db:generate` to create the migration.
10. **Create the feature slice** following the 7-file standard:
    - `models.ts` — re-export table + `InferSelectModel` / `InferInsertModel` types.
    - `schemas.ts` — Zod v4 schemas for Create, Update, and Response. Use `z.infer<>` for TypeScript types.
    - `errors.ts` — feature-specific error classes with `code` + `statusCode` (e.g., `CommunityNotFoundError`, `CommunityAccessDeniedError`).
    - `repository.ts` — pure database operations via Drizzle (`findById`, `create`, `update`, `deleteById`). No business logic, no logging.
    - `service.ts` — business logic, access control, structured logging (`getLogger("communities.service")`), calls repository only.
    - `index.ts` — public API gate: export service functions, types, schemas, errors. Do NOT export repository.
    - `tests/` — co-located tests: `service.test.ts`, `schemas.test.ts`, `errors.test.ts` using `bun:test` + mocked repository.
11. **Create API routes:** `src/app/api/{feature}/route.ts` (list + create) and `src/app/api/{feature}/[id]/route.ts` (get + update + delete). Follow the `projects` route as template: Supabase auth → Zod validation → service call → structured response.
12. **Follow the self-correction workflow** throughout: `bun run lint && npx tsc --noEmit` after every file, `bun test` after every functional change.

**Phase 4 — Validate and compare:**

13. Run the full validation suite: `bun run build`, `bun run lint`, `npx tsc --noEmit`, `bun test`.
14. Verify all acceptance criteria for the chosen feature.
15. Produce a comparative experience report: brownfield exercises (1/2) vs. AI-optimized exercise (4) — measuring: time, rework cycles, confidence, architectural friction, agent autonomy, and validation loop speed.
16. If the `context-package-builder` skill from Exercise 3 was used, document the portability assessment: what worked, what needed adaptation, what didn't transfer.
17. Record friction points specific to the Gold Standard experience.
18. Produce EPIC-4 closure report (final epic — this is the workshop closure).

### Out of Scope

1. Migrating the Gold Standard's patterns back to the exercise repository (that's a separate transformation scope).
2. Deploying to production (Vercel/Supabase cloud) — the exercise validates locally.
3. Implementing authentication from scratch — the Gold Standard already has Supabase Auth configured.
4. Creating a full UI for the new feature — focus is on the backend VSA slice + API routes. A minimal UI is optional.
5. Setting up Supabase from scratch — use the existing configuration or mock the database layer for testing.
6. Re-implementing the feature flag filtering task — the feature in Exercise 4 should be different to demonstrate breadth, not repetition (unless Option C is chosen for direct comparison).
7. Modifying the Gold Standard's core infrastructure (logging, database client, auth) — treat it as read-only foundation.

---

## 3) Definition of Done (DoD)

This epic is considered complete when **all** items below are true:

**Phase 1 — Understanding:**
1. The architect can describe the VSA structure, naming conventions, and data flow from memory (or with minimal reference).
2. The architectural mapping between exercise repo (layered) and Gold Standard (VSA) is documented.
3. The 5 Core Principles (Machine-Readable Feedback, One Source of Truth, Fail Fast, Clear Boundaries, Consistent Patterns) are understood with concrete examples from the codebase.

**Phase 2 — Planning:**
4. A feature is selected with documented rationale.
5. An implementation plan exists with: target files, implementation order, validation checkpoints, and expected data flow.

**Phase 3 — Implementation:**
6. The database schema is defined following the Gold Standard patterns (Drizzle `pgTable`, `timestamps`, proper types).
7. A complete feature slice exists with all 7 standard files: `models.ts`, `schemas.ts`, `repository.ts`, `service.ts`, `errors.ts`, `index.ts`, `tests/`.
8. Each file follows the Gold Standard's patterns:
   - `repository.ts` has zero business logic, zero logging — pure data access.
   - `service.ts` calls repository (never DB directly), applies business rules, uses structured logging (`domain.action_started/completed/failed`).
   - `errors.ts` carries `code` (machine-readable) + `statusCode` (HTTP semantics).
   - `index.ts` exports service functions + types + schemas + errors but NOT the repository.
   - `schemas.ts` uses Zod v4 (`import { z } from "zod/v4"`) with `z.infer<>` for types.
9. API routes exist and follow the `projects` route template: auth check → Zod validation → service call → structured response → error handling.
10. All tests pass: `bun test` with ≥ 80% coverage for the new feature.
11. The self-correction workflow was followed: `bun run lint && npx tsc --noEmit` after every change.
12. All validation commands pass with zero errors: `bun run build`, `bun run lint`, `npx tsc --noEmit`, `bun test`.

**Phase 4 — Comparison and closure:**
13. Comparative experience report produced: brownfield (Exercises 1/2) vs. AI-optimized (Exercise 4).
14. Friction points recorded specific to the Gold Standard experience.
15. Portability of Exercise 3 skill (`context-package-builder`) assessed.
16. Exercise metrics captured (time, rework, confidence, friction points).
17. EPIC-4 closure report produced (workshop finale).
18. No modifications to the Gold Standard's core infrastructure — only feature additions.

---

## 4) Risks

1. **Risk:** Supabase dependency — the Gold Standard requires a Supabase instance for auth + database.
   - **Impact:** cannot run tests or start dev server without valid Supabase credentials.
   - **Mitigation:** check if `.env.example` exists. If Supabase is not configured, mock the auth layer and use `bun run db:push` to set up a local schema. Alternatively, focus on unit tests (mocked repository) rather than integration tests.

2. **Risk:** unfamiliarity with Drizzle ORM leading to incorrect schema definitions or migrations.
   - **Impact:** database errors, broken queries, wasted time debugging ORM-specific issues.
   - **Mitigation:** use the existing `projects` schema as a template. Run `bun run db:generate` to validate migrations. Study `CODEBASE-GUIDE.md` §8 (Database Layer with Drizzle ORM).

3. **Risk:** Bun test runner differences from Vitest (exercise) — different mocking API, different assertion patterns.
   - **Impact:** test authoring friction, false failures, time lost on test infrastructure issues.
   - **Mitigation:** study `src/features/projects/tests/` as reference. Use `mock.module()` for repository mocking. Follow `CLAUDE.md` test conventions.

4. **Risk:** over-engineering the feature to demonstrate breadth, exceeding time budget.
   - **Impact:** time wasted on feature complexity rather than demonstrating VSA fluency.
   - **Mitigation:** choose the simplest feature option that exercises the full VSA stack. Time-box implementation to ~90 min. The exercise evaluates **pattern adherence**, not feature complexity.

5. **Risk:** confusing the Gold Standard's conventions with the exercise repo's conventions.
   - **Impact:** mixing patterns (e.g., using `pnpm` instead of `bun`, Express patterns in Next.js routes).
   - **Mitigation:** work exclusively in the Gold Standard repo during Phase 3. Reference `CLAUDE.md` (Gold Standard) — not the exercise's `copilot-instructions.md`.

6. **Risk:** TypeScript strict mode (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`) producing unfamiliar errors.
   - **Impact:** frustration with type errors that wouldn't appear in the exercise repo's less-strict TS config.
   - **Mitigation:** these errors are the point — they demonstrate how strict types create machine-readable feedback. Follow the self-correction workflow: read the error → fix → re-run. Reference `CODEBASE-GUIDE.md` §5 (Type Safety).

7. **Risk:** Zod v4 differences — Gold Standard uses `import { z } from "zod/v4"` (not `zod`), with different API for `z.record`.
   - **Impact:** import errors, schema definition failures.
   - **Mitigation:** follow `CLAUDE.md` Zod v4 section. Use `z.record(z.string(), z.unknown())` (two args required).

---

## 5) Dependencies

### Input dependencies

1. **EPIC-3 fully completed** — the exercise progression requires all 3 previous exercises to be done for the comparative analysis to be meaningful.
2. Gold Standard repository (`nextjs-ai-optimized-codebase`) cloned and accessible locally.
3. **Bun runtime installed** — the Gold Standard uses Bun (not pnpm/Node.js). Verify with `bun --version`.
4. Supabase credentials (or willingness to mock auth for local-only testing).
5. Reference documents:
   - `nextjs-ai-optimized-codebase/CLAUDE.md` (auto-loaded operational rules).
   - `nextjs-ai-optimized-codebase/CODEBASE-GUIDE.md` (deep walkthrough).
   - `docs/references/gold-standard-patterns.md` (architectural mapping exercise ↔ Gold Standard).
6. Metrics from Exercises 1, 2, and 3 — as comparison baseline.
7. `context-package-builder` skill from Exercise 3 — for portability testing.

### Output dependencies (items blocked by this epic)

1. **Workshop interview debrief:** Epic 4 is the final exercise. Its completion enables the full 4-exercise comparative narrative required for the workshop interview.
2. **No downstream epics** — this is the final epic in the workshop progression.

---

## 6) Success metrics

1. **Feature implemented:** a complete VSA feature slice exists with all 7 standard files, following Gold Standard patterns.
2. **Validation clean:** `bun run build`, `bun run lint`, `npx tsc --noEmit`, `bun test` all pass with zero errors.
3. **Test coverage ≥ 80%** for the new feature slice.
4. **VSA compliance:** every file in the feature slice follows its defined responsibility (no business logic in repository, no direct DB access in service, no repository exported from index.ts).
5. **Structured logging:** every service operation uses `getLogger("feature.service")` with `action_started`, `action_completed`, `action_failed` pattern.
6. **Self-correction workflow followed:** `bun run lint && npx tsc --noEmit` was run after every change — no accumulated broken state.
7. **Comparative report produced:** brownfield vs. AI-optimized metrics (time, rework, confidence, friction).
8. **Experience difference articulated:** the architect can explain, with evidence, how the AI-optimized codebase changed the development experience vs. the brownfield exercises.
9. **Skill portability assessed:** the `context-package-builder` from Exercise 3 was tested (or assessed) against the Gold Standard structure.
10. **Workshop progression complete:** all 4 exercises have metrics, and the progressive improvement narrative is documented.

---

## 7) Candidate stories for the epic

### Story E4-S0 — Planning automation

**Priority:** P0 | **Depends on:** EPIC-3 closure

**Description:** generate detailed story MDs for all Epic 4 stories and task files, then sync the backlog index.

**Execution:**
1. Invoke `scaffold-stories-from-epic` on this epic to generate detailed story MDs (E4-S1 to E4-S4).
2. For all stories, invoke `create-story-task-pack` to generate task files.
3. Review generated documents with `story-task-reviewer` agent.
4. Sync backlog index with `sync-backlog-index`.

**Key outputs:**
- 4 detailed story MDs.
- Task files for all stories in `docs/agile/tasks/`.
- Updated `backlog-index.json`.

---

### Story E4-S1 — Gold Standard codebase exploration and planning

**Priority:** P0 | **Depends on:** E4-S0

**Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) — research only, no code changes.

**Description:** as an architect preparing to work in an AI-optimized codebase, I want a thorough understanding of the Gold Standard's architecture, patterns, and conventions — and a selected feature with implementation plan — so that implementation follows the VSA patterns with full confidence and no guesswork.

**Key tasks:**
1. **Study the Gold Standard AI context:** read `CLAUDE.md` (operational rules) and `CODEBASE-GUIDE.md` (deep walkthrough). Note: these are the Gold Standard's own AI Layer — observe how they're structured differently from the exercise repo's AI Layer.
2. **Explore the existing `projects` feature slice:** trace the full data flow from API route (`src/app/api/projects/route.ts`) → service (`src/features/projects/service.ts`) → repository (`src/features/projects/repository.ts`) → database schema (`src/core/database/schema.ts`). Document the pattern for each file.
3. **Study the core infrastructure:** understand `core/config/env.ts` (validated env vars with `z.enum`), `core/logging/` (Pino + getLogger + request context), `core/database/client.ts` (Drizzle + connection pooler), `core/api/errors.ts` (handleApiError + unauthorizedResponse), `shared/schemas/pagination.ts` (reusable pagination).
4. **Map architectural differences:** compare the exercise repo's layered architecture against the Gold Standard's VSA using `docs/references/gold-standard-patterns.md`. Document what's different, what's better, and what creates the "less ambiguity" effect for AI agents.
5. **Select feature and create implementation plan:** choose one of the candidate features (Communities, Project Tags, or Feature Flags VSA). Document: selected feature, rationale, target files to create, implementation order following VSA conventions, validation checkpoints, and expected data flow.
6. **Environment validation:** run `bun install && bun run build && bun run lint && bun test` to confirm the Gold Standard repo is in a clean state before making changes.

**Manual checkpoint:** confirm the architect can describe the VSA structure and data flow without reference. Validate the implementation plan covers all 7 VSA files.

---

### Story E4-S2 — Feature implementation following VSA patterns

**Priority:** P0 | **Depends on:** E4-S1

**Execution model:** Local Copilot or Claude Code — implement with the self-correction workflow.

**Description:** as an architect working in an AI-optimized codebase, I want to implement a complete feature slice following the Gold Standard's Vertical Slice Architecture so that the codebase gains new functionality while maintaining its AI-readiness patterns — and I experience the difference in development fluency.

**Key tasks:**
1. **Database schema:** add the table definition in `src/core/database/schema.ts` using `pgTable`, `timestamps` spread, proper column types (uuid, text, boolean, timestamp), and foreign key references to `users`. Run `bun run db:generate` to create the migration SQL.
2. **models.ts:** create `src/features/{feature}/models.ts` — re-export table, define `type Feature = InferSelectModel<typeof table>` and `type NewFeature = InferInsertModel<typeof table>`. Run `npx tsc --noEmit`.
3. **schemas.ts:** create Zod v4 schemas — `CreateSchema`, `UpdateSchema`, `ResponseSchema`. Use `z.infer<>` for TypeScript types. Import from `"zod/v4"`. Run `bun run lint && npx tsc --noEmit`.
4. **errors.ts:** create feature-specific error classes extending a base feature error. Each error carries `code` (string, machine-readable) and `statusCode` (number, HTTP semantic). Run `npx tsc --noEmit`.
5. **repository.ts:** create pure database operations — `findById`, `findByOwner`, `create`, `update`, `deleteById`. Zero business logic, zero logging, zero error throwing. Run `npx tsc --noEmit`.
6. **service.ts:** create business logic layer. Use `getLogger("feature.service")` for structured logging. Call repository functions (never import Drizzle client directly). Apply access control rules. Throw feature-specific errors. Log `action_started`, `action_completed`, `action_failed`. Run `bun run lint && npx tsc --noEmit`.
7. **index.ts:** create public API gate. Export: service functions, types, schemas, errors. Do NOT export repository. Run `npx tsc --noEmit`.
8. **tests/:** create co-located tests — `service.test.ts` (mock repository, test business logic), `schemas.test.ts` (validate schema rules), `errors.test.ts` (verify error properties). Run `bun test`.
9. **API routes:** create `src/app/api/{feature}/route.ts` (GET list + POST create) and `src/app/api/{feature}/[id]/route.ts` (GET by id + PUT update + DELETE). Follow the `projects` route template. Run `bun run build`.
10. **Full validation:** `bun run build && bun run lint && npx tsc --noEmit && bun test` — all must pass with zero errors.

**Manual checkpoint:** review the feature slice for VSA compliance. Verify: repository has no business logic, service doesn't touch DB directly, index.ts doesn't export repository, all logging uses action-state pattern.

---

### Story E4-S3 — Comparative analysis and experience documentation

**Priority:** P0 | **Depends on:** E4-S2

**Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) — documentation only.

**Description:** as an engineer completing the workshop capstone, I want a comprehensive comparative analysis of all 4 exercises — with quantitative metrics and qualitative observations — so that the workshop debrief has clear evidence of progressive improvement across methodology, reuse, and architecture dimensions.

**Key tasks:**
1. **Capture Exercise 4 metrics:** document implementation time, rework cycles, confidence score (1–5 scale), friction points, and agent autonomy observations.
2. **Produce the 4-exercise comparative report:** create a delta table spanning all exercises:

   | Metric | Ex 1 (Baseline) | Ex 2 (PIV Loop) | Ex 3 (Skill) | Ex 4 (AI-Optimized) |
   |---|---|---|---|---|
   | Time (min) | | | | |
   | Rework cycles | | | | |
   | Confidence (1–5) | | | | |
   | Friction points | | | | |
   | Agent autonomy | | | | |

3. **Document architectural advantage:** describe, with specific examples from implementation, how the Gold Standard's patterns (VSA, strict TS, machine-readable feedback, structured logging, co-located tests) changed the development experience vs. the exercise repo.
4. **Skill portability assessment:** document whether the `context-package-builder` skill from Exercise 3 was applicable in the Gold Standard repo. What worked as-is, what needed adaptation, what didn't transfer.
5. **Workshop narrative:** write a concise "system evolution story" connecting all 4 exercises: starting from no system (Ex 1) → adding methodology (Ex 2) → building reusable workflows (Ex 3) → experiencing AI-native architecture (Ex 4). This is the primary interview deliverable.
6. **Record friction points:** document anything that was harder or easier than expected in the AI-optimized environment.

**Manual checkpoint:** review the comparative report and narrative. Can you explain the 4-exercise progression verbally in under 5 minutes?

---

### Story E4-S4 — Workshop closure

**Priority:** P0 | **Depends on:** E4-S3

**Execution model:** Local Copilot (Claude Opus 4.6 in VS Code) — documentation only.

**Description:** as an engineer completing the Agentic Engineering Workshop, I want all closure artifacts produced so that the workshop deliverables are complete and ready for the interview debrief.

**Key tasks:**
1. **Produce EPIC-4 closure report.** This is the final epic — include a summary section referencing all 4 exercise outcomes.
2. **Produce the workshop completion checklist:**
   - [ ] Exercise 1 (Baseline) — implemented + metrics captured.
   - [ ] Exercise 2 (PIV Loop) — implemented + metrics captured + comparative analysis.
   - [ ] Exercise 3 (Build a Skill) — skill created + tested + refined.
   - [ ] Exercise 4 (AI-Optimized) — implemented + comparative analysis + workshop narrative.
   - [ ] 4-exercise comparative report produced.
   - [ ] Can explain the system evolution verbally.
3. **Final friction log compilation:** consolidate all friction points from all 4 exercises into a single document for workshop debrief.
4. **Archive check:** verify all artifacts (metrics, friction logs, comparative reports, closure reports) are committed and accessible.

**Manual checkpoint:** final review of all workshop deliverables. Ready for interview.

---

## 8) AI Layer execution map

Which agents and skills are responsible for executing each story in this epic.

| Story | Responsible agent(s) | Skills | Instructions |
|---|---|---|---|
| E4-S0 — Planning automation | `agile-exercise-planner` | `scaffold-stories-from-epic`, `create-story-task-pack`, `sync-backlog-index` | `agile-planning.instructions.md` |
| E4-S1 — Codebase exploration + planning | `rdh-workflow-analyst`, `codebase-gap-analyst` | `analyze-rdh-workflow`, `gap-analysis` | `gold-standard.instructions.md`, `feature-flag-exercise.instructions.md` |
| E4-S2 — Feature implementation (VSA) | `task-implementer`, `code-reviewer` | `execute-task-locally` | Gold Standard `CLAUDE.md` (primary), `coding-agent.instructions.md` |
| E4-S3 — Comparative analysis | `agile-exercise-planner`, `technical-manual-writer` | `write-technical-manual`, `record-friction-point` | `documentation.instructions.md`, `measurement-baseline.instructions.md` |
| E4-S4 — Workshop closure | `agile-exercise-planner` | `produce-epic-closure-report`, `record-friction-point` | `documentation.instructions.md` |

---

## 9) Technical reference

### Gold Standard tech stack vs. exercise repo

| Layer | Gold Standard | Exercise repo | Key difference for AI |
|---|---|---|---|
| Runtime | Bun | Node.js (ESM) | Bun: 10x faster test execution, native TS |
| Framework | Next.js 16 (App Router) | Express v5 | Next.js: file-based routing, Server Components |
| Database | Drizzle ORM + Supabase (Postgres) | SQL.js (SQLite/WASM in-memory) | Drizzle: type-safe queries, auto-migrations |
| Validation | Zod v4 (`zod/v4`) | Zod (`zod`) | Zod v4: `z.record` requires 2 args |
| Linting | Biome | ESLint | Biome: 25x faster, lint + format unified |
| Testing | Bun test + RTL | Vitest | Bun: native test runner, `mock.module()` |
| Logging | Pino (structured JSON) | Console | Pino: machine-readable, request context, grep-able |
| Styling | Tailwind v4 + shadcn/ui | Tailwind v4 + shadcn/ui | Same |
| Architecture | Vertical Slice (VSA) | Layered (routes/services/middleware) | VSA: AI reads 1 folder per feature |
| Auth | Supabase Auth | None | Auth built-in |

### VSA feature structure (template)

```
src/features/{feature}/
├── models.ts      # InferSelectModel / InferInsertModel from schema
├── schemas.ts     # Zod v4 schemas + z.infer<> types
├── repository.ts  # Pure DB queries — no logic, no logging, no errors
├── service.ts     # Business logic + logging + access control → calls repository
├── errors.ts      # FeatureError base + specific errors with code + statusCode
├── index.ts       # Public API gate: exports service + types + schemas + errors (NOT repository)
└── tests/
    ├── service.test.ts   # Mock repository, test business logic
    ├── schemas.test.ts   # Validate schema rules
    └── errors.test.ts    # Verify error code + statusCode
```

### Data flow (Gold Standard)

```
API Route (src/app/api/{feature}/route.ts)
  ├─ Supabase auth check
  ├─ Zod schema validation (parse body)
  └─ Call service function
      ↓
Service (src/features/{feature}/service.ts)
  ├─ getLogger("feature.service")
  ├─ logger.info(context, "feature.action_started")
  ├─ business logic + access control
  ├─ repository.* calls (never import db directly)
  ├─ logger.info(context, "feature.action_completed")
  └─ return result (or throw FeatureError)
      ↓
Repository (src/features/{feature}/repository.ts)
  ├─ db.select().from(table).where(eq(...))
  └─ return typed result
      ↓
Database (src/core/database/schema.ts)
  └─ pgTable definition with types + constraints
```

### Validation commands (Gold Standard)

```bash
bun run build        # Production build (includes type checking)
bun run lint         # Biome lint + format check
npx tsc --noEmit     # Type check only (fast)
bun test             # Run tests with coverage (80% threshold)
```

Self-correction loop (run after every change):
```bash
bun run lint && npx tsc --noEmit
```

Full validation (copy-paste ready):
```bash
bun run build && bun run lint && npx tsc --noEmit && bun test
```

### Structured logging pattern

```typescript
import { getLogger } from "@/core/logging";

const logger = getLogger("communities.service");

// Pattern: domain.action_state
logger.info({ communityId, ownerId }, "community.create_started");
logger.info({ communityId }, "community.create_completed");
logger.error({ communityId, error }, "community.create_failed");
```

States: `_started`, `_completed`, `_failed`. Grep-able and machine-parseable.

### Key files (Gold Standard)

| Purpose | File |
|---|---|
| Global rules (auto-loaded) | `CLAUDE.md` |
| Deep walkthrough (on-demand) | `CODEBASE-GUIDE.md` |
| Database schema | `src/core/database/schema.ts` |
| Database client | `src/core/database/client.ts` |
| Env validation | `src/core/config/env.ts` |
| Logger factory | `src/core/logging/index.ts` |
| API error handler | `src/core/api/errors.ts` |
| Supabase server client | `src/core/supabase/server.ts` |
| Pagination schemas | `src/shared/schemas/pagination.ts` |
| Example feature: projects | `src/features/projects/` |
| Example API route | `src/app/api/projects/route.ts` |

### Key patterns to follow

- **Import from `"zod/v4"`** — not `"zod"`. `z.record` requires 2 args: `z.record(z.string(), z.unknown())`.
- **`type` imports** — use `import type { X }` for type-only imports (`verbatimModuleSyntax` enforced).
- **Named exports only** — default exports only for Next.js pages/layouts/config (Biome rule).
- **`const` over `let`** — Biome enforces `const` when value is never reassigned.
- **No `console.log`** — use `getLogger()` with structured context.
- **No `.forEach()`** — use `for...of` loops (Biome rule).
- **No `any`** — strict TypeScript with `noUncheckedIndexedAccess` (array[i] returns `T | undefined`).
- **Path aliases** — `@/*`, `@/core/*`, `@/features/*`, `@/shared/*` map to `./src/*`.

---

## 10) Execution model

This epic uses a **single-phase local execution model** — all work is done locally, in the Gold Standard repository.

```
Gold Standard codebase (CLAUDE.md + CODEBASE-GUIDE.md)
    │
    ▼  Study architecture — VSA, 5 Core Principles, data flow
Pattern understanding confirmed
    │
    ▼  Select feature + create plan
Implementation plan with file list + order + checkpoints
    │
    ▼  Implement following VSA (7-file structure)
    │
    │  Self-correction loop (after EVERY file):
    │  ┌──────────────────────────────────────────┐
    │  │  bun run lint && npx tsc --noEmit        │
    │  │      ├─ Errors? → Read → Fix → Re-run   │
    │  │      └─ Clean? → Next file               │
    │  └──────────────────────────────────────────┘
    │
Feature slice complete (all 7 files + API routes + tests)
    │
    ▼  Full validation gate
    │  bun run build && bun run lint && npx tsc --noEmit && bun test
    │      └─ All zero errors? → proceed to closure
    │
    ▼  Comparative analysis (Ex 1/2/3/4 metrics + narrative)
    │
    ▼  Workshop closure artifacts
EPIC-4 closed — workshop complete
```

### Key principles

| Principle | Rationale |
|---|---|
| **Respect the existing architecture** | The Gold Standard is a reference codebase — follow its patterns exactly, don't reinvent. |
| **Self-correction is the method** | The Write → Check → Fix → Repeat loop is the Gold Standard's core workflow. Embrace it. |
| **Pattern > Feature complexity** | A simple feature with perfect VSA compliance demonstrates more than a complex feature with shortcuts. |
| **Compare, don't compete** | The goal is to articulate the *experience difference*, not to prove one codebase is "better". |
| **Test-first when possible** | Write the test defining expected behavior, then implement. Bun's speed makes TDD practical. |