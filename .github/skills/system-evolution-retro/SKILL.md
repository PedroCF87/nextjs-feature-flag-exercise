---
name: system-evolution-retro
description: Turn recurring failures into system improvements by adjusting rules, commands, context, and templates to increase validation loop predictability. Use this skill when an error repeats and you need to fix the system root cause, not only the symptom.
---

## Context

In the workshop method, quality compounds over cycles. When the same error reappears, the right action is not only fixing code: it is evolving the system (AI Layer) that allowed the error.

This skill applies practical retrospective on:

- Global Rules (`CLAUDE.md`, `copilot-instructions.md`, instructions)
- Commands (`.claude/commands/*`)
- Skills (`.claude/skills/*/SKILL.md`)
- On-demand context (`ai-context`, reference docs)
- Plan/manual templates and checklists

## Process (4 steps)

1. **Collect recurring failures**
   - Gather recent repeated errors (build, lint, typecheck, tests, workflow failures).
   - Group by pattern: context error, process error, validation error, output error.

2. **Diagnose root cause**
    - Ask: "If the system were better configured, would this error have been avoided?"
    - Classify the main cause into one of these categories:
       - Missing or ambiguous rules
       - Incomplete/out-of-order command
       - Insufficient reference context
       - Template/checklist missing critical gate

3. **Apply minimum adjustment in the correct artifact**
   - If it is a recurring rule issue → update instruction/global rules.
   - If it is execution sequencing → adjust command/process.
   - If it is missing context → add/update supporting document.
   - If it is operational consistency failure → update template/checklist.
   - Keep changes small, specific, and auditable.

4. **Revalidate in a new cycle**
   - Run the workflow again with the applied improvement.
   - Verify recurrence rate decreased.
   - Record result and decision for future maintenance.

## Expected Output Format

1. **Recurrence summary**
   - Which errors repeated and how often.
2. **Root cause diagnosis**
   - Category + main evidence.
3. **System evolution plan**
   - Artifact to change + minimal proposed change + expected impact.
4. **Validation checklist**
   - Which commands will prove the adjustment worked.
5. **Decision record**
   - What changed, why, and when to review again.

## Decision Rules

- Prioritize changes with highest effect on repeatability and clarity for agents.
- Prefer systemic adjustments before local patches.
- If there is a trade-off, choose the solution that reduces ambiguity for future runs.

## Constraints

- Do not turn retrospective into broad rewrites without need.
- Do not confuse isolated incidents with recurring patterns.
- Do not suggest out-of-scope stack migrations to solve immediate operational problems.
- Do not conclude without practical revalidation.

## Final Checklist

- [ ] There is recurrence evidence (not an isolated case).
- [ ] Root cause was correctly classified.
- [ ] Proposed adjustment points to the right artifact.
- [ ] Plan includes explicit validation in a new cycle.
- [ ] Learning was recorded to prevent process regression.
