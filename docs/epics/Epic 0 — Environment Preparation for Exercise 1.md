# Epic 0 — Environment Preparation for Exercise 1 (Baseline)

## Metadata

- **ID:** EPIC-0
- **Priority:** P0
- **Related exercise:** Exercise 1 — Baseline
- **Repository strategy:** Personal fork of `nextjs-feature-flag-exercise` as primary remote
- **Target repository (local clone):** `/delfos/Projetos/ITBC - Desafio RDH/nextjs-feature-flag-exercise`
- **Status:** Draft
- **Created at:** 2026-04-09 16:39:34 -03
- **Last updated:** 2026-04-12 21:52:11 -03

---

## 1) Business objective

Prepare a reliable and reproducible execution environment for Exercise 1 (Baseline), so that the feature flag filtering task can be implemented and validated with traceability, without operational setup blockers.

Expected value:
- reduce time lost due to environment failures;
	- ensure comparability between Exercise 1 and Exercise 2;
- establish a minimum AI Layer foundation for AI-assisted execution;
- gain full governance over repository settings (Actions, environments, secrets, branch policies).

---

## 2) Scope

### In Scope

1. Create and validate a personal fork of the exercise repository as the execution source of truth.
2. Configure remotes (`origin` = personal fork, `upstream` = original exercise repository).
3. Confirm local prerequisites (correct base branch, dependencies, and working commands).
4. Conduct a codebase audit of `nextjs-feature-flag-exercise` (architecture, patterns, commands, tests, integration points, and risks).
5. Validate understanding of the Exercise 1 task and its acceptance criteria.
6. Apply the minimum AI Layer baseline to the fork repository by adapting existing artifacts from `Docs/.github/`:
	- global rules (`copilot-instructions.md`);
	- instructions (`feature-flag-exercise.instructions.md` and others);
	- agents (`rdh-workflow-analyst`, `codebase-gap-analyst`, `technical-manual-writer`);
	- skills (`analyze-rdh-workflow`, `gap-analysis`, `write-technical-manual`, `system-evolution-retro`).
7. Configure baseline governance in the fork (environments, secrets, workflow permissions, and MCP config if applicable), including `copilot-setup-steps.yml` as the validated setup workflow.
8. Validate essential build/test/lint commands for server and client.
9. Define a measurement baseline (time, number of prompts, rework, confidence).
10. Record preparation friction points and decisions to support comparison with later exercises.
11. Record preparation evidence to support execution and later comparison.
12. Enforce branch safety for the exercise workflow (`exercise-1` as base, no direct work on `main`).
13. **Create execution automation artifacts for Epic 1:**
	- `story-task-reviewer` agent for inline code review of agile documents;
	- `scaffold-stories-from-epic` skill to generate story MDs from epic section 7;
	- `create-github-issue-from-task` function to create Issues from task MDs;
	- `execute-task-from-issue` skill for the full Issue → PR → merge workflow.

### Out of Scope

1. Full functional implementation of the filtering task (this belongs to Epic 1).
2. Architectural migration to the Gold Standard stack (Bun/Next.js 16).
3. Advanced performance optimizations and hardening beyond what is needed to start the Baseline.
4. Full merge/release automation of the final pipeline for exercises 2-4.
5. Org-level security policy changes outside the fork (enterprise/organization administration).

---

## 3) Definition of Done (DoD)

This epic is considered complete when **all** items below are true:

1. Personal fork created and linked to local workspace, with `exercise-1` confirmed as baseline branch.
2. Remotes configured and validated (`origin` = fork, `upstream` = original repository).
3. Codebase audit completed and findings documented (architecture, patterns, commands, tests, integration points, risks).
4. Task and acceptance criteria understood and recorded for operational reference.
5. Existing AI Layer artifacts from `Docs/.github/` adapted and applied to the fork repository with versioned commits.
6. Required fork settings for exercise execution configured (Actions enabled, environments, secrets, and MCP config created as needed).
7. Server and client validation commands successfully executed in the local environment.
8. Baseline metrics template defined and ready for collection during implementation.
9. Preparation friction points and decisions recorded.
10. At least one workflow dry-run executed successfully in the fork with required permissions/secrets.
11. Branch safety confirmed (no direct commits to `main`; working branch strategy documented from `exercise-1`).
12. All items from the **Checklist mínimo de prontidão** (`ai-development-environment-catalog.md` §6) are satisfied for this exercise scope.
13. Documented evidence of preparation exists (checklist + decisions + risks + next steps).
14. **Execution automation artifacts created and validated:**
	- `story-task-reviewer` agent exists and produces inline suggestions.
	- `scaffold-stories-from-epic` skill generates story MDs from epic outlines.
	- `create-github-issue-from-task` function creates Issues from task files.
	- `execute-task-from-issue` skill enables the full Issue → agent → PR → merge workflow.

---

## 4) Risks

1. **Risk:** inconsistent local environment (dependencies/versions).
	- **Impact:** blocks the start of Baseline.
	- **Mitigation:** run setup checklist and minimum validation before implementation.

2. **Risk:** confusing preparation scope with task implementation.
	- **Impact:** delays and loss of metric comparability.
	- **Mitigation:** explicitly separate deliverables from Epic 0 and Epic 1.

3. **Risk:** incomplete or misaligned AI Layer.
	- **Impact:** low predictability in AI-assisted executions.
	- **Mitigation:** follow the environment catalog and readiness checklist.

4. **Risk:** lack of a measurable baseline.
	- **Impact:** inability to compare gains in Exercise 2.
	- **Mitigation:** formalize metrics before starting coding.

5. **Risk:** fork drift from upstream exercise repository.
	- **Impact:** divergence in scope or outdated baseline.
	- **Mitigation:** keep `upstream` configured and define sync checkpoints before each exercise phase.

6. **Risk:** missing or misconfigured fork secrets/environments.
	- **Impact:** workflow failures and blocked validation/review automation.
	- **Mitigation:** create a minimal secrets/environment checklist and run a dry-run workflow before implementation.

7. **Risk:** accidental direct commits to `main`.
	- **Impact:** loss of exercise traceability and higher rollback risk.
	- **Mitigation:** define branch workflow from `exercise-1`, enforce branch protections where possible, and use PR-only changes.

---

## 5) Dependencies

### Input dependencies

1. Personal GitHub account with permission to create a fork and configure repo settings.
2. Access to repository `/nextjs-feature-flag-exercise` and local work permissions.
3. Source documents available:
	- 4-exercise overview manual;
	- exercise task;
	- environment catalog with workflow coverage map.

### Output dependencies (items blocked by this epic)

1. **EPIC-1 (Baseline implementation):** depends on completion of EPIC-0.
2. Exercise 1 vs Exercise 2 comparison planning: depends on metrics defined in EPIC-0.

---

## 6) Success metrics

1. **Fork readiness:** personal fork created, cloned, and synchronized with upstream baseline.
2. **Initial technical validation:** 100% of critical verification commands passing.
3. **Minimum AI Layer coverage:** 4/4 groups configured (rules, instructions, agents, skills).
4. **Fork governance readiness:** required environments/secrets/workflow permissions configured.
5. **Measurable baseline:** metrics defined and ready for collection before implementation.
6. **Operational blockers:** 0 critical blockers open at epic closure.

---

## 7) Candidate stories for the epic

### ✅✅ [Story E0-S1 — Repository diagnosis and readiness](../agile/stories/story-E0S1-repository-diagnosis.md)

**Description:** create fork strategy, validate base branch, project structure, remotes, and essential execution commands. Conduct codebase audit of `nextjs-feature-flag-exercise` (architecture, patterns, tests, integration points, risks).

### ✅✅ [Story E0-S2 — Minimum AI Layer configuration](../agile/stories/story-E0S2-minimum-ai-layer.md)

**Description:** adapt and apply existing AI Layer artifacts from `Docs/.github/` (instructions, agents, skills) to the fork repository. Configure fork governance (Actions, environments, secrets, MCP).

### ✅✅ [Story E0-S3 — Definition of measurement baseline](../agile/stories/story-E0S3-measurement-baseline.md)

**Description:** formalize method and template for collecting time, prompts, rework, and confidence.

### ✅✅ [Story E0-S4 — Preparation closure and handoff to EPIC-1](../agile/stories/story-E0S4-preparation-closure.md)

**Description:** consolidate final checklist, residual risks, and Baseline execution plan.

### ✅✅ [Story E0-S5 — Execution automation for Epic 1](../agile/stories/story-E0S5-execution-automation.md)

**Priority:** P0 | **Depends on:** E0-S2

**Description:** create the automation artifacts that enable the GitHub Issue-driven execution workflow for Epic 1:
- `story-task-reviewer` agent: reviews story/task MDs and creates inline suggestions via PR comments.
- `scaffold-stories-from-epic` skill: parses epic section 7 and generates detailed story MDs.
- `create-github-issue-from-task` function: creates a GitHub Issue in the fork from a task MD file.
- `execute-task-from-issue` skill: orchestrates Issue → agent execution → commit → PR → merge.

**Key outputs:**
- Agent file: `Docs/.github/agents/story-task-reviewer.agent.md`
- Skill files: `scaffold-stories-from-epic/SKILL.md`, `execute-task-from-issue/SKILL.md`
- Function file: `Docs/.github/functions/create-github-issue-from-task.js`
- Validation: dry-run of story generation from Epic 1 section 7 produces valid story MD drafts.

---

## 8) AI Layer execution map

Which catalog agents and skills are responsible for executing each story in this epic, per `ai-development-environment-catalog.md`.

| Story | Responsible agent(s) | Skills | Instructions |
|---|---|---|---|
| E0-S1 — Repository diagnosis | `project-adaptation-analyst` | `project-context-audit` | `project-adaptation.instructions.md` |
| E0-S2 — AI Layer configuration | `copilot-config-refactor`, `rules-bootstrap`, `copilot-env-specialist` | `copilot-layer-diff`, `config-migration-plan`, `global-rules-bootstrap`, `copilot-env-setup` | `copilot-config-governance.instructions.md`, `coding-agent.instructions.md` |
| E0-S3 — Measurement baseline | `agile-exercise-planner` | `create-exercise-backlog`, `file-timestamps`, `timeline-tracker` | `agile-planning.instructions.md`, `timeline-tracking.instructions.md` |
| E0-S4 — Closure and handoff | `project-adaptation-analyst` | `config-migration-plan` | `documentation.instructions.md` |
| E0-S5 — Execution automation | `prompt-engineer`, `agile-exercise-planner` | `create-specialist-agent`, `scaffold-stories-from-epic`, `execute-task-from-issue` | `agile-planning.instructions.md`, `coding-agent.instructions.md` |

---

## 9) Expected evidence

1. Record of the base branch and initial environment state.
2. Record of fork URL, remote mapping (`origin`/`upstream`), and first successful sync.
3. Codebase audit document (architecture map, patterns, commands, tests, integration points, risks).
4. Evidence of validation command execution for server/client.
5. AI Layer artifacts committed to the fork (adapted from `Docs/.github/`).
6. Evidence of configured environments/secrets/workflow access in the fork.
7. Evidence of at least one successful workflow dry-run in the fork.
8. Preparation friction log (decisions and observations during setup).
9. Baseline document (metrics + capture method).
10. Signed readiness checklist (go/no-go to start Exercise 1).
11. **Execution automation artifacts:**
	- `story-task-reviewer.agent.md` file with inline suggestion methodology.
	- `scaffold-stories-from-epic/SKILL.md` with epic parsing process.
	- `create-github-issue-from-task.js` function with CLI usage.
	- `execute-task-from-issue/SKILL.md` with full workflow steps.
12. **Dry-run evidence:** at least one story MD generated from Epic 1 section 7 via the automation skill.

---

## 10) References

- [Docs/manuals/interview-4-exercises-overview.md](../manuals/interview-4-exercises-overview.md#L29-L46)
- [Docs/manuals/interview-5-current-ai-workflow.md](../manuals/interview-5-current-ai-workflow.md)
- [Docs/ai-development-environment-catalog.md](../ai-development-environment-catalog.md#L136-L184)
- [Docs/interview-prep-ai-setup.md](../interview-prep-ai-setup.md)
- [nextjs-feature-flag-exercise/TASK.md](../../nextjs-feature-flag-exercise/TASK.md#L1-L27)
- [Docs/references/github-workflow-system.md](../references/github-workflow-system.md)
- [Docs/references/self-hosted-runner.md](../references/self-hosted-runner.md)
- [Docs/references/mcp-servers.md](../references/mcp-servers.md)
- [nextjs-feature-flag-exercise/AGENTS.md](../../nextjs-feature-flag-exercise/AGENTS.md#L11-L166)