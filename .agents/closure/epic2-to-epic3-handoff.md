# EPIC-2 → EPIC-3 Handoff Document

<!-- artifact_id: epic2-to-epic3-handoff -->
<!-- epic_id: EPIC-2 → EPIC-3 -->
<!-- produced_at: 2026-04-16 17:28:51 -03 -->
<!-- produced_by: agile-exercise-planner -->

---

## 1 — Starting State

| Field | Value |
|---|---|
| Branch + SHA | `exercise-2 @ 5567feb0bfc107013094f0d5ed54afec74e0513e` |
| Last upstream sync | Branch created from `f73979ed~1` (upstream original state, pre-fork). No subsequent upstream syncs — all commits are implementation + documentation on `exercise-2`. |
| Server validation | `cd server && pnpm run build && pnpm run lint && pnpm test` — ✅ (26 tests passed, 0 failures) |
| Client validation | `cd client && pnpm run build && pnpm run lint` — ✅ (0 errors) |
| PR status | PR #35 (`exercise-2` → `main`) — OPEN, all automated reviews passed |

---

## 2 — AI Layer Coverage

### Copilot AI Layer (`.github/`)

| Artifact | Count | Status |
|----------|-------|--------|
| `.github/copilot-instructions.md` | 1 | ✅ |
| **Instructions** (`.github/instructions/`) | 18 | ✅ |
| `agile-planning.instructions.md` | | ✅ |
| `agile-quality-audit.instructions.md` | | ✅ |
| `backlog-governance.instructions.md` | | ✅ |
| `coding-agent.instructions.md` | | ✅ |
| `copilot-config-governance.instructions.md` | | ✅ |
| `documentation.instructions.md` | | ✅ |
| `feature-flag-exercise.instructions.md` | | ✅ |
| `friction-log.instructions.md` | | ✅ |
| `git-operations.instructions.md` | | ✅ |
| `gold-standard.instructions.md` | | ✅ |
| `measurement-baseline.instructions.md` | | ✅ |
| `pr-comment-tags.instructions.md` | | ✅ |
| `project-adaptation.instructions.md` | | ✅ |
| `task-detailing-governance.instructions.md` | | ✅ |
| `timeline-tracking.instructions.md` | | ✅ |
| `translation-en.instructions.md` | | ✅ |
| `translation.instructions.md` | | ✅ |
| `workshop-resources.instructions.md` | | ✅ |
| **Agents** (`.github/agents/`) | 16 | ✅ |
| `agile-exercise-planner.agent.md` | | ✅ |
| `agile-quality-auditor.agent.md` | | ✅ |
| `codebase-gap-analyst.agent.md` | | ✅ |
| `copilot-config-refactor.agent.md` | | ✅ |
| `copilot-env-specialist.agent.md` | | ✅ |
| `environment-validator.agent.md` | | ✅ |
| `git-ops.agent.md` | | ✅ |
| `project-adaptation-analyst.agent.md` | | ✅ |
| `prompt-engineer.agent.md` | | ✅ |
| `rdh-workflow-analyst.agent.md` | | ✅ |
| `rules-bootstrap.agent.md` | | ✅ |
| `story-task-reviewer.agent.md` | | ✅ |
| `task-implementer.agent.md` | | ✅ |
| `technical-en-translator.agent.md` | | ✅ |
| `technical-manual-writer.agent.md` | | ✅ |
| `technical-ptbr-translator.agent.md` | | ✅ |
| **Skills** (`.github/skills/`) | 33 | ✅ |
| `adapt-artifact-to-fork-scope` | | ✅ |
| `analyze-rdh-workflow` | | ✅ |
| `audit-agile-artifacts` | | ✅ |
| `config-migration-plan` | | ✅ |
| `copilot-env-setup` | | ✅ |
| `copilot-layer-diff` | | ✅ |
| `create-exercise-backlog` | | ✅ |
| `create-specialist-agent` | | ✅ |
| `create-story-task-pack` | | ✅ |
| `execute-task-from-issue` | | ✅ |
| `execute-task-locally` | | ✅ |
| `file-timestamps` | | ✅ |
| `fork-and-configure-remotes` | | ✅ |
| `gap-analysis` | | ✅ |
| `generate-dashboards` | | ✅ |
| `generate-measurement-template` | | ✅ |
| `global-rules-bootstrap` | | ✅ |
| `produce-diagnosis-document` | | ✅ |
| `produce-epic-closure-report` | | ✅ |
| `produce-epic-handoff` | | ✅ |
| `project-context-audit` | | ✅ |
| `record-friction-point` | | ✅ |
| `record-time-zero-snapshot` | | ✅ |
| `refine-agile-breakdown` | | ✅ |
| `scaffold-stories-from-epic` | | ✅ |
| `sync-backlog-index` | | ✅ |
| `system-evolution-retro` | | ✅ |
| `timeline-tracker` | | ✅ |
| `translate-ptbr-to-english` | | ✅ |
| `translate-technical-docs` | | ✅ |
| `validate-ai-layer-coverage` | | ✅ |
| `validate-exercise-environment` | | ✅ |
| `write-technical-manual` | | ✅ |
| **Workflows** (`.github/workflows/`) | 3 | ✅ |
| `claude.yml` | | ✅ |
| `pr-review.yml` | | ✅ |
| `security-review.yml` | | ✅ |

### Claude AI Layer (`.claude/`)

| Artifact | Count | Status |
|----------|-------|--------|
| `CLAUDE.md` (global rules) | 1 | ✅ |
| **Commands** (`.claude/commands/`) | 9 | ✅ |
| `prime.md` (Core 4) | | ✅ |
| `plan.md` (Core 4) | | ✅ |
| `implement.md` (Core 4) | | ✅ |
| `commit.md` (Core 4) | | ✅ |
| `prime-endpoint.md` (extended) | | ✅ |
| `validate.md` (extended) | | ✅ |
| `create-prd.md` (extended) | | ✅ |
| `review.md` (extended) | | ✅ |
| `security-review.md` (extended) | | ✅ |
| **Skills** (`.claude/skills/`) | 1 | ✅ |
| `agent-browser/SKILL.md` | | ✅ |

### On-Demand Context & PRDs

| Artifact | Status |
|----------|--------|
| `.agents/reference/backend-patterns.md` | ✅ |
| `.agents/reference/frontend-patterns.md` | ✅ |
| `.agents/reference/sql-js-constraints.md` | ✅ |
| `.agents/reference/backend.md` | ✅ |
| `.agents/reference/frontend.md` | ✅ |
| `.agents/PRDs/feature-flag-filtering-e2.prd.md` | ✅ |
| `.agents/PRDs/feature-flag-manager.prd.md` | ✅ |

**Summary:** Copilot (1 global rules + 18 instructions + 16 agents + 33 skills + 3 workflows) + Claude (1 global rules + 9 commands + 1 skill) + 5 on-demand context docs + 2 PRDs = **complete, dual-toolchain AI Layer**.

---

## 3 — Task Reference

**Task file:** [`TASK.md`](../../TASK.md)

All 11 acceptance criteria verified ✅ — see [`.agents/closure/e2-validation-report.md`](../closure/e2-validation-report.md) for `file:line` evidence.

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Filter by environment (development, staging, production) | ✅ |
| 2 | Filter by status (enabled/disabled) | ✅ |
| 3 | Filter by type (release, experiment, operational, permission) | ✅ |
| 4 | Filter by owner | ✅ |
| 5 | Name search (partial match, case-insensitive) | ✅ |
| 6 | Filtering executed in backend | ✅ |
| 7 | Multiple simultaneous filters (AND logic) | ✅ |
| 8 | Filters persist across create/edit/delete | ✅ |
| 9 | Clear all filters action | ✅ |
| 10 | UI indicates when filters are active | ✅ |
| 11 | Filtering feels responsive | ✅ |

Implementation complete on both server (26 tests) and client (clean build).

---

## 4 — First Story to Execute

EPIC-3 epic file exists: [`docs/epics/Epic 3.md`](../../epics/Epic%203.md) — "Build a Skill: Context Package Builder."

EPIC-3 stories are not yet scaffolded. **First action:** scaffold stories from the Epic 3 file's section 7 (Candidate stories) using the `scaffold-stories-from-epic` skill, then generate task packs.

---

## 5 — Top 3 Risks for EPIC-3

| # | Risk | Monitoring Action |
|---|---|---|
| 1 | **Skill scope ambiguity** — "Context Package Builder" requires defining what a "context package" is, what inputs it accepts, and what output format it produces. If scope is too broad, the skill becomes a vague wrapper; if too narrow, it has limited reuse value. | Define acceptance criteria with concrete input→output examples before implementation. Time-box design to ~30 min. |
| 2 | **Dual AI Layer maintenance burden** — Two separate AI Layer systems (Copilot `.github/` + Claude `.claude/`) were created in E2. EPIC-3 adds a new skill to one or both. Risk of divergence or duplicated effort. | Clearly scope which toolchain the skill targets. If the skill is Claude-specific (`.claude/skills/`), no Copilot artifact needed, and vice versa. |
| 3 | **Testing a skill without production workload** — Skills are validated by running them on real tasks. EPIC-3 may lack a sufficiently complex test case to stress the skill beyond toy examples. | Use the feature-flag-filtering task as the test case — it has known context requirements (backend patterns, SQL.js constraints, frontend patterns) that the skill should be able to assemble. |

---

## 6 — READY Declaration

> **READY:** EPIC-2 is closed. All 28 DoD items verified (27 ✅ at report time + this handoff = 28/28 ✅).
> Branch `exercise-2` is stable with all validation passing (server: 26 tests, 0 errors; client: 0 errors).
> AI Layer (both Copilot and Claude) is complete and validated. PR #35 open with all automated reviews passed.
> EPIC-3 may begin.
>
> Signed: `agile-exercise-planner`, 2026-04-16 17:28:51 -03
