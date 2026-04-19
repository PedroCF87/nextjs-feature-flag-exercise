# Phase 3 — Additional Commands: Round 8 — Create `/create-pr` Command

**Target file**: `nextjs-feature-flag-exercise/.claude/commands/create-pr.md` *(does NOT exist — must be created)*

**Baseline reference**: `nextjs-ai-optimized-codebase/.claude/commands/create-pr.md` *(~61 lines, XML-style)*

**Gold Standard concepts**: #2, #6, #25, #26, #27, #28, #29

**Reference**: `docs/Gold-Standard-Plan/my-gold-standard.md`

---

## Pre-Creation Analysis

### Current State
- **File**: Missing from `nextjs-feature-flag-exercise/.claude/commands/`
- **Impact**: The PIV Loop has no terminal step — `/commit` currently ends with `Next: git push origin {branch}` (Round 5 already flagged this), with no command to chain to afterward.
- **Blocker**: Without `/create-pr`, the Validating phase of PIV cannot close properly and the workflow ends at a raw git push.

### Baseline Reference Summary (`nextjs-ai-optimized-codebase/.claude/commands/create-pr.md`)
1. **Frontmatter**: `description`, `argument-hint: [base-branch]` — no `allowed-tools`
2. **`<objective>`**: Accepts `${ARGUMENTS:-main}` as base branch; 2-sentence purpose
3. **`<context>`**: Auto-runs 5 git commands (branch, upstream, commits, unpushed status, changed files)
4. **`<process>`**: 5 steps — VERIFY → ANALYZE → GENERATE → CREATE (`gh pr create`) → REPORT URL
5. **`<success_criteria>`**: 4 checklist items

### Format Decision
Use **XML-style tags** (`<objective>`, `<context>`, `<process>`, `<output>`, `<success_criteria>`) — this matches the dominant convention already in this project's commands ([prime.md](.claude/commands/prime.md), [plan.md](.claude/commands/plan.md), [implement.md](.claude/commands/implement.md), [validate.md](.claude/commands/validate.md), [review-pr.md](.claude/commands/review-pr.md)). Only [commit.md](.claude/commands/commit.md) uses markdown headers, and that is the outlier.

### Project-Specific Constraints
- **Branch rules** (from [CLAUDE.md](CLAUDE.md)): Base branch is `exercise-1`, NOT `main`. Default must reflect this.
- **Never commit/push to `main`** — the command must hard-block `main` as both source and target.
- **Stack-aware test plan**: Test plan in PR body should mention the actual validation commands: `cd server && pnpm run build && pnpm run lint && pnpm test`, `cd client && pnpm run build && pnpm run lint`.
- **Scopes** from [commit.md](.claude/commands/commit.md): `flags`, `api`, `ui`, `db`, `validation`, `deps`, `ai-layer` — reuse in PR title type(scope).

---

## Concept-by-Concept Requirements

### Concept #2 — Core 4 + Additional: `/create-pr` Purpose
> Terminal step of the PIV Loop — opens a pull request that summarizes ALL commits on the branch.

| Requirement | Design decision |
|-------------|-----------------|
| Atomic responsibility | Only creates a PR; does not validate or commit (those belong to `/validate` and `/commit`) |
| Uses `gh` CLI | `gh pr create` with HEREDOC body — matches project's CLAUDE.md guidance |
| Summarizes ALL commits | Reviews the full branch diff, not just the latest commit |

---

### Concept #6 — PIV Loop — Validating Phase Closure
> `/create-pr` is the terminal action — after it, the human reviews.

| Requirement | Design decision |
|-------------|-----------------|
| Positioned as PIV terminal step | State explicitly in `<objective>`: "Terminal step of the PIV Loop — runs after `/commit`" |
| Receives trigger from `/commit` | Pre-condition: at least one commit ahead of base branch |
| PIV chain closure signal | Output states: "PIV Loop complete — PR open for human review" |

---

### Concept #25 — Input → Process → Output Structure
> Every command must define all three stages clearly.

| Stage | Design decision |
|-------|-----------------|
| **Input** | `<objective>` (persona + PIV positioning) + `<context>` (auto-loaded git state + pre-conditions) |
| **Process** | 5 numbered steps in `<process>`: VERIFY → ANALYZE → GENERATE → CREATE → REPORT |
| **Output** | `<output>` block with PR URL, title, branch info + chain-closure message |

---

### Concept #26 — Input Section Detail
> Persona, pre-conditions, context.

| Requirement | Design decision |
|-------------|-----------------|
| Persona | "You are a senior engineer creating a well-documented pull request that gives reviewers everything they need to understand and verify the changes." |
| Pre-condition: commit exists | STOP with instruction to run `/commit` if `git log --oneline $(git merge-base HEAD origin/exercise-1)..HEAD` is empty |
| Pre-condition: not on `main` or base | STOP if current branch is `main` or `exercise-1` |
| PIV positioning | Stated in `<objective>`: "Terminal step of PIV Loop — runs after `/commit`" |
| `$ARGUMENTS` clarity | `${ARGUMENTS:-exercise-1}` — default to workshop base, NOT `main` |
| Context loading | Keep all 5 auto-run git commands from baseline, but fix base default to `exercise-1` |

---

### Concept #27 — Process Section Detail
> Step-by-step, tools specified, error handling.

| Requirement | Design decision |
|-------------|-----------------|
| Numbered VERB-labeled steps | VERIFY → ANALYZE → GENERATE → CREATE → REPORT |
| Tools specified | `Bash` for all git + `gh` calls; no Read/Write needed |
| On `main` or `exercise-1` | STOP — "Create a feature branch first: `git checkout -b feature/{name}`" |
| Uncommitted changes | STOP — "Commit or stash first. Run `/commit`." |
| Branch not on remote | Auto-push: `git push -u origin $(git branch --show-current)` |
| No commits ahead of base | STOP — "No commits to include. Run `/commit` first." |
| PR body depth | Summary (1–3 bullets) + Test plan (checklist) + Related commits (optional) |
| Force-push protection | Never use `--force` — `gh pr create` is additive only |

---

### Concept #28 — Output Section Detail
> Structured, informative, terminal deliverable.

| Requirement | Design decision |
|-------------|-----------------|
| Output format defined | `<output>` block with PR URL (from `gh pr view --json url -q .url`), title, base ← head, commit count |
| PR URL reported | Yes — printed and returned to user |
| Chain closure | "PIV Loop complete. PR open for human review." |
| No downstream command | This is the terminal step; nothing to chain to |

---

### Concept #29 — Command Chaining
> `/create-pr` receives trigger from `/commit` and ends the chain.

| Requirement | Design decision |
|-------------|-----------------|
| Receives from `/commit` | Pre-condition enforces a commit exists ahead of base |
| Terminal step | Output explicitly says "PIV Loop complete — human review next" |
| Update `/commit` Output | `commit.md` Output must be updated to reference `/create-pr` as the next step (already flagged in Round 5) |

---

### Additional: Frontmatter Quality

| Field | Design decision |
|-------|-----------------|
| `description` | `Create a pull request from the current branch — terminal step of PIV Loop` |
| `argument-hint` | `[base-branch]` (default: `exercise-1`) |
| `allowed-tools` | Scoped: `Bash(git branch:*), Bash(git log:*), Bash(git status:*), Bash(git diff:*), Bash(git push:*), Bash(git merge-base:*), Bash(git rev-parse:*), Bash(gh pr create:*), Bash(gh pr view:*)` |

---

## Action Plan Summary

### Priority 1 — Create the File with Full PIV Terminal Structure (concepts #2, #6, #25, #26)

| # | Action | Concept |
|---|--------|---------|
| 1.1 | Create `.claude/commands/create-pr.md` (does not exist) | #2 |
| 1.2 | Frontmatter with scoped `allowed-tools` (git + gh subcommands), `argument-hint`, `description` | Best practice |
| 1.3 | `<objective>` with persona + PIV terminal-step positioning | #26 |
| 1.4 | `<context>` with auto-loaded git state + pre-conditions | #26 |

### Priority 2 — Robust Error Handling in VERIFY (concept #27)

| # | Action | Concept |
|---|--------|---------|
| 2.1 | STOP if on `main` or `exercise-1` with branch-creation instruction | #27 |
| 2.2 | STOP if uncommitted changes; direct to `/commit` | #27 |
| 2.3 | STOP if no commits ahead of base; direct to `/commit` | #27 |
| 2.4 | Auto-push with `git push -u origin <branch>` if branch not on remote | #27 |

### Priority 3 — Structured Output + Chain Closure (concepts #25, #28, #29)

| # | Action | Concept |
|---|--------|---------|
| 3.1 | `<output>` block with URL, title, base ← head, commit count | #25, #28 |
| 3.2 | Chain closure: "PIV Loop complete — PR open for human review" | #28, #29 |

### Priority 4 — Project-Specific Alignment

| # | Action | Concept |
|---|--------|---------|
| 4.1 | Default base branch = `exercise-1` (NOT `main`) — workshop rule | Project-specific |
| 4.2 | Test plan template references actual validation commands (`pnpm run build`, `pnpm run lint`, `pnpm test`) | Project-specific |
| 4.3 | PR title `type(scope): ...` reuses scopes from `commit.md` | Consistency with Round 5 |

### Priority 5 — Update `/commit` Output (cross-reference with Round 5)

| # | Action | Concept |
|---|--------|---------|
| 5.1 | Update `commit.md` Output `Next:` line to reference `/create-pr` (already in Round 5 action plan) | #29 |

---

## Execution Prompt (copy-paste ready)

````
Read the following files from your workspace:
1. `docs/Gold-Standard-Plan/my-gold-standard.md` — the Gold Standard reference
2. `.claude/commands/commit.md` — source of truth for commit scopes and workshop conventions
3. `.claude/commands/review-pr.md` — format reference (XML-style tags) for consistency
4. `CLAUDE.md` — base branch rules (`exercise-1`, never `main`) and validation commands
5. `docs/Gold-Standard-Plan/phases/phase-3-additional-commands/round-8-audit-create-pr.md` — this plan

Create a NEW file at `.claude/commands/create-pr.md` with the following structure:

1. **Frontmatter**:
   - `description: Create a pull request from the current branch — terminal step of PIV Loop`
   - `argument-hint: [base-branch]`
   - `allowed-tools: Bash(git branch:*), Bash(git log:*), Bash(git status:*), Bash(git diff:*), Bash(git push:*), Bash(git merge-base:*), Bash(git rev-parse:*), Bash(gh pr create:*), Bash(gh pr view:*)`

2. **`<objective>`** block:
   - Persona: "You are a senior engineer creating a well-documented pull request that gives reviewers everything they need to understand and verify the changes."
   - PIV positioning: "This is the **terminal step** of the PIV Loop — runs after `/commit`. After this command, the PR is open for human review."
   - Purpose: "Create a pull request from the current branch to ${ARGUMENTS:-exercise-1}. Analyze ALL commits since the branch diverged, generate a clear summary and test plan, and create the PR with `gh` CLI."

3. **`<context>`** block:
   - Pre-condition note: "Requires a feature branch with at least one commit ahead of the base branch. If on `main` or `exercise-1`, or if no commits exist ahead of base, STOP and instruct the user."
   - Auto-run git commands (fix defaults to `exercise-1` instead of `main`):
     - `Current branch: !git branch --show-current`
     - `Base branch: ${ARGUMENTS:-exercise-1}`
     - `Commits to include: !git log --oneline $(git merge-base HEAD origin/exercise-1 2>/dev/null || git rev-parse origin/exercise-1)..HEAD 2>/dev/null || git log --oneline -10`
     - `Branch status: !git status -sb | head -1`
     - `Changed files: !git diff --name-only $(git merge-base HEAD origin/exercise-1 2>/dev/null)..HEAD 2>/dev/null || git diff --name-only HEAD~5`

4. **`<process>`** block — 5 numbered steps:

   **1. VERIFY branch state**
   - If on `main` or `exercise-1`: STOP — "Create a feature branch first: `git checkout -b feature/<description>`"
   - If uncommitted changes: STOP — "Commit or stash first. Run `/commit` to commit staged changes."
   - If no commits ahead of base: STOP — "No commits on this branch ahead of `exercise-1`. Run `/commit` first."
   - If branch not pushed to remote: run `git push -u origin $(git branch --show-current)` before proceeding.

   **2. ANALYZE all commits**
   - Review every commit since the branch diverged from the base.
   - Identify dominant change type (feat / fix / refactor / docs / test / chore).
   - Extract key changes and their purpose (the "why").

   **3. GENERATE PR content**
   - **Title**: `<type>(<scope>): <concise description>` — use same scopes as `/commit`: `flags`, `api`, `ui`, `db`, `validation`, `deps`, `ai-layer`.
   - **Summary**: 1–3 bullets — what changed and why.
   - **Test plan**: actionable checklist. Include relevant subset of:
     - [ ] `cd server && pnpm run build && pnpm run lint && pnpm test`
     - [ ] `cd client && pnpm run build && pnpm run lint`
     - [ ] Manually verify: {feature-specific steps}

   **4. CREATE PR with `gh` CLI**
   ```bash
   gh pr create --base ${ARGUMENTS:-exercise-1} --title "<title>" --body "$(cat <<'EOF'
   ## Summary
   - <bullet 1>
   - <bullet 2>

   ## Test plan
   - [ ] cd server && pnpm run build && pnpm run lint && pnpm test
   - [ ] cd client && pnpm run build && pnpm run lint
   - [ ] <feature-specific verification>
   EOF
   )"
   ```

   **5. REPORT** result using the `<output>` block format below.

5. **`<output>`** block:
   ```
   ## PR Created

   **URL**: {from `gh pr view --json url -q .url`}
   **Title**: {title used}
   **Branch**: {current branch} → {base branch}
   **Commits**: {count} included

   ---

   PIV Loop complete. This PR is now open for human review.
   ```

6. **`<success_criteria>`** block — 5 items:
   - PR created against the correct base branch (`exercise-1` by default, never `main`)
   - Title follows Conventional Commits `<type>(<scope>): <description>` using project scopes
   - Summary reflects ALL commits on the branch, not just the latest
   - Test plan references real validation commands from CLAUDE.md
   - PR URL returned and PIV closure message printed

**After creating the file**, update `.claude/commands/commit.md`:
- Change the Output `Next: git push origin {branch}` line to `Next: Run /create-pr to open a pull request for this branch.` (this aligns Round 5 and Round 8 action plans).

Do NOT change any source code. Only create `.claude/commands/create-pr.md` and apply the one-line change to `.claude/commands/commit.md`.
````

---

## Success Criteria

- [ ] File `.claude/commands/create-pr.md` created and well-formed (concept #2)
- [ ] Frontmatter with scoped `allowed-tools` (Bash git + gh subcommands), `argument-hint`, `description` (best practice)
- [ ] `<objective>` contains persona + PIV terminal-step positioning (concepts #6, #26)
- [ ] `<context>` pre-condition gates branch state and commit existence (concepts #26, #29)
- [ ] `<context>` defaults base to `exercise-1`, NOT `main` (workshop rule from CLAUDE.md)
- [ ] `<process>` has 5 numbered VERB-labeled steps (concept #25)
- [ ] VERIFY step has explicit STOP actions for each failure case: on `main`/`exercise-1`, uncommitted, no commits ahead, not pushed (concept #27)
- [ ] Test plan template references actual project validation commands (project-specific)
- [ ] PR title uses scopes from `/commit` (`flags`, `api`, `ui`, etc.) for consistency (cross-reference Round 5)
- [ ] `<output>` block is structured with URL, title, base ← head, commit count (concepts #25, #28)
- [ ] Chain closure present: "PIV Loop complete — PR open for human review" (concepts #28, #29)
- [ ] `<success_criteria>` block has 5 project-aware checks
- [ ] `commit.md` Output updated to reference `/create-pr` as the next step (cross-reference Round 5, concept #29)
