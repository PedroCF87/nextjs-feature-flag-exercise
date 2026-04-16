# Task E0-S1-T1 — Fork Repository and Configure Remotes

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S1-T1 |
| **Story** | [E0-S1 — Repository Diagnosis and Readiness](../stories/story-E0S1-repository-diagnosis.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `git-ops` |
| **Depends on** | [E0-S1-T0 — Bootstrap AI Layer artifacts](task-E0S1T0-bootstrap-ai-layer.md) |
| **Blocks** | E0-S1-T2 |
| Created at | 2026-04-10 17:45:54 -03 |
| Last updated | 2026-04-13 14:42:59 -03 |

---

## 1) Task statement

> **Execution context:** T1 runs **locally in VS Code** — no GitHub Issue, no cloud agent session.
> T1 **ends with a commit and push** (Step 9). `docs/` must be committed to the fork before
> T2 starts — T2 runs as a cloud agent and needs `docs/.github/functions/` and the task files.

Create a personal GitHub fork of `nextjs-feature-flag-exercise`, clone it locally, configure the two required remotes (`origin` = personal fork, `upstream` = original repository), check out the `exercise-1` branch with upstream tracking, and move the `Docs` workspace folder inside the fork as `docs/`. This establishes the authoritative execution source for all subsequent tasks in this story and for EPIC-1 implementation.

**Companion skill:** [`fork-and-configure-remotes`](../../.github/skills/fork-and-configure-remotes/SKILL.md)

---

## 2) Verifiable expected outcome

1. `git remote -v` shows `origin` pointing to the personal fork URL (fetch + push).
2. `git remote -v` shows `upstream` pointing to the original repository URL (fetch + push).
3. `git branch --show-current` outputs `exercise-1`.
4. `git branch -vv` shows `exercise-1` tracking `[upstream/exercise-1]`.
5. No direct commits exist on `main` from the personal account.
6. `git-info.js` run against the clone outputs `exercise-1 @ <sha>`.
7. `docs/` folder exists inside the fork root and its subdirectories (`agile/`, `.github/`) are accessible.
8. `docs/` is committed and pushed to `exercise-1` on the personal fork — visible via `git log --oneline -1 -- docs/`.

---

## 3) Detailed execution plan

### Step 0 — Pre-flight check
Run the prerequisites check to confirm the environment is ready before touching git:

```bash
node "Docs/.github/functions/check-prereqs.js" "exercise-1" \
  "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise"
```

🔴 **Stop if any check fails.** Resolve before proceeding.

### Step 1 — Fork on GitHub
1. Navigate to `https://github.com/dynamous-business/nextjs-feature-flag-exercise`.
2. Click **Fork** → select your personal account as the destination.
3. Note the fork URL: `https://github.com/<your-username>/nextjs-feature-flag-exercise.git`.

### Step 2 — Clone the fork locally

> **Current workspace state (pre-fork):** The local directory already exists. However, `origin` currently points to the **original** repository (`git@github.com:dynamous-business/nextjs-feature-flag-exercise.git`), not to a personal fork. **Do not skip Step 3** — `origin` must be re-pointed to the fork URL and `upstream` must be added as a new remote.

If the local directory did NOT exist (fresh setup), clone the fork instead:

```bash
git clone https://github.com/<your-username>/nextjs-feature-flag-exercise.git \
  "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise"
```

Exit code must be `0`. If the target directory is non-empty, resolve conflict before continuing.

### Step 3 — Configure origin (fork) and upstream (original)

```bash
cd "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise"

# Check current remotes
git remote -v
```

**Case A — `origin` still points to the original repo (current workspace state):**

```bash
# Re-point origin to your personal fork
git remote set-url origin https://github.com/<your-username>/nextjs-feature-flag-exercise.git

# Add upstream pointing to the original repository
git remote add upstream https://github.com/dynamous-business/nextjs-feature-flag-exercise.git
```

> **Note:** After this, `exercise-1` still temporarily tracks `[origin/exercise-1]`
> (where `origin` now points to the fork). Step 5 corrects the tracking to
> `[upstream/exercise-1]` — do not skip Step 5.

**Case B — `origin` already points to the fork (correctly cloned from fork):**

```bash
# Only add upstream if absent
git remote add upstream https://github.com/dynamous-business/nextjs-feature-flag-exercise.git
```

Verify result: `git remote -v` must show both `origin` (fork) and `upstream` (dynamous-business).

### Step 4 — Fetch all upstream branches

```bash
git fetch upstream
```

Exit code must be `0`. All upstream branches must be fetched before checkout.

### Step 5 — Check out exercise-1 with tracking

```bash
# If exercise-1 already exists locally:
git checkout exercise-1
git branch --set-upstream-to=upstream/exercise-1 exercise-1

# If exercise-1 does NOT exist locally yet:
git checkout -b exercise-1 upstream/exercise-1
```

### Step 6 — Verify final state

```bash
git remote -v
git branch -vv
git log --oneline -3
```

Confirm:
- `origin` points to your fork.
- `upstream` points to the original repository.
- `exercise-1` is active and tracking `upstream/exercise-1`.
- The last 3 commits belong to the original repository (not personal commits).

### Step 7 — Capture branch reference for evidence

```bash
node "Docs/.github/functions/git-info.js" \
  "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" \
  --branch-ref
```

Paste the output (e.g. `exercise-1 @ a3f2e1c`) into the evidence record below.

### Step 8 — Move `Docs` into the fork as `docs/`

Move the workspace `Docs` folder inside the cloned fork and rename it to lowercase `docs/`:

```bash
mv "/delfos/Projetos/ITBC - Desafio RDH/Docs" \
   "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/docs"
```

Verify the agile artifacts are accessible inside the fork:

```bash
ls "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/docs/agile/"
```

Expected: directory listing including `stories/`, `tasks/`, `timeline.jsonl`, `backlog-index.json`.

Confirm git sees the new folder (it will appear as untracked until committed in a later task):

```bash
git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" status --short
```

Expected: `?? docs/` in the output.

> **Path convention from this point forward:** All subsequent tasks reference `docs/` (relative to
> the fork root) instead of `Docs/`. The `docs/` folder is tracked by the fork's git repository —
> docs-side artifact commits go to the fork, not to a separate repo.

> **VS Code workspace:** After the move, open the fork root
> (`/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise`) as the workspace root so that
> both the exercise code and `docs/` are visible and version-controlled together.

> **Execution model transition — one Issue per task from T2 onward:**
> Starting with E0-S1-T2, every task is executed by creating a GitHub Issue in the personal fork
> and invoking the GitHub Copilot coding agent via that Issue. Each agent session is stateless —
> no memory, staged files, or variables carry over between tasks. All inter-task data flows through
> **committed files** in the fork.
>
> Note: `copilot-setup-steps.yml` (the Copilot agent environment configuration) is created in
> E0-S2-T4. For E0-S1 tasks T2–T4, the agent runs in GitHub's **default Codespace environment**,
> which includes Node.js ≥ 18 and `pnpm` via `corepack` — sufficient for all E0-S1 validation
> commands. The custom setup workflow optimizes future sessions but is not a prerequisite here.

> **VS Code hooks become non-operational after Step 8.** The `agile-auto-log.json` hook uses
> absolute paths pointing to `Docs/.github/hooks/...` which no longer exist after the `mv`.
> To append the T1 timeline entry, run the following manually **after Step 8**:
> ```bash
> TIMELINE="/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/docs/agile/timeline.jsonl"
> ID=$(node "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/docs/.github/functions/timeline-id.js" "$TIMELINE")
> TS=$(node "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/docs/.github/functions/datetime.js")
> echo "{\"id\":$ID,\"action\":\"updated\",\"artifact_type\":\"task\",\"artifact_id\":\"E0-S1-T1\",\"file\":\"docs/agile/tasks/task-E0S1T1-fork-configure-remotes.md\",\"timestamp\":\"$TS\",\"epic\":\"EPIC-0\",\"story\":\"E0-S1\",\"note\":\"T1 completed: fork configured and docs/ moved\"}" >> "$TIMELINE"
> ```
> All subsequent tasks (T2+) run in GitHub cloud; VS Code hooks are irrelevant there. T2+ agents
> use the same manual functions for timeline entries.

### Step 9 — Commit and push `docs/` to the fork

After the timeline entry is appended, stage and commit the entire `docs/` tree:

```bash
cd "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise"

# Review what will be committed
git status --short
```

Expected: entries under `docs/` only (including the newly appended `timeline.jsonl`). No staged changes outside `docs/`.

```bash
git add docs/
git commit -m "chore(docs): add AI Layer artifacts and agile planning docs"
git push origin exercise-1
```

Expected: push completes with exit code `0`. Verify:

```bash
git log --oneline -3
```

Expected: top commit message is `chore(docs): add AI Layer artifacts and agile planning docs`.

> **Why push directly to `exercise-1`:** T1 is foundational infrastructure (no feature branch),
> and it runs locally (not via a GitHub Issue). Direct push to `exercise-1` is acceptable here.
> From T2 onward, each task creates a feature branch and opens a PR.

---

## 4) Architecture and security requirements

### Input validation
- Never run `git push` to `upstream` — this is a read-only remote.
- Confirm the fork URL belongs to the personal account before running any `git push`.
- Always run `git status` before staging or committing anything.

### Secrets handling
- No credentials should be stored in plain text; use the system credential manager or `gh` CLI for GitHub authentication.
- Never hardcode personal access tokens (PATs) in shell history or scripts.
- If a PAT is used for HTTPS authentication, ensure `git credential.helper` is configured.

### Rollback / fallback
- If the fork was created incorrectly (wrong source), delete the fork on GitHub and repeat Step 1.
- If `upstream` remote was added with a wrong URL: `git remote set-url upstream <correct-url>`.
- If `exercise-1` is on the wrong commit: `git fetch upstream && git reset --hard upstream/exercise-1`.
- **Step 8 rollback** — if the `mv` failed or the path is wrong after execution:
  ```bash
  # Undo the move — restore Docs to its original location
  mv "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/docs" \
     "/delfos/Projetos/ITBC - Desafio RDH/Docs"
  ```
  Verify the restore: `ls "/delfos/Projetos/ITBC - Desafio RDH/Docs/agile/"` must list `stories/`, `tasks/`, etc.

### Architecture boundary rules
- **Never commit to `main`** — it must remain a clean mirror of the original repository.
- **Never push to `upstream`** — it is read-only from this fork's perspective.
- All personal work must happen on branches checked out from `exercise-1`.

### Forbidden operations
```bash
git push upstream          # ❌ Never push to upstream
git push origin main       # ❌ Never push to main
git merge main exercise-1  # ❌ Never merge main into exercise-1
git commit --amend --force # ❌ Never rewrite shared history
```

---

## 5) Validation evidence

### BDD verification

**Given** a personal GitHub fork exists and upstream is configured,  
**When** I run `git remote -v` from the cloned repository,  
**Then** two remotes are listed: `origin` pointing to the personal fork and `upstream` pointing to the original repository.

**Given** upstream has been fetched and `exercise-1` checked out,  
**When** I run `git branch -vv`,  
**Then** `exercise-1` shows `[upstream/exercise-1]` in its tracking info.

**Given** `git-info.js` is available,  
**When** I run it with the repo path and `--branch-ref`,  
**Then** it outputs `exercise-1 @ <7-char-sha>`, confirming both branch and commit SHA.

**Given** Steps 1–7 succeeded and the fork root is ready,  
**When** I run Step 8 (`mv Docs → docs/`), append the timeline entry, and run Step 9 (`git add docs/ && git commit && git push`),  
**Then** `git log --oneline -1 -- docs/` shows the Step 9 commit and `ls docs/agile/` lists `stories/`, `tasks/`, `timeline.jsonl`, `backlog-index.json`.

### Commands and expected outputs

```bash
# Remote verification
git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" remote -v
# Expected:
# origin    https://github.com/<your-username>/nextjs-feature-flag-exercise.git (fetch)
# origin    https://github.com/<your-username>/nextjs-feature-flag-exercise.git (push)
# upstream  https://github.com/dynamous-business/nextjs-feature-flag-exercise.git (fetch)
# upstream  https://github.com/dynamous-business/nextjs-feature-flag-exercise.git (push)

# Branch tracking verification
git -C "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" branch -vv
# Expected: * exercise-1  <sha> [upstream/exercise-1] <last-commit-message>

# Branch reference capture
node "Docs/.github/functions/git-info.js" \
  "/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise" \
  --branch-ref
# Expected: exercise-1 @ <sha>  (exit code 0)
```

**Branch reference:** `exercise-1 @ f73979e`

---

## 6) Definition of Done

- [x] Fork exists on GitHub under the personal account (`PedroCF87`).
- [x] `git remote -v` shows `origin` = `https://github.com/PedroCF87/nextjs-feature-flag-exercise.git`.
- [x] `git remote -v` shows `upstream` = `https://github.com/dynamous-business/nextjs-feature-flag-exercise.git`.
- [x] `git branch --show-current` outputs `exercise-1`.
- [x] `git branch -vv` shows `exercise-1` tracking `[upstream/exercise-1]`.
- [x] `main` branch has no personal commits (fork includes only `exercise-1`).
- [x] `git-info.js` produces `exercise-1 @ f73979e` with exit code 0.
- [x] Evidence captured in this document's validation section.
- [x] `docs/` committed and pushed to `exercise-1` on the personal fork.
- [x] `git log --oneline -1 -- docs/` returns the Step 9 commit.
- [x] Timeline entry appended to `docs/agile/timeline.jsonl` (id: 20260413-009, timestamp: 2026-04-13 14:42:59 -03).
