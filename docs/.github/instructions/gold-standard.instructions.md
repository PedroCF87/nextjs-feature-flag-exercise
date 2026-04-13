---
applyTo: ../nextjs-ai-optimized-codebase/**
---

# Gold Standard — Always-On Instructions

This context is specific to the `nextjs-ai-optimized-codebase` repository (RDH architectural reference).

## Objective

Ensure any agent preserves Gold Standard patterns faithfully, prioritizing architectural consistency, continuous validation, and readability for AI agents.

## Priority Rules

1. Seguir **VSA (Vertical Slice Architecture)** em `src/features/{feature}/`.
2. Keep `src/core/` exclusively for shared infrastructure.
3. Use patterns described in `CODEBASE-GUIDE.md` and `CLAUDE.md` as the primary decision source.
4. Do not introduce patterns that contradict existing ones without explicit justification.

## Mandatory Stack and Conventions

- Runtime/package manager: **Bun** (`bun install`, `bun run`, `bun test`)
- Framework: **Next.js 16** (App Router)
- Middleware: use `src/proxy.ts` (not `middleware.ts`)
- Lint/format: **Biome** (`bun run lint`)
- Validation: **Zod v4** with mandatory import:
  - `import { z } from 'zod/v4'`
- Banco: **Drizzle ORM** + schema central em `src/core/database/schema.ts`
- Logging: **Pino** (`src/core/logging/logger.ts`), nunca `console.log`

## Architecture Rules

### VSA por feature

Each feature must follow the standard set:

- `models.ts`
- `schemas.ts`
- `repository.ts`
- `service.ts`
- `errors.ts`
- `index.ts`
- `tests/`

### Separation of responsibilities

- `repository.ts` → data access (no business logic)
- `service.ts` → business logic and orchestration
- `errors.ts` → typed feature errors
- `index.ts` → explicit public feature API

## Quality and Validation Rules

After changes, validate in this flow:

1. `bun run lint`
2. `npx tsc --noEmit`
3. `bun test`

Do not proceed with broken state between phases (PIV discipline).

## What NOT to do

- Do not use `npm`/`node` as the default in this repository.
- Do not import Zod from `zod` (use `zod/v4`).
- Do not add feature logic in `src/core/` or `src/shared/`.
- Do not use `console.log` instead of structured logging.
- Do not break the `repository` vs `service` boundary.

## Key references

- `nextjs-ai-optimized-codebase/CODEBASE-GUIDE.md`
- `nextjs-ai-optimized-codebase/CLAUDE.md`
- `nextjs-ai-optimized-codebase/src/features/`
- `nextjs-ai-optimized-codebase/src/core/`
- `nextjs-ai-optimized-codebase/src/proxy.ts`
- `nextjs-ai-optimized-codebase/biome.json`
- `nextjs-ai-optimized-codebase/package.json`
