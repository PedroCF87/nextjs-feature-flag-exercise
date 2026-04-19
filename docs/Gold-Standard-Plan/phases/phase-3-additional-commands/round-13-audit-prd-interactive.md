# Phase 3 — Additional Commands: Round 13 — Audit `/prd-interactive` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/prd-interactive.md`

**Gold Standard concepts**: #9, #25, #26, #27, #28, #29, #33

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~188
- **Frontmatter**: `allowed-tools: Write, Read, Bash(mkdir:*)`; `argument-hint: [feature/product idea] (blank = start with questions)`; `description: Interactive PRD generator - asks questions then builds a PRD`
- **Format**: XML-style tags — consistent
- **Structure**: 5 phases (INITIATE → FOUNDATION → DEEP DIVE → GENERATE → SUMMARY)

### Current Content Summary
1. **`<objective>`**: Persona ("sharp product manager"); 4 principles (problems-not-solutions, hypotheses-not-specs, ask-before-assume, TBD-over-invent); anti-pattern against fluff
2. **`<context>`**: Auto-loads CLAUDE.md head + lists existing PRDs in `.agents/PRDs/`
3. **`<process>`** — 5 phases:
   - **Phase 1 INITIATE**: branches on input (blank → ask; provided → restate and confirm); waits for response
   - **Phase 2 FOUNDATION**: 5W questions (Who, What, Why today, Why now, How measured); waits for responses
   - **Phase 3 DEEP DIVE**: 5 Vision/Scope questions (Vision, JTBD, MVP, Out of Scope, Constraints); waits for responses
   - **Phase 4 GENERATE**: `mkdir -p .agents/PRDs`; reads CLAUDE.md for Integration Notes; writes PRD with 9-section template
   - **Phase 5 SUMMARY**: terminal report with file path + problem/solution/metric summary + open questions + next steps
4. **`<success_criteria>`**: 8 items — saved path, 5 phases completed, specific problem, falsifiable hypothesis, MSW prioritization, Integration Notes, no invented requirements, summary reported

### Strengths Already Present
- **Sharp product-manager persona** with 4 concrete principles ✅
- **Interactive waits** enforced ("Wait for user response before proceeding") — prevents fire-and-forget PRDs ✅
- **Problem-first framing** — Foundation Questions 1–4 are all about the problem, not the solution ✅
- **5W + JTBD framework** (When/I want/So I can) — standard product artifact ✅
- **Must/Should/Won't prioritization** forces explicit "not building X" declarations ✅
- **TBD-over-invent** principle with enforcement in `<success_criteria>` ✅
- **CLAUDE.md integration** — Phase 4 reads CLAUDE.md before generating Integration Notes section ✅
- **Graceful no-CLAUDE.md fallback** — line 119 suggests running `/create-rules` if absent ✅
- **Chains to `/plan`** in Phase 5 SUMMARY ✅
- **Kebab-case path convention** for `.agents/PRDs/{name}.prd.md` ✅

### Bugs / Issues Spotted Before Audit
1. **Phase 5 SUMMARY suggests path that doesn't exist yet** (line 173): "Execute plan: `/implement .agents/plans/{plan-name}.plan.md`" — this path is only produced AFTER running `/plan`, so suggesting it at PRD time is premature. Users should first run `/plan`, which then produces the `.plan.md` path for `/implement`.
2. **`<context>` existing-PRDs check is display-only** — lists existing PRDs but doesn't use that list to prevent duplication in Phase 4.

---

## Concept-by-Concept Audit

### Concept #9 — Two Planning Layers (plus Layer 1.5 — Product)
> Layer 1 = Project Planning (tech stack, architecture, constraints — captured in CLAUDE.md and `/create-rules`). Layer 2 = Task Planning (per-feature `.plan.md` consumed by `/implement`). PRDs sit at **Layer 1.5 — Product Planning**: they describe what product/feature is being built, feed Layer 2 plans, and reference Layer 1 constraints.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Produces Layer 1.5 Product artifact | ✅ Present | PRD template covers Problem / Hypothesis / Users / Solution / MVP / Metrics / Phases / Risks — all product-level |
| References Layer 1 (CLAUDE.md) | ✅ Present | Phase 4 reads CLAUDE.md; "Project Integration Notes" section populated from tech stack/architecture/patterns |
| Chains to Layer 2 (`/plan`) | ✅ Present | Phase 5 SUMMARY: "Create implementation plan: `/plan .agents/PRDs/{filename}`" |
| Layer labeling in objective | ❌ Missing | Agent isn't told "this produces a Layer 1.5 Product artifact that feeds `/plan` (Layer 2)" — mental model absent |
| Layer 1 fallback when absent | ✅ Present | Line 119: "No CLAUDE.md found. Run `/create-rules` to generate project conventions." |
| Distinguishes Product PRD from Tech PRD | ❌ Missing | Gold Standard §9 notes two sub-types: Product ("what we're building, for whom, why") and Tech ("how we'll build it, architecture, constraints"). This command produces Product only; no branching or note that a Tech PRD may also be needed. |

**Actions:**
- [ ] Add to `<objective>` an explicit layer-positioning sentence:
  > **Planning layer**: This produces a **Layer 1.5 Product PRD** — it sits between Layer 1 (project infra, in CLAUDE.md) and Layer 2 (task plans, from `/plan`). Its audience is `/plan`: the PRD answers *what* and *why*; `/plan` answers *how*.
- [ ] Add a note in Phase 4 GENERATE after the Project Integration Notes section: "If this feature needs significant new infrastructure (new service, new DB, new deployment), flag it in 'Open Questions' as 'Needs a Tech PRD before planning' — do not try to design the technical architecture in this Product PRD."

---

### Concept #25 — Input → Process → Output Structure
> Every command defines all three.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ✅ Strong | `<objective>` (persona + principles) + `<context>` (CLAUDE.md + existing PRDs) + `$ARGUMENTS` with blank-handling |
| **Process** | ✅ Strong | 5 phases with explicit user-response waits |
| **Output** | ✅ Strong | PRD file + Phase 5 terminal summary |

**Actions:**
- [ ] Tight-up only (see #26, #27, #28 below)

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, what context to load.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ✅ Strong | "sharp product manager" with 4 enumerated principles |
| PIV / workflow positioning | ⚠️ Partial | Line 172 chains to `/plan`, but `<objective>` doesn't state where this fires (first step for a new feature? after `/prime`? when a stakeholder requests it?) |
| Empty-input handling | ✅ Present | Phase 1 branches: blank → ask; provided → restate |
| Duplicate-PRD detection | ❌ Missing | `<context>` lists existing PRDs but Phase 1 doesn't check if the new request overlaps with an existing PRD — user could waste effort re-PRDing something already documented |
| Destructive-write safety | ❌ Missing | Phase 4 writes to `{kebab-case-name}.prd.md` — if the kebab derivation produces an existing filename, the existing PRD is silently overwritten (same issue flagged in Rounds 11 & 12) |
| User-confirmation validation | ⚠️ Partial | Phase 1 asks "Is this correct?" but does not handle a "No" answer (should loop back to restate) |
| Context loading | ✅ Strong | CLAUDE.md + existing PRDs list |

**Actions:**
- [ ] Add meta-trigger note to `<objective>`: "Invoke at the **start of a new feature or product initiative** — before `/plan`, typically after a stakeholder conversation. If the feature is a small refinement of an existing PRD, prefer editing that PRD to spawning a new one."
- [ ] Add to Phase 1 INITIATE a **duplicate-check step**: "Scan the existing-PRDs list from `<context>`. If any existing PRD appears to overlap in users or problem statement, ask the user: 'An existing PRD (`<path>`) covers a similar problem. Do you want to (a) EXTEND it, (b) SUPERSEDE it, or (c) CONFIRM this is distinct?' If EXTEND, STOP — tell the user to edit the existing PRD directly."
- [ ] Add to Phase 4 GENERATE a **destructive-write guard**: "Before writing, check if `{kebab-case-name}.prd.md` already exists. If yes, derive a unique name with a numeric suffix (e.g., `feature-x-v2.prd.md`) and inform the user of the renaming."
- [ ] Fix Phase 1 user-confirmation: "If the user says 'No' or corrects the restatement, loop back to restate with the correction and re-ask before proceeding."

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling, evidence-first, rigor.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered VERB-labeled phases | ✅ Strong | INITIATE / FOUNDATION / DEEP DIVE / GENERATE / SUMMARY |
| Interactive waits enforced | ✅ Strong | Each Q-phase ends with "Wait for user response before proceeding" |
| Question batching | ✅ Present | Foundation + Deep Dive each ask all their questions together — avoids re-prompt tax |
| Fixed question set | ⚠️ Partial | Phases 2 & 3 are fixed 5-question batches. Persona says "Ask clarifying questions before assuming" — but there's no mechanism for dynamic follow-ups when an answer is vague/contradictory |
| Ambiguity handling | ❌ Missing | If the user's Foundation answers contradict (e.g., Q1 says "developers" but Q2 describes a non-technical pain), no instruction to pause and reconcile |
| Project-specific awareness | ⚠️ Partial | Phase 4 reads CLAUDE.md for Integration Notes, but Phase 2/3 questions don't probe for project-specific scope signals (e.g., "Which layers does this touch? flags / api / ui / db / validation / ai-layer" — mirrors `/commit` scopes) |
| TBD discipline | ✅ Strong | Stated in `<objective>`; enforced in `<success_criteria>` |
| Tools specified | ✅ Clean | `Write, Read, Bash(mkdir:*)` — minimal and correct |
| Error handling — user goes off-topic | ❌ Missing | If the user answers a product question with an implementation detail ("Use PostgreSQL" instead of "users want X"), no instruction to redirect |

**Actions:**
- [ ] Add a **Clarifying Follow-Up** rule between Phase 2 and Phase 3:
  > **Before proceeding to Deep Dive**: Review the Foundation answers. If any of these are true, ask ONE targeted follow-up before moving on:
  > - An answer is vague (e.g., "users" without role; "slow" without number)
  > - Two answers contradict (e.g., Q1 user role conflicts with Q2 pain description)
  > - Q5 "How will you know" lacks a measurable signal
  >
  > Never ask more than 2 follow-ups — if still unclear, mark relevant PRD fields `TBD - needs research` and continue.
- [ ] Add **Off-topic redirect** guidance to Phase 2 and Phase 3:
  > If the user answers a product-level question with implementation detail (database choice, framework, algorithm), redirect: "That's a *how* question — we'll get there in `/plan`. For now, what's the *user pain* or *user outcome*?" Then re-ask the original question.
- [ ] Add to Phase 3 DEEP DIVE a **project-scope question** (sixth question):
  > 6. **Project Scope**: Which layers will this touch? Select all: `flags` (domain logic), `api` (client API), `ui` (frontend), `db` (schema/seed), `validation` (Zod schemas), `deps`, `ai-layer`. This seeds the `/plan` scope conversation.

---

### Concept #28 — Output Section Detail
> Structured, traceable, chains forward.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| PRD file written | ✅ Strong | `.agents/PRDs/{name}.prd.md` |
| Template fidelity | ✅ Strong | 9-section template: Problem / Hypothesis / Users / Solution / MVP / Integration Notes / Metrics / Open Questions / Phases / Risks |
| Terminal summary | ✅ Strong | Phase 5 SUMMARY has structured report |
| Chain forward | ⚠️ Bug | Phase 5 SUMMARY line 173 says: `Execute plan: /implement .agents/plans/{plan-name}.plan.md` — but at this point no plan exists yet. This path is the output of `/plan`, not `/prd-interactive`. Confuses users into thinking they can skip `/plan`. |
| Open Questions surfaced | ✅ Strong | Phase 5 lists Open Questions with count |
| Project-scope tags in summary | ❌ Missing | If Phase 3 adds the Project Scope question (see #27), Phase 5 summary should echo the detected scope(s) |

**Actions:**
- [ ] Fix Phase 5 SUMMARY **Next Steps** — remove the premature `/implement` line; adjust to:
  ```
  Recommended Next Steps
  1. Review and refine the PRD.
  2. Resolve or explicitly TBD all Open Questions ({N}).
  3. Create implementation plan: `/plan .agents/PRDs/{filename}`
     (The plan will then tell you exactly which `/implement` command to run.)
  ```
- [ ] If Priority #27 adds the Project Scope question, add a line to Phase 5 SUMMARY:
  ```
  Layers affected: {comma-list of scopes from Phase 3 Q6}
  ```

---

### Concept #29 — Command Chaining
> Where does `/prd-interactive` sit in the workflow?

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Upstream cue | ⚠️ Partial | No explicit upstream; typically invoked directly by the user at feature-start |
| Chain to `/plan` | ✅ Present | Phase 5 SUMMARY line 172 |
| Chain to `/create-rules` (no CLAUDE.md) | ✅ Present | Line 119 |
| Chain to `/create-stories` | ❌ Missing | Gold Standard (and existing `.claude/commands/create-stories.md`) suggests PRDs → stories → plans. Phase 5 SUMMARY skips stories and jumps straight to `/plan`. |

**Actions:**
- [ ] Add to Phase 5 SUMMARY Next Steps an optional **stories step** between PRD and plan:
  ```
  (Optional — for large features) Break into stories: `/create-stories .agents/PRDs/{filename}`
  ```
  Mark this as *optional* so small features can go straight to `/plan`.

---

### Concept #33 — Vibe Planning (Meta-Loop)
> Vibe Planning = Human articulates intent → AI finds relevant docs → AI structures the artifact → structured result. The AI does research, not just formatting.

| Step | Status | Evidence |
|------|--------|----------|
| **Human articulates** | ✅ Strong | Interactive Q&A across Phases 1–3 |
| **AI finds docs** | ⚠️ Partial | Reads CLAUDE.md for Integration Notes — but does not search `.agents/PRDs/` for related prior PRDs, does not scan the repo for code that may already partially implement the feature, does not check `.agents/reference/` (if present) for relevant patterns |
| **AI structures** | ✅ Strong | PRD template is comprehensive and fills all 9 sections |
| **Structured result** | ✅ Strong | `.prd.md` file with clear sections |

**Actions:**
- [ ] Add a **Phase 3.5: RESEARCH** between DEEP DIVE and GENERATE:
  ```
  ## Phase 3.5: RESEARCH — Ground the PRD

  Before writing, spend up to 5 tool calls gathering evidence:

  1. **Related PRDs** — `Grep` for key terms from Problem Statement across `.agents/PRDs/**`. Flag near-duplicates.
  2. **Existing partial implementations** — `Grep` for domain nouns from the feature (e.g., "flag", "environment", "filter") across `server/src/` and `client/src/`. Note any files that already touch the area — they become implementation starting points in the Implementation Phases section.
  3. **Relevant reference docs** — if `.agents/reference/*.md` exists, read the ones whose filename matches the feature's layer (e.g., `backend.md` for API features, `frontend.md` for UI features).

  Summarize findings in the "Project Integration Notes" section — not as vague statements, but as concrete `file:line` references or "none found".
  ```
- [ ] Update `<success_criteria>` accordingly: "Research phase produced at least the 'related PRDs' and 'existing partial implementations' probes (with findings documented even if 'none')."

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Interactive PRD generator - asks questions then builds a PRD" |
| `argument-hint` | ✅ Strong | `[feature/product idea] (blank = start with questions)` — teaches blank-handling |
| `allowed-tools` | ✅ Clean | `Write, Read, Bash(mkdir:*)` — minimal, no shell leaks |

**Actions:**
- [ ] Add `Grep, Glob` to `allowed-tools` to support the new Phase 3.5 RESEARCH step.

---

## Action Plan Summary

### Priority 1 — Add Research Phase (concept #33) — the headline Vibe Planning fix

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add **Phase 3.5: RESEARCH** between DEEP DIVE and GENERATE: related PRDs, partial implementations, reference docs | #33 |
| 1.2 | Populate "Project Integration Notes" with concrete `file:line` findings from research | #33 |
| 1.3 | Add `Grep, Glob` to `allowed-tools` | Best practice |

### Priority 2 — Fix Chain Output Bug (concept #28)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Remove premature `/implement` suggestion from Phase 5 Next Steps (path doesn't exist at PRD time) | #28 |
| 2.2 | Add optional `/create-stories` chain for large features | #29 |

### Priority 3 — Layer Positioning (concept #9)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | State explicitly in `<objective>` that this produces a Layer 1.5 Product PRD feeding Layer 2 `/plan` | #9 |
| 3.2 | Add Tech-PRD carve-out: if infra-heavy, flag in Open Questions | #9 |

### Priority 4 — Input Safety (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Duplicate-check: if similar PRD exists, ask EXTEND / SUPERSEDE / CONFIRM-DISTINCT | #26 |
| 4.2 | Destructive-write guard: rename with numeric suffix if filename collides | #26 |
| 4.3 | Fix Phase 1 restatement loop on "No" answer | #26 |
| 4.4 | Meta-trigger note: when to invoke | #26 |

### Priority 5 — Process Robustness (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Add Clarifying Follow-Up rule between Phase 2 and Phase 3 (max 2 follow-ups) | #27 |
| 5.2 | Add Off-topic redirect guidance for implementation-detail answers | #27 |
| 5.3 | Add Project Scope question to Phase 3 — mirrors `/commit` scopes | #27, cross-ref Round 5 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference (§9, §25, §33)
2. `.claude/commands/prd-interactive.md` — current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-13-audit-prd-interactive.md` — this audit
4. `.claude/commands/commit.md` — source of truth for project scopes (flags / api / ui / db / validation / deps / ai-layer)
5. `.claude/commands/create-stories.md` — context for the optional stories chain

Rewrite `.claude/commands/prd-interactive.md` with these requirements:

1. **Frontmatter** — update `allowed-tools` to:
   `Write, Read, Grep, Glob, Bash(mkdir:*)`
   Keep `description` and `argument-hint` unchanged.

2. **`<objective>`** — keep persona and 4 principles. Add two new lines at the end:
   > **Planning layer**: This produces a **Layer 1.5 Product PRD** — between Layer 1 (project infra, CLAUDE.md) and Layer 2 (task plans from `/plan`). The PRD answers *what* and *why*; `/plan` answers *how*.
   >
   > **When to invoke**: At the start of a new feature or product initiative, before `/plan`. For small refinements of an existing PRD, edit that PRD directly instead of creating a new one.

3. **`<context>`** — unchanged.

4. **Phase 1 INITIATE** — expand:
   - Keep the blank/provided branching.
   - After the confirm step, add: "If the user answers 'No' or corrects the restatement, loop back, restate with the correction, and re-ask. Only proceed on a clear 'Yes'."
   - Add a new sub-step **Duplicate check**:
     > Scan the existing-PRDs list loaded in `<context>`. If any appear to overlap in users or problem statement, ask: "An existing PRD (`<path>`) covers a similar area. Do you want to (a) EXTEND it, (b) SUPERSEDE it, or (c) CONFIRM this is distinct?"
     > - EXTEND → STOP; tell the user to edit the existing PRD directly.
     > - SUPERSEDE → note the superseded PRD path; it will be referenced in the new PRD's "Risks & Mitigations" section.
     > - CONFIRM — proceed.

5. **Phase 2 FOUNDATION** — keep 5 questions. After the "Wait for user response" line, add:
   > **Before proceeding to Deep Dive**, review the Foundation answers. If any of these are true, ask ONE targeted follow-up:
   > - An answer is vague (no role, no number, no concrete pain)
   > - Two answers contradict
   > - Q5 "How will you know" lacks a measurable signal
   >
   > Max 2 follow-ups total. If still unclear, mark the relevant PRD fields `TBD - needs research` and continue.
   >
   > **Off-topic redirect**: If the user answers with implementation detail (database choice, framework, algorithm), redirect: "That's a *how* question — we'll get there in `/plan`. For now, what's the *user pain* or *user outcome*?" Then re-ask.

6. **Phase 3 DEEP DIVE** — keep 5 existing questions. Add question 6:
   > 6. **Project Scope**: Which layers will this touch? Select all that apply: `flags` (domain logic), `api` (client API), `ui` (frontend), `db` (schema/seed), `validation` (Zod schemas), `deps`, `ai-layer`. This seeds the `/plan` scope and the `/commit` scope.
   Keep the "Wait for user responses" line.

7. **Insert new Phase 3.5 RESEARCH** between DEEP DIVE and GENERATE:
   ```
   ## Phase 3.5: RESEARCH — Ground the PRD in Repo Reality

   Before writing, spend up to 5 tool calls gathering evidence:

   1. **Related PRDs** — `Grep` for 2–3 key nouns from the Problem Statement across `.agents/PRDs/**`. List near-matches.
   2. **Existing partial implementations** — `Grep` for domain nouns (e.g., "flag", "filter", "environment") across `server/src/` and `client/src/`. Note files that already touch the area — they become starting points in the Implementation Phases section.
   3. **Relevant reference docs** — if `.agents/reference/*.md` exists, read files matching the affected layers from Phase 3 Q6.

   Record findings as concrete `file:line` references (or "none found") — these feed the Project Integration Notes section.
   ```

8. **Phase 4 GENERATE** — before the `mkdir -p .agents/PRDs` step, add:
   > **Destructive-write guard**: Derive the kebab-case filename. If `.agents/PRDs/{name}.prd.md` already exists, append a numeric suffix (`-v2`, `-v3`, ...) until unique. Inform the user of the final filename.
   >
   > **Tech-PRD carve-out**: If Phase 2 or 3 surfaced significant new infrastructure (new service, new DB, new deployment), add to the PRD's "Open Questions" a TBD: "Needs a Tech PRD before planning" — do not design technical architecture in this Product PRD.

   The Project Integration Notes section in the template should be rewritten to require research findings:
   > ### Project Integration Notes
   > - **Tech stack constraints** (from CLAUDE.md): {list}
   > - **Architecture** (from CLAUDE.md): {summary}
   > - **Key patterns** (from CLAUDE.md): {patterns to follow}
   > - **Related PRDs found**: {file paths or "none"}
   > - **Existing partial implementations**: {file:line references or "none"}
   > - **Reference docs consulted**: {filenames or "none"}
   > - **Validation approach** (from CLAUDE.md): {commands}

9. **Phase 5 SUMMARY** — fix the Next Steps:
   ```
   Recommended Next Steps
   1. Review and refine the PRD.
   2. Resolve or explicitly TBD all Open Questions ({count}).
   3. (Optional — for large features) Break into stories: `/create-stories .agents/PRDs/{filename}`
   4. Create implementation plan: `/plan .agents/PRDs/{filename}`
      (The plan will produce the `.plan.md` path that `/implement` consumes.)
   ```
   Add a new line to the summary block (if Phase 3 Q6 was answered):
   ```
   **Layers affected**: {comma-list from Phase 3 Q6}
   ```

10. **`<success_criteria>`** — append:
    - Phase 1 duplicate check performed; if duplicate found, user chose EXTEND/SUPERSEDE/CONFIRM
    - Phase 3.5 RESEARCH ran: related PRDs probed, partial implementations probed (findings recorded even if "none")
    - Project Integration Notes include research findings with `file:line` references or explicit "none found"
    - Filename collision avoided (numeric suffix applied if needed)
    - Phase 5 Next Steps no longer reference `/implement` path directly (only `/plan`)

11. **Do NOT change**:
    - Persona and 4 principles
    - Foundation and Deep Dive core question sets (only add the follow-up rule and Q6)
    - MSW (Must/Should/Won't) prioritization
    - TBD-over-invent discipline
    - Kebab-case filename convention
    - PRD 9-section structure (only refine Project Integration Notes contents)

Do NOT change any source code. Only modify `.claude/commands/prd-interactive.md`.
````

---

## Success Criteria

- [ ] Layer 1.5 Product PRD positioning stated in `<objective>` + meta-trigger note (concepts #9, #26)
- [ ] Tech-PRD carve-out in Phase 4 flags infra-heavy features for a separate Tech PRD (concept #9)
- [ ] Duplicate-PRD check in Phase 1 (EXTEND / SUPERSEDE / CONFIRM-DISTINCT) (concept #26)
- [ ] Phase 1 restatement loop handles "No" correction (concept #26)
- [ ] Destructive-write guard in Phase 4 (numeric-suffix collision avoidance) (concept #26)
- [ ] Phase 2 → Phase 3 transition includes Clarifying Follow-Up rule (max 2) (concept #27)
- [ ] Off-topic redirect rule for implementation-detail answers (concept #27)
- [ ] Phase 3 Q6 (Project Scope) added, mirrors `/commit` scopes (concept #27, cross-ref Round 5)
- [ ] **Phase 3.5 RESEARCH added** with: related PRDs probe, partial-implementation probe, reference-docs probe (concept #33 — headline)
- [ ] Project Integration Notes section rewritten to require concrete `file:line` findings (concept #33)
- [ ] Phase 5 SUMMARY fixed: no premature `/implement` path reference (concept #28)
- [ ] Phase 5 adds optional `/create-stories` chain for large features (concept #29)
- [ ] Phase 5 "Layers affected" line (if Q6 answered) (concept #28)
- [ ] `allowed-tools` extended with `Grep, Glob` for RESEARCH phase (best practice)
- [ ] Persona, 4 principles, 5W + Vision/Scope questions, MSW prioritization, TBD discipline, kebab filename preserved ✅
