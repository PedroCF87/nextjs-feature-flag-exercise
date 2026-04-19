# Phase 2 — Core 4 Commands: Round 3 — Audit `/plan` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/plan.md`
**Gold Standard concepts**: #2, #5, #9, #23, #25, #26, #27, #28, #29, #33
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~251
- **Frontmatter**: broad `allowed-tools` (Read, Grep, Glob, Write + multiple Bash commands), `description: Create implementation plan with codebase analysis`, `argument-hint: <feature description | path/to/prd.md>`
- **Format**: XML-style tags (`<objective>`, `<context>`, `<process>`, `<success_criteria>`)
- **Structure**: 5 phases — PARSE → EXPLORE → DESIGN → GENERATE → OUTPUT

### Current Content Summary
1. **`<objective>`**: PLAN ONLY principle, CODEBASE FIRST order, no code written
2. **`<context>`**: Auto-runs project structure, available scripts, existing plans, CLAUDE.md check
3. **Phase 1 — PARSE**: Determines input type (PRD / other .md / free-text / blank), extracts Problem / User Story / Type / Complexity
4. **Phase 2 — EXPLORE**: Searches 6 pattern categories with file:line evidence, CHECKPOINT requiring ≥ 3 categories + MIRROR reference
5. **Phase 3 — DESIGN**: Determines implementation order by project layer, maps file changes, identifies risks
6. **Phase 4 — GENERATE**: Outputs `.agents/plans/{name}.plan.md` with full template (Summary, User Story, Metadata, Patterns, Files to Change, Tasks, Validation, End-to-End Verification, Acceptance Criteria)
7. **Phase 5 — OUTPUT**: Summary block with scope counts + key patterns + **explicit chaining: "Next Step: `/implement .agents/plans/{name}.plan.md`"** ✅

### Strengths Already Present
- "PLAN ONLY — no code written" constraint explicitly enforced
- Phase 2 CHECKPOINT requires ≥ 3 pattern categories with file:line before proceeding
- Every Task has a MIRROR reference to real codebase code
- Phase 5 already chains explicitly to `/implement`
- Implementation order follows project dependency flow (types → validation → services → routes → client → UI → tests)

---

## Concept-by-Concept Audit

### Concept #2 — Core 4: `/plan` Purpose
> Create a structured plan from context exploration and task analysis.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Is a Core 4 command | ✅ Present | Exists as `.claude/commands/plan.md` |
| Produces a structured plan | ✅ Present | Phase 4 generates `.agents/plans/{name}.plan.md` |
| PLAN ONLY — no code written | ✅ Present | Explicit in `<objective>`: "PLAN ONLY — no code written" |
| Codebase-first approach | ✅ Present | "CODEBASE FIRST. Solutions must fit existing patterns." |

---

### Concept #5 — Plan Templates
> Structure must include: Goal(s), Success criteria, Documentation to reference, Task list, Validation strategy, Desired codebase structure.

| Required Element | Status | Evidence |
|------------------|--------|----------|
| **Goal(s)** | ✅ Present | `## Summary` (one paragraph) + `## User Story` |
| **Success criteria** | ✅ Present | `## Acceptance Criteria` checklist |
| **Documentation to reference** | ❌ Missing | No section listing which On-Demand Context docs or codebase references to read during implementation |
| **Task list** | ✅ Present | `## Tasks` with atomic tasks — each has File, Action, Implement, Mirror, Validate |
| **Validation strategy** | ✅ Present | `## Validation` (copy-paste commands) + `## End-to-End Verification` |
| **Desired codebase structure** | ⚠️ Partial | `## Files to Change` table lists file paths and actions — but no directory tree showing the desired structure after changes |

**Actions:**
- [ ] Add `## Documentation to Reference` section to the plan template — lists On-Demand Context docs loaded during planning (e.g., `.agents/reference/backend.md`, `.agents/reference/frontend.md`) and key codebase references consulted
- [ ] Enhance `## Files to Change` to optionally include a small directory tree for new file additions

---

### Concept #9 — Two Planning Layers
> Layer 1 (Project): stable conventions from CLAUDE.md. Layer 2 (Task): per-feature codebase analysis.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **Layer 1 awareness** | ⚠️ Partial | `<context>` checks if CLAUDE.md exists; Phase 2 EXPLORE reads codebase patterns — but no explicit step to read CLAUDE.md conventions before planning |
| **Layer 2 execution** | ✅ Present | Phase 2 EXPLORE is a thorough per-task codebase analysis |
| **Distinguishes layers** | ❌ Missing | No explicit label separating "what I know from global rules" vs "what I discovered from this codebase" |

**Actions:**
- [ ] Add pre-condition to `<objective>` or new `<input>` block: "If `/prime` has not been run in this session, read `CLAUDE.md` first to load Layer 1 context (tech stack, conventions, AI gotchas, key files)."
- [ ] Add On-Demand Context loading step before Phase 2: "Glob `.agents/reference/*.md`. Load any doc whose name matches the feature domain (backend feature → read `backend.md`, UI feature → read `frontend.md`)."

---

### Concept #23 — Dynamic Parameters (`$ARGUMENTS`)
> Commands accept arguments to eliminate re-prompting.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Uses `$ARGUMENTS` | ✅ Present | `<objective>` references `$ARGUMENTS` as the input |
| Has `argument-hint` | ✅ Present | `<feature description \| path/to/prd.md>` |
| Handles multiple input types | ✅ Present | Phase 1 PARSE table covers 4 input types |
| PRD extraction | ✅ Present | "Read PRD, extract next pending phase" |

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `<context>` auto-loads project state, `$ARGUMENTS` in objective — but no persona, no pre-conditions, no explicit Input framing |
| **Process** | ✅ Present | 5 phases (PARSE → EXPLORE → DESIGN → GENERATE → OUTPUT) with numbered steps |
| **Output** | ✅ Present | Phase 5 defines summary block; `<success_criteria>` defines done conditions |

**Actions:**
- [ ] Add `<input>` block (or expand `<objective>`) with persona and pre-conditions

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, On-Demand Context to load, what files are available.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a senior architect..." statement |
| Pre-condition: `/prime` was run | ❌ Missing | Doesn't verify Layer 1 context is loaded |
| On-Demand Context loading | ❌ Missing | **Golden Nugget violation**: does not load `.agents/reference/backend.md` or `.agents/reference/frontend.md` before planning — these docs exist in the project and should inform the plan |
| `$ARGUMENTS` context | ✅ Present | Phase 1 PARSE handles all input types clearly |

**Actions:**
- [ ] Add persona: "You are a senior engineer analyzing this codebase to create a precise, battle-tested implementation plan."
- [ ] Add pre-condition: "If `/prime` has not been run in this session, read `CLAUDE.md` first."
- [ ] Add On-Demand Context scan: "Glob `.agents/reference/*.md`. Load docs that match the feature domain before starting Phase 2."

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified per phase, quality gates.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered/phased steps | ✅ Present | 5 clearly labeled phases |
| Tools specified | ⚠️ Partial | No explicit tool hints per phase (Phase 2 should say "use Grep, Glob, Read"; Phase 3 should say "reasoning only — no tools") |
| Intermediate quality gate | ✅ Present | Phase 2 CHECKPOINT: ≥ 3 pattern categories + MIRROR reference before proceeding |
| Implementation order logic | ✅ Present | Phase 3 defines dependency order (types → validation → services → routes → client → UI → tests) |

**Actions:**
- [ ] Add tool hints per phase:
  - Phase 1 (PARSE): "Use Read if `$ARGUMENTS` is a file path; otherwise use conversation context"
  - Phase 2 (EXPLORE): "Use Grep for pattern search, Glob for file discovery, Read for code inspection"
  - Phase 3 (DESIGN): "Reasoning only — no tools needed"
  - Phase 4 (GENERATE): "Use Write to create the plan file"
  - Phase 5 (OUTPUT): "Print to conversation — no tools needed"

---

### Concept #28 — Output Section Detail
> Structured, actionable, chainable.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Structured output format | ✅ Present | Full plan template with sections, tables, code blocks |
| Actionable tasks | ✅ Present | Each task: File, Action, Implement, Mirror, Validate |
| Output file path defined | ✅ Present | `.agents/plans/{kebab-case-name}.plan.md` |
| Summary block in Phase 5 | ✅ Present | Scope counts + key patterns |

---

### Concept #29 — Command Chaining
> `/plan` output feeds into `/implement`.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Output consumable by `/implement` | ✅ Present | Plan structure matches what `implement.md` reads (Summary, Patterns, Files, Tasks, Validation) |
| Explicit chaining instruction | ✅ Present | Phase 5 explicitly says "**Next Step**: `/implement .agents/plans/{name}.plan.md`" |

---

### Concept #33 — Vibe Planning (Meta-Loop)
> Human gives intent → AI finds docs → AI structures → Human reviews → iterate.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Accepts human intent | ✅ Present | `$ARGUMENTS` as free text or PRD |
| AI finds relevant codebase docs | ✅ Present | Phase 2 EXPLORE reads codebase for patterns |
| AI structures output | ✅ Present | Phase 4 GENERATE creates the plan template |
| Human review step | ⚠️ Partial | Phase 5 says "Next Step: `/implement`" — implies review but doesn't explicitly say "review the plan before running `/implement`" |
| Iteration support | ❌ Missing | No guidance for updating the plan if the user requests changes |

**Actions:**
- [ ] Change Phase 5 "Next Step" to: "Review the plan, then run `/implement .agents/plans/{name}.plan.md`"
- [ ] Add iteration guidance: "If the user requests changes, update the existing plan file in-place. Do not create a new plan."

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Create implementation plan with codebase analysis" — clear trigger |
| `argument-hint` | ✅ Good | `<feature description \| path/to/prd.md>` — shows input options |
| `allowed-tools` | ⚠️ Bloated | `Bash(cat:*, head:*, wc:*, ls:*, find:*)` — `cat`/`head`/`ls` covered better by `Read`/`Glob`. Recommend: `Read, Grep, Glob, Write, Bash(mkdir:*, find:*)` |

**Actions:**
- [ ] Trim `allowed-tools`: remove `Bash(cat:*)`, `Bash(head:*)`, `Bash(wc:*)`, `Bash(ls:*)`. Keep `Bash(mkdir:*)` (needed for plan directory) and `Bash(find:*)` (Phase 2 exploration).

---

## Action Plan Summary

### Priority 1 — Add Input Section with Persona + On-Demand Context (concepts #25, #26, #9)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add persona: "Senior engineer creating a precise, battle-tested implementation plan" | #26 |
| 1.2 | Add pre-condition: read `CLAUDE.md` if `/prime` hasn't run | #9, #26 |
| 1.3 | Add On-Demand Context scan: `Glob .agents/reference/*.md` before Phase 2 | #21, #26 Golden Nugget |

### Priority 2 — Enhance Plan Template (concept #5)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add `## Documentation to Reference` section to plan template | #5 |
| 2.2 | Add iteration guidance in Phase 5: update in-place, don't create new | #33 |
| 2.3 | Change Phase 5 "Next Step" to include explicit review instruction | #33 |

### Priority 3 — Add Tool Hints per Phase (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add tool hint to each phase | #27 |

### Priority 4 — Frontmatter Cleanup

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Trim `allowed-tools`: remove `cat`, `head`, `wc`, `ls` Bash variants | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — the Gold Standard reference
2. `.claude/commands/plan.md` from `nextjs-feature-flag-exercise` — the current command
3. `docs/Gold-Standard-Plan/phases/phase-2-core-commands/round-3-audit-plan.md` — this audit plan

Execute the action plan to rewrite `plan.md`:

**Rewrite `.claude/commands/plan.md`** with these requirements:

1. **Frontmatter**: Trim `allowed-tools` to: `Read, Grep, Glob, Write, Bash(mkdir:*, find:*)`. Keep `description` and `argument-hint` unchanged.

2. **Expand `<objective>`** with:
   - Persona: "You are a senior engineer analyzing this codebase to create a precise, battle-tested implementation plan."
   - Pre-condition: "If `/prime` has not been run in this session, read `CLAUDE.md` first to load project conventions, tech stack, and AI gotchas."
   - Keep the existing PLAN ONLY and CODEBASE FIRST principles.

3. **Add On-Demand Context step** inside `<process>`, before Phase 1 PARSE:
   ```
   ## Phase 0: CONTEXT — Load Layer 1 + On-Demand Docs

   1. **Verify global rules are loaded** — if `CLAUDE.md` was not read in this session, read it now.
   2. **Glob `.agents/reference/*.md`** — identify available On-Demand Context docs.
      - If the feature involves backend (routes, services, DB): read `.agents/reference/backend.md`
      - If the feature involves UI (components, API client): read `.agents/reference/frontend.md`
      - Load any other matching doc
   3. **List loaded docs** — note which On-Demand Context docs informed this plan.
   ```

4. **Add tool hints** inside each phase label (one line each):
   - Phase 1 PARSE: *(Tools: Read if `$ARGUMENTS` is a file path; conversation context otherwise)*
   - Phase 2 EXPLORE: *(Tools: Grep, Glob, Read)*
   - Phase 3 DESIGN: *(Tools: none — reasoning only)*
   - Phase 4 GENERATE: *(Tools: Write, Bash(mkdir:*))*
   - Phase 5 OUTPUT: *(Tools: none)*

5. **Add `## Documentation to Reference` section** to the plan template in Phase 4 GENERATE (after `## Metadata`, before `## Patterns to Follow`):
   ```markdown
   ## Documentation to Reference

   | Doc | Source | Relevance |
   |-----|--------|-----------|
   | `CLAUDE.md` | Global rules | Tech stack, patterns, AI gotchas |
   | `.agents/reference/backend.md` | On-Demand Context | {if loaded} |
   | `.agents/reference/frontend.md` | On-Demand Context | {if loaded} |
   | `{file:lines}` | Codebase | {pattern found in Phase 2} |
   ```

6. **Update Phase 5 OUTPUT** next step:
   - Change: `**Next Step**: \`/implement .agents/plans/{name}.plan.md\``
   - To: `**Next Step**: Review the plan, then run \`/implement .agents/plans/{name}.plan.md\``
   - Add after the summary block: "If the user requests changes, update the existing plan file in-place. Do not create a new plan."

7. **Do NOT change** Phase 1 PARSE (input type table), Phase 2 EXPLORE (pattern categories + CHECKPOINT), Phase 3 DESIGN (dependency order + risk table), or the core plan template structure (Summary, User Story, Metadata, Patterns, Files, Tasks, Validation, E2E, Acceptance).

Do NOT change any source code. Only modify `.claude/commands/plan.md`.
````

---

## Success Criteria

- [ ] `allowed-tools` trimmed — `cat`, `head`, `wc`, `ls` removed (best practice)
- [ ] Persona present in `<objective>` (concept #26)
- [ ] Pre-condition: read `CLAUDE.md` if `/prime` not run (concept #9)
- [ ] Phase 0 (CONTEXT) added with On-Demand Context scan: `Glob .agents/reference/*.md` (concepts #21, #26 Golden Nugget)
- [ ] Tool hints added per phase (concept #27)
- [ ] `## Documentation to Reference` section added to plan template (concept #5)
- [ ] Phase 5 "Next Step" includes explicit review instruction (concept #33)
- [ ] Iteration guidance: "update in-place, do not create new plan" (concept #33)
- [ ] Phase 2 CHECKPOINT unchanged (≥ 3 categories + MIRROR reference)
- [ ] Chaining to `/implement` preserved and explicit (concept #29)
- [ ] `<success_criteria>` unchanged
