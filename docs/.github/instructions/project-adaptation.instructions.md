---
applyTo: agile/stories/story-E0S1*.md,agile/tasks/task-E0S1*.md
---

# Project Adaptation — Always-On Instructions (E0-S1 Codebase Audit)

## Objective

These instructions govern any agent executing Story E0-S1 tasks: repository setup, codebase audit, and diagnosis document production. They enforce audit discipline and prevent scope creep into implementation territory.

## Scope

Applies to:

- `project-adaptation-analyst` agent
- Any agent executing Story E0-S1 tasks (T0–T4)
- Any agent editing `story-E0S1-*.md` or `task-E0S1*.md` files

## Mandatory Rules

### 1. Audit before action
Before executing any E0-S1 task, confirm:
- Active branch is `exercise-1` (not `main`).
- The codebase being analyzed is `nextjs-feature-flag-exercise` (not `nextjs-ai-optimized-codebase`).
- Fork exists with `origin` pointing to personal fork and `upstream` pointing to original repository.

### 2. TASK.md is the source of truth for requirements
- Always read `nextjs-feature-flag-exercise/TASK.md` before producing any diagnosis or plan.
- All TASK.md acceptance criteria must be listed verbatim in the diagnosis document.
- Never paraphrase ACs — copy the exact text.

### 3. SQL.js constraints must always be documented
The diagnosis document is incomplete without the SQL.js constraint table. Required entries:
- Boolean storage as INTEGER (0/1)
- Statement lifecycle (`stmt.free()` in `try/finally`)
- Case-insensitive LIKE workaround
- `db.prepare()` vs `db.exec()` for parameterized queries
- Dynamic WHERE clause construction (no native parameterized arrays)

### 4. Timestamps via `fs.statSync()`
When setting `Created at` or `Last updated` in any artifact, never guess or invent timestamps.  
Use the `file-timestamps` skill to obtain real `mtime` from the filesystem.

### 5. Timeline entry required
After creating or updating any E0-S1 artifact, rely on hook automation (`Docs/.github/hooks/agile-auto-log.json`) when available.
Use manual append via the `timeline-tracker` skill schema only as fallback when hooks are unavailable, disabled by policy, or failing.

## What NOT to Do

- **Never implement filtering** during E0-S1 audit tasks. Filtering belongs to EPIC-1.
- **Never audit `nextjs-ai-optimized-codebase`** in E0-S1 context. That is handled by `codebase-gap-analyst`.
- **Never recommend stack migration** (SQL.js → PostgreSQL, Vitest → Jest, etc.) as a task within E0-S1 scope.
- **Never mark a task complete** without verified CLI evidence (commands that exited with code 0).
- **Never omit risk register** from the diagnosis document (R1–R4 minimum).
- **Never create duplicate timeline entries** — if hook automation is active, do not append manual duplicates.

## Integration Point Checklist (for AC-5 compliance)

Every diagnosis document produced in E0-S1-T4 must confirm all 6 integration points:

| Layer | File | Change for Epic 1 |
|---|---|---|
| Shared types | `shared/types.ts` | Add `FlagFilters` interface |
| Validation | `server/src/middleware/validation.ts` | Add query param Zod schema |
| Service | `server/src/services/flags.ts` | Add `getFlagsFiltered(filters)` |
| Route | `server/src/routes/flags.ts` | Parse query params → call filtered service |
| API client | `client/src/api/flags.ts` | Append query params to fetch URL |
| UI state | `client/src/App.tsx` | Add filter state + re-fetch trigger |

## Key References

- `nextjs-feature-flag-exercise/TASK.md` — source of truth for acceptance criteria
- `nextjs-feature-flag-exercise/AGENTS.md` — architecture overview and conventions
- `nextjs-feature-flag-exercise/shared/types.ts` — FeatureFlag type contract
- `Docs/.github/skills/project-context-audit/SKILL.md` — audit process (8 steps)
- `Docs/.github/agents/project-adaptation-analyst.agent.md` — audit agent with pre-loaded knowledge
- `Docs/agile/stories/story-E0S1-repository-diagnosis.md` — full story with acceptance criteria
