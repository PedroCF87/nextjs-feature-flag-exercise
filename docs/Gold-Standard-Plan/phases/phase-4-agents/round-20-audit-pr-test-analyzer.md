# Phase 4 — Agents: Round 20 — Audit `pr-test-analyzer` Agent

**Target file**: `nextjs-feature-flag-exercise/.claude/agents/pr-test-analyzer.md`
**Gold Standard concepts**: #15 (Validation Separation — AI runs/analyzes tests), #25 (Input → Process → Output)
**Agent-specific quality checks**: proactive `description` trigger, minimum-viable `tools`, identity, numbered process, structured output, rating system
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Frontmatter**:
  - `name: pr-test-analyzer`
  - `description`: 3 proactive examples with `<commentary>` (new functionality PR, Zod validation schemas, pre-ready-to-merge check)
  - `model: inherit`
  - `color: cyan`
  - **`tools:` field — NOT PRESENT** (critical gap)
- **Body length**: ~100 lines
- **Format**: Markdown headers (agent format)

### Current Content Summary

Section-by-section breakdown of the agent file:

1. **Frontmatter** (lines 1–6): Standard agent YAML but missing the `tools:` field entirely. The agent relies on inherited tools from the parent agent pool, which is implicit and fragile — it could inherit anything depending on invocation context.

2. **Identity statement** (line 8): "You are an expert test coverage analyst specializing in pull request review. Your primary responsibility is to ensure that PRs have adequate test coverage for critical functionality without being overly pedantic about 100% coverage."

3. **Core Responsibilities** (lines 10–20) — 4 responsibilities:
   - **Analyze Test Coverage Quality**: behavioral coverage over line coverage; identify critical paths, edge cases, error conditions
   - **Identify Critical Gaps**: untested error handling, missing edge cases, uncovered business logic, absent negative test cases, missing async/concurrent behavior tests
   - **Evaluate Test Quality**: tests should test behavior/contracts not implementation details; resilient to refactoring; DAMP principles (Descriptive and Meaningful Phrases); would catch regressions
   - **Prioritize Recommendations**: specific failure examples, criticality rating 1–10, regression explanation, check if existing tests might already cover it

4. **Analysis Process** (lines 22–32) — 6 steps:
   - Examine PR changes to understand new functionality
   - Review accompanying tests to map coverage to functionality
   - Identify critical paths that could cause production issues if broken
   - Check for tests too tightly coupled to implementation
   - Look for missing negative cases and error scenarios
   - Consider integration points and test coverage

5. **Rating Guidelines** (lines 34–40) — criticality scale:
   - **9–10**: Critical functionality → data loss, security, system failures
   - **7–8**: Important business logic → user-facing errors
   - **5–6**: Edge cases → confusion or minor issues
   - **3–4**: Nice-to-have completeness
   - **1–2**: Minor optional improvements

6. **Output Format** (lines 42–51) — 5-section structure:
   - Summary (brief quality overview)
   - Critical Gaps (rated 8–10, must add)
   - Important Improvements (rated 5–7, should consider)
   - Test Quality Issues (brittle or implementation-overfit tests)
   - Positive Observations (well-tested code + best practices followed)

7. **Important Considerations** (lines 53–62): 9 pragmatic bullets:
   - Focus on tests that prevent real bugs
   - Consider project testing standards from CLAUDE.md if available
   - Some code paths may be covered by existing integration tests
   - Avoid suggesting tests for trivial getters/setters
   - Consider cost/benefit of each suggested test
   - Be specific about what each test should verify and why
   - Note when tests are testing implementation rather than behavior
   - Identity is "thorough but pragmatic"
   - Good tests fail when **behavior** changes, not **implementation**

8. **Project-Specific Test Patterns** (lines 64–100) — the strongest section:
   - **Backend Tests (Vitest + SQL.js)** — 5 critical items:
     - `_resetDbForTesting()` in `beforeEach` for database isolation
     - SQL.js resource cleanup tested: verify `stmt.free()` called in `try/finally`
     - Error propagation: services throw custom errors (`NotFoundError`, `ConflictError`, `ValidationError`)
     - Validation boundary: Zod schemas reject invalid inputs before service calls
     - SQL.js constraints: booleans stored as INTEGER (0/1), not native booleans
   - **Frontend Tests** (future): TanStack Query, form validation, component integration (noted as "if added in future")
   - **Critical Coverage Gaps to Flag (confidence ≥9)**: 5 patterns:
     - Service methods without error case tests
     - SQL queries without parameterization tests (SQL injection risk)
     - Validation schemas without negative case tests
     - Resource cleanup (`stmt.free()`) not verified in `finally` block
     - Routes not verifying `next(error)` on service failures
   - **Nice-to-Have Coverage (confidence 5–7)**: 3 patterns:
     - Multiple filter combinations in query string parsing
     - Edge cases for empty result sets
     - Concurrent request handling (if applicable)

### Strengths Already Present

- **Proactive description** with 3 project-specific examples — each with `<commentary>` that names concrete test patterns (`_resetDbForTesting()`, error propagation with `next(error)`, SQL.js resource cleanup) ✅
- **Behavioral coverage over line coverage** principle stated explicitly ✅
- **"Thorough but pragmatic"** philosophy — avoids academic completeness for its own sake ✅
- **DAMP principles** named explicitly (Descriptive and Meaningful Phrases) ✅
- **Rating system 1–10** with 5 clear bands and corresponding action guidance ✅
- **5-section output** covering both gaps and positive observations — balanced reporting ✅
- **Critical coverage gaps** list is precisely calibrated: `stmt.free()` verification, `next(error)` verification, SQL injection via parameterization — the exact AI Gotchas of this project ✅
- **Negative test cases** explicitly called out as a gap to look for ✅
- **Tightly-coupled test detection** — looks for tests testing implementation details, not behavior ✅
- **"Consider if existing tests already cover it"** — prevents redundant test suggestions ✅
- **SQL.js-specific test patterns** (isolation via `_resetDbForTesting()`, INTEGER booleans) — not generic test advice ✅

### Issues Spotted Before Audit

1. **Missing `tools:` field in frontmatter** — The most critical bug. An agent without an explicit `tools:` field inherits tools from the invocation context. This means the agent might run with `Read, Edit, Bash` (from a coding session) or with `Read, Grep, Glob` (from a search session) depending on how it's invoked. An agent that might have `Edit` access could theoretically modify files — wrong for an analysis agent. The correct minimal set for test analysis is `Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(cd server && pnpm test:*)`.

2. **No scope pre-condition** — The analysis process starts with "examine the PR's changes" but doesn't define what that means in practice. No default scope (e.g., `git diff $(git merge-base HEAD origin/exercise-1)..HEAD`), no empty-diff handling, no guidance for when the user provides specific files vs. a branch.

3. **No Invocation Context** — Not stated when this agent fires in the workflow. It's clearly post-implementation, pre-merge, but its relationship to the PIV chain (`/implement` → tests → `/validate` → `/review-pr` → `/commit` → `/create-pr`) is not explicit.

4. **No `.agents/reference/*` loading** — Project has `.agents/reference/backend-patterns.md` which documents the expected test patterns (Vitest, `_resetDbForTesting()`, etc.). The agent embeds some of this knowledge but doesn't consult the canonical reference docs.

5. **No System Evolution signal** — When the same test-coverage gap recurs across many PRs (e.g., "3 consecutive PRs are missing `next(error)` propagation tests"), this is a systemic signal. Should feed `/rca` or CLAUDE.md §AI Gotchas with "testing gotcha: routes must have tests verifying `next(error)` is called when service throws."

6. **"Human vs AI Validation Separation" framing absent** — Gold Standard §15 separates AI triage from human merge decisions. The identity says "ensure PRs have adequate test coverage" which implies authority, but doesn't state "this report is for the human reviewer to act on — you do not approve or block merges."

7. **No cross-agent coordination** — Overlaps with `code-reviewer` (which also checks test patterns in CLAUDE.md), `silent-failure-hunter` (which flags error-propagation paths that should have tests), and `type-design-analyzer` (which flags schema boundaries that should have negative tests).

8. **No aggregation rule for repeated gaps** — If the same missing-test pattern appears across 5 service methods (e.g., no `NotFoundError` case for each), the report would list 5 separate gaps. An aggregation rule (>3 occurrences → single finding) would reduce noise.

9. **No rendered output example** — 5-section structure defined but no concrete populated example. Unlike `code-reviewer` (Round 16 audit — now has full rendered example) or `type-design-analyzer` (Round 19 — full example), this agent has only a structural template.

10. **Frontend tests section is future-tense and incomplete** — "Frontend Tests (if added in future)" gives the impression this area is optional. In reality, even the current codebase may benefit from React component tests. The section should frame what to look for IF frontend tests exist, not defer entirely.

11. **`model: inherit`** — Unlike `code-reviewer` and `silent-failure-hunter` which use `model: opus`, this agent inherits the model from the parent. For a PR-critical analysis agent, inheriting a potentially weaker model risks lower-quality analysis at exactly the moment quality matters most (pre-merge). Should declare `model: opus` explicitly.

12. **No "When NOT to use" in `description`** — Should route users away from using this agent for non-test concerns.

13. **Analysis step 1 is vague** — "First, examine the PR's changes to understand new functionality" — doesn't specify HOW (git diff? specific files? commit messages?). Compare to `silent-failure-hunter` where step 1 lists exactly 7 patterns to grep for.

14. **No top-level summary statistics** — Output starts with a "Summary" section but its content is undefined — just "brief overview of test coverage quality." Needs a schema (file count, gap count, critical count, etc.).

---

## Concept-by-Concept Audit

### Concept #15 — Validation Separation (AI Runs/Analyzes Tests)

> Gold Standard §15 establishes that AI performs test coverage analysis as pre-human triage. The agent identifies gaps; humans decide whether to block the PR on those gaps. AI must not claim "tests are adequate" as a merge-approval signal.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Agent fulfills AI test-coverage analysis role | ✅ Strong | Primary responsibility explicitly "ensure PRs have adequate test coverage" |
| Output is a triage report, not a merge decision | ⚠️ Partial | No explicit framing that this is "for the human reviewer to act on" |
| Does not approve or block merges | ❌ Missing | Identity could be misread as an automated gate ("ensure PRs have adequate test coverage" → implies gate authority) |
| Confidence threshold for reporting | ✅ Present | Rating system 1–10; "Critical Gaps" section only includes 8–10 rated items |
| "Human review still required" closing note | ❌ Missing | No closing note reminding human that architectural and business-logic decisions about what to test are out of scope |
| Can actually run tests to verify coverage | ⚠️ Partial | No `tools:` declared — can't actually invoke `pnpm test` to see live pass/fail |

**Actions:**
- [ ] Add to **Identity**: "You produce a **test-coverage triage report** for the human reviewer. You do NOT approve or block PRs — your role is surfacing gaps before the human makes the merge decision."
- [ ] Change **Output Format Summary** description to end with: "Close all reports with: 'Human review still required — decisions about acceptable coverage risk and architectural test strategy are outside this agent's scope.'"
- [ ] Add `tools:` field including `Bash(cd server && pnpm test:*)` so the agent can optionally run the test suite to see real pass/fail output (see Frontmatter actions below).

---

### Concept #25 — Input → Process → Output

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ❌ Weak | No defined default scope, no pre-conditions, no CLAUDE.md or `.agents/reference/*` loading declared |
| **Process** | ⚠️ Partial | 6 analysis steps but step 1 is vague; steps are named but not VERB-labeled; no CHECKPOINTs |
| **Output** | ⚠️ Partial | 5-section structure defined but no schema for the Summary section, no rendered example, no top-level stats, no chain hints |

**Actions:**
- [ ] Add explicit Input stage with pre-conditions, scope definition, context loading (see Concept #26 below).
- [ ] Add VERB labels to analysis steps and a CHECKPOINT (see Concept #27 below).
- [ ] Add Summary schema, rendered example, top-level stats, chain hints (see Concept #28 below).

---

### Concept #26 — Input Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ✅ Strong | "expert test coverage analyst specializing in pull request review" |
| Default scope | ❌ Missing | Not stated |
| Workshop base branch for PR diff | ❌ Missing | This project's base branch is `exercise-1`, not `main`. PR diff must be computed against the correct base. |
| Empty-scope handling | ❌ Missing | Not defined |
| CLAUDE.md context loading | ❌ Missing | Step 6 says "Consider the project's testing standards from CLAUDE.md if available" — but this is buried in Considerations and not an explicit pre-load |
| `.agents/reference/*` loading | ❌ Missing | `backend-patterns.md` documents test isolation patterns |
| Workflow positioning | ❌ Missing | No Invocation Context relative to PIV chain |
| "When NOT to use" | ❌ Missing | No routing to specialist agents |

**Actions:**
- [ ] Add an **Invocation Context** subsection right after Identity:
  > ## Invocation Context
  >
  > Invoked after a PR is created or updated to ensure test coverage is adequate before human review. Typical callers:
  > - **The user** before marking a PR as "Ready for Review"
  > - **The assistant** proactively after implementing a feature
  > - **`/review-pr`** as part of its orchestrated multi-agent pipeline
  > - **The user** after a reviewer requests more tests
  >
  > **Position in PIV chain**: After `/implement` and `/validate` (which run the suite) and before `/commit` + `/create-pr`. Best run when the PR diff is stable — after implementation is complete but before requesting human review.
  >
  > **Not a replacement for `/review-pr`** — this agent specializes in test coverage; `/review-pr` orchestrates multiple agents for full coverage.

- [ ] Add a **Scope** subsection before the Analysis Process:
  > ## Scope
  >
  > **Default**: Full PR delta against the workshop base branch:
  > ```bash
  > git diff $(git merge-base HEAD origin/exercise-1)..HEAD
  > ```
  > This computes all changes since the branch diverged from `exercise-1` (not just the latest commit).
  >
  > **Custom**: If the user specifies files, directories, or a commit range, audit that instead.
  >
  > **Empty-scope STOP**: If `git diff` returns empty AND no custom scope, reply: `No changes to review. Make sure you're on a feature branch with commits ahead of exercise-1.` and exit.
  >
  > **No-test-files-in-scope case**: If the PR diff contains only non-test production files (no `*.test.ts`, no `__tests__/`), this is itself a finding. Always note: "No test files modified in this PR — coverage for new production code depends entirely on existing tests."

- [ ] Add a **Pre-Step: LOAD CONTEXT** block at the top of the Analysis Process:
  > **Pre-Step: LOAD CONTEXT** — Before analyzing, read these docs (if present):
  > - `CLAUDE.md` — especially §Testing Strategy and §Backend Patterns sections
  > - `.agents/reference/backend-patterns.md` — canonical test isolation patterns
  > - Test files in scope: read the actual test files to understand what's already covered
  > - Package.json scripts: verify test commands (`pnpm test`, `vitest`) are current

- [ ] Append **"When NOT to use"** to `description`:
  > **When NOT to use this agent**:
  > - For error-propagation analysis (detecting silent failures in implementation code): use `silent-failure-hunter`
  > - For type design and Zod schema review: use `type-design-analyzer`
  > - For general code-quality review: use `code-reviewer`
  > - For comment accuracy: use `comment-analyzer`
  > This agent exclusively analyzes **test coverage quality and completeness**.

---

### Concept #27 — Process Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered steps | ✅ Present | 6 steps numbered 1–6 |
| VERB-labeled steps | ❌ Missing | Steps are described with present-tense sentences rather than VERB labels (LOAD, CLASSIFY, ANALYZE, etc.) |
| Tools match steps | ❌ Missing | No `tools:` field — steps reference git commands and test runner but tools aren't declared |
| Step 1 specificity | ❌ Weak | "Examine the PR's changes to understand new functionality" — no concrete method (git diff? reading commit messages? specific files?) |
| CHECKPOINTs | ❌ Missing | No checkpoints between phases |
| Running the actual test suite | ❌ Missing | Agent could run `pnpm test` to see real pass/fail output and test count, but doesn't |
| Aggregation for repeated gaps | ❌ Missing | Same missing-test pattern across 5 methods → 5 separate findings |
| Cross-agent coordination | ❌ Missing | Overlaps with `code-reviewer`, `silent-failure-hunter`, `type-design-analyzer` |
| Evidence-quoting | ⚠️ Partial | "reference the file path and line numbers when identifying gaps" (last line) but not enforced in step descriptions |

**Actions:**
- [ ] **Rename and restructure** the 6 steps into VERB-labeled phases with specificity and a CHECKPOINT:

  ```markdown
  ## Analysis Process

  **Pre-Step: LOAD CONTEXT** (see above)

  ### 1. SCOPE — Determine the PR's full delta
  - Run: `git diff $(git merge-base HEAD origin/exercise-1)..HEAD --name-only` to list all changed files
  - Run: `git log --oneline $(git merge-base HEAD origin/exercise-1)..HEAD` to see all commits in scope
  - If the user provided specific files, use those instead
  - Classify each changed file: production code (`server/src/**`, `client/src/**`, `shared/**`) vs test code (`*.test.ts`, `__tests__/**`)
  - If no test files are in scope: note this as the first finding

  ### 2. BASELINE — Map production changes to expected tests
  - For each changed production file, identify: what new behavior was introduced? (new functions, new routes, new service methods, new validation schemas)
  - Read the corresponding test files (e.g., `server/src/__tests__/flags.test.ts` for changes in `server/src/services/flags.ts`)
  - Map each new behavior to a test that covers it

  ### 3. GAP ANALYSIS — Identify uncovered behavior
  - For each new behavior without a corresponding test, create a finding candidate
  - Apply the **Project-Specific Critical Gaps** list (below) — these are confidence-9 or 10 findings when missing
  - Apply the **Rating Guidelines** to each finding candidate

  ### 4. QUALITY AUDIT — Assess existing tests
  - For tests that DO exist, check:
    - Are they testing behavior or implementation details?
    - Are they resilient to reasonable refactoring?
    - Are they DAMP (Descriptive and Meaningful Phrases — readable without explanation)?
    - Are they isolated via `_resetDbForTesting()` in `beforeEach`?

  ### 5. RUN SUITE (optional but recommended)
  - If `tools` include `Bash(cd server && pnpm test:*)`, run the test suite: `cd server && pnpm test`
  - Report actual pass count, fail count, and skipped count
  - If any tests fail: flag as Priority 0 — all other coverage analysis is secondary to a failing suite

  **CHECKPOINT:**
  - [ ] All production changes mapped to test coverage status (covered / uncovered / partially covered)
  - [ ] All project-specific critical gaps applied
  - [ ] Suite pass/fail known (if Bash available)
  - [ ] Rating assigned to each gap (1–10 criticality)

  ### 6. CLASSIFY RECURRENCES
  - Count each distinct gap pattern's occurrences (e.g., "service method without error case test" across N methods)
  - If the same gap pattern appears in more than 3 places: aggregate into a single grouped finding
  - If the same gap pattern has appeared in previous PRs (check `git log` for similar patterns): classify as `process-gap` and include a System Evolution note

  ### 7. REPORT
  - Emit the output per Output Format below
  - Include System Evolution section if Step 6 triggered it
  ```

- [ ] Add a **Aggregation Rule** paragraph:
  > **Aggregation**: If the same test-gap pattern (same missing behavior type + same fix type) appears more than 3 times in the scope, group into one aggregated finding with a list of affected methods/routes.
  >
  > Example:
  > ```
  > [Aggregated — 4 occurrences] Service methods missing error case tests (confidence: 9)
  > Affected: flags.getById (NotFoundError), flags.create (ConflictError), users.getById (NotFoundError), users.update (ConflictError)
  > Recommended test pattern (add to each):
  >   it('throws NotFoundError when resource not found', () => {
  >     expect(() => service.getById('nonexistent')).toThrow(NotFoundError);
  >   });
  > ```

- [ ] Add **Cross-Agent Coordination** section after "Important Considerations":
  > ## Cross-Agent Coordination
  >
  > When multiple agents run on the same PR:
  > - `silent-failure-hunter` — finds untested error paths in production code (routes without `next(error)` tests). If `silent-failure-hunter` flags a `next(error)` violation, add the corresponding test to your Critical Gaps list.
  > - `type-design-analyzer` — finds schema boundaries that should have negative tests. If it flags a Zod schema without enforcement, add the negative test to your Critical Gaps.
  > - `code-reviewer` — checks general code quality. Tests it flags as incorrect (implementation-overfit, wrong assertions) should be moved to your "Test Quality Issues" section.
  > - `comment-analyzer` — owns comment accuracy in test files (e.g., misleading `it` descriptions). Don't critique test comments in this report.
  >
  > **On domain conflict**: this agent wins for test coverage analysis. Specialist agents win in their domains.

---

### Concept #28 — Output Section Detail (agent-adapted)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 5-section output structure | ✅ Present | Summary / Critical Gaps / Important Improvements / Test Quality Issues / Positive Observations |
| Summary section schema | ❌ Missing | "Brief overview" only — no required fields |
| Rating system present | ✅ Strong | 1–10 with 5 bands and action guidance |
| Aggregated findings format | ❌ Missing | Covered in Concept #27 actions |
| System Evolution channel | ❌ Missing | Covered in Concept #17 analogue actions (see System Evolution below) |
| Rendered output example | ❌ Missing | No concrete example |
| Positive Observations section | ✅ Present | Explicitly calls for noting well-tested code |
| "Human review still required" closing | ❌ Missing | Covered in Concept #15 actions |
| Downstream chain hints | ❌ Missing | After report, what should the user do? |
| Suite pass/fail status | ❌ Missing | No slot for "did the suite pass?" in the output |

**Actions:**
- [ ] Define a schema for the **Summary section**:
  > **Summary** must include:
  > - PR scope: {N} production files changed, {M} test files changed
  > - Suite status: {passing N/M tests | failing: list | not run}
  > - Coverage quality: {High / Medium / Low}
  > - Critical Gaps found: {count}
  > - Important Improvements: {count}
  > - Test Quality Issues: {count}
  > - Positive Observations: {count}
  > Close with: "Human review still required — coverage adequacy decisions and architectural testing strategy are outside this agent's scope."

- [ ] Add **top-level statistics block** at the very start (before Summary section):
  ```
  ## Test Coverage Analysis

  Scope: {branch} vs exercise-1 | {N} production files | {M} test files
  Suite: {passing N tests | failing: count | not run — add Bash(cd server && pnpm test:*) to run}
  Critical Gaps: {N}  |  Important Improvements: {N}  |  Test Quality Issues: {N}
  ```

- [ ] Add **Next Steps block** at the end of output:
  > ```
  > ## Next Steps
  > - Address Critical Gaps (rated 8–10) before `/commit`
  > - For aggregated gaps: apply the same test pattern to all listed methods
  > - If suite is failing: fix failing tests before adding new ones
  > - If System Evolution flagged a process-gap: summarize for `/rca "<pattern>"`
  > - After fixes: `/validate` to confirm suite still passes
  > - Then proceed to `/commit`
  > Human review still required for architectural testing decisions.
  > ```

- [ ] Add **System Evolution** section to output (optional, when triggered):
  > **Trigger**: Same test-gap pattern has appeared in ≥2 consecutive PRs in `git log`, OR the gap is in the Critical Coverage Gaps list but consistently uncovered.
  >
  > **Classification**: `process-gap` (the convention exists but the workflow doesn't enforce it)
  >
  > **Recommended action**: `/rca "why do PRs consistently miss {pattern}?"` — typically leads to updating `/validate`, `/review-pr`'s checklist, or `pre-commit` hooks.

- [ ] Add **rendered output example** (see Execution Prompt below for full content).

---

### Agent-Specific Quality Checks

| Requirement | Status | Evidence |
|-------------|--------|----------|
| `description` contains proactive trigger | ✅ Strong | 3 examples with `<commentary>` |
| `description` specifies when NOT to use | ❌ Missing | Covered in Concept #26 actions |
| **`tools:` field present** | ❌ **Critical bug** | Field entirely missing — agent inherits tools from invocation context |
| `model` declared explicitly | ⚠️ Weak | `model: inherit` — for a PR-critical analysis agent, should be `model: opus` |
| Identity statement | ✅ Strong | "thorough but pragmatic" philosophy well-stated |
| Numbered process | ✅ Present | 6 steps (will be 7 with CLASSIFY RECURRENCES) |
| VERB-labeled steps | ❌ Missing | Covered in Concept #27 actions |
| Output format | ✅ Strong | 5 sections defined |
| Rendered output example | ❌ Missing | Covered in Concept #28 actions |
| Rating system | ✅ Strong | 1–10 with 5 bands |
| Test runner invocation | ❌ Missing | Agent should be able to run `pnpm test` to get real pass/fail |
| "Triage for human" framing | ❌ Missing | Covered in Concept #15 actions |
| Aggregation rule | ❌ Missing | Covered in Concept #27 actions |

---

## Action Plan Summary

### Priority 1 — Critical Bug Fix: Missing `tools:` Field

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add explicit `tools:` field with minimum viable set | Agent hygiene — **CRITICAL** |
| 1.2 | Change `model: inherit` to `model: opus` for consistent analysis quality | Agent hygiene |

### Priority 2 — Human vs AI Separation (concept #15)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add "triage report for human reviewer; does not approve or block merges" framing to Identity | #15 |
| 2.2 | Add "Human review still required" closing note to Output Summary and Next Steps | #15 |
| 2.3 | Add `Bash(cd server && pnpm test:*)` to tools to enable optional live suite execution | #15 |

### Priority 3 — Input Pre-conditions (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add Invocation Context subsection (when this fires in PIV chain) | #26 |
| 3.2 | Add Scope subsection with workshop base branch (`exercise-1`), empty-diff STOP, no-test-files-in-scope finding | #26 |
| 3.3 | Add Pre-Step LOAD CONTEXT (CLAUDE.md + `.agents/reference/backend-patterns.md`) | #26, cross-ref Round 23 |
| 3.4 | Append "When NOT to use" to `description` | Agent hygiene |

### Priority 4 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Rename steps with VERB labels: SCOPE → BASELINE → GAP ANALYSIS → QUALITY AUDIT → RUN SUITE → CLASSIFY RECURRENCES → REPORT | #27 |
| 4.2 | Expand Step 1 with concrete scope method (`git diff $(git merge-base HEAD origin/exercise-1)..HEAD`) | #27 |
| 4.3 | Add CHECKPOINT after step 5 | #27 |
| 4.4 | Add Step 5 RUN SUITE — optionally invoke `pnpm test` for live pass/fail | #27 |
| 4.5 | Add Step 6 CLASSIFY RECURRENCES — aggregation + System Evolution classification for recurring patterns | #27, #15 |
| 4.6 | Add Aggregation Rule with concrete example | #27 |
| 4.7 | Add Cross-Agent Coordination section | #27 |

### Priority 5 — Output Polish (concept #28)

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Add top-level statistics block (scope, suite status, gap counts) | #28 |
| 5.2 | Define Summary section schema (required fields including "Human review still required") | #28 |
| 5.3 | Add System Evolution output section (process-gap classification for recurring gaps) | #28, #15 |
| 5.4 | Add Next Steps block with downstream chain | #28, #29 |
| 5.5 | Add rendered output example | #28 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§15, §25, §26, §27, §28)
2. `.claude/agents/pr-test-analyzer.md` — current agent
3. `docs/Gold-Standard-Plan/phases/phase-4-agents/round-20-audit-pr-test-analyzer.md` — this audit
4. `.claude/agents/silent-failure-hunter.md` — reference for System Evolution section + Invocation Context pattern
5. `.claude/agents/code-reviewer.md` — reference for "triage for human" framing + Cross-Agent Coordination pattern
6. `.claude/agents/type-design-analyzer.md` — reference for top-level Summary block + rendered example structure
7. `docs/Gold-Standard-Plan/phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md` — for `.agents/reference/*` loading pattern
8. `CLAUDE.md` — to verify the workshop base branch (`exercise-1`, never `main`)

Edit `.claude/agents/pr-test-analyzer.md` with these requirements:

1. **Frontmatter** — add `tools:` and change `model`:
   ```
   ---
   name: pr-test-analyzer
   description: {keep existing 3 proactive examples; ADD "When NOT to use" paragraph at the end — see step 2}
   model: opus
   tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git merge-base:*), Bash(cd server && pnpm test:*)
   color: cyan
   ---
   ```
   Justification: `Read, Grep, Glob` for reading test files; `Bash(git diff:*, git log:*, git merge-base:*)` for computing the PR delta against `exercise-1`; `Bash(cd server && pnpm test:*)` to optionally run the suite for real pass/fail status. `model: opus` rather than `inherit` for consistent analysis quality on PR-critical reviews.

2. **Append to `description`** — after the existing 3 examples:
   > **When NOT to use this agent**:
   > - For error-propagation analysis in implementation code: use `silent-failure-hunter`
   > - For type design and Zod schema review: use `type-design-analyzer`
   > - For general code-quality review: use `code-reviewer`
   > - For comment accuracy in test files: use `comment-analyzer`
   > This agent exclusively analyzes **test coverage quality and completeness** for pull requests.

3. **Body** — reorganize with these sections in order (preserve Core Responsibilities, Rating Guidelines, and Project-Specific Test Patterns VERBATIM; restructure/add the rest):

   ```markdown
   You are an expert test coverage analyst specializing in pull request review. Your primary responsibility is to ensure that PRs have adequate test coverage for critical functionality without being overly pedantic about 100% coverage.

   You produce a **test-coverage triage report** for the human reviewer. You do NOT approve or block PRs — your role is surfacing coverage gaps before the human makes the merge decision.

   ## Invocation Context

   Invoked after a PR is created or updated. Typical callers:
   - **The user** before marking a PR as "Ready for Review"
   - **The assistant** proactively after implementing a feature
   - **`/review-pr`** as part of its orchestrated pipeline
   - **The user** after a reviewer requests more tests

   **Position in PIV chain**: After `/implement` and `/validate` (which run the suite), before `/commit` + `/create-pr`. Best run when the PR diff is stable — implementation complete, tests written (or not), before requesting human review.

   **Not a replacement for `/review-pr`** — this is a specialist coverage audit; `/review-pr` orchestrates multiple agents.

   ## Scope

   **Default**: Full PR delta against the workshop base branch:
   ```bash
   git diff $(git merge-base HEAD origin/exercise-1)..HEAD
   ```
   This computes all changes since the branch diverged from `exercise-1` — ALL commits in the PR, not just the latest.

   **Custom**: If the user specifies files, directories, or a commit range, audit that instead.

   **Empty-scope STOP**: If the diff is empty AND no custom scope, reply: `No changes to review. Make sure you're on a feature branch with commits ahead of exercise-1.` and exit.

   **No-test-files-in-scope**: If the PR contains only production code changes and no test files were modified, this is itself a finding — add to Critical Gaps: "No test files modified in this PR."

   ## Your Core Responsibilities

   {Keep existing 4 Core Responsibilities VERBATIM.}

   ## Analysis Process

   **Pre-Step: LOAD CONTEXT** — Before analyzing, read these docs (if present):
   - `CLAUDE.md` — especially §Testing Strategy and §Backend Patterns
   - `.agents/reference/backend-patterns.md` — canonical test isolation patterns
   - The actual test files in scope (to map what's already covered)
   - Package.json scripts in `server/` to confirm test command syntax

   ### 1. SCOPE — Establish the PR delta

   - Run: `git diff $(git merge-base HEAD origin/exercise-1)..HEAD --name-only` to list all changed files
   - Run: `git log --oneline $(git merge-base HEAD origin/exercise-1)..HEAD` to list all commits
   - Classify each changed file: production (`server/src/**`, `client/src/**`, `shared/**`) vs test (`*.test.ts`, `__tests__/**`)
   - If no test files are in scope: this is a Critical Gap — note it immediately

   ### 2. BASELINE — Map production changes to expected tests

   - For each changed production file, identify new behavior (new functions, routes, service methods, schemas)
   - Read the corresponding test files to see what's already covered
   - Build a mapping: `new behavior → test that covers it (or "missing")`

   ### 3. GAP ANALYSIS — Identify uncovered behavior

   - For each new behavior without a test, create a gap candidate
   - Apply the Project-Specific Critical Gaps list (below) — these are confidence-9/10 findings when missing
   - Rate each gap using the Rating Guidelines

   ### 4. QUALITY AUDIT — Assess existing test design

   - Check for tests tightly coupled to implementation (rather than behavior)
   - Check for DAMP (Descriptive and Meaningful Phrases): each `it(...)` description should be readable without the surrounding context
   - Check for `_resetDbForTesting()` in `beforeEach` for database isolation
   - Check for patterns testing behavior vs asserting implementation details

   ### 5. RUN SUITE (optional but recommended)

   If `Bash(cd server && pnpm test:*)` is available:
   ```bash
   cd server && pnpm test
   ```
   Report: {N} passing, {N} failing, {N} skipped.

   **Priority 0**: If any tests fail, flag at the very top of the report — all coverage analysis is secondary to a failing suite.

   **CHECKPOINT:**
   - [ ] All production changes mapped to coverage status (covered / uncovered / partially)
   - [ ] Project-specific critical gaps applied
   - [ ] Suite pass/fail known (or noted as "not run")
   - [ ] Ratings assigned to all gap candidates

   ### 6. CLASSIFY RECURRENCES

   Count each distinct gap pattern's occurrences in the scope.

   **Aggregation**: If the same gap pattern (same missing behavior + same fix type) appears more than 3 times, group into a single aggregated finding.

   **System Evolution**: If the same pattern has appeared in ≥2 consecutive PRs (check `git log`), classify as `process-gap` and include a System Evolution note recommending `/rca`.

   ### 7. REPORT

   Emit findings per Output Format. Include System Evolution section if Step 6 triggered it.

   ## Rating Guidelines

   {Keep existing Rating Guidelines VERBATIM — 9-10 / 7-8 / 5-6 / 3-4 / 1-2 bands.}

   ## Output Format

   ### Top-Level Statistics Block (always at the start)

   ```
   ## Test Coverage Analysis

   Scope: {branch} vs exercise-1 | {N} production files changed | {M} test files changed
   Suite: {passing N/M | failing: N | not run}
   Findings: Critical {N} | Important {N} | Quality Issues {N} | Positive {N}
   ```

   ### Main Sections

   **1. Summary** — must include:
   - Coverage quality: High / Medium / Low
   - What was covered well and what was missed (2–3 sentences)
   - Close with: "Human review still required — coverage adequacy decisions and architectural testing strategy are outside this agent's scope."

   **2. Critical Gaps** (rated 8–10, must add)
   For each:
   - What behavior is not tested
   - Specific failure this gap would miss
   - Exact test to add (with `it(...)` description + key assertions)
   - File:line where the test should live
   - Criticality rating (8–10)

   **3. Important Improvements** (rated 5–7, should consider)
   Same fields as Critical Gaps but lower criticality.

   **4. Test Quality Issues** (tests that exist but are brittle or wrong)
   For each:
   - File:line of the problematic test
   - Issue: implementation-overfit / not DAMP / wrong assertion type / missing isolation
   - Recommended rewrite

   **5. Positive Observations**
   Specific `it(...)` blocks or test patterns that are well-designed. Reinforces good practices.

   ### Aggregated Findings

   [Aggregated — {count} occurrences] {gap pattern summary} (confidence: {rating})
   Affected: {method/route list}
   Recommended test pattern (add to each):
   ```ts
   it('{descriptive behavior test name}', () => {
     // {specific assertion}
   });
   ```

   ### System Evolution (optional)

   **Trigger**: Same gap pattern found in ≥2 consecutive PRs, OR gap is on the Critical Coverage Gaps list but consistently unaddressed.
   **Classification**: `process-gap`
   **Pattern**: {description}
   **Recommended action**: `/rca "{why does this keep being missed?}"`

   ### Next Steps

   ```
   Next Steps:
   - Address Critical Gaps (rated 8–10) before /commit
   - For aggregated gaps: apply the same test pattern to all listed methods
   - If suite is failing (Priority 0): fix failing tests first
   - After fixes: /validate to confirm suite still passes
   - Then: /commit → /create-pr

   Human review still required for architectural testing decisions.
   ```

   ## Important Considerations

   {Keep existing 9 "Important Considerations" bullets VERBATIM.}

   ## Cross-Agent Coordination

   When multiple agents run on the same PR:
   - `silent-failure-hunter` — finds untested error paths in production code. If it flags a `next(error)` violation, add the corresponding error-propagation test to Critical Gaps.
   - `type-design-analyzer` — finds schema boundaries without negative tests. If it flags a Zod schema lacking enforcement, add the negative test to Critical Gaps.
   - `code-reviewer` — flags test issues as code-quality concerns. Tests it flags as wrong (bad assertions, implementation-overfit) belong in your "Test Quality Issues" section.
   - `comment-analyzer` — owns test comment accuracy (`it('...')` descriptions); don't critique test descriptions in this report.

   **On domain conflict**: this agent wins for test coverage analysis. Specialist agents win in their domains.

   ## Project-Specific Test Patterns (nextjs-feature-flag-exercise)

   {Keep existing Backend Tests + Frontend Tests + Critical Coverage Gaps + Nice-to-Have sections VERBATIM.}

   Always reference the file path and line numbers when identifying gaps.

   ## Example — Populated Report

   ```
   ## Test Coverage Analysis

   Scope: exercise-2 vs exercise-1 | 4 production files changed | 1 test file changed
   Suite: passing 23/23
   Findings: Critical 2 | Important 1 | Quality Issues 1 | Positive 2

   ## Summary

   Coverage quality: **Medium**. The core filtering logic in `flags.ts` service is tested but critical error paths and validation boundaries are not. The suite currently passes but several new code paths have no test coverage at all.

   Human review still required — coverage adequacy decisions and architectural testing strategy are outside this agent's scope.

   ---

   ## Critical Gaps (2)

   ### [1] getFlags — missing NotFoundError test (confidence: 9)
   **Missing behavior**: `getFlags()` does not have a test for the case when the database returns empty with an active filter — should throw `NotFoundError` to be consistent with `getById`.
   **Failure this gap misses**: A consumer of `getFlags(environment: 'production')` would get `[]` silently when it should get a `NotFoundError`.
   **File**: `server/src/__tests__/flags.test.ts` — add after line 45
   **Test to add**:
   ```ts
   it('returns empty array when no flags match the filter', async () => {
     const result = await flagsService.getFlags({ environment: 'staging' });
     expect(result).toEqual([]);
   });
   ```
   **Criticality**: 9/10

   ### [2] validateFlagFilter — no negative case tests (confidence: 10)
   **Missing behavior**: `FlagFilterSchema` rejects invalid `environment` values but there are no tests for this.
   **Failure this gap misses**: A typo like `?environment=producton` would fail at the Zod boundary — currently untested; a future refactor could accidentally broaden the schema.
   **File**: `server/src/__tests__/flags.test.ts` — add to validation describe block
   **Test to add**:
   ```ts
   it('rejects invalid environment value', () => {
     expect(() => FlagFilterSchema.parse({ environment: 'invalid' })).toThrow();
   });
   ```
   **Criticality**: 10/10

   ---

   ## Important Improvements (1)

   ### [3] getById — no test for SQL.js stmt.free() called in finally (confidence: 6)
   Verify that `stmt.free()` is called even when `stmt.bind()` throws — current test only covers the happy path.
   **Criticality**: 6/10

   ---

   ## Test Quality Issues (1)

   ### flags.test.ts:23 — implementation-overfit assertion
   `expect(db.prepare).toHaveBeenCalledWith(...)` — this couples the test to the SQL string format. If the SQL is reformatted without changing behavior, this test breaks.
   **Recommended rewrite**: assert on the returned FeatureFlag shape, not on how the query was constructed.

   ---

   ## Positive Observations (2)

   - `beforeEach(() => _resetDbForTesting())` present in all describe blocks — correct database isolation ✓
   - Custom errors thrown and verified: `expect(() => flagsService.getById('bad')).toThrow(NotFoundError)` at line 56 — DAMP and behavioral ✓

   ---

   ## Next Steps
   - Address Critical Gaps 1 and 2 before /commit
   - Fix Test Quality Issue at flags.test.ts:23
   - After fixes: /validate to confirm suite still passes
   - Then: /commit → /create-pr

   Human review still required for architectural testing decisions.
   ```
   ```

4. **Do NOT change**:
   - The 4 Core Responsibilities (VERBATIM)
   - The Rating Guidelines 1–10 scale (VERBATIM)
   - The 9 Important Considerations bullets (VERBATIM)
   - The Project-Specific Test Patterns section (VERBATIM — Backend Tests / Frontend Tests / Critical Coverage Gaps / Nice-to-Have)
   - `color: cyan`
   - The 3 original `description` proactive examples

Do NOT change any source code. Only modify `.claude/agents/pr-test-analyzer.md`.
````

---

## Success Criteria

- [ ] **`tools:` field added** — `Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git merge-base:*), Bash(cd server && pnpm test:*)` (agent hygiene — **CRITICAL bug fix**)
- [ ] `model: inherit` changed to `model: opus` for consistent analysis quality (agent hygiene)
- [ ] `description` preserves 3 proactive examples and adds "When NOT to use" paragraph routing to 4 specialist agents (agent hygiene)
- [ ] **"Triage report for human reviewer; does not approve or block merges"** framing in Identity (concept #15)
- [ ] **"Human review still required"** closing note in Output Summary + Next Steps (concept #15)
- [ ] **Invocation Context** subsection explains when this fires in PIV chain: post-implement/validate, pre-commit/create-pr; relationship to `/review-pr` (concept #26)
- [ ] **Scope** subsection with workshop base branch `exercise-1` (not `main`), full PR delta command (`git merge-base HEAD origin/exercise-1`), empty-diff STOP, no-test-files-in-scope finding (concept #26, project-specific)
- [ ] **Pre-Step LOAD CONTEXT**: CLAUDE.md §Testing Strategy + `.agents/reference/backend-patterns.md` (concept #26, cross-ref Round 23)
- [ ] "When NOT to use" appended to `description` (agent hygiene)
- [ ] **7 VERB-labeled analysis steps**: SCOPE → BASELINE → GAP ANALYSIS → QUALITY AUDIT → RUN SUITE → CLASSIFY RECURRENCES → REPORT (was 6 unnamed; concept #27)
- [ ] **Step 1 SCOPE** has concrete git commands: `git diff $(git merge-base HEAD origin/exercise-1)..HEAD` (concept #27, project-specific)
- [ ] **CHECKPOINT** after Step 5 with 4 items (concept #27)
- [ ] **Step 5 RUN SUITE** — optional live `pnpm test` execution; Priority 0 if any tests fail (concepts #15, #27)
- [ ] **Step 6 CLASSIFY RECURRENCES** with aggregation (>3 → single grouped finding) + System Evolution classification for recurring patterns (concepts #27, #15)
- [ ] **Aggregation Rule** with concrete `ts` code example (concept #27)
- [ ] **Cross-Agent Coordination** section with domain routing to `silent-failure-hunter`, `type-design-analyzer`, `code-reviewer`, `comment-analyzer` (concept #27)
- [ ] **Top-Level Statistics block** at start of output (scope, suite status, gap counts) (concept #28)
- [ ] **Summary section schema** defined with required fields and "Human review still required" closer (concepts #15, #28)
- [ ] **Aggregated Findings format** in output with `ts` code example template (concept #28)
- [ ] **System Evolution output section** with `process-gap` classification + `/rca` routing for recurring patterns (concept #28)
- [ ] **Next Steps block** with downstream chain (`/validate`, `/commit`, `/create-pr`, human-review reminder) (concepts #28, #29)
- [ ] **Rendered example** of populated report with 2 Critical + 1 Important + 1 Quality Issue + 2 Positive + Summary + Next Steps (concept #28)
- [ ] 4 Core Responsibilities preserved VERBATIM ✅
- [ ] Rating Guidelines 1–10 preserved VERBATIM ✅
- [ ] 9 Important Considerations preserved VERBATIM ✅
- [ ] Project-Specific Test Patterns section preserved VERBATIM ✅
- [ ] `color: cyan`, 3 original `description` examples preserved ✅
