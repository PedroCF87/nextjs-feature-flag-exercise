# Phase 1 — Global Rules: Round 1 — Audit `CLAUDE.md`

**Target file**: `nextjs-feature-flag-exercise/CLAUDE.md`

**Gold Standard concepts**: #1, #16, #17, #18, #19, #20, #21

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Line count**: 222 lines (slightly exceeds ~200 line limit)
- **File name**: `CLAUDE.md` ✅ (correct for Claude Code per concept #16)

### Section Inventory (current CLAUDE.md)

| Section | Lines (approx) | Gold Standard Topic |
|---------|----------------|---------------------|
| Workshop Context | ~12 | ❌ Task-specific — describes "implement feature flag filtering" (#18 anti-pattern) |
| Branch Rules | ~5 | ✅ Constraints — but buried inside Workshop Context |
| Tech Stack | ~30 | ✅ Tech Stack (#17) |
| Commands | ~20 | ❌ Workflows — should NOT be in global rules (#18) |
| Architecture (Project Structure) | ~20 | ✅ Architecture (#17) |
| Architecture (Data Flow) | ~10 | ✅ Architecture (#17) |
| Architecture (API Endpoints) | ~10 | ✅ Architecture (#17) |
| Code Style & Patterns | ~25 | ✅ Code Styles (#17) |
| Testing Strategy | ~18 | ⚠️ Partial — includes bash commands (#18 anti-pattern) |
| On-Demand Context | ~8 | ✅ Strategy #2 loading — points to `.agents/reference/` |
| Error Handling | ~20 | ⚠️ Mix of essential rules + verbose code examples |
| Key Files Reference | ~12 | ✅ Navigation aid |

---

## Concept-by-Concept Audit

### Concept #1 — Global Rules Purpose
> Document PRD decisions (tech stack, architecture, constraints). Serve as stable base that rarely changes.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Tech stack decisions documented | ✅ Present | Backend and Frontend tables list full stack with versions |
| Architecture patterns documented | ✅ Present | Project Structure tree, Data Flow list, API Endpoints table |
| Constraints documented | ⚠️ Partial | Branch Rules exist but buried in "Workshop Context"; no "## Constraints" section |
| Conventions documented | ✅ Present | Code Style & Patterns with TS, Backend, Frontend sections |
| Stable base (rarely changes) | ⚠️ Partial | "## Workshop Context" describes the current task ("implement feature flag filtering") — task-specific content that will become stale |

**Actions:**
- [ ] Extract Branch Rules from Workshop Context into a top-level `## Constraints` section
- [ ] Remove the task description from Workshop Context (or remove the section entirely)

---

### Concept #16 — File Naming Standards
> `CLAUDE.md` for Claude Code. `AGENTS.md` as emerging universal standard.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File named `CLAUDE.md` | ✅ Present | Correct name at project root |
| Consider `AGENTS.md` | 🔵 Optional | Not required for this project |

No actions required.

---

### Concept #17 — What to Include
> Tech Stack & Architecture, Code Styles & Patterns, Testing Requirements, Misconceptions AI Often Has.

| Required Topic | Status | Evidence |
|----------------|--------|----------|
| **Tech Stack & Architecture** | ✅ Present | Backend + Frontend tables + project structure |
| **Code Styles & Patterns** | ✅ Present | TypeScript, Backend Patterns, Frontend Patterns sections |
| **Testing Requirements** | ⚠️ Partial | Location, isolation, patterns present — but bash commands included (anti-pattern #18) |
| **Misconceptions AI Often Has** | ❌ Missing | No dedicated section. Project-specific gotchas exist in Code Patterns but are not labeled or consolidated as AI-specific traps |

**The most critical gap for this project**: this codebase has several patterns where AI assistants consistently make mistakes (Express v5 error propagation, SQL.js resource management) — none are explicitly flagged as AI traps.

**Actions:**
- [ ] Add `## AI Gotchas` section with project-specific misconceptions (see Priority 2 below)
- [ ] Move testing rules to a single compact list — remove bash validation commands

---

### Concept #18 — What NOT to Include
> No universal knowledge, no workflows, no task-specific content, no bloat. ~200 line limit.

| Anti-pattern | Present? | Evidence | Action |
|--------------|----------|----------|--------|
| **Universal knowledge** | ⚠️ Minor | Error Response JSON format (`"error": "NOT_FOUND"`) — the shape is already documented in the error classes; the JSON example adds little | Condense |
| **Workflows/commands** | ✅ Yes | `## Commands` section has all `pnpm` dev commands (install, dev, build, lint, test) | Remove |
| **Validation bash commands** | ✅ Yes | `### Validation Checks` inside Testing has `cd server && pnpm run build...` bash blocks | Remove |
| **Task-specific content** | ✅ Yes | "## Workshop Context" describes "implement feature flag filtering" — this is the current task, not stable project knowledge | Remove task description |
| **Bloat** | ⚠️ Minor | 222 lines — 22 over the ~200 target | Reduce |

**Actions (high impact):**
- [ ] **Remove `## Commands` section** (~20 lines) — dev commands belong in a `/prime` or `README.md`, not global rules
- [ ] **Remove `### Validation Checks` bash block** (~8 lines) — belongs in `/validate` command (already exists)
- [ ] **Remove task description from `## Workshop Context`** (~5 lines) — keep only Branch Rules, rename section to `## Constraints`
- [ ] **Condense `## Error Handling`** — keep error class names and usage pattern; remove JSON response format example (~6 lines saved)

---

### Concept #19 — Context Loading Tax
> Front-load once, auto-load every session. High signal-to-noise ratio.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Auto-loads every session | ✅ Present | `CLAUDE.md` is the Claude Code auto-load file |
| Signal-to-noise ratio | ⚠️ Degraded | ~28 lines of workflows (Commands + Validation Checks) consume context window every session without benefit |

**Actions:**
- [ ] Removing Commands + Validation bash blocks saves ~28 lines, improving signal-to-noise immediately

---

### Concept #20 — Organizational Metaphor
> Global Rules = day 1 onboarding. Dynamic Context = department training. Layer 2 = task assignment.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Acts as "day 1 onboarding" | ⚠️ Partial | Contains onboarding content (tech stack, architecture, patterns) but also task-specific context |
| Clearly separates from On-Demand Context | ✅ Present | `## On-Demand Context` section explicitly points to `.agents/reference/` docs — this is well done |
| On-Demand Context docs exist | ✅ Present | `.agents/PRDs/feature-flag-manager.prd.md`, `.agents/reference/frontend.md`, `.agents/reference/backend.md` |

**Notable strength**: This project already has On-Demand Context docs in `.agents/reference/` — better than most.

**Actions:**
- [ ] Remove task-specific content (Workshop Context description) so CLAUDE.md reads purely as onboarding

---

### Concept #21 — Two Loading Strategies
> Strategy #1 (Automatic): stable, highest level, every session.
> Strategy #2 (As Needed): specific task types, loaded by commands.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Strategy #1 content in CLAUDE.md | ⚠️ Mixed | Has both stable (tech stack, architecture) and unstable (current task, bash commands) content |
| Strategy #2 docs exist | ✅ Present | `.agents/reference/frontend.md` and `.agents/reference/backend.md` |
| Commands reference As Needed docs | ❓ Unknown | Will be audited in Phases 2–3 — `.agents/reference/` docs should be referenced by `/plan` and `/implement` |

**Actions:**
- [ ] Ensure the On-Demand Context table in CLAUDE.md stays current as new reference docs are added
- [ ] (Phase 2–3 follow-up) Verify that `/plan` and `/implement` commands explicitly instruct loading `.agents/reference/` docs

---

## Action Plan Summary

### Priority 1 — Remove (reduce bloat from 222 → ~190 lines)

| # | Action | Lines Saved (est.) |
|---|--------|--------------------|
| 1.1 | Remove `## Commands` section (pnpm dev commands) | ~20 |
| 1.2 | Remove `### Validation Checks` bash block inside Testing | ~8 |
| 1.3 | Remove task description from `## Workshop Context` | ~5 |
| 1.4 | Condense `## Error Handling` — remove JSON response format example | ~6 |
| | **Total estimated savings** | **~39 lines → ~183 lines** |

### Priority 2 — Add `## AI Gotchas` Section (concept #17)

This project has two critical patterns where AI assistants consistently make mistakes. These must be explicitly called out:

| # | Gotcha | Why it matters |
|---|--------|----------------|
| 2.1 | **Express v5 error propagation**: ALWAYS `next(error)` in catch blocks — NEVER `res.status().json()` manually inside catch | Express v5's centralized error middleware only receives errors passed via `next(error)`. Manual responses in catch blocks bypass it silently. |
| 2.2 | **SQL.js resource leak**: ALWAYS `stmt.free()` in a `finally` block — NEVER skip it, even on errors | SQL.js compiled WASM does not garbage-collect prepared statements. Missing `stmt.free()` leaks memory on every call. |
| 2.3 | **Validation order**: ALWAYS parse with Zod BEFORE business logic — NEVER call service with unvalidated data | Zod schemas are the only boundary between untrusted input and the service layer. |
| 2.4 | **TypeScript imports**: ALWAYS use `import type` for type-only imports | Strict mode + ESM requires type imports to be erased at compile time. |
| 2.5 | **Error classes**: NEVER `throw new Error(...)` — use `NotFoundError`, `ConflictError`, or `ValidationError` | Generic errors bypass the error middleware's structured response formatter. |

### Priority 3 — Restructure (align with Gold Standard sections)

| # | Action |
|---|--------|
| 3.1 | Rename `## Workshop Context` → `## Constraints` and keep only Branch Rules |
| 3.2 | Condense `## Error Handling` to error class names + one-line usage rule only |
| 3.3 | In Testing section: keep rules (location, isolation, pattern), remove bash commands |

---

## Target Structure (post-refactor)

```markdown
# CLAUDE.md (~185 lines target)

## Constraints
- Branch Rules (base: exercise-1, never commit to main)

## Tech Stack
(Backend table + Frontend table + Shared — unchanged)

## Architecture
(Project Structure tree + Data Flow list + API Endpoints table — unchanged)

## Code Style & Patterns
(TypeScript + Backend Patterns + Frontend Patterns — unchanged)

## Testing Strategy
(Location, isolation, pattern — NO bash commands)

## AI Gotchas
- Express v5: next(error) in catch, never manual res.status().json()
- SQL.js: stmt.free() in finally, always
- Validation: Zod parse before business logic, always
- TypeScript: import type for type-only imports
- Errors: NotFoundError / ConflictError / ValidationError only

## On-Demand Context
(Table pointing to .agents/reference/ — unchanged)

## Error Handling
(Error class usage: one example per class, no JSON format)

## Key Files Reference
(Table — unchanged)
```

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — the Gold Standard reference
2. `CLAUDE.md` from `nextjs-feature-flag-exercise` — the current file to rewrite
3. `docs/Gold-Standard-Plan/phases/phase-1-global-rules/round-1-audit-claude-md.md` — this audit plan

Execute the action plan to rewrite `CLAUDE.md`:

**Rewrite `CLAUDE.md`** with these requirements:

1. **Remove `## Commands` section entirely** (lines ~49–69). These pnpm dev commands belong in a README or `/prime` command, not global rules.

2. **Replace `## Workshop Context`** with `## Constraints`:
   - Remove: "This is an exercise for the Agentic Engineering Workshop. The task is to implement feature flag filtering (see `TASK.md`)."
   - Keep: Branch Rules exactly as-is

3. **Remove `### Validation Checks` bash block** from the Testing Strategy section (the `cd server && pnpm run build...` block). Keep the rule "All checks must pass with zero errors." as a single line.

4. **Condense `## Error Handling`**:
   - Keep the three `throw new XxxError(...)` examples
   - Remove the "### Error Response Format" JSON block — this is the middleware's concern, not the AI's
   - Keep the section but reduce it to ~8 lines

5. **Add `## AI Gotchas` section** after `## Testing Strategy` and before `## On-Demand Context`:
   ```markdown
   ## AI Gotchas

   Project-specific patterns where AI assistants commonly make mistakes:

   - **Express v5 error propagation**: In route handlers, ALWAYS use `next(error)` in catch blocks. NEVER call `res.status().json()` inside a catch — it bypasses the centralized error middleware silently.
   - **SQL.js resource leak**: ALWAYS call `stmt.free()` in a `finally` block after every prepared statement. NEVER skip it — WASM does not garbage-collect statements.
   - **Validation order**: ALWAYS parse request data with Zod BEFORE passing to service layer. NEVER call a service method with unvalidated input.
   - **Type imports**: ALWAYS use `import type { Foo }` for type-only imports. Never `import { Foo }` when Foo is only used as a type.
   - **Custom errors only**: NEVER `throw new Error(...)`. Use `NotFoundError`, `ConflictError`, or `ValidationError` so the error middleware formats the response correctly.
   ```

6. **Keep unchanged**: Tech Stack tables, Architecture section (Project Structure + Data Flow + API Endpoints), Code Style & Patterns, Testing location/isolation/pattern rules, On-Demand Context table, Key Files Reference table.

7. **Validate line count**: After rewriting, count lines. Target: ≤ 200.

Do NOT change any source code. Only modify `CLAUDE.md`.
````

---

## Success Criteria

- [ ] `CLAUDE.md` ≤ 200 lines
- [ ] Contains required Gold Standard topics: Tech Stack, Architecture, Code Styles, Testing Rules, AI Gotchas (concept #17)
- [ ] Does NOT contain: bash dev commands, bash validation commands, task description (concept #18)
- [ ] `## Constraints` section has Branch Rules (no task description)
- [ ] `## AI Gotchas` section has all 5 project-specific misconceptions (concept #17)
- [ ] `## On-Demand Context` table unchanged — still points to `.agents/reference/` docs (concepts #20, #21)
- [ ] All factual rules and conventions preserved — zero information loss
- [ ] `pnpm run build && pnpm run lint && pnpm test` still pass (no source code changed)
