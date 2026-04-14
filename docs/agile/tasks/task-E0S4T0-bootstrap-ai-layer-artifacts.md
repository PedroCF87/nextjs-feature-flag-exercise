# Task E0-S4-T0 — Bootstrap AI Layer artifacts

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S4-T0 |
| **Story** | [E0-S4 — Preparation Closure and Handoff to EPIC-1](../stories/story-E0S4-preparation-closure.md) |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Done |
| **Responsible agent** | `project-adaptation-analyst` |
| **Depends on** | [E0-S3 — Definition of Measurement Baseline](../stories/story-E0S3-measurement-baseline.md) |
| **Blocks** | E0-S4-T1, E0-S4-T2, E0-S4-T3, E0-S4-T5 |
| Created at | 2026-04-11 20:50:15 -03 |
| Last updated | 2026-04-14 20:09:58 -03 |

---

## 1) Task statement

As a delivery agent, I want to create the `documentation.instructions.md` instruction file and register the story's opening in the timeline so that downstream tasks T1–T5 have a governance-compliant AI Layer in place before producing any closure artifacts.

> **Execution context:** T0 runs **locally in VS Code** under the Epic 0 local execution rule — no GitHub Issue, no PR, no feature branch. All commits go directly to `exercise-1`.
> The `docs/` folder is inside the fork root. For command consistency, define `REPO_ROOT` first:
> `REPO_ROOT="$(git rev-parse --show-toplevel)"`.
> This task writes only docs-side artifacts. If no file content changes are needed, no commit is required.

---

## 2) Verifiable expected outcome

- `docs/.github/instructions/documentation.instructions.md` exists and contains the 6 required numbered sections (naming conventions, required front-matter fields, markdown structure rules, cross-reference linking format, completeness check, and timestamp/tooling rules) plus an Objective header — 7 `##` headings total.
- `docs/agile/timeline.jsonl` contains a new entry with `action: "create"` and `artifact_id: "E0-S4"`.
- No closure artifact files exist yet (T2/T3 still pending — confirmed by `check-ai-layer-files.js`).

---

## 3) Detailed execution plan

### Step 0 — Get current timestamp

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
node "$REPO_ROOT/docs/.github/functions/datetime.js"
```

Record the output. Use it for `Created at` and `Last updated` in the instruction file.

### Step 1 — Verify `documentation.instructions.md` exists and is structurally correct

> **Note:** `docs/.github/instructions/documentation.instructions.md` was already created in a prior session. This step audits the existing file against the required structure. If it's absent for any reason, create it; otherwise do not overwrite it.

Run the existence check first (it will be repeated in Step 2 for evidence):

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/instructions/documentation.instructions.md"
```

**If `✅`:** continue to Step 2.

**If `❌` (file was deleted or moved):** create it with the following structure.

The file must have YAML front matter at the top:

```markdown
---
applyTo: "**/.agents/closure/**,**/.agents/templates/**,agile/epic*-execution-guide.md"
---
```

Then include these **6 numbered sections** in order (plus an unnumbered `## Objective` before Section 1):

1. **Naming conventions** — filename patterns per document type and location rules.
2. **Required front-matter fields** — every documentation artifact must begin with an HTML comment block:
   ```
   <!-- artifact_id: <document-type-and-epic-N> -->
   <!-- epic_id: EPIC-<N> -->
   <!-- story_id: <E<N>-S<N> | null> -->
   <!-- produced_at: <datetime.js output> -->
   <!-- produced_by: <agent-name> -->
   ```
3. **Markdown structure rules** — heading hierarchy (`# H1` title, `## H2` numbered sections, `### H3` subsections), tables format, status indicators (✅/⚠️/❌), signed statements format.
4. **Cross-reference linking format** — workspace-relative paths only; never absolute paths.
5. **Completeness check by document type** — per-type checklists for `epic-closure-report` (5 sections), `epic-handoff` (6 sections), `friction-log`, `decisions-record`, `execution-guide`.
6. **Timestamp and tooling rules** — always use `datetime.js` for timestamps; always use `git-info.js --branch-ref` for SHA values.

### Step 2 — Verify instruction file was created

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT/docs" \
  ".github/instructions/documentation.instructions.md"
```

**Expected output:** `✅ .github/instructions/documentation.instructions.md`

Stop if `❌` — fix the file creation before proceeding.

### Step 3 — Confirm closure artifacts do not yet exist

```bash
node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" \
  "$REPO_ROOT" \
  ".agents/closure/epic0-closure-report.md" \
  ".agents/closure/epic1-handoff.md"
```

**Expected output:** both lines show `❌`. If either shows `✅`, verify they are not stale artifacts from a previous run before proceeding to T2/T3.

### Step 4 — Get next timeline entry ID

```bash
node "$REPO_ROOT/docs/.github/functions/timeline-id.js" "$REPO_ROOT/docs/agile/timeline.jsonl"
```

Record the returned **string** (format `YYYYMMDD-NNN`, e.g. `20260411-073`).

### Step 5 — Append timeline entry

Append one line to `docs/agile/timeline.jsonl` (no trailing comma, valid JSON):

```json
{"id": "<N>", "timestamp": "<datetime>", "agent": "project-adaptation-analyst", "action": "create", "artifact_type": "story", "artifact_id": "E0-S4", "artifact_file": "docs/agile/stories/story-E0S4-preparation-closure.md", "story": "E0-S4", "epic": "EPIC-0", "notes": "Story E0-S4 bootstrap: documentation.instructions.md verified."}
```

Replace `<N>` with the ID string from Step 4 (e.g. `"20260411-073"`) and `<datetime>` with the timestamp from Step 0.

### Step 6 — Commit only if files changed

If `documentation.instructions.md` was created/updated and/or a timeline line was appended in this run,
commit those docs-side changes in a dedicated branch:

```bash
cd "$REPO_ROOT"
git checkout -b exercise-1/epic0-closure-bootstrap
git add docs/.github/instructions/documentation.instructions.md docs/agile/timeline.jsonl
git status
git commit -m "docs(epic0): bootstrap closure documentation governance"
git push origin exercise-1/epic0-closure-bootstrap
```

Open a PR against `exercise-1` and merge before T1 starts.

---

## 4) Architecture and security requirements

- **No secrets or credentials** — the instruction file must contain only governance text; no env vars or tokens.
- **Append-only timeline** — never overwrite or reformat existing lines in `timeline.jsonl`.
- **Scope boundary** — this task writes only to `docs/.github/instructions/` and `docs/agile/timeline.jsonl`. Do not touch `nextjs-feature-flag-exercise/` files at this stage.
- **Valid YAML front matter required** — the instruction file must have a `---` front matter block with `applyTo`. Missing front matter causes agent loader errors.
- **Rollback** — if `documentation.instructions.md` is created with wrong content, delete and re-create. No downstream artifact references this file yet.

---

## 5) Validation evidence

| Check | Command | Expected output |
|---|---|---|
| Instruction file created | `node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT/docs" ".github/instructions/documentation.instructions.md"` | `✅ .github/instructions/documentation.instructions.md` |
| File has 7 required `##` headings | `grep -c "^## " "docs/.github/instructions/documentation.instructions.md"` | `7` (Objective + 6 numbered sections) |
| File has valid front matter | `head -3 "docs/.github/instructions/documentation.instructions.md"` | First line is `---`, third line is `---` or contains `applyTo:` |
| Closure artifacts absent | `node "$REPO_ROOT/docs/.github/functions/check-ai-layer-files.js" "$REPO_ROOT" ".agents/closure/epic0-closure-report.md" ".agents/closure/epic1-handoff.md"` | Both `❌` |
| Timeline entry appended | `tail -1 "docs/agile/timeline.jsonl" \| node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{ const o=JSON.parse(d); console.log(o.action, o.artifact_id); })"` | `create E0-S4` |

### BDD verification signal

**Given** E0-S3 is complete and `documentation.instructions.md` already exists in `docs/.github/instructions/`,  
**When** Steps 0–5 are executed in order,  
**Then** the instruction file is verified as structurally correct (7 `##` headings, HTML comment front-matter spec, valid `applyTo` quotes), and `timeline.jsonl` contains a new `create` entry for `E0-S4` with the correct schema fields.

---

## 6) Definition of Done

- [x] `docs/.github/instructions/documentation.instructions.md` exists.
- [x] File has YAML front matter with quoted `applyTo: "**/.agents/closure/**,..."`.
- [x] File has Objective header + 6 numbered sections (7 `##` headings total) matching the governance structure.
- [x] Section 2 specifies HTML comment blocks for artifact front-matter (not YAML `---` blocks).
- [x] `check-ai-layer-files.js` returns `✅` for the instruction file path.
- [x] `check-ai-layer-files.js` returns `❌` for both closure artifact paths (T2/T3 still pending).
- [x] `timeline.jsonl` contains `{action: "create", artifact_id: "E0-S4", epic: "EPIC-0", story: "E0-S4"}` as a valid JSONL line with `id` as a date-based string.
- [x] Committed directly to `exercise-1` under Epic 0 local execution rule (no branch/PR required).
