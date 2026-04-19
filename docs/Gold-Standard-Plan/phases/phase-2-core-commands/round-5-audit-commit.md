# Phase 2 — Core 4 Commands: Round 5 — Audit `/commit` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/commit.md`
**Gold Standard concepts**: #2, #6, #25, #26, #27, #28, #29
**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Audit Analysis

### Current State
- **Lines**: ~104
- **Frontmatter**: `allowed-tools` scoped to specific git + pnpm commands (not unrestricted Bash), `argument-hint: [files...]`, `description: Validate, stage, and commit with Conventional Commits`
- **Format**: Markdown headers (no XML tags — simpler than prime/plan/implement)
- **Structure**: `## Context` (auto-run git) + 3 phases (VALIDATE → COMPOSE → COMMIT) + `## Output`

### Current Content Summary
1. **`## Context`**: Auto-runs `git status`, `git diff --cached --stat`, `git diff --stat`
2. **Phase 1 — VALIDATE**: Runs the **full project validation suite** before committing (`cd server && pnpm run build && pnpm run lint && pnpm test && cd ../client && pnpm run build && pnpm run lint`) — STOPS on any failure ✅
3. **Phase 2 — COMPOSE**: Determines commit message (from `$ARGUMENTS` or auto-generated), defines types + project-specific scopes, description rules, examples ✅
4. **Phase 3 — COMMIT**: `git add -A` (or files from `$ARGUMENTS`), `git commit -m`, `git log --oneline -1`
5. **`## Output`**: Structured block — hash, message, branch, files count + "Next: git push origin {branch}"

### Strengths Already Present
- **Built-in validation gate** — validates before committing, not just checks (concept #6 partially satisfied in a stronger way than expected)
- **Project-specific commit scopes** — `flags`, `api`, `ui`, `db`, `validation`, `deps`, `ai-layer` (project-aware)
- **Concrete examples** using this project's real patterns (`fix(flags): free SQL.js statement in finally block`)
- **`allowed-tools` scoped** to specific git + pnpm commands — not unrestricted Bash ✅
- **`git log --oneline -1`** confirmation after commit ✅
- **Structured `## Output` section** with hash, message, branch, files count

---

## Concept-by-Concept Audit

### Concept #2 — Core 4: `/commit` Purpose
> Create a conventional commit after validation passes.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Is a Core 4 command | ✅ Present | Exists as `.claude/commands/commit.md` |
| Creates a conventional commit | ✅ Present | Phase 2 defines type + scope + description format with rules and examples |
| Atomic commit (one concern) | ✅ Present | "Create an atomic commit for the current changes" |
| Validation before commit | ✅ Present | Phase 1 runs full suite and STOPS on failure — "Never commit broken code" |

---

### Concept #6 — PIV Loop — Validating Phase
> `/commit` is the final action of the Validating phase — only runs after implementation and validation pass.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Validation gates the commit | ✅ Present | Phase 1 VALIDATE runs full suite and hard-stops on failure — stronger than just checking |
| Positioned in the Validating phase of PIV | ❌ Missing | No mention of PIV Loop or that this is the Validating phase terminal action |
| Chains to `/create-pr` after commit | ❌ Missing | `## Output` says "Next: git push origin {branch}" — references raw git command instead of `/create-pr` |

**Note**: This `commit.md` embeds its own validation (Phase 1) rather than depending on a separate `/validate` run. This is a valid — and arguably stronger — design: the commit is self-contained and can never be accidentally run without validation. The PIV chain is: `/implement` → `/commit` (which internally validates + commits) → `/create-pr`.

**Actions:**
- [ ] Add PIV positioning note: "This is the **Validating phase terminal action** of the PIV Loop — runs after `/implement`, validates the codebase, and chains to `/create-pr`."
- [ ] Change Output "Next" from `git push origin {branch}` to `/create-pr`

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Status | Evidence |
|-------|--------|----------|
| **Input** | ⚠️ Partial | `## Context` auto-loads git state (good); `$ARGUMENTS` used for both files and custom message — but no persona, no PIV positioning, no explicit Input section |
| **Process** | ✅ Present | 3 labeled phases (VALIDATE → COMPOSE → COMMIT) with clear steps |
| **Output** | ✅ Present | `## Output` block with structured format (hash, message, branch, files) |

**Actions:**
- [ ] Add persona to a preamble or convert `## Context` to `## Input` with persona + pre-condition

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, what the agent needs to SEE before acting.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Persona / identity | ❌ Missing | No "You are a disciplined engineer..." statement |
| Pre-condition: `/implement` done | ❌ Missing | No framing that this runs after `/implement` completes |
| PIV positioning | ❌ Missing | Not identified as the Validating phase terminal action |
| Context loading | ✅ Present | `## Context` auto-runs 3 git commands for current state |
| `$ARGUMENTS` dual-use clarity | ⚠️ Partial | `argument-hint: [files...]` suggests files, but Phase 2 says `$ARGUMENTS` can also be a custom message — this dual-use is not explained in the argument-hint |

**Actions:**
- [ ] Add persona: "You are a disciplined engineer maintaining a clean, atomic git history. Each commit is purposeful and self-contained."
- [ ] Add PIV positioning note (see concept #6 actions)
- [ ] Update `argument-hint` to reflect dual use: `[files... | "commit message"]`

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling, sufficient detail.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Step-by-step process | ✅ Present | 3 phases with clear labels |
| Tools specified | ✅ Present | `allowed-tools` scoped; git commands explicit in Phase 3 |
| Error handling: validation failure | ✅ Present | Phase 1 — clear failure message + STOP |
| Staging safety | ⚠️ Risk | `git add -A` stages ALL changes — could include unintended files (config, env, unrelated work). No review step before staging. |
| Commit message review | ⚠️ Partial | Message is generated but not shown to user for confirmation before committing |

**Actions:**
- [ ] Add staging safety step before `git add -A`: "Review `git status` output. If unintended files appear (e.g., `.env`, unrelated modules), stage selectively with `git add <files>` instead of `git add -A`."

---

### Concept #28 — Output Section Detail
> Structured, informative, chainable.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Structured output format | ✅ Present | Hash, message, branch, files count in a labeled block |
| Commit confirmation | ✅ Present | `git log --oneline -1` in Phase 3 feeds the output |
| Next step chainable | ❌ Missing | "Next: git push origin {branch}" references raw git — should reference `/create-pr` |

**Actions:**
- [ ] Change Output "Next" to: "Run `/create-pr` to open a pull request for this branch."

---

### Concept #29 — Command Chaining
> `/commit` receives trigger from `/implement` and chains to `/create-pr`.

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Receives from `/implement` | ⚠️ Partial | Implied (comes after implementation) but not stated |
| Chains to `/create-pr` | ❌ Missing | Output references `git push`, not `/create-pr` |
| PIV chain closure | ❌ Missing | No "PIV Loop complete after PR is opened" signal |

**Actions:**
- [ ] Output next step: "Run `/create-pr` to open a pull request." (see concept #28 actions)

---

### Additional: Frontmatter Quality

| Field | Status | Evidence |
|-------|--------|----------|
| `description` | ✅ Good | "Validate, stage, and commit with Conventional Commits" — clear and specific |
| `argument-hint` | ⚠️ Partial | `[files...]` — doesn't reflect that `$ARGUMENTS` also accepts a custom commit message |
| `allowed-tools` | ✅ Strong | Scoped to exactly the git + pnpm commands needed — best practice already applied |

**Actions:**
- [ ] Update `argument-hint` to: `[files... | "type(scope): description"]`

---

## Action Plan Summary

### Priority 1 — Add Persona + PIV Positioning (concepts #6, #25, #26)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Add persona: "Disciplined engineer maintaining a clean, atomic git history" | #26 |
| 1.2 | Add PIV positioning: "Validating phase terminal action — runs after `/implement`, chains to `/create-pr`" | #6 |

### Priority 2 — Fix Output Chaining (concepts #28, #29)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | Change "Next: git push origin {branch}" → "Run `/create-pr` to open a pull request" | #28, #29 |

### Priority 3 — Add Staging Safety (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | Add review step before `git add -A`: check for unintended files, stage selectively if needed | #27 |

### Priority 4 — Frontmatter

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Update `argument-hint`: `[files... \| "type(scope): description"]` | Best practice |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — the Gold Standard reference
2. `.claude/commands/commit.md` from `nextjs-feature-flag-exercise` — the current command
3. `docs/Gold-Standard-Plan/phases/phase-2-core-commands/round-5-audit-commit.md` — this audit plan

Execute the action plan to rewrite `commit.md`:

**Rewrite `.claude/commands/commit.md`** with these requirements:

1. **Frontmatter**:
   - Update `argument-hint` to: `[files... | "type(scope): description"]`
   - Keep `allowed-tools` and `description` unchanged — they are correct.

2. **Add a preamble** (one line, before `## Context`):
   > This is the **Validating phase terminal action** of the PIV Loop — runs after `/implement`, validates the codebase, and chains to `/create-pr`.

3. **Rename `## Context` to `## Input`** and expand:
   - Add persona: "You are a disciplined engineer maintaining a clean, atomic git history. Each commit is purposeful and self-contained."
   - Keep the three existing auto-run git commands (`!git status --porcelain`, `!git diff --cached --stat`, `!git diff --stat`) as a "Current State" subsection
   - Add `$ARGUMENTS` declaration: "Optional: files to stage, or a custom commit message in Conventional Commits format. If empty, stage all relevant changes and auto-generate the message."

4. **Add staging safety step** at the start of Phase 3 COMMIT (before `git add -A`):
   > **Review before staging**: Scan `git status` output. If unintended files appear (`.env`, unrelated configs, work-in-progress), stage selectively:
   > ```bash
   > git add <specific-files>
   > ```
   > Only use `git add -A` when all shown changes are intentional.

5. **Update `## Output`** — change the "Next" line:
   - Remove: `Next: git push origin {branch}`
   - Add:
     ```
     Next: Run /create-pr to open a pull request for this branch.
     ```

6. **Do NOT change** Phase 1 VALIDATE (validation commands, failure message, STOP), Phase 2 COMPOSE (message format, types, scopes table, description rules, examples), or the `git commit` / `git log` commands in Phase 3.

Do NOT change any source code. Only modify `.claude/commands/commit.md`.
````

---

## Success Criteria

- [ ] Preamble present: "Validating phase terminal action — runs after `/implement`, chains to `/create-pr`" (concept #6)
- [ ] `## Context` expanded to `## Input` with persona and `$ARGUMENTS` declaration (concepts #25, #26)
- [ ] Persona: "Disciplined engineer maintaining clean, atomic git history" (concept #26)
- [ ] Staging safety review step added before `git add -A` (concept #27)
- [ ] Output "Next" updated to reference `/create-pr` instead of `git push` (concepts #28, #29)
- [ ] `argument-hint` updated to reflect dual use: files or commit message (best practice)
- [ ] Phase 1 VALIDATE unchanged — full suite runs and hard-stops on failure ✅
- [ ] Phase 2 COMPOSE unchanged — project-specific scopes and examples preserved ✅
- [ ] `allowed-tools` unchanged — already correctly scoped ✅
