# Phase 6 — Gap Analysis: Round 24 — Command Chaining Audit (PIV Loop)

**Scope**: All 14 `.claude/commands/*.md` against the PIV Loop chain and sideways loops
**Gold Standard concepts**: #6 (PIV Loop), #29 (Command Chaining)
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Analysis

### Discovery Context

This round audits the **command-to-command handoffs** across the entire AI layer. Unlike Rounds 1–23 which audit individual artifacts, Round 24 looks at the system as a whole: does the output of each command match the input expectation of the next? Are the "Next:" hints correct? Are sideways loops formally wired?

**Key finding**: The chain is complete conceptually but has **5 broken or missing links** in the actual command files. The most critical (Priority 1) is the `/commit → /create-pr` broken link — this gap means the PIV Loop cannot close without a user manually knowing to run `/create-pr`.

### Current State of Each Command's "Next:" Line

Auditing the terminal output / chain hints of all 14 commands as they exist TODAY (before any Round audits are applied):

| Command | Current terminal chain hint | Status |
|---------|-----------------------------|--------|
| `/prime` | None — implicit "now you're ready to work" | ⚠️ Partial |
| `/prd-interactive` | Phase 5: "2. Create implementation plan: `/plan .agents/PRDs/{filename}`" | ✅ Present |
| `/create-stories` | None (before Round 14) | ❌ Missing |
| `/plan` | `<success_criteria>` implies chain to `/implement` | ⚠️ Implicit |
| `/implement` | Terminal report: "Next: /commit" | ✅ Present |
| `/validate` | On failure: no suggestion — user stranded | ❌ Missing |
| `/review-pr` | APPROVE/NEEDS WORK/CRITICAL ISSUES verdict — no next command | ⚠️ Partial |
| `/commit` | `## Output` line 102: `Next: git push origin {branch}` | ❌ **Wrong** |
| `/create-pr` | **Does not exist** — Round 8 must create | ❌ Missing |
| `/rca` | Next steps: "Review evidence chain, Implement fix, Run verification" — no command names | ⚠️ Partial |
| `/security-review` | Per Round 10 plan: verdict + "Next: /commit" (if no critical) | ✅ Per plan |
| `/create-rules` | Phase 4: next steps chain to `/validate` and `/commit` | ✅ Per Round 11 plan |
| `/create-command` | Per Round 12 plan: "Test it now: /{command-name} {args}" → `/commit` | ✅ Per plan |
| `/check-ignores` | No chain hint (before Round 15) | ❌ Missing |

### The Full PIV Loop Architecture

```
User intent
    │
    ▼
/prime ──────────────────────────────────── PIV: Orientation (always)
    │
    ├─ (new feature) ──────────────────────── PIV: Planning — Product Layer
    │   │
    │   ▼
    │   /prd-interactive  →  .agents/PRDs/{name}.prd.md
    │       │
    │       ├─ (large feature)
    │       │   ▼
    │       │   /create-stories  →  .agents/stories/{name}-stories.md
    │       │       │
    │       │       └──▶ /plan (per unblocked story)
    │       │
    │       └─ (small feature — skip stories)
    │           ▼
    │           /plan
    │
    ├─ (existing feature or skip PRD)
    │   ▼
    │   /plan ───────────────────────────── PIV: Planning — Task Layer
    │       │
    │       ▼
    │       /plan output: .agents/plans/{name}.plan.md
    │
    ▼
/implement <plan.md> ───────────────────── PIV: Implementing
    │
    ├─ (optional — before commit)
    │   ▼
    │   /review-pr  ────────────────────── PIV: Validating — AI triage
    │       │
    │       ├─ (security-sensitive surfaces)
    │       │   ▼
    │       │   /security-review  ────────── PIV: Validating — Security
    │       │       │
    │       │       ▼ (if Critical findings)
    │       │       BLOCK — fix before /commit
    │       │
    │       └─ (no critical issues)
    │           ▼
    │           (back to /commit)
    │
    ▼
/validate ──────────────────────────────── PIV: Validating — Automated
    │
    ├─ (failure — unclear cause) ──────────── SIDEWAYS: /rca
    │
    └─ (pass)
        ▼
        /commit ────────────────────────── PIV: Validating — Commit
            │
            ▼
            /create-pr ─────────────────── PIV: Validating — Terminal
                │
                ▼
                Human review ── (merge or request changes)

─────────────────────────────────────────────────────────────
SIDEWAYS LOOPS (invoked on failure or special condition):

/rca <symptom>          ← from /validate fail, /implement anomaly, post-PR incident
/security-review        ← from /review-pr when sensitive surfaces change
/check-ignores          ← on-demand hygiene (not in forward chain)
/create-rules           ← when CLAUDE.md needs update (not in forward chain)
/create-command         ← when a new command is needed (not in forward chain)
```

---

## Concept-by-Concept Audit

### Concept #6 — PIV Loop

> Gold Standard §6: The PIV Loop (Planning → Implementing → Validating) is the core workflow. Each phase has a defined entry and exit. The chain must be explicit and unambiguous at each handoff.

| PIV Phase | Commands | Entry Condition | Exit Condition | Status |
|-----------|----------|-----------------|----------------|--------|
| **Planning** | `/prime`, `/prd-interactive`, `/create-stories`, `/plan` | User intent or PRD exists | `.agents/plans/{name}.plan.md` exists | ✅ Defined |
| **Implementing** | `/implement` | Plan file path as `$ARGUMENTS` | Code changes + completion report | ✅ Defined |
| **Validating** | `/validate`, `/review-pr`, `/security-review`, `/commit`, `/create-pr` | Code changes exist (staged/unstaged) | PR URL returned + "PIV Loop complete" message | ⚠️ Partially broken (see Link 1 below) |

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Each phase has a named terminal action | ✅ Present | Planning → `/plan`, Implementing → `/implement`, Validating → `/commit` then `/create-pr` |
| Phase transitions are explicit in command output | ⚠️ Partial | `/implement` says "Next: /commit" ✅; `/commit` says "Next: git push" ❌ (wrong); no command names the phase it's in |
| "PIV Loop complete" signal exists | ❌ Missing | `/create-pr` (when created) will say "PIV Loop complete"; currently no command closes the loop |
| Sideways loops have named entry conditions | ⚠️ Partial | `/rca` positioning defined in Round 9; `/security-review` positioning in Round 10; `/validate` → `/rca` link not wired |
| PIV chain visible in CLAUDE.md | ❌ Missing | CLAUDE.md has no Workflow/PIV Loop section |

**Actions:**
- [ ] Add `## Workflow / PIV Loop` section to CLAUDE.md with the ASCII chain diagram above and sideways loop trigger conditions
- [ ] Each command's Output should name its PIV phase: "You are in the **Validating phase**. Next: `/create-pr`"

---

### Concept #29 — Command Chaining

> Gold Standard §29: Every command except the terminal one should name its next command explicitly in its Output section. The chain should be: `/prime` → `/plan` → `/implement` → `/commit` → `/create-pr`. Each command's output is the next command's input.

| Handoff | Expected "Next:" | Actual "Next:" | Status |
|---------|-----------------|----------------|--------|
| `/prime → /plan` | "Run `/plan <feature-description>`" | None — implicit | ⚠️ Missing explicit hint |
| `/prd-interactive → /create-stories` or `/plan` | "Run `/create-stories .agents/PRDs/{name}` or go directly to `/plan`" | Present per Round 13 | ✅ |
| `/create-stories → /plan` | "Run `/plan` with first unblocked story" | Added by Round 14, fragment issue | ⚠️ Fragment syntax broken |
| `/plan → /implement` | "Run `/implement .agents/plans/{name}.plan.md`" | Implied in success criteria | ⚠️ Not explicit in Output section |
| `/implement → /review-pr` (optional) | "Optionally: `/review-pr` before committing" | Not present | ❌ Missing |
| `/implement → /commit` | "Run `/commit`" | "Next: /commit" | ✅ |
| `/validate → /rca` (on failure) | "Failure unclear? `/rca '<symptom>'`" | Not present | ❌ Missing |
| `/review-pr → /security-review` (on security cue) | "Security-sensitive files detected: run `/security-review`" | Not present | ❌ Missing |
| `/commit → /create-pr` | "Run `/create-pr` to open a pull request" | "Next: git push origin {branch}" | ❌ **Wrong — critical** |
| `/create-pr → Human review` | "PIV Loop complete. PR open for human review." | Not present (file missing) | ❌ Missing (file doesn't exist) |

---

## Gap-by-Gap Analysis

### Gap 1 — Forward Chain: `/commit → /create-pr` (Priority 1 — BLOCKER)

**Why it's a blocker**: This is the only break in the forward PIV chain that prevents the loop from closing. All other forward links either exist or have implicit workarounds.

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| `/commit` Output "Next:" | `Next: git push origin {branch}` (line 102 of commit.md) | `Next: Run /create-pr to open a pull request for this branch.` |
| `/create-pr.md` | **Does not exist** | Must be created per Round 8 execution prompt |
| Dependency order | Round 8 must land BEFORE Round 5 can be finalized | Round 8 creates the file; Round 5 changes the chain hint |
| Impact if not fixed | Users manually run `git push` and open PRs manually; PIV chain ends at git push | PIV chain closes with PR creation; human review starts cleanly |

**Exact change required in `commit.md`**:
```
# Current (line 102 of commit.md Output section):
Next: git push origin {branch}

# Required:
Next: Run /create-pr to open a pull request for this branch.
```

---

### Gap 2 — Sideways Loop: `/validate` failure → `/rca` (Priority 2)

**Why it matters**: When `pnpm run build` or `pnpm test` fails, the user stares at a test failure output with no guidance. `/rca` exists specifically for non-obvious failures. The connection is conceptually documented in Round 9 but never wired into `/validate`'s output.

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| `/validate` on failure | Reports failure + STOP | Reports failure + suggests `/rca` |
| Which failure triggers `/rca` | N/A — no trigger | Any failure where the cause is not immediately obvious from the output |
| What the user receives | Raw pnpm error output | Error output + "Failure unclear? Run: `/rca '<first failing test>'`" |

**Exact addition to `/validate` terminal output on failure**:
```markdown
# Add after the failure block in /validate's Output:

**Next step if failure is unclear**:
Run: `/rca "<paste the first failing test or error message here>"`
The /rca command will identify the root cause and recommend a fix.
```

---

### Gap 3 — Sideways Loop: `/implement` → `/review-pr` (Optional hint missing) (Priority 2)

**Why it matters**: `/implement` correctly chains to `/commit`. But the PIV Validating phase benefits from an AI pre-review before committing. The step is optional — small changes may not need it — but the option should be surfaced.

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| `/implement` terminal output | "Next: /commit" | "Next: (Optional) `/review-pr` for AI pre-review triage, then `/commit`" |
| Trigger for `/review-pr` | Unknown to user | Present in the terminal hint as an optional step |
| When to skip `/review-pr` | User judgment | Small changes, config-only changes; large feature implementations should always run it |

**Exact change to `/implement` terminal output**:
```markdown
# Current:
Next: /commit

# Required:
Next steps:
- (Optional) `/review-pr` — AI pre-review triage for significant code changes
- `/commit` — validate, stage, and commit
```

---

### Gap 4 — Sideways Loop: `/review-pr` → `/security-review` (Recommended hint missing) (Priority 2)

**Why it matters**: `/review-pr` runs multiple agents but doesn't explicitly escalate to `/security-review` when security-sensitive surfaces change. The relationship is documented in Round 10 but not wired into `/review-pr`'s output.

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| `/review-pr` on security-sensitive changes | Reports findings; no escalation | Reports findings + "Security-sensitive files detected: run `/security-review` before `/commit`" |
| What triggers the suggestion | N/A | Changes to: auth routes, SQL queries, secrets handling, file paths with user input, `@ts-ignore` near DB code |
| Severity threshold | N/A | Any security-cue file in the diff → suggest `/security-review` |

**Exact addition to `/review-pr` report template**:
```markdown
# Add to the report template in /review-pr's output, after the verdict section:

**Security-sensitive files detected** (if applicable):
Files in the diff that touch auth / SQL / secrets / input handling:
- {list if present}

Recommendation: Run `/security-review` for these files before `/commit`.
(If no security-sensitive files are in the diff: omit this block entirely.)
```

---

### Gap 5 — Forward Chain: `/create-stories → /plan` Fragment Syntax (Priority 3)

**Why it matters**: Round 14's terminal summary suggests `/plan .agents/stories/{name}-stories.md#S-01` — but `/plan` doesn't parse `#fragment` syntax. This is a data-format incompatibility between two adjacent commands.

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| `/create-stories` "Next:" hint | `/plan .agents/stories/{prd-name}-stories.md#S-01` (added in Round 14) | Either (a) `/plan` parses fragments OR (b) hint uses story title instead |
| `/plan` input parsing | Accepts a file path or story description as `$ARGUMENTS` | Does not parse `#S-01` fragments from a multi-story file |

**Resolution options** (must choose one):

**Option A — Extend `/plan` to parse `#S-nn` fragments** (more powerful, more work):
- In `/plan` Phase 1, detect if `$ARGUMENTS` contains `#S-` suffix
- Extract: (a) the file path before `#`, and (b) the story ID after `#`
- Read only the matching story section from the stories file
- Pro: preserves the `#S-01` reference syntax; Con: requires changing `/plan`

**Option B — Change `/create-stories` hint to use story title** (simpler, less work):
- Replace: `/plan .agents/stories/{prd-name}-stories.md#S-01`
- With: `/plan "<Title-of-first-unblocked-story>"` (user types the story's title, or agent uses `get count` to find S-01's title)
- Pro: no `/plan` change needed; Con: user must look up the story title manually

**Recommended**: Option B — simpler and avoids a side effect where `/plan` changes might break existing invocations. `/create-stories`'s terminal summary is easier to change than `/plan`'s parsing.

**Exact change to `/create-stories` terminal "Next Steps"**:
```markdown
# Current (Round 14 proposal):
Plan it: `/plan .agents/stories/{prd-name}-stories.md#S-01`

# Required (Option B):
Plan it: `/plan "<Title from S-01>"` — replace with the exact title from the first unblocked story.
OR: `/plan .agents/stories/{prd-name}-stories.md` — `/plan` will ask which story to plan.
```

---

### Gap 6 — Missing Chain Hint: `/prime → /plan` (Priority 4)

**Why it matters**: `/prime` loads project context but doesn't tell the user what to do next. Users who run `/prime` and then wonder "now what?" have no guidance.

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| `/prime` terminal output | Reports what was loaded | Reports what was loaded + "Ready to plan: `/plan <feature-description>` or `/prd-interactive` for a new feature" |

**Exact addition to `/prime` terminal output**:
```markdown
# Add at the end of /prime's Output section:

Context loaded. Ready to work. Next:
- New feature: `/prd-interactive` or `/plan <feature-description>`
- Existing task: `/plan <story-or-description>`
- Bug investigation: `/rca <symptom>`
```

---

### Gap 7 — Missing Chain Hint: `/plan` → `/implement` (Priority 4)

**Why it matters**: `/plan` produces a `.plan.md` file and displays the plan — but doesn't explicitly tell the user the next step is `/implement <path>`. The path to the plan file is in the output but the next command name is not.

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| `/plan` terminal output | Displays plan content + success | Displays plan + "Implement: `/implement .agents/plans/{name}.plan.md`" |

**Exact addition to `/plan` terminal output**:
```markdown
# Add to /plan's Output section:

Plan saved: .agents/plans/{name}.plan.md
Next: `/implement .agents/plans/{name}.plan.md`
```

---

### Gap 8 — Missing PIV Loop in CLAUDE.md (Priority 4)

**Why it matters**: CLAUDE.md is loaded at every session start. An agent arriving fresh has no mental model of the PIV Loop workflow unless they read every command file. A "Workflow / PIV Loop" section in CLAUDE.md would give every session the chain overview.

| Aspect | Current State | Required State |
|--------|--------------|----------------|
| CLAUDE.md §Workflow | None | `## Workflow / PIV Loop` section with ASCII diagram + sideways triggers |
| Agent sessions | Must infer chain from individual commands | Primed with the chain topology from session start |

---

## Output-Format Compatibility Matrix

For each adjacent pair, verify: upstream's Output fields → downstream's Input requirements.

| Pair | Upstream Output | Downstream Input Required | Fields Match? | Gap |
|------|-----------------|--------------------------|---------------|-----|
| `/prime → /plan` | Loaded context (in session memory) | `$ARGUMENTS` = feature description | ✅ Context in memory; args from user | No gap |
| `/prd-interactive → /create-stories` | `.agents/PRDs/{name}.prd.md` — Problem, MVP, Phases | PRD file path; must have Problem + MVP + Phases | ✅ PRD template satisfies all requirements | No gap |
| `/prd-interactive → /plan` (skip stories) | Same `.prd.md` | PRD or story path as `$ARGUMENTS` | ✅ PRD path passed directly | No gap |
| `/create-stories → /plan` | `.agents/stories/{name}-stories.md` — S-01..N with Title, AC, Labels, Context-to-load | Story title or file path | ⚠️ Fragment syntax (`#S-01`) not parseable by `/plan` | **Link 5** |
| `/plan → /implement` | `.agents/plans/{name}.plan.md` — Goal, Tasks, Validation, Structure | Plan file path as `$ARGUMENTS` | ✅ File path passes cleanly | No gap |
| `/implement → /validate` | Code changes (staged/unstaged) | No `$ARGUMENTS` — runs the suite regardless | ✅ `/validate` is scope-agnostic | No gap |
| `/validate → /commit` | Suite results (pass/fail) | Code in working state; `/commit` runs its own validation | ✅ `/commit` Phase 1 re-runs the suite | No gap |
| `/implement → /commit` (skip validate) | Code changes | Same as above | ✅ `/commit` validates internally | No gap |
| `/implement → /review-pr` (optional) | Code changes | Changed files from `git diff` | ✅ `/review-pr` loads diff automatically | No gap (just missing hint) |
| `/commit → /create-pr` | Commit hash + branch name | `$ARGUMENTS` = base branch (default: `exercise-1`); git state auto-loaded | ✅ Data-compatible once file exists | **Link 1** — file missing, hint wrong |
| `/review-pr → /security-review` | Changed file list + findings | `$ARGUMENTS` = files to review | ✅ `/review-pr` output lists changed files | No gap (just missing hint) |
| `/create-pr → Human review` | PR URL | N/A — human reads PR | ✅ | No gap |

---

## Sideways Loop Wiring Audit

### Currently Wired (by Round audit plans)
| Sideways loop | Trigger | Wired in |
|---------------|---------|----------|
| `/validate` fail → `/rca` | Suite failure | Round 9 plan (but not yet in `/validate`'s output) |
| `/security-review` Critical → block `/commit` | Critical finding | Round 10 plan |
| `/security-review` → `/rca` | Non-obvious finding | Round 10 plan |
| `/rca` rule-gap → `/create-rules` | System Evolution recommendation | Round 9 plan |
| `/rca` rule-gap → CLAUDE.md §AI Gotchas | Recurring pattern | Round 9 plan |

### Not Yet Wired
| Sideways loop | Missing link | Proposed fix |
|---------------|-------------|--------------|
| `/implement` → `/review-pr` (optional) | `/implement` doesn't mention it | Add optional hint to `/implement` Output |
| `/validate` fail → `/rca` | `/validate` doesn't suggest it on failure | Add to `/validate` Output's failure path |
| `/review-pr` → `/security-review` | `/review-pr` doesn't escalate | Add conditional security-cue escalation to `/review-pr` report template |
| Post-merge → `/check-ignores` | No command suggests hygiene audits | Optional: add to CLAUDE.md §Workflow/PIV Loop as "periodic hygiene" |

---

## Action Plan

### Priority 1 — Land the Broken `/commit → /create-pr` Link (BLOCKER)

| # | Action | Files to Change | Round Dependency |
|---|--------|-----------------|-----------------|
| 1.1 | Execute Round 8 prompt — create `.claude/commands/create-pr.md` | New file | None |
| 1.2 | Execute Round 5 prompt — change `/commit` Output "Next: git push" → "Next: /create-pr" | `commit.md` line 102 | Round 8 must exist first |
| 1.3 | Verify end-to-end: `/implement → /commit → /create-pr` produces a PR without manual steps | Manual test | Both 1.1 and 1.2 |

### Priority 2 — Wire Sideways Loops

| # | Action | Files to Change | Specific Line/Section |
|---|--------|-----------------|----------------------|
| 2.1 | `/validate` failure → suggest `/rca` | `validate.md` | Add to failure-output path in terminal summary |
| 2.2 | `/implement` → optionally suggest `/review-pr` | `implement.md` | Change "Next: /commit" to "Next: (Optional) /review-pr → /commit" |
| 2.3 | `/review-pr` → escalate to `/security-review` on security cue | `review-pr.md` | Add conditional block to report template |

### Priority 3 — Fix Fragment Syntax Incompatibility

| # | Action | Files to Change | Resolution |
|---|--------|-----------------|-----------|
| 3.1 | Update `/create-stories` "Next Steps" — remove `#S-01` fragment syntax | `create-stories.md` | Use story title instead; or suggest user opens stories file |
| 3.2 | (Optional) Extend `/plan` to detect and parse `#S-nn` fragments | `plan.md` Phase 1 | Only if Option A chosen |

### Priority 4 — Explicit Chain Hints (Missing)

| # | Action | Files to Change | What to Add |
|---|--------|-----------------|------------|
| 4.1 | `/prime` Output → chain hint | `prime.md` | "Next: `/plan <feature>` or `/prd-interactive`" |
| 4.2 | `/plan` Output → chain hint | `plan.md` | "Next: `/implement .agents/plans/{name}.plan.md`" |
| 4.3 | `/check-ignores` Output → chain hint | `check-ignores.md` | "After cleanup: `/validate`" |
| 4.4 | CLAUDE.md → `## Workflow / PIV Loop` section | `CLAUDE.md` | ASCII diagram + sideways triggers |

---

## Execution Prompt (orchestration across Rounds)

````
This Round does not have a single rewrite — it orchestrates fixes across Rounds 3–8, 14, and CLAUDE.md.
The changes are ordered by dependency: a downstream command cannot reference an upstream that doesn't exist yet.

**Execute in this exact order:**

---

### Step 1 — Create `/create-pr.md` (Round 8 — no dependencies)

Read and execute the Execution Prompt from:
`docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-8-audit-create-pr.md`

This creates `.claude/commands/create-pr.md` as a new file. No other command depends on this existing BEFORE this step.

---

### Step 2 — Fix `/commit`'s "Next:" line (Round 5 — depends on Step 1)

Open `.claude/commands/commit.md`. Find the `## Output` section. Find the line:
```
Next: git push origin {branch}
```
Replace with:
```
Next: Run /create-pr to open a pull request for this branch.
```

This is the critical Link 1 fix. The `/create-pr.md` file must exist (Step 1) before this makes semantic sense.

---

### Step 3 — Wire `/validate` failure → `/rca` (Round 6 addendum)

Open `.claude/commands/validate.md`. Find the failure-output section in `<output>` or the terminal summary.

After the failure report block (where failing tests are listed), add:

```markdown
**If the failure cause is not obvious from the output above:**
Run: `/rca "<paste the first failing test name or error message here>"`
The /rca command will identify the root cause using the 5-Whys method and recommend a fix.
```

---

### Step 4 — Wire `/implement` → optional `/review-pr` (Round 4 addendum)

Open `.claude/commands/implement.md`. Find the terminal Output section — the part that says "Next: /commit".

Replace:
```
Next: /commit
```

With:
```
Next steps:
- (Optional) `/review-pr` — run AI pre-review triage before committing, especially for significant code changes
- `/commit` — validate, stage, and commit with Conventional Commits format
```

---

### Step 5 — Wire `/review-pr` → `/security-review` (Round 7 addendum)

Open `.claude/commands/review-pr.md`. Find the report template in `<output>` — specifically the section after the verdict (APPROVE/NEEDS WORK/CRITICAL ISSUES).

Add a conditional security-escalation block at the end of the report template:

```markdown
**Security Escalation** (include only if applicable):
If any changed file touches: auth, SQL queries, user-input handling, secrets, or file paths:
- Files identified: {list}
- Recommendation: run `/security-review` on these files before `/commit`.
  `/security-review` performs OWASP Top 10 analysis adapted to this project's stack.
(Omit this section entirely if no security-sensitive files are in the diff.)
```

---

### Step 6 — Fix `/create-stories` → `/plan` fragment syntax (Round 14 fix)

Open `.claude/commands/create-stories.md`. Find the terminal `<output>` block — specifically the "Next steps" section that was added by Round 14.

Find the line:
```
Plan it: `/plan .agents/stories/{prd-name}-stories.md#S-01`
```

Replace with:
```
Plan it:
- Read `.agents/stories/{prd-name}-stories.md` and find the first unblocked story (no "Blocked by" entries).
- Run: `/plan "<exact title of that story>"` — replacing with the title from the S-01 entry.
- OR: `/plan .agents/stories/{prd-name}-stories.md` — /plan will ask which story to plan.
```

---

### Step 7 — Add explicit chain hints to `/prime` and `/plan`

**`/prime`**: Open `.claude/commands/prime.md`. Find the terminal Output section. Append:

```markdown
Context loaded. Ready to work.

**Next:**
- New feature from scratch: `/prd-interactive`
- Known task or story: `/plan <feature-description>`
- Bug investigation: `/rca <symptom>`
- Code review after implementation: `/review-pr`
```

**`/plan`**: Open `.claude/commands/plan.md`. Find the terminal Output section. Append:

```markdown
Plan saved: `.agents/plans/{name}.plan.md`

**Next:** `/implement .agents/plans/{name}.plan.md`
```

---

### Step 8 — Add `## Workflow / PIV Loop` to CLAUDE.md

Open `CLAUDE.md`. Find a suitable location (after §Architecture, before §Code Style & Patterns).

Add the following new section:

```markdown
## Workflow / PIV Loop

The AI layer follows the PIV Loop: Planning → Implementing → Validating.

```
/prime → /plan → /implement → /commit → /create-pr → Human review
            ↑                     ↑
     /prd-interactive       /validate (optional)
     /create-stories        /review-pr (optional)
```

**Planning phase**: `/prime` (orient) → `/prd-interactive` (define feature, optional) → `/create-stories` (decompose, optional) → `/plan` (task plan)

**Implementing phase**: `/implement <plan-file>`

**Validating phase**: `/validate` → `/review-pr` (optional) → `/commit` → `/create-pr`

**Sideways loops** (invoked on failure or special condition):
- `/rca <symptom>` — root cause analysis when a failure is non-obvious
- `/security-review` — OWASP security review when sensitive surfaces change
- `/check-ignores` — audit suppression comments (on-demand)
- `/create-rules` — regenerate CLAUDE.md from codebase analysis (on-demand)
```

---

Do NOT change any source code. Only AI-layer files (`.claude/commands/*.md` and `CLAUDE.md`).
````

---

## Verification Plan

After all 8 steps above are executed, verify the chain end-to-end:

### Forward Chain Test (manual dry-run)

| Step | Command | Expected Output |
|------|---------|-----------------|
| 1 | `/prime` | Context loaded + "Next: /plan or /prd-interactive" |
| 2 | `/plan "Add feature X"` | `.agents/plans/feature-x.plan.md` created + "Next: /implement .agents/plans/feature-x.plan.md" |
| 3 | `/implement .agents/plans/feature-x.plan.md` | Code changes + "Next: (Optional) /review-pr → /commit" |
| 4 | `/review-pr` (optional) | Findings report + (if security files) "Security Escalation: run /security-review" |
| 5 | `/commit` | Commit hash + "Next: Run /create-pr to open a pull request" |
| 6 | `/create-pr` | PR URL + "PIV Loop complete. PR open for human review." |

### Sideways Loop Test

| Trigger | Command | Expected Response |
|---------|---------|-------------------|
| Build fails in `/validate` | `/validate` | Failure output + "Failure unclear? Run: `/rca '<error>'`" |
| Security-sensitive files in `/review-pr` | `/review-pr` | Findings + "Security Escalation: run `/security-review`" |
| `/security-review` Critical finding | `/security-review` | "FAIL — Critical findings. Fix before `/commit`." |

---

## Success Criteria

- [ ] `.claude/commands/create-pr.md` created (Round 8 landed) — chain can now close (concept #6 terminal step)
- [ ] `/commit`'s `## Output` "Next:" line changed from `git push origin {branch}` to `Run /create-pr to open a pull request` (concept #29 — Link 1 fixed, **CRITICAL**)
- [ ] `/validate` failure output includes: "Failure unclear? Run `/rca '<symptom>'`" (concept #29 — sideways loop wired)
- [ ] `/implement` Output "Next:" changed to offer optional `/review-pr` before `/commit` (concept #29)
- [ ] `/review-pr` report template includes conditional "Security Escalation" block when security-sensitive files detected (concept #29)
- [ ] `/create-stories` "Next Steps" removes `#S-01` fragment syntax; uses story title pattern instead (compatibility fix — Link 5)
- [ ] `/prime` Output adds chain hint: "Next: `/plan <feature>` or `/prd-interactive`" (concept #29 — Link 6)
- [ ] `/plan` Output adds chain hint: "Next: `/implement .agents/plans/{name}.plan.md`" (concept #29 — Link 7)
- [ ] `CLAUDE.md` has new `## Workflow / PIV Loop` section with ASCII diagram + 3 phase descriptions + sideways loop triggers (concept #6)
- [ ] All forward chain handoffs verified compatible in Output-Format Compatibility Matrix (concepts #6, #29)
- [ ] End-to-end forward chain test passes: `/prime → /plan → /implement → /commit → /create-pr → PR URL` with no manual intervention needed
- [ ] Sideways loop test passes: `/validate` fail → `/rca` suggestion; `/review-pr` security cue → `/security-review` suggestion; `/security-review` Critical → FAIL verdict
- [ ] Code fence conflict resolved — Execution Prompt uses 4-backtick outer block (````); all inner code examples use 3-backtick blocks (```) ✅
