---
name: fork-and-configure-remotes
description: Step-by-step process for forking nextjs-feature-flag-exercise on GitHub and configuring the local git remotes for the exercise workflow (origin = personal fork, upstream = original repo, exercise-1 = working base). Use this skill when setting up the personal fork for the first time, or when verifying / repairing an existing fork's remote configuration.
---

## Objective

Establish the personal fork as the authoritative execution source of truth:
1. Fork the original repository to a personal GitHub account.
2. Clone the fork locally to the workspace path.
3. Configure `origin` (fork) and `upstream` (original) remotes.
4. Check out `exercise-1` and confirm it tracks `upstream/exercise-1`.
5. Verify the full state with `git remote -v` and `git branch -vv`.

---

## Inputs

| Input | Required | Description |
|---|---|---|
| `original_repo_url` | ✅ | HTTPS URL of the original exercise repository |
| `github_username` | ✅ | Personal GitHub username (the fork owner) |
| `local_path` | ✅ | Absolute local path for the clone (workspace directory) |

---

## Process

### Step 1 — Fork on GitHub

1. Navigate to `<original_repo_url>` in a browser.
2. Click the **Fork** button (top-right of the repository page).
3. Select your personal account as the destination (not an organization).
4. Wait for the fork to finish — GitHub will redirect to `https://github.com/<github_username>/nextjs-feature-flag-exercise`.
5. Copy the HTTPS clone URL: `https://github.com/<github_username>/nextjs-feature-flag-exercise.git`

> If the fork already exists, skip to Step 2.

---

### Step 2 — Clone the fork locally

```bash
git clone https://github.com/<github_username>/nextjs-feature-flag-exercise.git "<local_path>"
cd "<local_path>"
```

Confirm the clone succeeded:
```bash
git log --oneline -3
```
Expected: shows the repository's recent commits.

---

### Step 3 — Add the upstream remote

```bash
git remote add upstream <original_repo_url>
```

> If `upstream` already exists (e.g., repo was cloned directly from original), correct `origin` instead:
> ```bash
> git remote set-url origin https://github.com/<github_username>/nextjs-feature-flag-exercise.git
> ```

---

### Step 4 — Fetch upstream branches

```bash
git fetch upstream
```

Expected: downloads remote branches including `upstream/exercise-1`, `upstream/main`, etc.

---

### Step 5 — Checkout exercise-1 and set tracking

**If `exercise-1` already exists locally** (e.g., it came with the clone):
```bash
git checkout exercise-1
git branch --set-upstream-to=upstream/exercise-1 exercise-1
```

**If `exercise-1` does NOT exist locally yet:**
```bash
git checkout -b exercise-1 upstream/exercise-1
```

---

### Step 6 — Verify the full configuration

Run both verification commands and confirm the output matches the expected values below:

```bash
git remote -v
```

Expected output:
```
origin    https://github.com/<github_username>/nextjs-feature-flag-exercise.git (fetch)
origin    https://github.com/<github_username>/nextjs-feature-flag-exercise.git (push)
upstream  https://github.com/<original_owner>/nextjs-feature-flag-exercise.git (fetch)
upstream  https://github.com/<original_owner>/nextjs-feature-flag-exercise.git (push)
```

```bash
git branch -vv
```

Expected output (tracking line):
```
* exercise-1  <sha> [upstream/exercise-1] <commit message>
```

---

## Outputs

| Output | Description |
|---|---|
| Fork URL | `https://github.com/<github_username>/nextjs-feature-flag-exercise.git` |
| `git remote -v` output | Verified remote configuration (origin = fork, upstream = original) |
| `git branch -vv` output | Confirmed `exercise-1` tracking `upstream/exercise-1` |
| Local clone path | Confirmed absolute path of working directory |

---

## Validation Checklist

- [ ] Fork visible at `https://github.com/<github_username>/nextjs-feature-flag-exercise`
- [ ] `git remote -v` shows `origin` pointing to personal fork URL
- [ ] `git remote -v` shows `upstream` pointing to original repository URL
- [ ] `git branch -vv` shows `exercise-1` with `[upstream/exercise-1]` tracking label
- [ ] Active branch is `exercise-1` (marked with `*` in `git branch` output)
- [ ] `main` has zero commits authored by `<github_username>`

---

## Error Recovery

| Error | Cause | Fix |
|---|---|---|
| `remote origin already exists` | Repository was cloned directly from original (not fork) | `git remote set-url origin https://github.com/<github_username>/nextjs-feature-flag-exercise.git` |
| `exercise-1 not found in upstream` | Upstream branch not yet fetched | `git fetch upstream` and retry Step 5 |
| `Permission denied (publickey)` | SSH key not configured | Switch to HTTPS URLs — replace `git@github.com:<owner>/` with `https://github.com/<owner>/` |
| Fork shows `1 commit ahead of main` | Normal fork state | Expected — no action needed |
| `fatal: destination path already exists` | `local_path` directory already exists | Use `cd "<local_path>" && git remote -v` to check state — may already be cloned |

---

## Quality Checklist

- [ ] No workspace-relative paths used (all paths are absolute)
- [ ] `upstream` points to the original owner's URL, not the fork URL
- [ ] Local clone is at the declared `local_path`
- [ ] No changes accidentally staged on `main`
- [ ] Verification output saved as evidence for E0-S1 AC-1 and AC-2
