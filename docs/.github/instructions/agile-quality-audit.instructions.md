---
applyTo: agile/stories/**,agile/tasks/**,agile/backlog-index.json
---

# Agile Quality Audit — Always-On Instructions

## Objective

Ensure agile artifacts are reviewed independently with objective quality gates and ownership-fit analysis.

## Mandatory audit checks

1. Run script-based validation for task packs when applicable:
   - `review-task-pack.js` preferred.
2. Confirm metadata/section compliance and dependency consistency.
3. Verify story-task linking and backlog index coherence.
4. Perform ownership-fit audit on every review:
   - responsible agent fit
   - instruction coverage fit
   - skill coverage fit
   - JS function coverage fit

## Ownership-fit decision rule

For each reviewed scope, explicitly decide one of:

- Keep current setup (no change needed)
- Update existing asset (agent/instruction/skill/function)
- Create new asset (agent/instruction/skill/function)

A review is incomplete if this decision is omitted.

## Function-creation governance

Recommend a new JS function only when recurrence is demonstrated (3+ repeated usages) and existing shared functions cannot cover the workflow.

## Reporting standard

Every audit response must include:

1. Validation result summary.
2. Findings with evidence paths.
3. Ownership-fit matrix (agent/instructions/skills/functions).
4. Clear next action recommendation.

## Do not

- Do not let the same authoring agent self-approve artifacts without independent audit.
- Do not rely only on narrative checks when script validators are available.
- Do not suggest broad refactors outside the reviewed scope.
