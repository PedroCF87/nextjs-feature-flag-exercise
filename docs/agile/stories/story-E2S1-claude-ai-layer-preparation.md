# Story E2-S1 — Claude AI Layer preparation (Brownfield Workflow)

## Metadata

| Field | Value |
|---|---|
| **ID** | E2-S1 |
| **Epic** | [Epic 2 — AI-Assisted Run: Feature Flag Filtering with PIV Loop](../../epics/Epic%202%20%E2%80%94%20Preparation%20Guide%20(PIV%20Loop%20-%20AI-Assisted%20Run).md) |
| **Priority** | P0 |
| **Status** | Draft |
| **Responsible agent** | `prompt-engineer` |
| **Skills** | `create-specialist-agent`, `global-rules-bootstrap`, `analyze-rdh-workflow` |
| **Instructions** | `copilot-config-governance.instructions.md`, `workshop-resources.instructions.md` |
| **Depends on** | E2-S2 |
| **Blocks** | E2-S3 |
| Created at | 2026-04-16 02:31:41 -03 |
| Last updated | 2026-04-16 02:38:40 -03 |

---

## 1) User story

**As an** engineer preparing for an AI-assisted implementation run,
**I want** a complete Claude AI Layer (CLAUDE.md, commands, skills, on-demand context, PRD) built following the Brownfield Workflow (Understand Code → Extract Rules → Setup Commands → Document Codebase),
**so that** the Claude Code agent can execute the PIV Loop with full project context and structured workflows.

---

## 2) Scope

### In scope

1. **Step A — Understand the code:** Analyze codebase using `.agents/closure/codebase-audit.md`, `AGENTS.md`, and existing `CLAUDE.md`. Map architecture layers, data flow, naming conventions, error handling, SQL.js constraints, test strategy, integration points.
2. **Step B — Extract rules (Global Rules):** Create/update `CLAUDE.md` adapted for Exercise 2 (no filtering, `exercise-2` branch, PIV Loop methodology). Must include the 4 Excal-4 Venn diagram categories: Tech Stack & Architecture, Code Styles & Patterns, Testing Requirements, Misconceptions AI Often Has.
3. **Step C — Setup commands:** Create `.claude/commands/` with all 4 Core 4 commands (`prime.md`, `plan.md`, `implement.md`, `commit.md`) plus 5 extended commands (`prime-endpoint.md`, `validate.md`, `create-prd.md`, `review.md`, `security-review.md`). Each command follows Input → Process → Output structure.
4. **Step C.2 — Skills:** Create `.claude/skills/agent-browser/SKILL.md` (Playwright browser automation subroutine).
5. **Step D — Document codebase (On-Demand Context):** Create `.agents/reference/backend-patterns.md`, `.agents/reference/frontend-patterns.md`, `.agents/reference/sql-js-constraints.md`.
6. **Step E — Create PRD:** Generate `.agents/PRDs/feature-flag-filtering-e2.prd.md` with 15-section structure following the Prompt Structure 5-step (Excal-6).
7. **Step F — Validate AI Layer:** Validate three-tier architecture consistency: Tier 1 (CLAUDE.md) → Tier 2 (9 commands) → Tier 3 (skills) → On-Demand Context (≥2 reference docs) → Layer 2 (PRD).

### Out of scope

1. Repository branch creation and workflow activation (belongs to E2-S2).
2. Actual implementation of feature flag filtering (belongs to E2-S3 and E2-S4).
3. Migrating runtime to Bun or replacing SQL.js with PostgreSQL.
4. Creating Jira tickets via MCP.

---

## 3) Acceptance criteria

### AC-1 — CLAUDE.md adapted for Exercise 2

- **Given** the exercise starts from a clean upstream state (no filtering code)
- **When** `CLAUDE.md` is created/updated for Exercise 2
- **Then** it references `exercise-2` branch, PIV Loop methodology, includes tech stack, architecture, code style, testing, validation commands, error classes, key files, and common AI misconceptions; follows the Excal-4 Venn diagram categories; excludes universal knowledge, workflow definitions, and task-specific content

### AC-2 — Core 4 commands created

- **Given** the PIV Loop requires structured commands
- **When** `.claude/commands/` is populated
- **Then** `prime.md`, `plan.md`, `implement.md`, and `commit.md` exist; each follows Input → Process → Output structure; each accepts `$ARGUMENTS` or positional parameters where applicable

### AC-3 — Extended commands created

- **Given** the PIV Loop benefits from additional tooling
- **When** extended commands are created
- **Then** `prime-endpoint.md`, `validate.md`, `create-prd.md`, `review.md`, and `security-review.md` exist in `.claude/commands/`; each follows I→P→O structure

### AC-4 — At least one skill created

- **Given** commands may invoke reusable subroutines
- **When** the skills directory is populated
- **Then** at least one skill exists in `.claude/skills/` (e.g., `agent-browser/SKILL.md`)

### AC-5 — On-demand context documents created

- **Given** the implementation agent needs deep reference on backend, frontend, and SQL.js patterns
- **When** `.agents/reference/` is populated
- **Then** at least `backend-patterns.md` and `frontend-patterns.md` exist with `file:line` references; `sql-js-constraints.md` also exists with deep SQL.js-specific documentation

### AC-6 — PRD created with 15-section structure

- **Given** the PIV Loop requires a formal PRD as Layer 2 — Task Planning
- **When** `.agents/PRDs/feature-flag-filtering-e2.prd.md` is created
- **Then** it contains all 15 sections (Executive Summary through Appendix); follows the Prompt Structure 5-step; references on-demand context docs from Step D

### AC-7 — AI Layer structural validation passes

- **Given** the full AI Layer has been created
- **When** structural validation is run
- **Then** all tiers are consistent: Tier 1 (CLAUDE.md), Tier 2 (commands with I→P→O), Tier 3 (skills), On-Demand Context (≥2 docs), Layer 2 (PRD with 15 sections); no orphan references, no missing dependencies

---

## 4) Tasks

### [Task E2-S1-T1 — Analyze codebase and map architecture (Step A)](../tasks/task-E2S1T1-analyze-codebase-and-map-architecture-step-a.md)

**Description:** Read `.agents/closure/codebase-audit.md`, `AGENTS.md`, `CLAUDE.md`, and key source files. Map architecture layers, data flow, naming conventions, error handling patterns, SQL.js constraints, test strategy, and integration points. Produce a brief analysis summary to inform subsequent tasks.

**Acceptance criteria:**
- **Given** the codebase audit and agent docs exist
- **When** the analysis is complete
- **Then** a summary of architecture layers, data flow, key constraints, and integration points is documented as working notes for the remaining tasks

---

### [Task E2-S1-T2 — Create/update CLAUDE.md for Exercise 2 (Step B)](../tasks/task-E2S1T2-create-update-claude-md-for-exercise-2-step-b.md)

**Description:** Create or update `CLAUDE.md` adapted for Exercise 2 state. Follow the Excal-4 Venn diagram: Tech Stack & Architecture, Code Styles & Patterns, Testing Requirements, Misconceptions AI Often Has. Reference `exercise-2` branch and PIV Loop methodology. Use the Gold Standard two-document pattern as reference.

**Acceptance criteria:**
- **Given** the codebase analysis from T1
- **When** `CLAUDE.md` is written
- **Then** it contains all 4 required categories, references `exercise-2`, includes validation commands, error classes, key files, and misconceptions; excludes universal knowledge, workflow definitions, task-specific content

---

### [Task E2-S1-T3 — Create Core 4 commands (Step C)](../tasks/task-E2S1T3-create-core-4-commands-step-c.md)

**Description:** Create `.claude/commands/prime.md`, `plan.md`, `implement.md`, `commit.md`. Each follows Input → Process → Output structure. Base on workshop reference (`resident-health-workshop-resources/.claude/commands/`).

**Acceptance criteria:**
- **Given** `CLAUDE.md` is complete
- **When** Core 4 commands are created
- **Then** all 4 files exist, each has I→P→O structure, each accepts `$ARGUMENTS` where applicable

---

### [Task E2-S1-T4 — Create extended commands (Step C continued)](../tasks/task-E2S1T4-create-extended-commands-step-c-continued.md)

**Description:** Create `.claude/commands/prime-endpoint.md`, `validate.md`, `create-prd.md`, `review.md`, `security-review.md`. Each follows I→P→O structure.

**Acceptance criteria:**
- **Given** Core 4 commands are in place
- **When** extended commands are created
- **Then** all 5 files exist with I→P→O structure and `$ARGUMENTS` parameterization

---

### [Task E2-S1-T5 — Create skills directory (Step C.2)](../tasks/task-E2S1T5-create-skills-directory-step-c-2.md)

**Description:** Create `.claude/skills/agent-browser/SKILL.md` for Playwright browser automation.

**Acceptance criteria:**
- **Given** commands may need browser automation
- **When** the skill is created
- **Then** `.claude/skills/agent-browser/SKILL.md` exists with clear purpose, inputs, process, and outputs

---

### [Task E2-S1-T6 — Create on-demand context documents (Step D)](../tasks/task-E2S1T6-create-on-demand-context-documents-step-d.md)

**Description:** Create `.agents/reference/backend-patterns.md`, `frontend-patterns.md`, and `sql-js-constraints.md` with `file:line` references and deep pattern documentation.

**Acceptance criteria:**
- **Given** the codebase analysis and architecture mapping
- **When** on-demand context documents are created
- **Then** all 3 files exist; `backend-patterns.md` covers Express v5, SQL.js, Zod, error classes; `frontend-patterns.md` covers React 19, TanStack Query, Tailwind v4, Radix UI; `sql-js-constraints.md` covers SQL.js-specific limitations in depth

---

### [Task E2-S1-T7 — Create PRD with 15-section structure (Step E)](../tasks/task-E2S1T7-create-prd-with-15-section-structure-step-e.md)

**Description:** Generate `.agents/PRDs/feature-flag-filtering-e2.prd.md` with all 15 sections following the Prompt Structure 5-step. Must reference on-demand context docs and TASK.md.

**Acceptance criteria:**
- **Given** Layer 1 artifacts are complete (CLAUDE.md, commands, on-demand context)
- **When** the PRD is generated
- **Then** it contains all 15 sections, follows the 5-step structure, references CLAUDE.md + on-demand context + TASK.md

---

### [Task E2-S1-T8 — Validate AI Layer structural consistency (Step F)](../tasks/task-E2S1T8-validate-ai-layer-structural-consistency-step-f.md)

**Description:** Run structural validation of the full AI Layer: Tier 1 (CLAUDE.md) → Tier 2 (9 commands with I→P→O) → Tier 3 (skills) → On-Demand Context (≥2 docs) → Layer 2 (PRD). Check for orphan references and missing dependencies.

**Acceptance criteria:**
- **Given** all AI Layer artifacts have been created
- **When** structural validation is run
- **Then** all tiers are consistent; no orphan references; commands reference valid skill/context paths; PRD references existing on-demand docs

---
