<!-- artifact_id: epic0-execution-guide -->
<!-- epic_id: EPIC-0 -->
<!-- story_id: null -->
<!-- produced_at: 2026-04-10 16:14:54 -03 -->
<!-- produced_by: agile-exercise-planner -->

# EPIC-0 Execution Guide — Environment Preparation for Exercise 1

| Field | Value |
|---|---|
| **Epic** | EPIC-0 — Environment Preparation for Exercise 1 |
| **Source index** | [backlog-index.json](backlog-index.json) |
| **Stories** | [E0-S1](stories/story-E0S1-repository-diagnosis.md) → [E0-S2](stories/story-E0S2-minimum-ai-layer.md) → [E0-S3](stories/story-E0S3-measurement-baseline.md) → [E0-S4](stories/story-E0S4-preparation-closure.md) |
| Created at | 2026-04-10 16:14:54 -03 |
| Last updated | 2026-04-10 16:14:54 -03 |

---

## 1 — Execution Sequence

Execute stories in the order below. **Never start a story unless all stories it depends on are in status `Done`.**

| Story | Priority | Responsible Agent | Key Inputs | Key Outputs | Gate (must be ✅ before next story) |
|---|---|---|---|---|---|
| [E0-S1](stories/story-E0S1-repository-diagnosis.md) — Repository Diagnosis and Readiness | P0 | `project-adaptation-analyst`, `git-ops`, `environment-validator` | GitHub account; local workspace with Node.js ≥18, pnpm, git; `TASK.md` and `AGENTS.md` accessible | Fork remotes verified; all 5 validation commands pass; `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` with 8 required sections | All 5 commands exit 0; `codebase-audit.md` exists with 8 sections; risk register has ≥ R1–R4; 11 `TASK.md` ACs listed |
| [E0-S2](stories/story-E0S2-minimum-ai-layer.md) — Minimum AI Layer Configuration | P0 | `copilot-config-refactor`, `rules-bootstrap`, `copilot-env-specialist`, `git-ops` | E0-S1 complete; workspace AI Layer artifacts in `Docs/.github/`; fork URL confirmed | `.github/copilot-instructions.md`; 2 instruction files; 3 agent files; 4 skill directories; `copilot-setup-steps.yml`; `.agents/validation/ai-layer-coverage-report.md` | `validate-workflow-file.js` passes; `check-ai-layer-files.js` shows all 6 minimum files ✅; `copilot-setup-steps.yml` dry-run has a documented successful run ID |
| [E0-S3](stories/story-E0S3-measurement-baseline.md) — Definition of Measurement Baseline | P1 | `agile-exercise-planner`, `environment-validator`, `git-ops` | E0-S2 complete; `elapsed-time.js` exists at `Docs/.github/functions/elapsed-time.js` | `.agents/baseline/measurement-baseline.md` (9 sections); time-zero snapshot captured; go/no-go checklist signed | Go/no-go checklist in `measurement-baseline.md` has all 9 items ✅; no ❌ items unresolved |
| [E0-S4](stories/story-E0S4-preparation-closure.md) — Preparation Closure and Handoff to EPIC-1 | P1 | `project-adaptation-analyst`, `git-ops`, `agile-exercise-planner` | E0-S3 complete; all evidence artifacts present; `timeline-query.js`, `git-info.js`, `check-ai-layer-files.js` | `.agents/closure/epic0-closure-report.md` (5 sections); `.agents/closure/epic1-handoff.md` (6 sections); commit pushed to fork's `exercise-1` | `epic1-handoff.md` Section 6 contains `READY — EPIC-1 may begin.` signed statement; commit pushed to fork |

---

## 2 — Dependency Rules

> Source: [backlog-index.json](backlog-index.json) — generated at `2026-04-10 15:18:06 -03`.

### Blocking chain

```
E0-S1 ──blocks──► E0-S2 ──blocks──► E0-S3 ──blocks──► E0-S4 ──blocks──► EPIC-1
  └────────────────────────────────────────────────────────────────────────────►
         (E0-S1 also transitively blocks E0-S3, E0-S4, and EPIC-1)
```

### Per-story dependency table

| Story | Depends on | Blocked by | Blocks |
|---|---|---|---|
| E0-S1 | — (first in epic) | Nothing — starts immediately | E0-S2, E0-S3, E0-S4, EPIC-1 |
| E0-S2 | E0-S1 | E0-S1 not Done | E0-S3, E0-S4, EPIC-1 |
| E0-S3 | E0-S2 | E0-S2 not Done | E0-S4, EPIC-1 |
| E0-S4 | E0-S3 | E0-S3 not Done | EPIC-1 |

### Blocking rules

1. **Do not start E0-S2** until E0-S1's gate is fully ✅ — specifically: all 5 validation commands exit 0 and `codebase-audit.md` exists with all 8 sections.
2. **Do not start E0-S3** until E0-S2's gate is fully ✅ — specifically: `copilot-setup-steps.yml` dry-run has a successful run ID on record.
3. **Do not start E0-S4** until E0-S3's go/no-go checklist is signed with all 9 items ✅.
4. **Do not start EPIC-1** until E0-S4's `epic1-handoff.md` contains the signed `READY` statement.
5. **If any gate item is ⚠️:** document the limitation in E0-S4 Section 2 (Residual Risks) and assign a mitigation. Execution may continue only if the limitation does not affect EPIC-1 scope.
6. **If any gate item is ❌:** the story is blocked. Return to the responsible story, resolve the missing item, re-run the gate check before advancing.

---

## 3 — Validation Commands per Phase

Run these commands at the end of each story to confirm the gate is met. All must exit with code `0`.

### E0-S1 — Repository Diagnosis

```bash
# 1. Prerequisites check (Node.js ≥18, pnpm, git, active branch = exercise-1)
node "Docs/.github/functions/check-prereqs.js" exercise-1 nextjs-feature-flag-exercise

# 2. Server validation suite
cd nextjs-feature-flag-exercise/server && pnpm run build && pnpm run lint && pnpm test

# 3. Client validation suite
cd nextjs-feature-flag-exercise/client && pnpm run build && pnpm run lint

# 4. Remotes verification (visual check — expected: origin = fork, upstream = original)
git -C nextjs-feature-flag-exercise remote -v

# 5. Branch + SHA evidence for audit document header
node "Docs/.github/functions/git-info.js" nextjs-feature-flag-exercise --branch-ref
```

### E0-S2 — Minimum AI Layer Configuration

```bash
# 1. Workflow file structural check (job name, environment: copilot, timeout ≤59, workflow_dispatch)
node "Docs/.github/functions/validate-workflow-file.js" \
  nextjs-feature-flag-exercise/.github/workflows/copilot-setup-steps.yml

# 2. Minimum AI Layer file coverage check (6 required files)
node "Docs/.github/functions/check-ai-layer-files.js" nextjs-feature-flag-exercise \
  ".github/copilot-instructions.md" \
  ".github/workflows/copilot-setup-steps.yml" \
  ".github/instructions/feature-flag-exercise.instructions.md" \
  ".github/agents/rdh-workflow-analyst.agent.md" \
  ".github/agents/codebase-gap-analyst.agent.md" \
  ".github/agents/technical-manual-writer.agent.md" \
  ".agents/validation/ai-layer-coverage-report.md" \
  --table

# 3. Confirm diagnosis artifact still present from E0-S1
node "Docs/.github/functions/check-ai-layer-files.js" nextjs-feature-flag-exercise \
  ".agents/diagnosis/codebase-audit.md"
```

### E0-S3 — Measurement Baseline

```bash
# 1. Re-confirm environment is still valid after AI Layer deployment
node "Docs/.github/functions/check-prereqs.js" exercise-1 nextjs-feature-flag-exercise

# 2. Validate all commands still pass (run from nextjs-feature-flag-exercise root)
cd nextjs-feature-flag-exercise/server && pnpm run build && pnpm run lint && pnpm test
cd nextjs-feature-flag-exercise/client && pnpm run build && pnpm run lint

# 3. Confirm baseline template exists and is committed
node "Docs/.github/functions/check-ai-layer-files.js" nextjs-feature-flag-exercise \
  ".agents/baseline/measurement-baseline.md" --table

# 4. Verify go/no-go section is present (visual — open the file and confirm all 9 items are ✅)
grep -A 12 "Go.*no.*go" nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md
```

### E0-S4 — Preparation Closure

```bash
# 1. Verify all closure artifacts exist
node "Docs/.github/functions/check-ai-layer-files.js" nextjs-feature-flag-exercise \
  ".agents/closure/epic0-closure-report.md" \
  ".agents/closure/epic1-handoff.md" --table

# 2. Total EPIC-0 elapsed time (paste value into closure report Section 5)
node "Docs/.github/functions/timeline-query.js" "Docs/agile/timeline.jsonl" --epic EPIC-0

# 3. Final branch + SHA for handoff document
node "Docs/.github/functions/git-info.js" nextjs-feature-flag-exercise --branch-ref

# 4. Confirm READY statement is signed in handoff
grep "READY" nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md

# 5. Confirm commit is pushed (visual check — last commit should be the closure commit)
git -C nextjs-feature-flag-exercise log --oneline -1
```

---

## 4 — Gate Failure Recovery

### E0-S1 failures

| Failure condition | Recovery action |
|---|---|
| `check-prereqs.js` fails — Node.js version too old | `nvm install --lts && nvm use --lts`; re-run check |
| `check-prereqs.js` fails — wrong active branch | `git -C nextjs-feature-flag-exercise checkout exercise-1`; re-run check |
| `check-prereqs.js` fails — pnpm not found | `npm install -g pnpm`; re-run check |
| Server validation fails (`build` / `lint` / `test`) | Read full error output; fix the reported issue in the exercise codebase or environment; re-run the failing command; do not advance until exit 0 |
| Client validation fails (`build` / `lint`) | Same as above — fix the reported issue; re-run |
| `git remote -v` missing `upstream` | `git -C nextjs-feature-flag-exercise remote add upstream https://github.com/<original-owner>/nextjs-feature-flag-exercise.git` |
| `codebase-audit.md` missing a required section | Re-invoke `produce-diagnosis-document` skill for the missing section; never reconstruct content manually |

### E0-S2 failures

| Failure condition | Recovery action |
|---|---|
| `validate-workflow-file.js` — job name not `copilot-setup-steps` | Edit `copilot-setup-steps.yml`: set the exact key `jobs: copilot-setup-steps:` |
| `validate-workflow-file.js` — missing `environment: copilot` | Add `environment: copilot` at job level (not step level) |
| `validate-workflow-file.js` — `timeout-minutes` > 59 | Reduce `timeout-minutes` to ≤ 59 in the job definition |
| `validate-workflow-file.js` — missing `workflow_dispatch` | Add `workflow_dispatch:` under `on:` in the workflow file |
| `check-ai-layer-files.js` shows a missing file | Deploy the missing artifact using the adapt-artifact step from E0-S2 scope; re-run the check |
| Dry-run workflow exits non-zero | Open the Actions run log; identify the failing step; fix the step command or dependencies; re-trigger via `workflow_dispatch`; document the new run ID |

### E0-S3 failures

| Failure condition | Recovery action |
|---|---|
| `check-prereqs.js` fails after E0-S2 | AI Layer deployment may have inadvertently changed node version or branch; re-run E0-S1 T2 prerequisites check and resolve the underlying cause |
| Validation commands fail after E0-S2 | The AI Layer deployment must not have touched exercise source files; inspect recent commits; revert any unintended change |
| `measurement-baseline.md` missing sections | Re-invoke `generate-measurement-template` skill for the missing section; do not fabricate content |
| Go/no-go checklist has a ❌ item | The ❌ item is a blocker; identify which story produced the missing evidence and return to it; resolve the missing AC; re-sign the checklist only after the underlying issue is fixed |

### E0-S4 failures

| Failure condition | Recovery action |
|---|---|
| `check-ai-layer-files.js` shows a missing evidence artifact | Cannot produce closure report without it; return to the responsible story and complete the missing AC before running E0-S4 |
| `timeline-query.js` returns null or 0 elapsed time | Timeline entries are missing for one or more stories; append the missing entries manually using `timeline-id.js` + `datetime.js`; verify with `timeline-query.js --epic EPIC-0` before proceeding |
| `epic1-handoff.md` missing `READY` statement | Edit the document; add the signed statement following `documentation.instructions.md` §3.4 format: `> **READY — EPIC-1 may begin.**` + agent name + timestamp |
| Commit push rejected | Verify fork remote URL: `git -C nextjs-feature-flag-exercise remote get-url origin`; authenticate via SSH or HTTPS personal access token; retry `git push origin exercise-1` |
| Closure report Section 5 shows elapsed time as 0 | Check that `timeline.jsonl` has entries with `epic_id: "EPIC-0"` (inspect with `grep EPIC-0 Docs/agile/timeline.jsonl`); if missing, append entries and re-run |

---

## 5 — EPIC-1 Readiness Checklist

EPIC-1 may begin only when **all 9 items below are ✅**. The authoritative evidence is in:

- [epic0-closure-report.md](../../nextjs-feature-flag-exercise/.agents/closure/epic0-closure-report.md) — DoD checklist, residual risks, decisions record
- [epic1-handoff.md](../../nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md) — starting state, AI Layer coverage, signed `READY` statement

| # | Condition | Evidence source |
|---|---|---|
| 1 | Fork created, cloned, remotes configured (`origin` = personal fork; `upstream` = original repo) | E0-S1 — `codebase-audit.md` Section 1; `git-info.js` output |
| 2 | `exercise-1` confirmed as working base branch; no direct commits to `main` | E0-S1 — `git branch -vv` evidence in audit |
| 3 | All 7 validation commands pass on `exercise-1` (server: build, lint, test; client: build, lint; + `check-prereqs.js`) | E0-S1 AC-4 + E0-S3 T3 re-validation |
| 4 | Codebase audit completed — `codebase-audit.md` with all 8 required sections and R1–R4 risks | E0-S1 AC-5 + AC-6 |
| 5 | AI Layer minimum baseline deployed to fork — `copilot-instructions.md`, instructions, agents, skills, `copilot-setup-steps.yml` | E0-S2 AC-1 through AC-5; `ai-layer-coverage-report.md` |
| 6 | `copilot-setup-steps.yml` dry-run successful — GitHub Actions run ID documented | E0-S2 AC-4; run ID in `ai-layer-coverage-report.md` |
| 7 | Measurement capture template filled to time-zero state — all 9 sections present, placeholders replaced with actual values | E0-S3 AC-4 + AC-5 |
| 8 | Capture method understood and documented — start/end signals, prompt boundary, rework boundary defined | E0-S3 AC-3 |
| 9 | No critical blockers open — all ❌ DoD items from E0-S4 T1 have mitigations recorded | E0-S4 AC-1 + AC-2 |

**Final gate:**

> Open [epic1-handoff.md](../../nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md) Section 6. If the following statement is present, EPIC-1 may begin:
>
> **READY — EPIC-1 may begin.**
>
> If this statement is absent or the file does not exist, return to E0-S4 and complete T3 before proceeding.
