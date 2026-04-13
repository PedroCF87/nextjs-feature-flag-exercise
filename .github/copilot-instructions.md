# Copilot Instructions — RDH Agentic Engineering Workspace

## Workspace Purpose

This is a **study and interview-preparation workspace** for a Senior AI Engineer role at **RDH (Redirect Health)**. RDH follows an **AI-first, documentation-driven** methodology — they expect engineers who orchestrate AI agents to ship features faster using structured `.md` context files, not traditional coding workflows.

The workspace contains three companion repositories, each with a distinct role:

| Repository | Role |
|---|---|
| `resident-health-workshop-resources` | **The Rulebook** — workshop slides, diagrams, Claude Code commands & skills, CI/CD workflows, MCP config |
| `nextjs-feature-flag-exercise` | **The Training Ground** — exercise branches for practicing the 5-minute feature spin-up |
| `nextjs-ai-optimized-codebase` | **The Gold Standard** — the reference Next.js codebase built for AI-agent consumption |

---

## RDH Methodology

RDH uses an **AI-first, documentation-driven** workflow. Engineers are expected to orchestrate AI agents (Claude Code, Copilot) that ship features in minutes using structured `.md` context files.

### The PIV Loop

```
Plan → Implement → Validate
  ↑                    |
  └────────────────────┘  (repeat until green)
```

1. **Plan** — Write a PRD or Story in a `.md` file first. The AI reads it and generates a step-by-step plan.
2. **Implement** — The AI executes the plan in phases, running `lint + typecheck` after each phase. It never moves forward with broken state.
3. **Validate** — Run `bun run lint && npx tsc --noEmit && bun test`. If anything fails, the AI reads the errors and self-corrects.

### The AI Layer

The AI layer is an accumulating asset that compounds over time:

- **Global Rules** (`CLAUDE.md` / `copilot-instructions.md`) — always-on context: tech stack, patterns, code style
- **Commands** (`.claude/commands/`) — slash-command workflows: `/plan`, `/implement`, `/validate`, `/prime`, `/create-prd`, etc.
- **Skills** (`.claude/skills/`) — reusable sub-routines: browser automation, PPTX generation, etc.

### Vertical Slice Architecture (VSA)

Every feature lives in its own folder and owns its entire stack. Never spread feature logic across global files.

```
src/features/{feature}/
  models.ts        # Domain types / Zod schemas (shared by client + server)
  schemas.ts       # Zod validation schemas
  repository.ts    # Database queries (Drizzle ORM)
  service.ts       # Business logic (calls repository)
  errors.ts        # Feature-specific error classes
  index.ts         # Public API — explicit named exports only
  tests/           # Co-located unit + integration tests
```

`src/core/` — shared infrastructure (database, config, logging, Supabase client, API error classes)
`src/shared/` — generic reusable UI components and schemas
`src/app/api/` — Next.js route handlers (thin layer — delegate to services)
`src/proxy.ts` — Next.js 16 middleware (replaces `middleware.ts`)

---

## Repository 1 — `resident-health-workshop-resources` (The Rulebook)

This repo contains all the workshop materials and the AI tooling templates.

### Claude Code Commands (`.claude/commands/`)

| Command | Purpose |
|---|---|
| `/plan` | Generate step-by-step implementation plan from a PRD |
| `/implement` | Execute a plan with PIV loop (never accumulate broken state) |
| `/validate` | Run lint + typecheck + tests, report failures |
| `/prime` | Load Jira issues + Confluence pages via MCP and summarize project state |
| `/prime-server` | Load and summarize the server-side architecture |
| `/prime-client` | Load and summarize the client-side architecture |
| `/prime-components` | Catalog and summarize reusable UI components |
| `/prime-endpoint` | Deep-dive on a specific API endpoint |
| `/create-prd` | Generate a Product Requirements Document |
| `/prd-interactive` | Interactive PRD creation (asks clarifying questions) |
| `/create-stories` | Break a PRD into user stories |
| `/create-rules` | Generate `.clauderules` / `CLAUDE.md` from a codebase |
| `/install` | Install a dependency and update relevant config files |
| `/review` | Code review: correctness, patterns, security |
| `/security-review` | Security-focused review (OWASP, injection, auth) |

### Claude Code Skills (`.claude/skills/`)

- **`agent-browser`** — Playwright-based browser automation for web testing and scraping
- **`pptx-generator`** — Generate PowerPoint presentations from markdown outlines

### GitHub Workflows (`.github/workflows/`)

| Workflow | Trigger | Purpose |
|---|---|---|
| `claude.yml` | `@claude` mention in PR/issue | Interactive Claude Code in CI |
| `pr-review.yml` | PR opened/updated | Automatic code review |
| `security-review.yml` | PR to main | OWASP security scan |

### MCP Configuration (`.mcp.json`)

Atlassian Rovo MCP server — gives Claude access to Jira (issues, sprints) and Confluence (pages, spaces) for the `/prime` command.

---

## Repository 2 — `nextjs-feature-flag-exercise` (The Training Ground)

A full-stack feature flag manager used as exercise material. Exercises live on separate Git branches.

### Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js (ESM), Express v5, SQL.js (SQLite/WASM), Zod, Vitest |
| Frontend | React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Query v5 |
| Shared | `shared/types.ts` — single source of truth for data contracts |
| Language | TypeScript (strict mode) |

### Architecture

**Data flow:** `shared/types.ts` → Zod validation middleware → Service layer → Route handlers → React Query → UI

**API endpoints:** `GET/POST /api/flags`, `GET/PUT/DELETE /api/flags/:id`

**Exercise branches:** `exercise-1`, `exercise-2`, `exercise-3`

### Current Task (`TASK.md`) — Feature Flag Filtering

Implement server-side filtering for feature flags:
- Filter by: environment, status (`enabled`/`disabled`), type, owner
- Name search (partial match, case-insensitive)
- Multiple simultaneous filters
- "Clear all filters" action
- Active-filter indicator in the UI

### Commands

```bash
# Server (from server/)
pnpm dev           # port 3001
pnpm test          # Vitest
pnpm run build     # tsc type check

# Client (from client/)
pnpm dev           # port 3000
pnpm run build     # tsc + vite build
```

---

## Repository 3 — `nextjs-ai-optimized-codebase` (The Gold Standard)

This is the reference implementation of an RDH-style AI-optimized Next.js codebase. Study it carefully — the interview may ask you to replicate or extend it.

### Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Runtime | **Bun** | Package manager + test runner + server (~10× faster than Node+npm+Jest) |
| Framework | **Next.js 16** | App Router, Server Components, `src/proxy.ts` instead of `middleware.ts` |
| UI | **React 19** | Server Components by default |
| Language | **TypeScript** | Strict mode — no `any`, no implicit null |
| Styling | **Tailwind CSS v4** | `@import "tailwindcss"` in CSS, no `tailwind.config.js` |
| Components | **shadcn/ui** | Radix UI primitives, `components.json` config |
| Linting/Format | **Biome** | Single tool replaces ESLint + Prettier (`biome.json`) |
| Database | **Supabase** (PostgreSQL) + **Drizzle ORM** | Type-safe queries, schema in `src/core/database/schema.ts` |
| Auth | **Supabase Auth** | Session managed via Supabase client |
| Validation | **Zod v4** | `import { z } from 'zod/v4'` — NOT `from 'zod'` |
| Logging | **Pino** | Structured JSON logs, `src/core/logging/logger.ts` |

### Path Aliases

```json
"@/*"          → "./src/*"
"@/core/*"     → "./src/core/*"
"@/features/*" → "./src/features/*"
"@/shared/*"   → "./src/shared/*"
```

### Validation Commands

```bash
bun run lint          # Biome lint + format check
npx tsc --noEmit      # TypeScript type check (no output files)
bun test              # Run all tests
bun run build         # Full production build
```

### Code Patterns

**Error classes** — each feature defines its own typed errors extending a base `AppError`:
```typescript
export class FeatureNotFoundError extends AppError { ... }
```

**Logging** — structured, never `console.log`:
```typescript
import { logger } from '@/core/logging/logger'
logger.info({ userId }, 'User created')
```

**Zod v4** — always import from the v4 sub-path:
```typescript
import { z } from 'zod/v4'
```

**Drizzle query pattern**:
```typescript
const result = await db.select().from(schema.table).where(eq(schema.table.id, id))
```

**Index files** — `index.ts` in each feature acts as a public API gate. Only export what consumers need.

**Self-correction loop** — after every code change, run `bun run lint && npx tsc --noEmit`. Read failures, fix, repeat.

---

## Interview Preparation Goals

### Phase 1: Rules Extraction (Repo 1 — `resident-health-workshop-resources`)

1. Read `CLAUDE-template.md` and understand the structure of a CLAUDE.md global rules file
2. Study each `.claude/commands/` file to understand the 7-phase implement workflow
3. Understand the GitHub Actions workflows and when they trigger
4. Map the PIV loop to concrete commands

### Phase 2: Architecture Reverse-Engineering (Repo 3 — `nextjs-ai-optimized-codebase`)

1. Read `CODEBASE-GUIDE.md` and `CLAUDE.md` — the complete AI context for that codebase
2. Walk `src/features/` to see VSA in practice
3. Understand why each tech choice was made (Bun for speed, Biome for single-tool DX, Drizzle for type safety, etc.)
4. Note the patterns you would replicate in a new feature

### Phase 3: 5-Minute Simulation (Repo 2 — `nextjs-feature-flag-exercise`)

1. Read `TASK.md` to understand the feature requirement
2. Write or use the `/implement` command to ship the feature
3. Validate with `pnpm run build && pnpm test`
4. Reflect: what made the AI faster? What slowed it down?

---

## How to Work with This Workspace

When assisting in this workspace, Copilot should:

- **Prioritize extraction over creation** — before writing code, read existing patterns in Repo 3 and mirror them exactly
- **Cite the source** — when suggesting a pattern, reference which file in the Gold Standard codebase it comes from
- **Always validate** — every code suggestion should be followed by the validation command to run
- **Speak the methodology** — use RDH vocabulary when discussing the Rulebook or Gold Standard: AI Layer, Global Rules, Commands, Skills. In exercise planning documents (stories, epics, skills, instructions, catalog) always use neutral equivalents — see Forbidden terminology rule below
- **Never hardcode** — env vars belong in `src/core/config/env.ts` with Zod validation; never in inline strings
- **Respect VSA boundaries** — never add feature logic to `src/core/` or `src/shared/`; always ask "which feature folder owns this?"
- **Use `bun`** not `npm` or `node` in the Gold Standard codebase
- **Import Zod from `zod/v4`** not `zod` in the Gold Standard codebase
- **Forbidden terminology in exercise planning** — never use RDH-specific methodology terms in stories, epics, skills, instructions, or the catalog. Forbidden terms and their neutral replacements:
  - `PIV` / `PIV Loop` / `PIV suite` / `PIV validation` → `validation commands` / `validation suite`
  - `brownfield audit` / `brownfield-audit.md` → `codebase audit` / `codebase-audit.md`
  - `Greenfield` → describe neutrally (e.g. "new implementation from scratch")
  - `VSA` (in exercise context) → omit or spell out without acronym
  - `PIV Loop run` / `Baseline vs PIV Loop` → `AI-assisted run` / `Exercise 1 vs Exercise 2`
- **Use shared functions** — never re-write inline `node -e "..."` snippets that already exist in `Docs/.github/functions/`. See the table below.

### Hook-aware logging automation (Docs workspace)

The workspace now uses VS Code Agent Hooks for backlog/timeline automation:

- Hook config: `Docs/.github/hooks/agile-auto-log.json`
- Hook script: `Docs/.github/hooks/auto-log-agile-artifact.js`

Behavior when hooks are active:

- `Docs/agile/backlog-index.json` is regenerated automatically after tool-driven edits in `Docs/agile/**/*.md`.
- `Docs/agile/timeline.jsonl` receives automated `created`/`updated` entries for supported file-edit tools.

Agent rule:

- **Do not duplicate these automated writes manually** when hook diagnostics confirm the hook is loaded and running.
- Use manual fallback (`timeline-id.js`, `datetime.js`, `sync-backlog-index.js`) **only** when hooks are unavailable, disabled by policy, or failing.

### Shared functions (`Docs/.github/functions/`)

| File | CLI usage | Replaces |
|---|---|---|
| `datetime.js` | `node "Docs/.github/functions/datetime.js"` | The repeated `node -e "const d=new Date()..."` one-liner for current-timestamp generation |
| `file-stats.js` | `node "Docs/.github/functions/file-stats.js" <abs-path> [<abs-path> ...]` | The repeated `node -e "const fs=require('fs'); const stats=fs.statSync(...)..."` one-liner in `file-timestamps` and `timeline-tracker` skills |
| `timeline-id.js` | `node "Docs/.github/functions/timeline-id.js" <abs-path-to-timeline.jsonl>` | Manual "read last line, extract id, increment" logic when appending to `Docs/agile/timeline.jsonl` |
| `elapsed-time.js` | `node "Docs/.github/functions/elapsed-time.js" "<start-ts>" "<end-ts>" [label]` | Computing elapsed minutes between two `datetime.js` timestamps in baseline capture templates |
| `git-info.js` | `node "Docs/.github/functions/git-info.js" [<abs-repo-path>] [--branch-ref]` | Repeated inline `git rev-parse --short HEAD` + `git branch --show-current` + `git remote get-url` commands in `validate-exercise-environment`, `produce-diagnosis-document`, `project-context-audit`, and `fork-and-configure-remotes` skills |
| `check-prereqs.js` | `node "Docs/.github/functions/check-prereqs.js" [expected-branch] [<abs-repo-path>]` | The Phase 1 bash block (`node --version && pnpm --version && git branch --show-current`) in `validate-exercise-environment` and implicit branch checks in E0-S1 tasks T1 and T2 |
| `validate-workflow-file.js` | `node "Docs/.github/functions/validate-workflow-file.js" <abs-path-to-yml>` | Manual structural review of `copilot-setup-steps.yml` (job name, `environment: copilot`, `timeout-minutes ≤ 59`, `workflow_dispatch`) in `copilot-env-setup` skill, E0-S2 T4, T5, and `copilot-env-specialist` anti-patterns |
| `check-ai-layer-files.js` | `node "Docs/.github/functions/check-ai-layer-files.js" <base-path> <rel-path> [...] [--table] [--manifest <json>]` | Manual file-existence evaluation of AI Layer artifacts repeated in E0-S2 T0 current-state table, T5 coverage checklist, `validate-ai-layer-coverage` skill steps 3–5, and Definition of Done verification |
| `timeline-query.js` | `node "Docs/.github/functions/timeline-query.js" <abs-path-to-timeline.jsonl> [--epic <ID> \| --story <ID> \| --summary]` | Querying `timeline.jsonl` for elapsed time per epic or story; produces markdown summary tables for closure reports, handoff documents, and cross-exercise comparison in E0-S4 T2, T5, and retrospective artifacts |
| `generate-dashboards.js` | `node "Docs/.github/functions/generate-dashboards.js" [--friction-log <abs-path>]` | Manual regeneration of `Docs/dashboard/timeline.html`, `backlog.html`, and `friction-log.html` from AI Layer log sources with Bootstrap 5 UI |
| `scaffold-story-tasks.js` | `node "Docs/.github/functions/scaffold-story-tasks.js" <abs-story-file> <abs-agile-dir> [--dry-run] [--overwrite]` | Manual task-pack scaffolding from a story's `## 4) Tasks` section, generating one detailed task file per `Task E*-S*-T*` heading |
| `validate-task-pack.js` | `node "Docs/.github/functions/validate-task-pack.js" <abs-agile-dir> [--story E0-S1]` | Manual quality gate for generated task packs: required metadata/sections, placeholder detection, security guidance signals, and Given/When/Then presence |
| `review-task-pack.js` | `node "Docs/.github/functions/review-task-pack.js" <abs-agile-dir> [--story E0-S1] [--no-sync] [--sync-dry-run]` | One-shot recurring task-pack review workflow: runs `validate-task-pack.js` and, on success, runs `sync-backlog-index.js` |

**Governance rule — extract to a function file when:**
> A terminal `node -e "..."` snippet, inline script, or bash expression is used in **3 or more distinct places** (identical or differing only in values that can be passed as arguments) → extract it to `Docs/.github/functions/<descriptive-name>.js` with:
> - A JSDoc comment explaining purpose and parameters.
> - A CLI entry point (`if (require.main === module) { ... }`) that accepts arguments via `process.argv`.
> - A `module.exports` block for programmatic use.
> - An update to this table above and to any skill/instruction that previously contained the inline version.

---

## Task Execution Model

Exercises in this workspace are executed using a **one-Issue-per-task** model via GitHub Copilot Web:

1. **One GitHub Issue per task** — each task file under `Docs/agile/tasks/` corresponds to one GitHub Issue created in the target repository (exercise fork or Docs repo, depending on where the task output lives).
2. **Agent starts from the Issue** — GitHub Copilot Web is invoked via the Issue. Each invocation is an **independent, stateless agent session**. No memory, context, or staged files carry over from a previous session.
3. **Each task ends with a merged PR** — every task that creates or modifies files in a repository must commit and push its output and open a PR. The PR is merged before the next task's Issue is created.
4. **No cross-task in-memory state** — inter-task data flows must go through **committed files**. A task reads its input files explicitly from the repository at the start of the session.
5. **Sequential execution via `Depends on`** — tasks run in the order defined by their `Depends on` metadata field. A task must not start until all upstream tasks have merged PRs.
6. **Each task is self-contained** — executable by a fresh agent with only: (a) the task file, (b) its listed input files, and (c) the current state of the repository at session start.

### Authoring rules for task execution plans

- Every task execution plan **must end with a commit and push step** for all files produced in that task.
- Never write "stage only — commit in task TN" or "bundled in TN commit." Each task owns its own commit.
- Tasks that produce Docs-side artifacts (files in `Docs/`) commit to the Docs repository.
- Tasks that produce fork-side artifacts (files in `nextjs-feature-flag-exercise/`) commit to the fork.
- If a task produces artifacts in both locations, it must include two separate commit/push steps, one per repository.
- Rollback notes must reference the state **before the task's own commit**, not a prior task's state.

---

## Commit Convention

Follow Conventional Commits:

```
<type>(<scope>): <description>

Types: feat | fix | docs | style | refactor | test | chore
```

Examples:
```
feat(flags): add server-side filtering by environment and status
fix(auth): handle expired Supabase session on page refresh
docs(agents): update CLAUDE.md with Drizzle query patterns
```
