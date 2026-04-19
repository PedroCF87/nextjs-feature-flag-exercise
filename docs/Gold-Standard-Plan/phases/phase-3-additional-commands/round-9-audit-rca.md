# Phase 3 — Additional Commands: Round 9 — Audit `/rca` Command (Root Cause Analysis)

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/rca.md`

**Gold Standard concepts**: #7, #13, #25, #26, #27, #28

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~296
- **Frontmatter**: `allowed-tools: Read, Grep, Glob, Bash(git:*, find:*, ls:*, cat:*, head:*, grep:*, node:*, npx:*)`; `argument-hint: <issue|error|stacktrace> [quick]`; `description: Deep root cause analysis - finds the actual cause, not just symptoms`
- **Format**: XML-style tags (`<objective>`, `<context>`, `<process>`, `<output>`, `<success_criteria>`) — consistent with `prime`/`plan`/`implement`/`validate`/`review-pr`
- **Structure**: Dual-mode (QUICK vs DEEP) + 5 phases (CLASSIFY → HYPOTHESIZE → INVESTIGATE → VALIDATE → GENERATE)

### Current Content Summary
1. **`<objective>`**: The Test ("If I changed THIS, would the issue be prevented?") + mode switch on `quick` suffix
2. **`<context>`**: Auto-loads CLAUDE.md head, project structure, recent commits, current branch
3. **`<process>`** — 5 phases:
   - **Phase 1 CLASSIFY**: parses input as RAW_SYMPTOM vs PRE_DIAGNOSED; restates the symptom
   - **Phase 2 HYPOTHESIZE**: 2–4 ranked hypotheses with "Evidence to Confirm/Refute" columns
   - **Phase 3 INVESTIGATE**: 5 Whys template with strict evidence standards (file:line + snippet)
   - **Phase 4 VALIDATE**: CAUSATION / NECESSITY / SUFFICIENCY tests
   - **Phase 5 GENERATE**: saves report to `.agents/rca-reports/rca-report-{N}.md`
4. **Investigation Techniques** table — issue types × techniques (code bugs, runtime, integration, regressions, convention violations)
5. **Git History Analysis** (REQUIRED in deep mode) — `git log` + `git blame` + classification (Regression / Original / Long-standing)
6. **`<output>`**: full markdown report template (Evidence Chain, Alternative Hypotheses, Git History, Fix Specification, Verification) + user-facing summary
7. **`<success_criteria>`**: 8 strict checks — specific code, no speculation words, git history, executable verification

### Strengths Already Present
- **The Test** ("If I changed THIS, would the issue be prevented?") — sharp operational definition of "root cause" ✅
- **Strict evidence standards** — table of Valid vs Invalid evidence (no "likely", "probably", "may") ✅
- **5 Whys executed against real code** with `file:line` + snippet requirement ✅
- **VALIDATE phase** with CAUSATION/NECESSITY/SUFFICIENCY — forces rigor before declaring root cause ✅
- **Test, Don't Just Read** principle explicitly stated ✅
- **Git history REQUIRED** in deep mode (`git log`, `git blame`, regression classification) ✅
- **Persisted reports** in `.agents/rca-reports/rca-report-{N}.md` with numbered sequence ✅
- **Dual-mode** (QUICK vs DEEP) for triaging depth ✅

---

## Concept-by-Concept Audit

### Concept #7 — System Evolution (CORE OF THIS AUDIT)
> "Don't just fix the bug. Fix the system that allowed the bug."
>
> When an incident happens, update the AI layer itself: Commands, Global Rules (CLAUDE.md), On-Demand Context, Plan Templates — so the next agent won't repeat the same mistake.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Finds root cause in code | ✅ Strong | Phase 3 INVESTIGATE + Fix Specification are excellent |
| Goes up one level: asks "why did the *system* allow this?" | ❌ Missing | No phase or section asks "which Command, Rule, or Context doc would have prevented this?" |
| Recommends AI layer updates | ❌ Missing | Output has "Fix Specification" for code, but no "System Evolution Recommendations" for Commands / CLAUDE.md / `.agents/reference/` / Plan Templates |
| Classifies the miss | ❌ Missing | Does not distinguish: rule-violation (known convention ignored) vs rule-gap (convention not yet documented) vs process-gap (validation step didn't catch it) |
| Outputs actionable AI-layer edits | ❌ Missing | Report has code-level fix, but no "Update `CLAUDE.md`: add AI Gotcha…" or "Update `/validate`: add check…" |
| Closes the loop with a meta-commit | ❌ Missing | No instruction to follow-up with updates to Commands/CLAUDE.md after the code fix |

**Actions:**
- [ ] Add **Phase 5: SYSTEMATIZE** (before GENERATE) — one new phase that asks: "What in the AI layer would have prevented this bug? Classify the miss, propose concrete edits to Commands / CLAUDE.md / `.agents/reference/` / Plan Templates."
- [ ] Add to the output report a required **System Evolution** section with subsections:
  - Miss Classification (rule-violation / rule-gap / process-gap / context-gap)
  - Recommended AI-Layer Updates (file → change → why)
  - Prevention Check (how future `/validate` or `/review-pr` would now catch this)
- [ ] Add to user-facing summary a "System Evolution" line listing the 1–3 AI-layer edits recommended

---

### Concept #13 — AI Self-Improvement / Learning from Errors
> The AI layer evolves as errors happen. `/rca` is the feedback loop that turns an incident into an improvement to the system.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Treats incident as learning signal | ⚠️ Partial | Classifies git-history (Regression / Original / Long-standing) — good, but doesn't feed back into AI layer |
| Recommends system updates, not just code fix | ❌ Missing | See #7 — this is the same gap from a different angle |
| Ties back to CLAUDE.md AI Gotchas | ❌ Missing | No hook to append to a project-level gotchas list |

**Actions:**
- [ ] In the System Evolution section (see #7), require an explicit recommendation for the **AI Gotchas section of CLAUDE.md** when the root cause is a project-specific pitfall (e.g., SQL.js `stmt.free()` missing, Express v5 `next(error)` skipped, Zod parse order)
- [ ] Cross-reference Round 1 audit: CLAUDE.md has no AI Gotchas section yet — `/rca` findings are a natural way to populate it

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ✅ Strong | `<objective>` defines persona-ish statement + The Test; `<context>` auto-loads 4 signals; `$ARGUMENTS` parsing in Phase 1 |
| **Process** | ✅ Strong | 5 VERB-labeled phases with strict rules; dual-mode handling explicit |
| **Output** | ✅ Strong | `<output>` block with full report template + user-facing summary |

**Actions:**
- [ ] Only improvements here are tied to #7 (adding a SYSTEMATIZE phase to Process + System Evolution to Output). I/P/O skeleton itself is correct.

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, what context to load.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ⚠️ Partial | Implicit ("find actual root cause, not symptoms") — but no explicit "You are a forensic investigator..." |
| PIV positioning | ❌ Missing | Not stated when `/rca` fires in the PIV Loop (e.g., "invoked when `/validate` fails, during `/implement` debugging, or post-PR incident") |
| Pre-conditions | ⚠️ Partial | Input types handled (RAW_SYMPTOM / PRE_DIAGNOSED) but no pre-condition check (e.g., "require at least a symptom description — if empty, STOP and ask for one") |
| `$ARGUMENTS` clarity | ✅ Strong | `argument-hint: <issue\|error\|stacktrace> [quick]` — clear and well-typed |
| Context loading | ✅ Strong | CLAUDE.md head + project structure + recent commits + branch |
| Project On-Demand Context discovery | ❌ Missing | Does not look for `.agents/reference/backend.md` or `frontend.md` — which CLAUDE.md says exist on-demand. For a root-cause agent, these are essential reading. |

**Actions:**
- [ ] Add explicit persona: "You are a forensic investigator. You do not explain how technology works — you find the specific `file:line` that caused the incident and the specific AI-layer gap that let it slip through."
- [ ] Add PIV positioning note: "Invoked when (a) `/validate` fails and the error is not obvious, (b) `/implement` hits an unexpected runtime behavior, (c) a PR review surfaces a regression. Not part of the PIV forward chain — a **sideways loop** triggered by failure."
- [ ] Add to `<context>` auto-loading: `!test -f .agents/reference/backend.md && cat .agents/reference/backend.md || echo "(no backend reference)"` and the same for `frontend.md` (load if present)
- [ ] Add pre-condition: "If `$ARGUMENTS` is empty, STOP and ask: 'What is the symptom? Paste the error, stack trace, or failing behavior.'"

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling, evidence rigor.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered phases with labels | ✅ Strong | 5 phases CLASSIFY / HYPOTHESIZE / INVESTIGATE / VALIDATE / GENERATE |
| Tools specified | ⚠️ Partial | `allowed-tools` includes `Bash(...grep:*...)`, `find:*`, `ls:*` — but CLAUDE.md convention is `Grep` and `Glob` tools (not shell `grep`/`find`). Redundant. |
| Strict evidence rules | ✅ Strong | Valid/Invalid table, 5 Whys requires `file:line` + snippet |
| "Test, don't read" mandate | ✅ Strong | Explicit "Reading code = what it's supposed to do / Running code = what it actually does" |
| Mode-specific rules | ✅ Strong | QUICK vs DEEP clearly separated |
| Project-specific gotcha hooks | ⚠️ Partial | Investigation Techniques table mentions "Convention violations" generically — does not name this project's known pitfalls (Express v5 `next(error)`, SQL.js `stmt.free()`, Zod parse-before-logic) |
| System-level recommendation (the #7 phase) | ❌ Missing | There is no phase that produces AI-layer recommendations |
| Back-pressure on QUICK mode | ⚠️ Partial | QUICK says "Accept high-confidence hypotheses without exhaustive validation" — but evidence standards still apply. Could explicitly say QUICK mode still requires `file:line` evidence. |

**Actions:**
- [ ] Slim `allowed-tools`: remove `Bash(grep:*, find:*, ls:*, cat:*, head:*)` — use `Grep`, `Glob`, and `Read` instead. Keep `Bash(git:*, node:*, npx:*)` for git analysis and running tests.
- [ ] In the Convention Violations row of Investigation Techniques, add the project's known pitfalls: "For this project: Express v5 `next(error)` propagation, SQL.js `stmt.free()` in finally, Zod parse before business logic (see CLAUDE.md → Error Handling + Code Style & Patterns)"
- [ ] Add **Phase 5: SYSTEMATIZE** after VALIDATE and before GENERATE:
  ```
  ## Phase 5: SYSTEMATIZE — Why did the system allow this?

  Ask and answer in writing:
  1. Which AI-layer artifact (Command, Global Rule, On-Demand Context, Plan Template) SHOULD have prevented this?
  2. Classify the miss:
     | Type | Meaning |
     |------|---------|
     | rule-violation | Convention exists in CLAUDE.md but was ignored — improve `/validate` or `/review-pr` to catch it |
     | rule-gap | Convention not yet documented — add to CLAUDE.md AI Gotchas or Code Style section |
     | context-gap | Needed context was not loaded — add to `.agents/reference/` and reference in `/prime` or `/plan` |
     | process-gap | Validation step missing — add to `/validate` or Phase 1 of `/commit` |
  3. Propose 1–3 concrete edits with: target file, exact change, and why.
  ```
- [ ] Renumber current Phase 5 GENERATE → Phase 6 GENERATE

---

### Concept #28 — Output Section Detail
> Structured, informative, actionable, traceable.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Output format defined | ✅ Strong | Full markdown template with Evidence Chain, Alt Hypotheses, Git History, Fix Spec, Verification |
| Persisted report | ✅ Strong | `.agents/rca-reports/rca-report-{N}.md` with auto-numbering |
| Code-level actionability | ✅ Strong | Fix Specification with file paths + logic change + correct behavior |
| Verification steps executable | ✅ Strong | Last section is "Verification" with specific test commands |
| System Evolution section | ❌ Missing | No section in the report template for AI-layer recommendations |
| User-facing summary mentions system evolution | ❌ Missing | User summary lists Root Cause/Severity/Confidence + next steps — no mention of AI-layer follow-ups |
| Chain to follow-up action | ⚠️ Partial | "Next steps" suggests implementing the fix, but doesn't chain to `/create-rules` (for rule-gap) or manual CLAUDE.md edit (for rule-violation escalated to gotcha) |

**Actions:**
- [ ] Add a `## System Evolution` section to the report template (between `## Fix Specification` and `## Verification`):
  ```markdown
  ## System Evolution

  ### Miss Classification
  - **Type**: rule-violation | rule-gap | context-gap | process-gap
  - **Reasoning**: [why this classification]

  ### Recommended AI-Layer Updates

  | Artifact | Change | Why |
  |----------|--------|-----|
  | `CLAUDE.md` §AI Gotchas | Add: "SQL.js statements must be freed in finally…" | Prevent silent resource leaks |
  | `.claude/commands/validate.md` | Add grep check for `new Statement` without `.free()` | Catch at validation time |
  | `.agents/reference/backend.md` | Document Express v5 `next(error)` pattern | Fill context gap |

  ### Prevention Check
  - After applying updates, this same symptom would be caught by: [which command or review step]
  ```
- [ ] Add to user-facing summary a new line:
  ```
  System Evolution: {N} AI-layer update(s) recommended — review the System Evolution section.
  ```
- [ ] Add to "Next steps" in user summary: "If the miss classification is `rule-gap`, append the new gotcha to `CLAUDE.md` §AI Gotchas. If `process-gap`, update `/validate` or `/commit` Phase 1 checks."

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Deep root cause analysis - finds the actual cause, not just symptoms" |
| `argument-hint` | ✅ Good | `<issue\|error\|stacktrace> [quick]` |
| `allowed-tools` | ⚠️ Redundant | Includes `Bash(grep:*, find:*, ls:*, cat:*, head:*)` — these duplicate the native `Grep`, `Glob`, `Read` tools. Violates project convention from CLAUDE.md |

**Actions:**
- [ ] Tighten `allowed-tools` to: `Read, Grep, Glob, Write, Bash(git log:*), Bash(git blame:*), Bash(git diff:*), Bash(mkdir:*), Bash(pnpm test:*), Bash(node:*), Bash(npx:*)`
  - `Write` needed for saving the report to `.agents/rca-reports/`
  - Keep git subcommands for history analysis
  - Keep test runners for the "Test, don't read" principle
  - Drop shell `grep`/`find`/`ls`/`cat`/`head` (use Grep/Glob/Read instead)

---

## Action Plan Summary

### Priority 1 — Add System Evolution (concepts #7, #13) — THE headline change

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Insert new **Phase 5: SYSTEMATIZE** between VALIDATE and GENERATE | #7 |
| 1.2 | Add **Miss Classification** taxonomy (rule-violation / rule-gap / context-gap / process-gap) | #7 |
| 1.3 | Add `## System Evolution` section to report template (Miss Classification + Recommended Updates + Prevention Check) | #7, #13 |
| 1.4 | Add "System Evolution" line to user-facing summary | #7 |
| 1.5 | Renumber Phase 5 GENERATE → Phase 6 GENERATE | Housekeeping |

### Priority 2 — Input Detail (concept #26)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add explicit persona: "forensic investigator" | #26 |
| 2.2 | Add PIV positioning: "sideways loop triggered by `/validate` failure, `/implement` anomaly, or post-PR regression" | #6, #26 |
| 2.3 | Load `.agents/reference/backend.md` and `frontend.md` in `<context>` when present | #26 |
| 2.4 | Pre-condition: STOP if `$ARGUMENTS` empty, ask for symptom | #26 |

### Priority 3 — Process Detail (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add project-specific gotchas to Convention Violations row: Express v5 `next(error)`, SQL.js `stmt.free()`, Zod parse order | #27 |
| 3.2 | Clarify QUICK mode still requires `file:line` evidence (just fewer Whys) | #27 |

### Priority 4 — Frontmatter / Tool Hygiene

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Tighten `allowed-tools`: drop `grep:*, find:*, ls:*, cat:*, head:*`; add `Write` and scope git to `git log:*`, `git blame:*`, `git diff:*` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — Gold Standard reference
2. `.claude/commands/rca.md` — the current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-9-audit-rca.md` — this audit plan
4. `CLAUDE.md` — to confirm project pitfalls and convention list

Rewrite `.claude/commands/rca.md` with these requirements:

1. **Frontmatter**:
   - Replace `allowed-tools` with: `Read, Grep, Glob, Write, Bash(git log:*), Bash(git blame:*), Bash(git diff:*), Bash(mkdir:*), Bash(pnpm test:*), Bash(node:*), Bash(npx:*)`
   - Keep `description` and `argument-hint` unchanged

2. **`<objective>`** — add an explicit persona line at the top:
   > You are a forensic investigator. You do not explain how technology works — you find the specific `file:line` that caused the incident AND the specific AI-layer gap that let it slip through.
   Keep the existing "The Test" paragraph and mode switch.

3. **`<context>`** — add PIV positioning before the auto-run block:
   > **Invocation**: Sideways loop triggered by `/validate` failure, `/implement` runtime anomaly, or post-PR regression. Not part of the PIV forward chain.

   Add two new auto-loaded signals:
   - `Backend reference: !test -f .agents/reference/backend.md && cat .agents/reference/backend.md || echo "(no backend reference)"`
   - `Frontend reference: !test -f .agents/reference/frontend.md && cat .agents/reference/frontend.md || echo "(no frontend reference)"`

   Keep the existing 4 auto-run commands (CLAUDE.md head, project structure, recent commits, current branch).

4. **Pre-condition** — add at the top of Phase 1 CLASSIFY:
   > If `$ARGUMENTS` is empty, STOP and reply: "What is the symptom? Paste the error, stack trace, or failing behavior."

5. **Project-specific gotchas** — update the Convention Violations row of the Investigation Techniques table to add:
   > For this project specifically: Express v5 `next(error)` propagation (never `res.status().json()` in catch), SQL.js statements must be freed in `finally { stmt.free() }`, Zod parse MUST run before business logic. See CLAUDE.md → Error Handling + Code Style & Patterns.

6. **QUICK mode clarification** — in "Mode-Specific Behavior", change:
   > Accept high-confidence hypotheses without exhaustive validation
   to:
   > Accept high-confidence hypotheses without exhaustive validation — but still require `file:line` evidence for the final root cause (no speculation, only fewer Whys).

7. **Insert new Phase 5: SYSTEMATIZE** between the current Phase 4 VALIDATE and Phase 5 GENERATE:
   ```
   ## Phase 5: SYSTEMATIZE — Why did the System Allow This?

   Before writing the report, answer in writing:

   1. Which AI-layer artifact SHOULD have prevented this? (Command / CLAUDE.md / On-Demand Context / Plan Template)
   2. Classify the miss:

      | Type | Meaning | Typical Fix |
      |------|---------|-------------|
      | rule-violation | Convention exists in CLAUDE.md but was ignored | Add a check to `/validate` or `/review-pr` |
      | rule-gap | Convention not yet documented | Add to CLAUDE.md §AI Gotchas or §Code Style |
      | context-gap | Needed reference not loaded | Create/expand `.agents/reference/*.md` and reference from `/prime` or `/plan` |
      | process-gap | Validation step missing | Add to `/validate` or `/commit` Phase 1 |

   3. Propose 1–3 concrete edits with: target file, exact change, reason.

   **Rule**: At least one recommendation MUST be produced. If you find "no AI-layer change needed", justify why the existing system already catches this (and verify the verification step in Phase 4 included that check).
   ```

8. **Renumber** the current Phase 5 GENERATE to **Phase 6: GENERATE — Output Report**.

9. **Update `<output>` report template** — insert a new section between `## Fix Specification` and `## Verification`:
   ```markdown
   ## System Evolution

   ### Miss Classification
   - **Type**: rule-violation | rule-gap | context-gap | process-gap
   - **Reasoning**: [why this classification fits]

   ### Recommended AI-Layer Updates

   | Artifact | Change | Why |
   |----------|--------|-----|
   | `path/to/file` | [exact change] | [reasoning — prevention mechanism] |

   ### Prevention Check
   - After these updates, the same symptom would be caught by: [command/step name]
   ```

10. **Update user-facing summary** (at the end of `<output>`) — replace:
    ```
    Next steps:
    - Review evidence chain in report
    - Implement fix per specification
    - Run verification steps
    ```
    with:
    ```
    Next steps:
    1. Review Evidence Chain in report
    2. Implement fix per Fix Specification
    3. Apply AI-layer updates from System Evolution section:
       - rule-gap → append to `CLAUDE.md` §AI Gotchas
       - process-gap → update `/validate` or `/commit`
       - context-gap → create/expand `.agents/reference/*.md`
    4. Run verification steps
    ```
    Add one line above "Next steps":
    ```
    System Evolution: {N} AI-layer update(s) recommended.
    ```

11. **Update `<success_criteria>`** — append two new items:
    - System Evolution section filled with at least one classified recommendation (concept #7)
    - Miss classification is one of: rule-violation, rule-gap, context-gap, process-gap

12. **Do NOT change**:
    - The Test definition
    - QUICK/DEEP dual-mode logic (beyond the evidence clarification)
    - The 5 Whys template or evidence standards table
    - The CAUSATION/NECESSITY/SUFFICIENCY validation table
    - Git History Analysis section
    - The report filename scheme `.agents/rca-reports/rca-report-{N}.md`

Do NOT change any source code. Only modify `.claude/commands/rca.md`.
````

---

## Success Criteria

- [ ] `<objective>` contains explicit "forensic investigator" persona (concept #26)
- [ ] `<context>` declares PIV positioning as a sideways loop triggered by failure (concepts #6, #26)
- [ ] `<context>` auto-loads `.agents/reference/backend.md` and `frontend.md` when present (concept #26)
- [ ] Phase 1 has pre-condition: STOP if `$ARGUMENTS` empty (concept #26)
- [ ] Investigation Techniques table names this project's pitfalls: Express v5 `next(error)`, SQL.js `stmt.free()`, Zod parse order (concept #27)
- [ ] **New Phase 5 SYSTEMATIZE** present with Miss Classification taxonomy (concept #7) — *headline change*
- [ ] Report template includes `## System Evolution` section (Miss Classification + Recommended Updates + Prevention Check) (concepts #7, #28)
- [ ] User-facing summary mentions System Evolution and routes rule-gap → CLAUDE.md, process-gap → validate/commit, context-gap → `.agents/reference/` (concepts #7, #13)
- [ ] `<success_criteria>` includes System Evolution requirement (concept #7)
- [ ] `allowed-tools` tightened: drop shell `grep/find/ls/cat/head`, add `Write`, scope git to specific subcommands (best practice)
- [ ] QUICK mode clarified to still require `file:line` evidence (concept #27)
- [ ] The Test, 5 Whys template, evidence standards, VALIDATE phase, and report file scheme remain unchanged ✅
