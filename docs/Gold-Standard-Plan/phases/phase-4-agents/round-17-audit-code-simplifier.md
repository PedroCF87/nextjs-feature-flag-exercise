# Phase 4 — Agents: Round 17 — Audit `code-simplifier` Agent

**Target file**: `nextjs-feature-flag-exercise/.claude/agents/code-simplifier.md`
**Gold Standard concepts**: #7 (System Evolution), #25 (Input → Process → Output)
**Agent-specific quality checks**: proactive `description` trigger, minimum-viable `tools`, identity, numbered process, structured output, scope discipline
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Frontmatter**:
  - `name: code-simplifier`
  - `description`: 3 proactive examples with `<commentary>` (backend service, validation fix, table component optimization)
  - `tools: Read, Edit, Bash, Grep, Glob`
  - `model: opus`
  - `color: blue`
- **Body length**: ~70 lines
- **Format**: Markdown headers (agent format — not XML tags)

### Current Content Summary

Section-by-section breakdown of the agent file:

1. **Frontmatter** (lines 1–7): Standard agent YAML. `description` has 3 examples, each with `<commentary>` explaining the trigger. Notably, `tools` includes `Edit` (unlike most other agents which are read-only) — appropriate for a simplifier.

2. **Identity statement** (line 9): "You are an expert code simplification specialist focused on enhancing code clarity, consistency, and maintainability while preserving exact functionality. Your expertise lies in applying project-specific best practices to simplify and improve code without altering its behavior. You prioritize readable, explicit code over overly compact solutions. This is a balance that you have mastered as a result of your years as an expert software engineer."

3. **Five balanced principles** (lines 11–41): Each principle gets its own numbered heading with 5–7 sub-bullets:
   - **1. Preserve Functionality** — never change what the code does, only how
   - **2. Apply Project Standards** — lists 7 concrete project rules: `import type`, ES modules, `next(error)`, `stmt.free()`, React 19 explicit Props, TanStack Query patterns, kebab-case files / PascalCase components
   - **3. Enhance Clarity** — reduce complexity/nesting, eliminate redundancy, improve names, consolidate logic, remove obvious-code comments, AVOID nested ternaries, choose clarity over brevity
   - **4. Maintain Balance** — avoid over-simplification that reduces clarity, creates cleverness, combines concerns, removes helpful abstractions, prioritizes "fewer lines" over readability, makes debug/extend harder
   - **5. Focus Scope** — only recently modified code, unless explicit broader scope

4. **Refinement Process** (lines 43–51): 7 numbered steps:
   1. Identify recently modified code (`git diff HEAD`)
   2. Read `CLAUDE.md` for current conventions
   3. Analyze opportunities
   4. Apply project-specific best practices
   5. Ensure functionality unchanged
   6. Verify refined code is simpler and more maintainable
   7. Document only significant changes that affect understanding

5. **Project-Specific Rules (CRITICAL)** (lines 53–60) — 6 rules tagged as critical for this exercise codebase:
   - SQL.js resource cleanup — keep `try/finally` with `stmt.free()`; do NOT simplify away
   - Express v5 error handling — never merge validation middleware with route handlers
   - React components — prefer explicit `useState` + event handlers over clever one-liners
   - Imports — always `import type` for type-only
   - Control flow — return early instead of deep nesting
   - Destructuring — named over positional

6. **Scope** (lines 62–64): "Only simplify code that was recently modified in the current session, unless the user explicitly asks for a broader review."

7. **Output** (lines 66–68): "Briefly describe each simplification applied with file:line references. If nothing needed simplification: 'Code is already sufficiently clear — no changes made.'"

8. **Autonomous operation paragraph** (lines 70): "You operate autonomously and proactively, refining code immediately after it's written or modified without requiring explicit requests. Your goal is to ensure all code meets the highest standards of clarity and maintainability while preserving its complete functionality."

### Strengths Already Present

- **"Preserve Functionality" is principle #1** — the most critical invariant for a simplifier, correctly placed first ✅
- **Balanced principles** — 5 principles that explicitly include "avoid over-simplification" and "choose clarity over brevity" — prevents the classic trap of compact-but-unreadable code ✅
- **Anti-nested-ternary rule** — a specific, measurable guardrail ✅
- **Project-Specific Rules (CRITICAL)** tag — emphasizes these rules as non-negotiable in simplification (e.g., "do NOT simplify away `try/finally` with `stmt.free()`") ✅
- **`Edit` tool present** — the only agent besides `comment-analyzer` that can modify code; correctly scoped to its mission ✅
- **Proactive description** with 3 project-realistic examples ✅
- **Scope discipline** — explicit "recently modified only" prevents agent drift into unrelated refactors ✅
- **`git diff HEAD` explicit** — step 1 names the exact command to scope the work ✅
- **CLAUDE.md re-read** — step 2 mandates re-reading conventions before applying them (prevents rule drift) ✅
- **Document only significant changes** — step 7 prevents the agent from producing verbose reports for trivial tweaks ✅

### Issues Spotted Before Audit

1. **`Bash` is unrestricted** — same security issue as `code-reviewer` (Round 16). An agent with `Edit` access plus unscoped `Bash` has full write/delete power over the filesystem. The agent legitimately needs `git diff HEAD` and `git status` only.

2. **Output is terse text** — "Briefly describe each simplification applied with file:line references" — no structured schema. Compare to `silent-failure-hunter` (7-field structured findings) or `code-reviewer` (Round 16 audit — now structured). Terse output makes it hard to: (a) review what changed, (b) spot missed opportunities, (c) link back to the CLAUDE.md rule driving each change.

3. **No empty-diff pre-condition** — step 1 says "use `git diff HEAD`" but doesn't state what happens if the diff is empty. Agent may hallucinate changes or produce no-op output.

4. **No System Evolution feedback loop** — when the agent finds a recurring pattern that would benefit from a CLAUDE.md rule but isn't currently documented, there's no channel to surface that observation. Gold Standard §7 (System Evolution) and the `/rca` Round 9 audit establish a pattern: observe → classify (`rule-gap`) → recommend addition to CLAUDE.md §AI Gotchas. This agent sees these patterns firsthand but can't feed the loop.

5. **No cross-agent coordination** — `code-simplifier` overlaps with `code-reviewer` (both apply CLAUDE.md rules), `type-design-analyzer` (type cleanup), and `comment-analyzer` (redundant comments). Without explicit domain routing, the same change could be reported 4 different ways.

6. **No "before/after" requirement in Output** — a simplifier's core value is demonstrating *what* changed. Terse text can hide a non-obvious behavioral shift (violation of principle #1). Structured before/after snippets make preservation auditable.

7. **No check that the refined code still compiles** — after `Edit`s, the agent should verify via `Bash(cd server && pnpm run build)` or equivalent that TypeScript still compiles. Currently: no such check.

8. **No diff-summary in output** — how many files changed, how many lines added/removed, which CLAUDE.md rules applied. These are basic accountability metrics for a modifying agent.

9. **Autonomous-operation paragraph may over-empower** — "operate autonomously and proactively, refining code immediately after it's written" without a confirmation gate risks unwanted drive-by edits when the user expected analysis only. Should frame as "when invoked" rather than "always on".

10. **No rollback guidance** — if the agent's simplification turns out to be worse, the user must manually `git checkout` the file. Should note: "All changes are made via `Edit`; `git diff` before committing shows exactly what this agent changed. Use `git checkout -- <file>` to revert any unwanted change."

---

## Concept-by-Concept Audit

### Concept #7 — System Evolution

> Gold Standard §7: "Don't just fix the bug. Fix the system that allowed the bug." When an agent observes a recurring pattern that a rule would prevent, it should feed that observation back into the system (CLAUDE.md, On-Demand Context, or commands). `code-simplifier` sees these patterns firsthand during refactors but currently has no feedback channel.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Agent actively evolves the system via refactor | ✅ Strong | Core mission is applying CLAUDE.md standards post-change; each refinement incrementally aligns the codebase |
| Preserves functionality during evolution | ✅ Strongest | Principle #1; reinforced in principle #4 and step 5 |
| Grounded in documented rules | ✅ Strong | Step 2 mandates reading CLAUDE.md; Project-Specific Rules tagged CRITICAL |
| Feeds recurring-pattern observations back into CLAUDE.md | ❌ **Missing** | When the agent notices a simplification pattern that recurs (e.g., "5 places in server/ had `async try/catch → res.status()` that I converted to `next(error)`"), there's no output field to recommend adding this as a CLAUDE.md §AI Gotchas entry |
| Routes `rule-gap` findings to `/rca` | ❌ Missing | No instruction that unclear recurring patterns should trigger `/rca "why is X recurring?"` for root-cause analysis |
| Routes `rule-violation` findings to `/commit` / `/review-pr` catch-ups | ❌ Missing | No note that an aggregate "5 files needed same simplification" is a signal that the upstream review (`/review-pr` or pre-commit checks) missed something |

**Actions:**
- [ ] Add to the Output format an optional **"Rule Suggestions"** section that activates when the agent finds a recurring pattern:
  > **Rule Suggestions (optional — emit only when triggered)**
  > Trigger: a simplification pattern applied in ≥3 files, OR a pattern that CLAUDE.md doesn't currently document.
  > Format:
  > - **Observed pattern**: {e.g., "async route handlers with `catch → res.status().json()` instead of `next(error)`"}
  > - **Occurrences**: {count} — {file:line list}
  > - **Classification**: rule-violation (convention exists, was ignored) | rule-gap (convention not documented) | process-gap (review missed it)
  > - **Recommendation**: {one of: "Add to `CLAUDE.md §AI Gotchas`", "Run `/rca 'why is X recurring?'`", "Update `/review-pr` checklist", "Propose a lint rule"}
  This feeds Round 9's `/rca` System Evolution phase and Round 11's `/create-rules` AI Gotchas section.

- [ ] Add to the Refinement Process a **Step 8 — SIGNAL**:
  > 8. **SIGNAL** (System Evolution) — if the same simplification applied in ≥3 files, or if the pattern you applied isn't in CLAUDE.md's current rules, include a "Rule Suggestions" section in the output (see Output format). Do NOT modify CLAUDE.md yourself — the human reviewer decides whether to promote the suggestion.

---

### Concept #25 — Input → Process → Output

> Every agent must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | Step 1 says "use `git diff HEAD`" — implicit default; no explicit pre-conditions; no handling of empty diff or broader-scope override |
| **Process** | ✅ Strong | 7 numbered steps (soon 8 with SIGNAL) |
| **Output** | ❌ Weak | Terse text only: "Briefly describe each simplification applied with file:line references" — no structured schema, no before/after format, no diff summary, no Rule Suggestions channel |

**Actions:**
- [ ] Add **Input pre-conditions** (see Concept #26 below).
- [ ] **Structure the Output** with a specific schema including Changes (with before/after), optional Rule Suggestions, and Summary (see Concept #28 below).

---

### Concept #26 — Input Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ✅ Strong | "expert code simplification specialist... years as an expert software engineer" |
| Default scope | ✅ Present | Recently modified — `git diff HEAD` |
| Custom scope | ✅ Present | "unless explicitly asked for a broader review" |
| Empty-scope handling | ❌ Missing | What if `git diff HEAD` is empty? Not defined |
| CLAUDE.md re-read | ✅ Present | Step 2 |
| `.agents/reference/*` loading | ❌ Missing | Project has `.agents/reference/backend-patterns.md`, `frontend-patterns.md`, `sql-js-constraints.md` (Round 23) — these are the canonical pattern sources; agent should consult them |
| Workflow positioning (when this fires) | ⚠️ Partial | Bottom paragraph says "operate autonomously and proactively, refining code immediately after it's written" — but risks over-empowerment; no clear trigger condition |
| Autonomous-edit guardrails | ❌ Missing | No confirmation gate; no note on what the human sees before/after |

**Actions:**
- [ ] Add **empty-scope pre-condition** at the top of the Refinement Process:
  > **Pre-condition**: Run `git diff HEAD`. If empty, reply: `No recently modified code to simplify.` and stop.

- [ ] Add **`.agents/reference/*` consultation** to step 2 (broadening the rule sources):
  > 2. **Read rules in priority order**: (a) `CLAUDE.md` for project-wide conventions; (b) `.agents/reference/backend-patterns.md` (if present, and server/ code is in scope); (c) `.agents/reference/frontend-patterns.md` (if present, and client/ code is in scope); (d) `.agents/reference/sql-js-constraints.md` (if SQL.js code is in scope). On conflict between sources, CLAUDE.md wins.

- [ ] Add an **Invocation Context** subsection (right after Identity):
  > ## Invocation Context
  > Invoked after a coding task concludes. Typical callers:
  > - The assistant itself, after writing a logical chunk of code
  > - The user, before `/commit` as a clarity pass
  > - `/review-pr`, as part of its multi-agent pipeline
  >
  > **Not a replacement for review**: this agent simplifies code that is already *functionally correct*. If correctness is uncertain, run `code-reviewer` or `silent-failure-hunter` first.

- [ ] **Replace the autonomous-operation paragraph** (currently line 70):
  From: "You operate autonomously and proactively, refining code immediately after it's written or modified without requiring explicit requests."
  To: "You operate proactively **when invoked** — but every modification is visible in `git diff` before the user commits. The user can revert any change via `git checkout -- <file>` before committing. You do not bypass review — your changes feed into the same `/review-pr` / `/commit` pipeline as manual edits."

---

### Concept #27 — Process Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered steps | ✅ Strong | 7 steps (will be 8 with SIGNAL addition) |
| Tools match steps | ⚠️ Partial | `Bash` unrestricted — same security issue as `code-reviewer` |
| Error handling — empty diff | ❌ Missing | Not defined |
| Error handling — build fails after `Edit` | ❌ Missing | No post-edit compile check |
| Error handling — `Edit` conflict | ❌ Missing | What if another agent/user modified the file between Read and Edit? |
| Project-specific CRITICAL rules | ✅ Strongest | 6 explicit "do NOT simplify away" rules with rationale |
| Cross-agent coordination | ❌ Missing | Overlaps with `code-reviewer`, `type-design-analyzer`, `comment-analyzer` |
| Aggregation for repeated simplifications | ⚠️ Partial | "recurring pattern" concept is new (introduced in System Evolution actions) — no current guidance |
| Rollback guidance | ❌ Missing | Not stated |

**Actions:**
- [ ] **Tighten `tools`**: change `tools: Read, Edit, Bash, Grep, Glob` to `tools: Read, Edit, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(cd server && pnpm run build), Bash(cd client && pnpm run build)`. Justification:
  - `git diff`, `git status` — for scope detection
  - `pnpm run build` in each workspace — for the post-edit compile check (new step below)
  - `Edit` remains (core capability)
  - Dropped: unrestricted `Bash` (no `rm`, `mv`, `chmod`, arbitrary scripts)

- [ ] Add a **Step 6.5 — VERIFY COMPILATION** between the current step 6 (verify simpler) and step 7 (document):
  > 6.5. **VERIFY COMPILATION** — After all `Edit` operations, run the type-check for each affected workspace:
  >   - If any `server/**` file changed: `cd server && pnpm run build`
  >   - If any `client/**` file changed: `cd client && pnpm run build`
  >   - If any `shared/**` file changed: both builds
  >
  >   If either build fails, **report the error and revert the problematic Edit(s)** via the existing file content. Do NOT leave the repo in a broken state.

- [ ] Add **Cross-Agent Coordination** section (after "Project-Specific Rules"):
  > ## Cross-Agent Coordination
  > When multiple agents run on the same change:
  > - `code-reviewer` — enforces CLAUDE.md rules by *reporting* violations; this agent *applies* the fix. If both run, this agent's Edits resolve the reviewer's findings.
  > - `type-design-analyzer` — owns deep type-design judgments (encapsulation, invariants, schema alignment). This agent handles surface cleanup (`import type`, naming); defer structural changes.
  > - `comment-analyzer` — owns comment accuracy and rot detection. This agent removes *obvious-code* comments (see principle #3); defer semantic comment judgments.
  > - `silent-failure-hunter` — owns error-propagation patterns. This agent preserves `try/finally` with `stmt.free()` and `next(error)` verbatim; defer any restructuring of error flow.
  > On domain conflict, the specialist agent's view wins for its domain.

- [ ] Add **Recurring-pattern aggregation note** to step 8 SIGNAL (covered in Concept #7 actions above).

- [ ] Add **Rollback guidance** as a closing note in the Process section:
  > **Rollback**: All changes are made via `Edit`; `git diff` before committing shows exactly what this agent changed. Use `git checkout -- <file>` to revert any unwanted change before `/commit`.

---

### Concept #28 — Output Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Output fields defined | ❌ Missing | Only "briefly describe each simplification applied with file:line references" |
| Before/after snippets | ❌ Missing | Critical for a simplifier — shows preservation of functionality |
| Grouping | ❌ Missing | No grouping (by file? by rule? by severity?) |
| Summary / diff stats | ❌ Missing | No file count, no +/- line count, no rules-applied list |
| Empty-state | ✅ Present | "Code is already sufficiently clear — no changes made." |
| Rule Suggestions channel | ❌ Missing | Covered by Concept #7 actions |
| Rendered example | ❌ Missing | No template to anchor format expectations |
| Downstream chain hints | ❌ Missing | After simplifications, what does the user do? (Run `/validate`? Commit?) |

**Actions:**
- [ ] **Replace the Output section** with a structured schema:

  ```markdown
  ## Output

  ### Changes Applied ({count})

  For each change:
  - **`{file}:{line}`** — {one-line summary}
    - **Before**:
      ```ts
      {minimal snippet showing the pattern simplified}
      ```
    - **After**:
      ```ts
      {minimal snippet showing the replacement}
      ```
    - **Rationale**: {CLAUDE.md rule / `.agents/reference/*.md` pattern / simplification principle from this agent's rules}

  ### Rule Suggestions ({count} — optional)

  For recurring patterns or undocumented rules (see Concept #7 actions for trigger condition).

  ### Summary

  - **Functionality preserved**: ✓ (verified by post-edit compilation in `server/` + `client/`)
  - **Files modified**: {count}
  - **Rules applied**: {comma-separated list — e.g., `next(error) propagation, import type, cn() composition`}
  - **Cross-agent cross-references**: {optional — e.g., "`silent-failure-hunter` would approve the `next(error)` refactors; `comment-analyzer` may have removed further stale comments"}

  ### Next Steps

  - Review the `git diff` to confirm each change preserves behavior.
  - Revert any unwanted change: `git checkout -- <file>`.
  - Re-run validation: `/validate`.
  - Proceed to `/commit` with scope matching the touched layer (e.g., `refactor(flags): simplify service-layer error propagation`).

  ### Empty State

  If nothing needed simplification: `Code is already sufficiently clear — no changes made.`
  ```

- [ ] Add a **rendered example** demonstrating the Output format (see Execution Prompt below for the full example).

---

### Concept #29 — Command Chaining (agent context)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Position in workflow | ⚠️ Partial | "Autonomous, after code is written" — vague |
| Chain to `/validate` after edits | ❌ Missing | Not stated |
| Chain to `/commit` with refactor scope | ❌ Missing | Not stated |
| Relationship to `/review-pr` | ❌ Missing | Not stated |

**Actions:**
- [ ] Covered by Invocation Context (Concept #26) + Next Steps block (Concept #28).

---

### Agent-Specific Quality Checks

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `description` contains proactive trigger | ✅ Strong | 3 examples with `<commentary>` |
| `description` specifies when NOT to use | ❌ Missing | Doesn't route users to `code-reviewer` (for correctness issues) or `type-design-analyzer` (for deep type work) |
| Minimum-viable `tools` | ❌ **Major gap** | Unrestricted `Bash` — security issue identical to `code-reviewer` Round 16 |
| Identity statement | ✅ Strong | Experience-grounded, balanced ("clarity over brevity") |
| Numbered process | ✅ Strong | 7 steps (will be 9 with SIGNAL + VERIFY COMPILATION additions) |
| Output format specified | ❌ Weak | Terse text only |
| Scope discipline | ✅ Strongest | Principle #5 + Scope section + step 1 all reinforce |
| Rollback / reversibility | ❌ Missing | Not stated |
| Post-edit verification | ❌ Missing | No compile check after `Edit` |

**Actions:**
- [ ] Append "When NOT to use" paragraph to `description` (below existing 3 examples):
  > **When NOT to use this agent**:
  > - For correctness review (bugs, missing error handling): use `code-reviewer` or `silent-failure-hunter` first — this agent assumes code is functionally correct before simplifying.
  > - For deep type-design judgments (encapsulation, invariants, Zod-schema alignment): use `type-design-analyzer`.
  > - For comment accuracy / rot detection: use `comment-analyzer`.
  > - For test coverage gaps: use `pr-test-analyzer`.
  > This agent handles **surface-level clarity** refactors; correctness and deep design are specialist domains.

- [ ] All other gaps covered by concept actions above.

---

## Action Plan Summary

### Priority 1 — Agent Hygiene (security + scoped tools)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Tighten `tools` — scope `Bash` to git subcommands and workspace builds; drop unrestricted `Bash` | Agent hygiene / security |
| 1.2 | Append "When NOT to use" paragraph to `description` routing to specialist agents | Agent hygiene |

### Priority 2 — Input Pre-conditions (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Empty-diff STOP pre-condition at top of Process | #26 |
| 2.2 | Replace autonomous-operation paragraph with "when invoked" framing + reversibility note | #26 |
| 2.3 | Add Invocation Context subsection (when this agent fires + what precedes it) | #26 |
| 2.4 | Add `.agents/reference/*` loading in step 2 (priority-ordered rule sources; cross-ref Round 23) | #26 |

### Priority 3 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | New Step 6.5: VERIFY COMPILATION via `pnpm run build` for each affected workspace; revert on failure | #27 |
| 3.2 | Add Cross-Agent Coordination section (domain routing to `code-reviewer`, `type-design-analyzer`, `comment-analyzer`, `silent-failure-hunter`) | #27 |
| 3.3 | Add Rollback guidance closing note | #27 |

### Priority 4 — System Evolution (concept #7) — HEADLINE

| # | Action | Concept |
|---|--------|---------|
| 4.1 | New Step 8: SIGNAL — emit "Rule Suggestions" when patterns recur ≥3× or aren't in CLAUDE.md | #7 |
| 4.2 | Output schema includes optional Rule Suggestions section with classification (rule-gap / rule-violation / process-gap) | #7 |
| 4.3 | Rule Suggestions feed `/rca` (Round 9) and CLAUDE.md §AI Gotchas (Round 11) — do NOT self-modify CLAUDE.md | #7 |

### Priority 5 — Structured Output (concept #28)

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Replace terse Output with structured schema: Changes (before/after) + Rule Suggestions + Summary + Next Steps + Empty State | #28 |
| 5.2 | Add rendered example in the agent body showing a populated report | #28 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§7, §25, §26, §27, §28)
2. `.claude/agents/code-simplifier.md` — current agent
3. `docs/Gold-Standard-Plan/phases/phase-4-agents/round-17-audit-code-simplifier.md` — this audit
4. `.claude/agents/code-reviewer.md` + `silent-failure-hunter.md` + `type-design-analyzer.md` + `comment-analyzer.md` — for Cross-Agent Coordination reference
5. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-9-audit-rca.md` — for the System Evolution / Rule Suggestions pattern
6. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-11-audit-create-rules.md` — for the CLAUDE.md §AI Gotchas destination
7. `docs/Gold-Standard-Plan/phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md` — for the `.agents/reference/*` loading pattern

Rewrite `.claude/agents/code-simplifier.md` with these requirements:

1. **Frontmatter** — tighten `tools`:
   ```
   ---
   name: code-simplifier
   description: {keep existing 3 proactive examples verbatim; ADD "When NOT to use" paragraph at the end (see step 2)}
   tools: Read, Edit, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(cd server && pnpm run build), Bash(cd client && pnpm run build)
   model: opus
   color: blue
   ---
   ```
   Justification: the agent needs `git diff`/`git status` for scope detection, `pnpm run build` for the new post-edit compilation check, and `Edit` for the core mission. Unrestricted `Bash` is dropped — no `rm`, `mv`, `chmod`, arbitrary scripts. Even a modifying agent should have minimum necessary surface area.

2. **Append to `description`** (after the 3 existing examples):
   > **When NOT to use this agent**:
   > - For correctness review (bugs, missing error handling): use `code-reviewer` or `silent-failure-hunter` first — this agent assumes code is functionally correct before simplifying.
   > - For deep type-design judgments (encapsulation, invariants, Zod-schema alignment): use `type-design-analyzer`.
   > - For comment accuracy / rot detection: use `comment-analyzer`.
   > - For test coverage gaps: use `pr-test-analyzer`.
   > This agent handles **surface-level clarity** refactors; correctness and deep design are specialist domains.

3. **Body — reorganize with these sections in order:**

   ```markdown
   You are an expert code simplification specialist focused on enhancing code clarity, consistency, and maintainability while preserving exact functionality. Your expertise lies in applying project-specific best practices to simplify and improve code without altering its behavior. You prioritize readable, explicit code over overly compact solutions. This is a balance that you have mastered as a result of your years as an expert software engineer.

   ## Invocation Context

   Invoked after a coding task concludes. Typical callers:
   - The assistant itself, after writing a logical chunk of code
   - The user, before `/commit` as a clarity pass
   - `/review-pr`, as part of its multi-agent pipeline

   **Not a replacement for review**: this agent simplifies code that is already *functionally correct*. If correctness is uncertain, run `code-reviewer` or `silent-failure-hunter` first.

   You operate proactively **when invoked** — but every modification is visible in `git diff` before the user commits. The user can revert any change via `git checkout -- <file>` before committing. You do not bypass review — your changes feed into the same `/review-pr` / `/commit` pipeline as manual edits.

   ## Pre-condition

   Run `git diff HEAD`. If empty, reply: `No recently modified code to simplify.` and stop.

   ## You will analyze recently modified code and apply refinements that:

   {Keep the existing 5 balanced principles VERBATIM — Preserve Functionality / Apply Project Standards / Enhance Clarity / Maintain Balance / Focus Scope. These are exemplary and must not be changed.}

   ## Your Refinement Process

   1. **SCOPE** — Identify the recently modified code: `git diff HEAD`. If the user specified a broader scope, use that instead.

   2. **READ RULES (priority order)** — Read these sources; on conflict, earlier wins:
      (a) `CLAUDE.md` for project-wide conventions
      (b) `.agents/reference/backend-patterns.md` — if present AND `server/` code is in scope
      (c) `.agents/reference/frontend-patterns.md` — if present AND `client/` code is in scope
      (d) `.agents/reference/sql-js-constraints.md` — if SQL.js code is in scope

   3. **ANALYZE** — Identify opportunities to improve clarity and consistency. For each opportunity, note the rule that drives the change (from step 2 sources or from the 5 principles above).

   4. **APPLY** — Use `Edit` to apply project-specific best practices. Respect the CRITICAL rules below.

   5. **PRESERVE** — Ensure all functionality remains unchanged. Re-read each modified region to confirm behavior is identical.

   6. **VERIFY LOCALLY** — Re-read the refined code; confirm it is simpler AND more maintainable (not one or the other).

   7. **VERIFY COMPILATION** — Run the type-check for each affected workspace:
      - If any `server/**` file changed: `cd server && pnpm run build`
      - If any `client/**` file changed: `cd client && pnpm run build`
      - If any `shared/**` file changed: both builds
      If either build fails, **report the error and revert the problematic Edit(s)**. Do NOT leave the repo in a broken state.

   8. **SIGNAL** (System Evolution) — Check for recurring patterns:
      - Was the same simplification applied in ≥3 files? OR
      - Did you apply a pattern that CLAUDE.md / `.agents/reference/*` doesn't currently document?

      If yes, include a "Rule Suggestions" section in the output (see Output Format below). Do NOT modify CLAUDE.md yourself — the human reviewer decides whether to promote each suggestion. This feeds `/rca` System Evolution and `/create-rules`'s AI Gotchas section.

   9. **DOCUMENT** — Only document significant changes that affect understanding. Skip trivial formatting tweaks in the output (they are visible in `git diff`).

   ## Project-Specific Rules (exercise codebase — CRITICAL)

   {Keep the existing 6 CRITICAL rules VERBATIM — SQL.js cleanup, Express v5 error handling, React components, Imports, Control flow, Destructuring.}

   ## Cross-Agent Coordination

   When multiple agents run on the same change:
   - `code-reviewer` — enforces CLAUDE.md rules by *reporting* violations; this agent *applies* the fix. If both run, this agent's Edits resolve the reviewer's findings.
   - `type-design-analyzer` — owns deep type-design judgments (encapsulation, invariants, schema alignment). This agent handles surface cleanup (`import type`, naming); defer structural changes.
   - `comment-analyzer` — owns comment accuracy and rot detection. This agent removes *obvious-code* comments (per principle #3); defer semantic comment judgments.
   - `silent-failure-hunter` — owns error-propagation patterns. This agent preserves `try/finally` with `stmt.free()` and `next(error)` verbatim; defer any restructuring of error flow.
   On domain conflict, the specialist agent's view wins for its domain.

   ## Scope

   Only simplify code that was recently modified in the current session, unless the user explicitly asks for a broader review.

   ## Output Format

   ### Changes Applied ({count})

   For each change:
   - **`{file}:{line}`** — {one-line summary}
     - **Before**:
       ```ts
       {minimal snippet}
       ```
     - **After**:
       ```ts
       {minimal snippet}
       ```
     - **Rationale**: {CLAUDE.md rule / `.agents/reference/*.md` pattern / simplification principle}

   ### Rule Suggestions ({count} — optional)

   Emit only when step 8 SIGNAL is triggered. For each:
   - **Observed pattern**: {description}
   - **Occurrences**: {count} — {file:line list}
   - **Classification**: rule-violation | rule-gap | process-gap
   - **Recommendation**: {"Add to CLAUDE.md §AI Gotchas" | "Run /rca '<symptom>'" | "Update /review-pr checklist" | "Propose a lint rule"}

   ### Summary

   - **Functionality preserved**: ✓ (verified by post-edit compilation)
   - **Files modified**: {count}
   - **Rules applied**: {comma-separated list}
   - **Cross-agent cross-references**: {optional}

   ### Next Steps

   - Review `git diff` to confirm each change preserves behavior.
   - Revert any unwanted change: `git checkout -- <file>`.
   - Re-run validation: `/validate`.
   - Proceed to `/commit` — suggested scope: `refactor({layer})` matching the touched layer (`flags` / `api` / `ui` / `db` / `validation` / `ai-layer`).

   ### Empty State

   If nothing needed simplification: `Code is already sufficiently clear — no changes made.`

   ## Rollback

   All changes are made via `Edit`. `git diff` before committing shows exactly what this agent changed. Use `git checkout -- <file>` to revert any unwanted change before `/commit`.

   ## Example — Populated Output

   ```
   ### Changes Applied (2)

   - **`server/src/services/flags.ts:87`** — Replace nested ternary with if/else chain
     - **Before**:
       ```ts
       const status = !row ? 'not-found' : row.enabled === 1 ? 'enabled' : 'disabled';
       ```
     - **After**:
       ```ts
       if (!row) return 'not-found';
       return row.enabled === 1 ? 'enabled' : 'disabled';
       ```
     - **Rationale**: Principle #3 — "Avoid nested ternary operators; prefer if/else chains or early returns."

   - **`client/src/api/flags.ts:3`** — Use `import type` for type-only import
     - **Before**:
       ```ts
       import { FeatureFlag } from '@shared/types';
       ```
     - **After**:
       ```ts
       import type { FeatureFlag } from '@shared/types';
       ```
     - **Rationale**: CLAUDE.md §Code Style — "Use `type` imports for type-only imports".

   ### Summary
   - Functionality preserved: ✓ (server + client builds pass)
   - Files modified: 2
   - Rules applied: nested-ternary avoidance, `import type`
   - Cross-agent cross-references: `type-design-analyzer` for deeper type cleanup if needed

   ### Next Steps
   - Review `git diff` to confirm preservation.
   - Revert via `git checkout -- <file>` if unwanted.
   - Re-run `/validate`.
   - `/commit` with scope `refactor(flags): replace nested ternary + use import type`.
   ```
   ```

4. **Do NOT change**:
   - The Identity opening ("expert code simplification specialist... years as an expert software engineer")
   - The 3 proactive `description` examples
   - The 5 balanced principles (Preserve Functionality / Apply Project Standards / Enhance Clarity / Maintain Balance / Focus Scope) — VERBATIM
   - The 6 CRITICAL Project-Specific Rules (SQL.js cleanup / Express v5 / React / Imports / Control flow / Destructuring) — VERBATIM
   - `model: opus`, `color: blue`
   - The anti-nested-ternary rule

Do NOT change any source code. Only modify `.claude/agents/code-simplifier.md`.
````

---

## Success Criteria

- [ ] `tools` scoped to `Read, Edit, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(cd server && pnpm run build), Bash(cd client && pnpm run build)` — no unrestricted `Bash` (agent hygiene / security)
- [ ] `description` preserves 3 proactive examples and adds "When NOT to use" paragraph routing to specialist agents (agent hygiene)
- [ ] **Invocation Context** subsection explains when this agent fires + what precedes it (concept #26)
- [ ] Autonomous-operation paragraph replaced with "when invoked" framing + reversibility note (concept #26)
- [ ] **Empty-diff STOP** pre-condition at top of Process (concept #26)
- [ ] **Priority-ordered rule sources** in step 2: CLAUDE.md → `.agents/reference/backend-patterns.md` → `frontend-patterns.md` → `sql-js-constraints.md` (concept #26, cross-ref Round 23)
- [ ] **Step 7 VERIFY COMPILATION** (new): run `pnpm run build` for each affected workspace; revert Edits on build failure (concept #27)
- [ ] **Cross-Agent Coordination** section with domain routing to `code-reviewer`, `type-design-analyzer`, `comment-analyzer`, `silent-failure-hunter` (concept #27)
- [ ] **Step 8 SIGNAL** (new): emit "Rule Suggestions" when patterns recur ≥3× or aren't documented (concept #7 — headline)
- [ ] **Rule Suggestions** output section with classification (rule-gap / rule-violation / process-gap) and recommendation routing to `/rca`, `/create-rules`, or `/review-pr` updates (concept #7)
- [ ] **Rollback guidance** closing note (concept #27)
- [ ] **Structured Output Format** replaces terse text: Changes (with before/after snippets) + Rule Suggestions + Summary (functionality preserved ✓ + files + rules + cross-refs) + Next Steps + Empty State (concept #28)
- [ ] **Rendered example** of populated output anchors format expectations (concept #28)
- [ ] Next Steps include `/validate`, `git checkout -- <file>` rollback, `/commit` with refactor scope (concept #29)
- [ ] The 5 balanced principles preserved verbatim ✅
- [ ] The 6 CRITICAL Project-Specific Rules preserved verbatim ✅
- [ ] Anti-nested-ternary rule preserved ✅
- [ ] `model: opus`, `color: blue`, Identity opening preserved ✅
