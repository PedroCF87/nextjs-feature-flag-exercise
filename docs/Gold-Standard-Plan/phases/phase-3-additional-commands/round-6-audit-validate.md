# Phase 3 — Additional Commands: Round 6 — Audit `/validate` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/validate.md`
**Gold Standard concepts**: #3, #6, #15, #25, #26, #27, #30, #31
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~142
- **Frontmatter**: `allowed-tools: Read, Bash(pnpm:*, npm:*, bun:*, npx:*, cd:*, cat:*, find:*, ls:*)`, `description: Run full validation suite (build, lint, test) and report results`
- **Format**: XML-style tags — `<objective>`, `<context>`, `<process>`, `<output>`, `<success_criteria>`
- **Structure**: 3 phases in `<process>` (DISCOVER → EXECUTE → REPORT header only) + separate `<output>` tag

### Current Content Summary
1. **`<objective>`**: Runs complete validation suite; auto-discovers commands — never hardcodes package manager
2. **`<context>`**: Auto-runs 4 commands — greps CLAUDE.md for validation commands, detects package manager from lock file, detects workspaces, lists available scripts
3. **Phase 1 — DISCOVER**: Reads CLAUDE.md first (source of truth), falls back to package.json; detects package manager + monorepo/workspace structure
4. **Phase 2 — EXECUTE**: Runs all checks in sequence; **continue-on-failure** ✅; captures first 20 lines of error output; handles monorepo per-workspace
5. **Phase 3 — REPORT**: Heading only inside `<process>` — content is in `<output>` tag
6. **`<output>`**: Structured tables (per workspace or single); Verdict (✅ ready to commit / ❌ fix needed); Errors to Fix table with file:line; Quick Fix Commands

### Strengths Already Present
- **Auto-discovers validation commands** from CLAUDE.md or package.json — zero hardcoding ✅
- **Continue-on-failure** — runs ALL checks even if one fails ✅
- **Workspace/monorepo detection** — handles multi-package projects correctly ✅
- **Structured Errors to Fix** table with file:line ✅
- **Verdict** section: "ready to commit" vs "fix before proceeding" — gates `/commit` implicitly ✅
- **Quick Fix Commands** in output ✅
- **`<success_criteria>`** explicitly states "No hardcoded commands, paths, or package managers" ✅

---

## Concept-by-Concept Audit

### Concept #3 — Additional Commands: `/validate` Purpose
> Run full validation suite: build + lint + tests.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Is an Additional command | ✅ Present | Exists as `.claude/commands/validate.md` |
| Runs build | ✅ Present | Phase 1 identifies `build`/`typecheck` script |
| Runs lint | ✅ Present | Phase 1 identifies `lint`/`lint:check` script |
| Runs tests | ✅ Present | Phase 1 identifies `test` script |
| Runs all in sequence | ✅ Present | Phase 2 EXECUTE runs each in order |

---

### Concept #6 — PIV Loop — Validating Phase
> `/validate` is the entry point of the Validating phase — gates `/commit`.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Entry point of Validating phase | ❌ Missing | No PIV positioning — not identified as the Validating phase entry |
| Gates `/commit` | ✅ Present | Verdict says "ready to commit" (PASS) vs "fix before proceeding" (FAIL) |
| Continue-all run strategy | ✅ Present | Phase 2: "Continue on failure — run ALL checks even if one fails" |
| Chains explicitly to `/commit` | ❌ Missing | Verdict says "ready to commit" but doesn't say "Run `/commit`" |

**Actions:**
- [ ] Add PIV positioning to `<objective>`: "This is the **Validating phase entry point** of the PIV Loop — runs after `/implement`, gates `/commit`."
- [ ] Update Verdict PASS line: "✅ All checks pass — run `/commit` to create a conventional commit."

---

### Concept #15 — Validation Separation (AI Roles)
> AI runs: Unit Tests + Integration Tests. Human runs: Code Review + Manual Tests.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| AI runs automated tests | ✅ Present | `test` script covers unit + integration tests |
| Human validation role acknowledged | ❌ Missing | No mention that code review and manual testing are the human's responsibility |
| Role separation framing | ❌ Missing | Not positioned as the AI's automated validation role — human code review is separate |

**Actions:**
- [ ] Add to `<objective>`: "This command fulfills the **AI's automated validation role** in the PIV Loop. Code review and manual testing are the human's responsibility."

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `<context>` auto-loads validation commands, package manager, workspaces, scripts (strong) — but no persona, no PIV positioning, no explicit Input framing |
| **Process** | ✅ Present | 3 phases in `<process>` with detailed steps |
| **Output** | ✅ Present | Dedicated `<output>` tag with per-workspace tables, verdict, errors, quick-fix commands |

**Structural note**: Phase 3 "REPORT" inside `<process>` is an empty heading — its content lives in `<output>`. This is functional but slightly confusing. The Phase 3 heading could be removed or replaced with a pointer: "→ See Output section below."

**Actions:**
- [ ] Add persona to `<objective>`
- [ ] Fix Phase 3 REPORT: replace empty heading with a one-line pointer to `<output>`

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, PIV context.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a quality gatekeeper..." statement |
| PIV positioning | ❌ Missing | Not framed as Validating phase entry |
| Pre-conditions | ❌ Missing | No check for modified files or prior `/implement` run |
| Context loading | ✅ Present | `<context>` auto-runs 4 discovery commands — strong pattern |

**Actions:**
- [ ] Add persona to `<objective>`: "You are a quality gatekeeper. Surface every build error, lint violation, and test failure before any commit is made."

---

### Concept #27 — Process Section Detail
> Step-by-step, tools per phase, error handling, quality gates.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Step-by-step process | ✅ Present | 3 phases with sub-steps and decision tables |
| Tools specified | ✅ Present | `allowed-tools` scoped + commands shown in process |
| Continue-on-failure | ✅ Present | Phase 2: explicit instruction |
| Error capture | ✅ Present | "first 20 lines of stderr/stdout on failure" |
| Tool hints per phase | ⚠️ Partial | Phase 1 says "Read CLAUDE.md" without naming the Read tool |
| Unnecessary Bash aliases | ⚠️ Minor | `Bash(cat:*, find:*, ls:*)` — `Read`, `Glob`, `Grep` cover these better |

**Actions:**
- [ ] Add tool hint to Phase 1: "(use Read tool for CLAUDE.md)"
- [ ] Trim `allowed-tools`: remove `Bash(cat:*, find:*, ls:*)` — use `Read`, `Glob`, `Grep` for file operations

---

### Concept #30 — Testing & Validation as Foundation Layer
> Leverages the project's testing infrastructure; validates that the foundation is solid.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Leverages project testing infrastructure | ✅ Present | Reads from CLAUDE.md (source of truth for this project's commands) |
| No hardcoded commands | ✅ Present | Explicitly stated in `<objective>` and `<success_criteria>` |
| What each check catches | ❌ Missing | Phase 1 script table names scripts but doesn't explain what each catches |

**Actions:**
- [ ] Add a "What each check catches" annotation to the Phase 1 script table:
  - Build → type errors and compilation failures
  - Lint → style violations and code smells
  - Tests → behavioral regressions (unit + integration)

---

### Concept #31 — Compounding Quality Effect
> Each validation layer catches different error classes; together they compound quality.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Build validates types | ✅ Present (implicit) | `build`/`typecheck` script |
| Lint validates style | ✅ Present (implicit) | `lint` script |
| Tests validate behavior | ✅ Present (implicit) | `test` script |
| Compound framing | ❌ Missing | No explicit "run all three — each catches different failures" note |

**Actions:**
- [ ] Add compound framing note in Phase 2 EXECUTE: "Each check catches different failure classes. A type error won't appear in tests. A logic bug won't appear in lint. Always run all three."

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Run full validation suite (build, lint, test) and report results" — clear trigger |
| `argument-hint` | ❌ Missing | No `argument-hint` — adding `(no arguments)` clarifies intent |
| `allowed-tools` | ⚠️ Minor | `Bash(cat:*, find:*, ls:*)` redundant with `Read`, `Glob`, `Grep` |

**Actions:**
- [ ] Add `argument-hint: (no arguments)`
- [ ] Trim `allowed-tools`: remove `Bash(cat:*)`, `Bash(find:*)`, `Bash(ls:*)`

---

## Action Plan Summary

### Priority 1 — Add Persona, PIV Positioning, AI Role Separation (concepts #6, #15, #25, #26)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add persona: "Quality gatekeeper — surface every error before any commit" | #26 |
| 1.2 | Add PIV positioning: "Validating phase entry point — runs after `/implement`, gates `/commit`" | #6 |
| 1.3 | Add AI validation role note: automated validation only; code review + manual testing are human's job | #15 |

### Priority 2 — Fix Output Chaining + Compound Framing (concepts #6, #31)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Verdict PASS: add "Run `/commit`" explicitly | #6 |
| 2.2 | Add compound framing in Phase 2: "each check catches different failures — run all three" | #31 |

### Priority 3 — Add "What Each Check Catches" Annotations (concepts #30, #31)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Annotate Phase 1 script table: build → type errors, lint → style, tests → behavioral regressions | #30, #31 |

### Priority 4 — Structural + Frontmatter Cleanup

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Fix Phase 3 REPORT: replace empty heading with pointer to `<output>` | #25 |
| 4.2 | Add `argument-hint: (no arguments)` | Best practice |
| 4.3 | Trim `allowed-tools`: remove `cat:*`, `find:*`, `ls:*` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — the Gold Standard reference
2. `.claude/commands/validate.md` from `nextjs-feature-flag-exercise` — the current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-6-audit-validate.md` — this audit plan

Execute the action plan to rewrite `validate.md`:

**Rewrite `.claude/commands/validate.md`** with these requirements:

1. **Frontmatter**:
   - Add `argument-hint: (no arguments)`
   - Trim `allowed-tools`: remove `Bash(cat:*)`, `Bash(find:*)`, `Bash(ls:*)`
   - Keep `description` and remaining `allowed-tools` unchanged.

2. **Expand `<objective>`** with:
   - Persona: "You are a quality gatekeeper. Surface every build error, lint violation, and test failure before any commit is made."
   - PIV positioning: "This is the **Validating phase entry point** of the PIV Loop — runs after `/implement`, gates `/commit`."
   - AI role note: "This command fulfills the AI's automated validation role. Code review and manual testing are the human's responsibility."
   - Keep the existing auto-discovery principle ("never assumes a specific package manager").

3. **Update Phase 1 DISCOVER** — expand the script table with "What it catches" column:
   ```markdown
   | Script name | Purpose | What it catches |
   |-------------|---------|-----------------|
   | `build` | TypeScript compilation + bundling | Type errors, compilation failures |
   | `typecheck`, `type-check`, `tsc` | Type check only | Type errors only |
   | `lint`, `lint:check` | Linter | Style violations, code smells |
   | `test` | Test runner | Behavioral regressions (unit + integration) |
   ```

4. **Update Phase 2 EXECUTE** — add compound framing after the error handling bullet points:
   > Each check catches different failure classes — a type error won't appear in tests, a logic bug won't appear in lint. Run all three regardless of intermediate failures.

5. **Fix Phase 3 REPORT** inside `<process>` — replace the empty heading with:
   ```
   ## Phase 3: REPORT
   → Produce the output format defined in the Output section below.
   ```

6. **Update `<output>` Verdict PASS line**:
   - Change: `{✅ All checks pass — ready to commit.}`
   - To: `{✅ All checks pass — run `/commit` to create a conventional commit.}`

7. **Do NOT change** Phase 1 discovery logic (CLAUDE.md priority, package manager detection, workspace detection), Phase 2 EXECUTE (continue-on-failure, error capture), the Errors to Fix table format, Quick Fix Commands, `<context>` auto-run commands, or `<success_criteria>`.

Do NOT change any source code. Only modify `.claude/commands/validate.md`.
````

---

## Success Criteria

- [ ] `argument-hint: (no arguments)` added to frontmatter (best practice)
- [ ] `allowed-tools` trimmed — `cat:*`, `find:*`, `ls:*` removed (best practice)
- [ ] Persona present: "Quality gatekeeper — surface every error before any commit" (concept #26)
- [ ] PIV positioning in `<objective>`: "Validating phase entry point — runs after `/implement`, gates `/commit`" (concept #6)
- [ ] AI validation role note present: automated only; human does code review + manual tests (concept #15)
- [ ] Phase 1 script table has "What it catches" column: type errors / style / behavioral regressions (concepts #30, #31)
- [ ] Compound framing in Phase 2: "each catches different failures — run all three" (concept #31)
- [ ] Phase 3 REPORT heading has pointer to `<output>` (concept #25)
- [ ] Verdict PASS: "run `/commit`" explicit (concept #6)
- [ ] Continue-on-failure strategy unchanged ✅
- [ ] Auto-discovery logic (CLAUDE.md priority, package manager, workspace) unchanged ✅
- [ ] `<context>` auto-run commands unchanged ✅
