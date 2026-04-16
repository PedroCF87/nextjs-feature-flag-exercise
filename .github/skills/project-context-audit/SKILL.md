---
name: project-context-audit
description: Systematic codebase audit of `nextjs-feature-flag-exercise`. Produces a structured diagnosis document covering layer architecture, data flow, SQL.js constraints, integration points, test strategy, and risk register — everything an implementation agent needs to execute Epic 1 with zero ambiguity. Use this skill when asked to audit the exercise codebase or produce the E0-S1 diagnosis document.
---

## Context

This skill targets the `nextjs-feature-flag-exercise` codebase — the interview Training Ground. It is a codebase audit skill: it reads and documents, it does not implement.

**Stack to audit:**

| Layer | Technology |
|---|---|
| Runtime | Node.js ESM |
| Server framework | Express v5 |
| Database | SQL.js (SQLite/WASM in-memory) |
| Validation | Zod v3 |
| Test runner | Vitest |
| Client | React 19 + Vite + TanStack Query v5 + Tailwind v4 |
| Shared contract | `shared/types.ts` |

**Primary goal:** produce `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` with the 8 mandatory sections defined below.

---

## Metadata

| Field | Value |
|---|---|
| **Created at** | 2026-04-09 18:37:32 -03 |
| **Last updated** | 2026-04-11 10:00:00 -03 |

---

## Inputs

| Input | Required | Description |
|---|---|---|
| `repo_path` | ✅ | Absolute path to `nextjs-feature-flag-exercise` on disk |
| `task_md_path` | ✅ | Absolute path to `nextjs-feature-flag-exercise/TASK.md` |
| `agents_md_path` | ✅ | Absolute path to `nextjs-feature-flag-exercise/AGENTS.md` |
| `output_path` | ✅ | Absolute path where the diagnosis document will be written |

---

## Outputs

| Output | Format | Description |
|---|---|---|
| Diagnosis document | Markdown (`.md`) | 8-section codebase audit document at `output_path` |
| Quality checklist | Signed checkboxes in the document | Confirms all 10 quality gates passed |

See `## Output Format` below for the exact document header template.

---

## Process (8 steps)

### Step 1 — Read the shared type contract

Read `shared/types.ts` and record:

- All fields in the `FeatureFlag` interface (confirm: `id`, `name`, `description`, `enabled`, `environment`, `type`, `owner`, `createdAt`, `updatedAt`)
- Union type definitions for `Environment` and `FlagType`
- Which fields are filterable for TASK.md scope: `environment`, `status` (from `enabled`), `type`, `owner`, `name`

### Step 2 — Map the server layer

Read in order:

1. `server/src/db/schema.ts` — confirm SQL column names match `FeatureFlag` fields
2. `server/src/db/client.ts` — locate `_resetDbForTesting()` export; note database initialization
3. `server/src/middleware/validation.ts` — note Zod schemas for `CreateFlagInput` and `UpdateFlagInput`
4. `server/src/middleware/error.ts` — note custom error classes: `NotFoundError`, `ConflictError`, `ValidationError`
5. `server/src/services/flags.ts` — locate `getAllFlags()`: note the raw SQL, confirm no filter params; search for `TODO`
6. `server/src/routes/flags.ts` — confirm `next(error)` pattern; search for `TODO` and `Workshop` comments

### Step 3 — Map the client layer

Read in order:

1. `client/src/api/flags.ts` — note current fetch URL; confirm no query params passed
2. `client/src/App.tsx` — locate TanStack Query `useQuery` for flags; note state management structure
3. `client/src/components/flags-table.tsx` — confirm display component interface

### Step 4 — Read TASK.md and enumerate ACs

Read `nextjs-feature-flag-exercise/TASK.md` and produce a verbatim checklist of **all acceptance criteria**. Note:

- Total AC count
- Which ACs relate to server-side filtering vs. client UI
- AND vs OR semantics for multi-filter (confirm from TASK.md)
- "Clear all filters" requirement
- Active-filter indicator requirement

### Step 5 — Document SQL.js constraints

For each of the following constraints, note the current code evidence and write the mitigation:

| Constraint | Look for evidence in |
|---|---|
| Booleans stored as INTEGER (0/1) | `schema.ts` — `enabled` column type |
| Statement lifecycle (`stmt.free()`) | `services/flags.ts` — existing queries |
| Case-insensitive LIKE limitation | Any existing `LIKE` query in services |
| `db.exec()` vs `db.prepare()` | `services/flags.ts` — how `getAll()` queries the DB |
| No native parameterized arrays | N/A — absence of multi-value query; document the gap |

### Step 6 — Identify integration points for filtering

Build an integration point table. For each filterable field (`environment`, `status`, `type`, `owner`, `name`), identify:

- `shared/types.ts`: add `FlagFilters` interface or extend existing type
- `server/src/services/flags.ts`: add `getFlagsFiltered(filters)` function
- `server/src/routes/flags.ts`: parse query params and pass to service
- `server/src/middleware/validation.ts`: add Zod schema for filter query params
- `client/src/api/flags.ts`: pass filter params to fetch URL
- `client/src/App.tsx`: manage filter state + trigger re-fetch

### Step 7 — Build risk register

Produce a risk register with at minimum these 4 entries:

| ID | Risk | Likelihood | Impact |
|---|---|---|---|
| R1 | Dynamic SQL construction in SQL.js with variable number of WHERE conditions | High | High |
| R2 | Client state sync between filter controls and TanStack Query cache invalidation | Medium | Medium |
| R3 | Test isolation: filter combination tests may leak state between test cases | Medium | Medium |
| R4 | Boolean conversion: `enabled` filter from string query param to INTEGER `0`/`1` | High | High |

Each entry must include a mitigation strategy.

### Step 8 — Assemble diagnosis document

Produce `Docs/agile/tasks/task-E0S1T4-diagnosis.md` with these 8 sections:

1. **Executive Summary** — 3–5 bullets: overall readiness assessment
2. **Layer Architecture Map** — directory tree + layer responsibility table
3. **Data Flow: GET /api/flags** — current flow (no filters) → target flow (with filters), as a table or sequence diagram
4. **Integration Points Table** — columns: `Field | File | Function | Change Type | Risk`
5. **SQL.js Constraint Table** — columns: `Constraint | SQL Impact | Code Mitigation`
6. **Test Strategy** — `_resetDbForTesting()` pattern + new test cases needed
7. **Risk Register** — columns: `ID | Description | Likelihood | Impact | Mitigation`
8. **TASK.md AC Checklist** — verbatim list of all ACs, each with `Layer` annotation

---

## Quality Checklist

Before marking the audit complete, verify:

- [ ] All `FeatureFlag` fields listed from `shared/types.ts`
- [ ] `getAll()` SQL query documented with exact current text
- [ ] TODO comment location noted with `file:line` reference
- [ ] `_resetDbForTesting()` confirmed in test file
- [ ] All 5 filterable fields listed (environment, status, type, owner, name)
- [ ] SQL.js constraint table has ≥ 5 entries with mitigations
- [ ] Integration points table covers all 6 layer files
- [ ] Risk register has ≥ R1–R4 entries with mitigations
- [ ] TASK.md AC checklist is verbatim (not paraphrased) with layer annotation
- [ ] Diagnosis document path is `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md`

---

## Output Format

**Diagnosis document filename:** `Docs/agile/tasks/task-E0S1T4-diagnosis.md`

**Document header:**

```markdown
# Diagnosis Document — Story E0-S1: Repository Readiness and Codebase Audit

## Metadata

| Field | Value |
|---|---|
| Story | E0-S1 |
| Task | E0-S1-T4 |
| Author | project-adaptation-analyst |
| Produced | <timestamp> |
| Exercise branch | exercise-1 |
```

## Do Not

- Do not implement filtering during the audit.
- Do not read `nextjs-ai-optimized-codebase` — it is a different repository.
- Do not paraphrase TASK.md acceptance criteria — copy verbatim.
- Do not omit SQL.js constraints — they drive the highest-risk implementation decisions.
- Do not mark audit complete if any quality checklist item is unchecked.
