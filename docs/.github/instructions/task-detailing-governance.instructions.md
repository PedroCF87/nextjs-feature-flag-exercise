---
applyTo: "agile/stories/**,agile/tasks/**"
---
# Task Detailing Governance — Always-On Instructions

## Objective

Guarantee that every task generated from a story is unambiguous, architecturally
sound, security-aware, and directly executable without hidden assumptions.

## Scope

Applies to:

- Story files in `Docs/agile/stories/`
- Task files in `Docs/agile/tasks/`
- Any agent producing or refining task-level artifacts

## Core quality standard

Every task file must be executable by a different agent with no additional
clarification request.

A task is considered low quality if any of these is true:

- ambiguous expected outcome
- missing dependency or blocking condition
- no validation evidence format
- missing security constraints
- missing architecture boundary guidance

## Mandatory task structure

Each task file must include all sections below:

1. `## Metadata`
2. `## 1) Task statement`
3. `## 2) Verifiable expected outcome`
4. `## 3) Detailed execution plan`
5. `## 4) Architecture and security requirements`
6. `## 5) Validation evidence`
7. `## 6) Definition of Done`

## Mandatory metadata fields

Task files must include these exact rows in the metadata table:

- `**ID**`
- `**Priority**`
- `**Status**`
- `**Responsible agent**`
- `**Depends on**`
- `**Blocks**`
- `Created at`
- `Last updated`

Valid values:

- `Priority`: `P0`, `P1`, `P2`, `P3`
- `Status`: `Draft`, `In Progress`, `Done`, `Blocked`

## Detailing rules

### 1) Expected outcome must be testable

Each task must declare outcomes that are objectively verifiable (file exists,
command exits with code `0`, checklist item signed, dependency resolved).

### 2) Execution plan must be deterministic

The plan must list ordered steps and explicit stop conditions.

### 3) Security and architecture section is required

Must include at least:

- input validation requirement
- secrets handling rule (never hardcode)
- rollback/fallback note
- architecture boundary rule (no cross-layer shortcuts)

### 4) Validation evidence must include command-level traceability

Include command(s), exit code(s), output summary, and affected files.

### 5) BDD verification signal

Tasks must include at least one `Given / When / Then` validation block.

## Cross-linking rules

- Story references to task headings in section `## 4) Tasks` must be markdown links
  once task files exist.
- Task metadata `Story` row should link back to the parent story file.

## Regeneration and index rules

After creating or editing task files:

1. Preferred (one-shot) recurring review workflow:
   `node "Docs/.github/functions/review-task-pack.js" "<abs-path-to-Docs/agile>" --story <E?-S?>`
2. Manual fallback (if you need separate control):
   - Validate task quality:
     `node "Docs/.github/functions/validate-task-pack.js" "<abs-path-to-Docs/agile>" --story <E?-S?>`
   - Regenerate backlog index:
     `node "Docs/.github/functions/sync-backlog-index.js" "Docs/agile"`

## Do not

- Do not leave placeholders (`TODO`, `TBD`, `<placeholder>`, `...`).
- Do not mark tasks as `Done` without validation evidence.
- Do not omit dependency links when upstream items exist.
- Do not merge story-level and task-level responsibilities in one file.
