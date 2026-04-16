---
applyTo: "**"
---

# Feature Flag Exercise - Always-On Instructions

This context is specific to the nextjs-feature-flag-exercise repository (Agentic Engineering Workshop exercise).

## Objective

Ensure any agent treats this repository as a methodology-driven transformation target, respecting exercise scope and prioritizing reliable execution.

## Priority Rules

1. Preserve exercise scope defined in TASK.md.
2. Follow the official data flow: shared/types.ts -> Zod validation -> service -> routes -> client API -> UI.
3. Make incremental changes with frequent validation (without accumulating broken state).
4. Treat this repository as a learning baseline (do not require full migration to the Gold Standard stack in Tier 1).

## Current Architecture (Must Be Respected)

- Backend: Node.js ESM + Express v5 + SQL.js + Zod + Vitest
- Frontend: React 19 + Vite + TanStack Query + Tailwind v4
- Shared contract: shared/types.ts
- Server pattern: routes delegate to services; errors propagate via next(error)

## Mandatory Technical Conventions

- Any new domain field starts in shared/types.ts.
- Validate input at the boundary with schemas in server/src/middleware/validation.ts.
- In Express routes, propagate failures with next(error) (do not manually respond with errors mid-flow).
- In SQL.js, always free statements with stmt.free() in try/finally.
- In backend tests, keep isolation with _resetDbForTesting().

## Recommended Validation

During incremental implementation:

1. cd server && pnpm run build
2. cd server && pnpm test
3. cd client && pnpm run build

When applicable, include lint:

- cd server && pnpm run lint
- cd client && pnpm run lint

## Epic 0 — Local Execution Rules (MANDATORY)

Epic 0 (environment preparation) runs **entirely locally** in VS Code. These rules override any task file that describes a different execution model:

1. **No PRs for Epic 0.** All commits go directly to `exercise-1`. Never create feature branches or open PRs for Epic 0 tasks.
2. **No GitHub Issues for Epic 0.** All tasks are executed by the local agent in VS Code — not by a cloud Copilot agent invoked from a GitHub Issue.
3. **Commit directly to `exercise-1`** — `git add <files> && git commit -m "..." && git push origin exercise-1`.
4. **AI Layer artifacts live in `.github/` (root).** Never create or deploy AI Layer files (agents, skills, instructions) to `docs/.github/`. The `docs/.github/` directory is a legacy reference area — the live AI Layer read by GitHub Copilot is `.github/` at the repository root.
5. **Skip deployment steps in task files.** Any task step that says "push to fork", "open PR", or "merge before next task starts" must be treated as: commit + push on the current `exercise-1` branch. No PR required.

## Epic 1 — Local Execution Rules (MANDATORY)

Epic 1 was originally planned with a GitHub Issue-driven model but switched to **local execution** starting from E1-S1-T2 due to Copilot cloud environment issues. See `docs/.agents/decisions/adr-001-local-execution-model.md` for full rationale.

These rules apply to all remaining Epic 1 tasks:

1. **No PRs for Epic 1 implementation tasks.** Commit directly to `exercise-1`.
2. **No GitHub Issues needed.** Read the task file directly from `docs/agile/tasks/`.
3. **Use the `execute-task-locally` skill** — it defines the implement → validate → fix → re-validate loop.
4. **Use the `task-implementer` agent** for coding tasks (E1-S2, E1-S3).
5. **One commit per task.** Include the task ID in the commit message: `feat(flags): description [E1-S2-T1]`.
6. **Push at story checkpoints.** Accumulate task commits per story and push after the last task in each story.
7. **Manual validation checkpoint at story end.** The last task in each story triggers a pause for human review.

## What NOT to do

- Do not migrate runtime to Bun inside this exercise as a mandatory step.
- Do not replace SQL.js with Postgres/Supabase within task scope.
- Do not replace Vitest with another runner as a requirement to complete the task.
- Do not ignore SQL.js-specific limitations (booleans in INTEGER, arrays in JSON string, safe dynamic query construction).
- Do not break the client/server contract defined in shared/types.ts.
- Do not create PRs for Epic 0 tasks.
- Do not create AI Layer artifacts in `docs/.github/` — use `.github/` (root) instead.

## Key references

- nextjs-feature-flag-exercise/TASK.md
- nextjs-feature-flag-exercise/AGENTS.md
- nextjs-feature-flag-exercise/shared/types.ts
- nextjs-feature-flag-exercise/server/src/middleware/validation.ts
- nextjs-feature-flag-exercise/server/src/middleware/error.ts
- nextjs-feature-flag-exercise/server/src/routes/flags.ts
- nextjs-feature-flag-exercise/server/src/services/flags.ts
- nextjs-feature-flag-exercise/server/src/__tests__/flags.test.ts
- nextjs-feature-flag-exercise/client/src/api/flags.ts
- nextjs-feature-flag-exercise/client/src/App.tsx
