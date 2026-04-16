# ADR-001 — Switch from GitHub Issue-driven to Local Execution Model

## Metadata

- **Status:** Accepted
- **Date:** 2026-04-15
- **Deciders:** Pedro (exercise candidate)
- **Scope:** Epic 1 (E1-S1-T2 onward)

---

## Context

Epic 1 was originally planned with a **GitHub Issue-driven execution model**: each task would be triggered from a GitHub Issue, executed by the Copilot cloud agent, committed to a feature branch, and merged via PR.

After completing E1-S0 (planning automation) and E1-S1-T1 (first analysis task), **persistent problems with the Copilot cloud environment** made the Issue-driven workflow unreliable:

- Environment instability caused failed task executions.
- The overhead of Issue creation → cloud agent pick-up → feature branch → PR → merge added latency without value for solo local work.
- The cloud agent's inability to reliably execute made progress dependent on an unstable external service.

---

## Decision

**Switch to a local execution model** for all remaining Epic 1 tasks (E1-S1-T2 onward).

The local model works as follows:

1. Read the task file directly from `docs/agile/tasks/`.
2. Execute the task in VS Code using the local agent.
3. Validate changes using the standard build/lint/test commands.
4. Fix any issues found in validation.
5. Repeat validation until all checks pass.
6. Commit to `exercise-1` with a conventional commit message referencing the task ID.
7. Update the task file Status to `Done`.

---

## Consequences

### What we gain

- **No dependency on Copilot cloud environment** — eliminates the current blocker.
- **Faster iteration** — no Issue creation/pick-up delay, no PR ceremony per task.
- **Direct terminal access** — immediate debugging and validation.
- **Simpler workflow** — read task → execute → validate → commit.

### What we lose

- **GitHub Issue audit trail** — mitigated by updating task file `Status` field and using descriptive commit messages with task IDs.
- **PR as atomic review unit** — mitigated by conventional commits with one commit per task.

### What stays the same

- Task granularity — same 17 tasks, same acceptance criteria.
- Validation gates — same `pnpm run build/lint/test` commands, same zero-error threshold.
- Sequential discipline — same task-by-task execution order.
- Manual story checkpoints — remain in place.
- DoD evidence collection — identical process.
- E1-S0 work — already completed via Issues, preserved as historical record.

---

## Artifacts Updated

| Artifact | Change |
|---|---|
| Epic 1 | Execution model, scope, DoD, risks, AI Layer map, evidence |
| Stories E1-S1 to E1-S4 | Removed `execute-task-from-issue` skill, updated execution model |
| 10 task files (E1-S1-T2 onward) | Changed agent references to `(local VS Code)` |
| `backlog-index.json` | Re-synced (68 items, 0 dependency cycles) |

## New AI Layer Artifacts Created

| Artifact | Purpose |
|---|---|
| `.github/agents/task-implementer.agent.md` | Local task execution agent (was referenced but never created) |
| `.github/skills/execute-task-locally/SKILL.md` | Local equivalent of `execute-task-from-issue` with validation loop |
| Updated `coding-agent.instructions.md` | Formalized implement → validate → fix → re-validate cycle |

---

## References

- [Epic 1](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) — updated execution model section
- [execute-task-from-issue SKILL.md](../../.github/skills/execute-task-from-issue/SKILL.md) — original Issue-driven skill (preserved for Epic 2+)
