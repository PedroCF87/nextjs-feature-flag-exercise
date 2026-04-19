# Phase 6 — Gap Analysis: Round 23 — On-Demand Context Gap

**Scope**: `.agents/` directory (full tree) vs commands and agents that should reference it
**Gold Standard concepts**: #4 (On-Demand Context), #9 (Two Planning Layers — Layer 2), #20 ("Department Training" metaphor), #21 (Reference guides)
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Analysis

### Discovery Finding — Project Already Has On-Demand Context Docs

**The original plan assumed On-Demand Context docs were MISSING.** The audit discovered they already exist. The gap is not *absence* — it is *discoverability, cross-referencing, and systematic loading*. These 5 high-quality reference documents are essentially invisible to the AI layer because no command or agent auto-loads them.

### `.agents/` Directory Full Inventory

```
.agents/
├── baseline/              # unknown lifecycle — likely baseline measurements per exercise
├── closure/               # unknown lifecycle — likely exercise closure reports
├── diagnosis/             # unknown lifecycle — likely diagnostic reports
├── governance/            # unknown lifecycle — likely governance rules/decisions
├── plans/                 # task plans (.plan.md) consumed by /implement
├── PRDs/                  # product PRDs (.prd.md) consumed by /create-stories + /plan
├── reference/             # ON-DEMAND CONTEXT — 5 substantive docs (THE GAP)
│   ├── backend.md             # 601 lines — narrative guide for backend features
│   ├── backend-patterns.md    # 372 lines — rule list with file:line examples
│   ├── frontend.md            # 454 lines — narrative guide for frontend features
│   ├── frontend-patterns.md   # 342 lines — rule list with file:line examples
│   └── sql-js-constraints.md  # 347 lines — SQL.js-specific constraint catalog
├── reports/               # generated audit/review/security reports
├── rca-reports/           # root cause analysis reports from /rca
├── reviews/               # /review-pr reports
├── screenshots/           # agent-browser skill screenshots
├── stories/               # /create-stories output files
├── templates/             # doc templates (for manual or command use)
├── validation/            # /validate output artifacts
└── CLAUDE-template.md     # template for CLAUDE.md regeneration
```

### Content Summary of the 5 Reference Docs

Each doc's purpose, size, and canonical patterns covered:

| File | Lines | Type | Key Content |
|------|-------|------|-------------|
| `backend.md` | 601 | Narrative | Layered architecture (Routes→Services→DB), Express v5 route pattern, error propagation, Zod boundary, SQL.js query lifecycle, testing patterns, `_resetDbForTesting()` |
| `backend-patterns.md` | 372 | Rule list | Express v5 `next(error)` with file:line examples, custom errors (`NotFoundError`, `ConflictError`, `ValidationError`), `stmt.free()` in `try/finally`, Zod `schema.parse()` before business logic, parameterized queries |
| `frontend.md` | 454 | Narrative | Component hierarchy (App→QueryClientProvider→FlagsApp→[FlagsTable, FlagFormModal, DeleteConfirmDialog]), TanStack Query hooks, state management, Radix UI primitives, Tailwind v4 utilities |
| `frontend-patterns.md` | 342 | Rule list | `useQuery`/`useMutation` patterns with file:line, `cn()` for class composition, `ComponentNameProps` interfaces, kebab-case filenames, `import type` for type-only imports, Radix primitive composition |
| `sql-js-constraints.md` | 347 | Constraint catalog | Why SQL.js differs from node-sqlite3/ORMs, synchronous API, no `.all()`/`.get()` (uses `step()`+`getAsObject()`), WASM init async only, INTEGER for booleans, `db.export()` for persistence, `stmt.free()` lifecycle |

**Total on-demand context**: 2,116 lines of project-specific patterns with file:line references — a comprehensive knowledge base that the AI layer currently ignores.

### What CLAUDE.md Currently Says About On-Demand Context

From [CLAUDE.md](CLAUDE.md) §On-Demand Context:
```
For deeper context on specific areas, read these files:

| Topic | File |
|-------|------|
| Project requirements | `.agents/PRDs/feature-flag-manager.prd.md` |
| Frontend patterns | `.agents/reference/frontend.md` |
| Backend patterns | `.agents/reference/backend.md` |
```

**Finding**: CLAUDE.md mentions the reference docs in a table — but CLAUDE.md is a *global rule* (auto-loaded at every session). Commands and agents that should conditionally load deeper reference docs don't do it. The table in CLAUDE.md is documentation only; it's not wired into any command's `<context>` block.

### Expected References (per Gold Standard §4, §20, §21)

Gold Standard defines three requirements for On-Demand Context:
1. **Auto-loaded by commands** when the task scope matches (e.g., `/plan` for a backend feature reads `backend.md` before planning)
2. **Referenced by agents** that operate on the matching surface (e.g., `silent-failure-hunter` compares against `backend-patterns.md`, not just its embedded knowledge)
3. **Maintained** as the codebase evolves — when a new pattern is established, the matching `.agents/reference/*.md` is updated; commands that load it get the update for free

---

## Concept-by-Concept Audit

### Concept #4 — On-Demand Context

> Gold Standard §4: On-Demand Context docs are loaded when specifically needed — they sit between Global Rules (always-loaded) and Task Plans (task-specific). They provide deeper, pattern-rich context without polluting the global context window.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| On-Demand docs exist | ✅ Strong | 5 docs totaling 2,116 lines |
| Docs are high quality with file:line evidence | ✅ Strong | `backend-patterns.md` and `frontend-patterns.md` use actual code snippets at real file:line locations |
| Commands auto-load the right doc for their scope | ❌ Missing | 10 of 14 commands never load any `.agents/reference/` doc despite their operations depending on these patterns |
| Agents reference the docs instead of duplicating | ❌ Missing | 5 of 6 agents re-describe patterns that live in these docs — creating a DRY violation and drift risk |
| A manifest exists to help commands choose which doc to load | ❌ Missing | No `.agents/reference/README.md` or `.agents/README.md` index |
| CLAUDE.md points to On-Demand docs as an active system | ⚠️ Partial | CLAUDE.md §On-Demand Context lists the docs but as a static lookup table, not as a convention for commands |

**Actions:**
- [ ] Create `.agents/reference/README.md` — manifest mapping each doc to its consumers (which commands + agents)
- [ ] Create `.agents/README.md` — top-level index classifying all subdirectories
- [ ] Update CLAUDE.md §On-Demand Context from a static table to a description of the convention with a producer/consumer map

---

### Concept #9 — Two Planning Layers

> Gold Standard §9: Layer 1 is project-wide (CLAUDE.md + On-Demand Context = "what the codebase is"). Layer 2 is task-specific (`/plan` output = "how to execute this feature"). On-Demand Context lives at Layer 1.5 — more specific than CLAUDE.md but applicable to many tasks.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Layer 1 (global) is populated | ✅ Present | CLAUDE.md is comprehensive (222 lines) |
| Layer 1.5 (On-Demand) exists | ✅ Present | 5 reference docs; high quality |
| Layer 1.5 is loaded by Layer 2 commands (planning) | ❌ Missing | `/plan` and `/implement` do not load any reference doc; they plan and execute without knowing the canonical patterns |
| Layer 1.5 is loaded by validation commands | ❌ Missing | `/review-pr` and `/validate` don't consult the pattern docs |
| Layer 1.5 is updated when Layer 1 evolves | ❌ Unknown | No convention for keeping reference docs in sync with CLAUDE.md changes |

**Actions:**
- [ ] `/plan` must conditionally load `backend.md` or `frontend.md` based on the story/feature scope (detected from `$ARGUMENTS` or the story's Labels field from Round 14)
- [ ] `/implement` must load the layer-appropriate reference doc before executing each task
- [ ] Establish a convention: when CLAUDE.md §Code Style or §Backend Patterns is updated, the corresponding `.agents/reference/*.md` should also be reviewed/updated

---

### Concept #20 — "Department Training" Metaphor

> Gold Standard §20: CLAUDE.md is like "company policy" — broadly applicable. On-Demand Context is like "department training" — specific to a role or surface area. You don't give every new employee the database team's training on day one, but the database team gets it when they need it.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Global rules don't contain layer-specific depth | ⚠️ Partial | CLAUDE.md §Backend Patterns has some Express v5 / SQL.js notes — these may duplicate `backend-patterns.md` |
| Layer-specific context is loaded on demand | ❌ Missing | Commands don't "hire" the department training when they need it |
| `/prime` acts as "company orientation" and announces department training exists | ❌ Missing | `/prime` loads CLAUDE.md and project structure but doesn't load any `.agents/reference/*.md` — the department training is announced (CLAUDE.md table) but not given |
| Commands load training when they start domain-specific work | ❌ Missing | `/plan`, `/implement`, `/review-pr` don't load the relevant reference doc |

**Actions:**
- [ ] `/prime` should auto-load all `.agents/reference/*.md` as part of orientation — giving the agent the full "department training" upfront, since `/prime` is explicitly the "learn the project" command
- [ ] Alternative (context-budget conscious): `/prime` loads the narrative docs (`backend.md`, `frontend.md`) while domain commands load the rule lists (`*-patterns.md`) on demand

---

### Concept #21 — Reference Guides

> Gold Standard §21: Reference guides are precise, linkable documents with file:line evidence. They are not narratives or tutorials. They answer "what is the canonical way to do X in this project?" with a code example.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Reference guides are precise and evidence-backed | ✅ Strong | `backend-patterns.md` and `sql-js-constraints.md` use file:line; `frontend-patterns.md` uses line references |
| Reference guides have a clear naming convention | ⚠️ Partial | `{layer}.md` = narrative; `{layer}-patterns.md` = rule list — good distinction, but not documented anywhere |
| Reference guides are discoverable without reading each file | ❌ Missing | No index or manifest; an agent has to read every file to know which one applies |
| Reference guides are kept DRY with CLAUDE.md | ❌ Unknown | No audit of overlap between CLAUDE.md §Backend Patterns and `backend-patterns.md`; may be duplicating content that diverges over time |
| Naming convention is consistent | ⚠️ Partial | `sql-js-constraints.md` doesn't fit the `{layer}.md`/`{layer}-patterns.md` pattern — it's a cross-cutting constraint doc, not a layer doc |

**Actions:**
- [ ] Document the naming convention: `{layer}.md` = narrative (for humans arriving in a new layer), `{layer}-patterns.md` = rule list (for agents checking compliance), `{topic}-constraints.md` = constraint catalog for non-layer-aligned topics (like SQL.js)
- [ ] Audit overlap between CLAUDE.md §Backend Patterns and `backend-patterns.md` — deduplicate or establish clear hierarchy (CLAUDE.md = brief anchors; `*-patterns.md` = deep with file:line)
- [ ] Create `.agents/reference/README.md` as the discovery layer

---

## Gap-by-Gap Audit

### Gap 1 — Commands Do Not Systematically Auto-Load `.agents/reference/`

Full audit of all 14 commands' `<context>` blocks, cross-referenced with each Round audit's actions:

| Command | Current `.agents/reference/` loading | Should load | Cross-reference |
|---------|--------------------------------------|-------------|-----------------|
| `/prime` | ❌ None | ✅ ALL 5 docs — this IS the orientation command | Round 2 audit |
| `/plan` | ❌ None | ✅ `backend.md` or `frontend.md` based on story scope | Round 3 audit |
| `/implement` | ❌ None | ✅ `backend-patterns.md` or `frontend-patterns.md` for the active layer | Round 4 audit |
| `/commit` | ❌ None | ⚠️ Optional — `*-patterns.md` when running validation in Phase 1 | Round 5 audit |
| `/validate` | ❌ None | ⚠️ Optional — could use `backend-patterns.md` to flag known anti-patterns | Round 6 audit |
| `/review-pr` | ❌ None | ✅ `backend-patterns.md` and/or `frontend-patterns.md` for changed layers | Round 7 audit |
| `/create-pr` | ❌ N/A (new file) | ⚠️ Minimal — not pattern-heavy | Round 8 audit |
| `/rca` | ⚠️ Round 9 adds this | ✅ `backend-patterns.md` + `sql-js-constraints.md` | Round 9 audit |
| `/security-review` | ⚠️ Round 10 adds `backend.md` | ✅ `backend-patterns.md` + `sql-js-constraints.md` | Round 10 audit |
| `/create-rules` | ❌ None | ✅ ALL 5 docs — to avoid duplicating what already exists | Round 11 audit |
| `/create-command` | ❌ None | ⚠️ Optional | Round 12 audit |
| `/prd-interactive` | ⚠️ Round 13 adds RESEARCH phase | ✅ Layer-appropriate doc based on Phase 3 Q6 scope | Round 13 audit |
| `/create-stories` | ❌ None | ✅ Technical Notes field should link to relevant doc | Round 14 audit |
| `/check-ignores` | ⚠️ Round 15 adds this | ✅ `backend-patterns.md` + `frontend-patterns.md` | Round 15 audit |

**Priority loading gap**: `/prime`, `/plan`, `/implement`, `/review-pr`, `/create-rules` are the 5 most impactful commands to update. These are the core of the PIV Loop and their context loads determine the quality of every feature implementation.

---

### Gap 2 — Agents Re-Describe Patterns Instead of Referencing Canonical Docs

Full audit of all 6 agents:

| Agent | What it embeds inline | Should reference | Drift risk |
|-------|----------------------|-----------------|------------|
| `code-reviewer` | 8-item backend checklist (next(error), stmt.free(), Zod, etc.) + 5-item frontend checklist | `backend-patterns.md`, `frontend-patterns.md`, `sql-js-constraints.md` | HIGH — checklist embedded in agent file; if a pattern evolves, agent diverges from canonical doc |
| `code-simplifier` | Project-Specific Rules (next(error), stmt.free(), import type, etc.) | `backend-patterns.md`, `frontend-patterns.md` | HIGH — same divergence risk |
| `silent-failure-hunter` | Core Principles + Reference Library with full Correct/WRONG examples | `backend-patterns.md`, `sql-js-constraints.md` | MEDIUM — the Correct/WRONG examples are *teaching* (should stay); but the principles could reference the doc |
| `type-design-analyzer` | Project-Specific Checks (8 items) + Common Anti-patterns (9 items) | `backend-patterns.md`, `sql-js-constraints.md` | HIGH — 17 items embedded that may drift from `backend-patterns.md` |
| `pr-test-analyzer` | Project-Specific Test Patterns (Backend Tests section) | `backend-patterns.md` | MEDIUM — test patterns are somewhat stable but SQL.js constraints could drift |
| `comment-analyzer` | — | — (not applicable — comment analysis is universal) | LOW |

**Key distinction**: The Correct/WRONG code examples in `silent-failure-hunter` are *teaching artifacts* — they should stay inline because they serve the agent's pedagogical role. The *rule statements* (what the pattern IS) could reference `backend-patterns.md` while the *examples* (how to spot a violation) stay inline.

---

### Gap 3 — Orphan Directories Lack Classification

6 directories in `.agents/` are not referenced by any command and have no declared purpose:

| Directory | Apparent Content | Lifecycle | Classification Needed |
|-----------|-----------------|-----------|----------------------|
| `.agents/baseline/` | Likely: baseline measurements from early exercise state | One-time per exercise | **Exercise-only** or **`/validate` archive** |
| `.agents/closure/` | Likely: exercise closure/completion reports | One-time per exercise | **Exercise-only** |
| `.agents/diagnosis/` | Likely: diagnostic reports from `/rca` or manual analysis | Evolving | **`/rca` companion** or **standalone** |
| `.agents/governance/` | Likely: governance decisions / ADRs (Architecture Decision Records) | Evolving | **`/plan` or `/prd-interactive` inputs** or **exercise-only** |
| `.agents/validation/` | Likely: validation output snapshots | Evolving | **`/validate` companion** — may overlap with `.agents/reports/` |
| `.agents/templates/` | Likely: markdown templates for new PRDs, stories, etc. | Stable | **`/create-command`, `/prd-interactive` inputs** |

**Finding**: Without classification, an AI agent that reads the `.agents/` tree doesn't know what these directories are for and cannot make intelligent loading decisions.

---

### Gap 4 — No Discovery Layer (Manifest)

An AI agent invoking `/plan` for a backend feature must decide: "should I read `backend.md` or `backend-patterns.md`?" Without a manifest, the agent must either:
- Read all 5 files (context-budget expensive)
- Read none (status quo — misses crucial patterns)
- Guess based on filename (fragile)

A `.agents/reference/README.md` manifest solves this with a one-table lookup: `{"scope": "backend", "narrative": "backend.md", "rules": "backend-patterns.md"}`.

---

## Action Plan

### Priority 1 — Create Discovery Infrastructure (NEW FILES)

| # | Action | Output | Concept |
|---|--------|--------|---------|
| 1.1 | Create `.agents/reference/README.md` — manifest table with each doc, its summary (1 line), and its consumers (commands + agents) | New file | #4, #21 |
| 1.2 | Create `.agents/README.md` — top-level index classifying all subdirectories (lifecycle, producer, consumer, human vs AI artifact) | New file | #4 |
| 1.3 | Define and document the naming convention: `{layer}.md` = narrative, `{layer}-patterns.md` = rule list, `{topic}-constraints.md` = cross-cutting | `.agents/reference/README.md` | #21 |

### Priority 2 — Wire Commands Into the Context System

Execute in coordination with each Round's Execution Prompt (do NOT duplicate the full rewrite — only add `<context>` auto-loads where missing):

| # | Command | Change | Concept |
|---|---------|--------|---------|
| 2.1 | `/prime` | Auto-load ALL 5 `.agents/reference/*.md` — this is the orientation command | #20 |
| 2.2 | `/plan` | Conditionally load `backend.md`/`backend-patterns.md` when scope includes `server/`; `frontend.md`/`frontend-patterns.md` when scope includes `client/` | #9 |
| 2.3 | `/implement` | Same conditional loading as `/plan` for the task being executed | #9 |
| 2.4 | `/review-pr` | Load `backend-patterns.md` when diff includes `server/`; `frontend-patterns.md` when diff includes `client/`; `sql-js-constraints.md` when diff includes SQL.js usage | #4 |
| 2.5 | `/create-rules` | Load ALL 5 docs before generating CLAUDE.md — must read what already exists to avoid duplication | #4 |
| 2.6 | `/create-stories` | Technical Notes field in story template should include: "Reference: `.agents/reference/{layer}-patterns.md` — see patterns section for this scope" | #4 |

### Priority 3 — Update Agents to Reference, Not Re-Describe

| # | Agent | Change | Drift Risk Reduced |
|---|-------|--------|-------------------|
| 3.1 | `code-reviewer` | In the Pre-Step LOAD CONTEXT (added in Round 16), mandate loading `backend-patterns.md` and `frontend-patterns.md`; add note after each checklist section: "See `.agents/reference/backend-patterns.md` for the canonical rule list with file:line examples." | HIGH → LOW |
| 3.2 | `code-simplifier` | In the priority-ordered rule sources (added in Round 17), add: "(a) CLAUDE.md → (b) `.agents/reference/backend-patterns.md` → (c) `.agents/reference/frontend-patterns.md` → (d) `.agents/reference/sql-js-constraints.md`" | HIGH → LOW |
| 3.3 | `silent-failure-hunter` | In the Pre-Step LOAD CONTEXT (added in Round 18), mandate loading `backend-patterns.md` + `sql-js-constraints.md`; add a note in the Reference Library section: "The patterns above match `.agents/reference/backend-patterns.md` §Express v5 Route Pattern and `.agents/reference/sql-js-constraints.md` §stmt lifecycle." | MEDIUM → LOW |
| 3.4 | `type-design-analyzer` | In the Pre-Step LOAD CONTEXT (added in Round 19), mandate loading `backend-patterns.md` + `sql-js-constraints.md`; add note after Project-Specific Checks: "See `.agents/reference/sql-js-constraints.md` §SQL.js storage constraints for the full catalog." | HIGH → LOW |
| 3.5 | `pr-test-analyzer` | In Pre-Step LOAD CONTEXT (added in Round 20), mandate loading `backend-patterns.md`; add note after Project-Specific Test Patterns: "See `.agents/reference/backend-patterns.md` §Testing for the test isolation patterns with file:line examples." | MEDIUM → LOW |

### Priority 4 — CLAUDE.md On-Demand Context Update

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Replace the 3-row static table in CLAUDE.md §On-Demand Context with the full producer/consumer map from `.agents/reference/README.md` | #4, #21 |
| 4.2 | Add a "Convention" subsection explaining: how commands load, when agents use the docs, and how to update the docs when patterns evolve | #20 |
| 4.3 | Audit overlap between CLAUDE.md §Backend Patterns and `backend-patterns.md` — decide: (a) CLAUDE.md has summary anchors only; `*-patterns.md` has the full depth, OR (b) merge into one source | #21 |

### Priority 5 — Orphan Directory Classification

| # | Directory | Classification | Action |
|---|-----------|---------------|--------|
| 5.1 | `.agents/baseline/` | **Exercise-only** human artifact | Document in `.agents/README.md`; no AI integration needed |
| 5.2 | `.agents/closure/` | **Exercise-only** human artifact | Document in `.agents/README.md`; no AI integration needed |
| 5.3 | `.agents/diagnosis/` | **`/rca` companion** — may be an alternate reports dir | Merge with `.agents/rca-reports/` or document distinction |
| 5.4 | `.agents/governance/` | **ADR store** — `/prd-interactive` or `/plan` could reference | Integrate or document as human-maintained |
| 5.5 | `.agents/validation/` | **`/validate` companion** — check if it overlaps with `.agents/reports/` | Merge or clarify distinction in `.agents/README.md` |
| 5.6 | `.agents/templates/` | **`/create-command` + `/prd-interactive` inputs** | Reference from those commands OR document as human-only |

---

## Execution Prompt (scope: mechanical integration)

````
Read:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard §4, §9, §20, §21
2. `.agents/reference/backend.md` — full content (601 lines)
3. `.agents/reference/backend-patterns.md` — full content (372 lines)
4. `.agents/reference/frontend.md` — full content (454 lines)
5. `.agents/reference/frontend-patterns.md` — full content (342 lines)
6. `.agents/reference/sql-js-constraints.md` — full content (347 lines)
7. `docs/Gold-Standard-Plan/phases/phase-6-gap-analysis/round-23-on-demand-context-gap.md` — this plan
8. Round audit Execution Prompts for Rounds 9, 10, 13, 15, 16, 17, 18, 19, 20 — these already add partial on-demand context loading; do not duplicate their changes

Apply in this order:

---

### Step 1 — Create `.agents/reference/README.md`

Create the file with this exact content:

```markdown
# On-Demand Context — Reference Docs

These documents provide deep, file:line-referenced patterns for specific layers of the project.
They are **loaded on demand** — not globally. Load only the doc whose scope matches the task.

## Naming Convention

| Pattern | When to Use |
|---------|-------------|
| `{layer}.md` | Narrative guide for a layer — read when arriving in an unfamiliar area |
| `{layer}-patterns.md` | Rule list with file:line examples — load when reviewing, implementing, or simplifying code in that layer |
| `{topic}-constraints.md` | Cross-cutting constraint catalog — load when working with that technology regardless of layer |

## Document Map

| File | Lines | Summary | Load when... | Loaded by |
|------|-------|---------|--------------|-----------|
| `backend.md` | 601 | Narrative: layered architecture, Express v5 route pattern, error flow, Zod boundary, SQL.js query lifecycle, test patterns | Starting a new backend feature or reviewing backend code | `/prime`, `/plan` (backend scope), `/implement` (backend scope), `silent-failure-hunter` |
| `backend-patterns.md` | 372 | Rule list: Express v5 `next(error)`, custom errors, `stmt.free()` in finally, Zod parse-before-logic, parameterized queries — all with file:line examples | Reviewing code for pattern compliance; simplifying code | `code-reviewer`, `code-simplifier`, `silent-failure-hunter`, `/review-pr` (backend changes), `/security-review`, `/rca`, `/check-ignores` |
| `frontend.md` | 454 | Narrative: component hierarchy, TanStack Query hooks, state management, Radix UI primitives, Tailwind v4 | Starting a new frontend feature or reviewing frontend code | `/prime`, `/plan` (frontend scope), `/implement` (frontend scope) |
| `frontend-patterns.md` | 342 | Rule list: `useQuery`/`useMutation` patterns, `cn()` composition, `ComponentNameProps` interfaces, kebab-case files, `import type` — all with file:line examples | Reviewing or simplifying frontend code | `code-reviewer`, `code-simplifier`, `/review-pr` (frontend changes) |
| `sql-js-constraints.md` | 347 | Constraint catalog: SQL.js vs other SQLite libs, synchronous API, `step()`+`getAsObject()`, WASM init, INTEGER booleans, `stmt.free()` lifecycle | Working with any database operation; security review | `silent-failure-hunter`, `type-design-analyzer`, `/security-review`, `/rca` |

## How to Load (in commands)

In a command's `<context>` block:
```
Backend reference: !`test -f .agents/reference/backend.md && cat .agents/reference/backend.md || echo "(no backend reference)"`
Backend patterns: !`test -f .agents/reference/backend-patterns.md && cat .agents/reference/backend-patterns.md || echo "(no backend patterns)"`
```

## How to Load (in agents)

In the agent's Pre-Step LOAD CONTEXT:
```
Read `.agents/reference/backend-patterns.md` if present (canonical rules; prefer over this agent's embedded knowledge on conflict).
```

## Maintenance

When a pattern in this project evolves (e.g., a new error class, a new SQL.js usage convention):
1. Update the relevant `.agents/reference/*.md` doc first
2. Update CLAUDE.md §Backend Patterns / §Code Style if the change affects global rules
3. Run `/check-ignores` and `/review-pr` — they will now use the updated pattern
```

---

### Step 2 — Create `.agents/README.md`

Create the file with this exact content:

```markdown
# .agents/ Directory — Index

This directory contains all AI-layer artifacts for the feature-flag-exercise project.

## Directory Classification

| Directory | Type | Lifecycle | Producer | Consumer | Notes |
|-----------|------|-----------|----------|----------|-------|
| `reference/` | **On-Demand Context** | Evolving | Human / `/create-rules` | `/prime`, `/plan`, `/implement`, `/review-pr`, all agents | See `reference/README.md` |
| `PRDs/` | **Product Artifacts** | Per-feature | `/prd-interactive` | `/create-stories`, `/plan` | `.prd.md` files |
| `stories/` | **Task Decomposition** | Per-feature | `/create-stories` | `/plan` | `-stories.md` files |
| `plans/` | **Task Plans** | Per-task | `/plan` | `/implement` | `.plan.md` files |
| `reports/` | **Audit Reports** | Per-run | `/security-review`, `/check-ignores`, `/validate` | Human review | Date-stamped |
| `rca-reports/` | **Root Cause Reports** | Per-incident | `/rca` | Human review | `rca-report-{N}.md` |
| `reviews/` | **PR Review Reports** | Per-PR | `/review-pr` | Human review | |
| `screenshots/` | **Browser Evidence** | Per-run | `agent-browser` skill | Human review | Git-ignored by default |
| `validation/` | **Validation Artifacts** | Per-run | `/validate` | Human review | May overlap with `reports/`; classify pending |
| `templates/` | **Doc Templates** | Stable | Human | Human / `/create-command` / `/prd-interactive` | Manual use; AI integration TBD |
| `baseline/` | **Exercise-Only** | One-time | Human | Human only | Baseline measurements; not AI-integrated |
| `closure/` | **Exercise-Only** | One-time | Human | Human only | Exercise completion reports; not AI-integrated |
| `diagnosis/` | **Diagnostic Reports** | Per-incident | Human / `/rca` | Human | May merge with `rca-reports/`; classify pending |
| `governance/` | **ADR Store** | Evolving | Human | Human / `/plan` inputs | Architecture decisions; AI integration TBD |

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE-template.md` | Template for `/create-rules` to use when regenerating `CLAUDE.md` |
| `reference/README.md` | Manifest for On-Demand Context docs — start here when choosing which doc to load |
```

---

### Step 3 — Update CLAUDE.md §On-Demand Context

Replace the current "On-Demand Context" table with:

```markdown
## On-Demand Context

Reference guides for deeper context on specific areas. Load only what your task needs.

| Topic | File | Load when |
|-------|------|-----------|
| Project requirements | `.agents/PRDs/feature-flag-manager.prd.md` | Planning a new feature; starting a new PR |
| Backend narrative | `.agents/reference/backend.md` | Starting in an unfamiliar backend area |
| Backend patterns (rules) | `.agents/reference/backend-patterns.md` | Reviewing, implementing, or simplifying backend code |
| Frontend narrative | `.agents/reference/frontend.md` | Starting in an unfamiliar frontend area |
| Frontend patterns (rules) | `.agents/reference/frontend-patterns.md` | Reviewing, implementing, or simplifying frontend code |
| SQL.js constraints | `.agents/reference/sql-js-constraints.md` | Any database operation; security review |

See `.agents/reference/README.md` for the full producer/consumer map and loading conventions.
```

---

### Step 4 — Per-Command `<context>` Updates

Apply these changes in conjunction with each Round's Execution Prompt.
Only add the `<context>` auto-loads — do NOT rewrite the full command.

**`/prime`** — add to `<context>` (after existing auto-loads):
```
Backend reference: !`test -f .agents/reference/backend.md && cat .agents/reference/backend.md || echo "(no backend reference)"`
Backend patterns: !`test -f .agents/reference/backend-patterns.md && cat .agents/reference/backend-patterns.md || echo "(no backend patterns)"`
Frontend reference: !`test -f .agents/reference/frontend.md && cat .agents/reference/frontend.md || echo "(no frontend reference)"`
Frontend patterns: !`test -f .agents/reference/frontend-patterns.md && cat .agents/reference/frontend-patterns.md || echo "(no frontend patterns)"`
SQL.js constraints: !`test -f .agents/reference/sql-js-constraints.md && cat .agents/reference/sql-js-constraints.md || echo "(no SQL.js constraints)"`
```

**`/plan`** — add to `<context>` conditionally (add a note to Phase 1 SCOPE):
```
If the feature scope touches `server/`: read `.agents/reference/backend.md` and `.agents/reference/backend-patterns.md`.
If the feature scope touches `client/`: read `.agents/reference/frontend.md` and `.agents/reference/frontend-patterns.md`.
```

**`/implement`** — same conditional loading as `/plan`, in the Pre-Step of Phase 1.

**`/review-pr`** — add to `<context>`:
```
Backend patterns: !`test -f .agents/reference/backend-patterns.md && cat .agents/reference/backend-patterns.md || echo "(no backend patterns)"`
Frontend patterns: !`test -f .agents/reference/frontend-patterns.md && cat .agents/reference/frontend-patterns.md || echo "(no frontend patterns)"`
SQL.js constraints: !`test -f .agents/reference/sql-js-constraints.md && cat .agents/reference/sql-js-constraints.md || echo "(no SQL.js constraints)"`
```

**`/create-rules`** — add to `<context>` (before the 5 existing auto-loads):
```
Existing reference docs: !`ls .agents/reference/*.md 2>/dev/null || echo "(none)"`
(Read each to avoid duplicating their content into CLAUDE.md)
```

**`/create-stories`** — add to Phase 2 DECOMPOSE Technical Notes field guidance:
```
- Reference: `.agents/reference/{layer}-patterns.md` — link to the relevant On-Demand doc for this story's scope
```

---

### Step 5 — Per-Agent LOAD CONTEXT Updates

Apply these changes in conjunction with each Round's Execution Prompt.
Only update the Pre-Step LOAD CONTEXT — do NOT rewrite the full agent.

**`code-reviewer`** — in Pre-Step LOAD CONTEXT:
```
Load `.agents/reference/backend-patterns.md` when reviewing `server/` files.
Load `.agents/reference/frontend-patterns.md` when reviewing `client/` files.
Load `.agents/reference/sql-js-constraints.md` when reviewing SQL.js usage.
On conflict with this agent's embedded checklist: the reference docs win.
```

**`code-simplifier`** — update priority-ordered rule sources to include:
```
(b) `.agents/reference/backend-patterns.md` — if server/ code in scope
(c) `.agents/reference/frontend-patterns.md` — if client/ code in scope
(d) `.agents/reference/sql-js-constraints.md` — if SQL.js code in scope
```

**`silent-failure-hunter`** — in Pre-Step LOAD CONTEXT:
```
Load `.agents/reference/backend-patterns.md` (Express v5, custom errors, Zod boundary).
Load `.agents/reference/sql-js-constraints.md` (stmt lifecycle, parameterized queries).
On conflict with this agent's Reference Library: the reference docs win; flag the drift.
```

**`type-design-analyzer`** — in Pre-Step LOAD CONTEXT:
```
Load `.agents/reference/sql-js-constraints.md` (SQL.js storage rules for type analysis).
Load `.agents/reference/backend-patterns.md` (Zod schema alignment patterns).
On conflict with this agent's Project-Specific Checks: the reference docs win; flag the drift.
```

**`pr-test-analyzer`** — in Pre-Step LOAD CONTEXT:
```
Load `.agents/reference/backend-patterns.md` (_resetDbForTesting(), custom errors, next(error) test patterns).
On conflict with this agent's Project-Specific Test Patterns: the reference docs win.
```

---

### Step 6 — Orphan Directory Classification (follow-up task)

Document these in `.agents/README.md` (done in Step 2 above). The following directories need a future decision:
- `.agents/diagnosis/` — determine if it merges with `rca-reports/`
- `.agents/governance/` — determine if `/plan` should read from it
- `.agents/validation/` — determine if it merges with `reports/`
- `.agents/templates/` — determine if `/prd-interactive` or `/create-command` should use templates from here

Do NOT make these decisions in this round — classify them as "pending" in `.agents/README.md` and file as a follow-up.

---

Do NOT change any source code. Only create/edit AI-layer files (`.agents/reference/README.md`, `.agents/README.md`, `CLAUDE.md`, and the 6 commands + 5 agents identified above).
````

---

## Success Criteria

- [ ] `.agents/reference/README.md` manifest **created** — 5 docs × (file, lines, summary, "load when", "loaded by") table + naming convention + loading code examples for commands and agents + maintenance instructions (concept #4, #21)
- [ ] `.agents/README.md` top-level index **created** — 14 subdirectories/files classified by type, lifecycle, producer, consumer, AI vs human artifact (concept #4)
- [ ] `CLAUDE.md §On-Demand Context` updated from a 3-row static table to a 6-row producer/consumer table + link to `.agents/reference/README.md` (concept #4, #21)
- [ ] **`/prime`** loads all 5 `.agents/reference/*.md` docs in `<context>` — the orientation command gives the full department training (concept #20)
- [ ] **`/plan`** conditionally loads `backend.md`/`backend-patterns.md` or `frontend.md`/`frontend-patterns.md` based on feature scope (concept #9)
- [ ] **`/implement`** same conditional loading as `/plan` for the task's active layer (concept #9)
- [ ] **`/review-pr`** loads `backend-patterns.md` + `frontend-patterns.md` + `sql-js-constraints.md` for the changed layers (concept #4)
- [ ] **`/create-rules`** reads existing `.agents/reference/*.md` docs before generating CLAUDE.md (avoids duplication) (concept #4)
- [ ] **`/create-stories`** Technical Notes template references `.agents/reference/{layer}-patterns.md` for each story scope (concept #4)
- [ ] **`code-reviewer`** Pre-Step LOAD CONTEXT loads layer-appropriate `*-patterns.md` + `sql-js-constraints.md`; embedded checklist defers to reference docs on conflict (concept #4 — DRY)
- [ ] **`code-simplifier`** priority-ordered rule sources include `.agents/reference/backend-patterns.md`, `frontend-patterns.md`, `sql-js-constraints.md` at positions (b)–(d) (concept #4 — DRY)
- [ ] **`silent-failure-hunter`** Pre-Step LOAD CONTEXT loads `backend-patterns.md` + `sql-js-constraints.md`; Reference Library defers to these on conflict (concept #4 — DRY, MEDIUM drift reduced to LOW)
- [ ] **`type-design-analyzer`** Pre-Step LOAD CONTEXT loads `sql-js-constraints.md` + `backend-patterns.md`; Project-Specific Checks defers on conflict (concept #4 — DRY, HIGH drift reduced to LOW)
- [ ] **`pr-test-analyzer`** Pre-Step LOAD CONTEXT loads `backend-patterns.md`; Project-Specific Test Patterns defers on conflict (concept #4 — DRY)
- [ ] Naming convention documented: `{layer}.md` = narrative, `{layer}-patterns.md` = rule list, `{topic}-constraints.md` = cross-cutting (concept #21)
- [ ] CLAUDE.md §Backend Patterns overlap with `backend-patterns.md` audited — decision made: CLAUDE.md has summary anchors only; `*-patterns.md` has full depth with file:line (concept #21)
- [ ] Orphan directories (`baseline`, `closure`, `diagnosis`, `governance`, `validation`, `templates`) classified in `.agents/README.md` — 4 are exercise-only or pending; `validation` and `diagnosis` have follow-up classification tasks (hygiene)
- [ ] Code fence conflict in Execution Prompt resolved — outer block uses 4 backticks (````), inner code blocks use 3 (```), no premature closure ✅
