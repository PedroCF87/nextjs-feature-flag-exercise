---
name: produce-diagnosis-document
description: Produces the 8-section codebase audit diagnosis document for nextjs-feature-flag-exercise by filling a structured template with findings from the codebase audit (E0-S1-T3) and the validation report (E0-S1-T2). Use this skill after completing the codebase audit to transform raw findings into the evidence artifact required by AC-5 and AC-6 of Story E0-S1.
---

## Objective

Transform raw audit findings and validation results into a complete, structured diagnosis document. This document is the primary evidence artifact for E0-S1 and serves as the foundational reference for E0-S2, E0-S4, and all EPIC-1 implementation work.

---

## Inputs

| Input | Source | Required |
|---|---|---|
| Validation report | `validate-exercise-environment` skill output (T2) | ✅ |
| Architecture layer map | Codebase reading — T3 sub-task 1 | ✅ |
| Data flow trace | Codebase reading — T3 sub-task 2 | ✅ |
| Filtering gap table | Codebase reading — T3 sub-task 3 | ✅ |
| SQL.js constraint map | Codebase reading — T3 sub-task 4 | ✅ |
| Test isolation pattern | Codebase reading — T3 sub-task 5 | ✅ |
| Risk register | Codebase reading — T3 sub-task 6 | ✅ |
| TASK.md content | `nextjs-feature-flag-exercise/TASK.md` | ✅ |

---

## Outputs

| Output | Format | Path | Description |
|---|---|---|---|
| Diagnosis document | Markdown (`.md`) | `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` | 8-section codebase audit with layer map, data flow, SQL.js constraints, integration points, and risk register |
| Quality checklist | Signed checkboxes (section 8) | Same file | Verbatim TASK.md acceptance criteria, each mapped to implementation layer |

(Create the `.agents/diagnosis/` directory if it does not exist.)

---

## Document Template

Fill every section completely. Do not leave placeholder text or omit any section.

---

```markdown
# Codebase Audit — nextjs-feature-flag-exercise

**Date:** <!-- node "Docs/.github/functions/datetime.js" -->
**Branch:** <!-- node "Docs/.github/functions/git-info.js" /path/to/repo --branch-ref -->
**Auditor:** <agent or person name>

---

## 1. Environment state

- Node.js version: ...
- pnpm version: ...
- Branch: exercise-1 @ <sha>
- Validation commands:
  - `cd server && pnpm install`: exit 0 ✅
  - `cd client && pnpm install`: exit 0 ✅
  - `cd server && pnpm run build`: exit 0 ✅
  - `cd server && pnpm run lint`: exit 0 ✅
  - `cd server && pnpm test`: exit 0 ✅
  - `cd client && pnpm run build`: exit 0 ✅
  - `cd client && pnpm run lint`: exit 0 ✅

---

## 2. Architecture map

### Layer overview

| Layer | File(s) | Responsibility |
|---|---|---|
| Shared types | `shared/types.ts` | `FeatureFlag`, `CreateFlagInput`, `UpdateFlagInput`, `Environment`, `FlagType`, `ApiError` |
| DB schema | `server/src/db/schema.ts` | `CREATE TABLE flags` DDL |
| DB client | `server/src/db/client.ts` | `getDb()`, `saveDb()`, SQL.js init |
| DB seed | `server/src/db/seed.ts` | Initial flag rows |
| Validation middleware | `server/src/middleware/validation.ts` | Zod schemas: `createFlagSchema`, `updateFlagSchema` |
| Error classes | `server/src/middleware/error.ts` | `NotFoundError`, `ConflictError`, `ValidationError` |
| Service layer | `server/src/services/flags.ts` | `getAllFlags`, `getFlagById`, `getFlagByName`, `createFlag`, `updateFlag`, `deleteFlag` |
| Route handlers | `server/src/routes/flags.ts` | 5 Express endpoints |
| Tests | `server/src/__tests__/flags.test.ts` | Vitest with SQL.js in-memory DB |
| API client | `client/src/api/flags.ts` | Fetch wrappers |
| UI state | `client/src/App.tsx` | TanStack Query hooks |
| Table component | `client/src/components/flags-table.tsx` | Flag list view |
| Form modal | `client/src/components/flag-form-modal.tsx` | Create/edit dialog |

---

## 3. Data flow — GET /api/flags

```
App.tsx (useQuery(['flags']))
→ client/src/api/flags.ts (fetch GET /api/flags)
→ server/src/routes/flags.ts GET /
→ server/src/services/flags.ts getAllFlags()
→ server/src/db/client.ts getDb()
→ SQL.js db.exec('SELECT * FROM flags ORDER BY created_at DESC')
→ resultToRows() → rowToFlag() × N
→ FeatureFlag[]
← JSON response
← React Query cache update
← UI re-render (FlagsTable)
```

---

## 4. Filtering gap analysis

| Layer | Current state | Required change for Epic 1 |
|---|---|---|
| `shared/types.ts` | No filter types | Add `FlagFilters` interface |
| `server/src/middleware/validation.ts` | No query param schema | Add Zod schema for filter query params |
| `server/src/services/flags.ts` | `getAllFlags()` — no params | Add `getFilteredFlags(filters: FlagFilters)` |
| `server/src/routes/flags.ts` | No query param parsing (`// TODO`) | Parse `?environment=&enabled=&type=&owner=&name=` |
| `client/src/api/flags.ts` | No query params in fetch | Append `URLSearchParams` from filters to fetch URL |
| `client/src/App.tsx` | No filter state | Add filter state + include in `useQuery` key |
| UI | No filter controls | Filter bar + active indicator + clear all action |

---

## 5. SQL.js constraints

### Pattern A — Parameterless bulk read (current `getAllFlags`)

```typescript
const result = db.exec('SELECT * FROM flags ORDER BY created_at DESC');
// result: QueryExecResult[] — { columns: string[], values: any[][] }
const rows = resultToRows(result);
return rows.map(rowToFlag);
```

### Pattern B — Parameterized single read (current `getFlagById`)

```typescript
const stmt = db.prepare('SELECT * FROM flags WHERE id = ?');
try {
  stmt.bind([id]);
  if (stmt.step()) {
    return rowToFlag(stmt.getAsObject());
  }
  return null;
} finally {
  stmt.free(); // MANDATORY — memory leak if omitted
}
```

### Pattern C — Filtered bulk read (to implement in Epic 1)

Must use `db.prepare()` + dynamic `WHERE` clause + `stmt.bind([...values])`, wrapped in
`try { ... } finally { stmt.free() }`.

### Constraint table

| Constraint | Description | Mitigation |
|---|---|---|
| No native boolean | `enabled` stored as INTEGER (0/1) | Convert `enabled` query param string → `0`/`1` in service layer |
| Statement lifecycle | `stmt.free()` required in `try/finally` | Never skip `finally` block — memory leak |
| Case-insensitive search | No built-in `ILIKE` | Use `LOWER(name) LIKE LOWER(?)` |
| No array params | Cannot bind JS arrays natively | Construct dynamic `IN (?,?,?)` placeholders manually |
| `exec` vs `prepare` | `db.exec()` for parameterless; `db.prepare()` for parameterized | Choose pattern based on presence of WHERE parameters |

---

## 6. Integration points for Epic 1

Implement in this dependency order:

1. `shared/types.ts` — add `FlagFilters` interface
2. `server/src/middleware/validation.ts` — add Zod query param schema
3. `server/src/services/flags.ts` — add `getFilteredFlags(filters: FlagFilters)`
4. `server/src/routes/flags.ts` — parse query params → call `getFilteredFlags`
5. `client/src/api/flags.ts` — append `URLSearchParams` from filters to fetch URL
6. `client/src/App.tsx` — add filter state and include in `useQuery` key
7. UI layer — filter bar + active indicator + clear all action

---

## 7. Risk register

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | SQL.js WASM loading failure in CI | Blocks tests in `copilot-setup-steps.yml` | Install deps before runner firewall engages; WASM is bundled by pnpm |
| R2 | Dynamic WHERE clause without parameterization | SQL injection vulnerability | Always use `stmt.bind([...values])` — never string interpolation |
| R3 | `enabled` boolean/integer mismatch in filter query | Filter returns wrong results | Convert query param string `"true"`/`"false"` → `1`/`0` before binding |
| R4 | Tag filtering attempted outside scope | Scope creep; JSON parsing complexity | Tags field is a JSON blob; filtering by tag is not in TASK.md — reject if suggested |
| R5 | Partial filter state causing UX confusion | Poor user experience; false bug reports | All params optional; empty = no filter; AND semantics between active filters |

---

## 8. TASK.md acceptance criteria checklist

(Copy all acceptance criteria **verbatim** from `nextjs-feature-flag-exercise/TASK.md`. Do not paraphrase.)

[Paste each AC here from TASK.md]

**Filter logic notes:**
- Multiple filters applied simultaneously use AND semantics.
- "Clear all filters" resets all active filter values at once.
- Active-filter indicator must be visible when at least one filter is set.
- Name search is partial match and case-insensitive.
```

---

## Process (step-by-step)

1. Capture the branch reference and run the prerequisites check before writing anything:
   ```bash
   # Branch name + short SHA for the document header
   node "$REPO_ROOT/docs/.github/functions/git-info.js" /path/to/nextjs-feature-flag-exercise
   # Current timestamp for "Date" field
   node "$REPO_ROOT/docs/.github/functions/datetime.js"
   # Verify environment is still in a known-good state
   node "$REPO_ROOT/docs/.github/functions/check-prereqs.js" exercise-1 /path/to/nextjs-feature-flag-exercise
   ```
   Paste the `branch` + `sha` values from `git-info.js` into `**Branch:**` in the document header.
   Paste the `datetime.js` output into `**Date:**`.
2. Read the validation report from the `validate-exercise-environment` skill output. Copy Section 1 verbatim.
3. Read `server/src/db/schema.ts`, `server/src/services/flags.ts`, `server/src/routes/flags.ts`, `client/src/App.tsx`. Fill Section 2 architecture map.
4. Trace the `getAllFlags()` call path end-to-end. Fill Section 3 data flow.
5. Compare current service/route/client files against `TASK.md` requirements. Fill Section 4 gap table.
6. Read `server/src/db/client.ts` for SQL.js patterns. Fill Section 5 with real code snippets from the codebase.
7. Read `server/src/__tests__/flags.test.ts` for isolation pattern. Confirm `_resetDbForTesting()` presence.
8. Build Section 7 risk register with at least R1–R5.
9. Open `TASK.md`. Copy all acceptance criteria verbatim into Section 8. Add filter logic notes.
10. Write the document to the output path. Verify all 8 sections are filled.

---

## Quality Checklist

- [ ] All 8 sections present and filled (no placeholder text)
- [ ] Section 1: all 7 validation commands with actual exit codes
- [ ] Section 2: all 13 architecture layers listed with file paths
- [ ] Section 3: data flow trace is complete end-to-end (App.tsx → SQL.js → response → UI)
- [ ] Section 4: all 7 integration layers with current state AND required change
- [ ] Section 5: all 5 SQL.js constraints in the table; Patterns A, B, C documented with real code
- [ ] Section 6: integration points listed in dependency order (1–7)
- [ ] Section 7: at least R1–R5 in risk register
- [ ] Section 8: all TASK.md acceptance criteria copied verbatim (not paraphrased)
- [ ] Document committed to fork at `.agents/diagnosis/codebase-audit.md`
