# Phase 2 — Core 4 Commands: Round 2 — Audit `/prime` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/prime.md`
**Gold Standard concepts**: #2, #8, #10, #25, #26
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~167
- **Frontmatter**: `allowed-tools: Read, Grep, Glob, Bash(git:*, find:*, ls:*, cat:*, head:*, wc:*)`, `description: Prime agent with codebase context`, `argument-hint: [optional PRD or feature area]`
- **Format**: XML-style tags (`<objective>`, `<context>`, `<process>`, `<success_criteria>`)
- **Structure**: 6 phases — FOUNDATION → DISCOVER → CORE FILES → EXTERNAL CONTEXT → VALIDATE → SUMMARIZE

### Current Content Summary
1. **`<objective>`**: Generic description — loads context, auto-detects architecture
2. **`<context>`**: Auto-runs `find`, package manager detection, `git status`, checks if `$ARGUMENTS` points to a PRD file
3. **`<process>` Phase 1 — FOUNDATION**: Reads CLAUDE.md, package.json, tsconfig.json with extraction annotations
4. **`<process>` Phase 2 — DISCOVER**: Auto-detects monorepo/framework/architecture/testing/database
5. **`<process>` Phase 3 — CORE FILES**: Reads core files based on detected architecture type (VSA / Layered / Next.js / **Full-stack split** ✅)
6. **`<process>` Phase 4 — EXTERNAL CONTEXT**: Handles PRD files or feature area arguments
7. **`<process>` Phase 5 — VALIDATE**: Runs lint + type check from CLAUDE.md or package.json
8. **`<process>` Phase 6 — SUMMARIZE**: Produces structured summary (tech stack, architecture, data flow, key patterns, git state, validation)
9. **`<success_criteria>`**: 6 checklist items including "no hardcoded paths"

### Project-Specific Architecture Match
This project uses **Full-stack split** architecture (`client/` + `server/` as separate packages). Phase 3 CORE FILES explicitly handles this pattern under "For Layered projects" — reading shared types, middleware, and one example service. This matches the `nextjs-feature-flag-exercise` structure correctly.

---

## Concept-by-Concept Audit

### Concept #2 — Core 4: `/prime` Purpose
> Load project context into agent memory.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Loads project context into memory | ✅ Present | 6 phases systematically load CLAUDE.md, project structure, core files, git state |
| Is a Core 4 command | ✅ Present | Exists as `.claude/commands/prime.md` |
| Handles optional feature-area context | ✅ Present | Phase 4 EXTERNAL CONTEXT handles `$ARGUMENTS` as PRD or feature area |

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `<context>` auto-loads git state and project structure — the right idea, but no persona, no pre-conditions, no explicit Input framing |
| **Process** | ✅ Present | 6 labeled phases with numbered steps and extraction annotations per file |
| **Output** | ✅ Present | Phase 6 SUMMARIZE defines a structured markdown summary template |

**Actions:**
- [ ] Add persona to `<objective>`: "You are an expert developer onboarding to this project for the first time in this session."
- [ ] Add pre-condition to `<objective>` or new `<input>` block: "This is the **Planning phase** entry point of the PIV Loop. Run at the start of every session before `/plan` or `/implement`."

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, what context to load, what files to read.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a..." statement in `<objective>` |
| PIV Loop positioning | ❌ Missing | Not identified as the Planning phase entry point |
| Pre-conditions | ❌ Missing | No statement that this runs at session start |
| `$ARGUMENTS` clarity | ✅ Present | `argument-hint: [optional PRD or feature area]` + Phase 4 handles both cases |
| File purpose annotations | ✅ Present | Phase 1 says "Extract: Tech stack, architecture pattern, validation commands, key patterns, branch rules" |
| On-Demand Context discovery | ❌ Missing | Does NOT proactively discover `.agents/reference/` docs — the project's existing On-Demand Context (`frontend.md`, `backend.md`) is never surfaced in the summary |

**Actions:**
- [ ] Add persona to `<objective>`
- [ ] Add PIV positioning note: "Planning phase entry — run before `/plan` or `/implement`"
- [ ] Add On-Demand Context discovery step: "Glob `.agents/reference/*.md` and `.agents/PRDs/*.md`. List discovered docs in the summary so the user knows what context is available for future commands."

---

### Concept #8 — Context Engineering (Memory + RAG)
> Memory = context persistence. RAG = on-demand retrieval of relevant docs.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **Memory** — loads stable project context | ✅ Present | Phase 1 reads CLAUDE.md and internalizes conventions; Phase 6 produces a persistent summary |
| **RAG** — identifies On-Demand Context for later retrieval | ⚠️ Partial | Phase 4 handles PRD/feature if explicitly passed via `$ARGUMENTS`, but does NOT scan `.agents/reference/` to make available docs discoverable |
| RAG discoverability | ❌ Missing | After `/prime`, the agent doesn't know that `frontend.md` and `backend.md` exist in `.agents/reference/` for `/plan` or `/implement` to use |

**Actions:**
- [ ] Add to Phase 1 or Phase 4: "Glob `.agents/reference/*.md` and list found docs in the summary under 'Available On-Demand Context'. These will be loaded by `/plan` and `/implement` as needed."

---

### Concept #10 — Developer B Qualities
> AI understands context, reads code autonomously, codebase-aware, complete context = force multiplier.

| Developer B Quality | Status | Evidence |
|---------------------|--------|----------|
| AI understands context | ✅ Present | Phase 6 SUMMARIZE proves understanding by producing a structured synthesis |
| Reads code autonomously | ✅ Present | Phase 3 reads core files based on detected architecture — no hardcoded paths |
| Codebase-aware | ✅ Present | Phase 2 DISCOVER auto-detects monorepo, framework, architecture, database, test runner |
| Complete context | ⚠️ Partial | Missing: available On-Demand Context docs, AI layer artifacts inventory (commands, agents) |

**Actions:**
- [ ] Add step to scan `.claude/commands/*.md` and `.claude/agents/*.md` — list available AI layer artifacts in the summary so the user knows what commands/agents are ready to use

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ⚠️ Weak | "Prime agent with codebase context" — generic, lacks "Use at start of every session" trigger |
| `argument-hint` | ✅ Good | `[optional PRD or feature area]` — clear |
| `allowed-tools` | ⚠️ Bloated | `Bash(cat:*, head:*, wc:*)` — these are unnecessary; `Read` covers file reading better. `Bash(ls:*)` is also replaceable by `Glob`. Recommend trimming to: `Read, Grep, Glob, Bash(git:*, find:*)` |

**Actions:**
- [ ] Update `description`: "Prime agent with full project context. Use at the start of every session, before `/plan` or `/implement`."
- [ ] Trim `allowed-tools`: remove `Bash(cat:*)`, `Bash(head:*)`, `Bash(wc:*)`, `Bash(ls:*)` — use `Read` and `Glob` instead

---

## Action Plan Summary

### Priority 1 — Add Persona, PIV Positioning, and On-Demand Context Discovery (concepts #25, #26, #8)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add persona to `<objective>`: "You are an expert developer onboarding to this project for the first time in this session." | #26 |
| 1.2 | Add PIV positioning: "Planning phase entry point of the PIV Loop — run before `/plan` or `/implement`." | #2 |
| 1.3 | Add On-Demand Context discovery step: `Glob .agents/reference/*.md` and `.agents/PRDs/*.md` | #8, #26 |
| 1.4 | Include discovered docs in Phase 6 SUMMARIZE output under "Available On-Demand Context" | #8, #10 |

### Priority 2 — Add AI Layer Inventory (concept #10)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add step to glob `.claude/commands/*.md` and `.claude/agents/*.md` | #10 |
| 2.2 | Include in Phase 6 summary: "Available commands" and "Available agents" | #10 |

### Priority 3 — Frontmatter Cleanup

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Update `description` with proactive trigger | #25 |
| 3.2 | Remove `Bash(cat:*)`, `Bash(head:*)`, `Bash(wc:*)`, `Bash(ls:*)` from `allowed-tools` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — the Gold Standard reference
2. `.claude/commands/prime.md` from `nextjs-feature-flag-exercise` — the current command
3. `docs/Gold-Standard-Plan/phases/phase-2-core-commands/round-2-audit-prime.md` — this audit plan

Execute the action plan to rewrite `prime.md`:

**Rewrite `.claude/commands/prime.md`** with these requirements:

1. **Frontmatter**:
   - Update `description` to: "Prime agent with full project context. Use at the start of every session, before `/plan` or `/implement`."
   - Trim `allowed-tools` to: `Read, Grep, Glob, Bash(git:*, find:*)`
   - Keep `argument-hint` unchanged.

2. **Expand `<objective>`** with:
   - Persona: "You are an expert developer onboarding to this project for the first time in this session."
   - PIV positioning: "This is the **Planning phase** entry point of the PIV Loop. Run before `/plan` or `/implement`."
   - Keep the existing two-sentence description.

3. **Add On-Demand Context discovery** — insert as a new step inside Phase 1 FOUNDATION (after reading tsconfig.json):
   ```
   4. **Glob On-Demand Context docs** in `.agents/reference/*.md` and `.agents/PRDs/*.md`
      - List all discovered files by name
      - These will be loaded on-demand by `/plan` and `/implement` as needed
   ```

4. **Add AI Layer inventory** — insert as a new step inside Phase 2 DISCOVER (after auto-detection):
   ```
   **AI Layer?**
   - Glob `.claude/commands/*.md` — list available slash commands
   - Glob `.claude/agents/*.md` — list available subagents
   ```

5. **Update Phase 6 SUMMARIZE template** — add two new sections to the output:
   ```markdown
   **Available On-Demand Context** (from `.agents/reference/` and `.agents/PRDs/`):
   - {list discovered files}

   **AI Layer**:
   - Commands: {list from .claude/commands/}
   - Agents: {list from .claude/agents/}
   ```

6. **Do NOT change** Phase 2 DISCOVER (framework/architecture detection), Phase 3 CORE FILES, Phase 4 EXTERNAL CONTEXT, Phase 5 VALIDATE, or `<success_criteria>`.

Do NOT change any source code. Only modify `.claude/commands/prime.md`.
````

---

## Success Criteria

- [ ] `description` updated with "Use at start of every session, before `/plan` or `/implement`" (concept #25)
- [ ] `allowed-tools` trimmed — `cat`, `head`, `wc`, `ls` removed (best practice)
- [ ] Persona present in `<objective>` (concept #26)
- [ ] PIV Loop positioning stated: "Planning phase entry point" (concept #2)
- [ ] On-Demand Context discovery step added: `Glob .agents/reference/*.md` and `.agents/PRDs/*.md` (concepts #8, #26)
- [ ] AI Layer inventory step added: glob `.claude/commands/` and `.claude/agents/` (concept #10)
- [ ] Phase 6 SUMMARIZE output includes "Available On-Demand Context" and "AI Layer" sections (concepts #8, #10)
- [ ] Phase 2 DISCOVER, Phase 3 CORE FILES, Phase 4, Phase 5 unchanged
- [ ] `<success_criteria>` unchanged
