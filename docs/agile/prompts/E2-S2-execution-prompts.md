# E2-S2 — Execution Prompts

Optimized prompts for executing the 7 tasks of Story E2-S2 sequentially.
Copy-paste each prompt to the appropriate agent when ready to execute.

**Execution order:** T1 → T2 → T3 → T4 → T5 (manual) → T6 → T7

---

## Prompt 1 — E2-S2-T1: Create exercise-2 branch

**Agent:** `git-ops`

```
Execute task E2-S2-T1. Read the task file at docs/agile/tasks/task-E2S2T1-create-exercise-2-branch-from-upstream-state.md.

Context: We need to create the `exercise-2` branch from the upstream original state (before any fork commits). The target base commit is `f73979ed~1`.

Steps:
1. Confirm current branch and working tree status:
   git branch --show-current
   git status --short
2. Create and switch to exercise-2:
   git checkout -b exercise-2 f73979ed~1
3. Verify the branch was created from the correct commit:
   git log --oneline -3
4. Verify no filtering code exists:
   grep -r "FlagFilterParams\|getAllFlags.*filter\|LIKE.*ESCAPE" server/src/ || echo "No filtering code found — correct"
5. Verify server test count (should be 16 CRUD-only tests):
   cd server && pnpm install && pnpm test 2>&1 | tail -5
   cd ..

After executing, mark the task as Done:
- Update docs/agile/tasks/task-E2S2T1-create-exercise-2-branch-from-upstream-state.md:
  - Set **Status** → Done
  - Set Last updated → current timestamp (node docs/.github/functions/datetime.js)
  - Fill section 5 (Validation evidence) with command outputs
  - Check all boxes in section 6 (Definition of Done)
  - Fill section 7 (Notes for handoff): downstream unblocked = E2-S2-T2
```

---

## Prompt 2 — E2-S2-T2: Copy documentation, manuals, and .github artifacts

**Agent:** `git-ops`

```
Execute task E2-S2-T2. Read the task file at docs/agile/tasks/task-E2S2T2-cherry-pick-documentation-and-agile-artifacts.md.

Context: We're copying pre-saved backup folders into the exercise-2 branch. The backup was made from exercise-1 before branch creation.

Pre-condition: exercise-2 branch must be checked out (done in T1).

Steps:
1. Verify we're on exercise-2 and the tree is clean:
   git branch --show-current
   git status --short
2. Copy the 3 backup folders:
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/docs" ./docs
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/manuals" ./manuals
   cp -r "/delfos/Projetos/ITBC - Desafio RDH/.github" ./.github
3. Verify content was copied:
   ls docs/
   ls manuals/
   ls .github/
   ls .github/instructions/ | head -5
   ls .github/skills/ | head -5
   ls .github/agents/ | head -5
4. Stage and review:
   git add docs/ manuals/ .github/
   git status | head -30
   git diff --cached --stat | tail -5
5. Commit:
   git commit -m "docs: restore docs, manuals, and .github artifacts from exercise-1 backup [E2-S2-T2]"
6. Verify commit:
   git log --oneline -3

After executing, mark the task as Done:
- Update the task file: Status → Done, Last updated → current timestamp
- Fill sections 5, 6, 7 per the execute-task-locally skill
- Downstream unblocked: E2-S2-T3, E2-S2-T6
```

---

## Prompt 3 — E2-S2-T3: Clean up Exercise 1 automation workflows

**Agent:** `git-ops`

```
Execute task E2-S2-T3. Read the task file at docs/agile/tasks/task-E2S2T3-remove-exercise-1-automation-workflows.md.

Context: T2 copied .github/ from exercise-1, which includes Exercise 1 automation workflow files. These must be removed — only claude.yml (from upstream) should remain in .github/workflows/.

Pre-condition: T2 is Done.

Steps:
1. List current workflows:
   ls -la .github/workflows/
2. Remove Exercise 1 automation files:
   rm -f .github/workflows/auto-copilot-fix.yml \
         .github/workflows/auto-merge-on-clean-review.yml \
         .github/workflows/auto-ready-for-review.yml \
         .github/workflows/auto-validate-copilot-fix.yml \
         .github/workflows/copilot-push-signal.yml \
         .github/workflows/copilot-setup-steps.yml
3. Verify only claude.yml remains:
   ls -la .github/workflows/
   # Expected: only claude.yml
4. Stage and commit:
   git add -A .github/workflows/
   git status
   git commit -m "ci: remove Exercise 1 automation workflows from exercise-2 [E2-S2-T3]"
5. Verify:
   git log --oneline -3

After executing, mark the task as Done:
- Update the task file: Status → Done, Last updated → current timestamp
- Fill sections 5, 6, 7
- Downstream unblocked: E2-S2-T4
```

---

## Prompt 4 — E2-S2-T4: Activate Claude Code workflows

**Agent:** `git-ops`

```
Execute task E2-S2-T4. Read the task file at docs/agile/tasks/task-E2S2T4-activate-claude-code-workflows.md.

Context: claude.yml already exists in .github/workflows/ (from upstream). We need to add the 2 missing Claude Code workflow files (pr-review.yml and security-review.yml) by extracting them from the exercise-1 branch.

Pre-condition: T3 is Done. .github/workflows/ contains only claude.yml.

Steps:
1. Verify current state:
   ls .github/workflows/
   # Expected: claude.yml only
2. Extract the 2 workflow files from exercise-1 branch:
   git show exercise-1:exercise-2-docs/pr-review.yml > .github/workflows/pr-review.yml
   git show exercise-1:exercise-2-docs/security-review.yml > .github/workflows/security-review.yml
3. Verify all 3 workflows are present:
   ls -la .github/workflows/
   # Expected: claude.yml, pr-review.yml, security-review.yml
4. Validate YAML syntax (any of these approaches):
   python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pr-review.yml')); print('pr-review.yml: valid')"
   python3 -c "import yaml; yaml.safe_load(open('.github/workflows/security-review.yml')); print('security-review.yml: valid')"
   # If python3 yaml not available, use: head -20 .github/workflows/pr-review.yml
5. Stage and commit:
   git add .github/workflows/pr-review.yml .github/workflows/security-review.yml
   git commit -m "ci: activate Claude Code PR review and security review workflows [E2-S2-T4]"
6. Verify:
   git log --oneline -3

After executing, mark the task as Done:
- Update the task file: Status → Done, Last updated → current timestamp
- Fill sections 5, 6, 7
- Downstream unblocked: E2-S2-T5, E2-S2-T6
```

---

## Prompt 5 — E2-S2-T5: Install Claude GitHub App and configure secret

**Agent:** Manual (human task)

```
This task requires manual steps in the GitHub UI.

Task file: docs/agile/tasks/task-E2S2T5-install-claude-github-app-and-configure-secret.md

Steps:
1. Install Claude GitHub App:
   - Go to https://github.com/apps/claude
   - Click "Install" → select the fork repository (dynamous-business/nextjs-feature-flag-exercise)
   - Grant permissions to the repository

2. Configure ANTHROPIC_API_KEY:
   - Go to https://github.com/dynamous-business/nextjs-feature-flag-exercise/settings/secrets/actions
   - Click "New repository secret"
   - Name: ANTHROPIC_API_KEY
   - Value: (paste your Anthropic API key)
   - Click "Add secret"

3. Verify:
   - App: check https://github.com/dynamous-business/nextjs-feature-flag-exercise/settings/installations
   - Secret: confirm ANTHROPIC_API_KEY appears in the secrets list

After completing, mark the task as Done:
- Update the task file: Status → Done, Last updated → current timestamp
- Section 5: note manual verification evidence (screenshots or confirmation)
- Section 6: check all boxes
- Section 7: downstream unblocked = E2-S2-T6
```

---

## Prompt 6 — E2-S2-T6: Push and validate with draft PR

**Agent:** `git-ops`

```
Execute task E2-S2-T6. Read the task file at docs/agile/tasks/task-E2S2T6-push-and-validate-with-draft-pr.md.

Context: All local configuration is done (T1-T5). Now push the exercise-2 branch to origin and create a draft PR to verify Claude Code workflows trigger.

Pre-conditions: T2, T4, and T5 are Done.

Steps:
1. Verify we're on exercise-2 with all commits:
   git branch --show-current
   git log --oneline -5
2. Push the branch:
   git push origin exercise-2
3. Create a draft PR using GitHub CLI:
   gh pr create --base exercise-1 --head exercise-2 \
     --title "feat: Exercise 2 — AI-Assisted Run setup [E2-S2]" \
     --body "## Purpose

   Repository configuration for Exercise 2 (PIV Loop with Claude Code).

   ### Changes
   - exercise-2 branch from upstream state
   - Documentation, manuals, and AI Layer artifacts restored
   - Exercise 1 automation workflows removed
   - Claude Code workflows activated (claude.yml, pr-review.yml, security-review.yml)

   ### Validation
   - [ ] pr-review.yml triggers
   - [ ] security-review.yml triggers
   - [ ] Full validation suite passes (T7)" \
     --draft
4. Wait 30-60 seconds, then check PR checks:
   gh pr checks
   # Expected: pr-review and security-review workflows should appear
5. If gh CLI is not available, provide the PR creation URL:
   echo "https://github.com/dynamous-business/nextjs-feature-flag-exercise/compare/exercise-1...exercise-2"

After executing, mark the task as Done:
- Update the task file: Status → Done, Last updated → current timestamp
- Section 5: include PR URL and workflow trigger evidence
- Section 6: check all boxes
- Section 7: downstream unblocked = E2-S2-T7
```

---

## Prompt 7 — E2-S2-T7: Run full validation suite

**Agent:** `environment-validator`

```
Execute task E2-S2-T7. Read the task file at docs/agile/tasks/task-E2S2T7-run-full-validation-suite-on-exercise-2.md.

Context: Verify that the exercise-2 branch is clean — no filtering code, all builds and tests pass. Expected: 16 server tests (CRUD only), all build/lint zero errors.

Pre-condition: T6 is Done. exercise-2 is checked out.

Steps:
1. Verify branch:
   git branch --show-current
   # Must be exercise-2

2. Install dependencies (in case they're not installed):
   cd server && pnpm install && cd ../client && pnpm install && cd ..

3. Run server validation:
   cd server
   pnpm run build
   pnpm run lint
   pnpm test
   cd ..
   # Expected: tsc clean, 0 lint errors, 16 tests passing

4. Run client validation:
   cd client
   pnpm run build
   pnpm run lint
   cd ..
   # Expected: tsc + vite build clean, 0 lint errors

5. Verify no filtering code leaked:
   grep -r "FlagFilterParams\|filterFlags\|LIKE.*ESCAPE\|environment.*filter\|status.*filter" server/src/services/ server/src/routes/ || echo "No filtering code — correct"

6. Summary: all 5 commands must exit 0.

After executing, mark the task as Done:
- Update the task file: Status → Done, Last updated → current timestamp
- Section 5: include full command output (exit codes, test count, build output summary)
- Section 6: check all boxes
- Section 7: note that E2-S2 is ready for story closure

Also: since this is the last task in E2-S2, mark the STORY as Done:
- Update docs/agile/stories/story-E2S2-repository-configuration-workflow-activation.md:
  - Set **Status** → Done
  - Set Last updated → current timestamp
- Update the parent epic file: prepend ✅ to the E2-S2 story heading
```

---

## Batch Execution Notes

- **T1 through T4** can be executed in a single agent session — they are all git operations.
- **T5** is a manual human task (GitHub UI). Pause between T4 and T6 for the user to complete it.
- **T6 and T7** can be a single session after T5 is confirmed.
- All task file updates (marking Done) should use `node docs/.github/functions/datetime.js` for the timestamp.
- After all 7 tasks are Done, run `node docs/.github/functions/sync-backlog-index.js docs/agile` to sync the backlog index.
