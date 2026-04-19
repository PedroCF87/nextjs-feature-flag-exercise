# Phase 4 — Agents: Round 16 — Audit `code-reviewer` Agent

**Target file**: `nextjs-feature-flag-exercise/.claude/agents/code-reviewer.md`
**Gold Standard concepts**: #15 (Human vs AI Validation Separation), #25 (Input → Process → Output)
**Agent-specific quality checks**: proactive `description` trigger, minimum-viable `tools`, identity statement, numbered process, structured output, confidence threshold
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Frontmatter**:
  - `name: code-reviewer`
  - `description`: 3 proactive examples with `<commentary>` blocks (filtering, flag form, shared types)
  - `model: opus`
  - `tools: Read, Grep, Glob, Bash`
  - `color: green`
- **Body length**: ~70 lines
- **Format**: Markdown headers (agent format — not command XML tags)

### Current Content Summary

Section-by-section breakdown of the current agent file:

1. **Frontmatter** (lines 1–7): YAML block with the 5 standard agent fields. The `description` field is exceptionally well-crafted — 3 realistic examples each with assistant thought-process and `<commentary>` explaining the trigger.

2. **Identity statement** (line 9): "You are an expert code reviewer specializing in modern TypeScript development with deep knowledge of this exercise project's conventions: Node.js ESM + Express v5 + SQL.js on the backend, React 19 + Vite + TanStack Query on the frontend, and Vertical Slice Architecture patterns from the Gold Standard codebase."

3. **Review Scope** (lines 11–13): Defaults to unstaged `git diff`; user may specify different files/scope.

4. **Core Review Responsibilities** (lines 15–21): 3 categories:
   - **Project Guidelines Compliance** — `import type`, `next(error)`, `stmt.free()`, Zod boundary, custom errors, naming
   - **Bug Detection** — logic errors, null/undefined, race conditions, resource leaks, SQL injection, performance
   - **Code Quality** — duplication, missing error handling, accessibility, separation of concerns

5. **Review Checklist** (lines 23–46) — three layer-specific checklists:
   - **Backend (server/)**: 8 bullet points covering `next(error)`, `stmt.free()` in try/finally, booleans as INTEGER, Zod at middleware boundary, custom errors, no `any`/use `import type`, services vs routes separation, parameterized queries
   - **Frontend (client/)**: 5 bullet points covering `useQuery`/`useMutation`, `cn()`, no hardcoded strings, file/component naming, `ComponentNameProps` interface
   - **Shared**: 3 bullet points covering `shared/types.ts`, no circular imports, strict mode

6. **Issue Confidence Scoring** (lines 48–57): 5 confidence bands (0–25 false positive / 26–50 minor / 51–75 valid low-impact / 76–90 important / 91–100 critical), with a hard filter: **"Only report issues with confidence ≥ 80."**

7. **Output Format** (lines 59–71): Severity mapping (Critical 91–100, Important 80–90). For each issue: severity, file:line, description with confidence, CLAUDE.md rule violated, concrete fix. Grouping: by severity. Empty-state: "✓ Code meets project standards. No high-confidence issues found."

### Strengths Already Present

- **Exceptional `description`** — 3 realistic proactive examples each with `<commentary>` explaining WHY the agent should be triggered, showing both the assistant's thought-process and specific project concerns (next(error), stmt.free, Zod, useQuery/Mutation misuse, type safety) ✅
- **Stack-specific identity** — names the exact tech stack (Node.js ESM, Express v5, SQL.js, React 19, Vite, TanStack Query) rather than generic "expert reviewer" ✅
- **Evidence-backed checklist** — 16 checklist items across 3 layers, each one a concrete, verifiable convention ✅
- **Project-specific gotchas captured** — `next(error)` vs manual response, `stmt.free()` in try/finally, INTEGER booleans, parameterized queries — these are exactly the items Gold Standard §17 calls "AI Gotchas" ✅
- **Confidence scale is quantitative** — 0–100 with 5 bands, not subjective adjectives ✅
- **Hard threshold enforced** — "Only report issues with confidence ≥ 80" prevents report noise ✅
- **Severity mapping concrete** — Critical = 91–100, Important = 80–90; derived from the confidence score, not an independent judgment call ✅
- **Specific output fields** — severity + file:line + confidence + CLAUDE.md rule violated + concrete fix; no wishy-washy "consider improving" ✅
- **Empty-state message** — clean checkmark confirmation rather than silence ✅
- **Focused philosophy** — "quality over quantity. Focus on issues that truly matter." ✅

### Issues Spotted Before Audit

1. **`Bash` is unrestricted** — the frontmatter declares `tools: Read, Grep, Glob, Bash` with no scoping. The agent only needs `git diff`, `git log`, `git blame` (per Review Scope). An unrestricted `Bash` gives the agent filesystem-modification power (rm, mv, chmod) that a read-only review agent should never have.

2. **No numbered process steps** — Review Scope, Core Review Responsibilities, Review Checklist, Issue Confidence Scoring, Output Format are all named sections, but the reader must reconstruct the execution order. Other agents (`silent-failure-hunter`, `type-design-analyzer`) use explicit numbered steps. Gold Standard §25 requires a clear Process stage.

3. **Empty-state message can be misread as approval** — "✓ Code meets project standards. No high-confidence issues found." A user skimming the output might interpret "meets project standards" as "ready to merge". Gold Standard §15 explicitly separates AI triage from human merge decisions; this phrasing conflates them.

4. **No "triage for human" framing** — Identity states "expert code reviewer" but never clarifies that the output is **input to human review**, not a merge verdict. The agent could be misused as an automated gatekeeper.

5. **No missing-`git diff` pre-condition** — if the repo is clean (no unstaged changes) and no user scope is provided, the command's behavior is undefined. Should STOP with a clear message.

6. **No `<example>` of output shape** — the Output Format section says "provide severity, file path, description, rule violated, fix" but does not show a rendered example finding. Other agents (`silent-failure-hunter`) do.

7. **Checklist overlaps with `silent-failure-hunter` and `type-design-analyzer`** — `next(error)` propagation is also `silent-failure-hunter`'s main beat; type design (no `any`, `import type`) is `type-design-analyzer`'s territory. No cross-reference note, which risks duplicate findings when multiple agents run on the same PR.

8. **No scope-to-layer classification step** — the agent has 3 layer checklists but no instruction to classify each changed file into a layer before applying the corresponding checklist. A smart agent will infer, but an explicit CLASSIFY step prevents errors.

9. **No aggregation rule for repeated findings** — if the same pattern violation (e.g., missing `next(error)`) appears in 10 routes, all 10 are reported individually. Would benefit from the aggregation rule used in `/check-ignores` and `/rca` audits.

10. **No output-format example for empty state vs findings** — the empty-state line is defined, but there's no example of a fully-rendered report with 2–3 findings to anchor format expectations.

---

## Concept-by-Concept Audit

### Concept #15 — Human vs AI Validation Separation

> Gold Standard §15 establishes that AI performs **pre-human triage** (bug finding, style checking, test-coverage analysis) while humans make the **final merge decision** based on business judgment, architectural coherence, and team dynamics. AI never claims merge-ready — it produces reports that feed human review.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Agent fulfills an AI code-review role | ✅ Strong | Primary responsibility explicitly "expert code reviewer" |
| Output is a triage report, not a verdict | ⚠️ Partial | Output format is report-shaped (findings + severity), but framing never states "this is for the human reviewer" |
| Empty-state does not claim approval | ⚠️ Partial | "✓ Code meets project standards" is approval-adjacent language — risks misinterpretation as merge-ready |
| Agent does not merge or commit | ✅ Implicit | Tools are `Read, Grep, Glob, Bash` — no `Edit`, no `Write`. Cannot modify code. |
| Confidence threshold prevents noise | ✅ Strong | ≥80 filter ensures only signal reaches the human |
| No claim of exhaustive coverage | ⚠️ Partial | "Be thorough but filter aggressively — quality over quantity" implies non-exhaustive, but never states "the human must still review issues below the threshold and architectural concerns" |

**Actions:**
- [ ] Append to **Identity** section: "You produce a **triage report for the human reviewer**. You do NOT approve or merge — your role ends at reporting findings above the confidence threshold. The human makes the final merge decision based on business judgment, architectural coherence, and team context that you cannot see."
- [ ] Change **empty-state message** from `✓ Code meets project standards. No high-confidence issues found.` to `✓ No high-confidence issues found by automated review. Human review still required — business judgment and architectural concerns are outside this agent's scope.`
- [ ] Add to **Output Format** a closing note: "Issues below confidence 80 are not reported. Architectural decisions, feature design, and business rules are outside this agent's scope — the human reviewer owns those."

---

### Concept #25 — Input → Process → Output

> Every agent must define all three stages clearly so the invoking context knows what scope to pass, what the agent does, and what format to expect back.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | "Review Scope" names the default (unstaged `git diff`) and custom-scope option, but no explicit pre-conditions. If `git diff` is empty and no scope provided, behavior is undefined. No context auto-loading (e.g., reading CLAUDE.md or `.agents/reference/*` — which the agent's checklist is meant to enforce) |
| **Process** | ❌ Missing | No numbered process. Review Scope → Core Responsibilities → Review Checklist → Confidence Scoring → Output Format are all named but unordered. Reader must reconstruct: (1) load diff, (2) classify by layer, (3) apply checklist, (4) score, (5) filter ≥80, (6) format output |
| **Output** | ⚠️ Partial | Fields defined (severity, file:line, description, rule, fix), grouping defined (by severity), empty-state defined — but no rendered example, no aggregation rule for repeated findings, no cross-agent de-duplication guidance |

**Actions:**
- [ ] Add an **explicit Process section** with 5 numbered steps (see Concept #27 below for detail): LOAD → CLASSIFY → APPLY CHECKLIST → SCORE → REPORT. Each step with a specific action and outcome.
- [ ] Add **Input pre-conditions**: (a) if `git diff` is empty and no scope, STOP with message; (b) auto-read CLAUDE.md for current conventions (checklist reflects CLAUDE.md as of agent creation, but may drift).
- [ ] Add **rendered Output examples** for both populated and empty states (see Concept #28 below).

---

### Concept #26 — Input Section Detail (agent-adapted)

> For agents: persona, pre-conditions on what to load, explicit scope handling. Agents don't use the command `<context>` tag but should have equivalent discipline.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ✅ Strong | Stack-specific identity — best in the codebase among agents |
| Default scope | ✅ Present | Unstaged `git diff` |
| Custom scope | ✅ Present | "The user may specify different files or scope" |
| Empty-scope handling | ❌ Missing | Not defined |
| Context auto-loading | ⚠️ Partial | Implicitly assumes CLAUDE.md is loaded by the parent agent; doesn't explicitly re-read it. Does not load `.agents/reference/backend-patterns.md`/`frontend-patterns.md` — the canonical pattern docs (from Round 23 audit) |
| PIV workflow positioning | ❌ Missing | Not stated when this agent fires (after `/implement`? before `/commit`? during `/review-pr`?) |

**Actions:**
- [ ] Add workflow positioning to **Identity or a new "Invocation Context" subsection**: "Invoked proactively after any non-trivial code change (feature implementation, bug fix, refactor). Typical callers: (a) the assistant itself after completing a logical chunk; (b) the user before `/commit`; (c) `/review-pr` as part of its pre-human-review triage pipeline. Not a replacement for `/review-pr` — this is a single-agent focused review; `/review-pr` orchestrates multiple agents."
- [ ] Add **empty-scope pre-condition**: "If `git diff` returns empty AND no scope was specified by the caller, reply: `No changes to review. Specify files/scope, or make changes first.` and stop."
- [ ] Add **On-Demand Context loading** (cross-ref Round 23): the agent should read `.agents/reference/backend-patterns.md` when reviewing backend files, and `.agents/reference/frontend-patterns.md` when reviewing frontend files — the canonical pattern docs, more authoritative than the checklist embedded in this agent (which can drift).
- [ ] Add **CLAUDE.md freshness note**: "Re-read `CLAUDE.md` at the start of each review session. The checklist in this agent reflects CLAUDE.md conventions as of agent creation; CLAUDE.md may have evolved. On conflict: CLAUDE.md wins."

---

### Concept #27 — Process Section Detail (agent-adapted)

> Numbered steps, tools specified, error handling, cross-reference rules.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered process steps | ❌ Missing | Sections named but not numbered |
| Tools match steps | ⚠️ Partial | `Bash` unrestricted — should be scoped to git subcommands |
| Error handling — empty diff | ❌ Missing | Not defined |
| Error handling — unreadable file | ❌ Missing | Not defined |
| Layer classification | ⚠️ Implicit | Checklist is layered, but no explicit step to classify each changed file |
| Aggregation for repeated findings | ❌ Missing | 10 routes missing `next(error)` → 10 findings |
| Cross-agent de-duplication | ❌ Missing | Overlaps with `silent-failure-hunter` (next(error)) and `type-design-analyzer` (any/import type) — no note on how to avoid duplicate findings when multiple agents run |
| Evidence-first | ✅ Strong | Confidence scoring forces evidence; `Bash(git log/blame)` would enable "when was this line introduced" context |

**Actions:**
- [ ] Rewrite the execution flow as an explicit **5-step numbered process**:

  ```markdown
  ## Process

  1. **LOAD** — Determine scope.
     - Default: `git diff` (unstaged changes).
     - If user specified files/paths, use those.
     - **Empty-scope STOP**: if both are empty, reply "No changes to review" and exit.
     - Re-read `CLAUDE.md` (conventions may have evolved since agent creation).
     - If any changed file is in `server/`, read `.agents/reference/backend-patterns.md` (if present).
     - If any changed file is in `client/`, read `.agents/reference/frontend-patterns.md` (if present).

  2. **CLASSIFY** — Group changed files by layer:
     - Backend: `server/src/**`
     - Frontend: `client/src/**`
     - Shared: `shared/**`
     - Config/other: flag separately (rarely triggers checklist findings)

  3. **APPLY CHECKLIST** — For each file, apply the matching layer's checklist items. Record potential findings with evidence (code snippet at file:line).

  4. **SCORE** — Rate each potential finding 0–100 confidence using the existing scale. Discard anything below 80.

  5. **REPORT** — Group by severity (Critical 91–100, Important 80–90); apply aggregation rule (below); emit per Output Format.
  ```

- [ ] Add **aggregation rule** to Step 5: "If the same violation (same rule + same fix pattern) appears in more than 3 files, group into a single aggregated finding with a file list. Example: 'Missing `next(error)` in catch — 5 occurrences across `server/src/routes/flags.ts:42, :78, :119, server/src/routes/users.ts:33, :87`. Fix: apply the same refactor to all 5.'"

- [ ] Add **cross-agent de-duplication note**: "When invoked alongside other agents:
  - `silent-failure-hunter` owns error-propagation analysis in depth; this agent should flag the violation once and defer detailed recommendation to `silent-failure-hunter` if it runs.
  - `type-design-analyzer` owns type-design judgments (union vs enum, Zod alignment); this agent should flag the rule violation (`no-explicit-any`, missing `import type`) but defer structural type feedback.
  - `comment-analyzer` owns comment accuracy; this agent should not critique comments.
  - On conflict between agents: the specialist agent wins for its domain."

- [ ] Add **error handling**:
  - **Unreadable file**: if a changed file cannot be read (permissions, encoding), skip it and note in the report: `⚠️ Could not read {path} — {reason}. Exclude from this report; human reviewer should verify manually.`
  - **Unknown layer**: if a changed file is outside `server/`, `client/`, `shared/` (e.g., `scripts/`, `.github/`), apply only the generic TypeScript/strict-mode checks; note in the report that no layer-specific checklist was applied.

- [ ] **Tighten `tools` scoping** (also covered in Frontmatter Quality below): replace unrestricted `Bash` with specific git subcommands.

---

### Concept #28 — Output Section Detail (agent-adapted)

> Structured, specific, rendered-example-bearing, free of over-claim.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Output fields defined | ✅ Strong | Severity, file:line, description, confidence, CLAUDE.md rule, fix |
| Grouping defined | ✅ Strong | By severity (Critical / Important) |
| Empty-state defined | ⚠️ Partial | Message exists but risks misreading as merge-ready |
| Rendered example | ❌ Missing | No concrete example of a populated report |
| Aggregated-finding format | ❌ Missing | No format for grouped findings |
| Cross-reference notes | ❌ Missing | No note when another agent would cover the same finding better |
| Downstream chain hint | ❌ Missing | After report, what should the user do? (fix highest-severity first? invoke `/rca` on unclear items?) |

**Actions:**
- [ ] Add a **rendered example** showing both a populated report and the empty-state message. For a populated report:

  ```markdown
  ## Example Output — Populated Report

  Reviewing: 3 changed files (2 backend, 1 frontend)
  References consulted: CLAUDE.md, .agents/reference/backend-patterns.md

  ### Critical (1)

  **[`server/src/routes/flags.ts:47`]** — Missing `next(error)` propagation (confidence: 95)
  - **Rule violated**: CLAUDE.md §Error Handling — "Routes use `next(error)` — never `res.status().json()` for errors mid-flow"
  - **Current**:
    ```ts
    catch (error) { res.status(500).json({ error: 'something went wrong' }); }
    ```
  - **Fix**:
    ```ts
    catch (error) { next(error); }  // centralized error middleware handles the response
    ```
  - **Cross-reference**: `silent-failure-hunter` covers error-propagation in depth — run it for the full audit.

  ### Important (2)

  **[Aggregated — 4 occurrences]** Missing `import type` for type-only imports (confidence: 85)
  - **Files**: `client/src/api/flags.ts:3`, `client/src/components/flags-table.tsx:1`, `client/src/components/flag-form-modal.tsx:1`, `shared/types.ts:1`
  - **Rule violated**: CLAUDE.md §Code Style — "Use `type` imports — `import type { FeatureFlag } from '@shared/types'`"
  - **Fix pattern**: change `import { FeatureFlag } from ...` to `import type { FeatureFlag } from ...`
  - **Cross-reference**: `type-design-analyzer` for deeper type-design review.

  **[`server/src/services/flags.ts:89`]** — SQL.js statement not freed in finally (confidence: 90)
  - **Rule violated**: CLAUDE.md §Backend Patterns — "SQL.js statements: Always use `try-finally` with `stmt.free()`"
  - **Current**:
    ```ts
    const stmt = db.prepare(sql);
    stmt.bind([id]);
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();  // not in finally — leaks on exception
    ```
  - **Fix**:
    ```ts
    const stmt = db.prepare(sql);
    try {
      stmt.bind([id]);
      return stmt.step() ? stmt.getAsObject() : null;
    } finally {
      stmt.free();
    }
    ```
  - **Cross-reference**: `silent-failure-hunter` owns this pattern in depth.

  ---

  **Summary**: 1 Critical, 2 Important (1 aggregated over 4 files). Fix Critical first, then Important.

  **Next steps**:
  - Address findings in order of severity.
  - For unclear root causes: `/rca "<symptom>"`.
  - After fixes: run `/validate` to confirm the suite passes.
  - Then proceed to `/commit` or `/review-pr`.

  **Human review still required** — this report covers automated checks only. Architectural concerns, business logic correctness, and feature design are outside this agent's scope.
  ```

- [ ] Add a **rendered empty-state example**:
  ```markdown
  ## Example Output — Empty State

  Reviewing: 2 changed files (1 backend, 1 shared)
  References consulted: CLAUDE.md, .agents/reference/backend-patterns.md

  ✓ No high-confidence issues found by automated review.

  **Human review still required** — business judgment, architectural coherence, and team context are outside this agent's scope.
  ```

- [ ] Add **downstream chain hints** to the Summary line: after the count, suggest `/rca` for unclear cases and `/validate` after fixes (aligning with how `/check-ignores` and `/rca` audits end).

---

### Agent-Specific Quality Checks

Beyond the Gold Standard concepts, agents must meet quality bars specific to the agent format.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `description` contains "use proactively when…" trigger | ✅ Strongest | 3 realistic examples with `<commentary>` — arguably the best `description` in the codebase |
| `description` specifies when NOT to use | ❌ Missing | Doesn't say "do not use for comment review (use `comment-analyzer`)" or "do not use for type-design deep-dive (use `type-design-analyzer`)" |
| Minimum-viable `tools` | ❌ **Major gap** | `Bash` unrestricted gives write/delete power to a read-only reviewer |
| Identity statement | ✅ Strong | Stack-specific, concrete |
| Numbered process | ❌ Missing | Sections named but unordered |
| Output format specified | ✅ Strong | Fields + grouping + empty-state defined |
| Confidence threshold | ✅ Strong | ≥80 filter with 5-band scale |
| Rendered output example | ❌ Missing | No concrete example for populated or empty cases |
| Cross-agent coordination | ❌ Missing | No de-duplication guidance when multiple agents run |

**Actions:**
- [ ] **Tighten `tools`**: change `tools: Read, Grep, Glob, Bash` to `tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git blame:*)`. Justification: a read-only review agent must not have unscoped `Bash` (no `rm`, `mv`, `chmod`, arbitrary script execution). The agent legitimately needs `git diff` (default scope), `git log` (commit history for a file under review), `git blame` (when a suspicious pattern was introduced — feeds the evidence chain).
- [ ] Add a "When NOT to use" note to the `description` field (either as a 4th example with inverted commentary, or a prose addition):
  - For comment-rot analysis: use `comment-analyzer` instead
  - For deep type-design judgments (encapsulation, invariants): use `type-design-analyzer`
  - For error-propagation audit in depth: use `silent-failure-hunter`
  - For test-coverage analysis of a PR: use `pr-test-analyzer`
  - This agent handles **general code-quality review**; the specialists handle domain-specific reviews.
- [ ] Everything else already covered by the concept actions above.

---

## Action Plan Summary

### Priority 1 — Agent Hygiene (security + tool scoping)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Tighten `tools` — scope `Bash` to `Bash(git diff:*), Bash(git log:*), Bash(git blame:*)` | Agent hygiene / security |

### Priority 2 — Human-AI Separation (concept #15)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Identity: append "triage report for human reviewer; does not approve or merge" statement | #15 |
| 2.2 | Empty-state message: replace "Code meets project standards" with non-approval phrasing + human-review reminder | #15 |
| 2.3 | Output Format footer: note that issues <80 confidence and architectural concerns are outside scope | #15 |

### Priority 3 — Explicit Process (concept #25, #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add 5-step numbered process: LOAD → CLASSIFY → APPLY CHECKLIST → SCORE → REPORT | #25, #27 |
| 3.2 | Empty-scope STOP pre-condition | #27 |
| 3.3 | CLAUDE.md re-read at start of LOAD step | #26 |
| 3.4 | On-Demand Context loading: `.agents/reference/backend-patterns.md` + `frontend-patterns.md` (cross-ref Round 23) | #26 |
| 3.5 | Unreadable-file and unknown-layer handling | #27 |
| 3.6 | Aggregation rule: >3 same-pattern violations → single grouped finding | #27 |
| 3.7 | Cross-agent de-duplication: defer specialist domains to `silent-failure-hunter`, `type-design-analyzer`, `comment-analyzer` | #27 |

### Priority 4 — Workflow Positioning (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Add "Invocation Context" subsection explaining when this agent fires (post-implementation, pre-commit, within `/review-pr`) | #26 |
| 4.2 | Add "When NOT to use" note to `description` — route users to specialist agents | Agent hygiene |

### Priority 5 — Output Enhancement (concept #28)

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Add rendered example of populated report (with Critical + Important + Aggregated) | #28 |
| 5.2 | Add rendered example of empty-state with human-review reminder | #28 |
| 5.3 | Add Summary line with downstream chain hints (`/rca`, `/validate`) | #29 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§15, §25, §26, §27, §28)
2. `.claude/agents/code-reviewer.md` — current agent
3. `docs/Gold-Standard-Plan/phases/phase-4-agents/round-16-audit-code-reviewer.md` — this audit
4. `.claude/agents/silent-failure-hunter.md` — for cross-agent coordination reference
5. `.claude/agents/type-design-analyzer.md` — for cross-agent coordination reference
6. `docs/Gold-Standard-Plan/phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md` — for `.agents/reference/*` loading pattern

Rewrite `.claude/agents/code-reviewer.md` with these requirements:

1. **Frontmatter** — tighten `tools`:
   ```
   ---
   name: code-reviewer
   description: {keep existing — 3 proactive examples with <commentary>; ADD one paragraph at the end (see step 2)}
   model: opus
   tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git blame:*)
   color: green
   ---
   ```
   Justification: a read-only review agent must not have unscoped `Bash` — no `rm`, `mv`, `chmod`, arbitrary scripts. The scoped git subcommands cover the legitimate needs (default diff, historical context, blame for evidence chains).

2. **Append to `description`** (keep the 3 existing examples verbatim; add a "When NOT to use" paragraph at the end):
   > **When NOT to use this agent**:
   > - For comment-rot / docstring accuracy: use `comment-analyzer` instead.
   > - For deep type-design judgments (encapsulation, invariants, Zod-schema alignment): use `type-design-analyzer`.
   > - For error-propagation audit in depth: use `silent-failure-hunter`.
   > - For test-coverage analysis of a PR: use `pr-test-analyzer`.
   > This agent handles **general code-quality review** across all layers; the specialist agents handle their domains in depth. On conflict, the specialist wins for its domain.

3. **Body — replace the current structure with these sections in order:**

   ```markdown
   You are an expert code reviewer specializing in modern TypeScript development with deep knowledge of this exercise project's conventions: Node.js ESM + Express v5 + SQL.js on the backend, React 19 + Vite + TanStack Query on the frontend, and Vertical Slice Architecture patterns from the Gold Standard codebase.

   You produce a **triage report for the human reviewer**. You do NOT approve or merge — your role ends at reporting findings above the confidence threshold. The human makes the final merge decision based on business judgment, architectural coherence, and team context that you cannot see.

   ## Invocation Context

   Invoked proactively after any non-trivial code change (feature implementation, bug fix, refactor). Typical callers:
   - The assistant itself, after completing a logical chunk of work.
   - The user, before `/commit` as a pre-commit sanity check.
   - The `/review-pr` command, as part of its orchestrated multi-agent pre-human-review pipeline.

   Not a replacement for `/review-pr` — this is a single-agent focused review; `/review-pr` coordinates multiple specialists.

   ## Process

   1. **LOAD** — Determine scope.
      - Default: `git diff` (unstaged changes).
      - If the user specified files/paths, use those.
      - **Empty-scope STOP**: if both are empty, reply `No changes to review. Specify files/scope, or make changes first.` and exit.
      - Re-read `CLAUDE.md` at the start of each review session (conventions may have evolved since this agent was created).
      - If any changed file is in `server/`, also read `.agents/reference/backend-patterns.md` (if present).
      - If any changed file is in `client/`, also read `.agents/reference/frontend-patterns.md` (if present).

   2. **CLASSIFY** — Group changed files by layer:
      - Backend: `server/src/**`
      - Frontend: `client/src/**`
      - Shared: `shared/**`
      - Other (config, scripts, CI): apply only generic TypeScript/strict-mode checks; note in the report that no layer-specific checklist was applied.
      - If a file is unreadable (permissions, encoding), skip it and note in the report.

   3. **APPLY CHECKLIST** — For each file, apply the matching layer's checklist (below). Record potential findings with code evidence at `file:line`.

   4. **SCORE** — Rate each potential finding 0–100 confidence using the scale below. Discard anything below 80.

   5. **REPORT** — Group by severity (Critical 91–100, Important 80–90); apply the aggregation rule (below); emit per Output Format.

   ## Review Checklist

   **Backend (`server/`):**
   - Routes use `next(error)` — never `res.status().json()` for errors mid-flow
   - SQL.js statements use `stmt.free()` inside `try/finally`
   - Booleans stored as INTEGER (0/1) in SQL.js queries
   - Input validated with Zod at middleware boundary before service call
   - Custom errors used: `NotFoundError`, `ConflictError`, `ValidationError`
   - No `any` types; `import type` for type-only imports
   - Services contain business logic; routes only delegate
   - Parameterized queries via `db.prepare()` + `stmt.bind()` — never string interpolation

   **Frontend (`client/`):**
   - `useQuery` for reads, `useMutation` for writes (with proper invalidation)
   - `cn()` used for all Tailwind class composition
   - No hardcoded strings in UI (use typed constants or shared types)
   - Component files: kebab-case filenames, PascalCase component names
   - Props defined as explicit `ComponentNameProps` interface

   **Shared:**
   - New domain fields start in `shared/types.ts`
   - No circular imports between layers
   - TypeScript strict mode — no `any`, no `@ts-ignore` without justification (cross-reference with `/check-ignores` if suppressions are present)

   ## Aggregation Rule

   If the same violation (same rule + same fix pattern) appears in more than 3 files, group into a single aggregated finding with a file list. Prevents report noise.

   Example:
   > **[Aggregated — 5 occurrences]** Missing `next(error)` in catch blocks
   > **Files**: `server/src/routes/flags.ts:42`, `:78`, `:119`, `server/src/routes/users.ts:33`, `:87`
   > **Fix pattern**: Replace `res.status(500).json(...)` with `next(error)` in each catch.

   ## Cross-Agent Coordination

   When multiple agents run on the same change:
   - `silent-failure-hunter` owns error-propagation analysis in depth — flag violations once; defer detailed recommendation to that agent if it runs.
   - `type-design-analyzer` owns type-design judgments — flag rule violations (`no-explicit-any`, missing `import type`); defer structural feedback.
   - `comment-analyzer` owns comment accuracy — do not critique comments in this report.
   - On domain conflict, the specialist wins.

   ## Issue Confidence Scoring

   Rate each issue from 0–100:
   - **0–25**: Likely false positive or pre-existing issue
   - **26–50**: Minor nitpick not explicitly in CLAUDE.md
   - **51–75**: Valid but low-impact issue
   - **76–90**: Important issue requiring attention
   - **91–100**: Critical bug or explicit CLAUDE.md violation

   **Only report issues with confidence ≥ 80.**

   ## Output Format

   Start by listing what you're reviewing (file count + layer breakdown + references consulted). For each high-confidence issue provide:
   - Severity (Critical: 91–100, Important: 80–90)
   - File path and line number
   - Clear description with confidence score
   - Specific CLAUDE.md rule or `.agents/reference/*.md` pattern violated
   - Concrete fix suggestion with before/after code
   - Cross-reference (optional): which specialist agent owns this domain in depth

   Group issues by severity (Critical first, then Important). Apply the aggregation rule. Close with a Summary line stating counts and downstream chain suggestions.

   ### Example — Populated Report

   ```
   Reviewing: 3 changed files (2 backend, 1 frontend)
   References consulted: CLAUDE.md, .agents/reference/backend-patterns.md

   ### Critical (1)

   **[`server/src/routes/flags.ts:47`]** — Missing `next(error)` propagation (confidence: 95)
   - **Rule violated**: CLAUDE.md §Error Handling — "Routes use `next(error)` — never `res.status().json()` for errors mid-flow"
   - **Current**: `catch (error) { res.status(500).json({ error: 'something went wrong' }); }`
   - **Fix**: `catch (error) { next(error); }  // centralized error middleware handles the response`
   - **Cross-reference**: `silent-failure-hunter` covers error-propagation in depth.

   ### Important (2)

   **[Aggregated — 4 occurrences]** Missing `import type` for type-only imports (confidence: 85)
   - **Files**: client/src/api/flags.ts:3, client/src/components/flags-table.tsx:1, client/src/components/flag-form-modal.tsx:1, shared/types.ts:1
   - **Rule violated**: CLAUDE.md §Code Style — "Use `type` imports"
   - **Fix pattern**: `import { FeatureFlag }` → `import type { FeatureFlag }`
   - **Cross-reference**: `type-design-analyzer` for deeper type-design review.

   **[`server/src/services/flags.ts:89`]** — SQL.js statement not freed in finally (confidence: 90)
   - **Rule violated**: CLAUDE.md §Backend Patterns — "SQL.js statements: Always use try-finally with stmt.free()"
   - **Current**: stmt.free() after stmt.step() — leaks on exception
   - **Fix**: wrap stmt.bind()+step() in try block, stmt.free() in finally
   - **Cross-reference**: `silent-failure-hunter` owns this pattern in depth.

   ---

   **Summary**: 1 Critical, 2 Important (1 aggregated over 4 files). Fix Critical first, then Important.

   **Next steps**:
   - Address findings in order of severity.
   - For unclear root causes: `/rca "<symptom>"`.
   - After fixes: `/validate` to confirm the suite passes.
   - Then proceed to `/commit` or `/review-pr`.

   **Human review still required** — this report covers automated checks only. Architectural concerns, business logic correctness, and feature design are outside this agent's scope.
   ```

   ### Example — Empty State

   ```
   Reviewing: 2 changed files (1 backend, 1 shared)
   References consulted: CLAUDE.md, .agents/reference/backend-patterns.md

   ✓ No high-confidence issues found by automated review.

   **Human review still required** — business judgment, architectural coherence, and team context are outside this agent's scope.
   ```

   Issues below confidence 80 are not reported. Architectural decisions, feature design, and business rules are outside this agent's scope — the human reviewer owns those.
   ```

4. **Do NOT change**:
   - The 3 proactive `description` examples (they are exemplary)
   - `model: opus`, `color: green`
   - The stack-specific opening of the identity statement
   - The three layer-specific checklists (content — only reformat into the new Process structure)
   - The confidence scoring scale (0–100 with 5 bands)
   - The ≥80 reporting threshold
   - The severity mapping (Critical 91–100, Important 80–90)

Do NOT change any source code. Only modify `.claude/agents/code-reviewer.md`.
````

---

## Success Criteria

- [ ] `tools` scoped to `Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git blame:*)` — no unrestricted `Bash` (agent hygiene / security)
- [ ] `description` preserves 3 proactive examples and adds a "When NOT to use" paragraph routing to specialist agents (agent hygiene)
- [ ] Identity appended with "triage report for human reviewer; does not approve or merge" framing (concept #15)
- [ ] Empty-state message rewritten to not imply approval; human-review reminder included (concept #15)
- [ ] Output Format footer notes that issues <80 confidence and architectural concerns are out of scope (concept #15)
- [ ] New **Invocation Context** subsection explains when this agent fires (post-implementation, pre-commit, within `/review-pr`) (concept #26)
- [ ] New **Process** section with 5 numbered VERB-labeled steps: LOAD → CLASSIFY → APPLY CHECKLIST → SCORE → REPORT (concepts #25, #27)
- [ ] Empty-scope STOP pre-condition in LOAD step (concept #27)
- [ ] CLAUDE.md re-read at start of LOAD step (concept #26)
- [ ] On-Demand Context loading: `.agents/reference/backend-patterns.md` + `frontend-patterns.md` when relevant files present (concept #26, cross-ref Round 23)
- [ ] Unreadable-file and unknown-layer handling defined (concept #27)
- [ ] Aggregation Rule section with concrete example (concept #27)
- [ ] Cross-Agent Coordination section with domain routing to `silent-failure-hunter`, `type-design-analyzer`, `comment-analyzer` (concept #27)
- [ ] Rendered example of populated report with Critical + Important + Aggregated findings (concept #28)
- [ ] Rendered example of empty-state with human-review reminder (concept #28)
- [ ] Summary line includes downstream chain hints: `/rca`, `/validate` (concept #29)
- [ ] All 3 layer-specific checklists preserved verbatim (only reformatted into the new Process structure)
- [ ] Confidence scoring scale, ≥80 threshold, severity mapping preserved ✅
- [ ] `model: opus`, `color: green`, stack-specific identity opening preserved ✅
