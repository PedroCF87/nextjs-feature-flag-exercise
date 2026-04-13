# Story E0-S4 — Preparation Closure and Handoff to EPIC-1

## Metadata

| Field | Value |
|---|---|
| **ID** | E0-S4 |
| **Epic** | [EPIC-0 — Environment Preparation for Exercise 1](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |
| **Priority** | P1 |
| **Status** | Draft |
| **Responsible agent** | `project-adaptation-analyst` |
| **Supporting agents** | `project-adaptation-analyst` (T4 — verify closure artifacts + record SHA), `agile-exercise-planner` (T1 — DoD verification) |
| **Skills** | `config-migration-plan`, `validate-ai-layer-coverage`, `timeline-tracker`, `produce-epic-closure-report`, `produce-epic-handoff` |
| **Instructions** | `documentation.instructions.md`, `project-adaptation.instructions.md` |
| **Depends on** | [E0-S3 — Definition of Measurement Baseline](story-E0S3-measurement-baseline.md) |
| **Blocks** | EPIC-1 — Baseline Implementation: Feature Flag Filtering |
| Created at | 2026-04-10 12:08:50 -03 |
| Last updated | 2026-04-12 15:27:35 -03 |

---

## 1) User story

**As a** candidate preparing for the RDH interview exercise,
**I want to** consolidate all EPIC-0 evidence into a closure report, verify every DoD item has been satisfied, and produce a clear handoff document for EPIC-1,
**so that** I can start Exercise 1 implementation from a fully documented, risk-acknowledged, and traceable state — with no preparation debt.

---

## 2) Scope

### In scope

1. Verify all 13 EPIC-0 Definition of Done items against evidence produced by E0-S1, E0-S2, and E0-S3.
2. Produce `epic0-closure-report.md` — consolidated DoD checklist with evidence links, residual risks, friction log summary, and decisions record.
3. Produce `epic1-handoff.md` — EPIC-1 execution plan: starting context (branch, SHA, AI Layer state, task reference), first story to execute (E1-S1), and known risks to monitor.
4. Query the timeline with `timeline-query.js` to record total preparation elapsed time in the closure report.
5. Commit and push all closure artifacts to the fork.
6. Update the `Last updated` field in `story-E0S4-preparation-closure.md` and append the timeline entry.

### Out of scope

1. Actual implementation of the filtering task (belongs to EPIC-1).
2. Modifying or re-executing E0-S1, E0-S2, or E0-S3 artifacts — this story only reads and consolidates them.
3. Automated CI validation of the closure (no new GitHub Actions workflow required).
4. Comparison analysis against Exercise 2 (belongs to a post-Epic-2 story).

---

## 3) Acceptance criteria

### AC-1 — EPIC-0 DoD fully verified

- **Given** E0-S1, E0-S2, and E0-S3 have been completed
- **When** the agent executes T1 (DoD verification)
- **Then** all 13 EPIC-0 DoD items are individually checked against evidence; any unresolved item is recorded as a residual risk with a mitigation note.

### AC-2 — Closure report produced

- **Given** the DoD verification is complete
- **When** the agent produces `epic0-closure-report.md`
- **Then** the document contains:
  - a DoD checklist with ✅/⚠️ status per item and an evidence link or note for each;
  - a residual risks section (may be empty if all items are ✅);
  - a friction log summary (top 3 preparation friction points from E0-S1/S2/S3);
  - a decisions record (key choices made during preparation: fork strategy, AI Layer scope, baseline method);
  - total EPIC-0 elapsed time from `timeline-query.js --epic EPIC-0`.

### AC-3 — EPIC-1 handoff document produced

- **Given** the closure report is complete
- **When** the agent produces `epic1-handoff.md`
- **Then** the document contains:
  - current branch name and last commit SHA (from `git-info.js --branch-ref`);
  - AI Layer coverage summary (from `check-ai-layer-files.js --table`);
  - task reference (link to `nextjs-feature-flag-exercise/TASK.md` + key acceptance criteria);
  - first story to execute: E1-S1, with its story file link;
  - top 3 risks from the codebase audit (`codebase-audit.md`) to monitor during implementation;
  - signed statement: `READY — EPIC-1 may begin.`

### AC-4 — Closure artifacts committed and pushed

- **Given** both closure documents are complete and verified
- **When** T2 produces `epic0-closure-report.md` and T3 produces `epic1-handoff.md`
- **Then** each file is committed and pushed in its own PR (`docs(epic0): produce EPIC-0 closure report` by T2; `docs(epic0): produce EPIC-1 handoff document` by T3)
- **And** T4 verifies both files are present in the fork and records the final branch + SHA.

### AC-5 — Timeline entry appended

- **Given** the story work is complete
- **When** the agent finalizes the story
- **Then** one entry is appended to `docs/agile/timeline.jsonl` with `action: "close"`, `artifact_id: "E0-S4"`, and a summary note including the elapsed time value from `timeline-query.js`.

---

## 4) Tasks

### ✅ [Task E0-S4-T0 — Bootstrap AI Layer artifacts](../tasks/task-E0S4T0-bootstrap-ai-layer-artifacts.md)

**Purpose:** create the instruction file referenced in the metadata (`documentation.instructions.md`) and register story artifacts in the timeline.

> **Note:** `documentation.instructions.md` was created as part of this task's bootstrap (T0). Before executing sub-task 1, verify the file exists; create it only if it is missing.

#### Sub-tasks

0. Run `node "docs/.github/functions/datetime.js"` to obtain the current timestamp. <!-- timestamp for artifact Created at and Last updated fields -->
1. Create `docs/.github/instructions/documentation.instructions.md` with the following content:
   - **Purpose:** guidance for agents producing documentation artifacts (closure reports, handoff documents, retrospective summaries).
   - **Sections:** Naming conventions, required front matter fields (`artifact_id`, `epic_id`, `story_id`, `produced_at`, `produced_by`), markdown structure rules, cross-reference linking format, and a "Completeness check" section listing required sections per document type.
   - **Document types to cover:** `epic-closure-report`, `epic-handoff`, `friction-log`, `decisions-record`.
2. Verify the file was created: `node "docs/.github/functions/check-ai-layer-files.js" "nextjs-feature-flag-exercise/docs" ".github/instructions/documentation.instructions.md"`.
3. Run `node "docs/.github/functions/timeline-id.js" "docs/agile/timeline.jsonl"` to obtain the next ID.
4. Append one timeline entry: `{"id": "<N>", "action": "create", "timestamp": "<ts>", "artifact_type": "story", "artifact_id": "E0-S4", "epic": "EPIC-0", "story": "E0-S4", "agent": "project-adaptation-analyst", "artifact_file": "docs/agile/stories/story-E0S4-preparation-closure.md", "notes": "Story E0-S4 bootstrap: documentation.instructions.md created." }`.

#### Acceptance

- `docs/.github/instructions/documentation.instructions.md` exists and has 7 `##` headings (Objective + 6 numbered sections).
- Timeline entry `{action: "create", artifact_id: "E0-S4"}` is present in `timeline.jsonl`.

---

### ✅ [Task E0-S4-T1 — Verify EPIC-0 DoD evidence](../tasks/task-E0S4T1-verify-epic-0-dod-evidence.md)

**Purpose:** systematically check all 13 EPIC-0 DoD items and produce a structured evidence map.

#### Inputs

| Source | Path |
|---|---|
| E0-S1 evidence | `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` |
| E0-S2 evidence | `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` |
| E0-S3 evidence | `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` |
| EPIC-0 DoD | [Section 3 of Epic 0](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md) |

#### Sub-tasks

0. Run `node "docs/.github/functions/check-prereqs.js" exercise-1 nextjs-feature-flag-exercise` to confirm the environment is still in a valid state. <!-- must output: all checks pass -->
1. Read `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` — note whether all E0-S1 DoD items are present (fork created, remotes configured, audit documented, commands validated).
2. Run `node "docs/.github/functions/check-ai-layer-files.js" nextjs-feature-flag-exercise ".github/copilot-instructions.md" ".github/workflows/copilot-setup-steps.yml" ".agents/diagnosis/codebase-audit.md" ".agents/validation/ai-layer-coverage-report.md" ".agents/baseline/measurement-baseline.md" --table` to verify all critical output artifacts exist.
3. Read `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` — confirm the go/no-go checklist is signed and the `READY` declaration is present.
4. For each of the 13 EPIC-0 DoD items, assign status: ✅ (confirmed by evidence), ⚠️ (partial — note limitation), or ❌ (missing — must be recorded as residual risk).
5. Collect the top 3 friction points noted across E0-S1, E0-S2, and E0-S3 documents.

#### Acceptance

- A DoD status map is persisted to `nextjs-feature-flag-exercise/.agents/closure/dod-status-draft.md` (produced in Step 7 of the task file).
- No ❌ items remain unaddressed (each must have a mitigation note if unresolved).
- At least one evidence link or file reference per ✅ item.

---

### ✅ [Task E0-S4-T2 — Produce epic0-closure-report.md](../tasks/task-E0S4T2-produce-epic0-closure-report-md.md)

**Purpose:** write the EPIC-0 closure document using the evidence map from T1. Follows the [`produce-epic-closure-report`](../../../.github/skills/produce-epic-closure-report/SKILL.md) skill.

#### Sub-tasks

0. Run `node "docs/.github/functions/timeline-query.js" "docs/agile/timeline.jsonl" --epic EPIC-0` to obtain total elapsed time. <!-- record the minutes value in the closure report -->
1. Run `node "docs/.github/functions/datetime.js"` to set `produced_at`.
2. Create `nextjs-feature-flag-exercise/.agents/closure/epic0-closure-report.md` with the following sections:
   - **Front matter:** `artifact_id: epic0-closure-report`, `epic_id: EPIC-0`, `produced_at: <datetime>`, `produced_by: project-adaptation-analyst`.
   - **Section 1 — EPIC-0 DoD Checklist:** table with columns `#`, `DoD Item`, `Status`, `Evidence`.
   - **Section 2 — Residual Risks:** table with columns `Risk`, `Impact`, `Mitigation`; if none, write `No open risks.`
   - **Section 3 — Friction Log Summary:** numbered list of top 3 preparation friction points with source reference.
   - **Section 4 — Decisions Record:** table with columns `Decision`, `Rationale`, `Story`.
   - **Section 5 — Preparation Time:** `Total EPIC-0 elapsed: N minutes` (from `timeline-query.js`).
3. Verify the file exists: `node "docs/.github/functions/check-ai-layer-files.js" nextjs-feature-flag-exercise ".agents/closure/epic0-closure-report.md"`.

#### Acceptance

- `nextjs-feature-flag-exercise/.agents/closure/epic0-closure-report.md` exists.
- All 5 sections are present.
- Elapsed time value is non-null and matches `timeline-query.js --epic EPIC-0` output.

---

### ✅ [Task E0-S4-T3 — Produce epic1-handoff.md](../tasks/task-E0S4T3-produce-epic1-handoff-md.md)

**Purpose:** write the EPIC-1 execution handoff document so the implementation agent can start immediately without preparation research. Follows the [`produce-epic-handoff`](../../../.github/skills/produce-epic-handoff/SKILL.md) skill.

#### Sub-tasks

0. Run `node "docs/.github/functions/git-info.js" nextjs-feature-flag-exercise --branch-ref` to get `<branch> @ <sha>`. <!-- record in the handoff header -->
1. Run `node "docs/.github/functions/check-ai-layer-files.js" nextjs-feature-flag-exercise ".github/copilot-instructions.md" ".github/workflows/copilot-setup-steps.yml" ".github/instructions/feature-flag-exercise.instructions.md" ".github/agents/rdh-workflow-analyst.agent.md" ".github/agents/codebase-gap-analyst.agent.md" ".github/agents/technical-manual-writer.agent.md" ".github/skills/analyze-rdh-workflow/SKILL.md" ".github/skills/gap-analysis/SKILL.md" ".github/skills/write-technical-manual/SKILL.md" ".github/skills/system-evolution-retro/SKILL.md" --table` to produce the AI Layer coverage summary. <!-- paste output into Section 2 -->
2. Create `nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md` with the following sections:
   - **Front matter:** `artifact_id: epic1-handoff`, `epic_id: EPIC-1`, `produced_at: <datetime>`, `produced_by: project-adaptation-analyst`.
   - **Section 1 — Starting State:** branch + SHA (from `git-info.js`), last sync with upstream, validation commands status.
   - **Section 2 — AI Layer Coverage:** table output from `check-ai-layer-files.js --table`.
   - **Section 3 — Task Reference:** link to `nextjs-feature-flag-exercise/TASK.md`; paste the key acceptance criteria (filtering dimensions, multi-filter, clear-all, active-filter indicator).
   - **Section 4 — First Story to Execute:** `E1-S1` with link to its story file once it exists; describe its objective in one sentence.
   - **Section 5 — Known Risks:** top 3 risks from `codebase-audit.md` with suggested monitoring action per risk.
   - **Section 6 — Go / No-Go:** signed statement `READY — EPIC-1 may begin.` + timestamp from `datetime.js`.
3. Verify the file exists: `node "docs/.github/functions/check-ai-layer-files.js" nextjs-feature-flag-exercise ".agents/closure/epic1-handoff.md"`.

#### Acceptance

- `nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md` exists.
- All 6 sections are present.
- Section 6 contains the `READY — EPIC-1 may begin.` signed statement with a valid timestamp.
- Branch + SHA in Section 1 match live output of `git-info.js`.

---

### ✅ [Task E0-S4-T4 — Verify closure artifacts and record final SHA](../tasks/task-E0S4T4-commit-and-push-closure-artifacts.md)

**Purpose:** verify that both closure documents produced by T2 and T3 are committed in the fork (each via its own merged PR), and record the final branch + SHA.

#### Sub-tasks

0. Verify T2/T3 closure files are committed:
   ```bash
   node "docs/.github/functions/check-ai-layer-files.js" \
     nextjs-feature-flag-exercise \
     ".agents/closure/epic0-closure-report.md" \
     ".agents/closure/epic1-handoff.md"
   ```
   🔴 Both must show ✅. Any ❌ means the responsible PR was not merged — block and return to T2 or T3.
1. Record final branch + SHA: `node "docs/.github/functions/git-info.js" nextjs-feature-flag-exercise --branch-ref`.

#### Acceptance

- Both `epic0-closure-report.md` and `epic1-handoff.md` show `✅` from `check-ai-layer-files.js`.
- Final branch + SHA recorded for handoff to T5.

---

### ✅ [Task E0-S4-T5 — Close story and append timeline entry](../tasks/task-E0S4T5-close-story-and-append-timeline-entry.md)

**Purpose:** finalize the story metadata and log the closure in the timeline.

#### Sub-tasks

0. Run `node "docs/.github/functions/datetime.js"` for the final timestamp.
1. Update `Last updated` in this story file's metadata block to the current timestamp.
2. Run `node "docs/.github/functions/timeline-query.js" "docs/agile/timeline.jsonl" --story E0-S4` to compute this story's elapsed time.
3. Run `node "docs/.github/functions/timeline-id.js" "docs/agile/timeline.jsonl"` for the next entry ID.
4. Append one timeline entry: `{"id": "<N>", "action": "close", "timestamp": "<ts>", "artifact_type": "story", "artifact_id": "E0-S4", "epic": "EPIC-0", "story": "E0-S4", "agent": "project-adaptation-analyst", "artifact_file": "docs/agile/stories/story-E0S4-preparation-closure.md", "notes": "EPIC-0 closed. Closure report and EPIC-1 handoff committed. Total EPIC-0 elapsed: N min." }`.

#### Acceptance

- `Last updated` in story metadata reflects the real closure timestamp.
- `timeline.jsonl` contains a `{action: "close", artifact_id: "E0-S4"}` entry.

---

## 5) Dependencies

| Depends on | Type | Reason |
|---|---|---|
| [E0-S3 — Measurement Baseline](story-E0S3-measurement-baseline.md) | Hard | T1 reads the signed go/no-go checklist from E0-S3; EPIC-1 may not start without it |
| `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` | Hard | Required by T1 (DoD items 3, 4) and T3 Section 5 (known risks) |
| `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` | Hard | Required by T1 (DoD items 5, 6, 7) |
| `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` | Hard | Required by T1 (DoD items 8, 9, 10, 11) — must be signed |
| `docs/.github/functions/timeline-query.js` | Hard | Required by T2 (elapsed time) and T5 (story elapsed) |
| `docs/.github/functions/git-info.js` | Hard | Required by T3 (branch + SHA in handoff) |
| `docs/.github/functions/check-ai-layer-files.js` | Hard | Required by T1, T2, T3 (file existence checks) |

---

## 6) Definition of Done

This story is done when **all** of the following are true:

- [ ] All 13 EPIC-0 DoD items verified — each has a ✅/⚠️ status and an evidence link in the closure report.
- [ ] `nextjs-feature-flag-exercise/.agents/closure/epic0-closure-report.md` exists with 5 sections complete.
- [ ] `nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md` exists with 6 sections complete.
- [ ] Section 6 of `epic1-handoff.md` contains the signed `READY — EPIC-1 may begin.` statement.
- [ ] Total EPIC-0 elapsed time (from `timeline-query.js`) recorded in the closure report.
- [ ] `docs/.github/instructions/documentation.instructions.md` created/verified with 7 `##` headings.
- [ ] No ❌ items in the DoD checklist without a mitigation note.
- [ ] T2 commit (`docs(epic0): produce EPIC-0 closure report`) and T3 commit (`docs(epic0): produce EPIC-1 handoff document`) both pushed to fork.
- [ ] `Last updated` in story metadata updated to actual closure timestamp.
- [ ] One timeline entry with `action: "close"` appended for `E0-S4`.

---

## 7) Key file reference

| Purpose | Path |
|---|---|
| Output — EPIC-0 closure report | `nextjs-feature-flag-exercise/.agents/closure/epic0-closure-report.md` |
| Output — EPIC-1 handoff | `nextjs-feature-flag-exercise/.agents/closure/epic1-handoff.md` |
| Input — Instruction file to create | `docs/.github/instructions/documentation.instructions.md` |
| Input — E0-S1 evidence | `nextjs-feature-flag-exercise/.agents/diagnosis/codebase-audit.md` |
| Input — E0-S2 evidence | `nextjs-feature-flag-exercise/.agents/validation/ai-layer-coverage-report.md` |
| Input — E0-S3 evidence (signed go/no-go) | `nextjs-feature-flag-exercise/.agents/baseline/measurement-baseline.md` |
| Input — EPIC-0 DoD | `docs/epics/Epic 0 — Environment Preparation for Exercise 1.md` |
| Input — EPIC-1 first story | `docs/agile/stories/story-E1S1-*.md` (to be created in EPIC-1) |
| Function — timeline elapsed query | `docs/.github/functions/timeline-query.js` |
| Skill — closure report template | `docs/.github/skills/produce-epic-closure-report/SKILL.md` |
| Skill — handoff document template | `docs/.github/skills/produce-epic-handoff/SKILL.md` |
| Function — git state | `docs/.github/functions/git-info.js` |
| Function — file existence check | `docs/.github/functions/check-ai-layer-files.js` |
| Function — current timestamp | `docs/.github/functions/datetime.js` |
| Function — next timeline ID | `docs/.github/functions/timeline-id.js` |

---

## 8) References

- [docs/epics/Epic 0 — Environment Preparation for Exercise 1.md](../../epics/Epic%200%20%E2%80%94%20Environment%20Preparation%20for%20Exercise%201.md)
- [docs/agile/stories/story-E0S1-repository-diagnosis.md](story-E0S1-repository-diagnosis.md)
- [docs/agile/stories/story-E0S2-minimum-ai-layer.md](story-E0S2-minimum-ai-layer.md)
- [docs/agile/stories/story-E0S3-measurement-baseline.md](story-E0S3-measurement-baseline.md)
- [nextjs-feature-flag-exercise/TASK.md](../../../TASK.md)
- [docs/manuals/interview-4-exercises-overview.md](../../manuals/interview-4-exercises-overview.md)
- [docs/ai-development-environment-catalog.md](../../ai-development-environment-catalog.md)
