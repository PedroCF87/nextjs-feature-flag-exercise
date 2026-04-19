# Phase 4 — Agents: Round 21 — Audit `comment-analyzer` Agent

**Target file**: `nextjs-feature-flag-exercise/.claude/agents/comment-analyzer.md`

**Gold Standard concepts**: #25 (Input → Process → Output)

**Agent-specific quality checks**: proactive `description` trigger, minimum-viable `tools`, identity, numbered process, structured output, role boundary

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Frontmatter**:
  - `name: comment-analyzer`
  - `description`: 3 proactive examples with `<commentary>` (large documentation comments, PR with comment additions, pre-commit comment review)
  - `model: inherit`
  - `color: green`
  - **`tools:` field — NOT PRESENT** (critical gap — same bug as `pr-test-analyzer`, Round 20)
- **Body length**: ~77 lines
- **Format**: Markdown headers (agent format)

### Current Content Summary

Section-by-section breakdown of the agent file:

1. **Frontmatter** (lines 1–6): Standard agent YAML but the `tools:` field is entirely absent — identical bug to `pr-test-analyzer`. The agent relies on inherited tools, which means in a coding session it may have `Edit` access even though its role boundary explicitly says "do not modify code or comments directly."

2. **Identity statement** (lines 8–9): "You are a meticulous code comment analyzer with deep expertise in technical documentation and long-term code maintainability. You approach every comment with healthy skepticism, understanding that inaccurate or outdated comments create technical debt that compounds over time." — plus a second sentence: "Your primary mission is to protect codebases from comment rot by ensuring every comment adds genuine value and remains accurate as code evolves."

3. **Analysis Framework** (lines 11–55) — 5 numbered dimensions, each titled "When analyzing comments, you will":
   - **1. Verify Factual Accuracy** — 8 bullets: function signatures, described behavior vs actual code, referenced types/functions/variables exist and used correctly, edge cases handled as claimed, performance/complexity claims accurate, **SQL.js resource management (`stmt.free()` in try/finally) accurately described**, middleware modifying `req` object side effects, custom error classes referenced correctly
   - **2. Assess Completeness** — 8 bullets: critical assumptions/preconditions documented, non-obvious side effects mentioned (e.g., middleware modifying req), important error conditions described (custom error classes), complex algorithm approach explained, business logic rationale when not self-evident, **SQL.js-specific constraints (booleans as INTEGER, parameterized queries) documented when relevant**, JSDoc matches function signature, missing context a future maintainer would need
   - **3. Evaluate Long-term Value** — 5 bullets: restatement-of-obvious flags, "why" > "what" priority, will become outdated with likely changes, written for least experienced future maintainer, avoid temporary/transitional implementation references
   - **4. Identify Misleading Elements** — 7 bullets: ambiguous language, outdated references to refactored code, assumptions no longer true, examples not matching current implementation, TODOs/FIXMEs already addressed, **incorrect Express v5 error propagation (`res.status().json()` when `next(error)` is used)**, misleading complexity claims
   - **5. Suggest Improvements** — 4 bullets: rewrite suggestions, additional context recommendations, removal rationale, alternative approaches for conveying same info

4. **Output Format** (lines 57–74) — structured 5-section report:
   - **Summary**: brief scope + findings overview
   - **Critical Issues**: factually incorrect or highly misleading comments — Location / Issue / Suggestion
   - **Improvement Opportunities**: comments that could be enhanced — Location / Current State / Suggestion
   - **Recommended Removals**: comments that add no value or create confusion — Location / Rationale
   - **Positive Findings**: well-written examples (if any)

5. **Role boundary** (lines 76–77): "IMPORTANT: You analyze and provide feedback only. Do not modify code or comments directly. Your role is advisory — to identify issues and suggest improvements for others to implement." — the strongest and clearest role-boundary statement in the entire agent codebase.

### Strengths Already Present

- **"Comment rot" framing** — identifies this agent's mission as protecting against a specific, named problem (comment rot = technical debt from outdated documentation) ✅
- **"Healthy skepticism" approach** — correctly positions the agent as adversarial toward comments, not deferential ✅
- **5 analysis dimensions** covering the full lifecycle of a comment (accurate → complete → valuable → not misleading → improvable) ✅
- **Project-specific factual accuracy checks** — `stmt.free()` in try/finally, `next(error)` vs `res.status().json()`, custom error classes, middleware side effects — the 5 dimensions all reference this project's conventions specifically ✅
- **"Why > What" principle** — explicitly stated in dimension 3 ✅
- **"Written for least experienced future maintainer"** — sets the correct audience for comment quality ✅
- **Positive Findings section** — outputs good examples too, not just problems ✅
- **Exemplary role-boundary statement** — "You analyze and provide feedback only. Do not modify code or comments directly." — clearest in the codebase ✅
- **"Do not modify"** is an IMPORTANT-flagged rule — the agent cannot silently make changes ✅
- **Misleading-element detection** — dimension 4 includes specific Express v5 misrepresentation detection ✅
- **TODOs/FIXMEs already addressed** — catches stale task references ✅

### Issues Spotted Before Audit

1. **Missing `tools:` field in frontmatter** — Same critical bug as `pr-test-analyzer` (Round 20). Without explicit `tools:`, the agent inherits from the invocation context. If invoked during a coding session where `Edit` is active, the agent could *in principle* modify code despite its role boundary saying "do not modify." The minimal correct set is `Read, Grep, Glob, Bash(git diff:*)` — read-only plus scope detection.

2. **`model: inherit`** — Same issue as `pr-test-analyzer`. For an advisory agent that runs as a quality gate before PR review or commits, inheriting a weaker model risks lower-quality analysis. Should declare `model: opus`.

3. **No scope pre-condition** — Analysis begins with "When analyzing comments, you will..." but doesn't define *which* comments to analyze. If invoked with no context, the agent may analyze the entire codebase or do nothing. Should define: default = recently changed files (`git diff HEAD`), custom = user-specified files, empty-scope = STOP.

4. **No Invocation Context** — Not stated when this agent fires in the PIV workflow. The `description` examples suggest post-documentation, pre-PR, and pre-commit triggers, but no formal positioning.

5. **No `.agents/reference/*` loading** — Project has `.agents/reference/backend-patterns.md` and `frontend-patterns.md` with canonical patterns (Express v5 `next(error)`, SQL.js `stmt.free()`). Dimension 1 asks "is the described behavior accurate?" — accuracy must be measured against the canonical patterns, not just the agent's embedded knowledge.

6. **No CLAUDE.md re-read** — The dimensions reference project-specific conventions (Express v5, SQL.js, custom errors) but never mandate re-reading CLAUDE.md. If CLAUDE.md evolves, the agent's embedded knowledge drifts.

7. **No System Evolution signal** — When the same type of comment inaccuracy appears repeatedly (e.g., 5 docstrings all incorrectly describe `stmt.free()` as happening after the function returns instead of in `finally`), this signals a `rule-gap` (the correct pattern isn't communicated clearly enough) or a `rule-violation` (it's documented but authors don't apply it). Should feed `/rca` and CLAUDE.md §AI Gotchas.

8. **No cross-agent coordination** — This agent overlaps with `code-reviewer` (may note misleading comments as code quality), `type-design-analyzer` (may note when JSDoc on types doesn't match the schema), and `silent-failure-hunter` (may catch incorrect error-propagation descriptions). Without explicit routing, the same comment inaccuracy may be reported 3 times with different severity from different agents.

9. **No rendered output example** — The 5-section output structure is defined but no concrete populated example is shown. Other agents in this phase (Rounds 16–20 audits) now have rendered examples.

10. **No "When NOT to use" in `description`** — Should route users to the correct specialist when they want something beyond comment analysis.

11. **Output Summary schema is vague** — "Brief scope and findings overview" — no required fields. Consistent with the gap in `pr-test-analyzer`. Should have a schema (files analyzed, comment count, findings by type).

12. **No aggregation rule** — If 7 service methods all have the same misleading comment pattern (e.g., all incorrectly describe `stmt.free()` as a synchronous cleanup after the SQL runs, not in `finally`), all 7 become separate Critical Issues. An aggregation rule prevents report noise.

13. **No "Human reviewer still required" closing** — Same gap as `code-reviewer` (Round 16) and `pr-test-analyzer` (Round 20). The agent's findings are advisory; the human decides whether to act on them.

14. **No distinction between new comments and existing comments** — A PR adding new JSDoc (should catch inaccuracies immediately) is different from a periodic comment rot audit of existing code (should flag rot and staleness over time). The agent doesn't distinguish these modes.

15. **Dimensions 1–4 are analytical criteria, not steps** — The body says "When analyzing comments, you will: 1. Verify factual accuracy..." This reads as a list of criteria, but lacks an explicit step-by-step execution order. An agent following these strictly might analyze dimension 1 for all comments, then dimension 2 for all, etc. — or it might analyze all 5 dimensions per comment in order. No explicit guidance.

---

## Concept-by-Concept Audit

### Concept #25 — Input → Process → Output

> Every agent must define all three stages clearly so the invoking context knows what scope to pass, what the agent does, and what format to expect back.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ❌ Weak | No defined default scope, no pre-conditions, no CLAUDE.md or `.agents/reference/*` loading declared. The agent says "when analyzing comments" without defining which comments. |
| **Process** | ⚠️ Partial | 5 analysis dimensions with sub-bullets, but no explicit per-comment execution order, no CHECKPOINTs, no step for "load context" before analysis |
| **Output** | ⚠️ Partial | 5-section structure defined; Summary schema is vague ("brief overview"); no top-level statistics block; no rendered example; no chain hints |

**Actions:**
- [ ] Add explicit Input stage with Scope, pre-conditions, and context loading (see Concept #26 below).
- [ ] Reframe the 5 dimensions as a numbered per-comment process (see Concept #27 below).
- [ ] Add Summary schema, top-level stats, rendered example, and chain hints (see Concept #28 below).

---

### Concept #26 — Input Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ✅ Strong | "meticulous code comment analyzer... healthy skepticism" |
| Default scope | ❌ Missing | Not defined |
| New-comment vs existing-comment distinction | ❌ Missing | PR with new docs vs periodic rot audit are treated identically |
| Empty-scope handling | ❌ Missing | Not defined |
| CLAUDE.md re-read | ❌ Missing | Not mandated; agent's embedded project knowledge may drift |
| `.agents/reference/*` loading | ❌ Missing | `backend-patterns.md` and `frontend-patterns.md` are the canonical accuracy sources |
| Workflow positioning (when this fires) | ❌ Missing | No Invocation Context relative to PIV workflow |
| "When NOT to use" | ❌ Missing | No routing to specialist agents |

**Actions:**
- [ ] Add an **Invocation Context** subsection right after Identity:
  > ## Invocation Context
  >
  > Invoked when comments or documentation are added, modified, or reviewed. Typical callers:
  > - **The assistant itself** — after generating large documentation comments or docstrings (the `description` examples above)
  > - **The user** — before finalizing a PR that adds or modifies comments significantly
  > - **`/review-pr`** — as part of its orchestrated multi-agent pipeline when the diff contains new JSDoc, inline comments, or docstrings
  > - **Periodic rot audit** — when the user wants to assess existing comments for staleness across a module
  >
  > **Position in PIV chain**: After `/implement` (comments are added during implementation), before `/commit` + `/create-pr`. Best run when the code is functionally correct — comment analysis is a documentation quality check, not a functional correctness check.
  >
  > **Not a replacement for `/review-pr`** — this is a specialist documentation-quality audit; `/review-pr` orchestrates multiple agents.

- [ ] Add a **Scope** subsection before the Analysis Framework:
  > ## Scope
  >
  > **Default — New/Changed comments**: Files modified in recent changes:
  > ```bash
  > git diff HEAD --name-only
  > ```
  > Focus on comments that are new or modified in the diff; only flag existing untouched comments if they are directly related to changed code (they may now be inaccurate due to the change).
  >
  > **Custom**: If the user specifies files, directories, or a PR range, audit all comments in those files.
  >
  > **Empty-scope STOP**: If `git diff HEAD` returns no files AND no custom scope, reply: `No recently changed files. Specify files for a periodic rot audit or make changes first.` and exit.
  >
  > ### New-comment vs Periodic Rot Audit Distinction
  >
  > Classify the invocation:
  > - **New/Changed comment review** (default) — focus on accuracy and completeness of what was just written; freshness is less of a concern because the code change is recent.
  > - **Periodic rot audit** — focus on staleness, outdated references, and "will this comment still be true after the next refactor?"; accuracy still applies but long-term value becomes the primary lens.
  >
  > Note the mode in the report Summary.

- [ ] Add a **Pre-Step: LOAD CONTEXT** block at the top of the Analysis Framework:
  > **Pre-Step: LOAD CONTEXT** — Before analyzing any comment, read these reference docs (if present):
  > - `CLAUDE.md` — §Error Handling, §Backend Patterns, §Code Style (the standard against which comment accuracy is measured)
  > - `.agents/reference/backend-patterns.md` — canonical patterns (Express v5 `next(error)`, SQL.js `stmt.free()`, Zod boundary) — use these as the accuracy baseline for dimension 1
  > - `.agents/reference/frontend-patterns.md` — canonical UI patterns (TanStack Query, Radix, `cn()`) — for frontend component docs
  >
  > On conflict between these docs and the agent's embedded project knowledge (in dimensions 1–4): the reference docs win. If there's a drift, flag it in the report.

- [ ] Append **"When NOT to use"** to `description`:
  > **When NOT to use this agent**:
  > - For type-design issues (JSDoc alignment with types is covered here, but Zod schema design goes to `type-design-analyzer`)
  > - For error-propagation bugs in implementation code: use `silent-failure-hunter`
  > - For general code-quality review: use `code-reviewer`
  > - For test coverage gaps: use `pr-test-analyzer`
  > This agent exclusively analyzes **code comment accuracy, completeness, long-term value, and misleading elements**.

---

### Concept #27 — Process Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered process | ✅ Present | 5 analysis dimensions numbered 1–5 |
| VERB-labeled steps | ⚠️ Partial | Dimensions are named ("Verify", "Assess", "Evaluate", "Identify", "Suggest") but don't form an explicit step-by-step per-comment process |
| Per-comment execution order | ❌ Missing | It's unclear whether dimensions apply per-comment (analyze one comment across all 5 dimensions before moving to the next) or per-dimension (apply dimension 1 to all comments, then dimension 2 to all, etc.) |
| Tools match steps | ❌ Missing | No `tools:` field |
| CHECKPOINTs | ❌ Missing | No checkpoints between phases |
| Context loading step | ❌ Missing | Covered in Concept #26 actions |
| Aggregation for repeated findings | ❌ Missing | 7 methods with the same misleading comment → 7 separate Critical Issues |
| Cross-agent coordination | ❌ Missing | Overlaps with `code-reviewer`, `type-design-analyzer`, `silent-failure-hunter` |
| System Evolution signal | ❌ Missing | Covered in System Evolution section below |
| Evidence-quoting | ✅ Present | "Location: [file:line]" in each output section implicitly requires it; "Suggestion: [recommended fix]" requires concrete proposals |

**Actions:**
- [ ] Add a **Per-Comment Process** note at the top of the Analysis Framework, before the dimensions:
  > **Execution Order**: For each comment or comment block in scope, apply ALL 5 dimensions in sequence before moving to the next comment. Do NOT analyze dimension 1 across all comments and then dimension 2 — this loses the connection between dimensions for each specific comment.
  >
  > **Comment definition**: A "comment" for this agent is one of:
  > - Single-line `//` comment
  > - Multi-line `/* ... */` block
  > - JSDoc `/** ... */` block on a function, class, or type
  > - `/* @ts-ignore */` or `/* eslint-disable */` suppressions (analyze the justification comment, if present)
  > - In-React `{/* ... */}` JSX comments

- [ ] Add an explicit **Step 6 — CLASSIFY RECURRENCES** after dimension 5:
  > ### 6. CLASSIFY RECURRENCES
  >
  > After all comments are analyzed, scan the findings for patterns:
  >
  > **Aggregation**: If the same finding type (same inaccuracy root cause + same fix pattern) appears more than 3 times, group into a single aggregated finding.
  >
  > Example:
  > ```
  > [Aggregated — 5 occurrences] Comments describe stmt.free() after the function body instead of in finally block (Critical)
  > Files: server/src/services/flags.ts:23, :67, :112, server/src/services/users.ts:45, :89
  > Root cause: Comment template used before try/finally pattern was adopted
  > Recommended fix (apply to all): Update comments to reflect the try/finally pattern:
  >   // stmt.free() is called in the finally block, ensuring cleanup even when exceptions occur
  > ```
  >
  > **System Evolution**: If the same inaccuracy appears ≥3 times AND the correct pattern IS in CLAUDE.md or `.agents/reference/backend-patterns.md`, classify as `rule-violation` (the pattern exists but authors don't apply it to comments). If the correct pattern is NOT documented anywhere, classify as `rule-gap` (the codebase convention needs better documentation so authors can write accurate comments).

- [ ] Add a **CHECKPOINT** after dimension 5 / before CLASSIFY RECURRENCES:
  > **CHECKPOINT:**
  > - [ ] Every comment in scope analyzed across all 5 dimensions
  > - [ ] Every Critical Issue has: `file:line`, issue description, suggested fix
  > - [ ] Every Improvement Opportunity has: `file:line`, current state, suggestion
  > - [ ] Every Recommended Removal has: `file:line`, rationale
  > - [ ] Aggregation applied to repeated patterns

- [ ] Add a **Cross-Agent Coordination** section after the Analysis Framework:
  > ## Cross-Agent Coordination
  >
  > When multiple agents run on the same change:
  > - `code-reviewer` — may flag misleading comments as "unclear code." This agent owns comment analysis in depth; if `code-reviewer` notes a misleading comment, its note should appear in this agent's Critical Issues with full analysis.
  > - `type-design-analyzer` — may flag JSDoc on types that doesn't match the schema. If it does, pull that finding into this agent's Improvement Opportunities.
  > - `silent-failure-hunter` — may flag incorrect error-propagation descriptions (e.g., a comment saying "returns null on error" when the function actually calls `next(error)`). If it does, that finding is a Critical Issue here.
  > - `code-simplifier` — may remove "obvious-code" comments (per its principle #3). Don't re-flag those removals as issues.
  >
  > **On domain conflict**: this agent wins for comment quality analysis. Specialist agents win in their domains.

---

### Concept #28 — Output Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 5-section output structure | ✅ Present | Summary / Critical Issues / Improvement Opportunities / Recommended Removals / Positive Findings |
| Summary schema | ❌ Missing | "Brief scope and findings overview" — no required fields |
| Top-level statistics | ❌ Missing | No block showing counts at a glance |
| Per-finding fields | ✅ Present | Location / Issue / Suggestion for Critical Issues; Location / Current State / Suggestion for Improvements; Location / Rationale for Removals |
| Aggregated findings format | ❌ Missing | Covered in Concept #27 actions |
| System Evolution channel | ❌ Missing | Covered in Concept #27 + System Evolution section below |
| Rendered example | ❌ Missing | No concrete populated example |
| Empty state (clean codebase) | ❌ Missing | What to emit when no issues are found |
| Downstream chain hints | ❌ Missing | After report, what should the user do? |
| "Human review still required" closing | ❌ Missing | Role-boundary statement exists in the body but not in the output format |

**Actions:**
- [ ] Define a schema for the **Summary section**:
  > **Summary must include**:
  > - Mode: "New/Changed comment review" or "Periodic rot audit"
  > - Scope: {N} files analyzed, {M} comment blocks examined
  > - Findings: Critical {n} | Improvements {n} | Removals {n} | Positive {n}
  > - One-paragraph qualitative assessment: overall comment quality (High / Medium / Low) + why
  > - Close with: "All findings are advisory. Do not modify code or comments based on this report without human review."

- [ ] Add a **top-level statistics block** at the very start of output:
  ```
  ## Comment Analysis Report

  Mode: {New/Changed comment review | Periodic rot audit}
  Scope: {N} files | {M} comment blocks examined
  Findings: Critical {N}  |  Improvements {N}  |  Recommended Removals {N}  |  Positive {N}
  ```

- [ ] Add an **Aggregated Findings** section to the output template (between Recommended Removals and Positive Findings):
  > **Aggregated Findings** (same issue type in >3 places):
  >
  > ```
  > [Aggregated — {count} occurrences] {issue summary}
  > Files: {file:line list}
  > Root cause: {shared underlying reason}
  > Recommended fix (apply to all): {description of correct comment pattern}
  > System Evolution: {rule-violation | rule-gap} — see System Evolution section
  > ```

- [ ] Add a **System Evolution section** (optional, triggered by CLASSIFY RECURRENCES):
  > **System Evolution (optional — emit only when triggered)**
  >
  > **Trigger**: Same comment inaccuracy in ≥3 places, OR the inaccuracy reveals the codebase needs better documentation of a convention.
  >
  > **Classification**:
  > - `rule-violation` — the correct pattern IS in CLAUDE.md / `.agents/reference/backend-patterns.md`; authors aren't reflecting it in their comments. Signal: the convention needs better visibility (README, examples, onboarding docs).
  > - `rule-gap` — the correct pattern is NOT documented anywhere. Authors are writing inaccurate comments because the convention itself isn't clear enough. Signal: the correct pattern should be promoted to CLAUDE.md §AI Gotchas or `.agents/reference/backend-patterns.md`.
  >
  > **Recommended action**:
  > - `rule-violation` → "Consider a comment template or JSDoc standard in CLAUDE.md for this pattern." Optionally: `/rca "why do authors consistently misrepresent {pattern} in comments?"`
  > - `rule-gap` → Summarize the correct pattern for human addition to CLAUDE.md §Code Style or a new `.agents/reference/` doc.

- [ ] Add an **empty-state message**:
  > If no issues are found: `✓ All analyzed comments are accurate, complete, and appropriately valuable. No comment rot detected in scope.`
  >
  > Positive Findings section should still list exemplary comments to reinforce good practices even when no issues are found.

- [ ] Add a **Next Steps block** at the end of the output:
  > ```
  > ## Next Steps
  > - Address Critical Issues first (factually incorrect or highly misleading)
  > - For Recommended Removals: delete the comment; confirm the code remains self-explanatory without it
  > - For Improvement Opportunities: apply the suggested rewrites or add the missing context
  > - For aggregated findings: apply the fix uniformly to all listed locations
  > - If System Evolution flagged a rule-gap: summarize the correct comment pattern for human addition to CLAUDE.md §Code Style
  > - After all changes: run /validate to confirm no accidental code changes
  > - Proceed to /commit
  >
  > All findings are advisory. Do not modify code or comments based on this report without human review.
  > ```

---

### Agent-Specific Quality Checks

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `description` contains proactive trigger | ✅ Strong | 3 examples with `<commentary>` |
| `description` specifies when NOT to use | ❌ Missing | Covered in Concept #26 actions |
| **`tools:` field present** | ❌ **Critical bug** | Completely absent — inherits from context |
| `model` explicitly declared | ⚠️ Weak | `model: inherit` — should be `model: opus` |
| Identity statement | ✅ Strong | "healthy skepticism", "comment rot" |
| Numbered process | ✅ Present | 5 dimensions (will become clearer with explicit step order) |
| Per-comment vs per-dimension execution order | ❌ Missing | Covered in Concept #27 actions |
| Output format specified | ✅ Present | 5 sections defined |
| Summary section schema | ❌ Missing | Covered in Concept #28 actions |
| Rendered output example | ❌ Missing | Covered in Concept #28 actions |
| Aggregation rule | ❌ Missing | Covered in Concept #27 actions |
| System Evolution signal | ❌ Missing | Covered in Concept #27 actions |
| Cross-agent coordination | ❌ Missing | Covered in Concept #27 actions |
| **Role boundary — strongest in codebase** | ✅ Exemplary | "IMPORTANT: You analyze and provide feedback only. Do not modify code or comments directly." |

---

## Action Plan Summary

### Priority 1 — Critical Bug Fix: Missing `tools:` Field

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add explicit `tools: Read, Grep, Glob, Bash(git diff:*)` — minimum-viable read-only set | Agent hygiene — **CRITICAL** |
| 1.2 | Change `model: inherit` to `model: opus` | Agent hygiene |

### Priority 2 — Input Pre-conditions (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add Invocation Context subsection (when this fires in PIV chain, relationship to `/review-pr`) | #26 |
| 2.2 | Add Scope subsection with default (`git diff HEAD`), custom, empty-scope STOP | #26 |
| 2.3 | Add New-comment vs Periodic Rot Audit Distinction with per-mode focus | #26 |
| 2.4 | Add Pre-Step LOAD CONTEXT (CLAUDE.md + `.agents/reference/backend-patterns.md` + `frontend-patterns.md`) | #26, cross-ref Round 23 |
| 2.5 | Append "When NOT to use" to `description` | Agent hygiene |

### Priority 3 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add Per-Comment Process note: analyze all 5 dimensions per comment before moving to the next; define "comment" types | #27 |
| 3.2 | Add Step 6 CLASSIFY RECURRENCES with aggregation (>3 → single grouped finding) + System Evolution classification | #27 |
| 3.3 | Add CHECKPOINT after dimension 5 / before CLASSIFY RECURRENCES | #27 |
| 3.4 | Add Cross-Agent Coordination section (routing to `code-reviewer`, `type-design-analyzer`, `silent-failure-hunter`, `code-simplifier`) | #27 |

### Priority 4 — Output Polish (concept #28)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Add top-level statistics block (mode, scope, findings counts) | #28 |
| 4.2 | Define Summary section schema (mode + scope + findings + qualitative assessment + advisory note) | #28 |
| 4.3 | Add Aggregated Findings format section | #28 |
| 4.4 | Add System Evolution output section (rule-violation vs rule-gap classification + recommended actions) | #28 |
| 4.5 | Add empty-state message | #28 |
| 4.6 | Add Next Steps block (chain from findings → fixes → `/validate` → `/commit`) | #29 |
| 4.7 | Add rendered output example | #28 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§25, §26, §27, §28)
2. `.claude/agents/comment-analyzer.md` — current agent
3. `docs/Gold-Standard-Plan/phases/phase-4-agents/round-21-audit-comment-analyzer.md` — this audit
4. `.claude/agents/silent-failure-hunter.md` — reference for System Evolution section + Scope structure + Invocation Context
5. `.claude/agents/pr-test-analyzer.md` — reference for "Human review still required" framing + top-level statistics block pattern
6. `.claude/agents/code-reviewer.md` — reference for Cross-Agent Coordination pattern
7. `docs/Gold-Standard-Plan/phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md` — for `.agents/reference/*` loading pattern

Edit `.claude/agents/comment-analyzer.md` with these requirements:

1. **Frontmatter** — add `tools:` and change `model`:
   ```
   ---
   name: comment-analyzer
   description: {keep existing 3 proactive examples; ADD "When NOT to use" paragraph at the end — see step 2}
   model: opus
   tools: Read, Grep, Glob, Bash(git diff:*)
   color: green
   ---
   ```
   Justification: `Read, Grep, Glob` for reading comment-containing files; `Bash(git diff:*)` for determining scope (which comments are new or changed). This is a **read-only** agent — no `Edit`, no `Write`. The role boundary "do not modify code or comments directly" is enforced at the tool level, not just as an instruction.

2. **Append to `description`** — after the existing 3 examples:
   > **When NOT to use this agent**:
   > - For type-design issues (JSDoc alignment with Zod schemas belongs to `type-design-analyzer`)
   > - For error-propagation bugs in implementation code: use `silent-failure-hunter`
   > - For general code-quality review: use `code-reviewer`
   > - For test coverage gaps: use `pr-test-analyzer`
   > This agent exclusively analyzes **code comment accuracy, completeness, long-term value, and misleading elements**. It does not modify any code or comments.

3. **Body** — reorganize with these sections in order (preserve the 5 analysis dimensions VERBATIM; add new sections around them):

   ```markdown
   You are a meticulous code comment analyzer with deep expertise in technical documentation and long-term code maintainability. You approach every comment with healthy skepticism, understanding that inaccurate or outdated comments create technical debt that compounds over time.

   Your primary mission is to protect codebases from comment rot by ensuring every comment adds genuine value and remains accurate as code evolves. You analyze and provide feedback only — you do not modify code or comments directly.

   ## Invocation Context

   Invoked when comments or documentation are added, modified, or reviewed. Typical callers:
   - **The assistant itself** — after generating large documentation comments or docstrings
   - **The user** — before finalizing a PR that adds or modifies comments
   - **`/review-pr`** — as part of its orchestrated pipeline when the diff contains new JSDoc, inline comments, or docstrings
   - **Periodic rot audit** — when assessing existing comments for staleness across a module

   **Position in PIV chain**: After `/implement` (comments added during implementation), before `/commit` + `/create-pr`. Comment quality is a documentation check, not a functional correctness check — run after `silent-failure-hunter` and `code-reviewer` have validated the implementation.

   **Not a replacement for `/review-pr`** — this is a specialist documentation-quality audit; `/review-pr` orchestrates multiple agents.

   ## Scope

   **Default — New/Changed comments**: Files modified in `git diff HEAD`:
   ```bash
   git diff HEAD --name-only
   ```
   Focus on comments that are new or modified in the diff; also flag existing untouched comments that are now inaccurate due to the code change (e.g., a comment describing behavior that was just refactored).

   **Custom**: If the user specifies files, directories, or a PR range, audit all comments in those files.

   **Empty-scope STOP**: If `git diff HEAD` returns no files AND no custom scope, reply: `No recently changed files. Specify files for a periodic rot audit or make changes first.` and exit.

   ### New-comment vs Periodic Rot Audit Distinction

   Classify the invocation:
   - **New/Changed comment review** (default) — focus on accuracy and completeness of recently written comments; flag both new issues and existing comments made inaccurate by the change.
   - **Periodic rot audit** — focus on staleness, outdated references, and "will this still be true after the next likely refactor?"; accuracy still applies but long-term value (dimension 3) becomes the primary lens.

   Note the mode in the report Summary.

   ## Pre-Step: LOAD CONTEXT

   Before analyzing any comment, read these reference docs (if present):
   - `CLAUDE.md` — §Error Handling, §Backend Patterns, §Code Style (accuracy baseline for dimension 1)
   - `.agents/reference/backend-patterns.md` — canonical patterns (Express v5 `next(error)`, SQL.js `stmt.free()`, Zod boundary) — use these as the accuracy baseline; if a comment claims a pattern that contradicts this doc, it is a Critical Issue
   - `.agents/reference/frontend-patterns.md` — canonical UI patterns for frontend component docs

   On conflict between these docs and the agent's embedded project knowledge (dimensions 1–4): the reference docs win. Flag any drift in the report.

   ## Analysis Framework

   **Execution Order**: For each comment or comment block in scope, apply ALL 5 dimensions in sequence BEFORE moving to the next comment. Do NOT analyze dimension 1 across all comments then dimension 2 — this loses the per-comment coherence.

   **"Comment" definition** for this agent:
   - Single-line `// ...` inline comments
   - Multi-line `/* ... */` blocks
   - JSDoc `/** ... */` blocks on functions, classes, types, or interfaces
   - Suppression comments (`// @ts-ignore`, `// eslint-disable`) — analyze the justification if present
   - React JSX comments `{/* ... */}`

   When analyzing comments, you will:

   {Keep existing dimensions 1–5 VERBATIM — Verify Factual Accuracy / Assess Completeness / Evaluate Long-term Value / Identify Misleading Elements / Suggest Improvements.}

   **CHECKPOINT (after all 5 dimensions for all comments in scope):**
   - [ ] Every comment analyzed across all 5 dimensions
   - [ ] Every Critical Issue has: `file:line`, issue description, specific suggested fix
   - [ ] Every Improvement Opportunity has: `file:line`, current state, specific suggestion
   - [ ] Every Recommended Removal has: `file:line`, clear rationale
   - [ ] Aggregation applied to repeated patterns (see below)

   ### 6. CLASSIFY RECURRENCES

   After all comments are analyzed, scan findings for patterns:

   **Aggregation**: If the same finding type (same inaccuracy root cause + same fix pattern) appears more than 3 times, group into a single aggregated finding.

   **System Evolution**: For patterns appearing ≥3 times:
   - `rule-violation` — the correct pattern IS documented in CLAUDE.md / `.agents/reference/backend-patterns.md`; authors aren't reflecting it in comments. Recommendation: add a comment template or JSDoc standard.
   - `rule-gap` — the correct pattern is NOT documented anywhere. Authors write inaccurate comments because the convention isn't visible enough. Recommendation: promote to CLAUDE.md §AI Gotchas or a new `.agents/reference/` doc.

   ## Cross-Agent Coordination

   When multiple agents run on the same change:
   - `code-reviewer` — may flag misleading comments as "unclear code." Pull that finding into Critical Issues and provide full 5-dimension analysis.
   - `type-design-analyzer` — may flag JSDoc on types that doesn't match the Zod schema. Pull that finding into Improvement Opportunities.
   - `silent-failure-hunter` — may flag incorrect error-propagation descriptions (e.g., "returns null on error" when code actually calls `next(error)`). Pull that finding into Critical Issues.
   - `code-simplifier` — removes obvious-code comments (its principle #3). Don't re-flag those removals.

   **On domain conflict**: this agent wins for comment quality. Specialist agents win in their domains.

   ## Output Format

   ### Top-Level Statistics Block (always at the start)

   ```
   ## Comment Analysis Report

   Mode: {New/Changed comment review | Periodic rot audit}
   Scope: {N} files | {M} comment blocks examined
   Findings: Critical {N}  |  Improvements {N}  |  Recommended Removals {N}  |  Positive {N}
   ```

   ### Report Sections

   **Summary**:
   - Mode and scope (1 line)
   - Coverage quality: High / Medium / Low comment quality overall
   - Key finding themes (1–2 sentences)
   - Close with: "All findings are advisory. Do not modify code or comments without human review."

   **Critical Issues** — factually incorrect or highly misleading:
   - Location: [file:line]
   - Issue: [what is wrong and how it misleads]
   - Suggestion: [recommended fix — show the corrected comment text]

   **Improvement Opportunities** — comments that could be enhanced:
   - Location: [file:line]
   - Current state: [what's lacking or imprecise]
   - Suggestion: [how to improve — show the improved comment text]

   **Recommended Removals** — comments that add no value or create confusion:
   - Location: [file:line]
   - Rationale: [why removing improves the codebase — "the code is self-explanatory" or "this comment will rot immediately"]

   **Aggregated Findings** (same issue in >3 places):
   ```
   [Aggregated — {count} occurrences] {issue summary} ({Critical | Improvement | Removal})
   Files: {file:line list}
   Root cause: {shared underlying reason}
   Recommended fix (apply uniformly):
     // {corrected comment pattern}
   System Evolution: {rule-violation | rule-gap} — see section below
   ```

   **System Evolution** (optional — emit only when triggered by step 6):
   **Pattern**: {description of recurring inaccuracy}
   **Occurrences**: {count}
   **Classification**: `rule-violation` | `rule-gap`
   **Recommended action**:
   - `rule-violation` → "Consider adding a comment template to CLAUDE.md for this pattern. Optionally: /rca 'why do authors consistently misrepresent {pattern}?'"
   - `rule-gap` → "Summarize the correct pattern for human addition to CLAUDE.md §Code Style or .agents/reference/backend-patterns.md"

   **Positive Findings** — well-written examples:
   - Location: [file:line]
   - Why it's exemplary: [what makes this comment valuable for future maintainers]

   ### Empty-State Message

   If no issues found: `✓ All analyzed comments are accurate, complete, and appropriately valuable. No comment rot detected in scope.`

   Even in the empty-state, include at least 1 Positive Finding if any exemplary comments exist.

   ### Next Steps

   ```
   ## Next Steps
   - Address Critical Issues first (factually incorrect / highly misleading)
   - Apply Recommended Removals: confirm code remains self-explanatory without the comment
   - Apply Improvement Opportunities: use the suggested rewrite or add the missing context
   - For aggregated findings: apply the fix uniformly to all listed locations
   - If System Evolution flagged a rule-gap: summarize the correct pattern for human addition to CLAUDE.md §Code Style
   - After all changes: /validate to confirm no accidental code changes occurred
   - Proceed to /commit

   All findings are advisory. Do not modify code or comments without human review.
   ```

   ## IMPORTANT: Role Boundary

   {Keep the existing IMPORTANT role-boundary statement VERBATIM at the end:
   "You analyze and provide feedback only. Do not modify code or comments directly. Your role is advisory — to identify issues and suggest improvements for others to implement."}

   ## Example — Populated Report

   ```
   ## Comment Analysis Report

   Mode: New/Changed comment review
   Scope: 3 files | 8 comment blocks examined
   Findings: Critical 1  |  Improvements 2  |  Recommended Removals 1  |  Positive 2

   ---

   **Summary**

   New/Changed comment review — 3 changed files, 8 comments examined. Overall quality is **Medium**: the SQL.js service documentation is accurate but contains one critical misrepresentation of the try/finally pattern, and two inline comments restate what the code already makes obvious. One Recommended Removal would reduce noise.

   All findings are advisory. Do not modify code or comments without human review.

   ---

   **Critical Issues (1)**

   - **Location**: `server/src/services/flags.ts:45`
   - **Issue**: Comment reads `// Frees the statement after execution completes` — this implies `stmt.free()` runs *after* the function returns. In reality, `stmt.free()` runs in a `finally` block, which means it also runs when exceptions are thrown. The comment misrepresents the resource-cleanup guarantee.
   - **Suggestion**:
     ```ts
     // stmt.free() runs in finally to guarantee cleanup — even when bind() or step() throws
     ```

   ---

   **Improvement Opportunities (2)**

   - **Location**: `server/src/routes/flags.ts:22`
   - **Current state**: `// Validate request body` — restates what `validate(CreateFlagSchema)` already expresses through its name and placement.
   - **Suggestion**: Remove this comment. If context is needed, explain the *why*: `// Zod validation runs before the handler — errors throw ValidationError, handled by error middleware`

   - **Location**: `server/src/middleware/error.ts:8`
   - **Current state**: `// Error handler` — redundant with the function name `errorHandler`.
   - **Suggestion**: Replace with a comment capturing the *contract*: `// Centralized handler for NotFoundError (404), ConflictError (409), ValidationError (400), and unhandled errors (500)`

   ---

   **Recommended Removals (1)**

   - **Location**: `client/src/api/flags.ts:3`
   - `// API functions for the flags endpoint` — the filename `flags.ts` inside `src/api/` already communicates this.
   - **Rationale**: This comment will immediately become stale if the file expands to cover multiple endpoints. Removing it doesn't reduce clarity.

   ---

   **Positive Findings (2)**

   - **Location**: `server/src/services/flags.ts:12`
   - `// Uses INTEGER 0/1 for enabled since SQL.js does not persist native booleans` — Excellent: explains the *why* (SQL.js constraint), references a non-obvious implementation detail, and will remain accurate regardless of refactors.

   - **Location**: `server/src/__tests__/flags.test.ts:5`
   - `// Resets in-memory DB before each test to prevent state leakage between tests` — Correctly documents the *why* of `_resetDbForTesting()` for future maintainers who may not know SQL.js test isolation requirements.

   ---

   ## Next Steps
   - Address Critical Issue at flags.ts:45 — update the `stmt.free()` comment
   - Remove the restatement-comments (2 Improvements + 1 Removal)
   - After changes: /validate to confirm no accidental code edits
   - Proceed to /commit

   All findings are advisory. Do not modify code or comments without human review.
   ```
   ```

4. **Do NOT change**:
   - The 5 analysis dimensions (Verify Factual Accuracy / Assess Completeness / Evaluate Long-term Value / Identify Misleading Elements / Suggest Improvements) — VERBATIM including all sub-bullets
   - Identity statement ("meticulous code comment analyzer... healthy skepticism... protect codebases from comment rot")
   - The IMPORTANT role-boundary statement at the end — VERBATIM
   - `color: green`
   - The 3 original `description` proactive examples

Do NOT change any source code. Only modify `.claude/agents/comment-analyzer.md`.
````

---

## Success Criteria

- [ ] **`tools: Read, Grep, Glob, Bash(git diff:*)` added** — read-only set matching role boundary ("do not modify code or comments") enforced at tool level (agent hygiene — **CRITICAL bug fix**)
- [ ] `model: inherit` changed to `model: opus` (agent hygiene)
- [ ] `description` preserves 3 proactive examples and adds "When NOT to use" paragraph routing to 4 specialist agents (agent hygiene)
- [ ] **Invocation Context** subsection explains when this fires in PIV chain (post-implement, before commit; relationship to `/review-pr`; note to run AFTER `silent-failure-hunter` and `code-reviewer`) (concept #26)
- [ ] **Scope** subsection with default (`git diff HEAD`), custom, empty-scope STOP (concept #26)
- [ ] **New-comment vs Periodic Rot Audit Distinction** with per-mode focus (default = accuracy-first; periodic = staleness-first) (concept #26)
- [ ] **Pre-Step LOAD CONTEXT**: CLAUDE.md §Error Handling + §Backend Patterns + `.agents/reference/backend-patterns.md` + `frontend-patterns.md` as accuracy baselines (concept #26, cross-ref Round 23)
- [ ] "When NOT to use" appended to `description` (agent hygiene)
- [ ] **Per-Comment Process** note added: apply all 5 dimensions per comment before moving to next; "comment" types defined (concept #27)
- [ ] **Step 6 CLASSIFY RECURRENCES** added with aggregation (>3 → single grouped finding) + System Evolution classification (rule-violation / rule-gap) (concept #27)
- [ ] **CHECKPOINT** after 5 dimensions / before CLASSIFY RECURRENCES with 5 items (concept #27)
- [ ] **Cross-Agent Coordination** section with domain routing to `code-reviewer`, `type-design-analyzer`, `silent-failure-hunter`, `code-simplifier` (concept #27)
- [ ] **Top-Level Statistics block** at start of output (mode, scope, findings counts) (concept #28)
- [ ] **Summary section schema** defined (mode + scope + quality + themes + advisory note) (concept #28)
- [ ] **Aggregated Findings format** in output with template (concept #28)
- [ ] **System Evolution output section** with rule-violation → comment-template / rule-gap → CLAUDE.md §Code Style (concept #28)
- [ ] **Empty-state message** defined ("✓ No comment rot detected in scope") (concept #28)
- [ ] **Next Steps block** with chain: Critical → Removals → Improvements → aggregation → rule-gap CLAUDE.md → `/validate` → `/commit` + advisory note (concept #29)
- [ ] **Rendered output example** with 1 Critical + 2 Improvements + 1 Removal + 2 Positive + Summary + Next Steps (concept #28)
- [ ] **Role boundary reinforced at tool level** — `tools:` only has read-only tools, no `Edit` or `Write` (concept #25, agent hygiene)
- [ ] 5 analysis dimensions preserved VERBATIM ✅
- [ ] IMPORTANT role-boundary statement preserved VERBATIM at end ✅
- [ ] `color: green`, 3 original `description` examples preserved ✅
