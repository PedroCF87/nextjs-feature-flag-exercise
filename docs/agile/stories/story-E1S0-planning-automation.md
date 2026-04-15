# Story E1-S0 — Planning automation

## Metadata

| Field | Value |
|---|---|
| **ID** | E1-S0 |
| **Epic** | [Epic 1 — Baseline Implementation: Feature Flag Filtering](../../epics/Epic%201%20%E2%80%94%20Baseline%20Implementation%3A%20Feature%20Flag%20Filtering.md) |
| **Priority** | P0 |
| **Status** | Done |
| **Responsible agent** | `agile-exercise-planner`, `story-task-reviewer` |
| **Skills** | `scaffold-stories-from-epic`, `create-story-task-pack`, `sync-backlog-index` |
| **Instructions** | `agile-planning.instructions.md`, `backlog-governance.instructions.md` |
| **Depends on** | EPIC-0 (E0-S5 + E0-S6) |
| **Blocks** | E1-S1 |
| Created at | 2026-04-13 22:42:40 -03 |
| Last updated | 2026-04-14 22:56:58 -03 |

---

## 1) User story

**As a** candidate executing the RDH interview exercises,
**I want to** generate all detailed story MDs and task files for Epic 1 using the automation artifacts
created in E0-S5, have them reviewed with inline PR suggestions, and create GitHub Issues for
automated execution,
**so that** Epic 1 can begin with every task ready to execute without manual planning overhead.

---

## 2) Scope

### In scope

1. Generate 4 detailed story MDs from Epic 1 section 7 (E1-S1 through E1-S4) using `scaffold-stories-from-epic`.
2. Generate task packs for each generated story using `create-story-task-pack`.
3. Submit all planning documents to `story-task-reviewer` for inline PR code review.
4. Address review feedback and merge the planning PR.
5. Create GitHub Issues for every task in the fork using `create-github-issue-from-task.js`.

### Out of scope

1. Actual implementation of filtering logic (starts in E1-S2).
2. Baseline metrics capture (belongs to E1-S4).
3. AI Layer configuration changes — already deployed in E0-S2.

---

## 3) Acceptance criteria

### AC-1 — Story MDs generated

- **Given** Epic 1 section 7 has 4 story outlines (E1-S1 to E1-S4)
- **When** `scaffold-stories-from-epic` is invoked on Epic 1
- **Then** 4 story files exist at `docs/agile/stories/story-E1S1-*.md` through `story-E1S4-*.md`, each with valid metadata, user story, scope, ACs placeholder, and tasks placeholder.

### AC-2 — Task packs generated

- **Given** all 4 story MDs are created with `## 4) Tasks` sections populated
- **When** `create-story-task-pack` is invoked for each story
- **Then** task files exist at `docs/agile/tasks/task-E1S*T*.md` for all tasks in each story.

### AC-3 — Planning artifacts reviewed

- **Given** all story and task MDs are committed to a feature branch
- **When** `story-task-reviewer` is invoked on the PR
- **Then** a review verdict (`approve` or `request-changes`) is produced with inline suggestions and evidence, and all MAJOR/BLOCKER findings are resolved before merge.

### AC-4 — GitHub Issues created

- **Given** all task files exist and are merged
- **When** `create-github-issue-from-task.js` is run for each task
- **Then** a GitHub Issue exists in the fork repository for every task, with title `[<task-id>] <title>`, correct labels, and body extracted from the task file.

---

## 4) Tasks

### ✅ [Task E1-S0-T1 — Generate story MDs for Epic 1](../tasks/task-E1S0T1-generate-story-mds-for-epic-1.md)

**Goal:** apply `scaffold-stories-from-epic` skill on Epic 1 to produce story-E1S1 through story-E1S4.

**Agent:** `agile-exercise-planner` | **Skill:** `scaffold-stories-from-epic`

**Artifacts to create:**
- `docs/agile/stories/story-E1S1-task-analysis-and-implementation-mapping.md`
- `docs/agile/stories/story-E1S2-server-side-filtering-implementation.md`
- `docs/agile/stories/story-E1S3-client-side-filtering-ui-implementation.md`
- `docs/agile/stories/story-E1S4-baseline-measurement-and-closure.md`

**Acceptance:** all 4 story files exist with valid metadata, user story, scope, and `## 4) Tasks` placeholder.

**depends_on:** E0-S5 completed

---

### ✅ [Task E1-S0-T2 — Generate task packs for all E1 stories](../tasks/task-E1S0T2-generate-task-packs-for-all-e1-stories.md)

**Goal:** invoke `create-story-task-pack` on each of the 4 generated stories to produce task files.

**Agent:** `agile-exercise-planner` | **Skill:** `create-story-task-pack`

**Artifacts to create:**
- Task files `docs/agile/tasks/task-E1S1T*.md` through `task-E1S4T*.md`

**Acceptance:** at least 1 task file per story, `validate-task-pack.js` exits 0 for all stories.

**depends_on:** T1 completed

---

### ✅ [Task E1-S0-T3 — Code-review planning artifacts](../tasks/task-E1S0T3-code-review-planning-artifacts.md)

**Goal:** invoke `story-task-reviewer` on all story and task MDs created in T1–T2.

**Agent:** `story-task-reviewer`

**Acceptance:** PR review verdict produced (`approve` or `request-changes`), all BLOCKER/MAJOR findings resolved.

**depends_on:** T2 completed

---

### ✅ [Task E1-S0-T4 — Create GitHub Issues for all E1 tasks](../tasks/task-E1S0T4-create-github-issues-for-all-e1-tasks.md)

**Goal:** run `create-github-issue-from-task.js` for every task file produced in T2.

**Agent:** `agile-exercise-planner`

**Artifacts:** GitHub Issues in `dynamous-business/nextjs-feature-flag-exercise` (one per task).

**Acceptance:** every task file has a corresponding open Issue; each Issue has correct title, labels, and body.

**depends_on:** T3 completed (review merged)

---

### ✅ [Task E1-S0-T5 — Validate, commit, and sign readiness](../tasks/task-E1S0T5-validate-commit-and-sign-readiness.md)

**Goal:** confirm all E1 planning artifacts are present, Issues are open, and sign off before E1-S1 begins.

**Agent:** `agile-exercise-planner`

**Acceptance:**
- `sync-backlog-index.js` exits 0 with all E1 story/task IDs registered.
- All GitHub Issues listed in a readiness checklist.
- `Last updated` refreshed on all modified artifacts.

**depends_on:** T4 completed
