---
applyTo: "**/*.sh,**/.github/workflows/**,**/scripts/**"
---

# Git Operations — Always-On Instructions

## Objective

Enforce safe, traceable git operations across all exercise phases. These rules apply to every agent and Copilot session performing git commands in the `nextjs-feature-flag-exercise` fork.

---

## Branch Safety Rules

1. **Never push to `main`** — `main` is a protected exercise baseline. Direct commits to `main` break exercise traceability and complicate rollback.
2. **Never push to `upstream/*`** — you do not own the upstream repository.
3. **Always branch from `exercise-1`** — all feature work, AI Layer deployments, and implementation branches derive from `exercise-1`.
4. **Verify active branch before committing:**
   ```bash
   git branch --show-current
   ```
   If the output is `main`, stop and switch to `exercise-1` or a feature branch before continuing.

---

## Commit Convention

Follow **Conventional Commits in English** for all commits:

```
<type>(<scope>): <short description>

Types: feat | fix | docs | style | refactor | test | chore
Scope: optional, describes the area (e.g., ai-layer, server, client, flags, deps)
```

Examples:
```
chore(ai-layer): deploy minimum AI Layer baseline for Exercise 1
feat(flags): add server-side filtering by environment and status
fix(server): resolve SQL.js stmt.free() missing in getFilteredFlags
docs(diagnosis): add codebase audit document
test(server): add filter tests for environment and enabled params
```

---

## Remote Configuration Rules

- `origin` must always point to the **personal fork**.
- `upstream` must always point to the **original exercise repository**.
- Verify before first push:
  ```bash
  git remote -v
  ```
- If `origin` points to the original (not the fork), correct it:
  ```bash
  git remote set-url origin https://github.com/<your-username>/nextjs-feature-flag-exercise.git
  ```

---

## Staging Rules

- Run `git status` before every `git add` to verify what will be staged.
- Use `git add -p` (patch mode) for selective staging when multiple unrelated changes exist in the working tree.
- Never use `git add .` without reviewing `git status` first.

---

## Sync with Upstream

Before starting each exercise session, sync from the original repository:

```bash
git fetch upstream
git checkout exercise-1
git merge upstream/exercise-1 --ff-only   # Fast-forward only — no merge commits
```

If fast-forward is not possible (divergent history from a previous rebase), stop and investigate before proceeding.

---

## Evidence Requirements

Every git operation performed by an agent must be followed by a verification command, and the output must be recorded:

| Operation | Verification command |
|---|---|
| `git remote add` | `git remote -v` |
| `git checkout` | `git branch -vv` |
| `git commit` | `git log --oneline -3` |
| `git push` | Confirm branch name and remote URL in push output |

---

## Forbidden Operations

- `git push origin main` — blocked under all circumstances.
- `git push upstream` — you do not own the upstream repository.
- `git push --force` — only allowed on personal feature branches (never on `exercise-1`).
- `git reset --hard HEAD~N` — only allowed to discard uncommitted working-tree changes, never to discard already-pushed commits.
- `git rebase upstream/main` — the only valid rebase target is `upstream/exercise-1`.
- `git clean -fd` — only with explicit user confirmation; never autonomously.

---

## Do Not

- Do not create branches named `exercise-2`, `exercise-3` — these are reserved for other exercise phases.
- Do not commit `.env` files, secrets, WASM binaries, or `node_modules/`.
- Do not amend commits that have already been pushed to `origin`.
- Do not leave the working tree in a detached HEAD state after git operations.
