# Phase 3 — Additional Commands: Round 11 — Audit `/create-rules` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/create-rules.md`
**Gold Standard concepts**: #1, #17, #18, #25, #26, #27, #28
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~213
- **Frontmatter**: `allowed-tools: Write, Read, Grep, Glob, Bash(head:*), Bash(cat:*), Bash(ls:*), Bash(wc:*), Bash(find:*)`; `argument-hint: [output-path]`; `description: Generate or regenerate CLAUDE.md from codebase analysis — works on any project`
- **Format**: XML-style tags — consistent with other commands
- **Structure**: 4 phases (DISCOVER → ANALYZE → GENERATE → VALIDATE) with CHECKPOINTs

### Current Content Summary
1. **`<objective>`**: Project-agnostic generator; target ≤200 lines; "extract real patterns — never invent conventions"
2. **`<context>`**: Auto-loads current CLAUDE.md line count, root files, top-level dirs, package manager, root scripts
3. **`<process>`** — 4 phases:
   - **Phase 1 DISCOVER**: project-type table (monorepo / full-stack / Next.js / backend-only / frontend-only / library / CLI), locate configs, map directories
   - **Phase 2 ANALYZE**: sample 2–3 files per layer; 5 pattern questions; naming conventions table with file:line evidence; error + testing patterns
   - **Phase 3 GENERATE**: markdown template for CLAUDE.md — required (Commands / Tech Stack / Architecture / Data Flow / Key Patterns / Naming / Key Files / Anti-Patterns) + optional (Branch Rules / Env Vars / Database / Deployment); content rules (specific, no contradictions, no platitudes, no invention)
   - **Phase 4 VALIDATE**: 7 quality checks (length, commands, evidence, specificity, no contradictions, adapts to type, no invention)
4. **`<success_criteria>`**: 6 items — saved path, real-code evidence, runnable commands, adaptive, specific/verifiable, completion report

### Strengths Already Present
- **Evidence-first discipline** — "every rule must trace to an actual file", "never invent conventions" ✅
- **Project-agnostic by design** — detects project type, adapts discovery ✅
- **200-line hard cap** enforced in Phase 4 VALIDATE with concrete remediation ("cut lowest-value sections; move detail to `.agents/reference/`") ✅
- **CHECKPOINTs** between phases prevent premature generation ✅
- **Template-driven output** — consistent shape across invocations ✅
- **Adaptive sections** — optional blocks included only when relevant (Branch Rules, Env Vars, DB, Deployment) ✅
- **Content rules** explicitly forbid platitudes and invention ✅

---

## Concept-by-Concept Audit

### Concept #1 — Global Rules Purpose
> CLAUDE.md is the "company handbook" — auto-loaded at every session start. It governs everything the agent does before any task-specific context.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Produces a session-start handbook | ✅ Present | Template covers Commands + Tech Stack + Architecture + Patterns |
| Conveys the handbook's purpose to the agent | ❌ Missing | The command never explains to Claude *why* CLAUDE.md matters (auto-loaded at every session) — so the agent may treat it as just another doc |
| Frames the output as persistent, not task-specific | ⚠️ Partial | Implicit (no task language), but not stated |
| Points to `.agents/reference/` for overflow | ✅ Present | Phase 4 remediation mentions `.agents/reference/` as overflow destination |

**Actions:**
- [ ] Add a sentence to `<objective>` making the CLAUDE.md purpose explicit: "CLAUDE.md is auto-loaded at every session start. It must give a new agent enough context to work safely and independently, without task-specific or workflow content."

---

### Concept #17 — What to Include (THE CORE OF THIS AUDIT)
> Gold Standard §17 says CLAUDE.md must cover:
> 1. Tech Stack
> 2. Architecture
> 3. Code Styles & Patterns
> 4. Testing
> 5. **Misconceptions AI Often Has With Your Project** (aka AI Gotchas)

| Required Section | In Generated Template | Evidence |
|------------------|----------------------|----------|
| Tech Stack | ✅ Present | `## Tech Stack` table |
| Architecture | ✅ Present | `## Architecture` — annotated directory tree |
| Code Styles & Patterns | ✅ Present | `## Key Patterns` + `## Naming Conventions` |
| Testing | ❌ **Missing from template** | Phase 2 extracts testing patterns but Phase 3 template has NO `## Testing` section — extracted info has no destination |
| **AI Gotchas / Misconceptions** | ❌ **Missing** (critical gap) | No prompt to identify or emit misconception-class rules. Template has `## Anti-Patterns (Do NOT)` — not the same thing; anti-patterns are things humans shouldn't do; gotchas are things AI specifically gets wrong |

**Notes on the gap:**
- The AI Gotchas section is what Gold Standard §17 calls "the most valuable section in CLAUDE.md" — it captures subtle, project-specific pitfalls AI tends to miss (e.g., "Express v5 requires `next(error)` — catching to `res.status().json()` bypasses the error middleware"; "SQL.js statements must be freed in `finally { stmt.free() }`"; "Zod parse MUST run before business logic").
- Without this, `/create-rules` produces a CLAUDE.md that silently drops the highest-leverage section.
- This also ties back to Round 9 (`/rca`) — `rca`'s new SYSTEMATIZE phase classifies misses as `rule-gap` and recommends appending to CLAUDE.md §AI Gotchas. If `/create-rules` doesn't emit that section, there's nowhere for `/rca` findings to land cleanly.

**Actions:**
- [ ] Add a `## Testing` section to the Phase 3 required template (currently in analysis but not in output)
- [ ] Add a `## AI Gotchas` section to the Phase 3 required template with specific guidance to the agent on what to look for: "subtle, project-specific patterns where following a framework's default or a common practice would break this codebase's conventions. Examples to prompt the agent (not hardcode): framework version idioms, resource cleanup patterns, validation order, error propagation requirements, monorepo path aliases. For each gotcha: one sentence on the wrong approach, one sentence on the correct approach, file:line evidence."
- [ ] In Phase 2 ANALYZE, add an explicit question: "What does a generic AI suggestion get wrong in this project? (e.g., how error handling in this framework version differs from its predecessor; what resources need manual cleanup; what ordering requirements exist)"

---

### Concept #18 — What NOT to Include
> Exclude: universal knowledge (React basics, how git works), workflows (belong in commands), task-specific content (belongs in plans), bloat, fluff / platitudes, unverifiable rules.

| Exclusion | Status | Evidence |
|-----------|--------|----------|
| No universal knowledge | ⚠️ Partial | Implicit from "don't invent" but not explicit — no warning against "React is a library for UIs" type filler |
| No workflows | ❌ Missing | Command does not warn the agent that workflow steps (`git flow`, CI/CD choreography) belong in commands, not CLAUDE.md |
| No task-specific content | ❌ Missing | No warning against putting a specific feature's requirements into CLAUDE.md (that's `/plan` territory) |
| 200-line limit | ✅ Strong | Phase 4 VALIDATE enforces with remediation |
| No platitudes | ✅ Present | Phase 3 content rules ban "write clean code" / "follow best practices" |
| Every rule verifiable | ✅ Strong | "Every rule must trace to an actual file" |

**Actions:**
- [ ] Add to Phase 3 content rules an explicit exclusion list: "REJECT content that is: (a) universal knowledge that a trained AI already knows (React basics, what git is, how HTTP works); (b) workflow steps (those belong in `.claude/commands/`); (c) task-specific requirements or feature specs (those belong in `.agents/PRDs/` or plans); (d) aspirational language without enforcement ('should' / 'try to')."
- [ ] Add to Phase 4 VALIDATE three new checks:
  - `NO_UNIVERSAL` — does the file restate knowledge any trained LLM already has?
  - `NO_WORKFLOWS` — does the file describe procedures (belongs in commands)?
  - `NO_TASK_CONTEXT` — does the file mention a specific feature/story/PR?

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `<objective>` + `<context>` with 5 auto-loads; no explicit persona; no pre-condition for "CLAUDE.md already exists" |
| **Process** | ✅ Strong | 4 phases with CHECKPOINTs and content rules |
| **Output** | ⚠️ Partial | `<success_criteria>` is good; but there's no terminal summary block or `<output>` section printed to the user after generation (unlike `/rca` and `/security-review`) |

**Actions:**
- [ ] Add a terminal `<output>` summary block — see concept #28 actions below

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, what to load.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a technical writer documenting this codebase for the next engineer" |
| Meta-trigger context | ❌ Missing | No statement on when this command fires (after `/prime` if no CLAUDE.md? After major refactor? When `/rca` flags persistent rule-gaps?) |
| Destructive-write safety | ❌ **Critical risk** | If CLAUDE.md already exists, Phase 3 overwrites it silently. A tuned CLAUDE.md with human edits and `/rca`-derived gotchas could be lost. |
| `$ARGUMENTS` clarity | ✅ Good | `${ARGUMENTS:-CLAUDE.md}` — clear default |
| Context loading | ✅ Good | 5 auto-runs detect current shape before any generation |

**Actions:**
- [ ] Add persona: "You are a technical writer documenting this codebase. Your audience is a new AI agent arriving with zero context — write what it needs to avoid mistakes on day one, nothing more."
- [ ] Add meta-trigger note in `<objective>`: "Run this command when: (a) initializing a new project's AI layer, (b) after a major structural refactor, or (c) when `/rca` has accumulated ≥3 `rule-gap` findings that need consolidation into CLAUDE.md."
- [ ] Add **destructive-write safety** to `<context>` or Phase 1: "If a CLAUDE.md already exists at the target path, **do not silently overwrite**. Print its current line count and first 20 lines, then ask the user: (a) **REGENERATE** (full rewrite — existing will be backed up to `CLAUDE.md.bak`), (b) **MERGE** (regenerate sections that evolved; preserve `## AI Gotchas`), or (c) **CANCEL**. If non-interactive, default to **MERGE** and always write a `.bak`."

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling, rigor.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered phases | ✅ Strong | 4 phases with CHECKPOINTs |
| Tools specified | ⚠️ Partial | `allowed-tools` uses shell `head`, `cat`, `ls`, `find` — duplicates native `Read`, `Glob` |
| Error handling — no package.json | ❌ Missing | What if project has no `package.json`? (e.g., Python, Go, Rust). Phase 1 detection table assumes Node; Phase 2 assumes JS/TS file extensions |
| Error handling — empty project | ❌ Missing | What if `src/` has <3 files? Generation should skip pattern extraction or FAIL with "not enough code to analyze" |
| Framework-version awareness | ❌ Missing | Phase 2 doesn't prompt for framework MAJOR VERSION (Express v5 ≠ v4; React 19 ≠ 18) — but gotchas often live in version-specific behaviors |
| Evidence coercion | ✅ Strong | Naming conventions table requires `(file:line)` for each entry |

**Actions:**
- [ ] Tighten `allowed-tools` to: `Write, Read, Grep, Glob, Bash(wc:*), Bash(ls:*)` — drop `head`, `cat`, `find` (use native tools); keep `wc` for line counting and `ls` where shell expansion helps
- [ ] Add to Phase 1 DISCOVER a fallback: "If no `package.json` exists, detect the primary language from file extensions (`*.py` → Python, `*.go` → Go, `*.rs` → Rust) and adapt the config search accordingly."
- [ ] Add to Phase 2 ANALYZE a pre-check: "If the project has fewer than 3 source files, STOP. Report: 'Not enough code to extract reliable patterns. Add representative files first or write CLAUDE.md manually.'"
- [ ] Add to Phase 2 a new question: "For each detected framework, what is its MAJOR VERSION? Note any well-known breaking changes from the previous major (e.g., Express v4 → v5 requires `next(error)` in async handlers)."

---

### Concept #28 — Output Section Detail
> Structured, traceable, reports what was done.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File written to disk | ✅ Present | Phase 3 ends with "Save to `${ARGUMENTS:-CLAUDE.md}`" |
| Completion report | ⚠️ Partial | `<success_criteria>` says "Report includes: line count, detected project type, sections generated, key patterns found" — but there is no `<output>` block defining the report's shape |
| Backup on overwrite | ❌ Missing | See concept #26 — no `.bak` on overwrite |
| Chain hint | ❌ Missing | No suggestion on what to do next (validate? commit?) |

**Actions:**
- [ ] Add a terminal `<output>` block printed to the user after generation:
  ```
  CLAUDE.md Generated.

  Path: {target path}
  Lines: {count} / 200
  Project type: {detected}
  Sections: Commands, Tech Stack, Architecture, Key Patterns, Naming, Testing, AI Gotchas, Key Files, Anti-Patterns
  Patterns extracted: {count} with file:line evidence
  AI Gotchas identified: {count}
  Previous CLAUDE.md: {backed up to CLAUDE.md.bak | no prior file}

  Next steps:
  1. Review the file. Strengthen AI Gotchas with any known pitfalls the command missed.
  2. Run `/validate` to confirm the AI layer still passes build/lint/test with the new rules.
  3. Commit with `/commit` scope `ai-layer`.
  ```

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Generate or regenerate CLAUDE.md from codebase analysis — works on any project" |
| `argument-hint` | ✅ Good | `[output-path]` — clear |
| `allowed-tools` | ⚠️ Redundant | `head:*`, `cat:*`, `find:*` duplicate native `Read`/`Glob` |

**Actions:**
- [ ] Slim `allowed-tools` to: `Write, Read, Grep, Glob, Bash(wc:*), Bash(ls:*), Bash(cp:*)` — drop `head/cat/find`; add `cp` for the `.bak` backup

---

## Action Plan Summary

### Priority 1 — Add the Missing `## AI Gotchas` + `## Testing` Sections (concept #17) — headline change

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add `## Testing` to the required template in Phase 3 | #17 |
| 1.2 | Add `## AI Gotchas` to the required template — with guidance to the agent on what qualifies (subtle, project-specific pitfalls) | #17 |
| 1.3 | Add a question in Phase 2 ANALYZE that explicitly prompts for AI-specific pitfalls | #17 |
| 1.4 | Add a question in Phase 2 for framework MAJOR VERSION + known breaking changes | #17, #27 |

### Priority 2 — Destructive-Write Safety (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Detect existing CLAUDE.md; offer REGENERATE / MERGE / CANCEL | #26 |
| 2.2 | Always write a `.bak` backup before overwriting | #26 |
| 2.3 | MERGE mode must preserve `## AI Gotchas` section verbatim (it accumulates from `/rca` over time) | #17, #26 |

### Priority 3 — Enforce Exclusions (concept #18)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add explicit exclusion list to Phase 3 content rules: no universal knowledge / workflows / task-specific content | #18 |
| 3.2 | Add to Phase 4 VALIDATE: `NO_UNIVERSAL`, `NO_WORKFLOWS`, `NO_TASK_CONTEXT` checks | #18 |

### Priority 4 — Input / Output Polish (concepts #25, #26, #28)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Add persona: "technical writer for a new agent on day one" | #26 |
| 4.2 | Add meta-trigger note (when to invoke) | #26 |
| 4.3 | Add terminal `<output>` summary block with path, lines, sections, AI Gotchas count, backup path, next steps | #28 |
| 4.4 | Explicit session-start framing in `<objective>` | #1 |

### Priority 5 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Phase 1 fallback for non-Node projects (Python/Go/Rust) | #27 |
| 5.2 | Phase 2 empty-project pre-check: STOP if <3 source files | #27 |
| 5.3 | Tighten `allowed-tools`: drop shell duplicates, add `Bash(cp:*)` for backup | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (especially §17 and §18)
2. `.claude/commands/create-rules.md` — current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-11-audit-create-rules.md` — this audit
4. `CLAUDE.md` — for shape reference of a "good" CLAUDE.md (current project)
5. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-9-audit-rca.md` — for the `/rca` → `rule-gap` → CLAUDE.md §AI Gotchas cross-reference

Rewrite `.claude/commands/create-rules.md` with these requirements:

1. **Frontmatter** — replace `allowed-tools` with:
   `Write, Read, Grep, Glob, Bash(wc:*), Bash(ls:*), Bash(cp:*)`
   Keep `description` and `argument-hint` unchanged.

2. **`<objective>`** — add at the top:
   > You are a technical writer documenting this codebase. Your audience is a new AI agent arriving with zero context — write what it needs to avoid mistakes on day one, nothing more.
   >
   > **Purpose of CLAUDE.md**: It is auto-loaded at every session start. It governs all agent behavior before any task-specific context arrives. Bloat reduces adherence; absence of project-specific gotchas costs the agent silent failures.
   >
   > **When to run**: (a) initializing a new project's AI layer, (b) after a major structural refactor, or (c) when `/rca` has accumulated ≥3 `rule-gap` findings that should be consolidated.

   Keep the existing Core Principle, Target length, and Project-agnostic lines.

3. **`<context>`** — keep the 5 existing auto-runs. Add destructive-write detection:
   > **Pre-condition**: If `${ARGUMENTS:-CLAUDE.md}` already exists, before generating anything:
   > 1. Print its current line count and first 20 lines.
   > 2. Ask the user: **REGENERATE** (full rewrite — current backed up to `{path}.bak`), **MERGE** (regenerate sections that evolved; PRESERVE `## AI Gotchas` verbatim), or **CANCEL**.
   > 3. If non-interactive, default to **MERGE** with backup.

4. **Phase 1 DISCOVER** — at the top, add a language fallback:
   > If no `package.json` is detected, switch primary-language detection to file extensions: `*.py` → Python (look for `pyproject.toml`, `requirements.txt`, `setup.py`); `*.go` → Go (`go.mod`); `*.rs` → Rust (`Cargo.toml`). Adapt Phase 2 file discovery accordingly.

5. **Phase 2 ANALYZE** — add two new items before the CHECKPOINT:

   **Pre-check — Enough code to analyze?**
   > If the project has fewer than 3 source files across all detected layers, STOP. Report: "Not enough code to extract reliable patterns. Add representative files or write CLAUDE.md manually."

   **Framework versions + breaking changes**
   > For each detected framework, note the MAJOR VERSION (e.g., Express 5, React 19, Next.js 15). List any well-known breaking changes from the previous major that affect everyday code (e.g., Express 4→5 requires `next(error)` in async handlers; React 18→19 server component defaults). These become the seed for AI Gotchas.

   **AI-specific pitfalls — the headline question**
   > Add to the question list: "What does a generic AI suggestion get wrong in this project? Look for: framework-version idioms (error propagation, middleware registration), resource cleanup patterns (DB statements, streams, timers), validation order (parse before use), monorepo path aliases, test setup/teardown requirements. For each one, document: the wrong (generic) approach, the correct project-specific approach, file:line evidence."

6. **Phase 3 GENERATE — required template** — add two sections and tighten content rules.

   Update the required sections list to include `## Testing` and `## AI Gotchas`. The template's Required block becomes:

   ```markdown
   # CLAUDE.md

   ## Commands
   <copy-paste ready commands for dev, build, lint, test; group by directory if monorepo>

   ## Tech Stack
   | Layer | Technology | Version | Notes |

   ## Architecture
   <annotated directory tree — only important dirs>

   ## Data Flow
   <1–3 sentences: how a request/action moves through the system>

   ## Key Patterns
   - Error handling: {pattern with file:line}
   - Validation: {pattern with file:line}
   - Data access: {pattern with file:line}
   - State management: {pattern with file:line}

   ## Naming Conventions
   - Files: {convention}
   - Functions/variables: {convention}
   - Types/interfaces: {convention}

   ## Testing
   - Runner: {tool + config path}
   - Location: {co-located | __tests__/ | tests/}
   - Patterns: {fixture strategy, isolation, setup/teardown}

   ## AI Gotchas
   <The section a generic AI most needs. Each gotcha: one sentence on the wrong approach, one sentence on the correct approach, file:line evidence. Examples of categories (do NOT invent gotchas — only include what you verified in code):
     - Framework-version idioms
     - Resource cleanup requirements
     - Validation/parse ordering
     - Error propagation rules
     - Path aliases / module resolution quirks>

   ## Key Files
   | Purpose | File |

   ## Anti-Patterns (Do NOT)
   <specific, traced from actual codebase constraints>
   ```

   Update **Content rules** with explicit exclusions:
   > **REJECT content that is:**
   > - (a) **Universal knowledge** any trained AI already has (React basics, what git is, how HTTP works, TypeScript syntax)
   > - (b) **Workflow steps** (those belong in `.claude/commands/`, not CLAUDE.md)
   > - (c) **Task-specific requirements** (those belong in `.agents/PRDs/` or plans)
   > - (d) **Aspirational language** without enforcement ("should", "try to", "ideally")

7. **Phase 4 VALIDATE** — extend the check table with three new checks (in addition to the existing 7):
   | NO_UNIVERSAL | File does not restate knowledge any trained AI already has |
   | NO_WORKFLOWS | File does not describe procedures (those belong in commands) |
   | NO_TASK_CONTEXT | File does not mention any specific feature, story, PR, or in-flight work |

8. **`<output>`** — add a terminal summary block (printed to the user):
   ```
   CLAUDE.md Generated.

   Path: {target path}
   Lines: {count} / 200
   Project type: {detected}
   Sections emitted: {comma list — must include AI Gotchas and Testing}
   Patterns with file:line: {count}
   AI Gotchas identified: {count}
   Previous CLAUDE.md: {backed up to {path}.bak | no prior file}

   Next steps:
   1. Review — strengthen AI Gotchas with any pitfalls the command missed.
   2. Run `/validate` to confirm the AI layer still passes.
   3. Commit with `/commit` using scope `ai-layer`.
   ```

9. **`<success_criteria>`** — add:
   - `## AI Gotchas` section present and populated (not empty) (concept #17)
   - `## Testing` section present with runner + location + patterns (concept #17)
   - If CLAUDE.md pre-existed, a `.bak` backup was written (concept #26)
   - NO_UNIVERSAL / NO_WORKFLOWS / NO_TASK_CONTEXT checks pass (concept #18)

10. **Do NOT change**:
    - The 200-line hard cap
    - The evidence-first / no-invention principle
    - Project-agnostic detection table (only extend)
    - Phase 4 existing 7 checks (only add new ones)
    - `<success_criteria>`'s existing items

Do NOT change any source code. Only modify `.claude/commands/create-rules.md`.
````

---

## Success Criteria

- [ ] Persona in `<objective>` ("technical writer for a new agent on day one") (concept #26)
- [ ] Session-start purpose of CLAUDE.md stated in `<objective>` (concept #1)
- [ ] Meta-trigger note: when to invoke, including `/rca` rule-gap threshold (concepts #26, #7)
- [ ] Destructive-write safety: existing-file detection + REGENERATE/MERGE/CANCEL prompt + `.bak` (concept #26)
- [ ] Non-Node language fallback in Phase 1 (Python/Go/Rust) (concept #27)
- [ ] Phase 2 empty-project pre-check (≥3 source files) (concept #27)
- [ ] Phase 2 framework major-version + breaking-changes question (concept #17)
- [ ] Phase 2 explicit AI-pitfalls question (concept #17 — seeds AI Gotchas)
- [ ] **`## Testing` section added to Phase 3 required template** (concept #17)
- [ ] **`## AI Gotchas` section added to Phase 3 required template with agent guidance** (concept #17 — headline)
- [ ] Phase 3 content rules reject universal knowledge / workflows / task-specific content (concept #18)
- [ ] Phase 4 VALIDATE adds NO_UNIVERSAL, NO_WORKFLOWS, NO_TASK_CONTEXT (concept #18)
- [ ] Terminal `<output>` summary block with path, lines, sections, AI Gotchas count, backup path, next steps (concept #28)
- [ ] `allowed-tools` tightened: drop `head`/`cat`/`find`; add `Bash(cp:*)` for backup (best practice)
- [ ] Evidence-first discipline, 200-line cap, and project-agnostic detection preserved ✅
