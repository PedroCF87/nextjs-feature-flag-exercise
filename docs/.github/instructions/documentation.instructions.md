---
applyTo: "**/.agents/closure/**,**/.agents/templates/**,agile/epic*-execution-guide.md"
---

# Documentation — Always-On Instructions

These instructions govern every documentation artifact produced by agents in this workspace: closure reports, handoff documents, friction logs, decisions records, and execution guides.

## Objective

Ensure all produced documents are:

1. **Traceable** — each artifact carries front-matter fields that link it to an epic, story, and producing agent.
2. **Complete** — no section is left as a placeholder; every required field has a real value.
3. **Machine-readable** — front-matter uses a consistent key-value format that can be parsed by scripts.
4. **Cross-referenced** — all links use workspace-relative paths, never absolute file-system paths.

---

## 1 — Naming conventions

| Document type | Filename pattern | Location |
|---|---|---|
| Epic closure report | `epic<N>-closure-report.md` | `<repo>/.agents/closure/` |
| Epic handoff | `epic<N>-handoff.md` | `<repo>/.agents/closure/` |
| Friction log | `friction-log.md` | `<repo>/.agents/` |
| Decisions record | `decisions-record.md` | `<repo>/.agents/` |
| Execution guide | `epic<N>-execution-guide.md` | `docs/agile/` |

**Rules:**
- `<N>` is the zero-padded numeric suffix of the epic (e.g., `0`, `1`, `2`, `3`).
- Never use the epic title in the filename — use only the numeric ID.
- Filenames are `kebab-case` only — no spaces, no uppercase.
- Do not add version suffixes (e.g., `-v2`). Use `Last updated` metadata to track revisions.

---

## 2 — Required front-matter fields

Every documentation artifact must begin with an HTML comment block containing the following fields, one per line:

```markdown
<!-- artifact_id: <document-type-and-epic-N> -->
<!-- epic_id: EPIC-<N> -->
<!-- story_id: <E<N>-S<N> | null> -->
<!-- produced_at: <YYYY-MM-DD HH:MM:SS ±HH> -->
<!-- produced_by: <agent-name> -->
```

**Field rules:**

| Field | Rule |
|---|---|
| `artifact_id` | Must match the filename without `.md` (e.g., `epic0-closure-report`) |
| `epic_id` | Must match the epic's `ID` metadata field exactly (e.g., `EPIC-0`) |
| `story_id` | Story that triggered production; `null` if produced outside a story context |
| `produced_at` | Timestamp from `node "docs/.github/functions/datetime.js"` — never hardcoded |
| `produced_by` | Agent name as it appears in the agent's `.agent.md` filename (without extension) |

**Never omit front-matter.** A document without front-matter is considered incomplete and will fail the DoD check in `check-ai-layer-files.js`.

---

## 3 — Markdown structure rules

### 3.1 Heading hierarchy

- `# H1` — document title only (one per file).
- `## H2` — top-level sections (numbered: `## 1 — Section Name`).
- `### H3` — subsections within a section.
- Never skip levels (e.g., `## H2` directly to `#### H4`).

### 3.2 Tables

- Every table must have a header row and a separator row (`|---|---|`).
- Empty cells must contain `—` (em-dash), never left truly blank.
- Table columns must be consistently wide enough to be readable without a renderer.

### 3.3 Status indicators

Use these consistently across all documents:

| Symbol | Meaning |
|---|---|
| ✅ | Confirmed / passed / complete |
| ⚠️ | Partial / needs attention / known limitation |
| ❌ | Missing / failed / blocking |

### 3.4 Signed statements

Documents that require a formal sign-off must end their final section with:

```
> **<STATEMENT TEXT — e.g., READY — EPIC-1 may begin.>**
>
> Signed: `<agent-name>` at `<datetime.js output>`.
```

This is not optional. A document without a signed statement in its final section will fail the corresponding AC.

### 3.5 No placeholders

Every field, cell, and section must contain real data at the time of commit. Forbidden patterns:

- `<TBD>`, `<placeholder>`, `TODO`, `...`, `N/A` without explanation.
- Sections with only a header and no content.
- Tables with blank cells (use `—` instead).

---

## 4 — Cross-reference linking format

All links to other workspace files must use **workspace-relative paths**, not absolute file-system paths.

**Correct:**
```markdown
[codebase-audit.md](../diagnosis/codebase-audit.md)
[TASK.md](../../../nextjs-feature-flag-exercise/TASK.md)
```

**Forbidden:**
```markdown
[codebase-audit.md](/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md)
```

**Rules:**
- Paths must resolve correctly from the location of the document being written.
- When linking to a heading within a file, use `#heading-slug` anchors.
- Links to files that do not yet exist are allowed only if annotated: `(to be created in <story-id>)`.

---

## 5 — Completeness check by document type

Use these checklists to verify completeness before committing any document.

### `epic-closure-report`

Required sections (5):

- [ ] Front-matter block (5 fields)
- [ ] Section 1 — DoD Checklist: table with `#`, `DoD Item`, `Status`, `Evidence`; all items have a status (no blank rows)
- [ ] Section 2 — Residual Risks: table or `No open risks.`; every ❌ DoD item has an entry here
- [ ] Section 3 — Friction Log Summary: numbered list of top 3 friction points with source story reference
- [ ] Section 4 — Decisions Record: table with `Decision`, `Rationale`, `Story`; at least 2 entries
- [ ] Section 5 — Preparation Time: numeric elapsed time from `timeline-query.js --epic <EPIC_ID>`

### `epic-handoff`

Required sections (6):

- [ ] Front-matter block (5 fields)
- [ ] Section 1 — Starting State: branch + SHA from `git-info.js --branch-ref`; last upstream sync; validation status
- [ ] Section 2 — AI Layer Coverage: table from `check-ai-layer-files.js --table` (not written manually)
- [ ] Section 3 — Task Reference: link to `TASK.md`; key ACs quoted verbatim (not paraphrased)
- [ ] Section 4 — First Story to Execute: story ID + link (or `(pending)` annotation)
- [ ] Section 5 — Known Risks: exactly 3 risks from `codebase-audit.md` with monitoring action
- [ ] Section 6 — Go / No-Go: signed `READY — EPIC-<N> may begin.` statement with timestamp

### `friction-log`

Required structure:

- [ ] Front-matter block (5 fields, `story_id: null` if multi-story)
- [ ] Header row: `# | Story | Timestamp | Description | Impact`
- [ ] At least 1 non-example entry at time of first commit
- [ ] Each entry: timestamp from `datetime.js`, impact one of `high / medium / low`
- [ ] No fabricated or retroactively reconstructed entries (see `friction-log.instructions.md`)

### `decisions-record`

Required structure:

- [ ] Front-matter block (5 fields)
- [ ] Table with columns: `Decision`, `Rationale`, `Story`, `Date`
- [ ] At least 1 entry per story that produced it
- [ ] Decisions are framed as choices made (not observations); each has a clear rationale

### `execution-guide`

Required sections (5):

- [ ] Front-matter block (5 fields)
- [ ] Section 1 — Execution Sequence: table with `Story`, `Responsible Agent`, `Key Inputs`, `Key Outputs`, `Gate`
- [ ] Section 2 — Dependency Rules: sourced from `backlog-index.json`; lists blocking conditions
- [ ] Section 3 — Validation Commands: per-story quick-check commands using functions from `docs/.github/functions/`
- [ ] Section 4 — Gate Failure Recovery: per-story table of `Failure Condition` → `Recovery Action`
- [ ] Section 5 — EPIC-1 Readiness Checklist: links to `epic0-closure-report.md` and `epic1-handoff.md`

---

## 6 — Timestamp and tooling rules

- **Always** use `node "docs/.github/functions/datetime.js"` for `produced_at` and any `signed at` values.
- **Never** hardcode timestamps or copy from other documents.
- **Always** verify output files exist after creation using `node "docs/.github/functions/check-ai-layer-files.js"`.
- **Always** use `git-info.js --branch-ref` for branch + SHA values in handoff documents — never `git log` output copied manually.
