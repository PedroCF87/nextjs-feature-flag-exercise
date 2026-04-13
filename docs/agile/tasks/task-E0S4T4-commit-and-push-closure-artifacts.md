# Task E0-S4-T4 — Verify closure artifacts and record final SHA

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S4-T4 |
| **Story** | [E0-S4 — Preparation Closure and Handoff to EPIC-1](../stories/story-E0S4-preparation-closure.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Draft |
| **Responsible agent** | `project-adaptation-analyst` |
| **Depends on** | [E0-S4-T2 — Produce epic0-closure-report.md](../tasks/task-E0S4T2-produce-epic0-closure-report-md.md), [E0-S4-T3 — Produce epic1-handoff.md](../tasks/task-E0S4T3-produce-epic1-handoff-md.md) |
| **Blocks** | E0-S4-T5 |
| Created at | 2026-04-11 20:50:15 -03 |
| Last updated | 2026-04-12 15:13:58 -03 |

---

## 1) Task statement

As a delivery agent, I want to confirm that the two closure documents produced by T2 and T3 are committed and pushed to the fork (via their individual merged PRs) and record the final branch + SHA, so that T5 can proceed knowing the EPIC-0 evidence is permanently recorded.

> **Execution context:** T4 runs as a GitHub Issue task in the fork repository and is
> verification-only. Define `REPO_ROOT="$(git rev-parse --show-toplevel)"` first.

---

## 2) Verifiable expected outcome

- `check-ai-layer-files.js` confirms both closure files show `✅`.
- `git-info.js --branch-ref` records a live SHA on the fork branch (not `dynamous-business`).

> **Stateless session note:** T5 starts in an independent session. It will query `git-info.js` independently — it does not depend on SHA being passed from T4.

---

## 3) Detailed execution plan

### Step 0 — Hard gate: verify remote safety

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
git -C "$REPO_ROOT" remote get-url origin
```

**Evaluate output:**
- If output is `git@github.com:<your-personal-username>/nextjs-feature-flag-exercise.git` → **proceed to Step 1**.
- If output is `git@github.com:dynamous-business/nextjs-feature-flag-exercise.git` → **STOP.** Return to E0-S1-T1 to configure the personal fork as `origin` before continuing.

### Step 1 — Verify both closure artifacts are committed

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".agents/closure/epic0-closure-report.md" \
  ".agents/closure/epic1-handoff.md"
```

**Expected:** both `✅`. If either is `❌`, return to T2 or T3 — that task's PR was not merged.

### Step 2 — Record final branch + SHA

```bash
node "$REPO_ROOT/docs/.github/functions/git-info.js" \
  "$REPO_ROOT" \
  --branch-ref
```

Record output (e.g. `exercise-1 @ def5678`) as evidence for this task's DoD.

> **Note (stateless sessions):** T5 runs in an independent session and cannot receive this value from T4. T5 will call `git-info.js` independently when it starts. This step is for T4's own verification evidence only.

---

## 4) Architecture and security requirements

- **Remote safety gate is mandatory** — Step 0 must confirm `origin` points to personal fork. No exceptions.
- **Never push to dynamous-business** — this is a shared upstream repo.
- **Verification only** — this task does not create or modify any files. It is a confirmation step only.
- **No new files committed in this task** — T2 commits `epic0-closure-report.md`; T3 commits `epic1-handoff.md`; this task merely verifies they are present.
- **Rollback** — not applicable (no files are written or committed by this task).

---

## 5) Validation evidence

| Check | Command | Expected output |
|---|---|---|
| Remote is personal fork | `git -C "$REPO_ROOT" remote get-url origin` | URL contains personal GitHub username (not `dynamous-business`) |
| Both artifacts committed | `node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" ".agents/closure/epic0-closure-report.md" ".agents/closure/epic1-handoff.md"` | `✅ .agents/closure/epic0-closure-report.md` and `✅ .agents/closure/epic1-handoff.md` |
| Final SHA recorded | `node "$REPO_ROOT/docs/.github/functions/git-info.js" "$REPO_ROOT" --branch-ref` | `exercise-1 @ <sha>` |

### BDD verification signal

**Given** T2 and T3 are complete (each produced and pushed their file via individual PRs),  
**When** Steps 0–2 are executed in order,  
**Then** both closure files show `✅`, the remote is the personal fork, and the final SHA is recorded.

---

## 6) Definition of Done

- [ ] Step 0 remote safety gate passed (origin = personal fork, not upstream).
- [ ] Both `✅` from `check-ai-layer-files.js` for the two closure files.
- [ ] Final SHA recorded via `git-info.js --branch-ref` as T4 evidence.
