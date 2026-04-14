---
name: write-technical-manual
description: Generate detailed, actionable technical manuals based on real repository evidence, including steps, validation, common errors, and file:line references. Use this skill when you need to turn RDH patterns into practical guides for study, execution, and interview preparation.
---

## Context

This skill guides writing technical manuals for humans in the RDH workspace. The focus is creating **executable and verifiable** material, not generic text.

Evidence target repositories:

- `resident-health-workshop-resources` (method and commands)
- `nextjs-ai-optimized-codebase` (Gold Standard)
- `nextjs-feature-flag-exercise` (Training Ground)

## Process (5 steps)

1. **Define manual scope**
   - Classify type: `command`, `feature`, `transformation`, `interview`.
   - Define audience (beginner/intermediate/senior) and expected result.

2. **Collect evidence**
   - Read files directly related to scope.
   - Record key points with `file:line` references.
   - Prioritize canonical sources (`CLAUDE.md`, `CODEBASE-GUIDE.md`, `.claude/commands`, `TASK.md`).

3. **Structure content**
    - Build in this order:
       1) Objective and Context
       2) Prerequisites
       3) Numbered step-by-step
       4) Validation checklist
       5) Common errors and prevention
       6) References

4. **Write with real examples**
   - Use real file names, flows, and workspace patterns.
   - Explain trade-offs (e.g., what is mandatory in the exercise vs what is incremental improvement).
   - Avoid abstractions without practical action.

5. **Review completeness**
   - Confirm the manual answers: **what**, **why**, **how**, and **how to validate**.
   - Confirm `file:line` traceability exists for critical points.

## Expected Output Format

When generating a new manual, use this minimum structure:

1. `# Title`
2. `## Objective and context`
3. `## Prerequisites`
4. `## Step-by-step`
5. `## Validation checklist`
6. `## Common errors (and how to avoid them)`
7. `## References`

If the manual requires metadata, use frontmatter:

```yaml
---
title: <titulo>
scope: <command|feature|transformation|interview>
repos:
  - resident-health-workshop-resources
  - nextjs-ai-optimized-codebase
  - nextjs-feature-flag-exercise
updatedAt: <YYYY-MM-DD>
---
```

## Quality Rules

- Each section must have objective, actionable content.
- Procedures must be numbered and sequential.
- Checklist must contain concrete validation commands.
- Recommendations must distinguish:
   - **Essential (now)**
   - **Incremental (later)**

## Constraints

- Do not write manuals with generic “best practices” without repository evidence.
- Do not omit technical validation.
- Do not confuse exercise scope with production scope.
- Do not recommend out-of-scope changes as mandatory prerequisites.
- Do not replace analysis with code implementation.

## Final Checklist

Before concluding:

- [ ] The manual is action-oriented (not only explanatory).
- [ ] There are explicit validation commands/checks.
- [ ] There are real examples and `file:line` references.
- [ ] The text clearly distinguishes essential vs incremental priority.
- [ ] Content is consistent with PIV Loop and RDH conventions.
