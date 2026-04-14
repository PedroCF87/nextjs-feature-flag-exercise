# Measurement Baseline — Exercise 1 — Baseline

| Field | Value |
|---|---|
| **Exercise** | Exercise 1 — Baseline |
| **Date** | [FILL IN — YYYY-MM-DD] |
| **Executor** | [FILL IN — your name] |
| **Repository** | nextjs-feature-flag-exercise (personal fork) |
| **Branch** | [FILL IN — output of: git branch --show-current] |
| **Last commit SHA** | [FILL IN — output of: git log --oneline -1] |
| **Node.js version** | [FILL IN — output of: node --version] |
| **pnpm version** | [FILL IN — output of: pnpm --version] |
| **Created at** | 2026-04-14 19:49:31 -03 |

---

## How to Use This Template

- **Start signal:** clock starts when the first file is edited with implementation intent.
- **End signal:** clock stops when `cd server && pnpm test` and `cd client && pnpm run build` both exit `0` on the working branch.
- **Prompt boundary:** a new prompt is any new user message sent to AI; continuations inside one model response do not count.
- **Rework boundary:** a cycle starts when a previously green check turns non-zero and ends when the check(s) return to green.
- **Confidence capture cadence:** capture at pre-implementation, mid-implementation, and post-validation.

---

## Pre-Implementation State

### Validation commands

| Command | Exit code | Output snippet | Status |
|---|---|---|---|
| `cd server && pnpm run build` | [FILL IN] | [FILL IN] | ✅ / ❌ |
| `cd server && pnpm run lint` | [FILL IN] | [FILL IN] | ✅ / ❌ |
| `cd server && pnpm test` | [FILL IN] | [FILL IN] | ✅ / ❌ |
| `cd client && pnpm run build` | [FILL IN] | [FILL IN] | ✅ / ❌ |
| `cd client && pnpm run lint` | [FILL IN] | [FILL IN] | ✅ / ❌ |
| `node --version` | [FILL IN] | [FILL IN] | ✅ / ❌ |
| `pnpm --version` | [FILL IN] | [FILL IN] | ✅ / ❌ |

### AI Layer file presence

| Artifact | Expected path | Present |
|---|---|---|
| Global rules | `.github/copilot-instructions.md` | ✅ / ❌ |
| Exercise instructions | `.github/instructions/feature-flag-exercise.instructions.md` | ✅ / ❌ |
| Coding agent instructions | `.github/instructions/coding-agent.instructions.md` | ✅ / ❌ |
| RDH workflow analyst agent | `.github/agents/rdh-workflow-analyst.agent.md` | ✅ / ❌ |
| Codebase gap analyst agent | `.github/agents/codebase-gap-analyst.agent.md` | ✅ / ❌ |
| Technical manual writer agent | `.github/agents/technical-manual-writer.agent.md` | ✅ / ❌ |
| Analyze RDH workflow skill | `.github/skills/analyze-rdh-workflow/SKILL.md` | ✅ / ❌ |
| Gap analysis skill | `.github/skills/gap-analysis/SKILL.md` | ✅ / ❌ |
| Write technical manual skill | `.github/skills/write-technical-manual/SKILL.md` | ✅ / ❌ |
| System evolution retro skill | `.github/skills/system-evolution-retro/SKILL.md` | ✅ / ❌ |
| Copilot setup steps workflow | `.github/workflows/copilot-setup-steps.yml` | ✅ / ❌ |

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
| **Start timestamp** | [FILL IN — node "docs/.github/functions/datetime.js"] |
| **End timestamp** | [FILL IN — node "docs/.github/functions/datetime.js"] |
| **Elapsed** | [FILL IN — node "docs/.github/functions/elapsed-time.js" "\<start\>" "\<end\>"] |

---

## Prompt Count Tally

| Phase | Prompt count | Notes |
|---|---|---|
| Plan | [FILL IN] | |
| Implement | [FILL IN] | |
| Validate | [FILL IN] | |
| **Total** | [FILL IN] | |

---

## Rework Log

| # | Regression description | Affected command | Time to fix |
|---|---|---|---|
| 1 | [FILL IN] | [FILL IN] | [FILL IN] |

---

## Confidence Self-Assessment

| Checkpoint | Score (1–5) | Justification |
|---|---|---|
| Pre-implementation | [FILL IN] | |
| Mid-implementation | [FILL IN] | |
| Post-validation | [FILL IN] | |

Scale: 1 = no idea where to start · 3 = clear direction but uncertain about edge cases · 5 = execution is mechanical, no surprises.

---

## Friction Log

Record blockers, ambiguities, or rework moments observed during implementation.

| Timestamp | Phase | Friction point | Impact (low/medium/high) | Mitigation |
|---|---|---|---|---|
| [FILL IN] | [FILL IN] | [FILL IN] | [FILL IN] | [FILL IN] |

---

## Go/No-Go Checklist for EPIC-1

- [ ] Fork created, cloned, remotes configured (`origin` + `upstream`).
- [ ] `exercise-1` confirmed as working base branch.
- [ ] All 7 validation commands pass on `exercise-1`.
- [ ] Codebase audit completed (E0-S1 evidence).
- [ ] AI Layer minimum baseline deployed to fork (E0-S2 evidence).
- [ ] `copilot-setup-steps.yml` dry-run successful (run ID documented).
- [ ] Measurement capture template filled to "time zero" state.
- [ ] Capture method understood and documented.
- [ ] No critical blockers open.

**Status:** [FILL IN — READY / NOT READY]
**Signed at:** [FILL IN — node "docs/.github/functions/datetime.js"]
