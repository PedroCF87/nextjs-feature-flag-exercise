# Phase 3 — Additional Commands: Round 7 — Audit `/review-pr` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/review-pr.md`

**Gold Standard concepts**: #3, #15, #25, #26, #27, #28

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~179
- **Frontmatter**: `allowed-tools: Read, Grep, Glob, Bash(git:*, gh:*, find:*, ls:*)`, `description: Comprehensive code review using specialized agents — reviews PR or local changes`, `argument-hint: [aspects: code|tests|errors|types|comments|simplify|all] [parallel]`
- **Format**: XML-style tags — `<objective>`, `<context>`, `<process>`, `<output>`, `<success_criteria>`
- **Structure**: 5 phases (DETERMINE SCOPE → CONTEXT → LAUNCH REVIEWS → AGGREGATE → REPORT) + separate `<output>` tag

### Current Content Summary
1. **`<objective>`**: Orchestrates multiple specialized agents; aggregates findings into one report
2. **`<context>`**: Auto-loads CLAUDE.md excerpt, changed files (git diff), current branch, PR status (gh CLI)
3. **Phase 1 — DETERMINE SCOPE**: Multi-strategy git diff (unstaged → staged → vs base branch); parses `$ARGUMENTS` for aspects + parallel flag; classifies file types to determine applicable agents
4. **Phase 2 — CONTEXT**: Reads CLAUDE.md; understands the change intent (commit messages, PR description, affected layers)
5. **Phase 3 — LAUNCH REVIEWS**: 6-agent table with applicability conditions; defined sequential order; parallel option; per-agent invocation with diff + CLAUDE.md context
6. **Phase 4 — AGGREGATE**: Severity table (Critical/High/Medium/Low) with criteria and action
7. **Phase 5 — REPORT**: Creates `.agents/reviews/review-{branch}-{date}.md`
8. **`<output>`**: PR Review Summary with severity tables, Strengths, Verdict (APPROVE/NEEDS WORK/CRITICAL ISSUES), next steps

### Strengths Already Present
- **No namespace bug** — correct `/review-pr` invocation (no `pr-review-toolkit:` prefix) ✅
- **Smart file classification** — Phase 1 determines applicable agents by file type ✅
- **Sequential execution order defined** — specific agent order from general to specific ✅
- **Severity criteria table** — Clear criteria for Critical/High/Medium/Low ✅
- **Three-state verdict** — APPROVE / NEEDS WORK / CRITICAL ISSUES ✅
- **Report persisted** to `.agents/reviews/` with branch + date in filename ✅
- **CLAUDE.md loaded** in Phase 2 for project conventions ✅
- **`parallel` flag supported** in `$ARGUMENTS` ✅
- **Re-run instruction** in next steps: "`/review-pr code errors`" ✅

---

## Concept-by-Concept Audit

### Concept #3 — Additional Commands: `/code-review` Purpose
> Perform AI-assisted code review as part of the Validating phase.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Is an Additional command | ✅ Present | Exists as `.claude/commands/review-pr.md` |
| Performs AI-assisted code review | ✅ Present | 6 specialized agents covering all quality dimensions |
| Multiple quality dimensions | ✅ Present | code, tests, errors, types, comments, simplify |
| Conditional application per file type | ✅ Present | Phase 1 classifies files to determine applicable agents |

---

### Concept #15 — Validation Separation (AI Roles)
> AI performs code review; human performs manual testing and final sign-off.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| AI performs code review | ✅ Present | All 6 agents operate autonomously |
| Human validation role acknowledged | ❌ Missing | No statement that human review (business logic, architecture intent) is still needed |
| Role separation framing | ❌ Missing | Not positioned as the AI's code review role in the PIV validation division |
| Complements human review | ❌ Missing | Verdict "APPROVE" could be misread as "merge-ready" — human must still approve |

**Actions:**
- [ ] Add to `<objective>`: "This fulfills the **AI's code review role** in the PIV Loop Validating phase. Human review is still required — especially for business logic correctness, architecture decisions, and intent alignment. AI verdict ≠ merge approval."

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `<context>` auto-loads CLAUDE.md + diff + branch + PR status (strong) — but no persona, no PIV positioning |
| **Process** | ✅ Present | 5 phases with detailed steps and decision logic |
| **Output** | ✅ Present | Dedicated `<output>` tag with severity tables, verdict, next steps |

**Actions:**
- [ ] Add persona to `<objective>`

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, what the agent needs to SEE.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a senior code reviewer..." statement |
| PIV Loop positioning | ❌ Missing | Not framed as the AI Code Review step of the Validating phase |
| Empty diff guard | ⚠️ Partial | Phase 1 tries 3 strategies to find changed files, but no explicit STOP if all return empty |
| CLAUDE.md loading | ✅ Present | Phase 2 explicitly reads CLAUDE.md for conventions |
| `$ARGUMENTS` handling | ✅ Present | Parsed for aspects list + parallel flag |

**Actions:**
- [ ] Add persona: "You are a senior code reviewer orchestrating a multi-agent quality audit. Your goal is to surface all issues — bugs, pattern violations, test gaps, silent failures — before a PR is opened or merged."
- [ ] Add PIV positioning: "This is the **AI Code Review** step of the Validating phase of the PIV Loop."
- [ ] Add empty diff guard in Phase 1: "If all three git diff strategies return empty, STOP: 'No changes detected. Make or stage changes before running `/review-pr`.'"

---

### Concept #27 — Process Section Detail
> Step-by-step, tools per phase, error handling, quality gates.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Numbered/phased steps | ✅ Present | 5 phases with sub-steps |
| File classification logic | ✅ Present | Phase 1 maps file patterns to applicable agents |
| Sequential/parallel choice | ✅ Present | Phase 3 defines both approaches clearly |
| Agent failure fallback | ❌ Missing | No guidance if an agent errors out or produces no output |
| Empty diff guard (explicit STOP) | ❌ Missing | Phase 1 tries multiple strategies but doesn't STOP if all fail |
| Unnecessary Bash aliases | ⚠️ Minor | `Bash(find:*, ls:*)` — covered better by `Glob`, `Grep` |

**Actions:**
- [ ] Add agent failure fallback in Phase 3: "If an agent returns an error or empty output, note it as '[agent]: Unavailable — skipped' and continue with remaining agents."
- [ ] Trim `allowed-tools`: remove `Bash(find:*)`, `Bash(ls:*)`

---

### Concept #28 — Output Section Detail
> Structured, actionable, chainable.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Structured format | ✅ Present | Severity tables with Agent/File:Line/Issue/Recommendation |
| File:line references | ✅ Present | `path:line` format in every table |
| Severity levels | ✅ Present | Critical/High/Medium/Low with criteria |
| Verdict | ✅ Present | APPROVE / NEEDS WORK / CRITICAL ISSUES |
| Chaining to next command | ❌ Missing | "Next steps" re-runs review but doesn't chain to `/commit` or `/create-pr` on APPROVE |
| APPROVE ≠ merge-ready | ❌ Missing | No clarification that APPROVE means "AI found no issues" not "ready to merge without human review" |

**Actions:**
- [ ] Add to Recommended Action, APPROVE path: "If verdict is APPROVE: run `/commit` then `/create-pr` to open the PR for human review."
- [ ] Add qualifier to APPROVE verdict: "(AI found no issues — human review still required)"

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Comprehensive code review using specialized agents — reviews PR or local changes" |
| `argument-hint` | ✅ Good | `[aspects: code\|tests\|errors\|types\|comments\|simplify\|all] [parallel]` — complete |
| `allowed-tools` | ⚠️ Minor | `Bash(find:*, ls:*)` redundant with `Glob`, `Grep` |

---

## Action Plan Summary

### Priority 1 — Add Persona, PIV Positioning, AI Role Separation (concepts #15, #25, #26)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add persona: "Senior code reviewer orchestrating multi-agent quality audit" | #26 |
| 1.2 | Add PIV positioning: "AI Code Review step of the Validating phase" | #3 |
| 1.3 | Add AI role note: "Complements human review — AI verdict ≠ merge approval" | #15 |

### Priority 2 — Add Empty Diff Guard + Agent Fallback (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Add STOP if all diff strategies return empty | #27 |
| 2.2 | Add agent failure fallback: "[agent]: Unavailable — skipped" | #27 |

### Priority 3 — Fix Output Chaining (concept #28)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add to APPROVE path: "run `/commit` then `/create-pr`" | #28 |
| 3.2 | Add APPROVE qualifier: "(AI found no issues — human review still required)" | #15, #28 |

### Priority 4 — Frontmatter Cleanup

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Remove `Bash(find:*)`, `Bash(ls:*)` from `allowed-tools` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — the Gold Standard reference
2. `.claude/commands/review-pr.md` from `nextjs-feature-flag-exercise` — the current command
3. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-7-audit-review-pr.md` — this audit plan

Execute the action plan to rewrite `review-pr.md`:

**Rewrite `.claude/commands/review-pr.md`** with these requirements:

1. **Frontmatter**: Remove `Bash(find:*)` and `Bash(ls:*)` from `allowed-tools`. Keep all other tools and fields unchanged.

2. **Expand `<objective>`** with:
   - Persona: "You are a senior code reviewer orchestrating a multi-agent quality audit. Your goal is to surface all issues — bugs, pattern violations, test gaps, and silent failures — before a PR is opened or merged."
   - PIV positioning: "This is the **AI Code Review** step of the Validating phase of the PIV Loop."
   - Role note: "This command fulfills the AI's code review role. It does NOT replace human review — business logic correctness, architecture decisions, and intent alignment still require human judgment. AI verdict ≠ merge approval."
   - Keep the existing two-sentence purpose description.

3. **Add empty diff guard** at the end of Phase 1 DETERMINE SCOPE (after the three git diff strategies):
   > **If all three strategies return empty**: STOP — "No changes detected. Make or stage changes before running `/review-pr`."

4. **Add agent failure fallback** in Phase 3 LAUNCH REVIEWS, under "For Each Agent":
   > If an agent returns an error or produces no output: note it in the report as "{agent}: Unavailable — skipped" and continue with remaining agents.

5. **Update `<output>` Recommended Action** — add APPROVE path instruction:
   ```markdown
   **If APPROVE**: "(AI found no issues — human review still required)"
   Next steps:
   1. Run `/commit` to create a conventional commit
   2. Run `/create-pr` to open the PR for human review
   ```
   Keep the NEEDS WORK and CRITICAL ISSUES paths unchanged.

6. **Do NOT change** Phase 1 file classification, Phase 2 CONTEXT (CLAUDE.md reading), Phase 3 agent table and execution order, Phase 4 AGGREGATE severity table, Phase 5 REPORT (file path), or `<success_criteria>`.

Do NOT change any source code. Only modify `.claude/commands/review-pr.md`.
````

---

## Success Criteria

- [ ] `allowed-tools` trimmed — `find:*`, `ls:*` removed (best practice)
- [ ] Persona present: "Senior code reviewer orchestrating multi-agent quality audit" (concept #26)
- [ ] PIV positioning: "AI Code Review step of the Validating phase" (concept #3)
- [ ] AI role note: "Does NOT replace human review — AI verdict ≠ merge approval" (concept #15)
- [ ] Empty diff STOP guard added at end of Phase 1 (concept #27)
- [ ] Agent failure fallback: "[agent]: Unavailable — skipped" (concept #27)
- [ ] APPROVE path chains to `/commit` then `/create-pr` (concept #28)
- [ ] APPROVE verdict qualified: "(AI found no issues — human review still required)" (concept #15)
- [ ] Phase 1 file classification unchanged ✅
- [ ] Phase 3 agent table, sequential order, parallel option unchanged ✅
- [ ] Phase 4 severity table (Critical/High/Medium/Low) unchanged ✅
- [ ] Report saved to `.agents/reviews/` unchanged ✅
