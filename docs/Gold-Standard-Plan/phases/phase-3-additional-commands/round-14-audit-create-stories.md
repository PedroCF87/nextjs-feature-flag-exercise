# Phase 3 — Additional Commands: Round 14 — Audit `/create-stories` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/create-stories.md`
**Gold Standard concepts**: #8, #25, #26, #27, #28, #29
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~179
- **Frontmatter**: `allowed-tools: Write, Read, Grep, Glob, Bash(mkdir:*), Bash(ls:*), Bash(cat:*)`; `argument-hint: <path-to-prd> [--project KEY] [--epic KEY]`; `description: Generate user stories from a PRD — optionally pushes to Jira via MCP`
- **Format**: XML-style tags — consistent
- **Structure**: 5 phases (LOAD → DECOMPOSE → VALIDATE → OUTPUT → JIRA INTEGRATION)

### Current Content Summary
1. **`<objective>`**: Generates stories from PRD; auto-pushes to Jira when MCP available; Core Principle: every story **independently deliverable, testable, traceable** to PRD
2. **`<context>`**: Lists available PRDs (`.agents/PRDs/*.prd.md`), root PRD, existing stories directory
3. **`<process>`** — 5 phases:
   - **Phase 1 LOAD**: read PRD (direct path, or fallback order, or ask user); extract Problem / MVP / Phases / Metrics / Open Questions; parse `--project` / `--epic` flags; CHECKPOINT
   - **Phase 2 DECOMPOSE**: Story Format template (Type/Priority/Complexity/Phase/Labels + Description + AC + Technical Notes + Dependencies); Sizing Rules (Small/Medium/Large); Ordering rules; CHECKPOINT
   - **Phase 3 VALIDATE**: 6 quality gates (COVERAGE / SIZE / TESTABLE / INDEPENDENT / DAG / TRACEABLE)
   - **Phase 4 OUTPUT**: `mkdir -p .agents/stories`; save to `.agents/stories/{prd-name}-stories.md`
   - **Phase 5 JIRA INTEGRATION**: branches on `mcp__atlassian__*` availability — Cloud ID → validate project/epic → ask user → `createJiraIssue` → comment → `createIssueLink` → report; falls back to markdown-only with instruction
4. **`<success_criteria>`**: 7 items — saved path, coverage, size, testable AC, DAG, Jira issues with links (if applicable), report content

### Strengths Already Present
- **Core Principle** sharply stated: "independently deliverable, testable, traceable" ✅
- **Gherkin-style AC** ("Given/When/Then") in Story Format template ✅
- **Sizing Rules** with explicit "Large → break it down further" — prevents megawer stories ✅
- **DAG enforcement** in VALIDATE gates — catches circular dependencies ✅
- **Dependencies modeled** explicitly (Blocked by / Blocks) ✅
- **Fallback order for missing PRD path**: `.agents/PRDs/*.prd.md` → `PRD.md` → ask user ✅
- **Jira MCP branching** — gracefully detects MCP tool availability; falls back with actionable instruction ✅
- **Confirm-before-push** in Jira flow (asks user before creating issues) ✅
- **Atomic Jira ops** — issue → comment (technical notes) → `createIssueLink` for dependencies ✅

### Bugs / Issues Spotted Before Audit
1. **`Bash(cat:*, ls:*)` in `allowed-tools`** — duplicates native `Read` and `Glob` (same issue as Rounds 9–12)
2. **No destructive-write safety** on `{prd-name}-stories.md` — silently overwrites an existing stories file (same bug pattern as Rounds 11, 12, 13)
3. **Labels mismatch project scopes**: Story template uses `frontend, backend, api, database, shared` but this project's canonical scopes (per [commit.md](.claude/commands/commit.md:56)) are `flags, api, ui, db, validation, deps, ai-layer` — labels will drift from commit scopes
4. **Phase 5 ask-user step** (line 136) does not state what happens on "No" — user might press No and be left in limbo

---

## Concept-by-Concept Audit

### Concept #8 — Context Engineering (Task Management)
> Gold Standard §8 covers three Context Engineering pillars: Memory, RAG, and **Task Management** — decomposing big work into discrete, independently executable tasks. `/create-stories` is THE Task Management artifact of this project: it bridges PRD (Layer 1.5) to `/plan` (Layer 2).

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Decomposes into independent tasks | ✅ Strong | Core Principle + INDEPENDENT gate |
| Each story testable | ✅ Strong | TESTABLE gate + Gherkin AC template |
| Dependency DAG explicit | ✅ Strong | Blocked by / Blocks fields + DAG gate |
| Size cap enforced | ✅ Strong | "Large → break down further" + SIZE gate |
| Traceable to PRD source | ✅ Strong | TRACEABLE gate + "from PRD phases" references |
| Labels align with project scopes | ❌ Missing | Uses generic labels (`frontend, backend, api, database, shared`) instead of project-canonical scopes (`flags, api, ui, db, validation, deps, ai-layer`) — mismatches `/commit` and `/prd-interactive` Q6 |
| Context budget per story | ⚠️ Partial | Technical Notes has "Files likely modified" + "Patterns to follow" — but no explicit "what the `/plan` agent needs to read" field |
| Chain to `/plan` | ❌ Missing | After stories are generated, the markdown-only path doesn't instruct the user on what command to run next per story |

**Actions:**
- [ ] Align story Labels field with canonical project scopes. Update the Story Format template's `**Labels**` line to use the same scope list as `/commit` and the new `/prd-interactive` Q6: `flags | api | ui | db | validation | deps | ai-layer`
- [ ] Add a field to the Story Format — `**Context to load**`: list of files the `/plan` agent needs to read to plan this story (e.g., `shared/types.ts`, `server/src/services/flags.ts`, `.agents/reference/backend.md`). This is explicit Task-Management context budget.
- [ ] Add to Phase 4 OUTPUT a "Next Steps" block instructing the user on per-story `/plan` invocation (see #29 actions below)

---

### Concept #25 — Input → Process → Output Structure

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `<objective>` + `<context>` + flag parsing; no explicit persona |
| **Process** | ✅ Strong | 5 phases with CHECKPOINTs on 1 & 2 |
| **Output** | ⚠️ Partial | `<success_criteria>` strong; Jira report templated; **markdown-only** run has no terminal summary block |

**Actions:**
- [ ] Add persona to `<objective>` (see #26)
- [ ] Add terminal `<output>` block for both Jira-success and markdown-only paths (see #28)

---

### Concept #26 — Input Section Detail

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a tech lead decomposing work into independently shippable stories" |
| Workflow positioning | ⚠️ Partial | Implicit in `<context>` (PRD + stories directory) but not stated that this sits between `/prd-interactive` and `/plan` |
| PRD validation | ❌ Missing | Phase 1 loads the file but doesn't verify it's actually a PRD (has Problem / MVP / Phases sections). An unstructured doc loaded here would produce malformed stories. |
| Destructive-write safety | ❌ Missing | Phase 4 writes `{prd-name}-stories.md` — silently overwrites existing stories (bug pattern from Rounds 11, 12, 13) |
| Empty-PRD guard | ❌ Missing | If the PRD has no "Must" items in MVP Scope, Phase 2 would produce zero stories silently |
| Flag parsing robustness | ⚠️ Partial | `--project / -p` and `--epic / -e` aliases stated but no instruction on what to do if only one is provided or if values are malformed |
| Context loading | ✅ Present | Loads PRDs list + existing stories |

**Actions:**
- [ ] Add persona to `<objective>`:
  > You are a tech lead decomposing product work into independently shippable stories. Each story is the smallest unit that delivers user-visible value OR enables the next story. You are strict about dependencies and sizing — never smuggle multiple concerns into one story.
- [ ] Add workflow positioning sentence:
  > **Position in workflow**: Invoked after `/prd-interactive` (or whenever a PRD exists). Produces the story list that `/plan` consumes per story. Optional for small features — for <5 MVP items, you may skip stories and go PRD → `/plan` directly.
- [ ] Add to Phase 1 a **PRD-structure validation** check: "Verify the loaded file has at least: a Problem Statement, an MVP Scope table with ≥1 'Must' row, and an Implementation Phases table. If any are missing, STOP and report which section is absent — ask the user to complete the PRD (`/prd-interactive`) before decomposition."
- [ ] Add **destructive-write safety** to Phase 4:
  > **Before writing**: If `.agents/stories/{prd-name}-stories.md` already exists:
  > 1. Print line count and story count of the existing file
  > 2. Ask: REGENERATE (backup to `.bak`), APPEND (add new stories, keep existing), or CANCEL
  > 3. If non-interactive, default to **CANCEL** and instruct the user to invoke with explicit choice
- [ ] Add **empty-scope guard** to Phase 1 CHECKPOINT: "If the PRD has zero 'Must' items in MVP Scope, STOP and reply: 'PRD has no Must-have items. Refine the MVP scope in the PRD before creating stories.'"

---

### Concept #27 — Process Section Detail

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered VERB-labeled phases | ✅ Strong | LOAD / DECOMPOSE / VALIDATE / OUTPUT / JIRA |
| CHECKPOINTs | ⚠️ Partial | Phases 1 & 2 have CHECKPOINTs; Phase 3 VALIDATE has the gate table but no explicit CHECKPOINT status line |
| Tools specified | ⚠️ Partial | Shell `cat:*` and `ls:*` duplicate native `Read`/`Glob` |
| VALIDATE remediation | ❌ Missing | If a gate fails (e.g., COVERAGE missing, DAG has cycle, Large unsplittable), there is no remediation guidance. Agent may proceed silently. |
| Project-specific technical notes | ⚠️ Partial | "Patterns to follow: {reference from codebase}" is generic — doesn't prompt the agent to reference CLAUDE.md's Key Patterns or this project's known gotchas (Express v5 `next(error)`, SQL.js `stmt.free()`, Zod parse order) |
| Story numbering scheme | ⚠️ Partial | Template uses `[S-{nn}]` — but no rule for resetting or continuing numbers across PRDs. If user runs on a second PRD, do stories start at `S-01` or continue? |
| Jira pre-flight safety | ✅ Strong | Phase 5 validates project/epic before creating; asks user before pushing |
| "No" handling in Jira confirm | ❌ Missing | Phase 5 step 3 asks "Create in Jira?" — if user says No, no fallback path (should save markdown and report, not stall) |

**Actions:**
- [ ] Tighten `allowed-tools`: drop `Bash(cat:*)` and `Bash(ls:*)`; add `Bash(cp:*)` for the `.bak` backup. Final: `Write, Read, Grep, Glob, Bash(mkdir:*), Bash(cp:*)`
- [ ] Add **Phase 3 VALIDATE remediation** block after the gates table:
  > **Remediation on failure:**
  > - **COVERAGE fails**: list the unmapped PRD requirements; either create additional stories or document in Open Questions why an item was skipped.
  > - **SIZE fails** (Large story can't be split): the story may genuinely be atomic — convert to a **Spike** Type to investigate and de-risk first, then re-decompose.
  > - **TESTABLE fails**: rewrite the AC as Given/When/Then with observable outcomes. If the acceptance cannot be observed externally, the story is internal/technical and should be tagged Type: Technical.
  > - **DAG has cycle**: identify the cycle, split the shared concern out as its own story that both sides depend on.
- [ ] Add project-aware **Technical Notes** guidance. Update the Story Format template for Technical Notes to:
  ```
  ### Technical Notes
  - Files likely modified: {paths}
  - Patterns to follow: {reference CLAUDE.md section or `.agents/reference/*.md`}
  - Known pitfalls in this scope: {if scope touches api/backend → Express v5 `next(error)`, SQL.js `stmt.free()`, Zod parse-before-logic (see CLAUDE.md → Error Handling)}
  - Validation: {specific command — e.g., `cd server && pnpm run build && pnpm run lint && pnpm test`}
  ```
- [ ] Add **story numbering rule** to Phase 2 DECOMPOSE: "Number stories `S-01, S-02, ...` within a single PRD's stories file. If a second invocation APPENDs to existing, continue the numeric sequence (read the highest existing `S-nn` and resume). When rewriting a different PRD, start fresh at `S-01`."
- [ ] Add **Jira "No" fallback** to Phase 5 step 3: "If the user declines, skip to the markdown-only report path — do not stall. Tell the user: 'Stories saved to markdown. Re-run with `--jira` flag (or re-invoke this command) when ready to push.'"

---

### Concept #28 — Output Section Detail

| Requirement | Status | Evidence |
|-------------|--------|----------|
| File written | ✅ Present | `.agents/stories/{prd-name}-stories.md` |
| Jira report templated | ✅ Strong | Table with Key / Title / Type / Priority |
| Markdown-only terminal summary | ❌ Missing | No `<output>` block for the non-Jira path — user just gets a file |
| Chain forward | ❌ Missing | No instruction on how to invoke `/plan` per story |
| Report content stated in `<success_criteria>` | ⚠️ Partial | "Report includes: story count, type breakdown, phase distribution, dependency graph summary" — described but not templated |

**Actions:**
- [ ] Add a terminal `<output>` block that handles both paths:
  ```
  Stories Generated.

  File: .agents/stories/{prd-name}-stories.md
  PRD source: {path}
  Total stories: {N}

  Breakdown:
  - By type: Feature {n} | Enhancement {n} | Technical {n} | Spike {n}
  - By size: Small {n} | Medium {n} | Large-split {n}
  - By phase: Phase 1 {n} | Phase 2 {n} | ...

  Dependency graph: {N} edges, {N} independent roots

  Jira push: {created {N} issues in {PROJECT} under {EPIC} | not configured — MCP absent | declined by user — markdown only}

  Next steps:
  1. Review stories — confirm AC are testable and dependencies are correct.
  2. Plan the first available story (no blockers): `/plan .agents/stories/{prd-name}-stories.md#S-01`
  3. After planning, `/implement` the produced plan.
  ```

---

### Concept #29 — Command Chaining

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Receives from `/prd-interactive` | ⚠️ Implicit | Both reference `.agents/PRDs/` but the chain is not stated in either direction (Round 13 actions add the forward link; this audit adds the back-reference) |
| Chains to `/plan` | ❌ Missing | After stories, no guidance on per-story planning |
| Jira integration as side-chain | ✅ Strong | Phase 5 well-handled |

**Actions:**
- [ ] State workflow position in `<objective>` (see #26)
- [ ] Add Next Steps referencing `/plan` per story (covered by `<output>` action in #28)

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Generate user stories from a PRD — optionally pushes to Jira via MCP" |
| `argument-hint` | ✅ Strong | `<path-to-prd> [--project KEY] [--epic KEY]` — documents flags clearly |
| `allowed-tools` | ⚠️ Redundant | `Bash(cat:*)` and `Bash(ls:*)` duplicate native `Read`/`Glob` |

**Actions:**
- [ ] Tighten `allowed-tools` to: `Write, Read, Grep, Glob, Bash(mkdir:*), Bash(cp:*)`

---

## Action Plan Summary

### Priority 1 — Align with Project Scopes (concept #8) — headline integration fix

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Update Story Format Labels from `frontend/backend/api/database/shared` to canonical scopes: `flags / api / ui / db / validation / deps / ai-layer` | #8 |
| 1.2 | Add "Context to load" field to Story Format — files the `/plan` agent must read | #8 |
| 1.3 | Project-aware Technical Notes: reference CLAUDE.md gotchas (Express v5 `next(error)`, SQL.js `stmt.free()`, Zod parse order) | #8, #27 |

### Priority 2 — Input Safety (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add persona + workflow positioning in `<objective>` | #26 |
| 2.2 | PRD-structure validation in Phase 1 (Problem + MVP + Phases required) | #26 |
| 2.3 | Destructive-write safety in Phase 4 (REGENERATE/APPEND/CANCEL + `.bak`) | #26 |
| 2.4 | Empty-scope guard (zero Must items → STOP) | #26 |

### Priority 3 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Phase 3 VALIDATE remediation block (what to do on COVERAGE/SIZE/TESTABLE/DAG failure) | #27 |
| 3.2 | Story numbering rule (continuing or resetting) | #27 |
| 3.3 | Jira "No" fallback → markdown-only, don't stall | #27 |

### Priority 4 — Output + Chaining (concepts #28, #29)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Terminal `<output>` block with breakdown (type/size/phase) + Jira status + Next Steps | #28 |
| 4.2 | Next Steps reference `/plan` per unblocked story | #29 |

### Priority 5 — Frontmatter

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Drop `Bash(cat:*, ls:*)`; add `Bash(cp:*)` for `.bak` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§8, §25)
2. `.claude/commands/create-stories.md` — current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-14-audit-create-stories.md` — this audit
4. `.claude/commands/commit.md` — source of truth for canonical project scopes
5. `CLAUDE.md` — for project-specific gotchas to reference in Technical Notes guidance

Rewrite `.claude/commands/create-stories.md` with these requirements:

1. **Frontmatter** — replace `allowed-tools` with:
   `Write, Read, Grep, Glob, Bash(mkdir:*), Bash(cp:*)`
   Keep `description` and `argument-hint` unchanged.

2. **`<objective>`** — add persona + workflow positioning at the top:
   > You are a tech lead decomposing product work into independently shippable stories. Each story is the smallest unit that delivers user-visible value OR enables the next story. You are strict about dependencies and sizing — never smuggle multiple concerns into one story.
   >
   > **Position in workflow**: Invoked after `/prd-interactive` (or whenever a PRD exists). Produces the story list that `/plan` consumes per story. Optional for small features — for <5 MVP items, you may skip stories and go PRD → `/plan` directly.

   Keep the existing "When Atlassian MCP is available..." line and the Core Principle.

3. **`<context>`** — unchanged.

4. **Phase 1 LOAD** — after the existing fallback order, add:
   > **PRD structure validation**: Verify the loaded file contains at least these sections: `Problem Statement` (or `## Problem`), `MVP Scope` table with ≥1 "Must" row, and `Implementation Phases` table. If any are missing, STOP and report which section is absent. Ask the user to complete the PRD (`/prd-interactive`) before decomposition.
   >
   > **Empty-scope guard**: If the MVP Scope has zero "Must" items, STOP and reply: "PRD has no Must-have items. Refine the MVP scope before creating stories."

   Update the CHECKPOINT to add:
   - [ ] PRD structure validated (Problem + MVP + Phases present)
   - [ ] ≥1 "Must" item found

5. **Phase 2 DECOMPOSE — Story Format** — update the template:

   **a.** Change the `**Labels**` line to:
   ```
   **Labels**: {canonical scopes from /commit — choose applicable: flags | api | ui | db | validation | deps | ai-layer}
   ```

   **b.** Add a new field `**Context to load**` between `**Labels**` and `### Description`:
   ```
   **Context to load**: {files the /plan agent must read — e.g., shared/types.ts, server/src/services/flags.ts, .agents/reference/backend.md}
   ```

   **c.** Update the Technical Notes block:
   ```
   ### Technical Notes
   - Files likely modified: {paths}
   - Patterns to follow: {CLAUDE.md section or `.agents/reference/*.md`}
   - Known pitfalls in this scope: {if api/backend → Express v5 `next(error)`, SQL.js `stmt.free()`, Zod parse-before-logic; if ui → cn() composition, Radix primitives}
   - Validation: {specific command — e.g., `cd server && pnpm run build && pnpm run lint && pnpm test`}
   ```

   Add a **Story Numbering** rule after Sizing Rules:
   > **Numbering**: Use `S-01, S-02, ...` within a single stories file. If appending to an existing file, read the highest `S-nn` and continue. When generating for a different PRD, start fresh at `S-01`.

6. **Phase 3 VALIDATE** — after the gates table, add a Remediation block:
   ```
   ### Remediation on Failure

   | Gate | If it fails |
   |------|-------------|
   | COVERAGE | List the unmapped PRD requirements. Create additional stories, or document in Open Questions why an item was skipped. |
   | SIZE | Large story can't be split → the story may be atomic. Convert Type to **Spike** to investigate and de-risk first, then re-decompose. |
   | TESTABLE | Rewrite AC as Given/When/Then with observable outcomes. If unobservable externally, tag Type: Technical. |
   | INDEPENDENT | Identify the shared concern. Extract it into its own story that both sides depend on. |
   | DAG | Identify the cycle. Same fix as INDEPENDENT: extract shared concern. |
   | TRACEABLE | Add a PRD-section reference to each story's Description line. |
   ```

7. **Phase 4 OUTPUT** — before `mkdir -p .agents/stories`, add:
   > **Destructive-write safety**: If `.agents/stories/{prd-name}-stories.md` already exists:
   > 1. Print its line count and highest `S-nn` story number.
   > 2. Ask the user: **REGENERATE** (current backed up to `{path}.bak`), **APPEND** (add new stories, continue numbering, preserve existing), or **CANCEL**.
   > 3. If non-interactive, default to **CANCEL**.

8. **Phase 5 JIRA INTEGRATION** — in step 3 ("Ask user before creating"), add a fallback on "No":
   > If the user declines Jira creation, DO NOT stall. Skip to the markdown-only report path. Tell the user: "Stories saved to markdown. Re-invoke this command when ready to push to Jira."

9. **Add terminal `<output>` block** after `<process>` and before `<success_criteria>`:
   ```
   Stories Generated.

   File: .agents/stories/{prd-name}-stories.md
   PRD source: {path}
   Total stories: {N}

   Breakdown:
   - By type: Feature {n} | Enhancement {n} | Technical {n} | Spike {n}
   - By size: Small {n} | Medium {n} | Large-split {n}
   - By phase: {from PRD phases}
   - By label: {canonical scope breakdown}

   Dependency graph: {N} edges, {N} unblocked roots (ready to start)

   Jira push: {created {N} issues in {PROJECT} under {EPIC} | MCP absent — markdown only | declined — markdown only}

   Next steps:
   1. Review — confirm AC are testable and dependencies are correct.
   2. Pick an unblocked story (one with no "Blocked by").
   3. Plan it: `/plan .agents/stories/{prd-name}-stories.md#S-01`
   4. After planning, run `/implement` on the produced `.plan.md`.
   ```

10. **`<success_criteria>`** — append:
    - PRD structure validation performed in Phase 1 (Problem + MVP + Phases + ≥1 Must)
    - Labels field uses canonical project scopes (flags / api / ui / db / validation / deps / ai-layer)
    - Each story has a "Context to load" field listing files the `/plan` agent must read
    - Technical Notes reference project-specific gotchas when scope touches api/backend/ui
    - Phase 3 remediation applied when any gate failed
    - Destructive-write safety honored (REGENERATE/APPEND/CANCEL + `.bak` on overwrite)
    - Terminal summary printed with breakdown + Jira status + per-story `/plan` invocation

11. **Do NOT change**:
    - Core Principle ("independently deliverable, testable, traceable")
    - Gherkin AC template (Given/When/Then)
    - Sizing Rules (Small/Medium/Large with split directive)
    - 6 VALIDATE gates (only add Remediation block — keep the gates themselves)
    - Jira MCP branching structure (Cloud ID → validate → ask → create → comment → link)
    - Kebab filename convention `.agents/stories/{prd-name}-stories.md`

Do NOT change any source code. Only modify `.claude/commands/create-stories.md`.
````

---

## Success Criteria

- [ ] Persona in `<objective>` ("tech lead decomposing work into independently shippable stories") (concept #26)
- [ ] Workflow positioning: after `/prd-interactive`, feeds `/plan`; skippable for <5 MVP items (concepts #26, #29)
- [ ] Phase 1 PRD-structure validation (Problem + MVP + Phases present) (concept #26)
- [ ] Phase 1 empty-scope guard (zero Must items → STOP) (concept #26)
- [ ] Story Labels aligned to canonical scopes: `flags / api / ui / db / validation / deps / ai-layer` (concept #8 — cross-ref Rounds 5 & 13)
- [ ] New "Context to load" field in Story Format (concept #8 — Task Management context budget)
- [ ] Technical Notes reference project-specific gotchas when scope touches api/backend/ui (concepts #8, #27)
- [ ] Story numbering rule (continue on APPEND, reset per PRD) (concept #27)
- [ ] Phase 3 VALIDATE Remediation table for each gate (concept #27)
- [ ] Phase 4 destructive-write safety (REGENERATE/APPEND/CANCEL + `.bak`) (concept #26)
- [ ] Phase 5 Jira "No" fallback — skip to markdown, don't stall (concept #27)
- [ ] Terminal `<output>` block with breakdown + Jira status + per-story `/plan` invocation (concepts #28, #29)
- [ ] `allowed-tools` tightened: drop `cat:*`, `ls:*`; add `cp:*` for `.bak` (best practice)
- [ ] Core Principle, Gherkin AC, Sizing Rules, 6 VALIDATE gates, Jira MCP branching, kebab filename preserved ✅
