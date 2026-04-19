# Phase 4 — Agents: Round 18 — Audit `silent-failure-hunter` Agent

**Target file**: `nextjs-feature-flag-exercise/.claude/agents/silent-failure-hunter.md`

**Gold Standard concepts**: #17 (Misconceptions AI Has With Your Project), #25 (Input → Process → Output)

**Agent-specific quality checks**: proactive `description` trigger, minimum-viable `tools`, identity, numbered process, structured output

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Frontmatter**:
  - `name: silent-failure-hunter`
  - `description`: 3 proactive examples with `<commentary>` (Express route error handling, SQL.js service methods, validation middleware catch blocks) + explicit project rationale ("Critical for this project because Express v5 requires next(error) propagation")
  - `model: opus`
  - `tools: Read, Grep, Glob`
  - `color: red`
- **Body length**: ~157 lines — the **most detailed agent** in the codebase
- **Format**: Markdown headers (agent format)

### Current Content Summary

Section-by-section breakdown of the agent file:

1. **Frontmatter** (lines 1–7): Exceptional `description` — 3 realistic examples, each with `<commentary>` explaining the project-specific trigger. Unusual in that the description text itself names the root cause ("Express v5 requires next(error) propagation") — this educates callers as they invoke.

2. **Identity statement** (line 9): "You are an elite error handling auditor with zero tolerance for silent failures and inadequate error handling. Your mission is to protect users from obscure, hard-to-debug issues by ensuring every error is properly surfaced, propagated, and actionable."

3. **Core Principles** (lines 11–21) — 5 non-negotiable rules:
   - Silent failures are unacceptable
   - Express v5 routes must use `next(error)`
   - SQL.js `stmt.free()` must run in `finally`
   - Catch blocks must be specific
   - Custom error classes define the contract (`NotFoundError`, `ConflictError`, `ValidationError`)

4. **Your Review Process** (lines 23–88) — 4 sub-steps:
   - **Step 1 — Identify All Error Handling Code** (lines 25–33): 7 patterns to locate (try/catch, try/finally, .catch(), conditional branches, fallback logic, error logging without propagation, optional chaining masking errors, empty catch blocks)
   - **Step 2 — Scrutinize Each Error Handler** (lines 35–68): Four categories with domain-specific questions:
     - Express Route Handlers (CRITICAL): `next(error)` vs manual response vs double-response
     - SQL.js Service Methods (CRITICAL): `stmt.free()` location, leak scenarios
     - Zod Validation (CRITICAL): parse failures → ValidationError → `next(error)` propagation
     - Catch Block Specificity: expected vs hidden errors, type guards
     - Error Propagation: bubble up vs catch-here decisions, custom error transformation
   - **Step 3 — Check for Hidden Failures** (lines 70–78): 6 patterns that hide errors (empty catches, console.log + continue, null defaults, `?.` silent skip, `|| defaultValue`, silent retry exhaustion)
   - **Step 4 — Project-Specific Patterns** (lines 80–132): Side-by-side Correct vs WRONG code for:
     - Express route handler (correct: `next(error)` vs wrong: `res.status(500).json(...)`)
     - SQL.js statement management (correct: `try/finally` vs wrong: `stmt.free()` after use without `finally`)
     - Service error propagation (correct: throw custom error + route does `next(error)`)

5. **Output Format** (lines 134–144) — 7-field structured output per issue:
   1. Location (file:line)
   2. Severity (CRITICAL / HIGH / MEDIUM)
   3. Issue Description
   4. Hidden Errors (specific types that could be caught and hidden)
   5. User Impact (debugging and visibility impact)
   6. Recommendation (specific code changes)
   7. Example (corrected pattern)

6. **Your Tone** (lines 146–155): 5 tonal instructions — thorough, skeptical, uncompromising. Uses phrases like "This catch block could hide...", "This bypasses the error middleware...", "This statement leaks when...". Acknowledges good patterns. Includes empty-state message: "✓ No silent failure patterns detected. All errors properly propagated via next(error), all SQL.js statements freed in finally blocks."

### Strengths Already Present

- **Description carries project-specific rationale in-line** — "Critical for this project because Express v5 requires next(error) propagation" teaches callers why this agent exists, not just when to use it ✅
- **"Zero tolerance" positioning** — establishes this agent's uncompromising role in the ecosystem ✅
- **5 non-negotiable Core Principles** — each stated as an invariant, not a suggestion ✅
- **Read-only `tools`** (`Read, Grep, Glob`) — exemplary; correctly scoped to an auditing agent that never modifies code ✅
- **Side-by-side Correct/WRONG code examples** for Express v5, SQL.js, and service propagation — the **single strongest teaching moment in the entire codebase** ✅
- **Domain-specific scrutiny questions** — not generic "check error handling"; instead asks about double-responses, statement leaks between `prepare` and `finally`, Zod parse message preservation ✅
- **Hidden-failure checklist** — 6 patterns that *specifically* hide errors (not just "review error handling") ✅
- **Structured output** — 7 fields, severity ladder (CRITICAL / HIGH / MEDIUM), concrete recommendation + example ✅
- **Specific tonal guidance** — "Use phrases like 'This catch block could hide...'" — models the exact register the agent should use ✅
- **Acknowledgment of good patterns** — tone instruction explicitly includes "Acknowledge when error handling is done well" — prevents purely negative reports ✅
- **Exemplary empty-state message** — names the specific patterns that were verified, not generic "no issues found" ✅

### Issues Spotted Before Audit

1. **No scope pre-condition** — the agent jumps into "Systematically locate" without defining what scope. If `git diff HEAD` is empty and no scope is passed, behavior is undefined.

2. **No Invocation Context** — not stated when this agent fires. Is it post-implementation? Pre-commit? Within `/review-pr`? Proactively triggered on catch-block changes? The `description` examples suggest the latter, but no formal positioning.

3. **No `.agents/reference/*` loading** — project has `.agents/reference/backend-patterns.md` and `.agents/reference/sql-js-constraints.md` (Round 23 audit) — exactly this agent's domain. The agent embeds its own patterns (correctly) but doesn't consult the canonical on-demand docs, which could drift independently.

4. **No System Evolution signal** — when the same silent-failure pattern recurs across many files, it indicates either a `rule-violation` (CLAUDE.md has the rule, was ignored in review) or a `process-gap` (upstream review missed it systemically). Gold Standard §17 / §7 establish a feedback loop to `/rca` and CLAUDE.md §AI Gotchas. Round 9 (`/rca`) and Round 17 (`code-simplifier`) both added this channel. This agent — which catches exactly the patterns that become AI Gotchas — has no such channel.

5. **No cross-agent coordination** — overlaps with `code-reviewer` (Round 16 — general checklist mentions `next(error)` and `stmt.free()`), `code-simplifier` (Round 17 — preserves these patterns during refactors), `type-design-analyzer` (catches Zod validation via validation schemas). Without coordination, same issues may be reported multiple times.

6. **No rendered example in output format** — the 7 fields are defined but no concrete rendered finding is shown. Agents like `code-reviewer` (Round 16) and `type-design-analyzer` have templates; this one doesn't.

7. **Aggregation not addressed** — if 10 routes share the same missing-`next(error)` pattern (common after a refactor), all 10 are reported individually. Round 16 `code-reviewer` audit introduced an aggregation rule (>3 occurrences → single grouped finding) that applies here too.

8. **No "When NOT to use" in `description`** — could route users away from using this agent for non-error-handling concerns (e.g., don't use for type design, use `type-design-analyzer`).

9. **No empty-scope handling** — distinct from the scope pre-condition issue; what if scope is specified but contains no error-handling code at all? Should distinguish "no scope" from "scope has no errors" in the empty-state message.

10. **No downstream chain hints** — after reporting issues, the user has no guidance. Should chain to `/rca` for unclear root causes, `/validate` after fixes, or suggest `code-simplifier` to apply the corrected pattern.

11. **Step 4 naming inconsistent** — step 4 is titled "Project-Specific Patterns" but is really a reference library (correct/wrong examples), not a process step. Steps 1–3 are "do this"; step 4 is "here's what right looks like". This can confuse an agent trying to follow the process linearly.

12. **No post-report rollup** — after listing individual findings, no summary block (total count, severity breakdown, affected files count). Makes triage harder.

13. **`description` trigger examples don't cover refactors** — the 3 examples cover *new code*; doesn't mention running after a large refactor that might have regressed error handling (common source of silent failures).

---

## Concept-by-Concept Audit

### Concept #17 — Misconceptions AI Has With Your Project

> Gold Standard §17 names "Misconceptions AI Often Has With Your Project" as the most valuable section of CLAUDE.md. `silent-failure-hunter` is the agent that **embodies this concept** — it catches project-specific pitfalls AI tends to miss (Express v5 `next(error)`, SQL.js `stmt.free()`, Zod parse-before-logic). Its existence is itself a response to concept #17.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Addresses project-specific AI blind spots | ✅ Strongest | Express v5 `next(error)` + SQL.js `stmt.free()` are the canonical gotchas (CLAUDE.md should have §AI Gotchas — flagged in Round 1) |
| Correct/Wrong patterns for each blind spot | ✅ Strongest | 3 side-by-side pattern comparisons — the strongest teaching artifact in the codebase |
| Zero-tolerance on violations | ✅ Strong | Stated as non-negotiable principle |
| Contributes to CLAUDE.md §AI Gotchas | ⚠️ Partial | Its patterns ARE the gotchas — but there's no mechanism to promote newly-discovered patterns to CLAUDE.md. When the agent finds a *systematic* recurrence that CLAUDE.md doesn't document, it should signal that gap |
| Classifies misses (rule-violation vs rule-gap vs process-gap) | ❌ Missing | Round 9 `/rca` introduced this taxonomy; this agent should emit the same classification for recurring patterns |
| Routes recurring patterns to `/rca` | ❌ Missing | Not stated |

**Actions:**
- [ ] Add to Output Format an optional **"System Evolution"** section that activates when the same silent-failure pattern recurs ≥3 times OR when the pattern isn't in CLAUDE.md. Format:

  ```
  ## System Evolution (optional — emit only when triggered)

  **Trigger**: Same silent-failure pattern found in ≥3 files, OR the pattern isn't currently documented in CLAUDE.md §AI Gotchas / `.agents/reference/backend-patterns.md`.

  **Classification** (choose one):
  - `rule-violation` — the correct pattern is in CLAUDE.md / backend-patterns.md; it was ignored. Signal: upstream review (`/review-pr`, `code-reviewer`) didn't catch it.
  - `rule-gap` — the pattern isn't documented anywhere. The observation should be promoted to `CLAUDE.md §AI Gotchas` or `.agents/reference/backend-patterns.md`.
  - `process-gap` — the pattern is documented AND typically caught, but a specific workflow (e.g., refactor via `code-simplifier`) regressed it. Signal: the process needs a pre/post-check.

  **Recommended action**:
  - For `rule-violation`: run `/rca "why did /review-pr miss {pattern} in {N} files?"`
  - For `rule-gap`: summarize the correct pattern for addition to `CLAUDE.md §AI Gotchas`. Do NOT modify CLAUDE.md yourself — flag for human review.
  - For `process-gap`: recommend updating the specific command's checklist.

  **Example entry**:
  - **Pattern**: `catch → console.log(error) → continue (no next(error))`
  - **Occurrences**: 4 — `server/src/routes/flags.ts:42`, `:78`, `:119`, `server/src/routes/users.ts:33`
  - **Classification**: `rule-violation` (CLAUDE.md §Error Handling covers this)
  - **Recommended action**: `/rca "why did /review-pr miss 4 catch blocks that log and swallow errors?"`
  ```

- [ ] Cross-reference this in the `description` trigger list — add: "When you notice the same silent-failure pattern appearing in multiple files across a PR, this agent also produces a System Evolution classification."

---

### Concept #25 — Input → Process → Output

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | Step 1 says "Systematically locate" — no explicit scope pre-condition; no `.agents/reference/*` consultation |
| **Process** | ✅ Strong | 4 named steps (1–4), though step 4 is more reference than process |
| **Output** | ✅ Strong | 7 structured fields with severity ladder — but no rendered example, no aggregation, no System Evolution channel |

**Actions:**
- [ ] Add Input pre-conditions (see Concept #26 below).
- [ ] Rename Step 4 to clarify it's a reference library, not a process step (see Concept #27 below).
- [ ] Add rendered example, aggregation rule, and System Evolution section to Output (see Concept #28 below).

---

### Concept #26 — Input Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ✅ Strong | "elite error handling auditor with zero tolerance" |
| Default scope | ❌ Missing | Not stated — user must infer from `description` examples |
| Custom scope | ❌ Missing | Not stated |
| Empty-scope handling | ❌ Missing | Not defined |
| `.agents/reference/*` loading | ❌ Missing | Should consult `backend-patterns.md` and `sql-js-constraints.md` — the canonical pattern docs |
| CLAUDE.md re-read | ❌ Missing | Doesn't mandate re-reading CLAUDE.md for current conventions |
| Workflow positioning (when this fires) | ⚠️ Partial | `description` examples imply "after catch-block changes" but no formal Invocation Context |
| "When NOT to use" | ❌ Missing | No routing to specialist agents for non-error-handling concerns |

**Actions:**
- [ ] Add an **Invocation Context** subsection right after Identity:
  > ## Invocation Context
  >
  > Invoked whenever code that handles errors is written, modified, or reviewed. Typical callers:
  > - **Proactively by the assistant** — after implementing route handlers, service methods with SQL.js, validation middleware, or any `try/catch` logic (the `description` examples above).
  > - **After a refactor** — especially when `code-simplifier` or a manual refactor may have restructured error flow. Refactors are a common source of silent-failure regressions.
  > - **During `/review-pr`** — as part of the orchestrated multi-agent pipeline.
  > - **Post-incident**, as part of `/rca` — when a production issue is traced to a swallowed error.
  >
  > **Not a replacement for `/review-pr`** — this is a specialist error-handling audit; `/review-pr` runs multiple agents for full coverage.

- [ ] Add a **Scope** subsection before "Your Review Process":
  > ## Scope
  >
  > **Default**: `git diff HEAD` — audit recently modified code that might have introduced or regressed error handling.
  >
  > **Custom**: If the user specifies files, directories, or a commit range, audit that instead.
  >
  > **Empty-scope STOP**: If both are empty, reply `No scope provided. Specify files/directories or make changes first.` and exit.
  >
  > **No-error-handling-code case**: If the scope contains no error-handling code at all (no `try`, `catch`, `.catch(`, no SQL.js statements), emit the empty-state message tailored: `✓ Scope contains no error-handling code. Nothing to audit.`

- [ ] Add to the top of "Your Review Process" a **context-loading** step:
  > **Before Step 1**: Read these reference docs (if present) to ensure the agent's inline patterns haven't drifted:
  > - `CLAUDE.md` §Error Handling — project-wide conventions
  > - `.agents/reference/backend-patterns.md` — canonical backend patterns (Express v5, custom errors, Zod boundary)
  > - `.agents/reference/sql-js-constraints.md` — canonical SQL.js patterns (statement lifecycle, booleans as INTEGER, parameterization)
  >
  > On conflict between these sources and the inline patterns in Step 4 of this agent: the reference docs win. Flag the drift in the report so the agent's inline patterns can be updated by `/create-rules` or manual CLAUDE.md edit.

- [ ] Append **"When NOT to use"** to `description`:
  > **When NOT to use this agent**:
  > - For type-design issues (Zod schema alignment, union types vs `enum`, SQL.js INTEGER-boolean modeling): use `type-design-analyzer`.
  > - For general code-quality review: use `code-reviewer`.
  > - For comment accuracy / rot: use `comment-analyzer`.
  > - For test coverage of error paths: use `pr-test-analyzer`.
  > This agent owns **error-propagation, silent-failure detection, and resource-leak analysis** exclusively.

- [ ] Add a 4th example to `description` covering the refactor trigger:
  > <example>
  > Context: The assistant just refactored 3 service methods for clarity via `code-simplifier`.
  > user: "The refactor is done."
  > assistant: "Refactors are a common source of silent-failure regressions. Let me use the silent-failure-hunter agent to verify that `try/finally` with `stmt.free()` was preserved and `next(error)` flows still reach the centralized middleware."
  > <commentary>
  > After any non-trivial refactor to service or route code, proactively run silent-failure-hunter. The code-simplifier is strict about preserving these patterns, but a sanity audit catches regressions before they reach production.
  > </commentary>
  > </example>

---

### Concept #27 — Process Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered steps | ✅ Strong | 4 steps |
| Step naming consistency | ⚠️ Partial | Steps 1–3 are "do this"; Step 4 is a reference library — different kind of content |
| Tools match steps | ✅ Exemplary | Read, Grep, Glob — correctly read-only |
| Error handling — empty scope | ❌ Missing | Covered in Concept #26 actions |
| Error handling — ambiguous code | ❌ Missing | What if `try/catch` exists but it's unclear whether it's error handling vs control flow (e.g., JSON.parse try/catch for a validity check)? |
| Aggregation for repeated patterns | ❌ Missing | 10 routes missing `next(error)` → 10 findings |
| Cross-agent coordination | ❌ Missing | Overlaps with other agents |
| Evidence quoting | ⚠️ Implicit | Output format mentions "Location" (file:line) but doesn't mandate quoting the actual code |

**Actions:**
- [ ] Rename Step 4 from "Project-Specific Patterns" to **"Reference Library — Correct vs WRONG Patterns"** and move it OUT of the Review Process numbering. It's a lookup artifact consulted during Step 2, not a sequential step. The new structure:

  ```markdown
  ## Your Review Process

  **Pre-Step: Load Context** — re-read CLAUDE.md §Error Handling + `.agents/reference/backend-patterns.md` + `.agents/reference/sql-js-constraints.md` (if present).

  1. **LOCATE** — identify all error-handling code in scope (the 7 patterns from current Step 1)
  2. **SCRUTINIZE** — for each handler, ask the domain questions (current Step 2), consulting the Reference Library (formerly Step 4) for correct-pattern comparison
  3. **DETECT HIDDEN FAILURES** — the 6 patterns from current Step 3
  4. **CLASSIFY RECURRENCES** — if the same pattern appears ≥3 times, mark for aggregation and System Evolution classification
  5. **REPORT** — emit findings per Output Format; include System Evolution section if triggered

  ## Reference Library — Correct vs WRONG Patterns

  {current Step 4 content — Express route, SQL.js statement, service propagation — VERBATIM}
  ```

- [ ] Add **ambiguous-code guidance** to Step 2 SCRUTINIZE:
  > **Ambiguous `try/catch`**: Some `try/catch` blocks are not error-handling but validity checks (e.g., `try { JSON.parse(s) } catch { return null }` — deliberately silent). For each ambiguous case, ask:
  > - Is the "swallow" explicit and documented with a comment?
  > - Does the surrounding function clearly treat "the null return" as "not an error"?
  > - Is the caller equipped to distinguish "parse failed" from "parsed to null"?
  >
  > If all three are true, accept the pattern — rate the finding MEDIUM (instead of CRITICAL) and note "Deliberate swallow — verify the contract is explicit." If any are false, treat as a silent failure.

- [ ] Add **Aggregation Rule** after Step 3 DETECT HIDDEN FAILURES (new Step 4 CLASSIFY RECURRENCES):
  > **Aggregation**: If the same silent-failure pattern (same pattern + same fix) appears in more than 3 files, group into a single aggregated finding for the main report. Still emit the System Evolution section with classification. Example:
  >
  > ```
  > [Aggregated — 5 occurrences] Missing `next(error)` in async catch blocks
  > Files: server/src/routes/flags.ts:42, :78, :119, server/src/routes/users.ts:33, :87
  > Pattern: catch (err) { res.status(500).json({ error: err.message }); }
  > Fix (apply to all 5): catch (err) { next(err); }  // centralized middleware handles response
  > System Evolution: rule-violation (see section below)
  > ```

- [ ] Add a **Cross-Agent Coordination** section after the Reference Library:
  > ## Cross-Agent Coordination
  >
  > When multiple agents run on the same change:
  > - `code-reviewer` — does generic CLAUDE.md checklist review including `next(error)` and `stmt.free()` at the surface level. This agent (silent-failure-hunter) owns error-propagation **in depth** — if `code-reviewer` flags a pattern, this agent provides the full analysis.
  > - `code-simplifier` — refactors code preserving `try/finally` and `next(error)` verbatim; runs AFTER this agent in typical pipelines.
  > - `type-design-analyzer` — owns Zod schema alignment; this agent handles the *runtime propagation* of Zod failures via `next(error)`, not the schema design itself.
  > - `comment-analyzer` — owns comment accuracy; don't critique comments in this report.
  > - `pr-test-analyzer` — verifies tests cover error paths; this agent finds the error paths, analyzer verifies they're tested.
  >
  > **On domain conflict**: this agent wins for error-propagation, silent failures, and resource leaks. Specialist agents win in their domains.

- [ ] Add **evidence-quoting requirement** to Step 2 SCRUTINIZE:
  > **Evidence rule**: Every finding must quote the actual code at the reported `file:line` — not a paraphrase. The reader should be able to verify the issue without opening the file.

---

### Concept #28 — Output Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Output fields defined | ✅ Strong | 7 fields per finding |
| Severity ladder | ✅ Strong | CRITICAL / HIGH / MEDIUM with criteria |
| Empty-state | ✅ Strong | Names the specific patterns verified |
| Rendered example | ❌ Missing | No concrete rendered finding |
| Aggregated-finding format | ❌ Missing | Covered by Concept #27 actions |
| System Evolution channel | ❌ Missing | Covered by Concept #17 actions |
| Top-level summary | ❌ Missing | No rollup (total count, severity breakdown, affected file count) |
| Cross-agent cross-references | ❌ Missing | No mention of other specialist agents that might cover adjacent concerns |
| Downstream chain hints | ❌ Missing | After report, no next-step guidance |

**Actions:**
- [ ] Add a **rendered example** showing a populated report (2–3 findings including one aggregated) + the System Evolution section + the empty-state example. See Execution Prompt below for full content.

- [ ] Add a **top-level Summary block** at the end of the output:
  ```
  ---
  Summary:
  - Scope: {files audited}
  - References consulted: {CLAUDE.md + any .agents/reference/*.md loaded}
  - Total findings: {N}
  - Severity breakdown: CRITICAL {n} | HIGH {n} | MEDIUM {n}
  - Aggregated findings: {count}
  - System Evolution classifications: {count of rule-violations | rule-gaps | process-gaps}

  Next steps:
  - Address CRITICAL findings before `/commit`. HIGH should also be resolved pre-commit.
  - For each aggregated finding: apply the fix uniformly to all listed files.
  - If System Evolution flagged a rule-gap: summarize the correct pattern for the human to add to `CLAUDE.md §AI Gotchas` (do NOT self-modify).
  - For unclear root causes (e.g., "why did this pattern recur?"): `/rca "<symptom>"`.
  - After fixes: `/validate` to confirm the suite still passes.
  - Optional: `code-simplifier` to refine the refactored error flow.
  ```

- [ ] Update the **empty-state message** to include cross-agent context:
  > `✓ No silent failure patterns detected. All errors properly propagated via next(error), all SQL.js statements freed in finally blocks.`
  >
  > `For broader correctness review: run code-reviewer. For type-design review: type-design-analyzer. Human review still required — architectural concerns are outside this agent's scope.`

---

### Concept #29 — Command Chaining (agent context)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Position in workflow | ⚠️ Partial | Implied by `description` examples; no explicit Invocation Context |
| Chain to `/rca` for unclear patterns | ❌ Missing | Covered by Concept #17 and #28 actions |
| Chain to `/validate` after fixes | ❌ Missing | Covered by Concept #28 actions |
| Chain to `code-simplifier` | ❌ Missing | Covered by Concept #27 actions |

**Actions:**
- [ ] Covered by the Invocation Context (Concept #26) + Summary Next Steps (Concept #28) + Cross-Agent Coordination (Concept #27).

---

### Agent-Specific Quality Checks

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `description` contains proactive trigger | ✅ Strong | 3 examples with `<commentary>` + project-specific rationale |
| `description` has refactor trigger | ❌ Missing | No example covering post-refactor regression detection |
| `description` specifies when NOT to use | ❌ Missing | Covered in Concept #26 actions |
| Minimum-viable `tools` | ✅ Exemplary | Read, Grep, Glob — read-only |
| Identity statement | ✅ Strongest | "Zero tolerance" + "elite error handling auditor" |
| Numbered process | ✅ Strong | 4 steps (will be 5 with CLASSIFY RECURRENCES addition) |
| Output format specified | ✅ Strong | 7 fields + severity |
| Rendered output example | ❌ Missing | Covered in Concept #28 actions |
| Aggregation rule | ❌ Missing | Covered in Concept #27 actions |
| System Evolution signal | ❌ Missing | Covered in Concept #17 actions |
| Cross-agent coordination | ❌ Missing | Covered in Concept #27 actions |

**Actions:**
- [ ] All covered by the concept actions above.

---

## Action Plan Summary

### Priority 1 — System Evolution Feedback Loop (concept #17) — HEADLINE

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add Step 4 CLASSIFY RECURRENCES: detect patterns appearing ≥3 times or undocumented | #17, #7 |
| 1.2 | Add System Evolution output section with classification (rule-violation / rule-gap / process-gap) and recommended action routing | #17, #7 |
| 1.3 | Rule-gap findings summarize the correct pattern for human-driven CLAUDE.md §AI Gotchas addition (agent does NOT self-modify) | #17 |
| 1.4 | Rule-violation findings suggest `/rca "why did /review-pr miss {pattern}?"` | #17, cross-ref Round 9 |

### Priority 2 — Input Pre-conditions (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add Invocation Context subsection (when this agent fires: proactive, post-refactor, within `/review-pr`, post-incident) | #26 |
| 2.2 | Add Scope subsection with default (`git diff HEAD`), custom, empty-scope STOP, no-error-handling-code case | #26 |
| 2.3 | Add Pre-Step context loading: CLAUDE.md §Error Handling + `.agents/reference/backend-patterns.md` + `sql-js-constraints.md` (Round 23 integration) | #26 |
| 2.4 | Append "When NOT to use" to `description` routing to specialist agents | Agent hygiene |
| 2.5 | Add 4th `description` example covering post-refactor regression trigger | Agent hygiene |

### Priority 3 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Rename Step 4 "Project-Specific Patterns" → **"Reference Library — Correct vs WRONG Patterns"** and move OUT of numbered Process (it's reference, not sequential step) | #27 |
| 3.2 | Renumber Process: Pre-Step Load Context → 1. LOCATE → 2. SCRUTINIZE → 3. DETECT HIDDEN FAILURES → 4. CLASSIFY RECURRENCES → 5. REPORT | #27 |
| 3.3 | Add Ambiguous-Code guidance to Step 2 SCRUTINIZE (distinguish error-handling from deliberate validity-check `try/catch`) | #27 |
| 3.4 | Add Aggregation Rule in Step 4: same pattern >3× → single grouped finding | #27 |
| 3.5 | Add Cross-Agent Coordination section (domain routing to `code-reviewer`, `code-simplifier`, `type-design-analyzer`, `comment-analyzer`, `pr-test-analyzer`) | #27 |
| 3.6 | Add Evidence-quoting rule to Step 2: every finding quotes actual code at `file:line` | #27 |

### Priority 4 — Output Polish (concept #28)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Add rendered example of populated report (2-3 findings + aggregated + System Evolution) | #28 |
| 4.2 | Add rendered example of empty-state (existing message + cross-agent context addition) | #28 |
| 4.3 | Add top-level Summary block (scope, references consulted, total findings, severity breakdown, aggregated count, System Evolution count) | #28 |
| 4.4 | Add Next Steps chain hints: CRITICAL before `/commit`, `/rca` for unclear, `/validate` after fixes, `code-simplifier` for refactors | #29 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§17, §25, §26, §27, §28)
2. `.claude/agents/silent-failure-hunter.md` — current agent
3. `docs/Gold-Standard-Plan/phases/phase-4-agents/round-18-audit-silent-failure-hunter.md` — this audit
4. `.claude/agents/code-reviewer.md`, `code-simplifier.md`, `type-design-analyzer.md`, `comment-analyzer.md`, `pr-test-analyzer.md` — for Cross-Agent Coordination reference
5. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-9-audit-rca.md` — for the System Evolution / rule-violation-rule-gap-process-gap taxonomy
6. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-11-audit-create-rules.md` — for the CLAUDE.md §AI Gotchas destination
7. `docs/Gold-Standard-Plan/phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md` — for `.agents/reference/*` loading pattern

Edit `.claude/agents/silent-failure-hunter.md` with these requirements:

1. **Frontmatter** — unchanged (`tools: Read, Grep, Glob` remains exemplary).

2. **Append to `description`** — add a 4th proactive example (post-refactor) AND a "When NOT to use" paragraph:

   Add this example block (after the existing 3):
   > <example>
   > Context: The assistant just refactored 3 service methods for clarity via `code-simplifier`.
   > user: "The refactor is done."
   > assistant: "Refactors are a common source of silent-failure regressions. Let me use the silent-failure-hunter agent to verify that `try/finally` with `stmt.free()` was preserved and `next(error)` flows still reach the centralized middleware."
   > <commentary>
   > After any non-trivial refactor to service or route code, proactively run silent-failure-hunter. Even though code-simplifier is strict about preserving these patterns, a sanity audit catches regressions before they reach production.
   > </commentary>
   > </example>

   Append this paragraph:
   > **When NOT to use this agent**:
   > - For type-design issues (Zod schema alignment, union types vs `enum`, SQL.js INTEGER-boolean modeling): use `type-design-analyzer`.
   > - For general code-quality review: use `code-reviewer`.
   > - For comment accuracy / rot: use `comment-analyzer`.
   > - For test coverage of error paths: use `pr-test-analyzer`.
   > This agent owns **error-propagation, silent-failure detection, and resource-leak analysis** exclusively.

3. **Body** — reorganize with these sections in order (preserve identity, Core Principles, and the Reference Library content VERBATIM; reorganize structure):

   ```markdown
   You are an elite error handling auditor with zero tolerance for silent failures and inadequate error handling. Your mission is to protect users from obscure, hard-to-debug issues by ensuring every error is properly surfaced, propagated, and actionable.

   ## Invocation Context

   Invoked whenever code that handles errors is written, modified, or reviewed. Typical callers:
   - **Proactively by the assistant** — after implementing route handlers, service methods with SQL.js, validation middleware, or any `try/catch` logic.
   - **After a refactor** — especially when `code-simplifier` or a manual refactor may have restructured error flow. Refactors are a common source of silent-failure regressions.
   - **During `/review-pr`** — as part of the orchestrated multi-agent pipeline.
   - **Post-incident**, as part of `/rca` — when a production issue is traced to a swallowed error.

   **Not a replacement for `/review-pr`** — this is a specialist error-handling audit; `/review-pr` runs multiple agents for full coverage.

   ## Scope

   **Default**: `git diff HEAD` — audit recently modified code that might have introduced or regressed error handling.

   **Custom**: If the user specifies files, directories, or a commit range, audit that instead.

   **Empty-scope STOP**: If both are empty, reply `No scope provided. Specify files/directories or make changes first.` and exit.

   **No-error-handling-code case**: If the scope contains no error-handling code at all (no `try`, `catch`, `.catch(`, no SQL.js statements), emit: `✓ Scope contains no error-handling code. Nothing to audit.` and exit.

   ## Core Principles

   {Keep the existing 5 non-negotiable principles VERBATIM.}

   ## Your Review Process

   **Pre-Step: LOAD CONTEXT** — Read these reference docs (if present) to ensure the agent's inline patterns haven't drifted:
   - `CLAUDE.md` §Error Handling — project-wide conventions
   - `.agents/reference/backend-patterns.md` — canonical backend patterns (Express v5, custom errors, Zod boundary)
   - `.agents/reference/sql-js-constraints.md` — canonical SQL.js patterns (statement lifecycle, booleans as INTEGER, parameterization)

   On conflict between these sources and the Reference Library below: the reference docs win. Flag the drift in the report so the agent's inline patterns can be updated by `/create-rules` or manual CLAUDE.md edit.

   ### 1. LOCATE — Identify All Error-Handling Code

   {Keep the existing Step 1 content — 7 patterns to locate — VERBATIM.}

   ### 2. SCRUTINIZE — Analyze Each Error Handler

   {Keep the existing Step 2 content — 4 categories (Express Route / SQL.js / Zod / Catch Specificity / Error Propagation) — VERBATIM.}

   **Evidence rule**: Every finding must quote the actual code at the reported `file:line` — not a paraphrase. The reader should be able to verify the issue without opening the file.

   **Ambiguous `try/catch`**: Some `try/catch` blocks are not error-handling but validity checks (e.g., `try { JSON.parse(s) } catch { return null }` — deliberately silent). For each ambiguous case, ask:
   - Is the "swallow" explicit and documented with a comment?
   - Does the surrounding function clearly treat "the null return" as "not an error"?
   - Is the caller equipped to distinguish "parse failed" from "parsed to null"?

   If all three are true, accept the pattern — rate the finding MEDIUM and note "Deliberate swallow — verify the contract is explicit." If any are false, treat as a silent failure.

   Consult the **Reference Library** (below) for correct-pattern comparison.

   ### 3. DETECT HIDDEN FAILURES

   {Keep the existing Step 3 content — 6 patterns that hide errors — VERBATIM.}

   ### 4. CLASSIFY RECURRENCES

   For each distinct silent-failure pattern found, count occurrences across the scope.

   **Aggregation rule**: If the same pattern (same violation + same fix) appears in more than 3 files, group into a single aggregated finding for the main report.

   **System Evolution classification**: For patterns appearing ≥3 times, OR patterns not currently documented in CLAUDE.md / `.agents/reference/backend-patterns.md`, classify:
   - `rule-violation` — the correct pattern IS documented; it was ignored. Signal: upstream review missed it systemically.
   - `rule-gap` — the pattern is NOT documented anywhere. The observation should be promoted to `CLAUDE.md §AI Gotchas` or `.agents/reference/backend-patterns.md`.
   - `process-gap` — the pattern is documented and typically caught, but a specific workflow (e.g., refactor) regressed it. The process needs a pre/post-check.

   Emit the System Evolution section in the output (below).

   ### 5. REPORT

   Emit findings per Output Format. Include System Evolution section if Step 4 triggered it. Include Summary block at the end.

   ## Reference Library — Correct vs WRONG Patterns

   **CRITICAL: Test, Don't Just Read**
   {Keep the existing Step 4 content — Correct Express route / WRONG Express route / Correct SQL.js / WRONG SQL.js / Correct service propagation — VERBATIM. Title changed from "Project-Specific Patterns" to "Reference Library — Correct vs WRONG Patterns".}

   ## Cross-Agent Coordination

   When multiple agents run on the same change:
   - `code-reviewer` — does generic CLAUDE.md checklist review including `next(error)` and `stmt.free()` at the surface level. This agent owns error-propagation **in depth** — if `code-reviewer` flags a pattern, this agent provides the full analysis.
   - `code-simplifier` — refactors code preserving `try/finally` and `next(error)` verbatim; runs AFTER this agent in typical pipelines.
   - `type-design-analyzer` — owns Zod schema alignment; this agent handles the *runtime propagation* of Zod failures via `next(error)`, not the schema design itself.
   - `comment-analyzer` — owns comment accuracy; don't critique comments in this report.
   - `pr-test-analyzer` — verifies tests cover error paths; this agent finds the error paths, analyzer verifies they're tested.

   **On domain conflict**: this agent wins for error-propagation, silent failures, and resource leaks. Specialist agents win in their domains.

   ## Output Format

   For each issue found, provide:

   1. **Location**: File path and line number(s)
   2. **Severity**: CRITICAL (silent failure, broad catch, resource leak) / HIGH (poor error propagation, missing custom error) / MEDIUM (could be more specific, missing context; or accepted deliberate swallow)
   3. **Issue Description**: What's wrong and why it's problematic
   4. **Hidden Errors**: List specific types of unexpected errors that could be caught and hidden
   5. **User Impact**: How this affects debugging and error visibility
   6. **Recommendation**: Specific code changes needed
   7. **Example**: Show the corrected pattern (reference the Library above when applicable)

   **For aggregated findings** (same pattern in >3 files):
   ```
   [Aggregated — {count} occurrences] {pattern summary}
   Files: {file:line list}
   Pattern: {the WRONG code}
   Fix (apply to all): {the CORRECT code}
   System Evolution: {rule-violation | rule-gap | process-gap} (see section below)
   ```

   ### System Evolution (optional — emit only when Step 4 triggered)

   For each classified recurring pattern:

   **Pattern**: {description}
   **Occurrences**: {count} — {file:line list if not already in aggregated finding}
   **Classification**: `rule-violation` | `rule-gap` | `process-gap`
   **Recommended action**:
   - `rule-violation` → Run `/rca "why did /review-pr miss {pattern} in {N} files?"`
   - `rule-gap` → Summarize the correct pattern for addition to `CLAUDE.md §AI Gotchas`. Do NOT modify CLAUDE.md yourself.
   - `process-gap` → Recommend updating the specific command's checklist.

   ### Summary

   At the end of the report:
   ```
   ---
   Summary:
   - Scope: {files audited}
   - References consulted: {CLAUDE.md + any .agents/reference/*.md loaded, or "agent's inline Reference Library only"}
   - Total findings: {N}
   - Severity breakdown: CRITICAL {n} | HIGH {n} | MEDIUM {n}
   - Aggregated findings: {count}
   - System Evolution classifications: {rule-violations: n | rule-gaps: n | process-gaps: n}

   Next steps:
   - Address CRITICAL findings before `/commit`. HIGH should also be resolved pre-commit.
   - For each aggregated finding: apply the fix uniformly to all listed files.
   - If System Evolution flagged a rule-gap: summarize the correct pattern for human addition to CLAUDE.md §AI Gotchas.
   - For unclear root causes: `/rca "<symptom>"`.
   - After fixes: `/validate`.
   - Optional: `code-simplifier` to refine the refactored error flow.
   ```

   ## Your Tone

   {Keep the existing Tone section VERBATIM — thorough, skeptical, uncompromising; specific phrasings; acknowledgment of good patterns.}

   ### Empty-state Message

   If no issues found:
   `✓ No silent failure patterns detected. All errors properly propagated via next(error), all SQL.js statements freed in finally blocks.`

   `For broader correctness review: run code-reviewer. For type-design review: type-design-analyzer. Human review still required — architectural concerns are outside this agent's scope.`

   ## Example — Populated Report

   ```
   ### Critical (1)

   [`server/src/routes/flags.ts:78`] — Missing `next(error)` in async catch (CRITICAL)
   - **Hidden errors**: any service-layer exception — NotFoundError (404 intended), ConflictError (409 intended), ValidationError (400 intended), unknown SQL.js errors — all collapsed to 500 with generic message.
   - **User impact**: Clients see `500: something went wrong` for a 404 lookup miss; error-middleware logging is bypassed; error metrics are wrong.
   - **Recommendation**:
     ```ts
     // Before
     catch (err) { res.status(500).json({ error: 'something went wrong' }); }
     // After
     catch (err) { next(err); }  // middleware maps NotFoundError→404, ConflictError→409, etc.
     ```
   - **Reference**: Library §Correct Express route.

   ### Aggregated (1)

   [Aggregated — 5 occurrences] SQL.js statement not freed in finally (CRITICAL)
   Files: server/src/services/flags.ts:89, :132, :178, server/src/services/users.ts:47, :91
   Pattern:
   ```ts
   const stmt = db.prepare(sql);
   stmt.bind([id]);
   const result = stmt.step() ? stmt.getAsObject() : null;
   stmt.free();  // unreachable if step() or getAsObject() throws
   ```
   Fix (apply to all):
   ```ts
   const stmt = db.prepare(sql);
   try {
     stmt.bind([id]);
     return stmt.step() ? stmt.getAsObject() : null;
   } finally {
     stmt.free();
   }
   ```
   System Evolution: rule-violation (see below)

   ### System Evolution

   **Pattern**: SQL.js statements freed outside `finally` block
   **Occurrences**: 5
   **Classification**: `rule-violation` — CLAUDE.md §Backend Patterns + `.agents/reference/sql-js-constraints.md` both cover this
   **Recommended action**: `/rca "why did /review-pr miss 5 SQL.js statements without try/finally?"`

   ---
   Summary:
   - Scope: 2 files (server/src/routes/flags.ts + server/src/services/flags.ts) + git diff HEAD for 3 more
   - References consulted: CLAUDE.md §Error Handling, .agents/reference/backend-patterns.md, .agents/reference/sql-js-constraints.md
   - Total findings: 2 (1 individual + 1 aggregated covering 5 files)
   - Severity breakdown: CRITICAL 2 | HIGH 0 | MEDIUM 0
   - Aggregated findings: 1 (covering 5 files)
   - System Evolution classifications: rule-violations: 1 | rule-gaps: 0 | process-gaps: 0

   Next steps:
   - Address both CRITICAL findings before `/commit`.
   - For the aggregated SQL.js finding: apply the try/finally wrapper to all 5 files uniformly.
   - Follow up: `/rca "why did /review-pr miss 5 SQL.js statements without try/finally?"` to find the process gap.
   - After fixes: `/validate`.
   - Optional: `code-simplifier` can verify the try/finally rewrites remain idiomatic.
   ```
   ```

4. **Do NOT change**:
   - Identity statement ("elite error handling auditor with zero tolerance")
   - The 5 Core Principles
   - The Tone section
   - The 3 original `description` proactive examples
   - The 7-field Output Format structure (only extend with aggregated-findings format + System Evolution section + Summary block)
   - `tools: Read, Grep, Glob` (exemplary)
   - `model: opus`, `color: red`
   - The Correct/WRONG code examples (now in Reference Library section — content VERBATIM)
   - The 3 CRITICAL category labels in Step 2 (Express Route / SQL.js / Zod)
   - The specific tonal phrasings ("This catch block could hide...", etc.)
   - The 5 severity criteria

Do NOT change any source code. Only modify `.claude/agents/silent-failure-hunter.md`.
````

---

## Success Criteria

- [ ] `description` preserves 3 original proactive examples ✅
- [ ] `description` adds 4th example covering post-refactor trigger (agent hygiene)
- [ ] `description` adds "When NOT to use" paragraph routing to specialist agents (agent hygiene)
- [ ] **Invocation Context** subsection explains when this agent fires: proactive, post-refactor, within `/review-pr`, post-incident `/rca` (concept #26)
- [ ] **Scope** subsection defines default (`git diff HEAD`), custom, empty-scope STOP, no-error-handling-code case (concept #26)
- [ ] **Pre-Step: LOAD CONTEXT** mandates reading CLAUDE.md §Error Handling + `.agents/reference/backend-patterns.md` + `.agents/reference/sql-js-constraints.md`; on conflict, reference docs win (concept #26, cross-ref Round 23)
- [ ] **Step 4 "Project-Specific Patterns" renamed** to "Reference Library — Correct vs WRONG Patterns" and moved out of numbered Process (it's reference, not sequential) (concept #27)
- [ ] **Process renumbered**: Pre-Step → 1. LOCATE → 2. SCRUTINIZE → 3. DETECT HIDDEN FAILURES → 4. CLASSIFY RECURRENCES → 5. REPORT (concept #27)
- [ ] **Ambiguous-code guidance** added to Step 2 SCRUTINIZE (distinguish error-handling from deliberate validity-check `try/catch`) (concept #27)
- [ ] **Evidence-quoting rule** added to Step 2: every finding quotes actual code at `file:line` (concept #27)
- [ ] **Step 4 CLASSIFY RECURRENCES** added: aggregation rule (>3 occurrences → single grouped finding) + System Evolution classification (rule-violation / rule-gap / process-gap) (concept #17 — HEADLINE; concept #27)
- [ ] **Cross-Agent Coordination** section added with domain routing to `code-reviewer`, `code-simplifier`, `type-design-analyzer`, `comment-analyzer`, `pr-test-analyzer` (concept #27)
- [ ] **Aggregated-findings format** added to Output Format (concept #28)
- [ ] **System Evolution output section** added with classification routing: rule-violation → `/rca`, rule-gap → human-driven CLAUDE.md addition (no self-modification), process-gap → command checklist update (concept #17 — HEADLINE)
- [ ] **Summary block** added at end of output: scope, references consulted, total findings, severity breakdown, aggregated count, System Evolution classifications, next-step chain (concept #28)
- [ ] **Next Steps chain** in Summary: CRITICAL/HIGH before `/commit`, `/rca` for unclear roots, `/validate` after fixes, optional `code-simplifier` (concept #29)
- [ ] **Rendered example** of populated report with 1 individual + 1 aggregated finding + System Evolution + Summary (concept #28)
- [ ] **Empty-state message** updated to include cross-agent routing ("For broader correctness review: `code-reviewer`; for type-design: `type-design-analyzer`. Human review still required.") (concept #28)
- [ ] Identity ("zero tolerance" / "elite error handling auditor") preserved ✅
- [ ] 5 Core Principles preserved ✅
- [ ] Tone section preserved ✅
- [ ] 7-field Output Format structure preserved (extended with aggregated format + System Evolution + Summary) ✅
- [ ] Correct/WRONG code examples (Express route, SQL.js, service propagation) preserved VERBATIM in Reference Library ✅
- [ ] `tools: Read, Grep, Glob` (exemplary read-only) preserved ✅
- [ ] `model: opus`, `color: red` preserved ✅
