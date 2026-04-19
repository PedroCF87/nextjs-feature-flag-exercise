# Phase 2 — Core 4 Commands: Round 4 — Audit `/implement` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/implement.md`
**Gold Standard concepts**: #2, #6, #14, #23, #25, #26, #27, #29
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~210
- **Frontmatter**: `allowed-tools: Read, Write, Edit, Grep, Glob, Bash` (unrestricted Bash), `description: Execute an implementation plan with validation loops`, `argument-hint: <path/to/plan.md>`
- **Format**: XML-style tags (`<objective>`, `<context>`, `<process>`, `<success_criteria>`)
- **Structure**: 5 phases — LOAD → PREPARE → EXECUTE → VALIDATE → REPORT

### Current Content Summary
1. **`<objective>`**: Golden Rule (no broken state) + Validation Loop principle
2. **`<context>`**: Auto-checks plan existence, current branch, git status, available scripts
3. **Phase 1 — LOAD**: Extracts Summary, Patterns, Files, Tasks, Validation Commands, E2E from plan file — stops if plan not found
4. **Phase 2 — PREPARE**: Git state decision table (feature branch / default branch × clean / dirty)
5. **Phase 3 — EXECUTE**: Per-task loop with 3.1 Verify Assumptions → 3.2 Implement → 3.3 Validate Immediately → 3.4 Track Progress
6. **Phase 4 — VALIDATE**: Full suite + mandatory tests + **E2E Hard Gate** ("Do NOT proceed to Phase 5 until E2E passes")
7. **Phase 5 — REPORT**: Creates `.agents/reports/{name}-report.md`, archives plan to `completed/`, **chains to `/commit`** ✅

### Strengths Already Present
- **Phase 3.1 Verify Assumptions** — reads target file + adjacent files + verifies plan references before coding (already covers concept #14 criteria 2 and 3)
- **After-EVERY-task validation** — prevents broken state accumulation
- **E2E Hard Gate** — stronger than most implementations
- **Explicit `/commit` chaining** in Phase 5 ("Run: /commit") ✅
- **Deviation documentation** — tracks and explains any deviations from plan
- **Plan archiving** to `completed/` after implementation

---

## Concept-by-Concept Audit

### Concept #2 — Core 4: `/implement` Purpose
> Execute the plan task by task.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Is a Core 4 command (maps to `/execute`) | ✅ Present | Exists as `.claude/commands/implement.md` |
| Accepts plan file as input | ✅ Present | `$ARGUMENTS` with `argument-hint: <path/to/plan.md>` |
| Executes plan task by task | ✅ Present | Phase 3 iterates tasks with 4-step sub-loop per task |
| Validation loop after each task | ✅ Present | Phase 3.3 validates after every task — "If fails, fix before moving on" |

---

### Concept #6 — PIV Loop — Implementing Phase
> `/implement` bridges Planning (receives plan) and Validating (produces tested code for `/commit`).

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Receives from Planning phase (`/plan` output) | ✅ Present | Phase 1 LOAD reads plan file — knows the format |
| Transitions to Validating phase (`/commit`) | ✅ Present | Phase 5 explicitly says "Run: /commit" |
| PIV Loop positioning is explicit | ❌ Missing | No statement that this is the "Implementing" step of the PIV Loop |

**Actions:**
- [ ] Add PIV positioning to `<objective>`: "This is the **Implementing** phase of the PIV Loop — receives plan from `/plan`, produces validated code, then chains to `/commit`."

---

### Concept #14 — Trust but Verify Monitoring
> During execution, agent must self-monitor across four criteria.

| Criterion | Status | Evidence |
|-----------|--------|----------|
| **Uses your tools correctly** | ⚠️ Partial | No explicit tool hints per phase — relies on broad `Bash` permission |
| **Reading/editing the right files** | ✅ Present | Phase 3.1 explicitly reads target file + adjacent files + verifies plan references before editing |
| **Managing tasks properly** | ✅ Present | Phase 3.4 Track Progress with ✅/🔧 status per task; deviations documented |
| **Produces "thinking tokens"** | ❌ Missing | No instruction to articulate understanding before coding — agent jumps from 3.1 Verify to 3.2 Implement without externalizing its approach |

**Actions:**
- [ ] Add a "Thinking Tokens" step between 3.1 and 3.2: "Before writing code, state in one sentence: which MIRROR pattern you'll follow and why. This proves context understanding."

---

### Concept #23 — Dynamic Parameters (`$ARGUMENTS`)
> Commands accept arguments to eliminate re-prompting.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Uses `$ARGUMENTS` | ✅ Present | `<objective>` references `$ARGUMENTS` as plan path |
| Has `argument-hint` | ✅ Present | `<path/to/plan.md>` |
| Handles missing argument | ✅ Present | Phase 1: "Plan not found at $ARGUMENTS — Create a plan first: /plan" + STOP |

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `<context>` auto-loads plan existence + git state (good) — but no persona, no PIV positioning, no On-Demand Context loading from the plan |
| **Process** | ✅ Present | 5 labeled phases with sub-steps, decision tables, and hard gates |
| **Output** | ✅ Present | Phase 5 defines report format; next step explicitly chains to `/commit` |

**Actions:**
- [ ] Add persona to `<objective>`
- [ ] Add On-Demand Context loading from plan's `## Documentation to Reference` section (if present after `/plan` changes)

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, On-Demand docs to load.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a senior engineer executing a plan precisely as designed" |
| Pre-condition: plan from `/plan` | ⚠️ Partial | Phase 1 stops if plan not found — but no framing that this command requires `/plan` to have been run first |
| PIV positioning | ❌ Missing | Not identified as the Implementing phase of PIV |
| On-Demand Context from plan | ❌ Missing | If the plan has `## Documentation to Reference`, those docs should be loaded before Phase 3 |

**Actions:**
- [ ] Add persona: "You are a senior engineer. Your role is to execute the plan precisely — not redesign it. Raise deviations explicitly rather than silently adapting."
- [ ] Add On-Demand Context instruction: "After Phase 1 LOAD, check if plan has `## Documentation to Reference`. If so, read those docs before starting Phase 3."

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling, quality gates.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered/phased steps | ✅ Present | 5 phases with clear sub-steps (3.1, 3.2, 3.3, 3.4) |
| Tools specified per phase | ⚠️ Partial | `allowed-tools` lists tools globally but no per-phase tool hints |
| Unrestricted Bash | ⚠️ Risk | `allowed-tools: Bash` (no restrictions) — should be scoped to safe operations |
| Error handling: fix root cause | ✅ Present | "Fix the root cause (not a workaround)" |
| Plan validity check | ❌ Missing | No check that plan contains required sections (Tasks, Validation Commands) before executing |
| After-task validation | ✅ Present | Phase 3.3 runs validation after every task |
| E2E Hard Gate | ✅ Present | "Do NOT proceed to Phase 5 until E2E passes" |

**Actions:**
- [ ] Add plan validity check to Phase 1 LOAD: "Verify plan contains: Tasks, Validation Commands (or CLAUDE.md fallback). If Tasks section is missing, STOP and ask user to complete the plan."
- [ ] Scope `allowed-tools`: replace `Bash` with `Bash(git:*, pnpm:*, cd:*, mkdir:*)` — covers git ops, running scripts, and directory creation without unrestricted shell access

---

### Concept #29 — Command Chaining
> Receives `/plan` output; chains to `/commit`.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Receives `/plan` output | ✅ Present | Phase 1 LOAD knows the plan sections format |
| Explicitly chains to `/commit` | ✅ Present | Phase 5 says "Ready to commit. Run: /commit" |
| PIV chain closure explicit | ❌ Missing | No acknowledgment that after `/commit` comes `/create-pr` |

**Actions:**
- [ ] Expand Phase 5 Next Step: "Ready to commit. Run `/commit`, then `/create-pr` to open a pull request."

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Execute an implementation plan with validation loops" — clear trigger |
| `argument-hint` | ✅ Good | `<path/to/plan.md>` — explicit |
| `allowed-tools` | ⚠️ Risk | `Bash` with no restrictions — unsafe pattern |

**Actions:**
- [ ] Scope `allowed-tools` to: `Read, Write, Edit, Grep, Glob, Bash(git:*, pnpm:*, cd:*, mkdir:*)`

---

## Action Plan Summary

### Priority 1 — Add PIV Positioning + Persona (concepts #6, #25, #26)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add PIV positioning to `<objective>`: Implementing phase, receives from `/plan`, chains to `/commit` | #6 |
| 1.2 | Add persona: "Execute the plan precisely — not redesign it. Raise deviations explicitly." | #26 |
| 1.3 | Add On-Demand Context loading after Phase 1: read `## Documentation to Reference` if present | #26 |

### Priority 2 — Add Thinking Tokens (concept #14)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add step between 3.1 and 3.2: state MIRROR pattern + rationale before writing code | #14 |

### Priority 3 — Harden Process (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add plan validity check in Phase 1: Tasks section must exist | #27 |
| 3.2 | Expand Phase 5 Next Step: `/commit` then `/create-pr` | #29 |

### Priority 4 — Frontmatter Cleanup

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Scope `allowed-tools` Bash to: `git:*, pnpm:*, cd:*, mkdir:*` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — the Gold Standard reference
2. `.claude/commands/implement.md` from `nextjs-feature-flag-exercise` — the current command
3. `docs/Gold-Standard-Plan/phases/phase-2-core-commands/round-4-audit-implement.md` — this audit plan

Execute the action plan to rewrite `implement.md`:

**Rewrite `.claude/commands/implement.md`** with these requirements:

1. **Frontmatter**: Change `allowed-tools` to:
   `Read, Write, Edit, Grep, Glob, Bash(git:*, pnpm:*, cd:*, mkdir:*)`
   Keep `description` and `argument-hint` unchanged.

2. **Expand `<objective>`** with:
   - PIV positioning: "This is the **Implementing** phase of the PIV Loop — receives plan from `/plan`, produces validated code, then chains to `/commit`."
   - Persona: "Execute the plan precisely — not redesign it. Raise deviations explicitly rather than silently adapting."
   - Keep existing Golden Rule and Validation Loop principles.

3. **Expand Phase 1 LOAD** — add validity check after extraction:
   > **Plan validity check**: Verify the plan contains a `## Tasks` section. If Tasks are missing, STOP:
   > "Plan is incomplete — no Tasks section found. Complete the plan first."
   >
   > After loading, check if plan has `## Documentation to Reference`. If so, read those docs before Phase 3.

4. **Add Thinking Tokens step** inside Phase 3, between steps 3.1 and 3.2:
   ```
   ### 3.2 State Approach (Thinking Tokens)

   Before writing any code, state in one sentence:
   - Which MIRROR pattern you will follow
   - Why it fits this task

   Example: "Following the pattern in `server/src/services/flags.ts:45-60` — same SQL.js try/finally structure."

   This step is mandatory. It proves understanding before implementation begins.
   ```
   (Renumber the existing 3.2 Implement to 3.3, and so on.)

5. **Expand Phase 5 REPORT — Next Step**:
   Change "Ready to commit. Run: /commit"
   To: "Ready to commit. Run `/commit` to create a conventional commit, then `/create-pr` to open a pull request."

6. **Do NOT change** Phase 2 PREPARE (git state table), Phase 3 Verify Assumptions (3.1), Phase 4 VALIDATE (full suite + tests + E2E Hard Gate), or `<success_criteria>`.

Do NOT change any source code. Only modify `.claude/commands/implement.md`.
````

---

## Success Criteria

- [ ] `allowed-tools` scoped — Bash restricted to `git:*, pnpm:*, cd:*, mkdir:*` (best practice)
- [ ] PIV Loop positioning in `<objective>`: "Implementing phase — receives from `/plan`, chains to `/commit`" (concept #6)
- [ ] Persona present: "Execute precisely — not redesign. Raise deviations explicitly." (concept #26)
- [ ] On-Demand Context loading after Phase 1: reads `## Documentation to Reference` if present (concept #26)
- [ ] Plan validity check in Phase 1: Tasks section must exist (concept #27)
- [ ] Thinking Tokens step present between Verify Assumptions and Implement (concept #14)
- [ ] Phase 5 Next Step chains to `/commit` then `/create-pr` (concept #29)
- [ ] Phase 3.1 Verify Assumptions unchanged (already covers concepts #14 criteria 2 and 3)
- [ ] E2E Hard Gate unchanged (concept #27)
- [ ] `<success_criteria>` unchanged
