---
name: audit-agile-artifacts
description: Audit agile stories/tasks with objective validation gates and ownership-fit checks. Use this skill when reviewing backlog artifacts created by another agent and deciding if new agent/instruction/skill/function assets are required.
---

## Context

Use this skill to run an independent, repeatable audit over `Docs/agile/stories/**` and `Docs/agile/tasks/**`. The audit must validate both artifact correctness and execution system fit (responsible agent + instructions + skills + functions).

## Process

1. Identify audit scope (story ID or task set) and read target files.
2. Run objective gates using shared scripts:
   - `node "Docs/.github/functions/review-task-pack.js" "<abs-path-to-Docs/agile>" --story <E?-S?>`
   - Optional deep checks with `validate-task-pack.js` and `sync-backlog-index.js --dry-run`.
3. Record artifact quality findings with evidence paths.
4. Run ownership-fit evaluation:
   - Is the `responsible agent` the best fit for the task type?
   - Are instructions sufficient and specific?
   - Are skills sufficient and reusable?
   - Are JS functions sufficient, or is recurrence high enough to justify a new one?
5. Produce a decision matrix: keep vs create/update (agent/instruction/skill/function).
6. If fixes are applied, rerun the same validation gates and report final status.

## Constraints

- Never approve without at least one script-based validation result.
- Never propose a new JS function without recurrence evidence (3+ repeated usages).
- Never ignore ownership-fit gaps even when task text is technically correct.
- Always keep recommendations minimal and actionable.

## Expected Output

Return a concise audit report containing:

1. Validation command results (pass/fail).
2. Findings table with severity and evidence paths.
3. Ownership-fit table for agent/instructions/skills/functions.
4. Final decision and next actions.
