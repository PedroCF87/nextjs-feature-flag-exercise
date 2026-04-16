---
applyTo: agile/**/*.md,manuals/**/*.md
---

# Agile Planning — Always-On Instructions

These instructions guide the creation and maintenance of agile planning artifacts in this workspace.

## Objective

Standardize exercise organization into:

- Epics
- Stories
- Tasks
- Subtasks

with traceability, prioritization, and explicit dependencies.

## Language

All artifacts must be written in **English**: epic titles, story descriptions, acceptance criteria, task names, and all narrative text.

## Mandatory structure

### Epics

Each epic must include:

1. Business objective
2. Scope (in/out)
3. Definition of Done (DoD)
4. Risks
5. Dependencies
6. Success metrics

### Stories

Mandatory format:

- `As <persona>, I want <action> so that <benefit>.`

Acceptance criteria in BDD:

- Given ...
- When ...
- Then ...

### Tasks and subtasks

Each task must include:

1. Verifiable expected outcome
2. Dependencies (`depends_on`)
3. Definition of done
4. Validation evidence

## Prioritization rules

- `P0`: blocks exercise progress
- `P1`: essential to deliver the objective
- `P2`: important, but can come after the main objective
- `P3`: incremental improvement

## Consistency rules

- Every story must belong to 1 epic.
- Every task must belong to 1 story.
- Every dependency must point to an existing item.
- Do not create items without acceptance criteria or planned validation.

## Cross-document linking rule

Whenever an artifact references another artifact by name, **link the name to the file using a relative Markdown link**.

- **Epic → story:** every story heading inside section 7 (Candidate stories) must be a link: `### [Story X — Title](../agile/stories/story-<id>-<slug>.md)`.
- **Story → task:** every task heading in section 4 (Tasks) must be a link when the task has its own file: `### [Task X — Title](../tasks/task-<id>-<slug>.md)`.
- **Story → epic:** the `Epic` field in the story's Metadata table must be a link when the epic file exists: `[EPIC-N — Title](../../epics/<file>.md)`.

Always apply links immediately — never leave a reference as plain text when the target file already exists.

## Recommended artifacts

- `Docs/agile/epics/`
- `Docs/agile/stories/`
- `Docs/agile/tasks/`
- `Docs/agile/backlog-index.json`

## Do not

- Do not create technical epics without a value objective.
- Do not create generic stories without persona and benefit.
- Do not create tasks that are too large for incremental execution.
- Do not omit blockers and risks.
