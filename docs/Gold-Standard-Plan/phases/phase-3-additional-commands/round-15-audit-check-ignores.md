# Phase 3 — Additional Commands: Round 15 — Audit `/check-ignores` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/check-ignores.md`
**Gold Standard concepts**: #25, #26, #27, #28, #29
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~84
- **Frontmatter**: `allowed-tools: Grep, Read, Write, Bash(mkdir:*)`; `description: Audit type/lint suppression comments` — **clean, minimal, well-scoped** ✅
- **Format**: **Plain markdown** with `##` headers — NO XML-style tags. This is an **outlier** in a codebase where 10 of 14 commands (`prime`, `plan`, `implement`, `validate`, `review-pr`, `security-review`, `rca`, `create-rules`, `create-command`, `prd-interactive`, `create-stories`) use `<objective>`/`<context>`/`<process>`/`<output>`/`<success_criteria>` tags. Only `commit.md` (simple) and `check-ignores.md` (this file) use markdown headers.
- **Structure**: Flat narrative — patterns to find → analyze questions → report template → project-specific checks → output location → execution steps

### Current Content Summary

Breakdown of what the command currently does, section by section:

1. **Frontmatter** (lines 1–5): 4 tools scoped, no `argument-hint`, description states purpose clearly.
2. **Opening narrative** (lines 7–16):
   - Lists 5 suppression patterns to find: `// @ts-ignore`, `// @ts-expect-error`, `// eslint-disable`, `// eslint-disable-next-line`, `{/* @ts-ignore */}`
   - States 3 analysis questions per match: (1) What error is suppressed? (2) Is the suppression necessary? (3) Can the underlying issue be fixed?
3. **Report template** (lines 18–41): Markdown structure for `docs/reports/suppression-audit-{YYYY-MM-DD}.md` with Summary (totals: total / remove / keep), and per-finding blocks (Suppression / Reason / Context / Options / Recommendation / Justification).
4. **Project-Specific Checks** (lines 42–60): Three pillars of project-aware analysis:
   - **Server TS**: SQL.js parameterization (no string interpolation), Express v5 middleware signatures, Zod v4 import path (`from "zod/v4"`)
   - **Client TS**: TanStack Query generics, Radix UI component props, Tailwind `cn()` merging
   - **ESLint**: `no-explicit-any` → proper types instead, `no-unused-vars`, `react-hooks/exhaustive-deps`
5. **Output Location** (lines 62–64): Directory creation + filename convention (date-stamped).
6. **Execution Steps** (lines 66–73): 6 numbered steps — `Grep` patterns → `Read` context (5 lines ±) → analyze against CLAUDE.md → generate report → `mkdir` → `Write`.
7. **Decision rubric** (lines 75–84):
   - Suppression **justified if**: type system limitation (SQL.js statement binding generics), third-party type definition issue, temporary workaround with TODO + live issue link
   - Suppression **should be removed if**: underlying code fixable with proper types, legitimate error indicating bug, hiding a useful warning

### Strengths Already Present

- **Minimal `allowed-tools`** — no shell duplicates; `Bash` scoped to `mkdir:*` only ✅ (the cleanest of the 14 commands, alongside `create-command.md`)
- **Date-stamped report filename** (`suppression-audit-{YYYY-MM-DD}.md`) — enables historical comparison and incident forensics ✅
- **Project-aware checks** — the 3 project-specific categories (server/client/ESLint) are sharp and correctly name the tools and patterns ✅
- **Clear decision rubric** (remove / keep / refactor) with concrete triggers — not hand-wavy ✅
- **Contextualized analysis** — explicit instruction to `Read` 5 lines before/after each match prevents shallow one-line judgments ✅
- **TODO hygiene**: "verify the issue still exists" for temporary workarounds — catches the common pattern of stale TODO links ✅
- **Recommendation enumeration**: Each finding gets a verdict (Remove | Keep | Refactor) — no wishy-washy output ✅

### Issues Spotted Before Audit

1. **No XML-tag structure** — inconsistent with 10 of 14 commands. A reader familiar with the project's conventions will be mildly disoriented.
2. **No persona** — opening line "Find all suppression comments in the codebase" is directive but personality-free. Persona is a Gold Standard #26 requirement.
3. **No `argument-hint`** — users cannot narrow the audit to a subdirectory or specific file; always scans the full project scope.
4. **No empty-result handling** — if zero suppressions are found, the command still proceeds through all 6 execution steps, creating a report with `Total: 0`. Graceful, but not called out — a user might wonder why it ran at all.
5. **No PIV positioning** — not stated when this fires (pre-PR hygiene? scheduled? on-demand after a refactor?).
6. **No terminal user-facing summary** — the report is saved to disk, but the command doesn't print a short result block to the user (unlike `/rca`, `/security-review`, `/create-stories` which do).
7. **No chain-forward guidance** — after identifying 10 "Remove" recommendations, the user has no next command to run (`/validate`? `/rca` for unclear cases?).
8. **No missing-CLAUDE.md handling** — Execution Step 3 says "analyze each suppression against project conventions in CLAUDE.md", but doesn't specify behavior if CLAUDE.md is absent.
9. **No `.agents/reference/*.md` auto-loading** — the project has `.agents/reference/backend-patterns.md`, `frontend-patterns.md`, `sql-js-constraints.md` — canonical pattern docs this audit should compare against — but they are never consulted.
10. **Missing `Bash(ls:*)` declaration** — `find docs/reports/ 2>/dev/null` style checks would fail if attempted; currently the command uses only `Grep`/`Read`/`Write`/`mkdir`, but the lack of existing-report detection (for suffix collision or trending) is a gap.

---

## Concept-by-Concept Audit

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly so the agent knows what to load, what to do, and what to emit.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | No `<objective>`, no `## Input`. The command dives straight into "Find all suppressions". No persona, no pre-conditions, no `<context>` auto-loads. Ambiguity: does this run on the whole repo or a specified scope? |
| **Process** | ⚠️ Partial | Execution Steps (6 items) exist, but are interleaved with the Decision Rubric and Project-Specific Checks — no clean separation between "what to do" and "how to judge". No CHECKPOINTs between phases. |
| **Output** | ✅ Strong | Report template fully specified — Summary with totals + per-finding blocks with 6 fields (Suppression / Reason / Context / Options / Recommendation / Justification). |

**Actions:**
- [ ] Adopt XML-tag structure (`<objective>`, `<context>`, `<process>`, `<output>`, `<success_criteria>`) to match the project's dominant convention — OR document the markdown-header choice as intentional (like `commit.md`). For consistency with 10 of 14 commands, prefer XML tags.
- [ ] Restructure the body into labeled phases with clear boundaries — see Concepts #26 and #27 below.
- [ ] Add explicit Input/Process/Output separation so the agent knows exactly what it loads vs what it does vs what it emits.

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, what context to load before any analysis begins.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a code-quality auditor..." statement. The agent is given tasks but no mental model. |
| PIV / workflow positioning | ❌ Missing | Not stated when `/check-ignores` fires. Is it a PIV-phase command? Sideways loop? Scheduled hygiene? |
| `$ARGUMENTS` pre-condition | ❌ Missing | No `argument-hint`; no handling of scoped vs. full-repo invocation |
| Empty-scope handling | ⚠️ Partial | If no suppressions exist, the command still runs through all 6 execution steps silently |
| Missing-CLAUDE.md handling | ❌ Missing | Execution Step 3 references CLAUDE.md but doesn't define behavior if absent |
| Context auto-loading | ❌ Missing | Does NOT auto-load CLAUDE.md, does NOT auto-load `.agents/reference/backend-patterns.md`/`frontend-patterns.md`/`sql-js-constraints.md` — all three are canonical pattern sources this audit compares against |
| Reference-doc discovery | ❌ Missing | No awareness that the project has On-Demand Context docs at `.agents/reference/` (flagged in Round 23) |

**Actions:**
- [ ] Add persona: "You are a code-quality auditor. Your job is to find and triage suppression comments that are masking real issues — not to blindly delete them, and not to preserve them out of inertia. Every suppression is either (a) a necessary escape hatch with clear justification, or (b) debt that can be fixed."
- [ ] Add workflow positioning: "Invoked on-demand as part of **technical-debt hygiene**. Not part of the PIV forward chain (`/plan` → `/implement` → `/commit`). Typical triggers: (1) before a PR that touches a surface with historical suppressions; (2) periodic hygiene sweep after a refactor; (3) called by `/security-review` when it detects `@ts-ignore` near SQL or auth code."
- [ ] Add pre-conditions block (see Concept #27 Actions for the exact wording).
- [ ] Add context auto-loading in `<context>`:
  - `CLAUDE.md` (first 60 lines) — project conventions
  - `.agents/reference/backend-patterns.md` — canonical backend patterns (if present)
  - `.agents/reference/frontend-patterns.md` — canonical frontend patterns (if present)
  - `.agents/reference/sql-js-constraints.md` — SQL.js constraints (if present)
  - Previous audit's existence check (for trending): `ls docs/reports/suppression-audit-*.md`
- [ ] Add missing-CLAUDE.md fallback: "If CLAUDE.md is absent, run the generic suppression analysis but note in the report: 'No CLAUDE.md — recommendations are based on general TypeScript/ESLint best practice. Run `/create-rules` to generate project conventions for a more project-aware audit.'"

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling, evidence-first, rigor.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered phases | ⚠️ Partial | "Execution Steps" numbered 1–6 but NOT VERB-labeled. Mixed with "Project-Specific Checks" and "Decision Rubric" sections — reader must reconstruct the flow. |
| Evidence-first | ✅ Strong | Step 2 mandates `Read` 5 lines before/after each match — prevents judgment without context |
| Decision rubric | ✅ Strong | Explicit "justified if..." / "should remove if..." lists with concrete triggers |
| Error handling — no matches | ❌ Missing | What happens if `Grep` returns zero hits for all 5 patterns? Command proceeds to Step 3 silently. Should STOP and emit a short "clean codebase" report. |
| Error handling — write failure | ❌ Missing | What if `Write` fails (permissions, disk, etc.)? No recovery path. |
| Error handling — missing CLAUDE.md | ❌ Missing | Step 3 explicitly references CLAUDE.md but doesn't define degraded behavior |
| Project awareness — 3 categories | ✅ Strong | Server TS (SQL.js, Express v5, Zod v4) + Client TS (TanStack Query, Radix, `cn()`) + ESLint (`no-explicit-any`, exhaustive-deps) |
| Coverage completeness | ⚠️ Partial | ESLint section misses: `react-hooks/rules-of-hooks`, `no-empty`, `jsx-a11y` family — and does NOT mention Vitest/test-specific suppressions that may appear in `server/src/__tests__/` |
| Pattern-comparison basis | ⚠️ Partial | "Analyze each suppression against project conventions in CLAUDE.md" — but canonical patterns live in `.agents/reference/`, which is ignored |
| Finding aggregation | ❌ Missing | If the same suppression appears 10 times across tests (e.g., `@ts-ignore` on a known SQL.js generics issue), all 10 are reported individually — report noise |

**Actions:**
- [ ] Restructure Execution Steps into **4 labeled phases** with CHECKPOINTs:
  - **Phase 1: DISCOVER** — `Grep` for the 5 suppression patterns across `server/src/` and `client/src/` (or `$ARGUMENTS` scope if provided). Count total hits per pattern type.
    - CHECKPOINT: "If total matches = 0, write a minimal 'clean codebase' report and STOP. Report to user: `✓ No suppressions found in scope. Codebase is clean.`"
  - **Phase 2: CONTEXTUALIZE** — for each hit, use `Read` to fetch 5 lines before and 5 lines after the suppression. Capture: surrounding function/method name, the specific line suppressed, and any adjacent comments (TODO references).
  - **Phase 3: TRIAGE** — apply the 3-category Project-Specific Checks + the Decision Rubric. For each suppression, produce a verdict (Remove | Keep | Refactor) with justification.
    - CHECKPOINT: "For each finding, the justification must reference either CLAUDE.md, `.agents/reference/*.md`, or a concrete TypeScript/ESLint rule — never vague rationale like 'probably fine'."
  - **Phase 4: GENERATE** — create `docs/reports/` if absent; write the report using the existing template; handle write failure by surfacing the OS error to the user.
- [ ] Add **aggregation rule** to Phase 3: "If the same suppression + same justification appears more than 3 times across the scope, group them into one finding with a file list — prevents report noise."
- [ ] Extend the **ESLint category** with:
  - `react-hooks/rules-of-hooks` (hook called conditionally) — should almost always be REMOVED; hiding this masks runtime React errors
  - `no-empty` (empty catch blocks) — cross-references with `silent-failure-hunter` agent; should be REMOVED and replaced with `next(error)` propagation
  - `jsx-a11y/*` (accessibility) — in UI components; REFACTOR to fix accessibility, don't suppress
  - `@typescript-eslint/no-unsafe-*` family — almost always fixable; REMOVE
- [ ] Add **test-file awareness** to Server TS category: "In `server/src/__tests__/*.test.ts`, `@ts-ignore` on SQL.js mock setup may be legitimate (SQL.js types are incomplete for test harnesses). Prefer KEEP with a TODO referencing a tracked SQL.js-types issue; if no TODO, mark REFACTOR."
- [ ] Add **missing-CLAUDE.md fallback**: "If CLAUDE.md was absent at `<context>` load, note this in the report Summary section: `Analysis mode: generic (no CLAUDE.md). Recommendations based on TS/ESLint best practice.`"
- [ ] Add **write-failure handling** to Phase 4: "If `Write` fails, print the error to the user with the intended path. Do NOT silently fail."

---

### Concept #28 — Output Section Detail
> Structured, persisted, terminal summary, chainable.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persisted report | ✅ Strong | `docs/reports/suppression-audit-{YYYY-MM-DD}.md` — date-stamped, predictable path |
| Report template structured | ✅ Strong | Summary section + per-finding blocks with 6 fields (Suppression / Reason / Context / Options / Recommendation / Justification) |
| Terminal user-facing summary | ❌ Missing | Unlike `/rca`, `/security-review`, `/create-stories` which print a summary block to the user, `/check-ignores` just saves the file silently |
| Verdict breakdown | ⚠️ Partial | Report Summary has "Total / Recommended to remove / Recommended to keep" — missing "Recommended to refactor" count and per-file breakdown |
| Chain-forward hints | ❌ Missing | After 10 "Remove" recommendations, user has no next-step guidance. Should chain to `/validate` (after fixes), `/rca` (for unclear refactors), or an implicit "manual fix" step |
| Trending / historical context | ❌ Missing | Report doesn't compare to the previous audit (e.g., "Previous audit {date}: 15 suppressions. Current: 8. Trend: ↓ -7.") — data is lost between runs |
| Same-day re-run handling | ❌ Missing | If run twice on the same date, `suppression-audit-{YYYY-MM-DD}.md` is overwritten silently |

**Actions:**
- [ ] Add a **terminal user-facing summary** as part of `<output>`, printed after the report is saved:
  ```
  Suppression Audit Complete.

  File: docs/reports/suppression-audit-{YYYY-MM-DD}.md
  Scope: {full repo | $ARGUMENTS path}
  Analysis mode: {project-aware (CLAUDE.md found) | generic (no CLAUDE.md)}

  Total: {N}  |  Remove: {N}  |  Keep: {N}  |  Refactor: {N}

  Top file hotspots:
  - {file-path}: {count} suppressions
  - {file-path}: {count} suppressions
  - {file-path}: {count} suppressions

  Trend: {previous audit {date}: {N} total → {Δ} change | no previous audit}

  Next steps:
  - For each "Remove" recommendation: fix the underlying issue and delete the suppression.
  - For unclear "Refactor" recommendations: run `/rca "{short symptom}"` to find root cause before acting.
  - After cleanup: run `/validate` to confirm the suite still passes with suppressions removed.
  ```
- [ ] Add **"Refactor" counter** to the report Summary section — the existing template only has Remove/Keep.
- [ ] Add a **"Top file hotspots"** subsection to the report Summary — lists the 3–5 files with the most suppressions. Makes remediation planning tractable.
- [ ] Add **same-day re-run handling** to Phase 4: "If `docs/reports/suppression-audit-{YYYY-MM-DD}.md` already exists, suffix with `-v2`, `-v3`, etc. — do NOT overwrite. This preserves historical audits taken at different points in the same day (e.g., before/after a refactor session)."
- [ ] Add a **trending line** to the report Summary: "If a previous `suppression-audit-*.md` exists, read its total count and compute the delta. Include in the Summary: `Previous audit (YYYY-MM-DD): X suppressions. Current: Y. Change: ±Z.`"

---

### Concept #29 — Command Chaining
> Where does `/check-ignores` sit relative to the PIV chain and sideways loops?

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Position in workflow | ❌ Missing | Not stated whether PIV-forward, sideways, or hygiene |
| Upstream cue | ❌ Missing | No command suggests running `/check-ignores` (e.g., `/security-review` could when it sees `@ts-ignore` near SQL) |
| Downstream chain — after findings | ❌ Missing | No `/validate` after fixes; no `/rca` for unclear refactors |
| Cross-reference with `silent-failure-hunter` | ❌ Missing | Empty `catch (e) {}` with `eslint-disable no-empty` is exactly what `silent-failure-hunter` looks for — but the two don't acknowledge each other |

**Actions:**
- [ ] Declare position in `<objective>`: "**Sideways hygiene loop**. Not part of PIV-forward chain. Invoked on-demand or when `/security-review` flags suppression-adjacent security concerns."
- [ ] Add chain-forward hints in the terminal summary (covered by Concept #28 actions).
- [ ] Add a note in the report "Justification" guidance: "If a suppression hides an empty catch block, cross-reference with `silent-failure-hunter`: the underlying issue is a silent failure, not a type-system gap. Recommend REMOVE and propagate the error via `next(error)` instead."

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Audit type/lint suppression comments" — terse and clear |
| `argument-hint` | ❌ Missing | No hint at all. Users cannot know the command optionally accepts a scope path without reading the body. |
| `allowed-tools` | ✅ Exemplary | `Grep, Read, Write, Bash(mkdir:*)` — minimum viable set, no shell duplicates, no unnecessary Bash surface area |

**Actions:**
- [ ] Add `argument-hint: [scope-path]` so users know they can narrow the audit to `server/src/services` or a single file
- [ ] Keep `allowed-tools` unchanged — it's already the cleanest in the codebase

---

## Action Plan Summary

### Priority 1 — Structural Alignment (concepts #25, #26)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Convert the command body to XML-tag structure (`<objective>`, `<context>`, `<process>`, `<output>`, `<success_criteria>`) | #25 |
| 1.2 | Add persona to `<objective>`: code-quality auditor triaging suppressions | #26 |
| 1.3 | Add workflow positioning: sideways hygiene loop, not PIV-forward | #26, #29 |
| 1.4 | Add `<context>` auto-loads: CLAUDE.md, `.agents/reference/*-patterns.md` when present, existing report history | #26 |
| 1.5 | Add `argument-hint: [scope-path]` | Best practice |

### Priority 2 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Restructure Execution Steps into 4 labeled phases: DISCOVER → CONTEXTUALIZE → TRIAGE → GENERATE (with CHECKPOINTs) | #27 |
| 2.2 | Add empty-result handling to Phase 1 (zero matches → clean report + STOP) | #27 |
| 2.3 | Extend ESLint category: `react-hooks/rules-of-hooks`, `no-empty`, `jsx-a11y/*`, `@typescript-eslint/no-unsafe-*` | #27 |
| 2.4 | Add test-file awareness (SQL.js mock suppressions may be legitimate) | #27 |
| 2.5 | Add finding aggregation rule (same suppression >3× → group into one finding) | #27 |
| 2.6 | Add missing-CLAUDE.md fallback (degraded generic mode) | #27 |
| 2.7 | Add write-failure handling in Phase 4 (surface OS error, do NOT silently fail) | #27 |

### Priority 3 — Output + Chaining (concepts #28, #29)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add terminal user-facing summary with counts, hotspots, trend, next-steps | #28 |
| 3.2 | Add "Refactor" counter to the report Summary section | #28 |
| 3.3 | Add "Top file hotspots" subsection to the report Summary | #28 |
| 3.4 | Add same-day re-run handling (suffix `-v2`, `-v3` — do NOT overwrite) | #28 |
| 3.5 | Add trending line (compare to previous audit's total count) | #28 |
| 3.6 | Chain forward: `/validate` after cleanup, `/rca` for unclear refactors | #29 |
| 3.7 | Cross-reference `silent-failure-hunter` for empty-catch suppressions | #29 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§25, §26, §27, §28, §29)
2. `.claude/commands/check-ignores.md` — current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-15-audit-check-ignores.md` — this audit
4. `.claude/commands/rca.md` — XML-tag structural reference (closest sibling)
5. `.claude/commands/security-review.md` — terminal-summary format reference
6. `CLAUDE.md` — project conventions
7. `.agents/reference/backend-patterns.md` + `frontend-patterns.md` + `sql-js-constraints.md` (if present) — canonical patterns the audit compares against
8. `docs/Gold-Standard-Plan/phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md` — for the On-Demand Context integration pattern

Rewrite `.claude/commands/check-ignores.md` with these requirements:

1. **Frontmatter** — keep `allowed-tools` and `description` unchanged; add `argument-hint: [scope-path]`:
   ```
   ---
   allowed-tools: Grep, Read, Write, Bash(mkdir:*), Bash(ls:*)
   argument-hint: [scope-path]
   description: Audit type/lint suppression comments
   ---
   ```
   (`Bash(ls:*)` added to support existing-report detection for trending and same-day re-run handling.)

2. **`<objective>`** block:
   ```
   <objective>
   You are a code-quality auditor. Your job is to find and triage suppression comments that are masking real issues — not to blindly delete them, and not to preserve them out of inertia. Every suppression is either (a) a necessary escape hatch with clear justification, or (b) technical debt that can be fixed.

   **Scope**: ${ARGUMENTS:-server/src client/src}. If $ARGUMENTS is provided, audit that path only.

   **Position in workflow**: Sideways hygiene loop — NOT part of the PIV-forward chain. Typical triggers:
   - Before a PR that touches a surface with historical suppressions
   - Periodic hygiene sweep after a refactor session
   - Invoked by `/security-review` when it detects `@ts-ignore` near SQL or auth code

   **Core principle**: The verdict for every suppression must be backed by evidence — either a CLAUDE.md rule, a `.agents/reference/*.md` pattern, or a concrete TS/ESLint rule. Never "probably fine".
   </objective>
   ```

3. **`<context>`** block:
   ```
   <context>
   Project conventions: !`head -60 CLAUDE.md 2>/dev/null || echo "(no CLAUDE.md — analysis will be generic)"`
   Backend patterns: !`test -f .agents/reference/backend-patterns.md && cat .agents/reference/backend-patterns.md || echo "(no backend patterns reference)"`
   Frontend patterns: !`test -f .agents/reference/frontend-patterns.md && cat .agents/reference/frontend-patterns.md || echo "(no frontend patterns reference)"`
   SQL.js constraints: !`test -f .agents/reference/sql-js-constraints.md && cat .agents/reference/sql-js-constraints.md || echo "(no SQL.js constraints reference)"`
   Previous audits: !`ls docs/reports/suppression-audit-*.md 2>/dev/null | tail -5 || echo "(no previous audits)"`
   </context>
   ```

4. **`<process>`** — restructure into 4 labeled phases with CHECKPOINTs:

   ```
   <process>

   ## Phase 1: DISCOVER — Find All Suppressions

   Use `Grep` to search the scope for these 5 patterns:
   - `// @ts-ignore`
   - `// @ts-expect-error`
   - `// eslint-disable`
   - `// eslint-disable-next-line`
   - `{/* @ts-ignore */}`

   Count hits per pattern and per file.

   **CHECKPOINT:**
   - [ ] All 5 patterns searched
   - [ ] Per-pattern and per-file counts captured

   **Empty-result STOP**: If total matches = 0 across all patterns, write a minimal report containing only:
   ```
   # Suppression Audit — {YYYY-MM-DD}
   ## Summary
   - Total suppressions: 0
   - Scope: {scope}
   - Result: ✓ Clean codebase — no suppressions in scope.
   ```
   Then report to user (terminal summary) and STOP.

   ---

   ## Phase 2: CONTEXTUALIZE — Gather Evidence

   For each hit from Phase 1, use `Read` to fetch **5 lines before and 5 lines after** the suppression line.

   Capture:
   - The exact suppression comment
   - The line immediately being suppressed (what error is being silenced)
   - The enclosing function/method name
   - Any adjacent TODO/FIXME comments referencing tracked issues
   - Whether the file is test code (`*.test.ts`, `__tests__/`) — these have different triage rules

   **CHECKPOINT:**
   - [ ] Every hit has surrounding context captured
   - [ ] Enclosing function identified
   - [ ] Adjacent TODOs captured

   ---

   ## Phase 3: TRIAGE — Decide Remove / Keep / Refactor

   Apply Project-Specific Checks (below) and the Decision Rubric to produce a verdict for each suppression.

   ### Project-Specific Checks

   **TypeScript suppressions in `server/`:**
   - SQL.js query construction — should use parameterized queries (`db.prepare()` + `stmt.bind()`), NOT string interpolation. Suppressing a type error on string-interpolated SQL = SQL injection risk. **Verdict: REMOVE** (fix the interpolation).
   - Express v5 types — verify middleware signatures match `(req, res, next)`. Missing `next` parameter often comes with `@ts-ignore` in handlers. **Verdict: REMOVE** (add the parameter).
   - Zod v4 types — verify the import is `from "zod/v4"`, not `"zod"`. Mismatched imports produce type errors that get suppressed. **Verdict: REMOVE** (fix the import).

   **In `server/src/__tests__/*.test.ts` only**: `@ts-ignore` on SQL.js mock setup may be legitimate (SQL.js types are incomplete for test harnesses). Prefer **KEEP** with a TODO referencing a tracked SQL.js-types issue; if no TODO link, **REFACTOR** (add the TODO or isolate the mock in a typed helper).

   **TypeScript suppressions in `client/`:**
   - TanStack Query types — verify proper `useQuery<TData, TError>` / `useMutation` generics. Missing generics cause type-narrowing failures that get suppressed. **Verdict: REMOVE** (add generics).
   - Radix UI component props — verify proper spreading and type inference. Suppressions here often hide forwarded-ref mismatches. **Verdict: REMOVE** or **REFACTOR**.
   - Tailwind `cn()` usage — verify class merging is via `cn()` (from `@/lib/utils`) rather than manual string concatenation. **Verdict: REFACTOR**.

   **ESLint suppressions (all layers):**
   - `no-explicit-any` — should add proper types instead. **Verdict: REMOVE** (type properly).
   - `@typescript-eslint/no-unused-vars` — verify if the variable is actually needed. **Verdict: REMOVE** (delete the var) or **REFACTOR** (prefix with `_` if it's an intentional signature placeholder).
   - `react-hooks/exhaustive-deps` — verify the dependency array is correct. Suppressing this is a common source of stale closures. **Verdict: REMOVE** (fix the deps) or **REFACTOR** (lift state appropriately).
   - `react-hooks/rules-of-hooks` — hook called conditionally. Almost always **REMOVE** — hiding this masks runtime React errors.
   - `no-empty` (empty catch blocks) — cross-reference with `silent-failure-hunter` agent: empty catches are silent failures. **Verdict: REMOVE** (replace with `next(error)` propagation).
   - `jsx-a11y/*` (accessibility) — in UI components. **Verdict: REFACTOR** (fix the accessibility issue, don't suppress).
   - `@typescript-eslint/no-unsafe-*` family — almost always fixable with better types. **Verdict: REMOVE**.

   ### Decision Rubric

   A suppression is **justified** (KEEP) if ALL of:
   - It's a known limitation of the type system (e.g., SQL.js statement binding generics — document and link to the SQL.js issue)
   - It's a third-party type definition issue (document and link to DefinitelyTyped or the library's issue tracker)
   - It has an inline TODO referencing a live GitHub issue (verify the issue still exists)

   A suppression should be **removed** (REMOVE) if ANY of:
   - The underlying code can be fixed with proper types
   - The error is legitimate and indicates a bug
   - It's suppressing a useful warning that would prevent real issues
   - It's an empty catch block (cross-reference `silent-failure-hunter`)

   A suppression should be **refactored** (REFACTOR) if:
   - The fix is not trivial but feasible (e.g., extract to a typed helper, reorganize imports)
   - The underlying issue is unclear — run `/rca "why is {X} being suppressed"` to find root cause

   **CHECKPOINT:**
   - [ ] Every finding has a verdict (Remove | Keep | Refactor)
   - [ ] Every justification references CLAUDE.md, `.agents/reference/*.md`, or a concrete TS/ESLint rule — NEVER vague reasoning
   - [ ] Empty-catch suppressions flagged for cross-reference with `silent-failure-hunter`

   ### Aggregation Rule

   If the **same suppression + same justification** appears more than 3 times across the scope, group them into a single finding with a file list — prevents report noise. Example:
   ```
   ### Aggregated: @ts-ignore on SQL.js stmt.bind() generics (8 occurrences)
   **Files**: server/src/services/flags.ts:42, :78, :112; server/src/services/users.ts:33, :89, :104; server/src/__tests__/flags.test.ts:15, :47
   **Verdict**: KEEP — known SQL.js type limitation
   **Recommendation**: Consolidate into a typed helper `prepareAndBind<T>()` to eliminate the repeated suppression.
   ```

   ---

   ## Phase 4: GENERATE — Write the Report

   Create `docs/reports/` directory if absent: `mkdir -p docs/reports`.

   Determine the report filename:
   - Base: `docs/reports/suppression-audit-{YYYY-MM-DD}.md`
   - **Same-day re-run handling**: if the base path exists, suffix with `-v2`, `-v3`, etc. until unique. This preserves historical audits taken at different points in the same day.

   Compute the trending line by reading the most recent previous audit (from the `<context>` auto-load):
   - Extract its "Total suppressions" count
   - Compute delta: `Δ = current_total - previous_total`

   Write the report using the template in `<output>` below.

   **Write-failure handling**: if `Write` fails (permissions, disk full, etc.), surface the OS error to the user with the intended path. Do NOT silently fail.

   </process>
   ```

5. **`<output>`** block — two parts: the report template (unchanged structure, extended) + the terminal user-facing summary.

   ```
   <output>

   ## Report File

   Save to: `docs/reports/suppression-audit-{YYYY-MM-DD}{-vN}.md`

   ### Report Structure

   ```markdown
   # Suppression Audit — {YYYY-MM-DD}

   **Scope**: {full repo | $ARGUMENTS path}
   **Analysis mode**: {project-aware (CLAUDE.md found) | generic (no CLAUDE.md)}
   **Previous audit**: {date of most recent prior audit | "no previous audit"}

   ## Summary
   - Total suppressions: {N}
   - Remove: {N}
   - Keep: {N}
   - Refactor: {N}
   - Trend vs. previous audit: {"+3" | "-7" | "no change" | "no previous audit"}

   ## Top File Hotspots
   | File | Suppressions | Dominant verdict |
   |------|--------------|------------------|
   | {path} | {count} | {Remove \| Keep \| Refactor} |
   | {path} | {count} | ... |

   ## Findings

   ### {path}:{line}
   **Suppression:** `{comment}`
   **Enclosing function:** `{function-name}`
   **Reason (what is being suppressed):** {the type/lint error being silenced}
   **Context:**
   ```ts
   {5 lines before}
   {the suppressed line}
   {5 lines after}
   ```
   **Options:**
   1. {fix option — e.g., add proper types, fix SQL.js parameterization}
   2. {alternative — e.g., refactor to avoid the pattern}
   **Recommendation:** {Remove | Keep | Refactor}
   **Justification:** {detailed reasoning referencing CLAUDE.md / `.agents/reference/*.md` / TS rule}
   **Cross-reference:** {optional — e.g., "`silent-failure-hunter` would flag this empty catch"}

   ### Aggregated: {summary of repeated pattern} ({count} occurrences)
   **Files:** {comma-separated list}
   **Verdict:** {Remove | Keep | Refactor}
   **Recommendation:** {how to consolidate}
   ```

   ## Terminal User-Facing Summary

   After writing the report, print this summary:

   ```
   Suppression Audit Complete.

   File: docs/reports/suppression-audit-{YYYY-MM-DD}{-vN}.md
   Scope: {scope}
   Analysis mode: {project-aware | generic}

   Total: {N}   |   Remove: {N}   |   Keep: {N}   |   Refactor: {N}

   Top file hotspots:
   - {path}: {count} suppressions
   - {path}: {count} suppressions
   - {path}: {count} suppressions

   Trend: {previous audit {date}: {N_prev} total → current {N_cur} ({Δ}) | no previous audit}

   Next steps:
   - For each "Remove" recommendation: fix the underlying issue, then delete the suppression.
   - For unclear "Refactor" recommendations: `/rca "<short symptom>"` to find root cause first.
   - For empty-catch suppressions flagged with `silent-failure-hunter` cross-reference: replace with `next(error)` propagation.
   - After cleanup: `/validate` to confirm the suite still passes with suppressions removed.
   ```

   </output>
   ```

6. **`<success_criteria>`** block:

   ```
   <success_criteria>
   - Report saved to `docs/reports/suppression-audit-{YYYY-MM-DD}{-vN}.md` (same-day re-run uses suffix, never overwrites)
   - Empty-scope case produces a minimal "clean codebase" report and stops cleanly
   - Every finding has: Suppression comment, Enclosing function, 5-line context, Options, Recommendation (Remove/Keep/Refactor), Justification
   - Justifications reference CLAUDE.md / `.agents/reference/*.md` / concrete TS or ESLint rule — never vague reasoning
   - Repeated patterns (>3 occurrences with same justification) are aggregated into single findings
   - Report Summary includes Total + Remove + Keep + Refactor counts AND "Top File Hotspots" table
   - Trend line computed against most recent previous audit, or states "no previous audit"
   - Terminal summary printed to user with counts, hotspots, trend, and next-step chain (`/rca`, `/validate`)
   - Empty-catch suppressions cross-referenced with `silent-failure-hunter` in their Justification
   - Missing-CLAUDE.md path handled gracefully (generic mode, flagged in report Summary)
   - Write failure surfaces OS error to user, does NOT silently fail
   </success_criteria>
   ```

7. **Do NOT change**:
   - The 5 suppression patterns being searched
   - The overall purpose and positioning as a hygiene audit
   - The 3-category structure (server TS / client TS / ESLint) — only extend with new items
   - The decision rubric triggers (justified-if / remove-if) — only add REFACTOR path
   - The date-stamped filename convention

Do NOT change any source code. Only modify `.claude/commands/check-ignores.md`.
````

---

## Success Criteria

- [ ] XML-tag structure adopted (`<objective>`, `<context>`, `<process>`, `<output>`, `<success_criteria>`) (concept #25)
- [ ] Persona in `<objective>`: code-quality auditor triaging suppressions (concept #26)
- [ ] Workflow positioning stated: sideways hygiene loop, NOT PIV-forward; triggers enumerated (concept #26, #29)
- [ ] `<context>` auto-loads: CLAUDE.md + `.agents/reference/backend-patterns.md` + `frontend-patterns.md` + `sql-js-constraints.md` + previous audits list (concept #26, cross-ref Round 23)
- [ ] `argument-hint: [scope-path]` added so users know they can narrow scope (best practice)
- [ ] `Bash(ls:*)` added to support previous-audit detection for trending (frontmatter)
- [ ] 4-phase `<process>` with VERB labels and CHECKPOINTs: DISCOVER → CONTEXTUALIZE → TRIAGE → GENERATE (concept #27)
- [ ] Empty-result STOP at end of Phase 1: zero matches → minimal clean report + STOP (concept #27)
- [ ] ESLint category extended: `react-hooks/rules-of-hooks`, `no-empty`, `jsx-a11y/*`, `@typescript-eslint/no-unsafe-*` (concept #27)
- [ ] Test-file awareness: SQL.js mock suppressions in `__tests__/` may be legitimate KEEP/REFACTOR (concept #27)
- [ ] Aggregation rule: same suppression + same justification >3× → single grouped finding (concept #27)
- [ ] Missing-CLAUDE.md fallback: degraded generic mode, flagged in report Summary (concept #27)
- [ ] Write-failure handling: surface OS error to user, do NOT silently fail (concept #27)
- [ ] Every Justification references CLAUDE.md / `.agents/reference/*.md` / concrete rule — enforced in CHECKPOINT (concept #27)
- [ ] Report Summary extended: Total + Remove + Keep + Refactor + Trend line (concept #28)
- [ ] Top File Hotspots table added to report Summary (concept #28)
- [ ] Terminal user-facing summary block with counts, hotspots, trend, next-step chain (concept #28)
- [ ] Same-day re-run: suffix `-v2`, `-v3` — do NOT overwrite prior audit (concept #28)
- [ ] Trending line computed against most recent prior audit (concept #28)
- [ ] Chain forward: `/validate` after cleanup, `/rca` for unclear refactors (concept #29)
- [ ] Empty-catch suppressions cross-referenced with `silent-failure-hunter` in Justification (concept #29)
- [ ] `allowed-tools` remains minimal — only `Bash(ls:*)` added for trending; no shell duplicates of native Grep/Read (best practice preserved)
- [ ] Original 5 suppression patterns, 3-category structure, decision rubric, date-stamped filename convention all preserved ✅
