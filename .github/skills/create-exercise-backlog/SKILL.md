---
name: create-exercise-backlog
description: Organize exercises into a complete agile backlog (epics, stories, tasks, and subtasks), with prioritization, dependencies, and acceptance criteria. Use this skill when you need to turn study/implementation goals into an executable plan.
---

## Context

This skill transforms exercise scope into an executable backlog, aligned with agile practices and the validation flow.

## Process

1. **Read source scope**
   - Capture exercises, objectives, and constraints.
2. **Define epics**
   - One epic per macro-outcome.
3. **Decompose stories**
   - Small, testable, value-oriented stories.
4. **Break down into tasks/subtasks**
   - Granularity sufficient for incremental execution.
5. **Prioritize and chain**
   - Assign `P0-P3` and `depends_on`.
6. **Validate completeness**
   - Every item has acceptance criteria and definition of done.

## Expected output

- Markdown for epics, stories, and tasks.
- Backlog index with order and dependencies.

## Constraints

- All output artifacts must be written in **English** (epics, stories, tasks, acceptance criteria, and narrative text).
- Do not generate items without acceptance criteria.
- Do not create circular dependencies.
- Do not mix epics with low-level technical tasks.
- Every story heading inside an epic's section 7 (Candidate stories) must be a Markdown link to the story file as soon as the story file is created.
- Every task heading inside a story's section 4 (Tasks) must be a Markdown link to the task file when the task has its own file.
- Never leave a cross-artifact reference as plain text when the target file already exists.
