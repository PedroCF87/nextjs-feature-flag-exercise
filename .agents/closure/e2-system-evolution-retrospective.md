# Epic 2 — System Evolution Retrospective

## Metadata

| Field | Value |
|---|---|
| **Artifact ID** | e2-system-evolution-retrospective |
| **Produced at** | 2026-04-16 17:19:36 -03 |
| **Produced by** | measurement agent |
| **Source** | `.agents/baseline/epic2-friction-log.md` — entries #2 and #3 |
| **Workshop references** | Excal-1 (System Evolution = Phase 4 of PIV Loop), Excal-5 ("3+ times = command" heuristic) |

---

## Pattern Definitions

- **Pattern A (Preventable):** The system had the capability to prevent the friction, but the process didn't invoke it. Fix: adjust the process — add a step, enforce a checklist gate, or modify an existing command.
- **Pattern B (Emergent):** A new constraint was discovered during implementation that no existing system artifact could have caught. Fix: add new knowledge to the system — update an on-demand context doc, add a global rule, or create a new command.

---

## 1 — System Evolution Entries Classification

| # | Description | Pattern | Root Cause | Time Cost | Artifact Updated |
|---|-------------|---------|------------|-----------|------------------|
| SE-1 | Radix UI `SelectItem` crashes on `value=""` — runtime error invisible to tsc/eslint/vitest | **B (Emergent)** | Undocumented Radix constraint: `Select` treats empty string as "no value" and crashes internally. TypeScript types accept `string` without enforcing non-empty. | ~15 min | `.agents/reference/frontend-patterns.md` — added Radix SelectItem constraint note |
| SE-2 | Claude PR review found 4 post-green issues (timer cleanup, stale ref, .max(200), owner asymmetry) | **A (Preventable)** | The `/review` and `/security-review` Claude commands existed but were not invoked before creating the PR. The workflow went: implement → validate (build/lint/test) → PR — skipping the semantic review step. | ~20 min | Recommendation: add `/review` to pre-PR checklist in `CLAUDE.md` |

**Totals:** 1 Pattern A (Preventable), 1 Pattern B (Emergent). Combined time cost: ~35 min.

---

## 2 — "3+ Times = Command" Audit

The Excal-5 heuristic states: if you type (or prompt) the same instruction 3 or more times, extract it into a reusable command.

Review of the entire Exercise 2 session:

| Repeated Instruction | Times Observed | Already a Command? | Should Be a Command? | Action |
|---------------------|----------------|--------------------|-----------------------|--------|
| "Run build + lint + test on server, then build + lint on client" | ~5× (once per story validation + final suite) | Yes — `/validate` | Already covered | No action needed |
| "Read task file, extract context, implement, validate" | ~8× (one per task) | Yes — `/implement` | Already covered | No action needed |
| "Update task status to Done, fill sections 5–7, update timestamp" | ~8× (one per task) | No | Below threshold for *code* command — this is an agile ceremony pattern | Monitor; consider extracting if Exercise 3 repeats it |
| "Add ✅ prefix to task heading in parent story" | ~8× (one per task) | No | Below threshold for *code* command — trivial text edit | Monitor; same as above |
| "Check git log for timestamps" | 2× | No | Below threshold | No action |
| "Get current timestamp" | ~6× | Partially — `datetime.js` exists for agile artifacts | Could add a `/timestamp` command | Low priority — single-line node invocation |

**Verdict:** No missed extraction opportunities identified for *implementation* workflows. The `/validate` and `/implement` commands covered all recurring coding patterns. The agile ceremony patterns (task completion updates, story checkmarks) are repetitive but are metadata edits, not implementation workflows — they would benefit from a task-completion script rather than a Claude command.

---

## 3 — Decision Rule Application

### SE-1 (Pattern B — Emergent): Radix SelectItem constraint

**Q: What system change now captures this for future sessions?**

The Radix `SelectItem` `value=""` constraint has been added to `.agents/reference/frontend-patterns.md`. In future exercises, when the agent reads the frontend patterns on-demand context document before implementing a Select component, it will encounter the rule:

> Never use `value=""` on a Radix `SelectItem`. Use a sentinel string (e.g., `"all"`) and filter it in the `onChange` handler.

This converts the emergent pattern into **eliminated risk** for all future sessions against this codebase. The fix is durable because:
1. It lives in the on-demand context that `/implement` and `/prime-endpoint` commands instruct the agent to read.
2. It is specific enough to be actionable (sentinel pattern + handler filter) rather than vague ("be careful with Radix").

**Residual risk:** Other Radix components may have similar undocumented constraints. A comprehensive Radix edge-case sweep is out of scope but could be added to a future reference doc proactively.

### SE-2 (Pattern A — Preventable): Local review not run before PR

**Q: What system change would have prevented this?**

Adding a mandatory step to the implementation workflow:

```
implement → validate (build/lint/test) → /review → /security-review → PR
```

Concretely, the `CLAUDE.md` "Validation Commands" section or the `/implement` command could include:

```
## Pre-PR Checklist
- [ ] /validate passes (build + lint + test)
- [ ] /review run locally — zero critical findings
- [ ] /security-review run locally — zero vulnerabilities
```

This shifts review feedback from **async** (create PR → wait for Claude review → read comments → fix → push) to **sync** (run locally → fix immediately → create clean PR). Estimated time savings: 15–20 min per PR cycle by eliminating the async round-trip.

**Why it wasn't done:** The workflow was designed with the assumption that PR review is the review gate. The local commands existed but were treated as optional rather than mandatory. The fix is a process change (checklist enforcement), not a technical change.

---

## 4 — Recommendations for Epic 3

### R1: Add `/review` to the pre-PR gate in `CLAUDE.md`

**Priority:** High. **Effort:** 5 min.
Update the "Validation Commands" section in `CLAUDE.md` to include `/review` and `/security-review` as mandatory steps before PR creation. This directly addresses SE-2 and would have saved ~20 min in this exercise.

### R2: Create a Radix/UI-library edge-case reference section

**Priority:** Medium. **Effort:** 15 min.
Expand `.agents/reference/frontend-patterns.md` with a dedicated "UI Library Gotchas" section that documents known runtime constraints not caught by static analysis. Start with the `SelectItem` issue (SE-1) and proactively add any other known Radix/Tailwind/TanStack edge cases from documentation.

### R3: Monitor agile ceremony repetition for automation

**Priority:** Low. **Effort:** Defer to Epic 3 measurement.
The "update task to Done + add ✅ to story" pattern was repeated 8× in this exercise. If Epic 3 has similar volume, extract a `complete-task.js` script that: (a) sets Status → Done in the task file, (b) updates Last updated, (c) adds ✅ to the parent story heading, (d) syncs the backlog index. This follows the "3+ times = command" heuristic — the pattern has already exceeded the threshold across exercises, but a single-exercise validation is prudent before investing in tooling.
