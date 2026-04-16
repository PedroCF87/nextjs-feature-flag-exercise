# Measurement Baseline — Exercise 2 — AI-Assisted Run (PIV Loop)

| Field | Value |
|---|---|
| **Exercise** | Exercise 2 — AI-Assisted Run (PIV Loop) |
| **Date** | 2026-04-16 |
| **Executor** | PedroCF87 |
| **Repository** | nextjs-feature-flag-exercise (personal fork) |
| **Branch** | exercise-2 |
| **Last commit SHA** | 5567feb fix(task): mark acceptance criteria as completed for feature flag filtering |
| **Node.js version** | v22.18.0 |
| **pnpm version** | 10.28.2 |
| **Created at** | 2026-04-16 17:08:08 -03 |

---

## How to Use This Template

- **Start signal:** clock starts when the first file is edited with implementation intent.
- **End signal:** clock stops when `cd server && pnpm test` and `cd client && pnpm run build` both exit `0` on the working branch.
- **Prompt boundary:** a new prompt is any new user message sent to AI; continuations inside one model response do not count.
- **Rework boundary:** a cycle starts when a previously green check breaks and ends when the check(s) return to green.
- **Confidence capture cadence:** capture at pre-implementation, mid-implementation, and post-validation.

---

## Pre-Implementation State

### Validation commands

| Command | Exit code | Output snippet | Status |
|---|---|---|---|
| `cd server && pnpm run build` | 0 | `tsc — compiled successfully` | ✅ |
| `cd server && pnpm run lint` | 0 | `eslint src — no errors` | ✅ |
| `cd server && pnpm test` | 0 | `26 tests passed` | ✅ |
| `cd client && pnpm run build` | 0 | `tsc + vite build — dist output generated` | ✅ |
| `cd client && pnpm run lint` | 0 | `eslint — no errors` | ✅ |
| `node --version` | 0 | `v22.18.0` | ✅ |
| `pnpm --version` | 0 | `10.28.2` | ✅ |

### AI Layer file presence (Exercise 2 — Claude Code stack)

| Artifact | Expected path | Present |
|---|---|---|
| Global rules (Claude) | `CLAUDE.md` | ✅ |
| Command: validate | `.claude/commands/validate.md` | ✅ |
| Command: implement | `.claude/commands/implement.md` | ✅ |
| Command: review | `.claude/commands/review.md` | ✅ |
| Command: security-review | `.claude/commands/security-review.md` | ✅ |
| Command: commit | `.claude/commands/commit.md` | ✅ |
| Command: plan | `.claude/commands/plan.md` | ✅ |
| Command: create-prd | `.claude/commands/create-prd.md` | ✅ |
| Command: prime | `.claude/commands/prime.md` | ✅ |
| Command: prime-endpoint | `.claude/commands/prime-endpoint.md` | ✅ |
| Skill: agent-browser | `.claude/skills/agent-browser/SKILL.md` | ✅ |
| PRD: Exercise 2 filtering | `.agents/PRDs/feature-flag-filtering-e2.prd.md` | ✅ |
| PRD: Feature flag manager | `.agents/PRDs/feature-flag-manager.prd.md` | ✅ |
| Reference: backend | `.agents/reference/backend.md` | ✅ |
| Reference: backend-patterns | `.agents/reference/backend-patterns.md` | ✅ |
| Reference: frontend | `.agents/reference/frontend.md` | ✅ |
| Reference: frontend-patterns | `.agents/reference/frontend-patterns.md` | ✅ |
| Reference: sql-js-constraints | `.agents/reference/sql-js-constraints.md` | ✅ |

---

## Measurement Dimensions (Reference)

> These definitions are fixed. Capture values in the sections below; do not modify this reference block.

- **Time:** elapsed wall-clock time from first implementation code change to green validation state (`cd server && pnpm test` and `cd client && pnpm run build` exit `0`).
- **Prompt count:** total number of distinct AI prompts sent by the user; follow-up prompts count, same-response self-corrections do not.
- **Rework cycles:** one cycle begins when a previously green check breaks and ends when it returns to green; simultaneous broken checks fixed together count as one cycle.
- **Confidence level:** self-assessed 1–5 score at three checkpoints.

**Confidence scale anchors:**
- **1:** no idea where to start
- **3:** clear direction, uncertain edge cases
- **5:** execution is mechanical, no surprises expected

---

## Time Capture

| Field | Value |
|---|---|
| **Start timestamp (implementation)** | 2026-04-16 15:07:52 -03 |
| **End timestamp (implementation)** | 2026-04-16 16:49:00 -03 |
| **Elapsed (implementation only)** | 101 min (1h 41m) |
| **Prep time (E2-S1 + E2-S2)** | 183 min (3h 03m) active |
| **Total active time (S1–S4)** | 284 min (4h 44m) |

### Time per story (git commit-based)

| Story | First commit | Last commit | Elapsed (min) | Notes |
|---|---|---|---|---|
| E2-S0 (Planning) | 2026-04-16 01:38:59 -03 | 2026-04-16 02:57:04 -03 | ~78 | Epic revision, story scaffold, task packs, dependency fixes |
| E2-S1 (AI Layer) | 2026-04-16 02:57:04 -03 | 2026-04-16 03:58:54 -03 | ~62 | CLAUDE.md, commands, skills, PRD, reference docs |
| E2-S2 (Repo config) | 2026-04-16 12:29:00 -03 | 2026-04-16 15:07:52 -03 | ~121 active | 159 min wall-clock; ~38 min waiting for GitHub Actions CI |
| E2-S3 (Server impl) | 2026-04-16 15:07:52 -03 | 2026-04-16 15:53:58 -03 | ~46 | Types, validation, service, routes, tests |
| E2-S4 (Client impl) | 2026-04-16 15:53:58 -03 | 2026-04-16 16:49:00 -03 | ~55 | Filter controls, API client, App wiring, Radix fix, PR review fixes |
| **Prep (S1+S2)** | — | — | **183** | AI Layer + repo configuration + CI validation |
| **Implementation (S3+S4)** | — | — | **101** | Feature code: server filtering + client UI |
| **Total (S1–S4)** | — | — | **284** | Active time (excluding sleep break between S1 and S2) |
| **Total (S0–S4)** | — | — | **~362** | Including planning session |

> **Source:** git commit timestamps (`git log --format="%ai %s" exercise-2`). Sleep break of ~8.5h between E2-S1 (03:58) and E2-S2 (12:29) excluded from active time.

---

## Prompt Count Tally

| Phase | Prompt count | Notes |
|---|---|---|
| Plan (E2-S0) | 5 | Epic revision, story scaffold, task-pack creation, dependency fixes, backlog sync |
| AI Layer (E2-S1) | 3 | CLAUDE.md + commands + skills + PRD + reference docs — single large session |
| Repo Config (E2-S2) | 10 | 7 tasks × prompt + story revision + PR #34 security fix + validator update |
| Server (E2-S3) | 3 | Implementation + curl tests + validation |
| Client (E2-S4) | 5 | Implementation + Radix fix + PR creation + PR review analysis + fix commits |
| Measurement (E2-S5) | 8 | One per task (T1–T8 estimated) |
| **Total** | **34** | Conservative count from session task invocations |

---

## Rework Log

| # | Regression description | Affected command | Time to fix |
|---|---|---|---|
| 1 | Radix UI `SelectItem` crashes on `value=""` — runtime error after initial implementation was build/lint/test green; sentinel value `"all"` required | client runtime | ~15 min |

> **Total rework cycles:** 1
>
> **Note:** The 4 issues found by the Claude PR review (timer cleanup, stale ref, `.max(200)`, owner asymmetry) were caught during the code review phase, not as regressions of green checks. These are counted as review fixes, not rework cycles.

---

## Confidence Self-Assessment

| Checkpoint | Score (1–5) | Justification |
|---|---|---|
| Pre-implementation | 4 | CLAUDE.md + PRD + plan + on-demand context docs provided clear structure; SQL.js patterns well-documented from Exercise 1 audit |
| Mid-implementation | 5 | Server filtering done and tested; client UI straightforward with known Radix/TanStack patterns |
| Post-validation | 5 | All 11 TASK.md criteria verified; 26 tests pass; build + lint green on both server and client; PR reviewed |

Scale: 1 = no idea where to start · 3 = clear direction but uncertain about edge cases · 5 = execution is mechanical, no surprises.

---

## Friction Log

| Timestamp | Phase | Friction point | Impact (low/medium/high) | Mitigation |
|---|---|---|---|---|
| 2026-04-16 12:29–15:07 | E2-S2 | GitHub Actions CI wait time (~38 min across multiple validator runs and workflow fixes) | medium | Parallelized local work during CI waits; batched pushes |
| 2026-04-16 16:10 | E2-S4 | Radix UI `SelectItem` crashes on empty string value — runtime error not caught by build/lint/tests | medium | Changed sentinel to `"all"` and added filter in onChange handler; ~15 min fix |
| 2026-04-16 16:45 | E2-S4 | Claude PR review surfaced 4 issues (timer cleanup, stale ref, .max(200), owner asymmetry) | low | All fixes applied in single commit; improved code quality but not blocking |

> **Full friction log:** to be consolidated in E2-S5-T4.

---

## Go/No-Go Checklist for EPIC-2

- [x] `exercise-2` branch created from `exercise-1`.
- [x] AI Layer for Exercise 2 deployed (CLAUDE.md, 9 commands, 1 skill, 2 PRDs, 5 reference docs).
- [x] All 5 validation commands pass on `exercise-2` (exit 0 — captured in E2-S5-T1 report).
- [x] All 11 TASK.md acceptance criteria verified with file:line evidence.
- [x] Measurement capture template filled with all dimensions (time, prompts, rework, confidence).
- [x] No critical blockers open (all checks green).

**Status:** COMPLETE
**Signed at:** 2026-04-16 17:08:08 -03

> COMPLETE — Exercise 2 measurement captured.
